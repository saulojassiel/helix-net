import type { EdgeType, HelixEdge } from "./types";
import { validateEdgeInput } from "./validation";

export interface CreateEdgeInput {
  universeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  creatorId: string;
  type?: EdgeType;
  strength?: number;
  confidence?: number;
  description?: string | null;
}

export function createEdgeModel(
  input: CreateEdgeInput
): HelixEdge {
  const validation = validateEdgeInput(input);

  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),

    universeId: input.universeId,

    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,

    creatorId: input.creatorId,

    type: input.type ?? "references",

    strength: input.strength ?? 1,
    confidence: input.confidence ?? 1,

    description: input.description?.trim() || null,

    createdAt: now,
    updatedAt: now,
  };
}