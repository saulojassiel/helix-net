"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { UniverseService } from "@/services/UniverseService";

const universeService = new UniverseService();
import UniverseGraph from "@/components/graph/UniverseGraph";
import type {
  Connection,
  Edge as FlowEdge,
  Node as FlowNode,
  
} from "@xyflow/react";

interface Universe {
  id: string;
  title: string;
  description: string | null;
}

interface Graph {
  id: string;
}

interface Node {
  id: string;
  title: string;
  content: string;
  status: string;
  position_x: number;
  position_y: number;
}
interface Edge {
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
    useState<Node[]>([]);

const [edges, setEdges] =
  useState<Edge[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceNodeId, setSourceNodeId] = useState("");
const [targetNodeId, setTargetNodeId] = useState("");
const [relationType, setRelationType] = useState("inspira");
const [isConnecting, setIsConnecting] = useState(false);


  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const loadWorkspace = useCallback(async () => {
    setErrorMessage("");

    const { data: universeData, error: universeError } =
      await supabase
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

    const { data: graphData, error: graphError } =
      await supabase
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

    const { data: nodeData, error: nodeError } =
      await supabase
        .from("nodes")
      .select(
  "id, title, content, status, position_x, position_y"
)
        .eq("universe_id", params.id)
        .order("created_at", {
          ascending: true,
        });

        const { data: edgeData, error: edgeError } =
  await supabase
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

    if (nodeError) {
      setErrorMessage(nodeError.message);
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
  const timer = setTimeout(() => {
    void loadWorkspace();
  }, 0);

  return () => clearTimeout(timer);
}, [loadWorkspace]);

  async function handleAddIdea() {
    if (!graph) {
      return;
    }
    async function handleConnectIdeas() {
  if (
    !sourceNodeId ||
    !targetNodeId ||
    sourceNodeId === targetNodeId
  ) {
    alert("Selecciona dos ideas diferentes.");
    return;
  }

  try {
    setIsConnecting(true);

    await universeService.connectIdeas(
      params.id,
      sourceNodeId,
      targetNodeId,
      relationType
    );

    setSourceNodeId("");
    setTargetNodeId("");
    setRelationType("inspira");

    alert("Ideas conectadas correctamente.");
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "No se pudieron conectar las ideas."
    );
  } finally {
    setIsConnecting(false);
  }
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
    async function handleConnectIdeas() {
    if (
      !sourceNodeId ||
      !targetNodeId ||
      sourceNodeId === targetNodeId
    ) {
      alert("Selecciona dos ideas diferentes.");
      return;
    }

    try {
      setIsConnecting(true);

      await universeService.connectIdeas(
        params.id,
        sourceNodeId,
        targetNodeId,
        relationType
      );

      setSourceNodeId("");
      setTargetNodeId("");
      setRelationType("inspira");

      alert("Ideas conectadas correctamente.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudieron conectar las ideas."
      );
    } finally {
      setIsConnecting(false);
    }
  }

async function handleNodeDragStop(
  _: unknown,
  node: FlowNode
) {
  try {
    await universeService.moveNode(
      node.id,
      node.position.x,
      node.position.y
    );
  } catch (error) {
    console.error(error);
  }
}
async function handleConnect(
  connection: Connection
) {
  console.log("onConnect", connection);
  if (
    !connection.source ||
    !connection.target
  ) {
    return;
  }

  try {
    await universeService.connectIdeas(
      params.id,
      connection.source,
      connection.target,
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
    <main className="min-h-screen bg-black p-10 text-white">
      <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
        Helix Universe
      </p>

      <h1 className="mt-6 text-4xl font-bold">
        {universe.title}
      </h1>

      <p className="mt-4 text-zinc-400">
        {universe.description}
      </p>

      <section className="mt-10 rounded-3xl border border-cyan-500/30 bg-zinc-950 p-6">
        <h2 className="text-2xl font-bold">
          Nueva idea
        </h2>

        <input
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="Título de la idea"
          className="mt-5 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-cyan-300"
        />

        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Describe la idea..."
          className="mt-4 min-h-32 w-full resize-none rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-cyan-300"
        />

        <button
          type="button"
          onClick={handleAddIdea}
          disabled={!title.trim() || isCreating}
          className="mt-4 rounded-full bg-cyan-300 px-6 py-3 font-bold text-black disabled:opacity-50"
        >
          {isCreating
            ? "Creando..."
            : "Crear idea"}
        </button>
      </section>
      <section className="mt-10 rounded-3xl border border-violet-500/30 bg-zinc-950 p-6">
  <h2 className="text-2xl font-bold">
    Conectar ideas
  </h2>

  <select
    value={sourceNodeId}
    onChange={(event) =>
      setSourceNodeId(event.target.value)
    }
    className="mt-5 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-violet-300"
  >
    <option value="">
      Selecciona la idea de origen
    </option>

    {nodes.map((node) => (
      <option key={node.id} value={node.id}>
        {node.title}
      </option>
    ))}
  </select>

  <select
    value={targetNodeId}
    onChange={(event) =>
      setTargetNodeId(event.target.value)
    }
    className="mt-4 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-violet-300"
  >
    <option value="">
      Selecciona la idea de destino
    </option>

    {nodes.map((node) => (
      <option key={node.id} value={node.id}>
        {node.title}
      </option>
    ))}
  </select>

  <select
    value={relationType}
    onChange={(event) =>
      setRelationType(event.target.value)
    }
    className="mt-4 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-violet-300"
  >
    <option value="inspira">Inspira</option>
    <option value="causa">Causa</option>
    <option value="depende_de">Depende de</option>
    <option value="complementa">Complementa</option>
    <option value="contradice">Contradice</option>
    <option value="demuestra">Demuestra</option>
  </select>

  <button
    type="button"
    onClick={handleConnectIdeas}
    disabled={
      !sourceNodeId ||
      !targetNodeId ||
      isConnecting
    }
    className="mt-4 rounded-full bg-violet-300 px-6 py-3 font-bold text-black disabled:opacity-50"
  >
    {isConnecting
      ? "Conectando..."
      : "Conectar ideas"}
  </button>
</section>

     <section className="mt-10">
  <h2 className="text-2xl font-bold">
    Universo visual
  </h2>

  <div className="mt-5">
    <UniverseGraph
  nodes={flowNodes}
  edges={flowEdges}
  onNodeDragStop={handleNodeDragStop}
  onConnect={handleConnect}
/>
  </div>
</section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">
          Ideas del universo
        </h2>

        <div className="mt-5 grid gap-4">
          {nodes.map((node) => (
            <article
              key={node.id}
              className="rounded-2xl border border-cyan-500/20 bg-zinc-950 p-5"
            >
              <h3 className="text-xl font-semibold text-cyan-200">
                {node.title}
              </h3>

              <p className="mt-2 text-zinc-400">
                {node.content}
              </p>

              <p className="mt-3 text-xs uppercase tracking-wider text-zinc-600">
                {node.status}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}