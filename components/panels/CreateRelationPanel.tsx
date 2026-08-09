interface CreateRelationPanelProps {
  relationType: string;
  onRelationTypeChange: (value: string) => void;

  strength: number;
  onStrengthChange: (value: number) => void;

  confidence: number;
  onConfidenceChange: (value: number) => void;

  description: string;
  onDescriptionChange: (value: string) => void;

  isCreating: boolean;

  onCreate: () => void;
  onCancel: () => void;
}

export default function CreateRelationPanel({
  relationType,
  onRelationTypeChange,

  strength,
  onStrengthChange,

  confidence,
  onConfidenceChange,

  description,
  onDescriptionChange,

  isCreating,

  onCreate,
  onCancel,
}: CreateRelationPanelProps) {
  return (
    <section className="rounded-3xl border border-violet-500/30 bg-zinc-950 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
        Nueva relación
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        Definir conexión
      </h2>

      <div className="mt-6">
        <label className="text-xs uppercase tracking-widest text-zinc-500">
          Tipo
        </label>

        <select
          value={relationType}
          onChange={(event) =>
            onRelationTypeChange(event.target.value)
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
            {(strength * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={strength}
          onChange={(event) =>
            onStrengthChange(
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
            {(confidence * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={confidence}
          onChange={(event) =>
            onConfidenceChange(
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
          value={description}
          onChange={(event) =>
            onDescriptionChange(
              event.target.value
            )
          }
          placeholder="Explica por qué existe esta relación..."
          className="mt-2 min-h-28 w-full resize-none rounded-xl border border-zinc-700 bg-black p-3 text-white outline-none focus:border-violet-400"
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isCreating}
          className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={onCreate}
          disabled={isCreating}
          className="rounded-xl bg-violet-300 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating
            ? "Creando..."
            : "Crear relación"}
        </button>
      </div>
    </section>
  );
}