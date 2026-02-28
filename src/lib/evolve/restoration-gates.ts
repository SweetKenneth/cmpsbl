/**
 * Restoration Health Verification Gates
 * Validates that restored state meets health thresholds before finalizing.
 * Prevents restoring to a state that's worse than current.
 */

import type { EvolutionMetrics } from './evolution-delta';

export interface RestorationGateConfig {
  minHealthScore: number;
  maxDebtFlags: number;
  maxOpenCircuits: number;
  maxEntropyScore: number;
  requireRescanPass: boolean;
}

export interface GateResult {
  passed: boolean;
  gate: string;
  actual: number;
  threshold: number;
  message: string;
}

export interface RestorationVerification {
  allPassed: boolean;
  gates: GateResult[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
  recommendation: 'proceed' | 'review' | 'abort';
  verifiedAt: string;
}

const DEFAULT_GATES: RestorationGateConfig = {
  minHealthScore: 40,
  maxDebtFlags: 20,
  maxOpenCircuits: 3,
  maxEntropyScore: 0.8,
  requireRescanPass: true,
};

const tenantGates = new Map<string, RestorationGateConfig>();

export function setRestorationGates(tenantId: string, config: Partial<RestorationGateConfig>): void {
  tenantGates.set(tenantId, { ...DEFAULT_GATES, ...config });
}

function getGates(tenantId: string): RestorationGateConfig {
  return tenantGates.get(tenantId) ?? DEFAULT_GATES;
}

export function verifyRestoration(
  tenantId: string,
  restoredMetrics: EvolutionMetrics,
  currentMetrics?: EvolutionMetrics,
  rescanPassed?: boolean,
): RestorationVerification {
  const config = getGates(tenantId);
  const gates: GateResult[] = [];

  // Gate 1: Minimum health score
  gates.push({
    passed: restoredMetrics.health_score >= config.minHealthScore,
    gate: 'min_health_score',
    actual: restoredMetrics.health_score,
    threshold: config.minHealthScore,
    message: restoredMetrics.health_score >= config.minHealthScore
      ? 'Health score meets minimum threshold.'
      : `Health score ${restoredMetrics.health_score} below minimum ${config.minHealthScore}.`,
  });

  // Gate 2: Debt flags
  gates.push({
    passed: restoredMetrics.debt_flags_count <= config.maxDebtFlags,
    gate: 'max_debt_flags',
    actual: restoredMetrics.debt_flags_count,
    threshold: config.maxDebtFlags,
    message: restoredMetrics.debt_flags_count <= config.maxDebtFlags
      ? 'Debt flags within acceptable range.'
      : `Debt flags ${restoredMetrics.debt_flags_count} exceed maximum ${config.maxDebtFlags}.`,
  });

  // Gate 3: Open circuits
  gates.push({
    passed: restoredMetrics.open_circuit_count <= config.maxOpenCircuits,
    gate: 'max_open_circuits',
    actual: restoredMetrics.open_circuit_count,
    threshold: config.maxOpenCircuits,
    message: restoredMetrics.open_circuit_count <= config.maxOpenCircuits
      ? 'Circuit breakers within limits.'
      : `${restoredMetrics.open_circuit_count} open circuits exceed max ${config.maxOpenCircuits}.`,
  });

  // Gate 4: Entropy
  gates.push({
    passed: restoredMetrics.entropy_score <= config.maxEntropyScore,
    gate: 'max_entropy',
    actual: restoredMetrics.entropy_score,
    threshold: config.maxEntropyScore,
    message: restoredMetrics.entropy_score <= config.maxEntropyScore
      ? 'Entropy within acceptable bounds.'
      : `Entropy ${restoredMetrics.entropy_score.toFixed(3)} exceeds maximum ${config.maxEntropyScore}.`,
  });

  // Gate 5: Re-scan verification
  if (config.requireRescanPass) {
    gates.push({
      passed: rescanPassed === true,
      gate: 'rescan_verification',
      actual: rescanPassed ? 1 : 0,
      threshold: 1,
      message: rescanPassed ? 'Post-restoration scan passed.' : 'Post-restoration scan required but not passed.',
    });
  }

  // Gate 6: Not worse than current (comparative)
  if (currentMetrics) {
    const isWorse = restoredMetrics.health_score < currentMetrics.health_score - 10;
    gates.push({
      passed: !isWorse,
      gate: 'not_worse_than_current',
      actual: restoredMetrics.health_score,
      threshold: currentMetrics.health_score - 10,
      message: isWorse
        ? `Restored state (${restoredMetrics.health_score}) significantly worse than current (${currentMetrics.health_score}).`
        : 'Restored state comparable or better than current.',
    });
  }

  const allPassed = gates.every(g => g.passed);
  const failedCount = gates.filter(g => !g.passed).length;

  let overallHealth: RestorationVerification['overallHealth'] = 'healthy';
  if (failedCount >= 3) overallHealth = 'critical';
  else if (failedCount >= 1) overallHealth = 'degraded';

  let recommendation: RestorationVerification['recommendation'] = 'proceed';
  if (overallHealth === 'critical') recommendation = 'abort';
  else if (overallHealth === 'degraded') recommendation = 'review';

  return {
    allPassed,
    gates,
    overallHealth,
    recommendation,
    verifiedAt: new Date().toISOString(),
  };
}
