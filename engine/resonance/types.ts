export type ResonanceType =
  | "idea"
  | "science"
  | "music"
  | "code"
  | "visual"
  | "story"
  | "philosophy"
  | "research"
  | "scene"
  | "other";

export type ResonanceStatus =
  | "seed"
  | "growing"
  | "active"
  | "merged"
  | "archived";

export interface Resonance {
  id: string;
  universeId: string;
  authorId: string;

  title: string;
  content: string;

  type: ResonanceType;
  status: ResonanceStatus;

  energy: number;
  version: number;

  parentId: string | null;

  createdAt: string;
  updatedAt: string;
}