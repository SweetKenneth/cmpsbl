/**
 * PHANTOM Ultimate — Phantom Telemetry
 * Observability across all privacy systems: budget utilization, anonymization coverage,
 * synthetic data fidelity, canary status, consent compliance, re-identification risk.
 */

export interface PhantomTelemetrySnapshot {
  timestamp: number;
  dpBudgetUtilization: number;      // 0–1
  anonymizationCoverage: number;    // records processed
  syntheticFidelity: number;        // avg fidelity score
  canaryActive: number;
  canaryTripped: number;
  consentCompliance: number;        // 0–1 ratio of active consents
  reidRiskAvg: number;              // avg re-identification risk
  jurisdictionsActive: number;
  ledgerIntegrity: boolean;
  systemHealth: number;             // 0–100
}

export interface PhantomTelemetryStats {
  snapshotCount: number;
  avgHealth: number;
  trendDirection: 'improving' | 'stable' | 'degrading';
  criticalAlerts: number;
}

const MAX_SNAPSHOTS = 200;
const snapshots: PhantomTelemetrySnapshot[] = [];

export function recordPhantomSnapshot(
  data: Omit<PhantomTelemetrySnapshot, 'timestamp' | 'systemHealth'>
): PhantomTelemetrySnapshot {
  const healthFactors = [
    data.ledgerIntegrity ? 20 : 0,
    Math.min(20, data.consentCompliance * 20),
    data.reidRiskAvg < 0.3 ? 15 : data.reidRiskAvg < 0.6 ? 8 : 0,
    data.canaryTripped === 0 ? 15 : data.canaryTripped < 3 ? 8 : 0,
    data.dpBudgetUtilization < 0.8 ? 15 : data.dpBudgetUtilization < 0.95 ? 8 : 0,
    data.syntheticFidelity > 0.6 ? 15 : data.syntheticFidelity > 0.3 ? 8 : 0,
  ];
  const systemHealth = Math.min(100, Math.round(healthFactors.reduce((a, b) => a + b, 0)));

  const snapshot: PhantomTelemetrySnapshot = { ...data, timestamp: Date.now(), systemHealth };
  if (snapshots.length >= MAX_SNAPSHOTS) snapshots.shift();
  snapshots.push(snapshot);
  return snapshot;
}

export function getPhantomTelemetryStats(): PhantomTelemetryStats {
  if (snapshots.length === 0) {
    return { snapshotCount: 0, avgHealth: 100, trendDirection: 'stable', criticalAlerts: 0 };
  }

  const avgHealth = snapshots.reduce((s, snap) => s + snap.systemHealth, 0) / snapshots.length;
  const criticalAlerts = snapshots.filter(s => s.systemHealth < 40).length;

  const q = Math.max(1, Math.floor(snapshots.length / 4));
  const earlyAvg = snapshots.slice(0, q).reduce((s, snap) => s + snap.systemHealth, 0) / q;
  const lateAvg = snapshots.slice(-q).reduce((s, snap) => s + snap.systemHealth, 0) / q;

  const trendDirection: PhantomTelemetryStats['trendDirection'] =
    lateAvg > earlyAvg + 5 ? 'improving'
    : lateAvg < earlyAvg - 5 ? 'degrading'
    : 'stable';

  return { snapshotCount: snapshots.length, avgHealth, trendDirection, criticalAlerts };
}

export function getLatestPhantomSnapshot(): PhantomTelemetrySnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function resetPhantomTelemetryState(): void { snapshots.length = 0; }
