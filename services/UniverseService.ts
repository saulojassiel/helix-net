import { SupabaseUniverseRepository } from "./repositories/SupabaseUniverseRepository";

export interface PlantSeedInput {
  question: string;
  authorId: string;
}

export class UniverseService {
  constructor(
    private repository = new SupabaseUniverseRepository()
  ) {}

  async plantSeed(input: PlantSeedInput) {
    const question = input.question.trim();

    if (question.length < 5) {
      throw new Error(
        "La pregunta debe tener al menos 5 caracteres."
      );
    }

    return this.repository.plantSeed(question);
  }
  async moveNode(
  nodeId: string,
  positionX: number,
  positionY: number
) {
  return this.repository.moveNode(
    nodeId,
    positionX,
    positionY
  );
}

  async addIdea(
    universeId: string,
    graphId: string,
    title: string,
    content: string
  ) {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      throw new Error("La idea necesita un título.");
    }

    return this.repository.addNode(
      universeId,
      graphId,
      cleanTitle,
      cleanContent
    );
  }
  async connectIdeas(
  universeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: string,
  strength = 1,
  confidence = 1,
  description: string | null = null
) {
  return this.repository.connectNodes(
    universeId,
    sourceNodeId,
    targetNodeId,
    relationType,
    strength,
    confidence,
    description
  );
}
async updateEdge(
  edgeId: string,
  relationType: string,
  strength: number,
  confidence: number,
  description: string | null,
  evidence: unknown[] = [],
  metadata: Record<string, unknown> = {}
) {
  return this.repository.updateEdge(
    edgeId,
    relationType,
    strength,
    confidence,
    description,
    evidence,
    metadata
  );
}
async updateNode(
  nodeId: string,
  title: string,
  content: string,
  status: string,
  priority: number,
  metadata: Record<string, unknown> = {}
) {
  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  if (!cleanTitle) {
    throw new Error(
      "El nodo necesita un título."
    );
  }

  return this.repository.updateNode(
    nodeId,
    cleanTitle,
    cleanContent,
    status,
    priority,
    metadata
  );
}
}

