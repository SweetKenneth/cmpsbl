/**
 * Confidence-Based Activation Gating
 * 
 * Replaces deterministic firing with probabilistic confidence scoring.
 * Each rule gets a confidence score (0–1) computed from signal severity,
 * past success rate, and node health. Activation requires exceeding
 * a tier-specific dynamic threshold.
 * 
 * @module nerve/auto-activation/confidenceGating
 * @version 1.0.0
 */

import type { ActivationTier, CapabilityActivationRule } from './capabilityActivationRegistry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RuleStats {
  successCount: number;
  failureCount: number;
  lastExecutedAt: number | null;
  totalExecutions: number;
}

export interface ConfidenceResult {
  ruleId: string;
  confidence: number;
  threshold: number;
  passes: boolean;
  components: {
    severityScore: number;
    successRateScore: number;
    healthScore: number;
    recencyBonus: number;
  };
}

export interface ConfidenceContext {
  /** Signal severity (0–10) */
  severity: number;
  /** Node health for the rule's owner node (0–1) */
  nodeHealth?: number;
  /** Current error rate for the owner node (0–1) */
  errorRate?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/** Dynamic thresholds per tier. T1 always fires. */
const TIER_THRESHOLDS: Record<ActivationTier, number> = {
  T1_CRITICAL: 0.0,    // Always fires — no threshold
  T2_OPERATIONAL: 0.60,
  T3_INTELLIGENCE: 0.65,
  T4_OPTIMIZATION: 0.70,
  T5_AUTONOMOUS: 0.80,
};

/** Weight allocation for confidence components */
const WEIGHTS = {
  severity: 0.35,
  successRate: 0.30,
  health: 0.20,
  recency: 0.15,
};

/** Recency bonus decay half-life (ms) — 1 hour */
const RECENCY_HALF_LIFE_MS = 3_600_000;

// ═══════════════════════════════════════════════════════════════
// PER-RULE STATS STORE
// ═══════════════════════════════════════════════════════════════

const ruleStatsStore = new Map<string, RuleStats>();

function getOrCreateStats(ruleId: string): RuleStats {
  let stats = ruleStatsStore.get(ruleId);
  if (!stats) {
    stats = { successCount: 0, failureCount: 0, lastExecutedAt: null, totalExecutions: 0 };
    ruleStatsStore.set(ruleId, stats);
  }
  return stats;
}

// ═══════════════════════════════════════════════════════════════
// CORE CONFIDENCE COMPUTATION
// ═══════════════════════════════════════════════════════════════

/**
 * Compute a confidence score (0–1) for a rule in the current context.
 * 
 * Components:
 *   severity    (0.35) — normalized signal severity (severity / 10)
 *   successRate (0.30) — historical success rate with Bayesian prior
 *   health      (0.20) — owner node health (defaults to 1.0)
 *   recency     (0.15) — bonus for recently-successful rules (exponential decay)
 */
export function computeConfidence(
  rule: CapabilityActivationRule,
  context: ConfidenceContext,
): ConfidenceResult {
  const stats = getOrCreateStats(rule.id);
  const threshold = TIER_THRESHOLDS[rule.tier];

  // Component 1: Severity (normalized 0–1)
  const severityScore = Math.min(1.0, context.severity / 10);

  // Component 2: Success rate with Bayesian prior (assume 2 successes, 1 failure baseline)
  const priorSuccesses = 2;
  const priorFailures = 1;
  const successRateScore = (stats.successCount + priorSuccesses) /
    (stats.totalExecutions + priorSuccesses + priorFailures);

  // Component 3: Node health (1.0 if unknown, penalized by error rate)
  const baseHealth = context.nodeHealth ?? 1.0;
  const errorPenalty = (context.errorRate ?? 0) * 0.5;
  const healthScore = Math.max(0, baseHealth - errorPenalty);

  // Component 4: Recency bonus (exponential decay from last execution)
  let recencyBonus = 0.5; // default for never-executed rules (neutral)
  if (stats.lastExecutedAt !== null) {
    const elapsed = Date.now() - stats.lastExecutedAt;
    recencyBonus = Math.exp(-0.693 * elapsed / RECENCY_HALF_LIFE_MS); // 0.693 = ln(2)
  }

  // Weighted composite
  const confidence =
    (WEIGHTS.severity * severityScore) +
    (WEIGHTS.successRate * successRateScore) +
    (WEIGHTS.health * healthScore) +
    (WEIGHTS.recency * recencyBonus);

  // Clamp to [0, 1]
  const clamped = Math.max(0, Math.min(1, confidence));

  return {
    ruleId: rule.id,
    confidence: Math.round(clamped * 1000) / 1000,
    threshold,
    passes: rule.tier === 'T1_CRITICAL' || clamped >= threshold,
    components: {
      severityScore: Math.round(severityScore * 1000) / 1000,
      successRateScore: Math.round(successRateScore * 1000) / 1000,
      healthScore: Math.round(healthScore * 1000) / 1000,
      recencyBonus: Math.round(recencyBonus * 1000) / 1000,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// STATS TRACKING
// ═══════════════════════════════════════════════════════════════

/** Record a successful execution for a rule */
export function recordSuccess(ruleId: string): void {
  const stats = getOrCreateStats(ruleId);
  stats.successCount++;
  stats.totalExecutions++;
  stats.lastExecutedAt = Date.now();
}

/** Record a failed execution for a rule */
export function recordFailure(ruleId: string): void {
  const stats = getOrCreateStats(ruleId);
  stats.failureCount++;
  stats.totalExecutions++;
  stats.lastExecutedAt = Date.now();
}

/** Get stats for a specific rule */
export function getRuleStats(ruleId: string): Readonly<RuleStats> {
  return { ...getOrCreateStats(ruleId) };
}

/** Get all tracked rule stats */
export function getAllStats(): Record<string, RuleStats> {
  const result: Record<string, RuleStats> = {};
  for (const [id, stats] of ruleStatsStore) {
    result[id] = { ...stats };
  }
  return result;
}

/** Get confidence thresholds per tier */
export function getThresholds(): Readonly<Record<ActivationTier, number>> {
  return { ...TIER_THRESHOLDS };
}

/** Reset all stats */
export function resetStats(): void {
  ruleStatsStore.clear();
}
