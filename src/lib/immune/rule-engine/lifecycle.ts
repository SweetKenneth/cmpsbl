/**
 * Immunity Mesh — Rule Lifecycle: promotion, demotion, retirement, conflict arbitration
 * Pure logic functions — DB operations are separate.
 */

import type { RuleStatus, ImmunityRule, RuleConflict, ConflictResolution } from './types';
import {
  PROMOTION_MIN_SUCCESS_RATE,
  PROMOTION_MIN_INVOCATIONS,
  PROMOTION_MIN_EXECUTORS,
  PROMOTION_MIN_CONFIDENCE,
  PROMOTION_MAX_DURATION_INCREASE_PCT,
  CANDIDATE_MIN_INVOCATIONS,
  CANDIDATE_MIN_EXECUTORS,
  CANDIDATE_MIN_CONFIDENCE,
  DEMOTION_SUCCESS_RATE_THRESHOLD,
} from './constants';

export interface PromotionCheckResult {
  eligible: boolean;
  reason: string;
}

/**
 * Check if a rule can be promoted from candidate to promoted.
 */
export function checkPromotionEligibility(
  rule: ImmunityRule,
  propagationBreadth: number,
  hasConflictsLast24h: boolean,
  avgDurationIncreasePct: number,
): PromotionCheckResult {
  if (rule.status !== 'candidate') {
    return { eligible: false, reason: `Status is "${rule.status}", must be "candidate"` };
  }
  if (rule.success_rate < PROMOTION_MIN_SUCCESS_RATE) {
    return { eligible: false, reason: `Success rate ${(rule.success_rate * 100).toFixed(1)}% < ${PROMOTION_MIN_SUCCESS_RATE * 100}%` };
  }
  if (rule.confidence < PROMOTION_MIN_CONFIDENCE) {
    return { eligible: false, reason: `Confidence ${rule.confidence} < ${PROMOTION_MIN_CONFIDENCE}` };
  }
  if (hasConflictsLast24h) {
    return { eligible: false, reason: 'Has conflict events in last 24h' };
  }
  if (avgDurationIncreasePct > PROMOTION_MAX_DURATION_INCREASE_PCT) {
    return { eligible: false, reason: `Duration increase ${avgDurationIncreasePct.toFixed(1)}% > ${PROMOTION_MAX_DURATION_INCREASE_PCT}%` };
  }
  return { eligible: true, reason: 'All promotion gates passed' };
}

/**
 * Check if a learned rule should become a candidate.
 */
export function checkCandidateEligibility(
  rule: ImmunityRule,
  executorCount: number,
): boolean {
  if (rule.status !== 'learned') return false;
  const hasEnoughInvocations = rule.invocations_24h >= CANDIDATE_MIN_INVOCATIONS || rule.invocations_7d >= CANDIDATE_MIN_INVOCATIONS;
  const hasEnoughExecutors = executorCount >= CANDIDATE_MIN_EXECUTORS;
  const hasEnoughConfidence = rule.confidence >= CANDIDATE_MIN_CONFIDENCE;
  return (hasEnoughInvocations || hasEnoughExecutors) && hasEnoughConfidence;
}

/**
 * Check if a promoted rule should be demoted.
 */
export function shouldDemote(rule: ImmunityRule): boolean {
  return rule.status === 'promoted' && rule.success_rate < DEMOTION_SUCCESS_RATE_THRESHOLD;
}

/**
 * Check if a rule should be auto-retired (0 invocations in 7d).
 */
export function shouldRetire(rule: ImmunityRule): boolean {
  return rule.invocations_7d === 0 && ['learned', 'candidate', 'deprecated'].includes(rule.status);
}

/**
 * Deterministic conflict arbitration.
 * Prefer higher success_rate → lower p95 → broader propagation.
 */
export function arbitrateConflict(
  ruleA: { success_rate: number; p95_duration_ms: number; propagation_breadth: number },
  ruleB: { success_rate: number; p95_duration_ms: number; propagation_breadth: number },
  isSecurity: boolean,
): ConflictResolution {
  if (isSecurity) return 'both_blocked';
  
  if (ruleA.success_rate !== ruleB.success_rate) {
    return ruleA.success_rate > ruleB.success_rate ? 'prefer_a' : 'prefer_b';
  }
  if (ruleA.p95_duration_ms !== ruleB.p95_duration_ms) {
    return ruleA.p95_duration_ms < ruleB.p95_duration_ms ? 'prefer_a' : 'prefer_b';
  }
  if (ruleA.propagation_breadth !== ruleB.propagation_breadth) {
    return ruleA.propagation_breadth > ruleB.propagation_breadth ? 'prefer_a' : 'prefer_b';
  }
  return 'conditional';
}

/**
 * Compute the next status for a rule based on its current state + metrics.
 */
export function computeNextStatus(
  current: RuleStatus,
  invocations7d: number,
  successRate24h: number,
  executorCount: number,
  confidence: number,
): RuleStatus | null {
  // Auto-retire
  if (invocations7d === 0 && ['learned', 'candidate', 'deprecated'].includes(current)) return 'retired';
  
  // Demote promoted rules with poor success
  if (current === 'promoted' && successRate24h < DEMOTION_SUCCESS_RATE_THRESHOLD) return 'candidate';
  
  // Promote candidates
  if (current === 'candidate' && successRate24h >= PROMOTION_MIN_SUCCESS_RATE && confidence >= PROMOTION_MIN_CONFIDENCE) return 'promoted';
  
  // Elevate learned to candidate
  if (current === 'learned' && (invocations7d >= CANDIDATE_MIN_INVOCATIONS || executorCount >= CANDIDATE_MIN_EXECUTORS) && confidence >= CANDIDATE_MIN_CONFIDENCE) return 'candidate';
  
  return null; // No change
}
