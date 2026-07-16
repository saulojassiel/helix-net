"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { universeService } from "@/services/UniverseService";

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
}

export default function UniversePage() {
  const params = useParams<{ id: string }>();

  const [universe, setUniverse] =
    useState<Universe | null>(null);

  const [graph, setGraph] =
    useState<Graph | null>(null);

  const [nodes, setNodes] =
    useState<Node[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        .select("id, title, content, status")
        .eq("universe_id", params.id)
        .order("created_at", {
          ascending: true,
        });

    if (nodeError) {
      setErrorMessage(nodeError.message);
      setLoading(false);
      return;
    }

    setUniverse(universeData);
    setGraph(graphData);
    setNodes(nodeData ?? []);
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