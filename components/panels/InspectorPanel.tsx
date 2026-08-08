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

  edgeType: string;
  onEdgeTypeChange: (value: string) => void;

  edgeStrength: number;
  onEdgeStrengthChange: (value: number) => void;

  edgeConfidence: number;
  onEdgeConfidenceChange: (value: number) => void;

  edgeDescription: string;
  onEdgeDescriptionChange: (value: string) => void;

  isUpdatingEdge: boolean;
  onUpdateEdge: () => void;
}

export default function InspectorPanel({
  node,
  edge,

  edgeType,
  onEdgeTypeChange,

  edgeStrength,
  onEdgeStrengthChange,

  edgeConfidence,
  onEdgeConfidenceChange,

  edgeDescription,
  onEdgeDescriptionChange,

  isUpdatingEdge,
  onUpdateEdge,
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

          <div className="mt-6">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Tipo
            </label>

            <select
              value={edgeType}
              onChange={(event) =>
                onEdgeTypeChange(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-violet-400"
            >
              <option value="inspira">
                Inspira
              </option>

              <option value="causa">
                Causa
              </option>

              <option value="depende_de">
                Depende de
              </option>

              <option value="complementa">
                Complementa
              </option>

              <option value="contradice">
                Contradice
              </option>

              <option value="demuestra">
                Demuestra
              </option>
            </select>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Fuerza
              </label>

              <span className="text-sm font-semibold text-violet-300">
                {(edgeStrength * 100).toFixed(0)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={edgeStrength}
              onChange={(event) =>
                onEdgeStrengthChange(
                  Number(event.target.value)
                )
              }
              className="mt-3 w-full"
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Confianza
              </label>

              <span className="text-sm font-semibold text-violet-300">
                {(edgeConfidence * 100).toFixed(0)}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={edgeConfidence}
              onChange={(event) =>
                onEdgeConfidenceChange(
                  Number(event.target.value)
                )
              }
              className="mt-3 w-full"
            />
          </div>

          <div className="mt-6">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Descripción
            </label>

            <textarea
              value={edgeDescription}
              onChange={(event) =>
                onEdgeDescriptionChange(
                  event.target.value
                )
              }
              placeholder="Explica por qué existe esta relación..."
              className="mt-2 min-h-32 w-full resize-none rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-violet-400"
            />
          </div>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Evidencia
            </p>

            <p className="mt-2 text-zinc-300">
              {edge.evidence.length} elementos
            </p>
          </div>

          <button
            type="button"
            onClick={onUpdateEdge}
            disabled={isUpdatingEdge}
            className="mt-8 w-full rounded-xl bg-violet-300 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdatingEdge
              ? "Guardando..."
              : "Guardar relación"}
          </button>

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