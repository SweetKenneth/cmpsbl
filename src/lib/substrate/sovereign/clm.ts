/**
 * SOVEREIGN CLM — Continuous Learning Module
 * Monitors compliance score, consent health, violation trends, and jurisdiction coverage.
 */

import { getSovereignState, getSovereignHealth } from '../sovereign-module';

export interface SovereignCLMInsight {
  id: string;
  type: 'compliance_degradation' | 'violation_spike' | 'consent_expiry' | 'jurisdiction_gap' | 'retention_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface SovereignCLMReport {
  health: number;
  complianceScore: number;
  totalChecks: number;
  totalViolations: number;
  activeJurisdictions: number;
  activeFrameworks: number;
  consentRecords: number;
  insights: SovereignCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: SovereignCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: SovereignCLMInsight['type'],
  severity: SovereignCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): SovereignCLMInsight {
  const insight: SovereignCLMInsight = {
    id: `sovereign-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runSovereignCLMCycle(): SovereignCLMReport {
  const state = getSovereignState();
  const health = getSovereignHealth();
  const insights: SovereignCLMInsight[] = [];

  // 1. Compliance score degradation
  if (state.complianceScore < 80) {
    insights.push(createInsight(
      'compliance_degradation', state.complianceScore < 50 ? 'critical' : 'high',
      `Compliance score at ${state.complianceScore}% (threshold: 80%)`,
      state.complianceScore, 80,
    ));
  }

  // 2. Violation spike — recent checks
  const recentChecks = state.complianceChecks.slice(-20);
  const recentViolatingChecks = recentChecks.filter(c => c.status === 'non_compliant').length;
  if (recentViolatingChecks >= 5) {
    insights.push(createInsight(
      'violation_spike', recentViolatingChecks >= 10 ? 'critical' : 'high',
      `${recentViolatingChecks} non-compliant checks in last 20 (threshold: 5)`,
      recentViolatingChecks, 5,
    ));
  }

  // 3. Consent expiry — approaching expirations
  const now = Date.now();
  const soonExpiring = state.consentRecords.filter(
    c => c.status === 'granted' && c.expiresAt && c.expiresAt - now < 30 * 24 * 3600_000,
  );
  if (soonExpiring.length >= 5) {
    insights.push(createInsight(
      'consent_expiry', 'medium',
      `${soonExpiring.length} consent records expiring within 30 days`,
      soonExpiring.length, 5,
    ));
  }

  // 4. Jurisdiction gap — registered but no residency rules
  const jurisdictionsWithoutRules = state.activeJurisdictions.filter(
    j => !state.residencyRules.some(r => r.jurisdiction === j),
  );
  if (jurisdictionsWithoutRules.length > 0) {
    insights.push(createInsight(
      'jurisdiction_gap', 'medium',
      `${jurisdictionsWithoutRules.length} jurisdiction(s) have no residency rules: ${jurisdictionsWithoutRules.join(', ')}`,
      jurisdictionsWithoutRules.length, 0,
    ));
  }

  // 5. Retention risk — policies with very short retention
  const shortRetention = state.retentionPolicies.filter(p => p.retentionDays < 30 && p.deleteOnExpiry);
  if (shortRetention.length > 0) {
    insights.push(createInsight(
      'retention_risk', 'low',
      `${shortRetention.length} retention policy(ies) with <30 day retention + auto-delete`,
      shortRetention.length, 0,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    complianceScore: state.complianceScore,
    totalChecks: state.totalChecks,
    totalViolations: state.totalViolations,
    activeJurisdictions: state.activeJurisdictions.length,
    activeFrameworks: state.activeFrameworks.length,
    consentRecords: state.consentRecords.length,
    insights,
    lastCycleAt,
  };
}

export function sovereignCLM() {
  return {
    run: runSovereignCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
