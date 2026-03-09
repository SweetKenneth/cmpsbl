/**
 * ECHO CLM — Continuous Learning Module
 * Monitors simulation divergence, twin staleness, scenario failure rate, and capacity.
 */

import { getEchoState, getEchoHealth } from '../echo-module';

export interface EchoCLMInsight {
  id: string;
  type: 'high_divergence' | 'stale_twin' | 'scenario_failures' | 'twin_desync' | 'capacity_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface EchoCLMReport {
  health: number;
  totalTwins: number;
  totalSimulations: number;
  avgDivergence: number;
  activeTwins: number;
  insights: EchoCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: EchoCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: EchoCLMInsight['type'],
  severity: EchoCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): EchoCLMInsight {
  const insight: EchoCLMInsight = {
    id: `echo-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runEchoCLMCycle(): EchoCLMReport {
  const state = getEchoState();
  const health = getEchoHealth();
  const insights: EchoCLMInsight[] = [];
  const now = Date.now();

  // 1. High average divergence
  if (state.avgDivergence > 15) {
    insights.push(createInsight(
      'high_divergence', state.avgDivergence > 30 ? 'high' : 'medium',
      `Average scenario divergence at ${state.avgDivergence.toFixed(1)} (threshold: 15)`,
      state.avgDivergence, 15,
    ));
  }

  // 2. Stale twins — not synced recently
  const staleTwins = state.twins.filter(t => now - t.lastSyncedAt > 3600_000);
  if (staleTwins.length > 0) {
    insights.push(createInsight(
      'stale_twin', 'low',
      `${staleTwins.length} twin(s) not synced in over 1 hour`,
      staleTwins.length, 0,
    ));
  }

  // 3. Scenario failure rate
  const recentScenarios = state.scenarios.slice(-20);
  const failed = recentScenarios.filter(s => s.status === 'failed');
  if (failed.length >= 5) {
    insights.push(createInsight(
      'scenario_failures', failed.length >= 10 ? 'high' : 'medium',
      `${failed.length} failed scenarios in last ${recentScenarios.length}`,
      failed.length, 5,
    ));
  }

  // 4. Twin desync — large deltas in recent history
  for (const twin of state.twins.slice(-10)) {
    const lastSnapshot = twin.history[twin.history.length - 1];
    if (lastSnapshot) {
      const maxDelta = Math.max(...Object.values(lastSnapshot.delta).map(Math.abs), 0);
      if (maxDelta > 50) {
        insights.push(createInsight(
          'twin_desync', 'medium',
          `Twin "${twin.name}" has large delta (${maxDelta.toFixed(1)}) — possible desync`,
          maxDelta, 50,
        ));
        break; // Report first instance only
      }
    }
  }

  // 5. Capacity
  if (state.scenarios.length >= 180) {
    insights.push(createInsight(
      'capacity_warning', 'low',
      `Scenario store at ${state.scenarios.length}/200 capacity`,
      state.scenarios.length, 180,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    totalTwins: state.totalTwins,
    totalSimulations: state.totalSimulations,
    avgDivergence: state.avgDivergence,
    activeTwins: state.twins.length,
    insights,
    lastCycleAt,
  };
}

export function echoCLM() {
  return {
    run: runEchoCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
