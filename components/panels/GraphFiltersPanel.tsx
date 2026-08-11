"use client";

interface GraphFiltersPanelProps {
  nodeStatusFilter: string;
  onNodeStatusFilterChange: (value: string) => void;

  minimumPriority: number;
  onMinimumPriorityChange: (value: number) => void;

  relationTypeFilter: string;
  onRelationTypeFilterChange: (value: string) => void;

  minimumConfidence: number;
  onMinimumConfidenceChange: (value: number) => void;

  minimumStrength: number;
  onMinimumStrengthChange: (value: number) => void;

  visibleNodes: number;
  totalNodes: number;

  visibleEdges: number;
  totalEdges: number;
}

export default function GraphFiltersPanel({
  nodeStatusFilter,
  onNodeStatusFilterChange,

  minimumPriority,
  onMinimumPriorityChange,

  relationTypeFilter,
  onRelationTypeFilterChange,

  minimumConfidence,
  onMinimumConfidenceChange,

  minimumStrength,
  onMinimumStrengthChange,

  visibleNodes,
  totalNodes,

  visibleEdges,
  totalEdges,
}: GraphFiltersPanelProps) {
  function resetFilters() {
    onNodeStatusFilterChange("ALL");
    onMinimumPriorityChange(0);
    onRelationTypeFilterChange("ALL");
    onMinimumConfidenceChange(0);
    onMinimumStrengthChange(0);
  }

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Knowledge Graph
          </p>

          <h2 className="mt-2 text-xl font-bold">
            Filtros
          </h2>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 transition hover:border-cyan-500 hover:text-cyan-300"
        >
          Reiniciar
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-black p-3">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Nodos
          </p>

          <p className="mt-1 text-lg font-bold text-cyan-300">
            {visibleNodes}/{totalNodes}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-3">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Relaciones
          </p>

          <p className="mt-1 text-lg font-bold text-violet-300">
            {visibleEdges}/{totalEdges}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Estado del nodo
        </label>

        <select
          value={nodeStatusFilter}
          onChange={(event) =>
            onNodeStatusFilterChange(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-cyan-400"
        >
          <option value="ALL">Todos</option>
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
        <div className="flex justify-between gap-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Prioridad mínima
          </label>

          <span className="text-sm font-semibold text-cyan-300">
            {minimumPriority}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={minimumPriority}
          onChange={(event) =>
            onMinimumPriorityChange(
              Number(event.target.value)
            )
          }
          className="mt-3 w-full"
        />
      </div>

      <div className="mt-6 border-t border-zinc-800 pt-6">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Tipo de relación
        </label>

        <select
          value={relationTypeFilter}
          onChange={(event) =>
            onRelationTypeFilterChange(
              event.target.value
            )
          }
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-violet-400"
        >
          <option value="ALL">Todas</option>
          <option value="inspira">Inspira</option>
          <option value="causa">Causa</option>
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
        <div className="flex justify-between gap-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Confianza mínima
          </label>

          <span className="text-sm font-semibold text-violet-300">
            {(minimumConfidence * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={minimumConfidence}
          onChange={(event) =>
            onMinimumConfidenceChange(
              Number(event.target.value)
            )
          }
          className="mt-3 w-full"
        />
      </div>

      <div className="mt-6">
        <div className="flex justify-between gap-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500">
            Fuerza mínima
          </label>

          <span className="text-sm font-semibold text-violet-300">
            {(minimumStrength * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={minimumStrength}
          onChange={(event) =>
            onMinimumStrengthChange(
              Number(event.target.value)
            )
          }
          className="mt-3 w-full"
        />
      </div>
    </section>
  );
}