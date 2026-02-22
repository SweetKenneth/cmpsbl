/**
 * Preflight Guardrails — Blocks promotion if thresholds fail
 */

import { PREFLIGHT } from './constants';
import type { DiffSummary, PreflightResult } from './types';
import type { IntegrityScanRun } from './types';

/** Run preflight checks against diff + integrity */
export function runPreflight(
  diff: DiffSummary,
  integrityScan: IntegrityScanRun,
  currentSuccessRate: number
): PreflightResult {
  const checks: PreflightResult['checks'] = [];

  // 1. Success rate
  checks.push({
    name: 'Rule Success Rate',
    passed: currentSuccessRate >= PREFLIGHT.MIN_SUCCESS_RATE,
    actual: currentSuccessRate,
    threshold: PREFLIGHT.MIN_SUCCESS_RATE,
    message: currentSuccessRate >= PREFLIGHT.MIN_SUCCESS_RATE
      ? `Success rate ${(currentSuccessRate * 100).toFixed(1)}% meets minimum`
      : `Success rate ${(currentSuccessRate * 100).toFixed(1)}% below ${(PREFLIGHT.MIN_SUCCESS_RATE * 100)}% threshold`,
  });

  // 2. Escalation increase
  const escIncrease = Math.abs(diff.escalation_delta);
  checks.push({
    name: 'Escalation Delta',
    passed: escIncrease <= PREFLIGHT.MAX_ESCALATION_INCREASE,
    actual: escIncrease,
    threshold: PREFLIGHT.MAX_ESCALATION_INCREASE,
    message: escIncrease <= PREFLIGHT.MAX_ESCALATION_INCREASE
      ? `Escalation delta ${(escIncrease * 100).toFixed(1)}% within bounds`
      : `Escalation increased by ${(escIncrease * 100).toFixed(1)}% (max ${(PREFLIGHT.MAX_ESCALATION_INCREASE * 100)}%)`,
  });

  // 3. Latency delta
  const latDelta = Math.abs(diff.latency_delta);
  checks.push({
    name: 'Latency Delta',
    passed: latDelta <= PREFLIGHT.MAX_LATENCY_DELTA,
    actual: latDelta,
    threshold: PREFLIGHT.MAX_LATENCY_DELTA,
    message: latDelta <= PREFLIGHT.MAX_LATENCY_DELTA
      ? `Latency delta ${(latDelta * 100).toFixed(1)}% acceptable`
      : `Latency increased by ${(latDelta * 100).toFixed(1)}% (max ${(PREFLIGHT.MAX_LATENCY_DELTA * 100)}%)`,
  });

  // 4. Cost delta
  const costDelta = Math.abs(diff.cost_delta);
  checks.push({
    name: 'Cost Delta',
    passed: costDelta <= PREFLIGHT.MAX_COST_DELTA,
    actual: costDelta,
    threshold: PREFLIGHT.MAX_COST_DELTA,
    message: costDelta <= PREFLIGHT.MAX_COST_DELTA
      ? `Cost delta ${(costDelta * 100).toFixed(1)}% within budget`
      : `Cost increased by ${(costDelta * 100).toFixed(1)}% (max ${(PREFLIGHT.MAX_COST_DELTA * 100)}%)`,
  });

  // 5. Integrity score
  checks.push({
    name: 'Integrity Health Score',
    passed: integrityScan.health_score >= PREFLIGHT.MIN_INTEGRITY_SCORE,
    actual: integrityScan.health_score,
    threshold: PREFLIGHT.MIN_INTEGRITY_SCORE,
    message: integrityScan.health_score >= PREFLIGHT.MIN_INTEGRITY_SCORE
      ? `Integrity score ${integrityScan.health_score}/100 passes`
      : `Integrity score ${integrityScan.health_score}/100 below minimum ${PREFLIGHT.MIN_INTEGRITY_SCORE}`,
  });

  // 6. Critical errors
  checks.push({
    name: 'No Critical Errors',
    passed: integrityScan.errors_found === 0,
    actual: integrityScan.errors_found,
    threshold: 0,
    message: integrityScan.errors_found === 0
      ? 'No critical errors found'
      : `${integrityScan.errors_found} error(s) found in integrity scan`,
  });

  return {
    passed: checks.every(c => c.passed),
    checks,
  };
}
