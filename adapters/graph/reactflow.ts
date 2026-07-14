import type { Edge, Node } from "@xyflow/react";

import type { HelixGraph } from "@/engine/graph/types";
import { generateRadialLayout } from "@/engine/layout/service";
import GraphNode from "@/components/graph/GraphNode";

export interface ReactFlowGraph {
  nodes: Node[];
  edges: Edge[];
}

export function adaptHelixGraphToReactFlow(
  graph: HelixGraph
): ReactFlowGraph {
  const positions = generateRadialLayout(graph);

  const positionByNodeId = new Map(
    positions.map((position) => [position.nodeId, position])
  );

  const nodes: Node[] = graph.nodes.map((node) => {
    const position = positionByNodeId.get(node.id);

    if (!position) {
      throw new Error(
        `No se encontró una posición para el nodo ${node.id}.`
      );
    }

    return {
      id: node.id,
      position: {
        x: position.x,
        y: position.y,
      },
      data: {
        label: node.title,
        node,
        radius: position.radius,
        orbit: position.orbit,
      },
      type: "helixNode",
    };
  });

  const edges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    label: edge.type,
    animated: edge.strength >= 0.7,
    data: {
      edge,
    },
  }));

  return {
    nodes,
    edges,
  };
}