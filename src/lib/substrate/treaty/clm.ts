/**
 * TREATY CLM — Continuous Learning Module
 * Monitors SLA compliance, breach rates, penalty accumulation, contract expiry, and stale evaluations.
 */

import { getTreatyState, getTreatyHealth } from '../treaty-module';

export interface TreatyCLMInsight {
  id: string;
  type: 'compliance_drop' | 'breach_rate' | 'penalty_accumulation' | 'contract_expiry' | 'stale_evaluation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface TreatyCLMReport {
  health: number;
  avgCompliance: number;
  activeContracts: number;
  breachedContracts: number;
  totalPenalties: number;
  totalSLAChecks: number;
  insights: TreatyCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: TreatyCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: TreatyCLMInsight['type'],
  severity: TreatyCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): TreatyCLMInsight {
  const insight: TreatyCLMInsight = {
    id: `treaty-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runTreatyCLMCycle(): TreatyCLMReport {
  const state = getTreatyState();
  const health = getTreatyHealth();
  const insights: TreatyCLMInsight[] = [];

  // 1. Compliance drop
  if (state.avgCompliance < 80) {
    insights.push(createInsight(
      'compliance_drop', state.avgCompliance < 50 ? 'critical' : 'high',
      `Average SLA compliance at ${state.avgCompliance}% (threshold: 80%)`,
      state.avgCompliance, 80,
    ));
  }

  // 2. Breach rate
  if (state.totalContracts > 0) {
    const breachRate = (state.breachedContracts / state.totalContracts) * 100;
    if (breachRate > 10) {
      insights.push(createInsight(
        'breach_rate', breachRate > 30 ? 'critical' : 'high',
        `${state.breachedContracts}/${state.totalContracts} contracts breached (${breachRate.toFixed(1)}%)`,
        breachRate, 10,
      ));
    }
  }

  // 3. Penalty accumulation
  if (state.totalPenalties > 10) {
    insights.push(createInsight(
      'penalty_accumulation', state.totalPenalties > 50 ? 'high' : 'medium',
      `${state.totalPenalties} penalties triggered across all contracts`,
      state.totalPenalties, 10,
    ));
  }

  // 4. Contract expiry — approaching expirations
  const now = Date.now();
  const soonExpiring = state.contracts.filter(
    c => c.status === 'active' && c.expirationDate - now < 30 * 86400_000,
  );
  if (soonExpiring.length > 0) {
    insights.push(createInsight(
      'contract_expiry', 'medium',
      `${soonExpiring.length} active contract(s) expiring within 30 days`,
      soonExpiring.length, 0,
    ));
  }

  // 5. Stale evaluations — active contracts not evaluated recently
  const stale = state.contracts.filter(
    c => c.status === 'active' && now - c.lastEvaluatedAt > 3600_000,
  );
  if (stale.length > 0) {
    insights.push(createInsight(
      'stale_evaluation', 'low',
      `${stale.length} active contract(s) not evaluated in over 1 hour`,
      stale.length, 0,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    avgCompliance: state.avgCompliance,
    activeContracts: state.activeContracts,
    breachedContracts: state.breachedContracts,
    totalPenalties: state.totalPenalties,
    totalSLAChecks: state.totalSLAChecks,
    insights,
    lastCycleAt,
  };
}

export function treatyCLM() {
  return {
    run: runTreatyCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
