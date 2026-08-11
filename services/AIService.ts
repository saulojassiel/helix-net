import type {
  AISuggestion,
  AnalyzeGraphInput,
  AnalyzeGraphResult,
  ExpandIdeaInput,
  ExpandIdeaResult,
  GraphInsight,
} from "@/types/ai";

export interface AIProvider {
  expandIdea(
    input: ExpandIdeaInput
  ): Promise<ExpandIdeaResult>;

  analyzeGraph(
    input: AnalyzeGraphInput
  ): Promise<AnalyzeGraphResult>;
}

export class AIService {
  constructor(
    private provider: AIProvider
  ) {}

  async expandIdea(
    input: ExpandIdeaInput
  ): Promise<AISuggestion[]> {
    const result =
      await this.provider.expandIdea(
        input
      );

    return result.suggestions;
  }

  async analyzeGraph(
    input: AnalyzeGraphInput
  ): Promise<GraphInsight[]> {
    const result =
      await this.provider.analyzeGraph(
        input
      );

    return result.insights;
  }
}