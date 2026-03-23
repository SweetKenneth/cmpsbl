/**
 * ORACLE Ultimate Form — v9.0.0 "Omniscience"
 * Unified export and lifecycle API for all 11 Ultimate Form systems.
 * 
 * Systems:
 *  1. Bayesian Prediction Network
 *  2. Trend Forecaster (Time-Series)
 *  3. Scenario Simulation Engine
 *  4. Prescriptive Recommendation Engine
 *  5. Prophecy Journal (Prediction Ledger)
 *  6. Early Warning System
 *  7. Capacity Planning Oracle
 *  8. Causal Inference Engine
 *  9. Dynamic Risk Matrix
 * 10. Prediction Market (Internal)
 * 11. Oracle Telemetry Nexus
 */

// Re-export all systems
export * from './bayesianNetwork';
export * from './trendForecaster';
export * from './scenarioSimulator';
export * from './prescriptiveEngine';
export * from './prophecyJournal';
export * from './earlyWarning';
export * from './capacityPlanner';
export * from './causalInference';
export * from './riskMatrix';
export * from './predictionMarket';
export * from './oracleTelemetry';

// Import for lifecycle
import { getBayesianStats, resetBayesianState } from './bayesianNetwork';
import { getForecastStats, resetForecastState } from './trendForecaster';
import { getSimulationStats, resetSimulationState } from './scenarioSimulator';
import { getPrescriptiveStats, expireStale, resetPrescriptiveState } from './prescriptiveEngine';
import { getJournalStats, expireProphecies, resetJournalState } from './prophecyJournal';
import { getEarlyWarningStats, evaluateConvergence, resetEarlyWarningState } from './earlyWarning';
import { getCapacityStats, resetCapacityState } from './capacityPlanner';
import { getCausalStats, resetCausalState } from './causalInference';
import { getRiskStats, getRiskSnapshot } from './riskMatrix';
import { resetRiskState } from './riskMatrix';
import { getMarketStats, resetMarketState } from './predictionMarket';
import { getSnapshot, recordTelemetryEvent, resetTelemetryState } from './oracleTelemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface OracleUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    bayesianNetwork: { healthy: boolean; networks: number; inferences: number };
    trendForecaster: { healthy: boolean; series: number; anomalies: number };
    scenarioSimulator: { healthy: boolean; simulations: number; convergenceRate: number };
    prescriptiveEngine: { healthy: boolean; pending: number; adoptionRate: number };
    prophecyJournal: { healthy: boolean; total: number; brierScore: number };
    earlyWarning: { healthy: boolean; activeWarnings: number; signals: number };
    capacityPlanner: { healthy: boolean; tracked: number; criticalCount: number };
    causalInference: { healthy: boolean; dags: number; significantRelationships: number };
    riskMatrix: { healthy: boolean; overallRisk: number; criticalCount: number };
    predictionMarket: { healthy: boolean; activeModels: number; avgCredibility: number };
    telemetryNexus: { healthy: boolean; predictionsPerHour: number; systemHealth: number };
  };
  overallHealth: number;
}

let initialized = false;

/** Initialize all ORACLE Ultimate systems. */
export function init(): void {
  if (initialized) return;
  initialized = true;
  console.log('[ORACLE] Ultimate Form v9.0.0 "Omniscience" initialized — 11 systems online');
}

/** Get comprehensive health across all 11 systems. */
export function health(): OracleUltimateHealth {
  const bayesian = getBayesianStats();
  const forecast = getForecastStats();
  const simulation = getSimulationStats();
  const prescriptive = getPrescriptiveStats();
  const journal = getJournalStats();
  const earlyWarn = getEarlyWarningStats();
  const capacity = getCapacityStats();
  const causal = getCausalStats();
  const risk = getRiskStats();
  const riskSnap = getRiskSnapshot();
  const market = getMarketStats();
  const telemetry = getSnapshot({
    modelCount: market.activeModels,
    avgCredibility: market.avgCredibility,
    activeWarnings: earlyWarn.activeWarnings,
    overallRisk: riskSnap.overallRisk,
    adoptionRate: prescriptive.adoptionRate,
    brierScore: journal.brierScore,
  });

  const systems = {
    bayesianNetwork: {
      healthy: true,
      networks: bayesian.activeNetworks,
      inferences: bayesian.totalInferences,
    },
    trendForecaster: {
      healthy: true,
      series: forecast.totalSeries,
      anomalies: forecast.totalAnomalies,
    },
    scenarioSimulator: {
      healthy: true,
      simulations: simulation.totalSimulations,
      convergenceRate: simulation.avgConvergenceRate,
    },
    prescriptiveEngine: {
      healthy: prescriptive.pendingCount < 100,
      pending: prescriptive.pendingCount,
      adoptionRate: prescriptive.adoptionRate,
    },
    prophecyJournal: {
      healthy: journal.brierScore < 0.3,
      total: journal.total,
      brierScore: journal.brierScore,
    },
    earlyWarning: {
      healthy: earlyWarn.bySeverity.imminent === 0,
      activeWarnings: earlyWarn.activeWarnings,
      signals: earlyWarn.activeSignals,
    },
    capacityPlanner: {
      healthy: capacity.criticalCount === 0,
      tracked: capacity.trackedResources,
      criticalCount: capacity.criticalCount,
    },
    causalInference: {
      healthy: true,
      dags: causal.totalDAGs,
      significantRelationships: causal.significantRelationships,
    },
    riskMatrix: {
      healthy: risk.criticalCount === 0,
      overallRisk: riskSnap.overallRisk,
      criticalCount: risk.criticalCount,
    },
    predictionMarket: {
      healthy: market.avgCredibility > 0.3,
      activeModels: market.activeModels,
      avgCredibility: market.avgCredibility,
    },
    telemetryNexus: {
      healthy: telemetry.systemHealth > 40,
      predictionsPerHour: telemetry.predictionsPerHour,
      systemHealth: telemetry.systemHealth,
    },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Omniscience', initialized, systems, overallHealth };
}

/** Run periodic maintenance (call every 5-10 seconds). */
export function runCLM(): { expiredProphecies: number; expiredRecs: number; newWarnings: number } {
  const expiredProphecies = expireProphecies();
  const expiredRecs = expireStale();
  const newWarnings = evaluateConvergence().length;

  recordTelemetryEvent('prediction', 0, true); // Heartbeat

  return { expiredProphecies, expiredRecs, newWarnings };
}

/** Full resilience check. */
export function resilience(): {
  brierScoreHealthy: boolean;
  noImminentWarnings: boolean;
  noCriticalRisks: boolean;
  marketCredibilityHealthy: boolean;
  capacityStable: boolean;
} {
  const journal = getJournalStats();
  const warns = getEarlyWarningStats();
  const risk = getRiskStats();
  const market = getMarketStats();
  const capacity = getCapacityStats();

  return {
    brierScoreHealthy: journal.brierScore < 0.3,
    noImminentWarnings: warns.bySeverity.imminent === 0,
    noCriticalRisks: risk.criticalCount === 0,
    marketCredibilityHealthy: market.avgCredibility > 0.3 || market.activeModels === 0,
    capacityStable: capacity.criticalCount === 0,
  };
}

/** Reset all ultimate form state. */
export function resetAll(): void {
  resetBayesianState();
  resetForecastState();
  resetSimulationState();
  resetPrescriptiveState();
  resetJournalState();
  resetEarlyWarningState();
  resetCapacityState();
  resetCausalState();
  resetRiskState();
  resetMarketState();
  resetTelemetryState();
  initialized = false;
}
