import type {
  Resonance,
  ResonanceStatus,
  ResonanceType,
} from "./types";

import { validateResonanceInput } from "./validation";

interface CreateResonanceInput {
  universeId: string;
  authorId: string;
  title: string;
  content: string;
  type?: ResonanceType;
  parentId?: string | null;
}

export function createResonanceModel(
  input: CreateResonanceInput
): Resonance {
  const validation = validateResonanceInput(input);

  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    universeId: input.universeId,
    authorId: input.authorId,

    title: input.title.trim(),
    content: input.content.trim(),

    type: input.type ?? "idea",
    status: "seed",

    energy: 0,
    version: 1,

    parentId: input.parentId ?? null,

    createdAt: now,
    updatedAt: now,
  };
}

export function updateResonanceStatus(
  resonance: Resonance,
  status: ResonanceStatus
): Resonance {
  return {
    ...resonance,
    status,
    version: resonance.version + 1,
    updatedAt: new Date().toISOString(),
  };
}