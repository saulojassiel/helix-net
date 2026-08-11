import type {
  AIProvider,
} from "@/services/AIService";

import type {
  AnalyzeGraphInput,
  AnalyzeGraphResult,
  ExpandIdeaInput,
  ExpandIdeaResult,
} from "@/types/ai";

interface ErrorResponse {
  error?: string;
}

async function readErrorMessage(
  response: Response,
  fallback: string
) {
  try {
    const data =
      (await response.json()) as ErrorResponse;

    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export class ApiAIProvider
  implements AIProvider
{
  /*
   * =========================
   * EXPANDIR IDEA
   * =========================
   */

  async expandIdea(
    input: ExpandIdeaInput
  ): Promise<ExpandIdeaResult> {
    const response =
      await fetch(
        "/api/ai/expand",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              input
            ),
        }
      );

    if (!response.ok) {
      const message =
        await readErrorMessage(
          response,
          "No se pudo expandir la idea."
        );

      throw new Error(
        message
      );
    }

    const data =
      (await response.json()) as ExpandIdeaResult;

    if (
      !Array.isArray(
        data.suggestions
      )
    ) {
      throw new Error(
        "HELIX AI devolvió sugerencias inválidas."
      );
    }

    return data;
  }

  /*
   * =========================
   * ANALIZAR GRAFO
   * =========================
   */

  async analyzeGraph(
    input: AnalyzeGraphInput
  ): Promise<AnalyzeGraphResult> {
    const response =
      await fetch(
        "/api/ai/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              input
            ),
        }
      );

    if (!response.ok) {
      const message =
        await readErrorMessage(
          response,
          "No se pudo analizar el Knowledge Graph."
        );

      throw new Error(
        message
      );
    }

    const data =
      (await response.json()) as AnalyzeGraphResult;

    if (
      !Array.isArray(
        data.insights
      )
    ) {
      throw new Error(
        "HELIX AI devolvió insights inválidos."
      );
    }

    return data;
  }
}