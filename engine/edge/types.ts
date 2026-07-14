export type EdgeType =
  | "inspires"
  | "expands"
  | "contradicts"
  | "explains"
  | "continues"
  | "visualizes"
  | "soundtracks"
  | "implements"
  | "remixes"
  | "merges"
  | "references"
  | "other";

export interface HelixEdge {
  id: string;

  universeId: string;

  sourceNodeId: string;
  targetNodeId: string;

  creatorId: string;

  type: EdgeType;

  strength: number;
  confidence: number;

  description: string | null;

  createdAt: string;
  updatedAt: string;
}