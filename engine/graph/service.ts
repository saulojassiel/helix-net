import type { HelixGraph } from "./types";
import type { HelixNode } from "../node/types";
import type { HelixEdge } from "../edge/types";

interface CreateGraphInput {
  universeId: string;
  title: string;
  description?: string;
}

export function createGraph(input: CreateGraphInput): HelixGraph {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    universeId: input.universeId,

    nodes: [],
    edges: [],

    metadata: {
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      version: 1,
      createdAt: now,
      updatedAt: now,
    },

    metrics: {
      nodeCount: 0,
      edgeCount: 0,
      averageConnections: 0,
      density: 0,
      evolutionIndex: 0,
    },
  };
}

export function addNodeToGraph(
  graph: HelixGraph,
  node: HelixNode
): HelixGraph {
  if (node.universeId !== graph.universeId) {
    throw new Error(
      "El nodo debe pertenecer al mismo universo que el grafo."
    );
  }

  if (graph.nodes.some((currentNode) => currentNode.id === node.id)) {
    throw new Error("El nodo ya existe dentro del grafo.");
  }

  const nodes = [...graph.nodes, node];

  return updateGraphMetrics({
    ...graph,
    nodes,
    metadata: {
      ...graph.metadata,
      version: graph.metadata.version + 1,
      updatedAt: new Date().toISOString(),
    },
  });
}

export function addEdgeToGraph(
  graph: HelixGraph,
  edge: HelixEdge
): HelixGraph {
  if (edge.universeId !== graph.universeId) {
    throw new Error(
      "La conexión debe pertenecer al mismo universo que el grafo."
    );
  }

  const sourceExists = graph.nodes.some(
    (node) => node.id === edge.sourceNodeId
  );

  const targetExists = graph.nodes.some(
    (node) => node.id === edge.targetNodeId
  );

  if (!sourceExists || !targetExists) {
    throw new Error(
      "Los dos nodos de la conexión deben existir dentro del grafo."
    );
  }

  if (graph.edges.some((currentEdge) => currentEdge.id === edge.id)) {
    throw new Error("La conexión ya existe dentro del grafo.");
  }

  const edges = [...graph.edges, edge];

  return updateGraphMetrics({
    ...graph,
    edges,
    metadata: {
      ...graph.metadata,
      version: graph.metadata.version + 1,
      updatedAt: new Date().toISOString(),
    },
  });
}

export function updateGraphMetrics(
  graph: HelixGraph
): HelixGraph {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  const averageConnections =
    nodeCount === 0 ? 0 : (edgeCount * 2) / nodeCount;

  const maximumPossibleEdges =
    nodeCount <= 1 ? 0 : (nodeCount * (nodeCount - 1)) / 2;

  const density =
    maximumPossibleEdges === 0
      ? 0
      : edgeCount / maximumPossibleEdges;

  return {
    ...graph,
    metrics: {
      ...graph.metrics,
      nodeCount,
      edgeCount,
      averageConnections,
      density,
    },
  };
}