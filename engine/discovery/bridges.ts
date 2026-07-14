import type { HelixGraph } from "../graph/types";

export interface BridgeNodeInsight {
  nodeId: string;
  connectedCommunityIds: string[];
  bridgeScore: number;
}

export interface CommunityReference {
  id: string;
  nodeIds: string[];
}

export function detectBridgeNodes(
  graph: HelixGraph,
  communities: CommunityReference[]
): BridgeNodeInsight[] {
  const communityByNodeId = new Map<string, string>();

  for (const community of communities) {
    for (const nodeId of community.nodeIds) {
      communityByNodeId.set(nodeId, community.id);
    }
  }

  const results: BridgeNodeInsight[] = [];

  for (const node of graph.nodes) {
    const connectedCommunityIds = new Set<string>();

    for (const edge of graph.edges) {
      let neighborId: string | null = null;

      if (edge.sourceNodeId === node.id) {
        neighborId = edge.targetNodeId;
      } else if (edge.targetNodeId === node.id) {
        neighborId = edge.sourceNodeId;
      }

      if (!neighborId) {
        continue;
      }

      const communityId = communityByNodeId.get(neighborId);

      if (communityId) {
        connectedCommunityIds.add(communityId);
      }
    }

    if (connectedCommunityIds.size < 2) {
      continue;
    }

    results.push({
      nodeId: node.id,
      connectedCommunityIds: [...connectedCommunityIds],
      bridgeScore: connectedCommunityIds.size,
    });
  }

  return results.sort(
    (left, right) => right.bridgeScore - left.bridgeScore
  );
}