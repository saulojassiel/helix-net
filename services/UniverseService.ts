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
}

export const universeService = new UniverseService();