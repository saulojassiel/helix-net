import type {
  AIProvider,
} from "@/services/AIService";

import type {
  ExpandIdeaInput,
  ExpandIdeaResult,
} from "@/types/ai";

interface ErrorResponse {
  error?: string;
}

export class ApiAIProvider
  implements AIProvider
{
  async expandIdea(
    input: ExpandIdeaInput
  ): Promise<ExpandIdeaResult> {
    const response = await fetch(
      "/api/ai/expand",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          input
        ),
      }
    );

    if (!response.ok) {
      let message =
        "No se pudo conectar con HELIX AI.";

      try {
        const errorData =
          (await response.json()) as ErrorResponse;

        if (errorData.error) {
          message =
            errorData.error;
        }
      } catch {
        // Conservamos el mensaje
        // genérico si la respuesta
        // no contiene JSON.
      }

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
        "HELIX AI devolvió una respuesta inválida."
      );
    }

    return data;
  }
}