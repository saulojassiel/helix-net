import type {
  ComplementarityContribution,
  ComplementarityProfile,
  ComplementarityResult,
} from "./types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function getAllSkills(
  source: ComplementarityProfile,
  target: ComplementarityProfile
): string[] {
  return [
    ...new Set([
      ...Object.keys(source.capabilities),
      ...Object.keys(source.needs),
      ...Object.keys(target.capabilities),
      ...Object.keys(target.needs),
    ]),
  ];
}

function calculateDirectionalMatch(
  capabilities: Record<string, number>,
  needs: Record<string, number>
): {
  score: number;
  contributions: ComplementarityContribution[];
} {
  const skills = [
    ...new Set([
      ...Object.keys(capabilities),
      ...Object.keys(needs),
    ]),
  ];

  const contributions = skills.map((skill) => {
    const capability = clamp01(capabilities[skill] ?? 0);
    const need = clamp01(needs[skill] ?? 0);

    return {
      skill,
      capability,
      need,
      contribution: capability * need,
    };
  });

  const totalNeed = contributions.reduce(
    (sum, item) => sum + item.need,
    0
  );

  if (totalNeed === 0) {
    return {
      score: 0,
      contributions,
    };
  }

  const weightedMatch = contributions.reduce(
    (sum, item) => sum + item.contribution,
    0
  );

  return {
    score: weightedMatch / totalNeed,
    contributions,
  };
}

function calculateRedundancyPenalty(
  source: ComplementarityProfile,
  target: ComplementarityProfile
): number {
  const skills = getAllSkills(source, target);

  if (skills.length === 0) {
    return 0;
  }

  const overlap = skills.reduce((sum, skill) => {
    const sourceCapability = clamp01(
      source.capabilities[skill] ?? 0
    );

    const targetCapability = clamp01(
      target.capabilities[skill] ?? 0
    );

    return sum + Math.min(sourceCapability, targetCapability);
  }, 0);

  return overlap / skills.length;
}

function calculateConflictPenalty(
  source: ComplementarityProfile,
  target: ComplementarityProfile
): {
  penalty: number;
  conflicts: string[];
} {
  const sourceConflicts = new Set(source.conflicts ?? []);
  const targetConflicts = new Set(target.conflicts ?? []);

  const sharedConflicts = [...sourceConflicts].filter((conflict) =>
    targetConflicts.has(conflict)
  );

  const penalty = Math.min(1, sharedConflicts.length * 0.2);

  return {
    penalty,
    conflicts: sharedConflicts,
  };
}

export function calculateComplementarity(
  source: ComplementarityProfile,
  target: ComplementarityProfile
): ComplementarityResult {
  if (source.id === target.id) {
    throw new Error(
      "No se puede calcular complementariedad entre el mismo perfil."
    );
  }

  const sourceToTargetMatch = calculateDirectionalMatch(
    source.capabilities,
    target.needs
  );

  const targetToSourceMatch = calculateDirectionalMatch(
    target.capabilities,
    source.needs
  );

  const redundancyPenalty = calculateRedundancyPenalty(
    source,
    target
  );

  const conflictResult = calculateConflictPenalty(
    source,
    target
  );

  const rawScore =
    sourceToTargetMatch.score * 0.4 +
    targetToSourceMatch.score * 0.4 -
    redundancyPenalty * 0.1 -
    conflictResult.penalty * 0.1;

  const score = Math.round(clamp01(rawScore) * 100);

  const allContributions = [
    ...sourceToTargetMatch.contributions,
    ...targetToSourceMatch.contributions,
  ];

  const matchingSkills = [
    ...new Set(
      allContributions
        .filter((item) => item.contribution >= 0.25)
        .map((item) => item.skill)
    ),
  ];

  const missingSkills = getAllSkills(source, target).filter(
    (skill) => {
      const totalNeed =
        clamp01(source.needs[skill] ?? 0) +
        clamp01(target.needs[skill] ?? 0);

      const totalCapability =
        clamp01(source.capabilities[skill] ?? 0) +
        clamp01(target.capabilities[skill] ?? 0);

      return totalNeed >= 0.8 && totalCapability < 0.5;
    }
  );

  return {
    sourceId: source.id,
    targetId: target.id,

    score,

    sourceToTarget: sourceToTargetMatch.score,
    targetToSource: targetToSourceMatch.score,

    redundancyPenalty,
    conflictPenalty: conflictResult.penalty,

    matchingSkills,
    missingSkills,
    conflicts: conflictResult.conflicts,

    contributions: allContributions,
  };
}