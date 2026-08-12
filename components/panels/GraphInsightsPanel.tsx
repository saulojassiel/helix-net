"use client";

import type {
  GraphInsight,
  GraphInsightKind,
} from "@/types/ai";

type InsightStatusFilter =
  | "ALL"
  | "OPEN"
  | "RESOLVED"
  | "DISMISSED";

interface GraphInsightsPanelProps {
  insights: GraphInsight[];
  isAnalyzing: boolean;
  errorMessage: string;

  totalNodes: number;
  totalEdges: number;

  insightStatusFilter:
    InsightStatusFilter;

  onInsightStatusFilterChange: (
    value: InsightStatusFilter
  ) => void;

  openInsightsCount: number;
  resolvedInsightsCount: number;
  dismissedInsightsCount: number;

  onAnalyze: () => void;

  onExecuteInsightAction: (
    insight: GraphInsight
  ) => void;

  onResolveInsight: (
    insightId: string
  ) => void;

  onDismissInsight: (
    insightId: string
  ) => void;
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

function getActionLabel(
  insight: GraphInsight
) {
  const action = insight.action;

  if (!action) {
    return "Sin acción disponible";
  }

  switch (action.kind) {
    case "select_node":
      return "Abrir nodo";

    case "select_edge":
      return "Abrir relación";

    case "prepare_connection":
      return "Preparar conexión";

    case "expand_node":
      return "Investigar nodo";

    case "review_contradiction":
      return "Revisar contradicción";

    default:
      return "Ejecutar acción";
  }
}

function getStatusLabel(
  status?: GraphInsight["status"]
) {
  switch (status) {
    case "RESOLVED":
      return "RESOLVED";

    case "DISMISSED":
      return "DISMISSED";

    default:
      return "OPEN";
  }
}

function getStatusClasses(
  status?: GraphInsight["status"]
) {
  switch (status) {
    case "RESOLVED":
      return "border-emerald-500/30 bg-emerald-950/30 text-emerald-300";

    case "DISMISSED":
      return "border-zinc-700 bg-zinc-900 text-zinc-500";

    default:
      return "border-cyan-500/30 bg-cyan-950/20 text-cyan-300";
  }
}

function getFilterClasses(
  active: boolean
) {
  return active
    ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
    : "border-zinc-800 bg-black text-zinc-500 hover:border-zinc-700 hover:text-zinc-300";
}

export default function GraphInsightsPanel({
  insights,
  isAnalyzing,
  errorMessage,

  totalNodes,
  totalEdges,

  insightStatusFilter,
  onInsightStatusFilterChange,

  openInsightsCount,
  resolvedInsightsCount,
  dismissedInsightsCount,

  onAnalyze,
  onExecuteInsightAction,

  onResolveInsight,
  onDismissInsight,
}: GraphInsightsPanelProps) {
  const canAnalyze =
    totalNodes > 0;

  const totalInsights =
    openInsightsCount +
    resolvedInsightsCount +
    dismissedInsightsCount;

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-zinc-950 p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
        HELIX GRAPH INTELLIGENCE
      </p>

      <h2 className="mt-2 text-xl font-bold text-white">
        Análisis del universo
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-500">
        Analiza la estructura del Knowledge Graph
        y conserva un historial de problemas,
        decisiones y oportunidades detectadas.
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

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
          <p className="text-sm text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="mt-7">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Memoria de insights
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onInsightStatusFilterChange(
                "OPEN"
              )
            }
            className={`rounded-xl border p-3 text-left transition ${getFilterClasses(
              insightStatusFilter ===
                "OPEN"
            )}`}
          >
            <p className="text-[9px] uppercase tracking-widest">
              Pendientes
            </p>

            <p className="mt-1 text-lg font-bold">
              {openInsightsCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onInsightStatusFilterChange(
                "RESOLVED"
              )
            }
            className={`rounded-xl border p-3 text-left transition ${getFilterClasses(
              insightStatusFilter ===
                "RESOLVED"
            )}`}
          >
            <p className="text-[9px] uppercase tracking-widest">
              Resueltos
            </p>

            <p className="mt-1 text-lg font-bold">
              {resolvedInsightsCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onInsightStatusFilterChange(
                "DISMISSED"
              )
            }
            className={`rounded-xl border p-3 text-left transition ${getFilterClasses(
              insightStatusFilter ===
                "DISMISSED"
            )}`}
          >
            <p className="text-[9px] uppercase tracking-widest">
              Descartados
            </p>

            <p className="mt-1 text-lg font-bold">
              {dismissedInsightsCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onInsightStatusFilterChange(
                "ALL"
              )
            }
            className={`rounded-xl border p-3 text-left transition ${getFilterClasses(
              insightStatusFilter ===
                "ALL"
            )}`}
          >
            <p className="text-[9px] uppercase tracking-widest">
              Todos
            </p>

            <p className="mt-1 text-lg font-bold">
              {totalInsights}
            </p>
          </button>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Insights mostrados
          </p>

          <span className="text-xs font-semibold text-cyan-300">
            {insights.length}
          </span>
        </div>

        {insights.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-sm text-zinc-600">
              No hay insights en esta categoría.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {insights.map(
              (insight) => {
                const classes =
                  getInsightClasses(
                    insight.kind
                  );

                const hasAction =
                  Boolean(
                    insight.action
                  );

                const status =
                  insight.status ??
                  "OPEN";

                return (
                  <article
                    key={insight.id}
                    className={`rounded-2xl border bg-black p-4 ${classes}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                          {getInsightLabel(
                            insight.kind
                          )}
                        </span>

                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest ${getStatusClasses(
                              status
                            )}`}
                          >
                            {getStatusLabel(
                              status
                            )}
                          </span>
                        </div>
                      </div>

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

                    <button
                      type="button"
                      onClick={() =>
                        onExecuteInsightAction(
                          insight
                        )
                      }
                      disabled={
                        !hasAction ||
                        status ===
                          "DISMISSED"
                      }
                      className="mt-5 w-full rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-950/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {getActionLabel(
                        insight
                      )}
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          onResolveInsight(
                            insight.id
                          )
                        }
                        disabled={
                          status ===
                          "RESOLVED"
                        }
                        className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {status ===
                        "RESOLVED"
                          ? "Resuelto"
                          : "Resolver"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDismissInsight(
                            insight.id
                          )
                        }
                        disabled={
                          status ===
                          "DISMISSED"
                        }
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {status ===
                        "DISMISSED"
                          ? "Descartado"
                          : "Descartar"}
                      </button>
                    </div>

                    {insight.createdAt && (
                      <p className="mt-4 text-[10px] text-zinc-700">
                        Creado:{" "}
                        {new Date(
                          insight.createdAt
                        ).toLocaleString()}
                      </p>
                    )}

                    {insight.resolvedAt && (
                      <p className="mt-1 text-[10px] text-emerald-700">
                        Resuelto:{" "}
                        {new Date(
                          insight.resolvedAt
                        ).toLocaleString()}
                      </p>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}