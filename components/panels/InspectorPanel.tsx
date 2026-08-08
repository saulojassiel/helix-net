interface InspectorNode {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: number;
  metadata: Record<string, unknown>;
}

interface InspectorEvidence {
  type: string;
  content: string;
  created_at: string;
}

interface InspectorEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  strength: number;
  confidence: number;
  description: string | null;
  evidence: InspectorEvidence[];
  metadata: Record<string, unknown>;
}

interface InspectorPanelProps {
  node: InspectorNode | null;
  edge: InspectorEdge | null;

  nodeTitle: string;
  onNodeTitleChange: (value: string) => void;

  nodeContent: string;
  onNodeContentChange: (value: string) => void;

  nodeStatus: string;
  onNodeStatusChange: (value: string) => void;

  nodePriority: number;
  onNodePriorityChange: (value: number) => void;

  isUpdatingNode: boolean;
  onUpdateNode: () => void;

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

  evidenceText: string;
  onEvidenceTextChange: (value: string) => void;

  isAddingEvidence: boolean;
  onAddEvidence: () => void;
}

export default function InspectorPanel({
  node,
  edge,

  nodeTitle,
  onNodeTitleChange,

  nodeContent,
  onNodeContentChange,

  nodeStatus,
  onNodeStatusChange,

  nodePriority,
  onNodePriorityChange,

  isUpdatingNode,
  onUpdateNode,

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

  evidenceText,
  onEvidenceTextChange,

  isAddingEvidence,
  onAddEvidence,
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
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-cyan-400">
            NODO
          </p>

          <div className="mt-6">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Título
            </label>

            <input
              value={nodeTitle}
              onChange={(event) =>
                onNodeTitleChange(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="mt-6">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Contenido
            </label>

            <textarea
              value={nodeContent}
              onChange={(event) =>
                onNodeContentChange(event.target.value)
              }
              placeholder="Describe esta idea..."
              className="mt-2 min-h-32 w-full resize-none rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="mt-6">
            <label className="text-xs uppercase tracking-widest text-zinc-500">
              Estado
            </label>

            <select
              value={nodeStatus}
              onChange={(event) =>
                onNodeStatusChange(event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="SEED">Seed</option>
              <option value="IDEA">Idea</option>
              <option value="HYPOTHESIS">
                Hypothesis
              </option>
              <option value="QUESTION">
                Question
              </option>
              <option value="EVIDENCE">
                Evidence
              </option>
              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-widest text-zinc-500">
                Prioridad
              </label>

              <span className="text-sm font-semibold text-cyan-300">
                {nodePriority}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={nodePriority}
              onChange={(event) =>
                onNodePriorityChange(
                  Number(event.target.value)
                )
              }
              className="mt-3 w-full"
            />
          </div>

          <button
            type="button"
            onClick={onUpdateNode}
            disabled={
              !nodeTitle.trim() ||
              isUpdatingNode
            }
            className="mt-8 w-full rounded-xl bg-cyan-300 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdatingNode
              ? "Guardando..."
              : "Guardar nodo"}
          </button>

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

          <button
            type="button"
            onClick={onUpdateEdge}
            disabled={isUpdatingEdge}
            className="mt-6 w-full rounded-xl bg-violet-300 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdatingEdge
              ? "Guardando..."
              : "Guardar relación"}
          </button>

          <div className="mt-8 border-t border-zinc-800 pt-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Evidencia
            </p>

            <textarea
              value={evidenceText}
              onChange={(event) =>
                onEvidenceTextChange(
                  event.target.value
                )
              }
              placeholder="Agrega una nota, fuente, observación o evidencia..."
              className="mt-3 min-h-24 w-full resize-none rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="button"
              onClick={onAddEvidence}
              disabled={
                !evidenceText.trim() ||
                isAddingEvidence
              }
              className="mt-3 w-full rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-5 py-3 font-semibold text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingEvidence
                ? "Agregando..."
                : "Agregar evidencia"}
            </button>

            <div className="mt-6 grid gap-3">
              {edge.evidence.length === 0 && (
                <p className="text-sm text-zinc-600">
                  Esta relación todavía no tiene evidencia.
                </p>
              )}

              {edge.evidence.map(
                (item, index) => (
                  <article
                    key={`${item.created_at}-${index}`}
                    className="rounded-xl border border-zinc-800 bg-black p-4"
                  >
                    <p className="text-sm leading-6 text-zinc-300">
                      {item.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-wider text-cyan-500">
                        {item.type}
                      </span>

                      <span className="text-xs text-zinc-600">
                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  </article>
                )
              )}
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