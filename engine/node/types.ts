export type NodeType =
  | "idea"
  | "text"
  | "image"
  | "music"
  | "video"
  | "code"
  | "research"
  | "equation"
  | "character"
  | "scene"
  | "world"
  | "tool"
  | "other";

export type NodeStatus =
  | "seed"
  | "growing"
  | "active"
  | "merged"
  | "archived";

export interface CreativeDNA {
  themes: string[];
  emotions: string[];
  symbols: string[];
  disciplines: string[];
  visualStyle: string[];
  narrativeRules: string[];
}

export interface HelixNode {
  id: string;
  universeId: string;
  authorId: string;

  title: string;
  content: string;

  type: NodeType;
  status: NodeStatus;

  energy: number;
  evolutionIndex: number;
  version: number;

  dna: CreativeDNA;

  createdAt: string;
  updatedAt: string;
}