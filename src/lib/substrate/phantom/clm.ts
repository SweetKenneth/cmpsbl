/**
 * PHANTOM CLM — Constant Learning Module
 * Monitors privacy budget consumption, anonymization quality, and fidelity drift.
 */

import { getPhantomState, getPhantomHealth } from '../phantom-module';

export interface PhantomCLMInsight {
  id: string;
  type: 'budget_exhaustion' | 'fidelity_drift' | 'privacy_erosion' | 'anonymization_backlog' | 'noise_calibration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface PhantomCLMReport {
  health: number;
  budgetRemaining: number;
  budgetConsumed: number;
  totalSynthesized: number;
  totalAnonymized: number;
  avgFidelity: number;
  avgPrivacy: number;
  insights: PhantomCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: PhantomCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: PhantomCLMInsight['type'],
  severity: PhantomCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): PhantomCLMInsight {
  const insight: PhantomCLMInsight = {
    id: `phantom-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runPhantomCLMCycle(): PhantomCLMReport {
  const state = getPhantomState();
  const health = getPhantomHealth();
  const insights: PhantomCLMInsight[] = [];

  // 1. Privacy budget exhaustion
  const budgetRatio = state.privacyBudget.remaining / Math.max(state.privacyBudget.epsilon, 0.01);
  if (budgetRatio < 0.2) {
    insights.push(createInsight(
      'budget_exhaustion', budgetRatio < 0.05 ? 'critical' : 'high',
      `Privacy budget at ${(budgetRatio * 100).toFixed(1)}% — ${state.privacyBudget.remaining.toFixed(4)} ε remaining`,
      budgetRatio * 100, 20,
    ));
  }

  // 2. Fidelity drift — synthetic data quality dropping
  if (state.avgFidelity < 0.75 && state.totalSynthesized > 5) {
    insights.push(createInsight(
      'fidelity_drift', state.avgFidelity < 0.5 ? 'high' : 'medium',
      `Average fidelity ${(state.avgFidelity * 100).toFixed(1)}% below 75% threshold`,
      state.avgFidelity * 100, 75,
    ));
  }

  // 3. Privacy erosion — anonymization quality degrading
  if (state.avgPrivacy < 80 && state.totalAnonymized > 5) {
    insights.push(createInsight(
      'privacy_erosion', state.avgPrivacy < 60 ? 'critical' : 'high',
      `Average privacy level at ${state.avgPrivacy}% (threshold: 80%)`,
      state.avgPrivacy, 80,
    ));
  }

  // 4. High information loss in recent anonymizations
  const recentAnons = state.anonymizations.slice(-20);
  const highLoss = recentAnons.filter(a => a.informationLoss > 0.25);
  if (highLoss.length >= 5) {
    insights.push(createInsight(
      'anonymization_backlog', 'medium',
      `${highLoss.length} recent anonymizations with >25% information loss`,
      highLoss.length, 5,
    ));
  }

  // 5. Noise calibration — budget consumed too fast relative to queries
  if (state.privacyBudget.queries > 10 && budgetRatio < 0.5) {
    const consumptionRate = state.privacyBudget.consumed / state.privacyBudget.queries;
    if (consumptionRate > 0.05) {
      insights.push(createInsight(
        'noise_calibration', 'low',
        `High per-query ε consumption: ${consumptionRate.toFixed(4)} — consider reducing sensitivity`,
        consumptionRate, 0.05,
      ));
    }
  }

  lastCycleAt = Date.now();

  return {
    health,
    budgetRemaining: state.privacyBudget.remaining,
    budgetConsumed: state.privacyBudget.consumed,
    totalSynthesized: state.totalSynthesized,
    totalAnonymized: state.totalAnonymized,
    avgFidelity: state.avgFidelity,
    avgPrivacy: state.avgPrivacy,
    insights,
    lastCycleAt,
  };
}

export function phantomCLM() {
  return {
    run: runPhantomCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
