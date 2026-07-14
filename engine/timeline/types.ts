export type HelixEventType =
  | "universe_created"
  | "node_created"
  | "node_updated"
  | "node_status_changed"
  | "node_dna_changed"
  | "edge_created"
  | "edge_removed"
  | "nodes_merged"
  | "node_archived"
  | "energy_changed"
  | "ai_suggestion_created"
  | "ai_suggestion_accepted";

export interface HelixEvent<TPayload = unknown> {
  id: string;

  universeId: string;
  graphId: string;

  type: HelixEventType;

  actorId: string;
  actorType: "human" | "ai" | "system";

  payload: TPayload;

  createdAt: string;
}

export interface NodeCreatedPayload {
  nodeId: string;
  title: string;
  nodeType: string;
}

export interface EdgeCreatedPayload {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: string;
}

export interface NodeStatusChangedPayload {
  nodeId: string;
  previousStatus: string;
  nextStatus: string;
}

export interface EnergyChangedPayload {
  nodeId: string;
  previousEnergy: number;
  nextEnergy: number;
  reason: string;
}