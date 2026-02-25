/**
 * Evolution Mesh — Graduated Difficulty Ladder
 * Structures executor training from simple → complex mutations.
 * Each tier has prerequisites, pass thresholds, and promotion criteria.
 */

export type DifficultyTier = 'foundational' | 'intermediate' | 'advanced' | 'expert' | 'master';

export interface TierDefinition {
  tier: DifficultyTier;
  level: number;
  label: string;
  description: string;
  /** Minimum success rate to unlock next tier */
  promotionThreshold: number;
  /** Minimum attempts before promotion eligible */
  minimumAttempts: number;
  /** Allowed mutation types at this tier */
  allowedMutations: string[];
  /** Max modules affected per mutation */
  maxScopeWidth: number;
  /** Max risk score allowed */
  maxRiskScore: number;
}

export const DIFFICULTY_TIERS: TierDefinition[] = [
  {
    tier: 'foundational',
    level: 1,
    label: 'Foundational',
    description: 'Single-field repairs, null coercion, type casting. No production impact.',
    promotionThreshold: 0.90,
    minimumAttempts: 20,
    allowedMutations: ['prompt_optimization'],
    maxScopeWidth: 1,
    maxRiskScore: 0.15,
  },
  {
    tier: 'intermediate',
    level: 2,
    label: 'Intermediate',
    description: 'Multi-field repairs, routing adjustments, memory tuning.',
    promotionThreshold: 0.85,
    minimumAttempts: 30,
    allowedMutations: ['prompt_optimization', 'routing_adjustment', 'memory_strategy'],
    maxScopeWidth: 3,
    maxRiskScore: 0.30,
  },
  {
    tier: 'advanced',
    level: 3,
    label: 'Advanced',
    description: 'Defense rule creation, multi-module coordination, regression-aware.',
    promotionThreshold: 0.80,
    minimumAttempts: 40,
    allowedMutations: ['prompt_optimization', 'routing_adjustment', 'memory_strategy', 'defense_rule'],
    maxScopeWidth: 6,
    maxRiskScore: 0.45,
  },
  {
    tier: 'expert',
    level: 4,
    label: 'Expert',
    description: 'Pipeline restructuring, cross-module evolution, rollback-critical.',
    promotionThreshold: 0.80,
    minimumAttempts: 50,
    allowedMutations: ['prompt_optimization', 'routing_adjustment', 'memory_strategy', 'defense_rule', 'pipeline_restructure'],
    maxScopeWidth: 12,
    maxRiskScore: 0.55,
  },
  {
    tier: 'master',
    level: 5,
    label: 'Master',
    description: 'Full-scope mutations, module configuration, unrestricted within governance bounds.',
    promotionThreshold: 0.85,
    minimumAttempts: 100,
    allowedMutations: ['prompt_optimization', 'routing_adjustment', 'memory_strategy', 'defense_rule', 'pipeline_restructure', 'module_configuration'],
    maxScopeWidth: 24,
    maxRiskScore: 0.60,
  },
];

export interface ExecutorProgress {
  executorId: string;
  currentTier: DifficultyTier;
  attempts: number;
  successes: number;
  failures: number;
  successRate: number;
  promotionEligible: boolean;
  tierHistory: Array<{ tier: DifficultyTier; promotedAt: number; attemptsAtPromotion: number }>;
}

const executorProgress = new Map<string, ExecutorProgress>();

export function initExecutor(executorId: string): ExecutorProgress {
  const progress: ExecutorProgress = {
    executorId,
    currentTier: 'foundational',
    attempts: 0,
    successes: 0,
    failures: 0,
    successRate: 0,
    promotionEligible: false,
    tierHistory: [],
  };
  executorProgress.set(executorId, progress);
  return progress;
}

export function recordAttempt(executorId: string, success: boolean): ExecutorProgress {
  let progress = executorProgress.get(executorId);
  if (!progress) progress = initExecutor(executorId);

  progress.attempts++;
  if (success) progress.successes++;
  else progress.failures++;
  progress.successRate = progress.attempts > 0 ? progress.successes / progress.attempts : 0;

  const tierDef = getTierDefinition(progress.currentTier);
  progress.promotionEligible = (
    progress.attempts >= tierDef.minimumAttempts &&
    progress.successRate >= tierDef.promotionThreshold
  );

  executorProgress.set(executorId, progress);
  return progress;
}

export function promoteExecutor(executorId: string): { promoted: boolean; newTier?: DifficultyTier; reason?: string } {
  const progress = executorProgress.get(executorId);
  if (!progress) return { promoted: false, reason: 'executor_not_found' };
  if (!progress.promotionEligible) return { promoted: false, reason: 'not_eligible' };

  const currentIdx = DIFFICULTY_TIERS.findIndex(t => t.tier === progress.currentTier);
  if (currentIdx >= DIFFICULTY_TIERS.length - 1) return { promoted: false, reason: 'already_max_tier' };

  const nextTier = DIFFICULTY_TIERS[currentIdx + 1];
  progress.tierHistory.push({
    tier: progress.currentTier,
    promotedAt: Date.now(),
    attemptsAtPromotion: progress.attempts,
  });
  progress.currentTier = nextTier.tier;
  progress.attempts = 0;
  progress.successes = 0;
  progress.failures = 0;
  progress.successRate = 0;
  progress.promotionEligible = false;

  executorProgress.set(executorId, progress);
  return { promoted: true, newTier: nextTier.tier };
}

export function getTierDefinition(tier: DifficultyTier): TierDefinition {
  return DIFFICULTY_TIERS.find(t => t.tier === tier) ?? DIFFICULTY_TIERS[0];
}

export function getExecutorProgress(executorId: string): ExecutorProgress | undefined {
  return executorProgress.get(executorId);
}

export function getAllExecutorProgress(): ExecutorProgress[] {
  return Array.from(executorProgress.values());
}

export function isMutationAllowed(executorId: string, mutationType: string, scopeWidth: number, riskScore: number): {
  allowed: boolean;
  reason?: string;
} {
  const progress = executorProgress.get(executorId);
  if (!progress) return { allowed: false, reason: 'executor_not_registered' };

  const tierDef = getTierDefinition(progress.currentTier);

  if (!tierDef.allowedMutations.includes(mutationType)) {
    return { allowed: false, reason: `mutation_type_${mutationType}_not_allowed_at_${tierDef.tier}` };
  }
  if (scopeWidth > tierDef.maxScopeWidth) {
    return { allowed: false, reason: `scope_width_${scopeWidth}_exceeds_max_${tierDef.maxScopeWidth}` };
  }
  if (riskScore > tierDef.maxRiskScore) {
    return { allowed: false, reason: `risk_score_${riskScore}_exceeds_max_${tierDef.maxRiskScore}` };
  }

  return { allowed: true };
}
