import type {
  AISuggestion,
  ExpandIdeaInput,
  ExpandIdeaResult,
} from "@/types/ai";

export interface AIProvider {
  expandIdea(
    input: ExpandIdeaInput
  ): Promise<ExpandIdeaResult>;
}

export class AIService {
  constructor(
    private provider: AIProvider
  ) {}

  async expandIdea(
    input: ExpandIdeaInput
  ): Promise<AISuggestion[]> {
    const result =
      await this.provider.expandIdea(input);

    return result.suggestions;
  }
}