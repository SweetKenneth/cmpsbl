/**
 * COMPASS Ultimate — Compass Telemetry
 * Real-time observability: navigation patterns, route efficiency, drift alerts,
 * frontier coverage, waypoint heat, and positional health scoring.
 */

export interface CompassTelemetrySnapshot {
  timestamp: number;
  registeredEntities: number;
  activeJourneys: number;
  journeyEfficiency: number;
  proximityEdges: number;
  routeAvgLatency: number;
  driftAlerts: number;
  frontierCoverage: number;
  landmarkCount: number;
  bearingConfidence: number;
  systemHealth: number;
}

export interface CompassTelemetryStats {
  snapshotCount: number;
  avgHealth: number;
  avgEfficiency: number;
  trendDirection: 'improving' | 'stable' | 'degrading';
}

const MAX_SNAPSHOTS = 200;
const snapshots: CompassTelemetrySnapshot[] = [];

export function recordCompassSnapshot(
  data: Omit<CompassTelemetrySnapshot, 'timestamp' | 'systemHealth'>
): CompassTelemetrySnapshot {
  const healthFactors = [
    Math.min(25, data.registeredEntities > 0 ? 25 : 10),
    data.journeyEfficiency * 20,
    data.frontierCoverage * 20,
    data.bearingConfidence * 15,
    data.driftAlerts < 5 ? 10 : data.driftAlerts < 20 ? 5 : 0,
    data.routeAvgLatency < 100 ? 10 : data.routeAvgLatency < 500 ? 5 : 0,
  ];
  const systemHealth = Math.min(100, Math.round(healthFactors.reduce((a, b) => a + b, 0)));

  const snapshot: CompassTelemetrySnapshot = { ...data, timestamp: Date.now(), systemHealth };

  if (snapshots.length >= MAX_SNAPSHOTS) snapshots.shift();
  snapshots.push(snapshot);
  return snapshot;
}

export function getCompassTelemetryStats(): CompassTelemetryStats {
  if (snapshots.length === 0) {
    return { snapshotCount: 0, avgHealth: 100, avgEfficiency: 0, trendDirection: 'stable' };
  }

  const avgHealth = snapshots.reduce((s, snap) => s + snap.systemHealth, 0) / snapshots.length;
  const avgEff = snapshots.reduce((s, snap) => s + snap.journeyEfficiency, 0) / snapshots.length;

  const q = Math.max(1, Math.floor(snapshots.length / 4));
  const earlyAvg = snapshots.slice(0, q).reduce((s, snap) => s + snap.systemHealth, 0) / q;
  const lateAvg = snapshots.slice(-q).reduce((s, snap) => s + snap.systemHealth, 0) / q;

  const trendDirection: CompassTelemetryStats['trendDirection'] =
    lateAvg > earlyAvg + 5 ? 'improving'
    : lateAvg < earlyAvg - 5 ? 'degrading'
    : 'stable';

  return { snapshotCount: snapshots.length, avgHealth, avgEfficiency: avgEff, trendDirection };
}

export function getLatestCompassSnapshot(): CompassTelemetrySnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function resetCompassTelemetryState(): void { snapshots.length = 0; }
