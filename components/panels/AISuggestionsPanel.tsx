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
}: AISuggestionsPanelProps) {
  return (
    <section className="rounded-3xl border border-violet-500/30 bg-zinc-950 p-6">
      <div>
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
      </div>

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
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Sugerencias
            </p>

            <span className="text-xs text-violet-300">
              {suggestions.length}
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            {suggestions.map(
              (suggestion) => (
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

                  <h3 className="mt-3 font-bold text-white">
                    {suggestion.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {suggestion.content}
                  </p>

                  {suggestion.reasoning && (
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                        Razonamiento
                      </p>

                      <p className="mt-2 text-xs leading-5 text-zinc-500">
                        {suggestion.reasoning}
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

                  <button
                    type="button"
                    onClick={() =>
                      onAcceptSuggestion(
                        suggestion
                      )
                    }
                    className="mt-5 w-full rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-950/50"
                  >
                    Aceptar sugerencia
                  </button>
                </article>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}