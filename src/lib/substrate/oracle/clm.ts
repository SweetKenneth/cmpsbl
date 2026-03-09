/**
 * ORACLE CLM — Continuous Learning Module
 * Monitors prediction accuracy, simulation convergence, network staleness, and capacity.
 */

import { getOracleState, getOracleHealth } from '../oracle-module';

export interface OracleCLMInsight {
  id: string;
  type: 'low_confidence' | 'convergence_failure' | 'stale_network' | 'prediction_expiry' | 'capacity_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface OracleCLMReport {
  health: number;
  totalPredictions: number;
  totalSimulations: number;
  networkCount: number;
  avgConfidence: number;
  convergenceRate: number;
  insights: OracleCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: OracleCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: OracleCLMInsight['type'],
  severity: OracleCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): OracleCLMInsight {
  const insight: OracleCLMInsight = {
    id: `oracle-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runOracleCLMCycle(): OracleCLMReport {
  const state = getOracleState();
  const health = getOracleHealth();
  const insights: OracleCLMInsight[] = [];

  // 1. Low confidence predictions
  const recentPreds = state.predictions.slice(-30);
  const lowConf = recentPreds.filter(p => p.confidence < 0.4);
  const avgConfidence = recentPreds.length > 0
    ? recentPreds.reduce((s, p) => s + p.confidence, 0) / recentPreds.length
    : 0;
  if (lowConf.length >= 5) {
    insights.push(createInsight(
      'low_confidence', lowConf.length >= 15 ? 'high' : 'medium',
      `${lowConf.length} of last ${recentPreds.length} predictions below 40% confidence`,
      lowConf.length, 5,
    ));
  }

  // 2. Simulation convergence failures
  const recentSims = state.simulations.slice(-20);
  const unconverged = recentSims.filter(s => !s.converged);
  const convergenceRate = recentSims.length > 0
    ? (recentSims.length - unconverged.length) / recentSims.length
    : 1;
  if (unconverged.length >= 5) {
    insights.push(createInsight(
      'convergence_failure', unconverged.length >= 10 ? 'high' : 'medium',
      `${unconverged.length} simulations failed to converge in last ${recentSims.length}`,
      unconverged.length, 5,
    ));
  }

  // 3. Stale Bayesian networks
  const now = Date.now();
  const staleNets = state.networks.filter(n => now - n.lastUpdated > 3600_000); // >1 hour
  if (staleNets.length > 0 && state.networks.length > 0) {
    insights.push(createInsight(
      'stale_network', 'low',
      `${staleNets.length} Bayesian network(s) not updated in over 1 hour`,
      staleNets.length, 0,
    ));
  }

  // 4. Expired predictions still in store
  const expired = state.predictions.filter(p => p.expiresAt < now);
  if (expired.length >= 20) {
    insights.push(createInsight(
      'prediction_expiry', 'low',
      `${expired.length} expired predictions in store — consider pruning`,
      expired.length, 20,
    ));
  }

  // 5. Capacity warning
  if (state.predictions.length >= 450) {
    insights.push(createInsight(
      'capacity_warning', 'medium',
      `Prediction store at ${state.predictions.length}/500 capacity`,
      state.predictions.length, 450,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    totalPredictions: state.totalPredictions,
    totalSimulations: state.totalSimulations,
    networkCount: state.networks.length,
    avgConfidence,
    convergenceRate,
    insights,
    lastCycleAt,
  };
}

export function oracleCLM() {
  return {
    run: runOracleCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
