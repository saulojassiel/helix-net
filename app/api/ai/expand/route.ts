import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const relationTypes = [
  "inspira",
  "causa",
  "depende_de",
  "complementa",
  "contradice",
  "demuestra",
] as const;

const suggestionKinds = [
  "idea",
  "hypothesis",
  "question",
  "contradiction",
  "evidence",
  "connection",
] as const;

export async function POST(
  request: Request
) {
  try {
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

    const body = await request.json();

    const {
      universeId,
      nodeId,
      title,
      content,
      status,
    } = body;

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

    const response =
      await openai.responses.create({
        model: "gpt-5.6-terra",

        reasoning: {
          effort: "low",
        },

        input: [
          {
            role: "system",

            content: `
Eres el motor de expansión conceptual de HELIX.

HELIX es un Knowledge Graph donde las ideas
se representan como nodos y las relaciones
semánticas como conexiones.

Tu tarea es analizar un nodo y proponer
exactamente 4 expansiones intelectualmente
útiles.

Las sugerencias deben:

- aportar información nueva;
- evitar repetir la idea original;
- buscar consecuencias, preguntas,
  hipótesis, contradicciones o evidencia;
- ser concisas;
- ser útiles para construir un grafo
  de conocimiento;
- distinguir claramente hechos,
  hipótesis y preguntas;
- no presentar especulación como hecho.

Los tipos de sugerencia permitidos son:

${suggestionKinds.join(", ")}

Las relaciones permitidas son:

${relationTypes.join(", ")}
            `.trim(),
          },

          {
            role: "user",

            content: `
UNIVERSO:
${universeId}

NODO:
${nodeId}

ESTADO:
${status}

TÍTULO:
${title}

CONTENIDO:
${content || "(sin contenido)"}

Genera cuatro expansiones para este nodo.
            `.trim(),
          },
        ],

        text: {
          format: {
            type: "json_schema",

            name:
              "helix_expand_idea",

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
                        type: "string",
                        enum:
                          suggestionKinds,
                      },

                      title: {
                        type: "string",
                      },

                      content: {
                        type: "string",
                      },

                      confidence: {
                        type: "number",
                        minimum: 0,
                        maximum: 1,
                      },

                      reasoning: {
                        type: "string",
                      },

                      proposedRelationType: {
                        type: "string",
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

    const parsed =
      JSON.parse(
        response.output_text
      );

    const suggestions =
      parsed.suggestions.map(
        (
          suggestion: {
            kind: string;
            title: string;
            content: string;
            confidence: number;
            reasoning: string;
            proposedRelationType: string;
          }
        ) => ({
          id:
            crypto.randomUUID(),

          ...suggestion,

          sourceNodeId:
            nodeId,
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