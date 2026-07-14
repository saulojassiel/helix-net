import { createGraph, addNodeToGraph } from "./graph/service";
import type { HelixGraph } from "./graph/types";

import { createNodeModel } from "./node/service";
import type { HelixNode } from "./node/types";
import { analyzeGraph } from "./discovery/service";
import { createEdgeModel } from "./edge/service";
import { addEdgeToGraph } from "./graph/service";

import {
  applyKernelEvent,
  createInitialKernelState,
  createKernelEvent,
} from "./kernel";

import type {
  KernelEvent,
  KernelState,
  StateTransition,
} from "./kernel";

import { suggestConceptualConnections } from "./physics/suggestions";

export interface CreateSeedInput {
  question: string;
  intent: string;
  authorId: string;
}

export interface CreateSeedResult {
    discovery: ReturnType<typeof analyzeGraph>;
    suggestions: ReturnType<typeof suggestConceptualConnections>;
  universeId: string;
  seedId: string;

  graph: HelixGraph;
  seedNode: HelixNode;

  initialState: KernelState;
  currentState: KernelState;

  timeline: KernelEvent[];
  transition: StateTransition;
}

export function createSeed(
  input: CreateSeedInput
): CreateSeedResult {
  const question = input.question.trim();
  const intent = input.intent.trim();
  const authorId = input.authorId.trim();

  if (question.length < 5) {
    throw new Error(
      "La pregunta inicial debe tener al menos 5 caracteres."
    );
  }

  if (intent.length < 5) {
    throw new Error(
      "La intención debe tener al menos 5 caracteres."
    );
  }

  if (!authorId) {
    throw new Error("La semilla debe tener un autor.");
  }

  const universeId = crypto.randomUUID();
  const seedId = crypto.randomUUID();

  const emptyGraph = createGraph({
    universeId,
    title: question,
    description: intent,
  });

 const seedNode = createNodeModel({
  universeId,
  authorId,
  title: question,
  content: intent,
  type: "idea",
  dna: {
    themes: ["conciencia", "lenguaje"],
    emotions: ["curiosidad"],
    symbols: ["luz", "bucle"],
    disciplines: ["filosofía"],
    visualStyle: [],
    narrativeRules: [],
  },
});

const relatedNode = createNodeModel({
  universeId,
  authorId,
  title: "Gödel, lenguaje y autoconciencia",
  content:
    "Explorar cómo los sistemas simbólicos pueden representarse a sí mismos.",
  type: "research",
  dna: {
    themes: ["conciencia", "lenguaje", "autorreferencia"],
    emotions: ["curiosidad"],
    symbols: ["bucle", "espejo"],
    disciplines: ["filosofía", "matemáticas"],
    visualStyle: [],
    narrativeRules: [],
  },
});

const graphWithSeed = addNodeToGraph(emptyGraph, seedNode);
const graphWithNodes = addNodeToGraph(graphWithSeed, relatedNode);

const firstEdge = createEdgeModel({
  universeId,
  sourceNodeId: seedNode.id,
  targetNodeId: relatedNode.id,
  creatorId: authorId,
  type: "expands",
  strength: 0.9,
  confidence: 1,
  description:
    "La investigación sobre Gödel expande la semilla inicial sobre conciencia y lenguaje.",
});

const graph = addEdgeToGraph(graphWithNodes, firstEdge);
const suggestions = suggestConceptualConnections(graph, {
  minimumScore: 0.3,
  maximumResults: 5,
  
});
const discovery = analyzeGraph(graph);

  const initialState = createInitialKernelState({
    universeId,
    graphId: graph.id,
  });

  const seedCreatedEvent = createKernelEvent({
    type: "seed_created",
    payload: {
      seedId,
      nodeId: seedNode.id,
      question,
      intent,
      authorId,
    },
  });

  const transition = applyKernelEvent(
    initialState,
    seedCreatedEvent
  );

  return {
    universeId,
    seedId,
    
    graph,
    seedNode,

    initialState,
    currentState: transition.nextState,

    timeline: [seedCreatedEvent],
    transition,
    suggestions,
    discovery,
  };
}

export const helix = {
  createSeed,
};