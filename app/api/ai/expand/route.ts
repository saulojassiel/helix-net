import OpenAI from "openai";
import { NextResponse } from "next/server";

import type {
  AIRelationType,
  GraphContext,
} from "@/types/ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const relationTypes: AIRelationType[] = [
  "inspira",
  "causa",
  "depende_de",
  "complementa",
  "contradice",
  "demuestra",
];

const suggestionKinds = [
  "idea",
  "hypothesis",
  "question",
  "contradiction",
  "evidence",
  "connection",
] as const;

/*
 * =========================
 * LIMITES DE CONTEXTO
 * =========================
 *
 * Evitamos enviar todo el
 * universo a OpenAI.
 *
 * Esto reduce:
 * - tokens
 * - costo
 * - ruido contextual
 */

const MAX_NEIGHBORS = 12;
const MAX_EVIDENCE_PER_EDGE = 4;
const MAX_CONTENT_LENGTH = 1200;
const MAX_DESCRIPTION_LENGTH = 600;

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

function prepareGraphContext(
  graphContext?: GraphContext
) {
  if (!graphContext) {
    return null;
  }

  const neighbors =
    graphContext.neighbors
      .slice(0, MAX_NEIGHBORS)
      .map((neighbor) => ({
        direction:
          neighbor.direction,

        node: {
          id:
            neighbor.node.id,

          title:
            neighbor.node.title,

          content:
            limitText(
              neighbor.node.content,
              MAX_CONTENT_LENGTH
            ),

          status:
            neighbor.node.status,

          priority:
            neighbor.node.priority,
        },

        relation: {
          id:
            neighbor.relation.id,

          type:
            neighbor.relation.type,

          strength:
            neighbor.relation.strength,

          confidence:
            neighbor.relation.confidence,

          description:
            limitText(
              neighbor.relation.description,
              MAX_DESCRIPTION_LENGTH
            ),

          evidence:
            neighbor.relation.evidence
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
                      MAX_CONTENT_LENGTH
                    ),

                  created_at:
                    evidence.created_at,
                })
              ),
        },
      }));

  return {
    focusNode: {
      id:
        graphContext.focusNode.id,

      title:
        graphContext.focusNode.title,

      content:
        limitText(
          graphContext.focusNode.content,
          MAX_CONTENT_LENGTH
        ),

      status:
        graphContext.focusNode.status,

      priority:
        graphContext.focusNode.priority,
    },

    neighbors,

    totalNodesInUniverse:
      graphContext.totalNodesInUniverse,

    totalEdgesInUniverse:
      graphContext.totalEdgesInUniverse,
  };
}

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
      await request.json();

    const {
      universeId,
      nodeId,
      title,
      content,
      status,
      graphContext,
    } = body as {
      universeId?: string;
      nodeId?: string;
      title?: string;
      content?: string;
      status?: string;
      graphContext?: GraphContext;
    };

    if (
      !universeId ||
      !nodeId ||
      !title
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan datos para expandir la idea.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================
     * CONTEXTO CONTROLADO
     * =========================
     */

    const preparedGraphContext =
      prepareGraphContext(
        graphContext
      );

    const graphContextText =
      preparedGraphContext
        ? JSON.stringify(
            preparedGraphContext,
            null,
            2
          )
        : "No hay contexto adicional del grafo.";

    /*
     * =========================
     * OPENAI
     * =========================
     */

    const response =
      await openai.responses.create({
        model:
          "gpt-5.6-terra",

        /*
         * low mantiene un buen
         * balance entre calidad,
         * latencia y gasto.
         */

        reasoning: {
          effort: "low",
        },

        /*
         * Si no quieres que estas
         * respuestas queden
         * almacenadas por defecto
         * en la API:
         */

        store: false,

        input: [
          {
            role: "system",

            content: `
Eres HELIX AI, el motor de expansión
de un Knowledge Graph.

Tu trabajo NO es simplemente generar
texto relacionado.

Debes razonar sobre la estructura del
grafo alrededor del nodo seleccionado.

Recibirás:

- un nodo principal;
- nodos vecinos;
- relaciones entrantes y salientes;
- fuerza de relaciones;
- confianza de relaciones;
- evidencia disponible;
- prioridad y estado de los nodos.

OBJETIVO

Genera exactamente 4 sugerencias
intelectualmente útiles que mejoren
el Knowledge Graph.

Debes priorizar:

1. huecos de conocimiento;
2. hipótesis comprobables;
3. preguntas críticas;
4. contradicciones plausibles;
5. evidencia que falta;
6. conexiones conceptuales nuevas.

REGLAS IMPORTANTES

- No repitas ideas que ya aparezcan
  claramente entre los vecinos.

- No propongas como nueva una conexión
  semántica que ya exista explícitamente
  en el contexto.

- Usa las relaciones existentes para
  entender la estructura conceptual.

- Si existe evidencia débil o confianza
  baja, puedes proponer validación.

- Si encuentras una contradicción,
  diferénciala claramente de un hecho.

- No presentes especulación como hecho.

- La propiedad "confidence" representa
  confianza en que la sugerencia es útil
  para el grafo, NO certeza científica.

- Las sugerencias deben ser concisas,
  específicas y accionables.

TIPOS DE SUGERENCIA PERMITIDOS

${suggestionKinds.join(", ")}

RELACIONES PERMITIDAS

${relationTypes.join(", ")}
            `.trim(),
          },

          {
            role: "user",

            content: `
UNIVERSO
${universeId}

NODO SELECCIONADO

ID:
${nodeId}

ESTADO:
${status ?? "IDEA"}

TÍTULO:
${title}

CONTENIDO:
${
  limitText(
    content,
    MAX_CONTENT_LENGTH
  ) || "(sin contenido)"
}

CONTEXTO LOCAL DEL KNOWLEDGE GRAPH

${graphContextText}

Genera exactamente cuatro expansiones
que aporten conocimiento nuevo respecto
a lo que ya existe en este contexto.
            `.trim(),
          },
        ],

        /*
         * Structured Outputs.
         */

        text: {
          format: {
            type:
              "json_schema",

            name:
              "helix_graph_expansion",

            strict: true,

            schema: {
              type: "object",

              properties: {
                suggestions: {
                  type: "array",

                  minItems: 4,
                  maxItems: 4,

                  items: {
                    type: "object",

                    properties: {
                      kind: {
                        type:
                          "string",

                        enum:
                          suggestionKinds,
                      },

                      title: {
                        type:
                          "string",

                        minLength: 1,
                      },

                      content: {
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

                      reasoning: {
                        type:
                          "string",

                        minLength: 1,
                      },

                      proposedRelationType:
                        {
                          type:
                            "string",

                          enum:
                            relationTypes,
                        },
                    },

                    required: [
                      "kind",
                      "title",
                      "content",
                      "confidence",
                      "reasoning",
                      "proposedRelationType",
                    ],

                    additionalProperties:
                      false,
                  },
                },
              },

              required: [
                "suggestions",
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
        "OpenAI no devolvió contenido."
      );
    }

    const parsed =
      JSON.parse(
        response.output_text
      ) as {
        suggestions: Array<{
          kind:
            | "idea"
            | "hypothesis"
            | "question"
            | "contradiction"
            | "evidence"
            | "connection";

          title: string;

          content: string;

          confidence: number;

          reasoning: string;

          proposedRelationType:
            AIRelationType;
        }>;
      };

    /*
     * =========================
     * HELIX FORMAT
     * =========================
     */

    const suggestions =
      parsed.suggestions.map(
        (suggestion) => ({
          id:
            crypto.randomUUID(),

          ...suggestion,

          sourceNodeId:
            nodeId,

          metadata: {
            generatedBy:
              "openai",

            model:
              "gpt-5.6-terra",

            graphAware:
              Boolean(
                preparedGraphContext
              ),

            generatedAt:
              new Date().toISOString(),
          },
        })
      );

    return NextResponse.json({
      suggestions,
    });
  } catch (error) {
    console.error(
      "HELIX AI ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno de HELIX AI.",
      },
      {
        status: 500,
      }
    );
  }
}