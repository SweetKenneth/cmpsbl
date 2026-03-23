/**
 * PHANTOM Ultimate Form — v9.0.0 "Specter"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Differential Privacy Engine
 *  2. Synthetic Data Forge
 *  3. Anonymization Pipeline
 *  4. Privacy Budget Ledger
 *  5. Data Masking Engine
 *  6. Canary Token System
 *  7. Consent Registry
 *  8. Re-identification Risk Scorer
 *  9. Jurisdictional Privacy Router
 * 10. Phantom Telemetry
 */

export * from './differentialPrivacy';
export * from './syntheticDataForge';
export * from './anonymizationPipeline';
export * from './privacyBudgetLedger';
export * from './dataMaskingEngine';
export * from './canaryTokenSystem';
export * from './consentRegistry';
export * from './reidentificationScorer';
export * from './jurisdictionalRouter';
export * from './phantomTelemetry';

import { getDPStats, resetDPState } from './differentialPrivacy';
import { getSyntheticStats, resetSyntheticState } from './syntheticDataForge';
import { getAnonymizationStats, resetAnonymizationState } from './anonymizationPipeline';
import { getLedgerStats, resetLedgerState } from './privacyBudgetLedger';
import { getMaskingStats, resetMaskingState } from './dataMaskingEngine';
import { getCanaryStats, resetCanaryState } from './canaryTokenSystem';
import { getConsentStats, resetConsentState } from './consentRegistry';
import { getRiskStats, resetRiskState } from './reidentificationScorer';
import { getJurisdictionalStats, resetJurisdictionalState } from './jurisdictionalRouter';
import { getPhantomTelemetryStats, resetPhantomTelemetryState } from './phantomTelemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface PhantomUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    differentialPrivacy: { healthy: boolean; queries: number; exhaustedDatasets: number };
    syntheticDataForge: { healthy: boolean; specs: number; avgFidelity: number };
    anonymizationPipeline: { healthy: boolean; plans: number; records: number };
    privacyBudgetLedger: { healthy: boolean; entries: number; chainIntegrity: boolean };
    dataMaskingEngine: { healthy: boolean; profiles: number; consistencyEntries: number };
    canaryTokenSystem: { healthy: boolean; activeTokens: number; trippedTokens: number };
    consentRegistry: { healthy: boolean; activeConsents: number; pendingErasures: number };
    reidentificationScorer: { healthy: boolean; assessments: number; blockedExports: number };
    jurisdictionalRouter: { healthy: boolean; decisions: number; crossBorderBlocks: number };
    phantomTelemetry: { healthy: boolean; snapshots: number; trend: string };
  };
  overallHealth: number;
}

let initialized = false;

export function init(): void {
  if (initialized) return;
  initialized = true;
  console.log('[PHANTOM] Ultimate Form v9.0.0 "Specter" initialized — 10 systems online');
}

export function health(): PhantomUltimateHealth {
  const dp = getDPStats();
  const syn = getSyntheticStats();
  const anon = getAnonymizationStats();
  const ledger = getLedgerStats();
  const masking = getMaskingStats();
  const canary = getCanaryStats();
  const consent = getConsentStats();
  const risk = getRiskStats();
  const jurisdiction = getJurisdictionalStats();
  const telemetry = getPhantomTelemetryStats();

  const systems = {
    differentialPrivacy: { healthy: dp.blockedQueries < 50, queries: dp.totalQueries, exhaustedDatasets: dp.exhaustedDatasets },
    syntheticDataForge: { healthy: true, specs: syn.totalSpecs, avgFidelity: syn.avgFidelity },
    anonymizationPipeline: { healthy: true, plans: anon.totalPlans, records: anon.totalRecords },
    privacyBudgetLedger: { healthy: ledger.chainIntegrity, entries: ledger.totalEntries, chainIntegrity: ledger.chainIntegrity },
    dataMaskingEngine: { healthy: true, profiles: masking.totalProfiles, consistencyEntries: masking.consistencyMapEntries },
    canaryTokenSystem: { healthy: canary.trippedTokens < 5, activeTokens: canary.activeTokens, trippedTokens: canary.trippedTokens },
    consentRegistry: { healthy: consent.pendingErasures < 20, activeConsents: consent.activeConsents, pendingErasures: consent.pendingErasures },
    reidentificationScorer: { healthy: risk.avgRisk < 0.7, assessments: risk.totalAssessments, blockedExports: risk.blockedExports },
    jurisdictionalRouter: { healthy: true, decisions: jurisdiction.totalDecisions, crossBorderBlocks: jurisdiction.crossBorderBlocks },
    phantomTelemetry: { healthy: telemetry.trendDirection !== 'degrading', snapshots: telemetry.snapshotCount, trend: telemetry.trendDirection },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Specter', initialized, systems, overallHealth };
}

export function runCLM(): { budgetUtilization: number; consentCompliance: number; riskAvg: number } {
  const dp = getDPStats();
  const consent = getConsentStats();
  const risk = getRiskStats();
  return {
    budgetUtilization: dp.totalDatasets > 0 ? dp.exhaustedDatasets / dp.totalDatasets : 0,
    consentCompliance: consent.totalRecords > 0 ? consent.activeConsents / consent.totalRecords : 1,
    riskAvg: risk.avgRisk,
  };
}

export function resilience(): {
  ledgerIntact: boolean;
  noTrippedCanaries: boolean;
  lowReidentificationRisk: boolean;
  consentUpToDate: boolean;
} {
  const ledger = getLedgerStats();
  const canary = getCanaryStats();
  const risk = getRiskStats();
  const consent = getConsentStats();
  return {
    ledgerIntact: ledger.chainIntegrity,
    noTrippedCanaries: canary.trippedTokens === 0,
    lowReidentificationRisk: risk.avgRisk < 0.5,
    consentUpToDate: consent.pendingErasures === 0,
  };
}

export function resetAll(): void {
  resetDPState();
  resetSyntheticState();
  resetAnonymizationState();
  resetLedgerState();
  resetMaskingState();
  resetCanaryState();
  resetConsentState();
  resetRiskState();
  resetJurisdictionalState();
  resetPhantomTelemetryState();
  initialized = false;
}
