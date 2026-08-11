import OpenAI from "openai";
import { NextResponse } from "next/server";

import type {
  AIRelationType,
  AnalyzeGraphInput,
  GraphInsightKind,
} from "@/types/ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

/*
 * =========================
 * CONTROL DE COSTO / CONTEXTO
 * =========================
 */

const MAX_NODES = 40;
const MAX_EDGES = 80;

const MAX_NODE_CONTENT = 700;
const MAX_EDGE_DESCRIPTION = 400;

const MAX_EVIDENCE_PER_EDGE = 3;
const MAX_EVIDENCE_CONTENT = 500;

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

  return `${value.slice(0, maxLength)}…`;
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

        type: edge.type,

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

    if (!process.env.OPENAI_API_KEY) {
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

    if (
      body.graphContext.nodes.length === 0
    ) {
      return NextResponse.json(
        {
          insights: [],
        }
      );
    }

    /*
     * =========================
     * CONTEXTO LIMITADO
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

Tu objetivo es detectar oportunidades,
debilidades y anomalías estructurales
que puedan mejorar su calidad.

Debes buscar únicamente insights de
estos tipos:

${insightKinds.join(", ")}

DEFINICIONES

knowledge_gap:
Existe una pregunta abierta, afirmación
sin respaldo suficiente o región del
grafo que requiere conocimiento adicional.

potential_contradiction:
Dos nodos, relaciones o afirmaciones
parecen incompatibles o requieren
reconciliación. No afirmes que existe
una contradicción definitiva si el grafo
no ofrece evidencia suficiente.

weak_node:
Un nodo está aislado, poco desarrollado,
sin relaciones útiles o con contenido
demasiado débil para su papel actual.

weak_relation:
Una relación tiene confianza baja,
evidencia insuficiente, descripción
débil o una semántica que merece revisión.

missing_connection:
Dos o más nodos parecen justificar una
relación que actualmente no existe.

REGLAS

- Basa los insights exclusivamente en
  el grafo proporcionado.

- No inventes fuentes ni evidencia.

- No afirmes certeza científica.

- Usa confidence para expresar qué tan
  sólido es el insight basándote en la
  estructura disponible.

- relatedNodeIds solo puede contener IDs
  que existan en el grafo proporcionado.

- relatedEdgeIds solo puede contener IDs
  que existan en el grafo proporcionado.

- suggestedAction debe proponer una acción
  concreta que un usuario pueda ejecutar.

- Evita insights duplicados.

- Prioriza insights de alto valor.

- Devuelve entre 1 y 5 insights.

TIPOS DE RELACIÓN PRESENTES EN HELIX

${relationTypes.join(", ")}
            `.trim(),
          },

          {
            role: "user",

            content: `
Analiza el siguiente Knowledge Graph:

${graphText}

Detecta los insights estructurales más
útiles para mejorar este universo.
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
              "helix_graph_analysis",

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
                    },

                    required: [
                      "kind",
                      "title",
                      "description",
                      "confidence",
                      "relatedNodeIds",
                      "relatedEdgeIds",
                      "suggestedAction",
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
     * PARSE
     * =========================
     */

    if (!response.output_text) {
      throw new Error(
        "OpenAI no devolvió análisis."
      );
    }

    const parsed =
      JSON.parse(
        response.output_text
      ) as {
        insights: Array<{
          kind:
            GraphInsightKind;

          title:
            string;

          description:
            string;

          confidence:
            number;

          relatedNodeIds:
            string[];

          relatedEdgeIds:
            string[];

          suggestedAction:
            string;
        }>;
      };

    /*
     * =========================
     * SEGURIDAD DE REFERENCIAS
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

    const insights =
      parsed.insights.map(
        (insight) => ({
          id:
            crypto.randomUUID(),

          ...insight,

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
          },
        })
      );

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