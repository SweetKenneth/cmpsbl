/**
 * CONSCIENCE CLM — Constant Learning Module
 * Monitors ethical score trends, bias detection rates, alignment drift, and blocked action frequency.
 */

import { getConscienceState, getConscienceHealth } from '../conscience-module';

export interface ConscienceCLMInsight {
  id: string;
  type: 'ethical_degradation' | 'bias_spike' | 'alignment_drift' | 'block_rate_high' | 'evaluation_gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface ConscienceCLMReport {
  health: number;
  avgEthicalScore: number;
  totalEvaluations: number;
  totalBiasDetected: number;
  blockedActions: number;
  alignmentEntities: number;
  insights: ConscienceCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: ConscienceCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: ConscienceCLMInsight['type'],
  severity: ConscienceCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): ConscienceCLMInsight {
  const insight: ConscienceCLMInsight = {
    id: `conscience-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runConscienceCLMCycle(): ConscienceCLMReport {
  const state = getConscienceState();
  const health = getConscienceHealth();
  const insights: ConscienceCLMInsight[] = [];

  // 1. Ethical score degradation
  if (state.avgEthicalScore < 60) {
    insights.push(createInsight(
      'ethical_degradation', state.avgEthicalScore < 35 ? 'critical' : 'high',
      `Average ethical score at ${state.avgEthicalScore}% (threshold: 60%)`,
      state.avgEthicalScore, 60,
    ));
  }

  // 2. Bias detection spike
  const recentEvals = state.evaluations.slice(-30);
  const recentBiasCount = recentEvals.reduce((s, e) => s + e.biasFlags.filter(b => b.detected).length, 0);
  if (recentBiasCount >= 10) {
    insights.push(createInsight(
      'bias_spike', recentBiasCount >= 25 ? 'critical' : 'high',
      `${recentBiasCount} bias detections in last ${recentEvals.length} evaluations`,
      recentBiasCount, 10,
    ));
  }

  // 3. Alignment drift — entities with high drift
  const driftingEntities = state.alignmentScores.filter(a => a.drift > 0.15);
  if (driftingEntities.length > 0) {
    insights.push(createInsight(
      'alignment_drift', driftingEntities.some(d => d.drift > 0.3) ? 'high' : 'medium',
      `${driftingEntities.length} entity(ies) drifting: ${driftingEntities.map(d => `${d.entity} (${(d.drift * 100).toFixed(0)}%)`).join(', ')}`,
      driftingEntities.length, 0,
    ));
  }

  // 4. High block rate
  if (state.totalEvaluations > 10) {
    const blockRate = state.blockedActions / state.totalEvaluations;
    if (blockRate > 0.2) {
      insights.push(createInsight(
        'block_rate_high', blockRate > 0.4 ? 'critical' : 'high',
        `${(blockRate * 100).toFixed(1)}% of actions blocked (threshold: 20%)`,
        blockRate * 100, 20,
      ));
    }
  }

  // 5. Evaluation gap — no recent evaluations
  if (recentEvals.length > 0) {
    const lastEvalAge = Date.now() - recentEvals[recentEvals.length - 1].timestamp;
    if (lastEvalAge > 3600_000) {
      insights.push(createInsight(
        'evaluation_gap', 'low',
        `No ethical evaluations in ${Math.round(lastEvalAge / 60_000)} minutes`,
        lastEvalAge, 3600_000,
      ));
    }
  }

  lastCycleAt = Date.now();

  return {
    health,
    avgEthicalScore: state.avgEthicalScore,
    totalEvaluations: state.totalEvaluations,
    totalBiasDetected: state.totalBiasDetected,
    blockedActions: state.blockedActions,
    alignmentEntities: state.alignmentScores.length,
    insights,
    lastCycleAt,
  };
}

export function conscienceCLM() {
  return {
    run: runConscienceCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
