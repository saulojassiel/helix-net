import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
 * =========================
 * LIMITES
 * =========================
 */

const MAX_TEXT_LENGTH = 6000;

function normalizeInput(
  value: unknown
) {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      MAX_TEXT_LENGTH
    );
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
      await request.json();

    const text =
      normalizeInput(
        body?.text
      );

    if (!text) {
      return NextResponse.json(
        {
          error:
            "Se necesita texto para generar el embedding.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================
     * OPENAI EMBEDDINGS
     * =========================
     */

    const response =
      await openai.embeddings.create({
        model:
          "text-embedding-3-small",

        input:
          text,

        encoding_format:
          "float",
      });

    const embedding =
      response.data[0]?.embedding;

    if (
      !embedding ||
      embedding.length !==
        1536
    ) {
      throw new Error(
        "OpenAI devolvió un embedding inválido."
      );
    }

    /*
     * =========================
     * RESPONSE
     * =========================
     */

    return NextResponse.json({
      embedding,

      model:
        response.model,

      dimensions:
        embedding.length,

      usage: {
        promptTokens:
          response.usage
            .prompt_tokens,

        totalTokens:
          response.usage
            .total_tokens,
      },
    });
  } catch (error) {
    console.error(
      "HELIX EMBEDDING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo generar el embedding.",
      },
      {
        status: 500,
      }
    );
  }
}