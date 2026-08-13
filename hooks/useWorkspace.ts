"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Connection,
  Edge as FlowEdge,
  EdgeMouseHandler,
  Node as FlowNode,
  NodeMouseHandler,
  OnNodeDrag,
} from "@xyflow/react";

import { supabase } from "@/lib/supabase";
import { UniverseService } from "@/services/UniverseService";
import { AIService } from "@/services/AIService";
import { ApiAIProvider } from "@/services/ai/ApiAIProvider";

import type {
  AIRelationType,
  AISuggestion,
  AnalyzeGraphInput,
  GraphContext,
  GraphInsight,
  GraphInsightStatus,
  GraphReasoningMemory,
} from "@/types/ai";

const universeService =
  new UniverseService();

const aiService =
  new AIService(
    new ApiAIProvider()
  );

export interface WorkspaceUniverse {
  id: string;
  title: string;
  description: string | null;
}

export interface WorkspaceGraph {
  id: string;
}

export interface WorkspaceNode {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: number;
  metadata: Record<string, unknown>;
  position_x: number;
  position_y: number;
}

export interface WorkspaceEvidence {
  type: string;
  content: string;
  created_at: string;
}

export interface WorkspaceEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
  strength: number;
  confidence: number;
  description: string | null;
  evidence: WorkspaceEvidence[];
  metadata: Record<string, unknown>;
}

type InsightStatusFilter =
  | "ALL"
  | GraphInsightStatus;

/*
 * =========================
 * AI-006.5
 * NORMALIZAR TEXTO
 * =========================
 */

function normalizeInsightText(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/*
 * =========================
 * AI-006.5
 * FINGERPRINT
 * =========================
 */

function createInsightFingerprint(
  insight: Pick<
    GraphInsight,
    | "kind"
    | "title"
    | "relatedNodeIds"
    | "relatedEdgeIds"
  >
) {
  const nodeIds = [
    ...insight.relatedNodeIds,
  ].sort();

  const edgeIds = [
    ...insight.relatedEdgeIds,
  ].sort();

  return [
    insight.kind,

    normalizeInsightText(
      insight.title
    ),

    nodeIds.join(","),

    edgeIds.join(","),
  ].join("::");
}

/*
 * =========================
 * AI-006.6
 * TEXTO SEMÁNTICO
 * =========================
 */

function createInsightSemanticText(
  insight: Pick<
    GraphInsight,
    | "kind"
    | "title"
    | "description"
    | "suggestedAction"
    | "relatedNodeIds"
    | "relatedEdgeIds"
  >
) {
  const nodeIds = [
    ...insight.relatedNodeIds,
  ].sort();

  const edgeIds = [
    ...insight.relatedEdgeIds,
  ].sort();

  return [
    `TYPE: ${insight.kind}`,

    `TITLE: ${insight.title}`,

    `DESCRIPTION: ${insight.description}`,

    `ACTION: ${
      insight.suggestedAction ??
      "none"
    }`,

    `RELATED_NODES: ${
      nodeIds.join(", ") ||
      "none"
    }`,

    `RELATED_EDGES: ${
      edgeIds.join(", ") ||
      "none"
    }`,
  ].join("\n");
}

/*
 * =========================
 * AI-006.6
 * CREATE EMBEDDING
 * =========================
 */

async function createEmbedding(
  text: string
): Promise<number[]> {
  const response =
    await fetch(
      "/api/ai/embed",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            text,
          }),
      }
    );

  if (!response.ok) {
    let message =
      "No se pudo generar el embedding.";

    try {
      const data =
        await response.json();

      if (
        typeof data?.error ===
        "string"
      ) {
        message =
          data.error;
      }
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(
      message
    );
  }

  const data =
    await response.json();

  if (
    !Array.isArray(
      data.embedding
    ) ||
    data.embedding.length !==
      1536
  ) {
    throw new Error(
      "HELIX recibió un embedding inválido."
    );
  }

  return data.embedding as number[];
}

/*
 * =========================
 * AI-006.6
 * MATCH SEMÁNTICO
 * =========================
 */

interface SemanticMatch {
  id: string;
  kind: string;
  title: string;
  description: string;
  confidence: number;
  status: string;
  fingerprint: string;
  similarity: number;
}

async function findSemanticMatches(
  universeId: string,
  embedding: number[]
): Promise<SemanticMatch[]> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "match_graph_insights",
      {
        p_universe_id:
          universeId,

        p_query_embedding:
          embedding,

        p_match_threshold:
          0.9,

        p_match_count:
          5,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return (
    data ?? []
  ) as SemanticMatch[];
}

export function useWorkspace(
  universeId: string
) {
  /*
   * =========================
   * DATA
   * =========================
   */

  const [
    universe,
    setUniverse,
  ] =
    useState<WorkspaceUniverse | null>(
      null
    );

  const [
    graph,
    setGraph,
  ] =
    useState<WorkspaceGraph | null>(
      null
    );

  const [
    nodes,
    setNodes,
  ] =
    useState<WorkspaceNode[]>(
      []
    );

  const [
    edges,
    setEdges,
  ] =
    useState<WorkspaceEdge[]>(
      []
    );

  /*
   * =========================
   * SELECCIÓN
   * =========================
   */

  const [
    selectedNodeId,
    setSelectedNodeId,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedEdgeId,
    setSelectedEdgeId,
  ] =
    useState<string | null>(
      null
    );

  /*
   * =========================
   * CONEXIÓN PENDIENTE
   * =========================
   */

  const [
    pendingConnection,
    setPendingConnection,
  ] =
    useState<Connection | null>(
      null
    );

  /*
   * =========================
   * CREAR IDEA
   * =========================
   */

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    content,
    setContent,
  ] =
    useState("");

  const [
    isCreating,
    setIsCreating,
  ] =
    useState(false);

  /*
   * =========================
   * EDITOR NODO
   * =========================
   */

  const [
    nodeTitle,
    setNodeTitle,
  ] =
    useState("");

  const [
    nodeContent,
    setNodeContent,
  ] =
    useState("");

  const [
    nodeStatus,
    setNodeStatus,
  ] =
    useState("IDEA");

  const [
    nodePriority,
    setNodePriority,
  ] =
    useState(0);

  const [
    isUpdatingNode,
    setIsUpdatingNode,
  ] =
    useState(false);

  /*
   * =========================
   * EDITOR RELACIÓN
   * =========================
   */

  const [
    edgeType,
    setEdgeType,
  ] =
    useState("inspira");

  const [
    edgeStrength,
    setEdgeStrength,
  ] =
    useState(1);

  const [
    edgeConfidence,
    setEdgeConfidence,
  ] =
    useState(1);

  const [
    edgeDescription,
    setEdgeDescription,
  ] =
    useState("");

  const [
    isUpdatingEdge,
    setIsUpdatingEdge,
  ] =
    useState(false);

  /*
   * =========================
   * NUEVA RELACIÓN
   * =========================
   */

  const [
    pendingRelationType,
    setPendingRelationType,
  ] =
    useState("inspira");

  const [
    pendingRelationStrength,
    setPendingRelationStrength,
  ] =
    useState(1);

  const [
    pendingRelationConfidence,
    setPendingRelationConfidence,
  ] =
    useState(1);

  const [
    pendingRelationDescription,
    setPendingRelationDescription,
  ] =
    useState("");

  const [
    isCreatingRelation,
    setIsCreatingRelation,
  ] =
    useState(false);

  /*
   * =========================
   * EVIDENCIA
   * =========================
   */

  const [
    evidenceText,
    setEvidenceText,
  ] =
    useState("");

  const [
    isAddingEvidence,
    setIsAddingEvidence,
  ] =
    useState(false);

  /*
   * =========================
   * FILTROS GRAFO
   * =========================
   */

  const [
    nodeStatusFilter,
    setNodeStatusFilter,
  ] =
    useState("ALL");

  const [
    minimumPriority,
    setMinimumPriority,
  ] =
    useState(0);

  const [
    relationTypeFilter,
    setRelationTypeFilter,
  ] =
    useState("ALL");

  const [
    minimumConfidence,
    setMinimumConfidence,
  ] =
    useState(0);

  const [
    minimumStrength,
    setMinimumStrength,
  ] =
    useState(0);

  /*
   * =========================
   * AI SUGERENCIAS
   * =========================
   */

  const [
    aiSuggestions,
    setAiSuggestions,
  ] =
    useState<AISuggestion[]>(
      []
    );

  const [
    isExpandingIdea,
    setIsExpandingIdea,
  ] =
    useState(false);

  const [
    aiErrorMessage,
    setAiErrorMessage,
  ] =
    useState("");

  /*
   * =========================
   * EDICIÓN IA
   * =========================
   */

  const [
    editingSuggestionId,
    setEditingSuggestionId,
  ] =
    useState<string | null>(
      null
    );

  const [
    editingSuggestionTitle,
    setEditingSuggestionTitle,
  ] =
    useState("");

  const [
    editingSuggestionContent,
    setEditingSuggestionContent,
  ] =
    useState("");

  const [
    editingSuggestionRelationType,
    setEditingSuggestionRelationType,
  ] =
    useState<
      AISuggestion["proposedRelationType"] | ""
    >("");

  /*
   * =========================
   * GRAPH INTELLIGENCE
   * =========================
   */

  const [
    graphInsights,
    setGraphInsights,
  ] =
    useState<GraphInsight[]>(
      []
    );

  const [
    isAnalyzingGraph,
    setIsAnalyzingGraph,
  ] =
    useState(false);

  const [
    graphAnalysisError,
    setGraphAnalysisError,
  ] =
    useState("");

  /*
   * =========================
   * MEMORY FILTER
   * =========================
   */

  const [
    insightStatusFilter,
    setInsightStatusFilter,
  ] =
    useState<InsightStatusFilter>(
      "OPEN"
    );

  /*
   * =========================
   * GENERAL
   * =========================
   */

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  /*
   * =========================
   * CARGAR WORKSPACE
   * =========================
   */

  const loadWorkspace =
    useCallback(
      async () => {
        setLoading(true);
        setErrorMessage("");

        const {
          data:
            universeData,
          error:
            universeError,
        } =
          await supabase
            .from(
              "universes"
            )
            .select(
              "id, title, description"
            )
            .eq(
              "id",
              universeId
            )
            .maybeSingle();

        if (
          universeError ||
          !universeData
        ) {
          setErrorMessage(
            universeError?.message ??
              "Universo no encontrado."
          );

          setLoading(false);
          return;
        }

        const {
          data:
            graphData,
          error:
            graphError,
        } =
          await supabase
            .from(
              "graphs"
            )
            .select("id")
            .eq(
              "universe_id",
              universeId
            )
            .maybeSingle();

        if (
          graphError ||
          !graphData
        ) {
          setErrorMessage(
            graphError?.message ??
              "Grafo no encontrado."
          );

          setLoading(false);
          return;
        }

        const {
          data:
            nodeData,
          error:
            nodeError,
        } =
          await supabase
            .from(
              "nodes"
            )
            .select(
              "id, title, content, status, priority, metadata, position_x, position_y"
            )
            .eq(
              "universe_id",
              universeId
            )
            .order(
              "created_at",
              {
                ascending:
                  true,
              }
            );

        if (nodeError) {
          setErrorMessage(
            nodeError.message
          );

          setLoading(false);
          return;
        }

        const {
          data:
            edgeData,
          error:
            edgeError,
        } =
          await supabase
            .from(
              "edges"
            )
            .select(
              "id, source_node_id, target_node_id, type, strength, confidence, description, evidence, metadata"
            )
            .eq(
              "universe_id",
              universeId
            );

        if (edgeError) {
          setErrorMessage(
            edgeError.message
          );

          setLoading(false);
          return;
        }

        const {
          data:
            insightData,
          error:
            insightError,
        } =
          await supabase
            .from(
              "graph_insights"
            )
            .select(
              "id, kind, title, description, confidence, related_node_ids, related_edge_ids, suggested_action, action, fingerprint, metadata, status, created_at, resolved_at"
            )
            .eq(
              "universe_id",
              universeId
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            );

        if (insightError) {
          setErrorMessage(
            insightError.message
          );

          setLoading(false);
          return;
        }

        setUniverse(
          universeData
        );

        setGraph(
          graphData
        );

        setNodes(
          (
            nodeData ??
            []
          ) as WorkspaceNode[]
        );

        setEdges(
          (
            edgeData ??
            []
          ) as WorkspaceEdge[]
        );

        setGraphInsights(
          (
            insightData ??
            []
          ).map(
            (
              insight
            ) => ({
              id:
                insight.id,

              kind:
                insight.kind,

              title:
                insight.title,

              description:
                insight.description,

              confidence:
                insight.confidence,

              relatedNodeIds:
                insight.related_node_ids ??
                [],

              relatedEdgeIds:
                insight.related_edge_ids ??
                [],

              suggestedAction:
                insight.suggested_action ??
                undefined,

              action:
                insight.action ??
                undefined,

              status:
                insight.status ??
                "OPEN",

              createdAt:
                insight.created_at ??
                undefined,

              resolvedAt:
                insight.resolved_at ??
                null,

              metadata: {
                ...(
                  insight.metadata ??
                  {}
                ),

                fingerprint:
                  insight.fingerprint,
              },
            })
          ) as GraphInsight[]
        );

        setLoading(false);
      },
      [
        universeId,
      ]
    );

  /*
   * =========================
   * CARGA INICIAL
   * =========================
   */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadWorkspace();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadWorkspace,
  ]);

  /*
   * =========================
   * NODOS FILTRADOS
   * =========================
   */

  const filteredNodes =
    useMemo(
      () =>
        nodes.filter(
          (
            node
          ) => {
            const statusMatches =
              nodeStatusFilter ===
                "ALL" ||
              node.status ===
                nodeStatusFilter;

            const priorityMatches =
              node.priority >=
              minimumPriority;

            return (
              statusMatches &&
              priorityMatches
            );
          }
        ),
      [
        nodes,
        nodeStatusFilter,
        minimumPriority,
      ]
    );

  const visibleNodeIds =
    useMemo(
      () =>
        new Set(
          filteredNodes.map(
            (
              node
            ) =>
              node.id
          )
        ),
      [
        filteredNodes,
      ]
    );

  /*
   * =========================
   * EDGES FILTRADOS
   * =========================
   */

  const filteredEdges =
    useMemo(
      () =>
        edges.filter(
          (
            edge
          ) => {
            const typeMatches =
              relationTypeFilter ===
                "ALL" ||
              edge.type ===
                relationTypeFilter;

            const confidenceMatches =
              edge.confidence >=
              minimumConfidence;

            const strengthMatches =
              edge.strength >=
              minimumStrength;

            const nodesVisible =
              visibleNodeIds.has(
                edge.source_node_id
              ) &&
              visibleNodeIds.has(
                edge.target_node_id
              );

            return (
              typeMatches &&
              confidenceMatches &&
              strengthMatches &&
              nodesVisible
            );
          }
        ),
      [
        edges,
        relationTypeFilter,
        minimumConfidence,
        minimumStrength,
        visibleNodeIds,
      ]
    );

  /*
   * =========================
   * INSIGHTS FILTRADOS
   * =========================
   */

  const filteredGraphInsights =
    useMemo(
      () =>
        graphInsights.filter(
          (
            insight
          ) => {
            const status =
              insight.status ??
              "OPEN";

            if (
              insightStatusFilter ===
              "ALL"
            ) {
              return true;
            }

            return (
              status ===
              insightStatusFilter
            );
          }
        ),
      [
        graphInsights,
        insightStatusFilter,
      ]
    );

  /*
   * =========================
   * MEMORY COUNTERS
   * =========================
   */

  const openInsightsCount =
    useMemo(
      () =>
        graphInsights.filter(
          (
            insight
          ) =>
            (
              insight.status ??
              "OPEN"
            ) ===
            "OPEN"
        ).length,
      [
        graphInsights,
      ]
    );

  const resolvedInsightsCount =
    useMemo(
      () =>
        graphInsights.filter(
          (
            insight
          ) =>
            insight.status ===
            "RESOLVED"
        ).length,
      [
        graphInsights,
      ]
    );

  const dismissedInsightsCount =
    useMemo(
      () =>
        graphInsights.filter(
          (
            insight
          ) =>
            insight.status ===
            "DISMISSED"
        ).length,
      [
        graphInsights,
      ]
    );

  /*
   * =========================
   * AI-007
   * REASONING MEMORY
   * =========================
   */

  const reasoningMemory =
    useMemo<GraphReasoningMemory>(
      () => {
        const toMemoryInsight = (
          insight: GraphInsight
        ) => ({
          id:
            insight.id,

          kind:
            insight.kind,

          title:
            insight.title,

          description:
            insight.description,

          status:
            insight.status ??
            "OPEN",

          confidence:
            insight.confidence,

          createdAt:
            insight.createdAt,

          resolvedAt:
            insight.resolvedAt ??
            null,

          relatedNodeIds:
            insight.relatedNodeIds,

          relatedEdgeIds:
            insight.relatedEdgeIds,
        });

        return {
          open:
            graphInsights
              .filter(
                (
                  insight
                ) =>
                  (
                    insight.status ??
                    "OPEN"
                  ) ===
                  "OPEN"
              )
              .slice(
                0,
                20
              )
              .map(
                toMemoryInsight
              ),

          resolved:
            graphInsights
              .filter(
                (
                  insight
                ) =>
                  insight.status ===
                  "RESOLVED"
              )
              .slice(
                0,
                20
              )
              .map(
                toMemoryInsight
              ),

          dismissed:
            graphInsights
              .filter(
                (
                  insight
                ) =>
                  insight.status ===
                  "DISMISSED"
              )
              .slice(
                0,
                20
              )
              .map(
                toMemoryInsight
              ),

          totalHistoricalInsights:
            graphInsights.length,
        };
      },
      [
        graphInsights,
      ]
    );

  /*
   * =========================
   * FLOW NODES
   * =========================
   */

  const flowNodes =
    useMemo<FlowNode[]>(
      () =>
        filteredNodes.map(
          (
            node,
            index
          ) => ({
            id:
              node.id,

            type:
              "helix",

            position: {
              x:
                node.position_x ===
                0
                  ? (
                      index %
                      3
                    ) *
                    280
                  : node.position_x,

              y:
                node.position_y ===
                0
                  ? Math.floor(
                      index /
                        3
                    ) *
                    180
                  : node.position_y,
            },

            data: {
              label:
                node.title,

              status:
                node.status,

              priority:
                node.priority,
            },
          })
        ),
      [
        filteredNodes,
      ]
    );

  /*
   * =========================
   * FLOW EDGES
   * =========================
   */

  const flowEdges =
    useMemo<FlowEdge[]>(
      () =>
        filteredEdges.map(
          (
            edge
          ) => {
            const confidence =
              Math.max(
                0,
                Math.min(
                  1,
                  edge.confidence
                )
              );

            const strength =
              Math.max(
                0,
                Math.min(
                  1,
                  edge.strength
                )
              );

            const strokeWidth =
              1.5 +
              strength *
                4;

            const opacity =
              0.25 +
              confidence *
                0.75;

            const relationStyle =
              edge.type ===
              "contradice"
                ? {
                    stroke:
                      "#ef4444",

                    strokeDasharray:
                      "8 6",
                  }

                : edge.type ===
                    "demuestra"
                  ? {
                      stroke:
                        "#22c55e",
                    }

                : edge.type ===
                    "causa"
                  ? {
                      stroke:
                        "#f59e0b",
                    }

                : edge.type ===
                    "depende_de"
                  ? {
                      stroke:
                        "#3b82f6",

                      strokeDasharray:
                        "4 4",
                    }

                : edge.type ===
                    "complementa"
                  ? {
                      stroke:
                        "#a855f7",
                    }

                : {
                    stroke:
                      "#22d3ee",
                  };

            return {
              id:
                edge.id,

              source:
                edge.source_node_id,

              target:
                edge.target_node_id,

              label: `${
                edge.type
              } · ${(
                confidence *
                100
              ).toFixed(
                0
              )}%`,

              animated:
                strength >=
                0.8,

              style: {
                ...relationStyle,

                strokeWidth,

                opacity,
              },

              labelStyle: {
                fill:
                  "#d4d4d8",

                fontSize:
                  12,
              },

              data: {
                type:
                  edge.type,

                strength:
                  edge.strength,

                confidence:
                  edge.confidence,

                description:
                  edge.description,

                evidence:
                  edge.evidence,

                metadata:
                  edge.metadata,
              },
            };
          }
        ),
      [
        filteredEdges,
      ]
    );

  /*
   * =========================
   * SELECCIÓN
   * =========================
   */

  const selectedNode =
    useMemo(
      () =>
        nodes.find(
          (
            node
          ) =>
            node.id ===
            selectedNodeId
        ) ??
        null,
      [
        nodes,
        selectedNodeId,
      ]
    );

  const selectedEdge =
    useMemo(
      () =>
        edges.find(
          (
            edge
          ) =>
            edge.id ===
            selectedEdgeId
        ) ??
        null,
      [
        edges,
        selectedEdgeId,
      ]
    );

  /*
   * =========================
   * GRAPH CONTEXT
   * =========================
   */

  const graphContext =
    useMemo<GraphContext | null>(
      () => {
        if (!selectedNode) {
          return null;
        }

        const incomingRelations =
          edges
            .filter(
              (
                edge
              ) =>
                edge.target_node_id ===
                selectedNode.id
            )
            .map(
              (
                edge
              ) => ({
                id:
                  edge.id,

                sourceNodeId:
                  edge.source_node_id,

                targetNodeId:
                  edge.target_node_id,

                type:
                  edge.type as AIRelationType,

                strength:
                  edge.strength,

                confidence:
                  edge.confidence,

                description:
                  edge.description,

                evidence:
                  edge.evidence,
              })
            );

        const outgoingRelations =
          edges
            .filter(
              (
                edge
              ) =>
                edge.source_node_id ===
                selectedNode.id
            )
            .map(
              (
                edge
              ) => ({
                id:
                  edge.id,

                sourceNodeId:
                  edge.source_node_id,

                targetNodeId:
                  edge.target_node_id,

                type:
                  edge.type as AIRelationType,

                strength:
                  edge.strength,

                confidence:
                  edge.confidence,

                description:
                  edge.description,

                evidence:
                  edge.evidence,
              })
            );

        const incomingNeighbors =
          incomingRelations.flatMap(
            (
              relation
            ) => {
              const node =
                nodes.find(
                  (
                    item
                  ) =>
                    item.id ===
                    relation.sourceNodeId
                );

              if (!node) {
                return [];
              }

              return [
                {
                  node: {
                    id:
                      node.id,

                    title:
                      node.title,

                    content:
                      node.content,

                    status:
                      node.status,

                    priority:
                      node.priority,
                  },

                  relation,

                  direction:
                    "incoming" as const,
                },
              ];
            }
          );

        const outgoingNeighbors =
          outgoingRelations.flatMap(
            (
              relation
            ) => {
              const node =
                nodes.find(
                  (
                    item
                  ) =>
                    item.id ===
                    relation.targetNodeId
                );

              if (!node) {
                return [];
              }

              return [
                {
                  node: {
                    id:
                      node.id,

                    title:
                      node.title,

                    content:
                      node.content,

                    status:
                      node.status,

                    priority:
                      node.priority,
                  },

                  relation,

                  direction:
                    "outgoing" as const,
                },
              ];
            }
          );

        return {
          focusNode: {
            id:
              selectedNode.id,

            title:
              selectedNode.title,

            content:
              selectedNode.content,

            status:
              selectedNode.status,

            priority:
              selectedNode.priority,
          },

          neighbors: [
            ...incomingNeighbors,
            ...outgoingNeighbors,
          ],

          incomingRelations,

          outgoingRelations,

          totalNodesInUniverse:
            nodes.length,

          totalEdgesInUniverse:
            edges.length,
        };
      },
      [
        selectedNode,
        nodes,
        edges,
      ]
    );

  /*
   * =========================
   * CREAR IDEA
   * =========================
   */

  async function addIdea() {
    if (
      !graph ||
      !title.trim()
    ) {
      return;
    }

    try {
      setIsCreating(
        true
      );

      await universeService.addIdea(
        universeId,
        graph.id,
        title,
        content
      );

      setTitle("");
      setContent("");

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la idea."
      );
    } finally {
      setIsCreating(
        false
      );
    }
  }

  /*
   * =========================
   * SELECCIONAR NODO
   * =========================
   */

  function selectNode(
    nodeId: string
  ) {
    const node =
      nodes.find(
        (
          item
        ) =>
          item.id ===
          nodeId
      );

    if (!node) {
      return;
    }

    setSelectedNodeId(
      nodeId
    );

    setSelectedEdgeId(
      null
    );

    setPendingConnection(
      null
    );

    setNodeTitle(
      node.title
    );

    setNodeContent(
      node.content
    );

    setNodeStatus(
      node.status
    );

    setNodePriority(
      node.priority
    );

    setAiSuggestions(
      []
    );

    setAiErrorMessage(
      ""
    );

    cancelEditingAISuggestion();
  }

  /*
   * =========================
   * SELECCIONAR EDGE
   * =========================
   */

  function selectEdge(
    edgeId: string
  ) {
    const edge =
      edges.find(
        (
          item
        ) =>
          item.id ===
          edgeId
      );

    if (!edge) {
      return;
    }

    setSelectedEdgeId(
      edgeId
    );

    setSelectedNodeId(
      null
    );

    setPendingConnection(
      null
    );

    setEdgeType(
      edge.type
    );

    setEdgeStrength(
      edge.strength
    );

    setEdgeConfidence(
      edge.confidence
    );

    setEdgeDescription(
      edge.description ??
        ""
    );

    setEvidenceText(
      ""
    );

    setAiSuggestions(
      []
    );

    setAiErrorMessage(
      ""
    );

    cancelEditingAISuggestion();
  }

  /*
   * =========================
   * FLOW HANDLERS
   * =========================
   */

  const handleNodeClick:
    NodeMouseHandler = (
      _,
      node
    ) => {
      selectNode(
        node.id
      );
    };

  const handleEdgeClick:
    EdgeMouseHandler = (
      _,
      edge
    ) => {
      selectEdge(
        edge.id
      );
    };

  const handleNodeDragStop:
    OnNodeDrag = (
      _,
      node
    ) => {
      void universeService
        .moveNode(
          node.id,
          node.position.x,
          node.position.y
        )
        .catch(
          (
            error:
              unknown
          ) => {
            console.error(
              "No se pudo guardar la posición:",
              error
            );
          }
        );
    };

  /*
   * =========================
   * CONECTAR
   * =========================
   */

  function handleConnect(
    connection:
      Connection
  ) {
    const source =
      connection.source;

    const target =
      connection.target;

    if (
      !source ||
      !target
    ) {
      return;
    }

    if (
      source ===
      target
    ) {
      alert(
        "No puedes conectar una idea consigo misma."
      );

      return;
    }

    const alreadyExists =
      edges.some(
        (
          edge
        ) =>
          edge.source_node_id ===
            source &&
          edge.target_node_id ===
            target
      );

    if (alreadyExists) {
      alert(
        "Ya existe una conexión entre estas ideas."
      );

      return;
    }

    setPendingConnection(
      connection
    );

    setPendingRelationType(
      "inspira"
    );

    setPendingRelationStrength(
      1
    );

    setPendingRelationConfidence(
      1
    );

    setPendingRelationDescription(
      ""
    );

    setSelectedNodeId(
      null
    );

    setSelectedEdgeId(
      null
    );

    setAiSuggestions(
      []
    );

    setAiErrorMessage(
      ""
    );

    cancelEditingAISuggestion();
  }

  /*
   * =========================
   * CREAR RELACIÓN
   * =========================
   */

  async function createPendingRelation() {
    if (!pendingConnection) {
      return;
    }

    const source =
      pendingConnection.source;

    const target =
      pendingConnection.target;

    if (
      !source ||
      !target
    ) {
      return;
    }

    try {
      setIsCreatingRelation(
        true
      );

      await universeService.connectIdeas(
        universeId,
        source,
        target,
        pendingRelationType,
        pendingRelationStrength,
        pendingRelationConfidence,
        pendingRelationDescription.trim() ||
          null
      );

      setPendingConnection(
        null
      );

      setPendingRelationType(
        "inspira"
      );

      setPendingRelationStrength(
        1
      );

      setPendingRelationConfidence(
        1
      );

      setPendingRelationDescription(
        ""
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la relación."
      );
    } finally {
      setIsCreatingRelation(
        false
      );
    }
  }

  function cancelPendingRelation() {
    setPendingConnection(
      null
    );

    setPendingRelationType(
      "inspira"
    );

    setPendingRelationStrength(
      1
    );

    setPendingRelationConfidence(
      1
    );

    setPendingRelationDescription(
      ""
    );
  }

  /*
   * =========================
   * ACTUALIZAR EDGE
   * =========================
   */

  async function updateSelectedEdge() {
    if (!selectedEdge) {
      return;
    }

    try {
      setIsUpdatingEdge(
        true
      );

      await universeService.updateEdge(
        selectedEdge.id,
        edgeType,
        edgeStrength,
        edgeConfidence,
        edgeDescription.trim() ||
          null,
        selectedEdge.evidence,
        selectedEdge.metadata
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la relación."
      );
    } finally {
      setIsUpdatingEdge(
        false
      );
    }
  }

  /*
   * =========================
   * EVIDENCIA
   * =========================
   */

  async function addEvidenceToSelectedEdge() {
    if (!selectedEdge) {
      return;
    }

    const cleanEvidence =
      evidenceText.trim();

    if (!cleanEvidence) {
      return;
    }

    try {
      setIsAddingEvidence(
        true
      );

      const nextEvidence:
        WorkspaceEvidence[] =
        [
          ...selectedEdge.evidence,

          {
            type:
              "note",

            content:
              cleanEvidence,

            created_at:
              new Date().toISOString(),
          },
        ];

      await universeService.updateEdge(
        selectedEdge.id,
        edgeType,
        edgeStrength,
        edgeConfidence,
        edgeDescription.trim() ||
          null,
        nextEvidence,
        selectedEdge.metadata
      );

      setEvidenceText(
        ""
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo agregar la evidencia."
      );
    } finally {
      setIsAddingEvidence(
        false
      );
    }
  }

  /*
   * =========================
   * ACTUALIZAR NODO
   * =========================
   */

  async function updateSelectedNode() {
    if (!selectedNode) {
      return;
    }

    try {
      setIsUpdatingNode(
        true
      );

      await universeService.updateNode(
        selectedNode.id,
        nodeTitle,
        nodeContent,
        nodeStatus,
        nodePriority,
        selectedNode.metadata
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el nodo."
      );
    } finally {
      setIsUpdatingNode(
        false
      );
    }
  }

  /*
   * =========================
   * EXPANDIR IDEA
   * =========================
   */

  async function expandSelectedNode() {
    if (!selectedNode) {
      return;
    }

    try {
      setIsExpandingIdea(
        true
      );

      setAiErrorMessage(
        ""
      );

      setAiSuggestions(
        []
      );

      cancelEditingAISuggestion();

      const suggestions =
        await aiService.expandIdea(
          {
            universeId,

            nodeId:
              selectedNode.id,

            title:
              selectedNode.title,

            content:
              selectedNode.content,

            status:
              selectedNode.status,

            graphContext:
              graphContext ??
              undefined,
          }
        );

      setAiSuggestions(
        suggestions
      );
    } catch (error) {
      setAiErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo expandir la idea."
      );
    } finally {
      setIsExpandingIdea(
        false
      );
    }
  }

  /*
   * =========================
   * AI-007
   * ANALIZAR CON MEMORIA
   * =========================
   */

  async function analyzeKnowledgeGraph() {
    try {
      setIsAnalyzingGraph(
        true
      );

      setGraphAnalysisError(
        ""
      );

      const input:
        AnalyzeGraphInput =
        {
          universeId,

          graphContext: {
            nodes:
              nodes.map(
                (
                  node
                ) => ({
                  id:
                    node.id,

                  title:
                    node.title,

                  content:
                    node.content,

                  status:
                    node.status,

                  priority:
                    node.priority,
                })
              ),

            edges:
              edges.map(
                (
                  edge
                ) => ({
                  id:
                    edge.id,

                  sourceNodeId:
                    edge.source_node_id,

                  targetNodeId:
                    edge.target_node_id,

                  type:
                    edge.type as AIRelationType,

                  strength:
                    edge.strength,

                  confidence:
                    edge.confidence,

                  description:
                    edge.description,

                  evidence:
                    edge.evidence,
                })
              ),
          },

          /*
           * =========================
           * AI-007
           * MEMORIA HISTÓRICA
           * =========================
           */

          memory:
            reasoningMemory,
        };

      /*
       * =========================
       * GRAPH INTELLIGENCE
       * =========================
       */

      const insights =
        await aiService.analyzeGraph(
          input
        );

      /*
       * =========================
       * CAPA 1
       * FINGERPRINT EXACTO
       * =========================
       */

      const existingFingerprints =
        new Set(
          graphInsights.map(
            (
              insight
            ) =>
              createInsightFingerprint(
                insight
              )
          )
        );

      const uniqueInsights =
        insights.filter(
          (
            insight
          ) => {
            const fingerprint =
              createInsightFingerprint(
                insight
              );

            return !existingFingerprints.has(
              fingerprint
            );
          }
        );

      /*
       * =========================
       * CAPA 2
       * MEMORIA SEMÁNTICA
       * =========================
       */

      const semanticResults =
        await Promise.all(
          uniqueInsights.map(
            async (
              insight
            ) => {
              const fingerprint =
                createInsightFingerprint(
                  insight
                );

              const semanticText =
                createInsightSemanticText(
                  insight
                );

              const embedding =
                await createEmbedding(
                  semanticText
                );

              const matches =
                await findSemanticMatches(
                  universeId,
                  embedding
                );

              const bestMatch =
                matches[0] ??
                null;

              const isSemanticDuplicate =
                Boolean(
                  bestMatch &&
                  bestMatch.similarity >=
                    0.9
                );

              if (
                isSemanticDuplicate
              ) {
                console.info(
                  "HELIX MEMORY: insight semánticamente conocido.",
                  {
                    newInsight:
                      insight.title,

                    existingInsight:
                      bestMatch?.title,

                    similarity:
                      bestMatch?.similarity,

                    status:
                      bestMatch?.status,
                  }
                );

                return null;
              }

              return {
                universe_id:
                  universeId,

                kind:
                  insight.kind,

                title:
                  insight.title,

                description:
                  insight.description,

                confidence:
                  insight.confidence,

                related_node_ids:
                  insight.relatedNodeIds,

                related_edge_ids:
                  insight.relatedEdgeIds,

                suggested_action:
                  insight.suggestedAction ??
                  null,

                action:
                  insight.action ??
                  null,

                fingerprint,

                embedding,

                metadata: {
                  ...(
                    insight.metadata ??
                    {}
                  ),

                  fingerprint,

                  semanticText,

                  embeddingModel:
                    "text-embedding-3-small",

                  embeddingDimensions:
                    1536,

                  semanticDeduplication:
                    true,

                  similarityThreshold:
                    0.9,

                  reasoningMemory: {
                    historicalInsights:
                      reasoningMemory
                        .totalHistoricalInsights,

                    open:
                      reasoningMemory
                        .open.length,

                    resolved:
                      reasoningMemory
                        .resolved.length,

                    dismissed:
                      reasoningMemory
                        .dismissed.length,
                  },

                  closestMatch:
                    bestMatch
                      ? {
                          id:
                            bestMatch.id,

                          similarity:
                            bestMatch.similarity,

                          status:
                            bestMatch.status,
                        }
                      : null,
                },

                status:
                  "OPEN",
              };
            }
          )
        );

      const rows =
        semanticResults.filter(
          (
            row
          ) =>
            row !== null
        );

      /*
       * =========================
       * CAPA 3
       * POSTGRES UNIQUE
       * =========================
       */

      if (
        rows.length >
        0
      ) {
        const {
          error:
            insightInsertError,
        } =
          await supabase
            .from(
              "graph_insights"
            )
            .insert(
              rows
            );

        if (
          insightInsertError
        ) {
          throw new Error(
            insightInsertError.message
          );
        }
      }

      /*
       * =========================
       * RECARGAR MEMORIA
       * =========================
       */

      await loadWorkspace();

      setInsightStatusFilter(
        "OPEN"
      );
    } catch (error) {
      setGraphAnalysisError(
        error instanceof Error
          ? error.message
          : "No se pudo analizar el Knowledge Graph."
      );
    } finally {
      setIsAnalyzingGraph(
        false
      );
    }
  }

  /*
   * =========================
   * ACEPTAR SUGERENCIA
   * =========================
   */

  async function acceptAISuggestion(
    suggestion:
      AISuggestion
  ) {
    if (!graph) {
      return;
    }

    const sourceNode =
      nodes.find(
        (
          node
        ) =>
          node.id ===
          suggestion.sourceNodeId
      );

    if (!sourceNode) {
      alert(
        "No se encontró el nodo origen de la sugerencia."
      );

      return;
    }

    try {
      const newNodeId =
        await universeService.addIdea(
          universeId,
          graph.id,
          suggestion.title,
          suggestion.content
        );

      const newNodeIdString =
        typeof newNodeId ===
        "string"
          ? newNodeId
          : String(
              newNodeId
            );

      if (
        suggestion.proposedRelationType
      ) {
        await universeService.connectIdeas(
          universeId,
          sourceNode.id,
          newNodeIdString,
          suggestion.proposedRelationType,
          1,
          suggestion.confidence,
          suggestion.reasoning ??
            null
        );
      }

      setAiSuggestions(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              suggestion.id
          )
      );

      if (
        editingSuggestionId ===
        suggestion.id
      ) {
        cancelEditingAISuggestion();
      }

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo aceptar la sugerencia."
      );
    }
  }

  /*
   * =========================
   * RECHAZAR SUGERENCIA
   * =========================
   */

  function rejectAISuggestion(
    suggestionId:
      string
  ) {
    setAiSuggestions(
      (
        current
      ) =>
        current.filter(
          (
            suggestion
          ) =>
            suggestion.id !==
            suggestionId
        )
    );

    if (
      editingSuggestionId ===
      suggestionId
    ) {
      cancelEditingAISuggestion();
    }
  }

  /*
   * =========================
   * EDICIÓN IA
   * =========================
   */

  function startEditingAISuggestion(
    suggestion:
      AISuggestion
  ) {
    setEditingSuggestionId(
      suggestion.id
    );

    setEditingSuggestionTitle(
      suggestion.title
    );

    setEditingSuggestionContent(
      suggestion.content
    );

    setEditingSuggestionRelationType(
      suggestion.proposedRelationType ??
        ""
    );
  }

  function cancelEditingAISuggestion() {
    setEditingSuggestionId(
      null
    );

    setEditingSuggestionTitle(
      ""
    );

    setEditingSuggestionContent(
      ""
    );

    setEditingSuggestionRelationType(
      ""
    );
  }

  function saveEditedAISuggestion() {
    if (!editingSuggestionId) {
      return;
    }

    const cleanTitle =
      editingSuggestionTitle.trim();

    const cleanContent =
      editingSuggestionContent.trim();

    if (!cleanTitle) {
      return;
    }

    setAiSuggestions(
      (
        current
      ) =>
        current.map(
          (
            suggestion
          ) =>
            suggestion.id ===
            editingSuggestionId
              ? {
                  ...suggestion,

                  title:
                    cleanTitle,

                  content:
                    cleanContent,

                  proposedRelationType:
                    editingSuggestionRelationType ||
                    undefined,
                }
              : suggestion
        )
    );

    cancelEditingAISuggestion();
  }

  /*
   * =========================
   * EJECUTAR INSIGHT
   * =========================
   */

  function executeGraphInsightAction(
    insight:
      GraphInsight
  ) {
    const action =
      insight.action;

    if (!action) {
      alert(
        "Este insight no contiene una acción ejecutable."
      );

      return;
    }

    switch (
      action.kind
    ) {
      case "select_node": {
        if (
          !action.nodeId
        ) {
          return;
        }

        selectNode(
          action.nodeId
        );

        return;
      }

      case "select_edge": {
        if (
          !action.edgeId
        ) {
          return;
        }

        selectEdge(
          action.edgeId
        );

        return;
      }

      case "prepare_connection": {
        const source =
          action.sourceNodeId;

        const target =
          action.targetNodeId;

        if (
          !source ||
          !target ||
          source ===
            target
        ) {
          return;
        }

        const alreadyExists =
          edges.some(
            (
              edge
            ) =>
              edge.source_node_id ===
                source &&
              edge.target_node_id ===
                target
          );

        if (alreadyExists) {
          alert(
            "Ya existe una conexión entre estos nodos."
          );

          return;
        }

        setPendingConnection({
          source,
          target,

          sourceHandle:
            null,

          targetHandle:
            null,
        });

        setPendingRelationType(
          action.relationType ??
            "complementa"
        );

        setPendingRelationStrength(
          0.7
        );

        setPendingRelationConfidence(
          insight.confidence
        );

        setPendingRelationDescription(
          insight.description
        );

        setSelectedNodeId(
          null
        );

        setSelectedEdgeId(
          null
        );

        return;
      }

      case "expand_node": {
        if (
          !action.nodeId
        ) {
          return;
        }

        selectNode(
          action.nodeId
        );

        return;
      }

      case "review_contradiction": {
        if (
          action.edgeId
        ) {
          selectEdge(
            action.edgeId
          );

          return;
        }

        if (
          action.nodeId
        ) {
          selectNode(
            action.nodeId
          );
        }

        return;
      }

      default:
        return;
    }
  }

  /*
   * =========================
   * RESOLVER INSIGHT
   * =========================
   */

  async function resolveGraphInsight(
    insightId:
      string
  ) {
    try {
      const resolvedAt =
        new Date().toISOString();

      const {
        error,
      } =
        await supabase
          .from(
            "graph_insights"
          )
          .update({
            status:
              "RESOLVED",

            resolved_at:
              resolvedAt,
          })
          .eq(
            "id",
            insightId
          )
          .eq(
            "universe_id",
            universeId
          );

      if (error) {
        throw new Error(
          error.message
        );
      }

      setGraphInsights(
        (
          current
        ) =>
          current.map(
            (
              insight
            ) =>
              insight.id ===
              insightId
                ? {
                    ...insight,

                    status:
                      "RESOLVED",

                    resolvedAt,
                  }
                : insight
          )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo resolver el insight."
      );
    }
  }

  /*
   * =========================
   * DESCARTAR INSIGHT
   * =========================
   */

  async function dismissGraphInsight(
    insightId:
      string
  ) {
    try {
      const {
        error,
      } =
        await supabase
          .from(
            "graph_insights"
          )
          .update({
            status:
              "DISMISSED",

            resolved_at:
              null,
          })
          .eq(
            "id",
            insightId
          )
          .eq(
            "universe_id",
            universeId
          );

      if (error) {
        throw new Error(
          error.message
        );
      }

      setGraphInsights(
        (
          current
        ) =>
          current.map(
            (
              insight
            ) =>
              insight.id ===
              insightId
                ? {
                    ...insight,

                    status:
                      "DISMISSED",

                    resolvedAt:
                      null,
                  }
                : insight
          )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo descartar el insight."
      );
    }
  }

  /*
   * =========================
   * API DEL WORKSPACE
   * =========================
   */

  return {
    universe,
    graph,

    nodes,
    edges,

    filteredNodes,
    filteredEdges,

    flowNodes,
    flowEdges,

    graphContext,

    /*
     * AI-007
     */

    reasoningMemory,

    /*
     * GRAPH INTELLIGENCE
     */

    graphInsights,
    filteredGraphInsights,

    isAnalyzingGraph,
    graphAnalysisError,

    analyzeKnowledgeGraph,
    executeGraphInsightAction,

    resolveGraphInsight,
    dismissGraphInsight,

    /*
     * MEMORY FILTER
     */

    insightStatusFilter,
    setInsightStatusFilter,

    openInsightsCount,
    resolvedInsightsCount,
    dismissedInsightsCount,

    /*
     * SELECCIÓN
     */

    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    selectNode,

    selectedEdge,
    selectedEdgeId,
    setSelectedEdgeId,
    selectEdge,

    /*
     * RELACIÓN PENDIENTE
     */

    pendingConnection,
    setPendingConnection,

    pendingRelationType,
    setPendingRelationType,

    pendingRelationStrength,
    setPendingRelationStrength,

    pendingRelationConfidence,
    setPendingRelationConfidence,

    pendingRelationDescription,
    setPendingRelationDescription,

    isCreatingRelation,

    createPendingRelation,
    cancelPendingRelation,

    /*
     * FILTROS
     */

    nodeStatusFilter,
    setNodeStatusFilter,

    minimumPriority,
    setMinimumPriority,

    relationTypeFilter,
    setRelationTypeFilter,

    minimumConfidence,
    setMinimumConfidence,

    minimumStrength,
    setMinimumStrength,

    /*
     * CREAR IDEA
     */

    title,
    content,
    isCreating,

    setTitle,
    setContent,

    addIdea,

    /*
     * EDITOR NODO
     */

    nodeTitle,
    setNodeTitle,

    nodeContent,
    setNodeContent,

    nodeStatus,
    setNodeStatus,

    nodePriority,
    setNodePriority,

    isUpdatingNode,
    updateSelectedNode,

    /*
     * EDITOR RELACIÓN
     */

    edgeType,
    setEdgeType,

    edgeStrength,
    setEdgeStrength,

    edgeConfidence,
    setEdgeConfidence,

    edgeDescription,
    setEdgeDescription,

    isUpdatingEdge,
    updateSelectedEdge,

    /*
     * EVIDENCIA
     */

    evidenceText,
    setEvidenceText,

    isAddingEvidence,
    addEvidenceToSelectedEdge,

    /*
     * AI EXPANSIÓN
     */

    aiSuggestions,
    isExpandingIdea,
    aiErrorMessage,

    expandSelectedNode,
    acceptAISuggestion,
    rejectAISuggestion,

    /*
     * EDICIÓN IA
     */

    editingSuggestionId,

    editingSuggestionTitle,
    setEditingSuggestionTitle,

    editingSuggestionContent,
    setEditingSuggestionContent,

    editingSuggestionRelationType,
    setEditingSuggestionRelationType,

    startEditingAISuggestion,
    cancelEditingAISuggestion,
    saveEditedAISuggestion,

    /*
     * GENERAL
     */

    loading,
    errorMessage,
    loadWorkspace,

    /*
     * REACT FLOW
     */

    handleNodeDragStop,
    handleNodeClick,
    handleEdgeClick,
    handleConnect,
  };
}