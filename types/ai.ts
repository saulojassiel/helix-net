export type AISuggestionKind =
  | "idea"
  | "hypothesis"
  | "question"
  | "contradiction"
  | "evidence"
  | "connection";

export interface AISuggestion {
  id: string;

  kind: AISuggestionKind;

  title: string;

  content: string;

  confidence: number;

  reasoning?: string;

  sourceNodeId: string;

  proposedRelationType?:
    | "inspira"
    | "causa"
    | "depende_de"
    | "complementa"
    | "contradice"
    | "demuestra";

  metadata?: Record<string, unknown>;
}

export interface ExpandIdeaInput {
  universeId: string;
  nodeId: string;
  title: string;
  content: string;
  status: string;
}

export interface ExpandIdeaResult {
  suggestions: AISuggestion[];
}