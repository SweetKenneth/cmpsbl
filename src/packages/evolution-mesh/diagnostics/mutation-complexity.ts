/**
 * Evolution Mesh — Mutation Complexity Scoring
 * Scores proposed mutations on multiple dimensions before execution.
 * Provides executors with clear complexity signals to inform strategy.
 */

export interface ComplexityDimension {
  name: string;
  score: number; // 0.0–1.0
  weight: number;
  description: string;
}

export interface ComplexityScore {
  mutationId: string;
  overallScore: number; // 0.0–1.0 (higher = more complex)
  grade: 'trivial' | 'simple' | 'moderate' | 'complex' | 'critical';
  dimensions: ComplexityDimension[];
  estimatedDurationMs: number;
  recommendedTier: string;
  warnings: string[];
}

/**
 * Score a proposed mutation's complexity.
 */
export function scoreMutationComplexity(
  mutationId: string,
  params: {
    modulesAffected: number;
    linesChanged: number;
    hasRollbackPlan: boolean;
    touchesDefense: boolean;
    touchesRouting: boolean;
    touchesMemory: boolean;
    regressionTestCoverage: number; // 0.0–1.0
    previousFailuresOnSimilar: number;
    isReversible: boolean;
  },
): ComplexityScore {
  const dimensions: ComplexityDimension[] = [
    {
      name: 'scope_breadth',
      score: Math.min(1, params.modulesAffected / 24),
      weight: 0.25,
      description: `${params.modulesAffected} modules affected`,
    },
    {
      name: 'change_volume',
      score: Math.min(1, params.linesChanged / 500),
      weight: 0.15,
      description: `${params.linesChanged} lines changed`,
    },
    {
      name: 'safety_sensitivity',
      score: (params.touchesDefense ? 0.4 : 0) + (params.touchesRouting ? 0.3 : 0) + (params.touchesMemory ? 0.3 : 0),
      weight: 0.20,
      description: `Touches: ${[
        params.touchesDefense && 'DEFENSE',
        params.touchesRouting && 'routing',
        params.touchesMemory && 'MEMORY',
      ].filter(Boolean).join(', ') || 'none'}`,
    },
    {
      name: 'test_coverage_gap',
      score: 1 - params.regressionTestCoverage,
      weight: 0.15,
      description: `${Math.round(params.regressionTestCoverage * 100)}% regression coverage`,
    },
    {
      name: 'historical_risk',
      score: Math.min(1, params.previousFailuresOnSimilar / 5),
      weight: 0.10,
      description: `${params.previousFailuresOnSimilar} prior failures on similar mutations`,
    },
    {
      name: 'reversibility',
      score: params.isReversible ? 0 : 1,
      weight: 0.15,
      description: params.isReversible ? 'Fully reversible' : 'Irreversible',
    },
  ];

  const overallScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);

  const warnings: string[] = [];
  if (!params.hasRollbackPlan) warnings.push('No rollback plan provided');
  if (params.regressionTestCoverage < 0.5) warnings.push('Low regression test coverage (<50%)');
  if (params.previousFailuresOnSimilar >= 3) warnings.push('High historical failure rate on similar mutations');
  if (!params.isReversible) warnings.push('Mutation is not reversible');
  if (params.touchesDefense) warnings.push('Mutation touches DEFENSE module — elevated scrutiny required');

  let grade: ComplexityScore['grade'];
  if (overallScore < 0.15) grade = 'trivial';
  else if (overallScore < 0.30) grade = 'simple';
  else if (overallScore < 0.50) grade = 'moderate';
  else if (overallScore < 0.70) grade = 'complex';
  else grade = 'critical';

  // Estimate duration based on complexity
  const baseDurationMs = 1000;
  const estimatedDurationMs = Math.round(baseDurationMs * (1 + overallScore * 10));

  let recommendedTier: string;
  if (overallScore < 0.20) recommendedTier = 'foundational';
  else if (overallScore < 0.35) recommendedTier = 'intermediate';
  else if (overallScore < 0.50) recommendedTier = 'advanced';
  else if (overallScore < 0.65) recommendedTier = 'expert';
  else recommendedTier = 'master';

  return {
    mutationId,
    overallScore: Math.round(overallScore * 1000) / 1000,
    grade,
    dimensions,
    estimatedDurationMs,
    recommendedTier,
    warnings,
  };
}

// ── #19 Executor-Relative Mutation Scoring ──

export interface ExecutorProfile {
  executorId: string;
  /** Per-dimension proficiency (0.0–1.0), higher = more proficient */
  proficiency: Record<string, number>;
  /** Overall historical success rate */
  overallSuccessRate: number;
  /** Number of mutations completed */
  mutationsCompleted: number;
}

const executorProfiles = new Map<string, ExecutorProfile>();

/**
 * Register or update an executor's proficiency profile for relative scoring.
 */
export function setExecutorProfile(profile: ExecutorProfile): void {
  executorProfiles.set(profile.executorId, profile);
}

/**
 * Score mutation complexity relative to a specific executor's proficiency.
 * An experienced executor sees lower relative scores; a novice sees higher.
 */
export function scoreRelativeComplexity(
  executorId: string,
  mutationId: string,
  params: Parameters<typeof scoreMutationComplexity>[1],
): ComplexityScore & {
  relativeScore: number;
  relativeGrade: ComplexityScore['grade'];
  executorReadiness: 'ready' | 'stretch' | 'overreach';
  proficiencyGaps: string[];
} {
  const base = scoreMutationComplexity(mutationId, params);
  const profile = executorProfiles.get(executorId);

  if (!profile || profile.mutationsCompleted < 5) {
    return {
      ...base,
      relativeScore: base.overallScore,
      relativeGrade: base.grade,
      executorReadiness: base.overallScore > 0.5 ? 'overreach' : 'stretch',
      proficiencyGaps: ['insufficient_history'],
    };
  }

  // Adjust each dimension by executor proficiency
  const proficiencyGaps: string[] = [];
  let adjustedTotal = 0;
  let weightTotal = 0;

  for (const dim of base.dimensions) {
    const prof = profile.proficiency[dim.name] ?? 0.5;
    // If executor is highly proficient in a dimension, its effective complexity is reduced
    const adjustmentFactor = 1 - (prof * 0.5); // max 50% reduction
    const adjustedScore = dim.score * adjustmentFactor;
    adjustedTotal += adjustedScore * dim.weight;
    weightTotal += dim.weight;

    if (dim.score > 0.5 && prof < 0.4) {
      proficiencyGaps.push(dim.name);
    }
  }

  const relativeScore = Math.round((adjustedTotal / (weightTotal || 1)) * 1000) / 1000;

  let relativeGrade: ComplexityScore['grade'];
  if (relativeScore < 0.15) relativeGrade = 'trivial';
  else if (relativeScore < 0.30) relativeGrade = 'simple';
  else if (relativeScore < 0.50) relativeGrade = 'moderate';
  else if (relativeScore < 0.70) relativeGrade = 'complex';
  else relativeGrade = 'critical';

  let executorReadiness: 'ready' | 'stretch' | 'overreach' = 'ready';
  if (relativeScore > 0.65 || proficiencyGaps.length >= 3) executorReadiness = 'overreach';
  else if (relativeScore > 0.4 || proficiencyGaps.length >= 1) executorReadiness = 'stretch';

  return { ...base, relativeScore, relativeGrade, executorReadiness, proficiencyGaps };
}
