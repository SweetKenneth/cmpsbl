/**
 * Dry-Run Delta Preview Engine
 * Simulates evolution application and previews the expected delta
 * without making any actual changes. Subscribers can review impact before committing.
 */

import type { EvolutionMetrics, EvolutionDelta } from './evolution-delta';
import { computeEvolutionDelta } from './evolution-delta';

export interface DryRunConfig {
  proposalId: string;
  tenantId: string;
  simulatedChanges: SimulatedChange[];
  currentMetrics: EvolutionMetrics;
}

export interface SimulatedChange {
  type: 'fix' | 'refactor' | 'feature' | 'config';
  target: string;
  expectedHealthImpact: number; // -1 to 1
  expectedDebtImpact: number; // negative = reduce debt
  confidence: number; // 0-1
}

export interface DryRunResult {
  proposalId: string;
  projectedMetrics: EvolutionMetrics;
  projectedDelta: EvolutionDelta;
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  changeImpact: {
    totalChanges: number;
    avgConfidence: number;
    projectedHealthChange: number;
    projectedDebtChange: number;
  };
  recommendation: 'proceed' | 'review' | 'abort';
  simulatedAt: string;
}

function projectMetrics(
  current: EvolutionMetrics,
  changes: SimulatedChange[],
): EvolutionMetrics {
  let healthAdjust = 0;
  let debtAdjust = 0;

  for (const change of changes) {
    healthAdjust += change.expectedHealthImpact * change.confidence;
    debtAdjust += change.expectedDebtImpact * change.confidence;
  }

  return {
    health_score: Math.max(0, Math.min(100, current.health_score + healthAdjust * 10)),
    audit_percent: Math.max(0, Math.min(100, current.audit_percent + healthAdjust * 5)),
    debt_flags_count: Math.max(0, current.debt_flags_count + Math.round(debtAdjust)),
    open_circuit_count: current.open_circuit_count,
    memory_total_vectors: current.memory_total_vectors,
    entropy_score: Math.max(0, Math.min(1,
      current.entropy_score - healthAdjust * 0.05 + Math.abs(debtAdjust) * 0.02,
    )),
  };
}

function assessRisk(
  delta: EvolutionDelta,
  changes: SimulatedChange[],
): DryRunResult['riskAssessment'] {
  const factors: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (delta.health_delta < -5) {
    factors.push(`Projected health decline: ${delta.health_delta.toFixed(1)}`);
    riskLevel = 'high';
  }
  if (delta.debt_delta > 3) {
    factors.push(`Projected debt increase: +${delta.debt_delta}`);
    riskLevel = riskLevel === 'high' ? 'critical' : 'medium';
  }
  if (delta.entropy_delta > 0.1) {
    factors.push(`Entropy increase: +${delta.entropy_delta.toFixed(3)}`);
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  const avgConfidence = changes.length > 0
    ? changes.reduce((s, c) => s + c.confidence, 0) / changes.length
    : 0;
  if (avgConfidence < 0.5) {
    factors.push(`Low average confidence: ${(avgConfidence * 100).toFixed(0)}%`);
    if (riskLevel === 'low') riskLevel = 'medium';
  }

  if (factors.length === 0) factors.push('No significant risk factors identified.');

  return { level: riskLevel, factors };
}

export function previewDryRun(config: DryRunConfig): DryRunResult {
  const projectedMetrics = projectMetrics(config.currentMetrics, config.simulatedChanges);
  const projectedDelta = computeEvolutionDelta(config.currentMetrics, projectedMetrics);
  const riskAssessment = assessRisk(projectedDelta, config.simulatedChanges);

  const avgConfidence = config.simulatedChanges.length > 0
    ? config.simulatedChanges.reduce((s, c) => s + c.confidence, 0) / config.simulatedChanges.length
    : 0;

  const projectedHealthChange = config.simulatedChanges.reduce(
    (s, c) => s + c.expectedHealthImpact * c.confidence, 0,
  );
  const projectedDebtChange = config.simulatedChanges.reduce(
    (s, c) => s + c.expectedDebtImpact * c.confidence, 0,
  );

  let recommendation: DryRunResult['recommendation'] = 'proceed';
  if (riskAssessment.level === 'critical') recommendation = 'abort';
  else if (riskAssessment.level === 'high') recommendation = 'review';
  else if (avgConfidence < 0.4) recommendation = 'review';

  return {
    proposalId: config.proposalId,
    projectedMetrics,
    projectedDelta,
    riskAssessment,
    changeImpact: {
      totalChanges: config.simulatedChanges.length,
      avgConfidence,
      projectedHealthChange,
      projectedDebtChange,
    },
    recommendation,
    simulatedAt: new Date().toISOString(),
  };
}
