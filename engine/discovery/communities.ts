import type { HelixGraph } from "../graph/types";

export interface GraphCommunity {
  id: string;

  nodeIds: string[];

  size: number;
}

export function detectCommunities(
  graph: HelixGraph
): GraphCommunity[] {

  const visited = new Set<string>();

  const communities: GraphCommunity[] = [];

  function walk(
    nodeId: string,
    bucket: string[]
  ) {
    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);

    bucket.push(nodeId);

    const neighbors = graph.edges.flatMap(edge => {

      if (edge.sourceNodeId === nodeId) {
        return [edge.targetNodeId];
      }

      if (edge.targetNodeId === nodeId) {
        return [edge.sourceNodeId];
      }

      return [];

    });

    for (const neighbor of neighbors) {
      walk(neighbor, bucket);
    }
  }

  for (const node of graph.nodes) {

    if (visited.has(node.id)) {
      continue;
    }

    const bucket: string[] = [];

    walk(node.id, bucket);

    communities.push({

      id: crypto.randomUUID(),

      nodeIds: bucket,

      size: bucket.length,

    });

  }

  return communities;

}