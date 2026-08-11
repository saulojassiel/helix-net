"use client";

import type {
  GraphInsight,
  GraphInsightKind,
} from "@/types/ai";

interface GraphInsightsPanelProps {
  insights: GraphInsight[];
  isAnalyzing: boolean;
  errorMessage: string;

  totalNodes: number;
  totalEdges: number;

  onAnalyze: () => void;
}

function getInsightLabel(
  kind: GraphInsightKind
) {
  switch (kind) {
    case "knowledge_gap":
      return "HUECO DE CONOCIMIENTO";

    case "potential_contradiction":
      return "CONTRADICCIÓN POTENCIAL";

    case "weak_node":
      return "NODO DÉBIL";

    case "weak_relation":
      return "RELACIÓN DÉBIL";

    case "missing_connection":
      return "CONEXIÓN FALTANTE";

    default:
      return "INSIGHT";
  }
}

function getInsightClasses(
  kind: GraphInsightKind
) {
  switch (kind) {
    case "knowledge_gap":
      return "border-amber-500/30 text-amber-300";

    case "potential_contradiction":
      return "border-red-500/30 text-red-300";

    case "weak_node":
      return "border-zinc-600 text-zinc-300";

    case "weak_relation":
      return "border-orange-500/30 text-orange-300";

    case "missing_connection":
      return "border-cyan-500/30 text-cyan-300";

    default:
      return "border-violet-500/30 text-violet-300";
  }
}

export default function GraphInsightsPanel({
  insights,
  isAnalyzing,
  errorMessage,

  totalNodes,
  totalEdges,

  onAnalyze,
}: GraphInsightsPanelProps) {
  const canAnalyze =
    totalNodes > 0;

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-zinc-950 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
        HELIX GRAPH INTELLIGENCE
      </p>

      <h2 className="mt-2 text-xl font-bold text-white">
        Análisis del universo
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        Analiza la estructura completa del
        Knowledge Graph para detectar huecos,
        contradicciones, debilidades y
        conexiones potencialmente faltantes.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-black p-3">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Nodos
          </p>

          <p className="mt-1 text-lg font-bold text-cyan-300">
            {totalNodes}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-3">
          <p className="text-[10px] uppercase tracking-widest text-zinc-600">
            Relaciones
          </p>

          <p className="mt-1 text-lg font-bold text-violet-300">
            {totalEdges}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={
          !canAnalyze ||
          isAnalyzing
        }
        className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3 font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isAnalyzing
          ? "Analizando grafo..."
          : "◈ Analizar Knowledge Graph"}
      </button>

      {!canAnalyze && (
        <p className="mt-3 text-sm text-zinc-600">
          El universo necesita al menos un nodo
          para ser analizado.
        </p>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
          <p className="text-sm text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Insights detectados
            </p>

            <span className="text-xs font-semibold text-cyan-300">
              {insights.length}
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            {insights.map(
              (insight) => {
                const classes =
                  getInsightClasses(
                    insight.kind
                  );

                return (
                  <article
                    key={insight.id}
                    className={`rounded-2xl border bg-black p-4 ${classes}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                        {getInsightLabel(
                          insight.kind
                        )}
                      </span>

                      <span className="text-xs text-zinc-500">
                        {(
                          insight.confidence *
                          100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>

                    <h3 className="mt-3 font-bold text-white">
                      {insight.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      {
                        insight.description
                      }
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                          Nodos
                        </p>

                        <p className="mt-1 text-sm font-semibold text-zinc-300">
                          {
                            insight
                              .relatedNodeIds
                              .length
                          }
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                          Relaciones
                        </p>

                        <p className="mt-1 text-sm font-semibold text-zinc-300">
                          {
                            insight
                              .relatedEdgeIds
                              .length
                          }
                        </p>
                      </div>
                    </div>

                    {insight.suggestedAction && (
                      <div className="mt-4 border-t border-zinc-800 pt-4">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                          Acción sugerida
                        </p>

                        <p className="mt-2 text-xs leading-5 text-zinc-400">
                          {
                            insight.suggestedAction
                          }
                        </p>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </div>
      )}
    </section>
  );
}