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
