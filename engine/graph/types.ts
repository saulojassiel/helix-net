import type { HelixNode } from "../node/types";
import type { HelixEdge } from "../edge/types";

export interface GraphMetadata {
  title: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  averageConnections: number;
  density: number;
  evolutionIndex: number;
}

export interface HelixGraph {
  id: string;
  universeId: string;

  nodes: HelixNode[];
  edges: HelixEdge[];

  metadata: GraphMetadata;
  metrics: GraphMetrics;
}