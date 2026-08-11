"use client";

import type {
  AISuggestion,
} from "@/types/ai";

interface AISuggestionsPanelProps {
  hasSelectedNode: boolean;

  suggestions: AISuggestion[];

  isExpanding: boolean;
  errorMessage: string;

  onExpand: () => void;

  onAcceptSuggestion: (
    suggestion: AISuggestion
  ) => void;

  onRejectSuggestion: (
    suggestionId: string
  ) => void;

  editingSuggestionId: string | null;

  editingTitle: string;
  onEditingTitleChange: (
    value: string
  ) => void;

  editingContent: string;
  onEditingContentChange: (
    value: string
  ) => void;

  editingRelationType:
    | AISuggestion["proposedRelationType"]
    | "";

  onEditingRelationTypeChange: (
    value:
      | AISuggestion["proposedRelationType"]
      | ""
  ) => void;

  onStartEditing: (
    suggestion: AISuggestion
  ) => void;

  onCancelEditing: () => void;

  onSaveEditing: () => void;
}

function getKindLabel(
  kind: AISuggestion["kind"]
) {
  switch (kind) {
    case "hypothesis":
      return "HIPÓTESIS";

    case "question":
      return "PREGUNTA";

    case "contradiction":
      return "CONTRADICCIÓN";

    case "evidence":
      return "EVIDENCIA";

    case "connection":
      return "CONEXIÓN";

    default:
      return "IDEA";
  }
}

export default function AISuggestionsPanel({
  hasSelectedNode,

  suggestions,

  isExpanding,
  errorMessage,

  onExpand,

  onAcceptSuggestion,
  onRejectSuggestion,

  editingSuggestionId,

  editingTitle,
  onEditingTitleChange,

  editingContent,
  onEditingContentChange,

  editingRelationType,
  onEditingRelationTypeChange,

  onStartEditing,
  onCancelEditing,
  onSaveEditing,
}: AISuggestionsPanelProps) {
  return (
    <section className="rounded-3xl border border-violet-500/30 bg-zinc-950 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
        HELIX AI
      </p>

      <h2 className="mt-2 text-xl font-bold">
        Expandir idea
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        Analiza el nodo seleccionado y propone
        nuevas direcciones para el Knowledge Graph.
      </p>

      <button
        type="button"
        onClick={onExpand}
        disabled={
          !hasSelectedNode ||
          isExpanding
        }
        className="mt-6 w-full rounded-xl bg-violet-300 px-5 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isExpanding
          ? "Analizando..."
          : "✨ Expandir idea"}
      </button>

      {!hasSelectedNode && (
        <p className="mt-3 text-sm text-zinc-600">
          Selecciona un nodo para comenzar.
        </p>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
          <p className="text-sm text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-7 grid gap-4">
          {suggestions.map(
            (suggestion) => {
              const isEditing =
                editingSuggestionId ===
                suggestion.id;

              return (
                <article
                  key={suggestion.id}
                  className="rounded-2xl border border-zinc-800 bg-black p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                      {getKindLabel(
                        suggestion.kind
                      )}
                    </span>

                    <span className="text-xs text-zinc-500">
                      {(
                        suggestion.confidence *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>

                  {isEditing ? (
                    <>
                      <div className="mt-4">
                        <label className="text-xs uppercase tracking-widest text-zinc-600">
                          Título
                        </label>

                        <input
                          value={
                            editingTitle
                          }
                          onChange={(
                            event
                          ) =>
                            onEditingTitleChange(
                              event.target
                                .value
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div className="mt-4">
                        <label className="text-xs uppercase tracking-widest text-zinc-600">
                          Contenido
                        </label>

                        <textarea
                          value={
                            editingContent
                          }
                          onChange={(
                            event
                          ) =>
                            onEditingContentChange(
                              event.target
                                .value
                            )
                          }
                          className="mt-2 min-h-28 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-violet-400"
                        />
                      </div>

                      <div className="mt-4">
                        <label className="text-xs uppercase tracking-widest text-zinc-600">
                          Relación propuesta
                        </label>

                        <select
                          value={
                            editingRelationType
                          }
                          onChange={(
                            event
                          ) =>
                            onEditingRelationTypeChange(
                              event.target
                                .value as
                                | AISuggestion["proposedRelationType"]
                                | ""
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-violet-400"
                        >
                          <option value="">
                            Sin relación
                          </option>

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

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={
                            onCancelEditing
                          }
                          className="rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-300"
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          onClick={
                            onSaveEditing
                          }
                          disabled={
                            !editingTitle.trim()
                          }
                          className="rounded-xl bg-violet-300 px-4 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-3 font-bold text-white">
                        {
                          suggestion.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {
                          suggestion.content
                        }
                      </p>

                      {suggestion.reasoning && (
                        <div className="mt-4 border-t border-zinc-800 pt-4">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                            Razonamiento
                          </p>

                          <p className="mt-2 text-xs leading-5 text-zinc-500">
                            {
                              suggestion.reasoning
                            }
                          </p>
                        </div>
                      )}

                      {suggestion.proposedRelationType && (
                        <div className="mt-4">
                          <span className="rounded-full border border-violet-500/30 bg-violet-950/20 px-3 py-1 text-xs text-violet-300">
                            {
                              suggestion.proposedRelationType
                            }
                          </span>
                        </div>
                      )}

                      <div className="mt-5 grid gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onAcceptSuggestion(
                              suggestion
                            )
                          }
                          className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-950/50"
                        >
                          Aceptar sugerencia
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onStartEditing(
                              suggestion
                            )
                          }
                          className="rounded-xl border border-violet-500/30 px-4 py-3 font-semibold text-violet-300 transition hover:bg-violet-950/30"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            onRejectSuggestion(
                              suggestion.id
                            )
                          }
                          className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-950/40"
                        >
                          Rechazar
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}