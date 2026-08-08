interface InspectorNode {
  id: string;
  title: string;
  content: string;
  status: string;
}

interface InspectorEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  strength: number;
  confidence: number;
  description: string | null;
  evidence: unknown[];
  metadata: Record<string, unknown>;
}

interface InspectorPanelProps {
  node: InspectorNode | null;
  edge: InspectorEdge | null;
}

export default function InspectorPanel({
  node,
  edge,
}: InspectorPanelProps) {
  return (
    <aside className="rounded-3xl border border-cyan-500/20 bg-zinc-950 p-6">
      <h2 className="text-xl font-bold">
        Inspector
      </h2>

      {!node && !edge && (
        <p className="mt-4 text-zinc-500">
          Selecciona una idea o una conexión del grafo.
        </p>
      )}

      {node && (
        <>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-zinc-500">
            {node.status}
          </p>

          <h3 className="mt-3 text-2xl font-bold text-cyan-300">
            {node.title}
          </h3>

          <p className="mt-4 leading-7 text-zinc-300">
            {node.content ||
              "Esta idea todavía no tiene descripción."}
          </p>

          <div className="mt-8 border-t border-zinc-800 pt-5">
            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Identificador
            </p>

            <p className="mt-2 break-all text-xs text-zinc-500">
              {node.id}
            </p>
          </div>
        </>
      )}

      {edge && (
        <>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-violet-400">
            RELACIÓN
          </p>

          <h3 className="mt-3 text-2xl font-bold text-violet-300">
            {edge.type}
          </h3>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Confianza
              </p>

              <p className="mt-2 text-xl font-semibold">
                {(edge.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Fuerza
              </p>

              <p className="mt-2 text-xl font-semibold">
                {(edge.strength * 100).toFixed(0)}%
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Descripción
              </p>

              <p className="mt-2 leading-7 text-zinc-300">
                {edge.description ||
                  "Esta relación todavía no tiene explicación."}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Evidencia
              </p>

              <p className="mt-2 text-zinc-300">
                {edge.evidence.length} elementos
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-800 pt-5">
            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Identificador
            </p>

            <p className="mt-2 break-all text-xs text-zinc-500">
              {edge.id}
            </p>
          </div>
        </>
      )}
    </aside>
  );
}