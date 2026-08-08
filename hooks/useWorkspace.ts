"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Connection,
  Edge as FlowEdge,
  EdgeMouseHandler,
  Node as FlowNode,
  NodeMouseHandler,
  OnNodeDrag,
} from "@xyflow/react";

import { supabase } from "@/lib/supabase";
import { UniverseService } from "@/services/UniverseService";

const universeService = new UniverseService();

export interface WorkspaceUniverse {
  id: string;
  title: string;
  description: string | null;
}

export interface WorkspaceGraph {
  id: string;
}

export interface WorkspaceNode {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: number;
  metadata: Record<string, unknown>;
  position_x: number;
  position_y: number;
}

export interface WorkspaceEvidence {
  type: string;
  content: string;
  created_at: string;
}

export interface WorkspaceEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  strength: number;
  confidence: number;
  description: string | null;
  evidence: WorkspaceEvidence[];
  metadata: Record<string, unknown>;
}

export function useWorkspace(
  universeId: string
) {
  const [universe, setUniverse] =
    useState<WorkspaceUniverse | null>(null);

  const [graph, setGraph] =
    useState<WorkspaceGraph | null>(null);

  const [nodes, setNodes] =
    useState<WorkspaceNode[]>([]);

  const [edges, setEdges] =
    useState<WorkspaceEdge[]>([]);

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState<string | null>(null);

  const [
    selectedEdgeId,
    setSelectedEdgeId,
  ] = useState<string | null>(null);

  /*
   * =========================
   * CREAR IDEA
   * =========================
   */

  const [title, setTitle] = useState("");

  const [content, setContent] =
    useState("");

  const [isCreating, setIsCreating] =
    useState(false);

  /*
   * =========================
   * EDITOR DE NODOS
   * =========================
   */

  const [nodeTitle, setNodeTitle] =
    useState("");

  const [nodeContent, setNodeContent] =
    useState("");

  const [nodeStatus, setNodeStatus] =
    useState("IDEA");

  const [nodePriority, setNodePriority] =
    useState(0);

  const [
    isUpdatingNode,
    setIsUpdatingNode,
  ] = useState(false);

  /*
   * =========================
   * EDITOR DE RELACIONES
   * =========================
   */

  const [edgeType, setEdgeType] =
    useState("inspira");

  const [
    edgeStrength,
    setEdgeStrength,
  ] = useState(1);

  const [
    edgeConfidence,
    setEdgeConfidence,
  ] = useState(1);

  const [
    edgeDescription,
    setEdgeDescription,
  ] = useState("");

  const [
    isUpdatingEdge,
    setIsUpdatingEdge,
  ] = useState(false);

  /*
   * =========================
   * EVIDENCIA
   * =========================
   */

  const [
    evidenceText,
    setEvidenceText,
  ] = useState("");

  const [
    isAddingEvidence,
    setIsAddingEvidence,
  ] = useState(false);

  /*
   * =========================
   * ESTADO GENERAL
   * =========================
   */

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
   * =========================
   * CARGAR WORKSPACE
   * =========================
   */

  const loadWorkspace =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: universeData,
        error: universeError,
      } = await supabase
        .from("universes")
        .select(
          "id, title, description"
        )
        .eq("id", universeId)
        .maybeSingle();

      if (
        universeError ||
        !universeData
      ) {
        setErrorMessage(
          universeError?.message ??
            "Universo no encontrado."
        );

        setLoading(false);
        return;
      }

      const {
        data: graphData,
        error: graphError,
      } = await supabase
        .from("graphs")
        .select("id")
        .eq(
          "universe_id",
          universeId
        )
        .maybeSingle();

      if (graphError || !graphData) {
        setErrorMessage(
          graphError?.message ??
            "Grafo no encontrado."
        );

        setLoading(false);
        return;
      }

      const {
        data: nodeData,
        error: nodeError,
      } = await supabase
        .from("nodes")
        .select(
          "id, title, content, status, priority, metadata, position_x, position_y"
        )
        .eq(
          "universe_id",
          universeId
        )
        .order("created_at", {
          ascending: true,
        });

      if (nodeError) {
        setErrorMessage(
          nodeError.message
        );

        setLoading(false);
        return;
      }

      const {
        data: edgeData,
        error: edgeError,
      } = await supabase
        .from("edges")
        .select(
          "id, source_node_id, target_node_id, type, strength, confidence, description, evidence, metadata"
        )
        .eq(
          "universe_id",
          universeId
        );

      if (edgeError) {
        setErrorMessage(
          edgeError.message
        );

        setLoading(false);
        return;
      }

      setUniverse(universeData);
      setGraph(graphData);

      setNodes(
        (nodeData ?? []) as WorkspaceNode[]
      );

      setEdges(
        (edgeData ?? []) as WorkspaceEdge[]
      );

      setLoading(false);
    }, [universeId]);

  /*
   * =========================
   * CARGA INICIAL
   * =========================
   */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadWorkspace();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadWorkspace]);

  /*
   * =========================
   * FLOW NODES
   * =========================
   */

  const flowNodes =
    useMemo<FlowNode[]>(
      () =>
        nodes.map(
          (node, index) => ({
            id: node.id,
            type: "helix",

            position: {
              x:
                node.position_x === 0
                  ? (index % 3) * 280
                  : node.position_x,

              y:
                node.position_y === 0
                  ? Math.floor(
                      index / 3
                    ) * 180
                  : node.position_y,
            },

            data: {
              label: node.title,
              status: node.status,
              priority: node.priority,
            },
          })
        ),

      [nodes]
    );

  /*
   * =========================
   * FLOW EDGES
   * =========================
   */

  const flowEdges =
    useMemo<FlowEdge[]>(
      () =>
        edges.map((edge) => ({
          id: edge.id,

          source:
            edge.source_node_id,

          target:
            edge.target_node_id,

          label: `${
            edge.type
          } · ${(
            edge.confidence * 100
          ).toFixed(0)}%`,

          data: {
            type: edge.type,
            strength:
              edge.strength,
            confidence:
              edge.confidence,
            description:
              edge.description,
            evidence:
              edge.evidence,
            metadata:
              edge.metadata,
          },
        })),

      [edges]
    );

  /*
   * =========================
   * SELECCIÓN
   * =========================
   */

  const selectedNode =
    useMemo(
      () =>
        nodes.find(
          (node) =>
            node.id ===
            selectedNodeId
        ) ?? null,

      [nodes, selectedNodeId]
    );

  const selectedEdge =
    useMemo(
      () =>
        edges.find(
          (edge) =>
            edge.id ===
            selectedEdgeId
        ) ?? null,

      [edges, selectedEdgeId]
    );

  /*
   * =========================
   * CREAR IDEA
   * =========================
   */

  async function addIdea() {
    if (
      !graph ||
      !title.trim()
    ) {
      return;
    }

    try {
      setIsCreating(true);

      await universeService.addIdea(
        universeId,
        graph.id,
        title,
        content
      );

      setTitle("");
      setContent("");

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la idea."
      );
    } finally {
      setIsCreating(false);
    }
  }

  /*
   * =========================
   * SELECCIONAR NODO
   * =========================
   */

  function selectNode(
    nodeId: string
  ) {
    const node = nodes.find(
      (item) => item.id === nodeId
    );

    if (!node) {
      return;
    }

    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);

    setNodeTitle(node.title);
    setNodeContent(node.content);
    setNodeStatus(node.status);
    setNodePriority(node.priority);
  }

  /*
   * =========================
   * SELECCIONAR EDGE
   * =========================
   */

  function selectEdge(
    edgeId: string
  ) {
    const edge = edges.find(
      (item) => item.id === edgeId
    );

    if (!edge) {
      return;
    }

    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);

    setEdgeType(edge.type);
    setEdgeStrength(edge.strength);
    setEdgeConfidence(
      edge.confidence
    );
    setEdgeDescription(
      edge.description ?? ""
    );

    setEvidenceText("");
  }

  /*
   * =========================
   * CLICK NODO
   * =========================
   */

  const handleNodeClick:
    NodeMouseHandler = (
    _,
    node
  ) => {
    selectNode(node.id);
  };

  /*
   * =========================
   * CLICK EDGE
   * =========================
   */

  const handleEdgeClick:
    EdgeMouseHandler = (
    _,
    edge
  ) => {
    selectEdge(edge.id);
  };

  /*
   * =========================
   * MOVER NODO
   * =========================
   */

  const handleNodeDragStop:
    OnNodeDrag = (
    _,
    node
  ) => {
    void universeService
      .moveNode(
        node.id,
        node.position.x,
        node.position.y
      )
      .catch(
        (error: unknown) => {
          console.error(
            "No se pudo guardar la posición:",
            error
          );
        }
      );
  };

  /*
   * =========================
   * CONECTAR NODOS
   * =========================
   */

  async function handleConnect(
    connection: Connection
  ) {
    const source =
      connection.source;

    const target =
      connection.target;

    if (!source || !target) {
      return;
    }

    if (source === target) {
      alert(
        "No puedes conectar una idea consigo misma."
      );

      return;
    }

    const alreadyExists =
      edges.some(
        (edge) =>
          edge.source_node_id ===
            source &&
          edge.target_node_id ===
            target &&
          edge.type === "inspira"
      );

    if (alreadyExists) {
      alert(
        "Esta conexión ya existe."
      );

      return;
    }

    try {
      await universeService.connectIdeas(
        universeId,
        source,
        target,
        "inspira",
        1,
        1,
        null
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la conexión."
      );
    }
  }

  /*
   * =========================
   * ACTUALIZAR EDGE
   * =========================
   */

  async function updateSelectedEdge() {
    if (!selectedEdge) {
      return;
    }

    try {
      setIsUpdatingEdge(true);

      await universeService.updateEdge(
        selectedEdge.id,
        edgeType,
        edgeStrength,
        edgeConfidence,
        edgeDescription.trim() ||
          null,
        selectedEdge.evidence,
        selectedEdge.metadata
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la relación."
      );
    } finally {
      setIsUpdatingEdge(false);
    }
  }

  /*
   * =========================
   * AGREGAR EVIDENCIA
   * =========================
   */

  async function addEvidenceToSelectedEdge() {
    if (!selectedEdge) {
      return;
    }

    const cleanEvidence =
      evidenceText.trim();

    if (!cleanEvidence) {
      return;
    }

    try {
      setIsAddingEvidence(true);

      const nextEvidence: WorkspaceEvidence[] = [
        ...selectedEdge.evidence,
        {
          type: "note",
          content: cleanEvidence,
          created_at:
            new Date().toISOString(),
        },
      ];

      await universeService.updateEdge(
        selectedEdge.id,
        edgeType,
        edgeStrength,
        edgeConfidence,
        edgeDescription.trim() ||
          null,
        nextEvidence,
        selectedEdge.metadata
      );

      setEvidenceText("");

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo agregar la evidencia."
      );
    } finally {
      setIsAddingEvidence(false);
    }
  }

  /*
   * =========================
   * ACTUALIZAR NODO
   * =========================
   */

  async function updateSelectedNode() {
    if (!selectedNode) {
      return;
    }

    try {
      setIsUpdatingNode(true);

      await universeService.updateNode(
        selectedNode.id,
        nodeTitle,
        nodeContent,
        nodeStatus,
        nodePriority,
        selectedNode.metadata
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el nodo."
      );
    } finally {
      setIsUpdatingNode(false);
    }
  }

  /*
   * =========================
   * API DEL WORKSPACE
   * =========================
   */

  return {
    universe,
    graph,
    nodes,
    edges,

    flowNodes,
    flowEdges,

    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    selectNode,

    selectedEdge,
    selectedEdgeId,
    setSelectedEdgeId,
    selectEdge,

    title,
    content,
    isCreating,
    setTitle,
    setContent,
    addIdea,

    nodeTitle,
    setNodeTitle,

    nodeContent,
    setNodeContent,

    nodeStatus,
    setNodeStatus,

    nodePriority,
    setNodePriority,

    isUpdatingNode,
    updateSelectedNode,

    edgeType,
    setEdgeType,

    edgeStrength,
    setEdgeStrength,

    edgeConfidence,
    setEdgeConfidence,

    edgeDescription,
    setEdgeDescription,

    isUpdatingEdge,
    updateSelectedEdge,

    evidenceText,
    setEvidenceText,
    isAddingEvidence,
    addEvidenceToSelectedEdge,

    loading,
    errorMessage,
    loadWorkspace,

    handleNodeDragStop,
    handleNodeClick,
    handleEdgeClick,
    handleConnect,
  };
}