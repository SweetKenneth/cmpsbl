/**
 * SHADOW Ultimate — Shadow Telemetry
 * Observability across all shadow systems: sessions, divergence, convergence,
 * chaos resilience, leakage, verdicts, composite health.
 */

export interface ShadowTelemetrySnapshot {
  timestamp: number;
  activeSessions: number;
  divergenceAvg: number;
  convergenceRate: number;
  chaosSurvivalRate: number;
  leakageEvents: number;
  abVerdictMargin: number;
  fingerprintSimilarity: number;
  snapshotCount: number;
  systemHealth: number;
}

export interface ShadowTelemetryStats {
  snapshotCount: number;
  avgHealth: number;
  trendDirection: 'improving' | 'stable' | 'degrading';
}

const MAX_SNAPSHOTS = 200;
const snapshots: ShadowTelemetrySnapshot[] = [];

export function recordShadowSnapshot(
  data: Omit<ShadowTelemetrySnapshot, 'timestamp' | 'systemHealth'>
): ShadowTelemetrySnapshot {
  const healthFactors = [
    data.leakageEvents === 0 ? 20 : data.leakageEvents < 3 ? 10 : 0,
    data.divergenceAvg < 0.05 ? 20 : data.divergenceAvg < 0.15 ? 10 : 0,
    data.chaosSurvivalRate > 0.8 ? 15 : data.chaosSurvivalRate > 0.5 ? 8 : 0,
    data.convergenceRate > 0.5 ? 15 : data.convergenceRate > 0.2 ? 8 : 0,
    data.fingerprintSimilarity > 0.9 ? 15 : data.fingerprintSimilarity > 0.7 ? 8 : 0,
    data.activeSessions > 0 ? 15 : 10,
  ];
  const systemHealth = Math.min(100, Math.round(healthFactors.reduce((a, b) => a + b, 0)));

  const snapshot: ShadowTelemetrySnapshot = { ...data, timestamp: Date.now(), systemHealth };
  if (snapshots.length >= MAX_SNAPSHOTS) snapshots.shift();
  snapshots.push(snapshot);
  return snapshot;
}

export function getShadowTelemetryStats(): ShadowTelemetryStats {
  if (snapshots.length === 0) {
    return { snapshotCount: 0, avgHealth: 100, trendDirection: 'stable' };
  }
  const avgHealth = snapshots.reduce((s, snap) => s + snap.systemHealth, 0) / snapshots.length;
  const q = Math.max(1, Math.floor(snapshots.length / 4));
  const earlyAvg = snapshots.slice(0, q).reduce((s, snap) => s + snap.systemHealth, 0) / q;
  const lateAvg = snapshots.slice(-q).reduce((s, snap) => s + snap.systemHealth, 0) / q;
  const trendDirection: ShadowTelemetryStats['trendDirection'] =
    lateAvg > earlyAvg + 5 ? 'improving' : lateAvg < earlyAvg - 5 ? 'degrading' : 'stable';
  return { snapshotCount: snapshots.length, avgHealth, trendDirection };
}

export function getLatestShadowSnapshot(): ShadowTelemetrySnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function resetShadowTelemetryState(): void { snapshots.length = 0; }
