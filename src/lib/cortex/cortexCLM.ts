/**
 * CORTEX CLM — Continuous Learning Module
 * Monitors pipeline health, orchestration performance, bottlenecks,
 * cascade risk, and SLA compliance.
 */

import { getSchedulerStats } from './pipelineScheduler';
import { analyzeBottlenecks } from './bottleneckAnalysis';
import { getSubstrateCascadeRisk } from './cascadeFailurePrevention';
import { getSLACompliance } from './cortex-hardening';
import { getCortexState } from './index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CortexCLMInsight {
  id: string;
  type: 'bottleneck_detected' | 'cascade_risk' | 'sla_violation' | 'queue_saturation' | 'orchestration_failure_rate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface CortexCLMReport {
  health: number;
  queueDepth: number;
  runningPipelines: number;
  completedToday: number;
  failedToday: number;
  slaCompliance: number;
  cascadeRisk: number;
  bottleneckUtilization: number;
  insights: CortexCLMInsight[];
  lastCycleAt: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

let lastCycleAt = 0;
const insightHistory: CortexCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: CortexCLMInsight['type'],
  severity: CortexCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): CortexCLMInsight {
  const insight: CortexCLMInsight = {
    id: `cortex-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

// ─── CLM Cycle ────────────────────────────────────────────────────────────────

export function runCortexCLMCycle(): CortexCLMReport {
  const insights: CortexCLMInsight[] = [];
  const stats = getSchedulerStats();
  const cortexState = getCortexState();

  // 1. Queue saturation
  if (stats.queued > 40) {
    insights.push(createInsight(
      'queue_saturation',
      stats.queued > 80 ? 'critical' : stats.queued > 60 ? 'high' : 'medium',
      `Pipeline queue at ${stats.queued} tasks (capacity ~200)`,
      stats.queued, 40,
    ));
  }

  // 2. Failure rate
  const totalToday = stats.completed_today + stats.failed_today;
  const failureRate = totalToday > 0 ? stats.failed_today / totalToday : 0;
  if (failureRate > 0.15 && totalToday >= 5) {
    insights.push(createInsight(
      'orchestration_failure_rate',
      failureRate > 0.4 ? 'critical' : failureRate > 0.25 ? 'high' : 'medium',
      `Pipeline failure rate at ${(failureRate * 100).toFixed(1)}% (${stats.failed_today}/${totalToday})`,
      failureRate * 100, 15,
    ));
  }

  // 3. Bottleneck analysis
  const bottleneckReport = analyzeBottlenecks();
  if (bottleneckReport.bottleneck && bottleneckReport.bottleneck.utilization > 0.8) {
    insights.push(createInsight(
      'bottleneck_detected',
      bottleneckReport.bottleneck.utilization > 0.95 ? 'critical' : 'high',
      `Bottleneck at stage "${bottleneckReport.bottleneck.stageId}": ${(bottleneckReport.bottleneck.utilization * 100).toFixed(0)}% utilization`,
      bottleneckReport.bottleneck.utilization * 100, 80,
    ));
  }

  // 4. Cascade risk
  const cascadeReport = getSubstrateCascadeRisk();
  if (cascadeReport.overallRisk > 50) {
    insights.push(createInsight(
      'cascade_risk',
      cascadeReport.riskLevel === 'critical' ? 'critical' : cascadeReport.riskLevel === 'warning' ? 'high' : 'medium',
      `Substrate cascade risk at ${cascadeReport.overallRisk}% — ${cascadeReport.recommendation.reason}`,
      cascadeReport.overallRisk, 50,
    ));
  }

  // 5. SLA compliance
  const sla = getSLACompliance();
  if (sla.total > 0 && sla.complianceRate < 0.9) {
    insights.push(createInsight(
      'sla_violation',
      sla.complianceRate < 0.7 ? 'critical' : sla.complianceRate < 0.8 ? 'high' : 'medium',
      `SLA compliance at ${(sla.complianceRate * 100).toFixed(1)}% (${sla.violated} violations)`,
      sla.complianceRate * 100, 90,
    ));
  }

  // Compute health score
  let health = 100;
  if (failureRate > 0.15) health -= Math.round(failureRate * 40);
  if (stats.queued > 40) health -= Math.min(20, Math.round((stats.queued - 40) / 4));
  if (cascadeReport.overallRisk > 50) health -= Math.round((cascadeReport.overallRisk - 50) * 0.4);
  if (sla.total > 0 && sla.complianceRate < 0.9) health -= Math.round((1 - sla.complianceRate) * 25);
  health = Math.max(0, Math.min(100, health));

  lastCycleAt = Date.now();

  return {
    health,
    queueDepth: stats.queued,
    runningPipelines: stats.running,
    completedToday: stats.completed_today,
    failedToday: stats.failed_today,
    slaCompliance: sla.total > 0 ? sla.complianceRate : 1.0,
    cascadeRisk: cascadeReport.overallRisk,
    bottleneckUtilization: bottleneckReport.overallUtilization,
    insights,
    lastCycleAt,
  };
}

export function cortexCLM() {
  return {
    run: runCortexCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
