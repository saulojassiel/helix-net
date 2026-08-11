import OpenAI from "openai";
import { NextResponse } from "next/server";

import type {
  AIRelationType,
  AnalyzeGraphInput,
  GraphInsightActionKind,
  GraphInsightKind,
} from "@/types/ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
 * =========================
 * TIPOS PERMITIDOS
 * =========================
 */

const insightKinds: GraphInsightKind[] = [
  "knowledge_gap",
  "potential_contradiction",
  "weak_node",
  "weak_relation",
  "missing_connection",
];

const relationTypes: AIRelationType[] = [
  "inspira",
  "causa",
  "depende_de",
  "complementa",
  "contradice",
  "demuestra",
];

const actionKinds: GraphInsightActionKind[] = [
  "select_node",
  "select_edge",
  "prepare_connection",
  "expand_node",
  "review_contradiction",
];

/*
 * =========================
 * CONTROL DE COSTO
 * =========================
 */

const MAX_NODES = 40;
const MAX_EDGES = 80;

const MAX_NODE_CONTENT = 700;
const MAX_EDGE_DESCRIPTION = 400;

const MAX_EVIDENCE_PER_EDGE = 3;
const MAX_EVIDENCE_CONTENT = 500;

/*
 * =========================
 * UTILIDADES
 * =========================
 */

function limitText(
  value: string | null | undefined,
  maxLength: number
) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(
    0,
    maxLength
  )}…`;
}

/*
 * =========================
 * PREPARAR GRAFO
 * =========================
 */

function prepareGraph(
  input: AnalyzeGraphInput
) {
  const nodes =
    input.graphContext.nodes
      .slice(0, MAX_NODES)
      .map((node) => ({
        id: node.id,

        title: node.title,

        content: limitText(
          node.content,
          MAX_NODE_CONTENT
        ),

        status: node.status,

        priority: node.priority,
      }));

  const visibleNodeIds =
    new Set(
      nodes.map(
        (node) => node.id
      )
    );

  const edges =
    input.graphContext.edges
      .filter(
        (edge) =>
          visibleNodeIds.has(
            edge.sourceNodeId
          ) &&
          visibleNodeIds.has(
            edge.targetNodeId
          )
      )
      .slice(0, MAX_EDGES)
      .map((edge) => ({
        id: edge.id,

        sourceNodeId:
          edge.sourceNodeId,

        targetNodeId:
          edge.targetNodeId,

        type:
          edge.type,

        strength:
          edge.strength,

        confidence:
          edge.confidence,

        description:
          limitText(
            edge.description,
            MAX_EDGE_DESCRIPTION
          ),

        evidence:
          edge.evidence
            .slice(
              0,
              MAX_EVIDENCE_PER_EDGE
            )
            .map(
              (evidence) => ({
                type:
                  evidence.type,

                content:
                  limitText(
                    evidence.content,
                    MAX_EVIDENCE_CONTENT
                  ),

                created_at:
                  evidence.created_at,
              })
            ),
      }));

  return {
    universeId:
      input.universeId,

    totalNodes:
      input.graphContext.nodes.length,

    totalEdges:
      input.graphContext.edges.length,

    analyzedNodes:
      nodes.length,

    analyzedEdges:
      edges.length,

    nodes,
    edges,
  };
}

/*
 * =========================
 * TIPO DE RESPUESTA IA
 * =========================
 */

interface RawInsight {
  kind: GraphInsightKind;

  title: string;

  description: string;

  confidence: number;

  relatedNodeIds: string[];

  relatedEdgeIds: string[];

  suggestedAction: string;

  action: {
    kind:
      GraphInsightActionKind;

    nodeId:
      string | null;

    edgeId:
      string | null;

    sourceNodeId:
      string | null;

    targetNodeId:
      string | null;

    relationType:
      AIRelationType | null;
  };
}

/*
 * =========================
 * POST
 * =========================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * =========================
     * API KEY
     * =========================
     */

    if (
      !process.env.OPENAI_API_KEY
    ) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY no está configurada.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =========================
     * INPUT
     * =========================
     */

    const body =
      (await request.json()) as
        Partial<AnalyzeGraphInput>;

    if (
      !body.universeId ||
      !body.graphContext ||
      !Array.isArray(
        body.graphContext.nodes
      ) ||
      !Array.isArray(
        body.graphContext.edges
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El Knowledge Graph enviado no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * No gastamos una llamada
     * si no existen nodos.
     */

    if (
      body.graphContext.nodes
        .length === 0
    ) {
      return NextResponse.json(
        {
          insights: [],
        }
      );
    }

    /*
     * =========================
     * PREPARAR CONTEXTO
     * =========================
     */

    const preparedGraph =
      prepareGraph(
        body as AnalyzeGraphInput
      );

    const graphText =
      JSON.stringify(
        preparedGraph,
        null,
        2
      );

    /*
     * =========================
     * OPENAI
     * =========================
     */

    const response =
      await openai.responses.create({
        model:
          "gpt-5.6-terra",

        reasoning: {
          effort: "low",
        },

        store: false,

        input: [
          {
            role: "system",

            content: `
Eres HELIX Graph Intelligence.

Analizas un Knowledge Graph compuesto
por nodos y relaciones semánticas.

Tu objetivo NO es resumir el grafo.

Debes detectar oportunidades,
debilidades y anomalías estructurales
que puedan mejorar su calidad.

TIPOS DE INSIGHT

${insightKinds.join(", ")}

DEFINICIONES

knowledge_gap:
Existe una pregunta abierta, afirmación
sin respaldo suficiente o región del
grafo que requiere conocimiento adicional.

potential_contradiction:
Dos nodos, relaciones o afirmaciones
parecen incompatibles o requieren
reconciliación.

weak_node:
Un nodo está aislado, poco desarrollado,
sin relaciones útiles o con contenido
demasiado débil.

weak_relation:
Una relación tiene confianza baja,
evidencia insuficiente, descripción
débil o semántica cuestionable.

missing_connection:
Dos nodos parecen justificar una relación
que actualmente no existe.

REGLAS GENERALES

- Basa los insights exclusivamente en
  el Knowledge Graph proporcionado.

- No inventes fuentes.

- No inventes evidencia.

- No inventes IDs.

- No presentes hipótesis como hechos.

- Evita insights duplicados.

- Prioriza insights de alto valor.

- Devuelve entre 1 y 5 insights.

- relatedNodeIds solo puede contener
  IDs existentes en el grafo.

- relatedEdgeIds solo puede contener
  IDs existentes en el grafo.

- confidence representa la confianza
  estructural en el insight.

- suggestedAction debe explicar en
  lenguaje humano qué conviene hacer.

ACCIONES EJECUTABLES

Cada insight DEBE incluir una propiedad
"action".

Los tipos permitidos son:

${actionKinds.join(", ")}

Usa:

select_node
cuando el problema principal esté
concentrado en un nodo existente.

select_edge
cuando una relación existente necesite
ser inspeccionada.

prepare_connection
cuando detectes una conexión faltante
entre dos nodos existentes.

expand_node
cuando exista un hueco de conocimiento
que convenga investigar desde un nodo.

review_contradiction
cuando haya una contradicción potencial.

REGLAS PARA ACTION

Para select_node:

- nodeId debe contener un ID real.
- los otros identificadores deben ser null.

Para expand_node:

- nodeId debe contener un ID real.
- los demás identificadores deben ser null.

Para select_edge:

- edgeId debe contener un ID real.
- los demás identificadores deben ser null.

Para prepare_connection:

- sourceNodeId debe existir.
- targetNodeId debe existir.
- ambos deben ser diferentes.
- relationType debe indicar la relación
  semántica propuesta.
- nodeId y edgeId deben ser null.

Para review_contradiction:

- usa edgeId si existe una relación
  concreta que deba revisarse.

- si no existe una relación apropiada,
  utiliza nodeId con el nodo más relevante.

Nunca inventes identificadores.

RELACIONES PERMITIDAS

${relationTypes.join(", ")}
            `.trim(),
          },

          {
            role: "user",

            content: `
Analiza el siguiente Knowledge Graph:

${graphText}

Detecta los insights estructurales más
útiles y proporciona para cada uno una
acción ejecutable compatible con HELIX.
            `.trim(),
          },
        ],

        /*
         * =========================
         * STRUCTURED OUTPUT
         * =========================
         */

        text: {
          format: {
            type:
              "json_schema",

            name:
              "helix_graph_analysis_actions",

            strict: true,

            schema: {
              type: "object",

              properties: {
                insights: {
                  type: "array",

                  minItems: 1,
                  maxItems: 5,

                  items: {
                    type: "object",

                    properties: {
                      kind: {
                        type:
                          "string",

                        enum:
                          insightKinds,
                      },

                      title: {
                        type:
                          "string",

                        minLength: 1,
                      },

                      description: {
                        type:
                          "string",

                        minLength: 1,
                      },

                      confidence: {
                        type:
                          "number",

                        minimum: 0,
                        maximum: 1,
                      },

                      relatedNodeIds: {
                        type:
                          "array",

                        items: {
                          type:
                            "string",
                        },
                      },

                      relatedEdgeIds: {
                        type:
                          "array",

                        items: {
                          type:
                            "string",
                        },
                      },

                      suggestedAction: {
                        type:
                          "string",

                        minLength: 1,
                      },

                      /*
                       * =================
                       * AI-005
                       * ACTION
                       * =================
                       */

                      action: {
                        type:
                          "object",

                        properties: {
                          kind: {
                            type:
                              "string",

                            enum:
                              actionKinds,
                          },

                          nodeId: {
                            type: [
                              "string",
                              "null",
                            ],
                          },

                          edgeId: {
                            type: [
                              "string",
                              "null",
                            ],
                          },

                          sourceNodeId: {
                            type: [
                              "string",
                              "null",
                            ],
                          },

                          targetNodeId: {
                            type: [
                              "string",
                              "null",
                            ],
                          },

                          relationType: {
                            type: [
                              "string",
                              "null",
                            ],

                            enum: [
                              ...relationTypes,
                              null,
                            ],
                          },
                        },

                        required: [
                          "kind",
                          "nodeId",
                          "edgeId",
                          "sourceNodeId",
                          "targetNodeId",
                          "relationType",
                        ],

                        additionalProperties:
                          false,
                      },
                    },

                    required: [
                      "kind",
                      "title",
                      "description",
                      "confidence",
                      "relatedNodeIds",
                      "relatedEdgeIds",
                      "suggestedAction",
                      "action",
                    ],

                    additionalProperties:
                      false,
                  },
                },
              },

              required: [
                "insights",
              ],

              additionalProperties:
                false,
            },
          },
        },
      });

    /*
     * =========================
     * COMPROBAR RESPUESTA
     * =========================
     */

    if (
      !response.output_text
    ) {
      throw new Error(
        "OpenAI no devolvió análisis."
      );
    }

    /*
     * =========================
     * PARSE
     * =========================
     */

    const parsed =
      JSON.parse(
        response.output_text
      ) as {
        insights:
          RawInsight[];
      };

    /*
     * =========================
     * IDS VÁLIDOS
     * =========================
     */

    const validNodeIds =
      new Set(
        preparedGraph.nodes.map(
          (node) =>
            node.id
        )
      );

    const validEdgeIds =
      new Set(
        preparedGraph.edges.map(
          (edge) =>
            edge.id
        )
      );

    /*
     * =========================
     * SANITIZAR ACTION
     * =========================
     */

    function sanitizeAction(
      insight: RawInsight
    ) {
      const action =
        insight.action;

      const nodeId =
        action.nodeId &&
        validNodeIds.has(
          action.nodeId
        )
          ? action.nodeId
          : undefined;

      const edgeId =
        action.edgeId &&
        validEdgeIds.has(
          action.edgeId
        )
          ? action.edgeId
          : undefined;

      const sourceNodeId =
        action.sourceNodeId &&
        validNodeIds.has(
          action.sourceNodeId
        )
          ? action.sourceNodeId
          : undefined;

      const targetNodeId =
        action.targetNodeId &&
        validNodeIds.has(
          action.targetNodeId
        )
          ? action.targetNodeId
          : undefined;

      const relationType =
        action.relationType &&
        relationTypes.includes(
          action.relationType
        )
          ? action.relationType
          : undefined;

      /*
       * Validación específica
       * por tipo de acción.
       */

      switch (
        action.kind
      ) {
        case "select_node": {
          if (!nodeId) {
            return undefined;
          }

          return {
            kind:
              "select_node" as const,

            nodeId,
          };
        }

        case "expand_node": {
          if (!nodeId) {
            return undefined;
          }

          return {
            kind:
              "expand_node" as const,

            nodeId,
          };
        }

        case "select_edge": {
          if (!edgeId) {
            return undefined;
          }

          return {
            kind:
              "select_edge" as const,

            edgeId,
          };
        }

        case "prepare_connection": {
          if (
            !sourceNodeId ||
            !targetNodeId ||
            sourceNodeId ===
              targetNodeId ||
            !relationType
          ) {
            return undefined;
          }

          return {
            kind:
              "prepare_connection" as const,

            sourceNodeId,
            targetNodeId,
            relationType,
          };
        }

        case "review_contradiction": {
          /*
           * Preferimos edge
           * cuando exista.
           */

          if (edgeId) {
            return {
              kind:
                "review_contradiction" as const,

              edgeId,
            };
          }

          if (nodeId) {
            return {
              kind:
                "review_contradiction" as const,

              nodeId,
            };
          }

          return undefined;
        }

        default:
          return undefined;
      }
    }

    /*
     * =========================
     * FORMATO FINAL HELIX
     * =========================
     */

    const insights =
      parsed.insights.map(
        (insight) => ({
          id:
            crypto.randomUUID(),

          kind:
            insight.kind,

          title:
            insight.title,

          description:
            insight.description,

          confidence:
            insight.confidence,

          /*
           * Eliminamos IDs
           * inventados.
           */

          relatedNodeIds:
            insight.relatedNodeIds.filter(
              (id) =>
                validNodeIds.has(
                  id
                )
            ),

          relatedEdgeIds:
            insight.relatedEdgeIds.filter(
              (id) =>
                validEdgeIds.has(
                  id
                )
            ),

          suggestedAction:
            insight.suggestedAction,

          /*
           * Acción ya validada.
           */

          action:
            sanitizeAction(
              insight
            ),

          metadata: {
            generatedBy:
              "openai",

            model:
              "gpt-5.6-terra",

            generatedAt:
              new Date().toISOString(),

            analyzedNodes:
              preparedGraph.analyzedNodes,

            analyzedEdges:
              preparedGraph.analyzedEdges,

            actionsEnabled:
              true,
          },
        })
      );

    /*
     * =========================
     * RESPONSE
     * =========================
     */

    return NextResponse.json({
      insights,
    });
  } catch (error) {
    console.error(
      "HELIX GRAPH AI ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno durante el análisis del Knowledge Graph.",
      },
      {
        status: 500,
      }
    );
  }
}