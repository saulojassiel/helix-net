import type {
  AIProvider,
} from "@/services/AIService";

import type {
  AISuggestion,
  ExpandIdeaInput,
  ExpandIdeaResult,
} from "@/types/ai";

function createSuggestionId() {
  return crypto.randomUUID();
}

export class MockAIProvider
  implements AIProvider
{
  async expandIdea(
    input: ExpandIdeaInput
  ): Promise<ExpandIdeaResult> {
    const suggestions: AISuggestion[] = [
      {
        id: createSuggestionId(),

        kind: "hypothesis",

        title:
          "Hipótesis derivada",

        content:
          `Si "${input.title}" es correcta, ¿qué consecuencia observable debería producir?`,

        confidence: 0.82,

        reasoning:
          "Convierte la idea original en una afirmación comprobable.",

        sourceNodeId:
          input.nodeId,

        proposedRelationType:
          "demuestra",
      },

      {
        id: createSuggestionId(),

        kind: "question",

        title:
          "Pregunta crítica",

        content:
          `¿Qué condición podría hacer que "${input.title}" dejara de ser válida?`,

        confidence: 0.76,

        reasoning:
          "Busca límites, excepciones y supuestos ocultos.",

        sourceNodeId:
          input.nodeId,

        proposedRelationType:
          "contradice",
      },

      {
        id: createSuggestionId(),

        kind: "idea",

        title:
          "Extensión conceptual",

        content:
          `Explorar una versión más amplia de "${input.title}" y relacionarla con otros elementos del universo.`,

        confidence: 0.71,

        reasoning:
          "Expande el espacio conceptual alrededor del nodo seleccionado.",

        sourceNodeId:
          input.nodeId,

        proposedRelationType:
          "inspira",
      },

      {
        id: createSuggestionId(),

        kind: "evidence",

        title:
          "Evidencia necesaria",

        content:
          `Identificar qué datos, fuentes o experimentos podrían respaldar "${input.title}".`,

        confidence: 0.88,

        reasoning:
          "Transforma la idea en una estructura susceptible de validación.",

        sourceNodeId:
          input.nodeId,

        proposedRelationType:
          "demuestra",
      },
    ];

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 500)
    );

    return {
      suggestions,
    };
  }
}