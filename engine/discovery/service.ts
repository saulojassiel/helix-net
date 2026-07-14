import type { HelixGraph } from "../graph/types";

import {
  suggestConceptualConnections,
} from "../physics/suggestions";
import { detectCommunities } from "./communities";
import { detectBridgeNodes } from "./bridges";

import type {
  DiscoveryReport,
  IsolatedNodeInsight,
} from "./types";

export function analyzeGraph(
  graph: HelixGraph
): DiscoveryReport {

  const isolatedNodes: IsolatedNodeInsight[] = [];

  for (const node of graph.nodes) {

    const hasConnections = graph.edges.some(
      (edge) =>
        edge.sourceNodeId === node.id ||
        edge.targetNodeId === node.id
    );

    if (!hasConnections) {
      isolatedNodes.push({
        node,
        reason:
          "Este nodo todavía no participa en ninguna relación.",
      });
    }
  }

  const connectionSuggestions =
    suggestConceptualConnections(graph);
    const communities = detectCommunities(graph);
const bridgeNodes = detectBridgeNodes(graph, communities);

  return {
    isolatedNodes,

    connectionSuggestions,
    communities,
    bridgeNodes,

    metrics: {
      isolatedNodeCount:
        isolatedNodes.length,

      suggestionCount:
        connectionSuggestions.length,
         communityCount: communities.length,
    bridgeNodeCount: bridgeNodes.length,
    },
  };
}