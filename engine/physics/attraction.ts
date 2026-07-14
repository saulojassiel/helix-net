import type { HelixNode } from "../node/types";

export interface ConceptualAttractionResult {
  score: number;
  sharedThemes: string[];
  sharedEmotions: string[];
  sharedDisciplines: string[];
  sharedSymbols: string[];
}

function normalize(values: string[]): string[] {
  return values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function intersection(left: string[], right: string[]): string[] {
  const rightSet = new Set(normalize(right));

  return [...new Set(normalize(left))].filter((value) =>
    rightSet.has(value)
  );
}

export function calculateConceptualAttraction(
  source: HelixNode,
  target: HelixNode
): ConceptualAttractionResult {
  if (source.id === target.id) {
    return {
      score: 0,
      sharedThemes: [],
      sharedEmotions: [],
      sharedDisciplines: [],
      sharedSymbols: [],
    };
  }

  if (source.universeId !== target.universeId) {
    throw new Error(
      "La atracción conceptual solo puede calcularse entre nodos del mismo universo."
    );
  }

  const sharedThemes = intersection(
    source.dna.themes,
    target.dna.themes
  );

  const sharedEmotions = intersection(
    source.dna.emotions,
    target.dna.emotions
  );

  const sharedDisciplines = intersection(
    source.dna.disciplines,
    target.dna.disciplines
  );

  const sharedSymbols = intersection(
    source.dna.symbols,
    target.dna.symbols
  );

  const rawScore =
    sharedThemes.length * 0.35 +
    sharedDisciplines.length * 0.3 +
    sharedSymbols.length * 0.2 +
    sharedEmotions.length * 0.15;

  const score = Math.min(1, rawScore);

  return {
    score,
    sharedThemes,
    sharedEmotions,
    sharedDisciplines,
    sharedSymbols,
  };
}