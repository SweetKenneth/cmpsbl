/**
 * FORGE CLM — Continuous Learning Module
 * Monitors artifact quality, build success rate, and generates improvement insights.
 */

import { getForgeState, getForgeHealth } from '../forge-module';

export interface ForgeCLMInsight {
  id: string;
  type: 'quality_drop' | 'build_failure_spike' | 'complexity_drift' | 'coverage_gap' | 'capacity_warning';
  severity: 'low' | 'medium' | 'high';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface ForgeCLMReport {
  health: number;
  totalGenerated: number;
  totalCompiled: number;
  totalDeployed: number;
  successRate: number;
  avgComplexity: number;
  insights: ForgeCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: ForgeCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: ForgeCLMInsight['type'],
  severity: ForgeCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): ForgeCLMInsight {
  const insight: ForgeCLMInsight = {
    id: `forge-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runForgeCLMCycle(): ForgeCLMReport {
  const state = getForgeState();
  const health = getForgeHealth();
  const insights: ForgeCLMInsight[] = [];

  // 1. Success rate degradation
  if (state.successRate < 80) {
    insights.push(createInsight(
      'quality_drop', state.successRate < 50 ? 'high' : 'medium',
      `Build success rate at ${state.successRate}% (threshold: 80%)`,
      state.successRate, 80,
    ));
  }

  // 2. Build failure spike — check recent builds
  const recentBuilds = state.builds.slice(-20);
  const recentFails = recentBuilds.filter(b => b.status === 'failed').length;
  if (recentFails >= 5) {
    insights.push(createInsight(
      'build_failure_spike', recentFails >= 10 ? 'high' : 'medium',
      `${recentFails} failed builds in last 20 (threshold: 5)`,
      recentFails, 5,
    ));
  }

  // 3. Complexity drift — average complexity rising
  if (state.avgComplexity > 7) {
    insights.push(createInsight(
      'complexity_drift', state.avgComplexity > 9 ? 'high' : 'low',
      `Average complexity ${state.avgComplexity.toFixed(1)} exceeds 7.0`,
      state.avgComplexity, 7,
    ));
  }

  // 4. Test coverage gap
  const lowCoverage = state.artifacts.slice(-20).filter(a => a.testCoverage < 60);
  if (lowCoverage.length >= 5) {
    insights.push(createInsight(
      'coverage_gap', 'medium',
      `${lowCoverage.length} recent artifacts below 60% test coverage`,
      lowCoverage.length, 5,
    ));
  }

  // 5. Capacity warning — blueprint backlog
  const unbuiltBlueprints = state.blueprints.filter(
    bp => !state.artifacts.some(a => a.blueprintId === bp.id),
  );
  if (unbuiltBlueprints.length > 20) {
    insights.push(createInsight(
      'capacity_warning', 'low',
      `${unbuiltBlueprints.length} blueprints awaiting generation`,
      unbuiltBlueprints.length, 20,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    totalGenerated: state.totalGenerated,
    totalCompiled: state.totalCompiled,
    totalDeployed: state.totalDeployed,
    successRate: state.successRate,
    avgComplexity: state.avgComplexity,
    insights,
    lastCycleAt,
  };
}

export function forgeCLM() {
  return {
    run: runForgeCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
