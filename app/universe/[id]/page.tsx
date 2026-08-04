"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import type {
  Connection,
  Edge as FlowEdge,
  Node as FlowNode,
  NodeMouseHandler,
  OnNodeDrag,
} from "@xyflow/react";


import { AddIdeaPanel } from "@/components/panels/AddIdeaPanel";
import ExplorerPanel from "@/components/panels/ExplorerPanel";
import UniverseHeader from "@/components/universes/UniverseHeader";
import { supabase } from "@/lib/supabase";
import { UniverseService } from "@/services/UniverseService";
import InspectorPanel from "@/components/panels/InspectorPanel";
import GraphWorkspace from "@/components/graph/GraphWorkspace";

const universeService = new UniverseService();

interface Universe {
  id: string;
  title: string;
  description: string | null;
}

interface Graph {
  id: string;
}

interface UniverseNode {
  id: string;
  title: string;
  content: string;
  status: string;
  position_x: number;
  position_y: number;
}

interface UniverseEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
}

export default function UniversePage() {
  const params = useParams<{ id: string }>();

  const [universe, setUniverse] =
    useState<Universe | null>(null);

  const [graph, setGraph] =
    useState<Graph | null>(null);

  const [nodes, setNodes] =
    useState<UniverseNode[]>([]);

  const [edges, setEdges] =
    useState<UniverseEdge[]>([]);

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadWorkspace = useCallback(async () => {
    setErrorMessage("");

    const {
      data: universeData,
      error: universeError,
    } = await supabase
      .from("universes")
      .select("id, title, description")
      .eq("id", params.id)
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
      .eq("universe_id", params.id)
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
      .eq("universe_id", params.id)
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
      .eq("universe_id", params.id);

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
  }, [params.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadWorkspace();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadWorkspace]);

  const flowNodes: FlowNode[] = nodes.map(
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
            ? Math.floor(index / 3) * 180
            : node.position_y,
      },
      data: {
        label: node.title,
        status: node.status,
      },
    })
  );

  const flowEdges: FlowEdge[] = edges.map(
    (edge) => ({
      id: edge.id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      label: edge.type,
    })
  );

  const selectedNode =
    nodes.find(
      (node) => node.id === selectedNodeId
    ) ?? null;

  async function handleAddIdea() {
    if (!graph || !title.trim()) {
      return;
    }

    try {
      setIsCreating(true);

      await universeService.addIdea(
        params.id,
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
        params.id,
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

  const handleNodeClick: NodeMouseHandler = (
    _,
    node
  ) => {
    setSelectedNodeId(node.id);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Cargando universo...
      </main>
    );
  }

  if (errorMessage || !universe || !graph) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-3xl font-bold">
          No se pudo abrir el universo
        </h1>

        <p className="mt-4 text-red-300">
          {errorMessage}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <UniverseHeader
        title={universe.title}
        description={universe.description}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <aside className="space-y-6">
          <AddIdeaPanel
            title={title}
            content={content}
            isCreating={isCreating}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onCreate={handleAddIdea}
          />

          <ExplorerPanel
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
        </aside>

        <GraphWorkspace
  nodes={flowNodes}
  edges={flowEdges}
  onNodeDragStop={handleNodeDragStop}
  onConnect={handleConnect}
  onNodeClick={handleNodeClick}
/>

        <InspectorPanel node={selectedNode} />

          

          
      </div>
    </main>
  );
}