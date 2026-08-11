export type AISuggestionKind =
  | "idea"
  | "hypothesis"
  | "question"
  | "contradiction"
  | "evidence"
  | "connection";

export type AIRelationType =
  | "inspira"
  | "causa"
  | "depende_de"
  | "complementa"
  | "contradice"
  | "demuestra";

export interface AISuggestion {
  id: string;

  kind: AISuggestionKind;

  title: string;

  content: string;

  confidence: number;

  reasoning?: string;

  sourceNodeId: string;

  proposedRelationType?: AIRelationType;

  metadata?: Record<string, unknown>;
}

export interface GraphContextNode {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: number;
}

export interface GraphContextEvidence {
  type: string;
  content: string;
  created_at: string;
}

export interface GraphContextEdge {
  id: string;

  sourceNodeId: string;
  targetNodeId: string;

  type: AIRelationType;

  strength: number;
  confidence: number;

  description: string | null;

  evidence: GraphContextEvidence[];
}

export interface GraphNeighbor {
  node: GraphContextNode;

  relation: GraphContextEdge;

  direction:
    | "incoming"
    | "outgoing";
}

export interface GraphContext {
  focusNode: GraphContextNode;

  neighbors: GraphNeighbor[];

  incomingRelations: GraphContextEdge[];

  outgoingRelations: GraphContextEdge[];

  totalNodesInUniverse: number;

  totalEdgesInUniverse: number;
}

export interface ExpandIdeaInput {
  universeId: string;

  nodeId: string;

  title: string;
  content: string;
  status: string;

  graphContext?: GraphContext;
}

export interface ExpandIdeaResult {
  suggestions: AISuggestion[];
}
export type GraphInsightKind =
  | "knowledge_gap"
  | "potential_contradiction"
  | "weak_node"
  | "weak_relation"
  | "missing_connection";

export interface GraphInsight {
  id: string;

  kind: GraphInsightKind;

  title: string;

  description: string;

  confidence: number;

  relatedNodeIds: string[];

  relatedEdgeIds: string[];

  suggestedAction?: string;

  metadata?: Record<string, unknown>;
  
  action?: GraphInsightAction;
}

export interface AnalyzeGraphInput {
  universeId: string;

  graphContext: {
    nodes: GraphContextNode[];
    edges: GraphContextEdge[];
  };
}

export interface AnalyzeGraphResult {
  insights: GraphInsight[];
}
export type GraphInsightActionKind =
  | "select_node"
  | "select_edge"
  | "prepare_connection"
  | "expand_node"
  | "review_contradiction";

export interface GraphInsightAction {
  kind: GraphInsightActionKind;

  nodeId?: string;

  edgeId?: string;

  sourceNodeId?: string;

  targetNodeId?: string;

  relationType?: AIRelationType;
}