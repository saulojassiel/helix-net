import type {
  CreativeDNA,
  HelixNode,
  NodeStatus,
  NodeType,
} from "./types";

import { validateNodeInput } from "./validation";

export interface CreateNodeInput {
  universeId: string;
  authorId: string;
  title: string;
  content: string;
  type?: NodeType;
  dna?: Partial<CreativeDNA>;
}

const emptyDNA: CreativeDNA = {
  themes: [],
  emotions: [],
  symbols: [],
  disciplines: [],
  visualStyle: [],
  narrativeRules: [],
};

export function createNodeModel(input: CreateNodeInput): HelixNode {
  const validation = validateNodeInput(input);

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
    evolutionIndex: 0,
    version: 1,

    dna: {
      ...emptyDNA,
      ...input.dna,
    },

    createdAt: now,
    updatedAt: now,
  };
}

export function updateNodeStatus(
  node: HelixNode,
  status: NodeStatus
): HelixNode {
  return {
    ...node,
    status,
    version: node.version + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function updateNodeDNA(
  node: HelixNode,
  dna: Partial<CreativeDNA>
): HelixNode {
  return {
    ...node,
    dna: {
      ...node.dna,
      ...dna,
    },
    version: node.version + 1,
    updatedAt: new Date().toISOString(),
  };
}