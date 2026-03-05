/**
 * Evolution Confidence — Novelty risk penalty + evidence-backed scoring
 */

export interface ConfidenceInputs {
  base_score: number;           // 0–1 from existing evaluation
  novelty_score: number;        // 0–1, higher = more novel/risky
  blast_radius: number;         // 0–1, affected surface area
  test_coverage: number;        // 0–1
  telemetry_delta: number;      // positive = improvement
  security_scan_passed: boolean;
  has_rollback_plan: boolean;
}

export interface ConfidenceResult {
  final_score: number;
  novelty_penalty: number;
  evidence_bonus: number;
  requires_two_man: boolean;
  critical_class: boolean;
  reason: string;
}

const CRITICAL_CLASSES = ['core', 'auth', 'billing', 'governance', 'identity', 'defense'];

/** Compute adjusted confidence with novelty risk */
export function computeConfidence(
  inputs: ConfidenceInputs,
  impactedModules: string[]
): ConfidenceResult {
  const critical_class = impactedModules.some(
    m => CRITICAL_CLASSES.includes(m.toLowerCase())
  );

  // Novelty penalty: higher novelty + higher blast radius = bigger penalty
  const novelty_penalty = inputs.novelty_score * inputs.blast_radius * 0.3;

  // Evidence bonus: good test coverage + clean security + rollback plan
  let evidence_bonus = 0;
  if (inputs.test_coverage > 0.7) evidence_bonus += 0.05;
  if (inputs.security_scan_passed) evidence_bonus += 0.05;
  if (inputs.has_rollback_plan) evidence_bonus += 0.05;
  if (inputs.telemetry_delta > 0) evidence_bonus += Math.min(inputs.telemetry_delta * 0.1, 0.05);

  const final_score = Math.max(0, Math.min(1,
    inputs.base_score - novelty_penalty + evidence_bonus
  ));

  // Two-man rule: critical classes never auto-promote
  const requires_two_man = critical_class;

  let reason = `base=${inputs.base_score.toFixed(2)}, novelty_penalty=${novelty_penalty.toFixed(2)}, evidence_bonus=${evidence_bonus.toFixed(2)}`;
  if (requires_two_man) reason += ' [CRITICAL_CLASS: two-man rule required]';

  return {
    final_score,
    novelty_penalty,
    evidence_bonus,
    requires_two_man,
    critical_class,
    reason,
  };
}
