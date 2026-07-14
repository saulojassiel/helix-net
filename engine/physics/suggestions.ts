import type { HelixGraph } from "../graph/types";
import type { HelixNode } from "../node/types";

import {
  calculateConceptualAttraction,
  type ConceptualAttractionResult,
} from "./attraction";

export interface ConnectionSuggestion {
  sourceNode: HelixNode;
  targetNode: HelixNode;
  attraction: ConceptualAttractionResult;
}

export interface SuggestConnectionsOptions {
  minimumScore?: number;
  maximumResults?: number;
}

function connectionAlreadyExists(
  graph: HelixGraph,
  sourceNodeId: string,
  targetNodeId: string
): boolean {
  return graph.edges.some((edge) => {
    const sameDirection =
      edge.sourceNodeId === sourceNodeId &&
      edge.targetNodeId === targetNodeId;

    const oppositeDirection =
      edge.sourceNodeId === targetNodeId &&
      edge.targetNodeId === sourceNodeId;

    return sameDirection || oppositeDirection;
  });
}

export function suggestConceptualConnections(
  graph: HelixGraph,
  options: SuggestConnectionsOptions = {}
): ConnectionSuggestion[] {
  const minimumScore = options.minimumScore ?? 0.3;
  const maximumResults = options.maximumResults ?? 10;

  const suggestions: ConnectionSuggestion[] = [];

  for (
    let sourceIndex = 0;
    sourceIndex < graph.nodes.length;
    sourceIndex++
  ) {
    for (
      let targetIndex = sourceIndex + 1;
      targetIndex < graph.nodes.length;
      targetIndex++
    ) {
      const sourceNode = graph.nodes[sourceIndex];
      const targetNode = graph.nodes[targetIndex];

      if (
        connectionAlreadyExists(
          graph,
          sourceNode.id,
          targetNode.id
        )
      ) {
        continue;
      }

      const attraction = calculateConceptualAttraction(
        sourceNode,
        targetNode
      );

      if (attraction.score < minimumScore) {
        continue;
      }

      suggestions.push({
        sourceNode,
        targetNode,
        attraction,
      });
    }
  }

  return suggestions
    .sort(
      (left, right) =>
        right.attraction.score - left.attraction.score
    )
    .slice(0, maximumResults);
}