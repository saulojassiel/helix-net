import type { HelixGraph } from "../graph/types";
import type { NodePosition } from "./types";

export function generateRadialLayout(
  graph: HelixGraph
): NodePosition[] {
  const positions: NodePosition[] = [];

  const radius = 250;

  graph.nodes.forEach((node, index) => {
    const angle =
      (index / Math.max(graph.nodes.length, 1)) *
      Math.PI *
      2;

    positions.push({
      nodeId: node.id,

      x: Math.cos(angle) * radius,

      y: Math.sin(angle) * radius,

      z: 0,

      radius: 40,

      orbit: 1,
    });
  });

  return positions;
}