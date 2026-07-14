import GraphCanvas from "@/components/graph/GraphCanvas";
import { helix } from "@/engine/helix";

export default function HelixTestPage() {
  const result = helix.createSeed({
    question: "¿Cómo nace una conciencia?",
    intent: "Crear una experiencia audiovisual filosófica.",
    authorId: "test-author-saulo",
  });

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-4xl font-bold text-cyan-300">
        HELIX OS — Vertical Slice
      </h1>

      <p className="mt-3 text-zinc-400">
        Primera semilla procesada por el motor.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-cyan-500/30 p-5">
          <p className="text-sm text-zinc-500">Universo</p>
          <p className="mt-2 break-all text-cyan-200">
            {result.universeId}
          </p>
        </article>

        <article className="rounded-xl border border-cyan-500/30 p-5">
          <p className="text-sm text-zinc-500">Versión del Kernel</p>
          <p className="mt-2 text-3xl font-bold">
            {result.currentState.version}
          </p>
        </article>

        <article className="rounded-xl border border-cyan-500/30 p-5">
          <p className="text-sm text-zinc-500">Nodos del grafo</p>
          <p className="mt-2 text-3xl font-bold">
            {result.graph.metrics.nodeCount}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-cyan-500/30 p-6">
        <h2 className="text-2xl font-bold text-cyan-300">
          Nodo semilla
          <section className="mt-6">
  <h2 className="mb-4 text-2xl font-bold text-cyan-300">
    Universo visual
  </h2>

  <GraphCanvas graph={result.graph} />
</section>
        </h2>

        <p className="mt-4 text-xl">{result.seedNode.title}</p>
        <p className="mt-2 text-zinc-400">{result.seedNode.content}</p>
      </section>

      <pre className="mt-6 overflow-auto rounded-xl bg-zinc-950 p-6 text-sm text-zinc-300">
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}