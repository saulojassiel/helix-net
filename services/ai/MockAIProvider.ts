import type {
  AIProvider,
} from "@/services/AIService";

import type {
  AISuggestion,
  AnalyzeGraphInput,
  AnalyzeGraphResult,
  ExpandIdeaInput,
  ExpandIdeaResult,
  GraphInsight,
} from "@/types/ai";

function createId() {
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
        id: createId(),

        kind: "hypothesis",

        title: "Hipótesis derivada",

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
        id: createId(),

        kind: "question",

        title: "Pregunta crítica",

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
        id: createId(),

        kind: "idea",

        title: "Extensión conceptual",

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
        id: createId(),

        kind: "evidence",

        title: "Evidencia necesaria",

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

  async analyzeGraph(
    input: AnalyzeGraphInput
  ): Promise<AnalyzeGraphResult> {
    const {
      nodes,
      edges,
    } = input.graphContext;

    const insights: GraphInsight[] = [];

    /*
     * =========================
     * NODOS AISLADOS
     * =========================
     */

    const connectedNodeIds =
      new Set<string>();

    for (const edge of edges) {
      connectedNodeIds.add(
        edge.sourceNodeId
      );

      connectedNodeIds.add(
        edge.targetNodeId
      );
    }

    const isolatedNode =
      nodes.find(
        (node) =>
          !connectedNodeIds.has(
            node.id
          )
      );

    if (isolatedNode) {
      insights.push({
        id: createId(),

        kind: "weak_node",

        title:
          "Nodo aislado detectado",

        description:
          `"${isolatedNode.title}" no tiene conexiones con otros nodos del grafo.`,

        confidence: 0.98,

        relatedNodeIds: [
          isolatedNode.id,
        ],

        relatedEdgeIds: [],

        suggestedAction:
          "Buscar conceptos relacionados y evaluar si este nodo debe conectarse, desarrollarse o archivarse.",
      });
    }

    /*
     * =========================
     * RELACIÓN DÉBIL
     * =========================
     */

    const weakEdge =
      edges.find(
        (edge) =>
          edge.confidence < 0.5
      );

    if (weakEdge) {
      insights.push({
        id: createId(),

        kind: "weak_relation",

        title:
          "Relación con baja confianza",

        description:
          `Existe una relación "${weakEdge.type}" con confianza inferior al 50%.`,

        confidence: 0.95,

        relatedNodeIds: [
          weakEdge.sourceNodeId,
          weakEdge.targetNodeId,
        ],

        relatedEdgeIds: [
          weakEdge.id,
        ],

        suggestedAction:
          "Agregar evidencia o revisar si la relación debe modificarse.",
      });
    }

    /*
     * =========================
     * HUECO DE CONOCIMIENTO
     * =========================
     */

    const questionNode =
      nodes.find(
        (node) =>
          node.status ===
          "QUESTION"
      );

    if (questionNode) {
      insights.push({
        id: createId(),

        kind: "knowledge_gap",

        title:
          "Pregunta abierta en el grafo",

        description:
          `"${questionNode.title}" representa una pregunta que podría señalar conocimiento todavía no resuelto.`,

        confidence: 0.8,

        relatedNodeIds: [
          questionNode.id,
        ],

        relatedEdgeIds: [],

        suggestedAction:
          "Buscar evidencia, hipótesis o nodos que puedan responder esta pregunta.",
      });
    }

    /*
     * =========================
     * CONTRADICCIÓN
     * =========================
     */

    const contradiction =
      edges.find(
        (edge) =>
          edge.type ===
          "contradice"
      );

    if (contradiction) {
      insights.push({
        id: createId(),

        kind:
          "potential_contradiction",

        title:
          "Contradicción que merece revisión",

        description:
          "El grafo contiene una relación de contradicción que podría requerir evidencia adicional.",

        confidence: 0.78,

        relatedNodeIds: [
          contradiction.sourceNodeId,
          contradiction.targetNodeId,
        ],

        relatedEdgeIds: [
          contradiction.id,
        ],

        suggestedAction:
          "Comparar la evidencia de ambos nodos y determinar bajo qué condiciones puede sostenerse cada afirmación.",
      });
    }

    /*
     * =========================
     * CONEXIÓN FALTANTE
     * =========================
     */

    if (
      nodes.length >= 2 &&
      edges.length <
        nodes.length - 1
    ) {
      insights.push({
        id: createId(),

        kind:
          "missing_connection",

        title:
          "Posible estructura desconectada",

        description:
          "El número de relaciones es bajo respecto al número de nodos, lo que puede indicar conceptos todavía no integrados.",

        confidence: 0.7,

        relatedNodeIds:
          nodes
            .slice(0, 2)
            .map(
              (node) =>
                node.id
            ),

        relatedEdgeIds: [],

        suggestedAction:
          "Examinar si existen relaciones semánticas faltantes entre conceptos actualmente separados.",
      });
    }

    /*
     * Garantizamos una respuesta
     * útil incluso en un grafo
     * pequeño o muy limpio.
     */

    if (
      insights.length === 0
    ) {
      insights.push({
        id: createId(),

        kind:
          "knowledge_gap",

        title:
          "Explorar profundidad adicional",

        description:
          "No se detectaron anomalías estructurales evidentes en esta prueba.",

        confidence: 0.6,

        relatedNodeIds:
          nodes
            .slice(0, 1)
            .map(
              (node) =>
                node.id
            ),

        relatedEdgeIds: [],

        suggestedAction:
          "Añadir evidencia o nuevas hipótesis para aumentar la profundidad del Knowledge Graph.",
      });
    }

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 600)
    );

    return {
      insights:
        insights.slice(0, 5),
    };
  }
}