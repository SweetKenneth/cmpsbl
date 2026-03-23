/**
 * SHADOW Ultimate Form — v9.0.0 "Doppelgänger"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
 *  1. Shadow Execution Chamber
 *  2. Divergence Analyzer
 *  3. Traffic Mirror
 *  4. A/B Verdict Engine
 *  5. Behavioral Fingerprinter
 *  6. Chaos Injection Engine
 *  7. Convergence Tracker
 *  8. Snapshot Manager
 *  9. Leakage Detector
 * 10. Shadow Telemetry
 */

export * from './executionChamber';
export * from './divergenceAnalyzer';
export * from './trafficMirror';
export * from './abVerdictEngine';
export * from './behavioralFingerprinter';
export * from './chaosInjection';
export * from './convergenceTracker';
export * from './snapshotManager';
export * from './leakageDetector';
export * from './shadowTelemetry';

import { getChamberStats, resetChamberState } from './executionChamber';
import { getDivergenceStats, resetDivergenceState } from './divergenceAnalyzer';
import { getMirrorStats, resetMirrorState } from './trafficMirror';
import { getABStats, resetABState } from './abVerdictEngine';
import { getFingerprintStats, resetFingerprintState } from './behavioralFingerprinter';
import { getChaosStats, resetChaosState } from './chaosInjection';
import { getConvergenceStats, resetConvergenceState } from './convergenceTracker';
import { getSnapshotStats, resetSnapshotState } from './snapshotManager';
import { getLeakageStats, resetLeakageState } from './leakageDetector';
import { getShadowTelemetryStats, resetShadowTelemetryState } from './shadowTelemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface ShadowUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    executionChamber: { healthy: boolean; active: number; completed: number; leaked: number };
    divergenceAnalyzer: { healthy: boolean; reports: number; passRate: number };
    trafficMirror: { healthy: boolean; configs: number; mirrored: number };
    abVerdictEngine: { healthy: boolean; verdicts: number; aggressiveWinRate: number };
    behavioralFingerprinter: { healthy: boolean; fingerprints: number; driftDetections: number };
    chaosInjection: { healthy: boolean; scenarios: number; survivalRate: number };
    convergenceTracker: { healthy: boolean; tracks: number; converged: number };
    snapshotManager: { healthy: boolean; snapshots: number; totalSizeBytes: number };
    leakageDetector: { healthy: boolean; events: number; isolationRate: number };
    shadowTelemetry: { healthy: boolean; snapshots: number; trend: string };
  };
  overallHealth: number;
}

let initialized = false;

export function init(): void {
  if (initialized) return;
  initialized = true;
  console.log('[SHADOW] Ultimate Form v9.0.0 "Doppelgänger" initialized — 10 systems online');
}

export function health(): ShadowUltimateHealth {
  const chamber = getChamberStats();
  const divergence = getDivergenceStats();
  const mirror = getMirrorStats();
  const ab = getABStats();
  const fp = getFingerprintStats();
  const chaos = getChaosStats();
  const convergence = getConvergenceStats();
  const snap = getSnapshotStats();
  const leakage = getLeakageStats();
  const telemetry = getShadowTelemetryStats();

  const aggressiveWinRate = ab.totalVerdicts > 0 ? ab.aggressiveWins / ab.totalVerdicts : 0;

  const systems = {
    executionChamber: { healthy: chamber.leakedSessions === 0, active: chamber.activeSessions, completed: chamber.completedSessions, leaked: chamber.leakedSessions },
    divergenceAnalyzer: { healthy: divergence.passRate > 0.5 || divergence.totalReports === 0, reports: divergence.totalReports, passRate: divergence.passRate },
    trafficMirror: { healthy: true, configs: mirror.totalConfigs, mirrored: mirror.totalMirrored },
    abVerdictEngine: { healthy: true, verdicts: ab.totalVerdicts, aggressiveWinRate },
    behavioralFingerprinter: { healthy: fp.avgSimilarity > 0.7 || fp.totalFingerprints === 0, fingerprints: fp.totalFingerprints, driftDetections: fp.driftDetections },
    chaosInjection: { healthy: chaos.survivalRate > 0.5 || chaos.totalScenarios === 0, scenarios: chaos.totalScenarios, survivalRate: chaos.survivalRate },
    convergenceTracker: { healthy: true, tracks: convergence.totalTracks, converged: convergence.convergedTracks },
    snapshotManager: { healthy: true, snapshots: snap.totalSnapshots, totalSizeBytes: snap.totalSizeBytes },
    leakageDetector: { healthy: leakage.fatalEvents === 0, events: leakage.totalEvents, isolationRate: leakage.isolationSuccessRate },
    shadowTelemetry: { healthy: telemetry.trendDirection !== 'degrading', snapshots: telemetry.snapshotCount, trend: telemetry.trendDirection },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Doppelgänger', initialized, systems, overallHealth };
}

export function runCLM(): { divergencePassRate: number; convergenceRate: number; chaosSurvival: number } {
  const divergence = getDivergenceStats();
  const convergence = getConvergenceStats();
  const chaos = getChaosStats();
  return {
    divergencePassRate: divergence.passRate,
    convergenceRate: convergence.totalTracks > 0 ? convergence.convergedTracks / convergence.totalTracks : 0,
    chaosSurvival: chaos.survivalRate,
  };
}

export function resilience(): {
  noLeakage: boolean;
  highPassRate: boolean;
  chaosResilient: boolean;
  isolationIntact: boolean;
} {
  const leakage = getLeakageStats();
  const divergence = getDivergenceStats();
  const chaos = getChaosStats();
  return {
    noLeakage: leakage.fatalEvents === 0,
    highPassRate: divergence.passRate > 0.7 || divergence.totalReports === 0,
    chaosResilient: chaos.survivalRate > 0.7 || chaos.totalScenarios === 0,
    isolationIntact: leakage.isolationSuccessRate > 0.95 || leakage.totalEvents === 0,
  };
}

export function resetAll(): void {
  resetChamberState();
  resetDivergenceState();
  resetMirrorState();
  resetABState();
  resetFingerprintState();
  resetChaosState();
  resetConvergenceState();
  resetSnapshotState();
  resetLeakageState();
  resetShadowTelemetryState();
  initialized = false;
}
