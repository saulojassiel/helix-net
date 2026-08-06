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
  position_x: number;
  position_y: number;
}

export interface WorkspaceEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
}

export function useWorkspace(universeId: string) {
  const [universe, setUniverse] =
    useState<WorkspaceUniverse | null>(null);

  const [graph, setGraph] =
    useState<WorkspaceGraph | null>(null);

  const [nodes, setNodes] =
    useState<WorkspaceNode[]>([]);

  const [edges, setEdges] =
    useState<WorkspaceEdge[]>([]);

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: universeData,
      error: universeError,
    } = await supabase
      .from("universes")
      .select("id, title, description")
      .eq("id", universeId)
      .maybeSingle();

    if (universeError || !universeData) {
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
      .eq("universe_id", universeId)
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
        "id, title, content, status, position_x, position_y"
      )
      .eq("universe_id", universeId)
      .order("created_at", {
        ascending: true,
      });

    if (nodeError) {
      setErrorMessage(nodeError.message);
      setLoading(false);
      return;
    }

    const {
      data: edgeData,
      error: edgeError,
    } = await supabase
      .from("edges")
      .select(
        "id, source_node_id, target_node_id, type"
      )
      .eq("universe_id", universeId);

    if (edgeError) {
      setErrorMessage(edgeError.message);
      setLoading(false);
      return;
    }

    setUniverse(universeData);
    setGraph(graphData);
    setNodes(nodeData ?? []);
    setEdges(edgeData ?? []);
    setLoading(false);
  }, [universeId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadWorkspace]);

  const flowNodes = useMemo<FlowNode[]>(
    () =>
      nodes.map((node, index) => ({
        id: node.id,
        type: "helix",
        position: {
          x:
            node.position_x === 0
              ? (index % 3) * 280
              : node.position_x,
          y:
            node.position_y === 0
              ? Math.floor(index / 3) * 180
              : node.position_y,
        },
        data: {
          label: node.title,
          status: node.status,
        },
      })),
    [nodes]
  );

  const flowEdges = useMemo<FlowEdge[]>(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        label: edge.type,
      })),
    [edges]
  );

  const selectedNode = useMemo(
    () =>
      nodes.find(
        (node) => node.id === selectedNodeId
      ) ?? null,
    [nodes, selectedNodeId]
  );

  async function addIdea() {
    if (!graph || !title.trim()) {
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

  function selectNode(nodeId: string) {
    setSelectedNodeId(nodeId);
  }

  const handleNodeClick: NodeMouseHandler = (
    _,
    node
  ) => {
    selectNode(node.id);
  };

  const handleNodeDragStop: OnNodeDrag = (
    _,
    node
  ) => {
    void universeService
      .moveNode(
        node.id,
        node.position.x,
        node.position.y
      )
      .catch((error: unknown) => {
        console.error(
          "No se pudo guardar la posición:",
          error
        );
      });
  };
  async function handleConnect(
  connection: Connection
) {
  const source = connection.source;
  const target = connection.target;

  if (!source || !target) {
    return;
  }

  if (source === target) {
    alert(
      "No puedes conectar una idea consigo misma."
    );
    return;
  }

  const alreadyExists = edges.some(
    (edge) =>
      edge.source_node_id === source &&
      edge.target_node_id === target &&
      edge.type === "inspira"
  );

  if (alreadyExists) {
    alert("Esta conexión ya existe.");
    return;
  }

  try {
    await universeService.connectIdeas(
      universeId,
      source,
      target,
      "inspira"
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

    title,
    content,
    isCreating,
    setTitle,
    setContent,
    addIdea,

    loading,
    errorMessage,
    loadWorkspace,

    handleNodeDragStop,
    handleNodeClick,
    handleConnect,
  };
}