/**
 * Immunity Mesh — Rule Scoring Functions (pure, testable)
 */

import type { ImmunityRule, RuleHealth } from './types';

/**
 * Dominant score: higher = more influential rule.
 * invocations_weighted * success_rate * breadth_factor
 */
export function computeDominantScore(
  invocations24h: number,
  successRate: number,
  propagationBreadth: number,
): number {
  const invocWeight = Math.log2(Math.max(1, invocations24h) + 1);
  const breadthFactor = 1 + Math.log2(Math.max(1, propagationBreadth));
  return invocWeight * successRate * breadthFactor;
}

/**
 * Risk score: higher = more dangerous rule.
 * (1 - success_rate) * log(invocations) * severity_weight
 */
export function computeRiskScore(
  invocations24h: number,
  successRate: number,
  severityWeight: number = 1.0,
): number {
  if (invocations24h <= 0) return 0;
  return (1 - successRate) * Math.log2(invocations24h + 1) * severityWeight;
}

/**
 * Spread velocity: breadth / days since first adoption
 */
export function computeSpreadVelocity(
  propagationBreadth: number,
  firstAdoptedAt: string | null,
  now: Date = new Date(),
): number {
  if (!firstAdoptedAt || propagationBreadth <= 0) return 0;
  const daysSince = Math.max(0.01, (now.getTime() - new Date(firstAdoptedAt).getTime()) / (1000 * 60 * 60 * 24));
  return propagationBreadth / daysSince;
}

/**
 * Compute P95 from a sorted array of durations
 */
export function computeP95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.95) - 1;
  return sorted[Math.min(idx, sorted.length - 1)];
}

/**
 * Build RuleHealth from rule + telemetry data
 */
export function buildRuleHealth(
  rule: ImmunityRule,
  propagationBreadth: number,
  firstAdoptedAt: string | null,
  durations: number[],
  costs: number[],
): RuleHealth {
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const avgCost = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;

  return {
    rule,
    dominant_score: computeDominantScore(rule.invocations_24h, rule.success_rate, propagationBreadth),
    risk_score: computeRiskScore(rule.invocations_24h, rule.success_rate),
    propagation_breadth: propagationBreadth,
    spread_velocity: computeSpreadVelocity(propagationBreadth, firstAdoptedAt),
    avg_duration_ms: Math.round(avgDuration),
    p95_duration_ms: computeP95(durations),
    avg_cost_units: avgCost,
  };
}
