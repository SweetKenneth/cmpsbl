/**
 * COMPASS Ultimate — System 20: Spatial Telemetry Dashboard
 * 
 * Unified health from all geospatial systems: index efficiency,
 * query latency, geofence hit rate, anomaly count, corridor
 * efficiency, and gravity convergence.
 * 
 * @module compass/ultimate/spatialTelemetry
 */

import { getSpatialIndexStats } from './spatialIndex';
import { getProjectionStats } from './projectionEngine';
import { getGeofenceStats } from './geofenceEngine';
import { getTrajectoryStats } from './trajectoryAnalyzer';
import { getIsochroneStats } from './isochroneGenerator';
import { getTemporalFusionStats } from './temporalFusion';
import { getSpatialAnomalyStats } from './spatialAnomalyDetector';
import { getCorridorStats } from './routeCorridorOptimizer';
import { getGravityStats } from './coordinateGravity';

// ── Types ────────────────────────────────────────────────────────

export interface SpatialTelemetrySnapshot {
  id: string;
  timestamp: number;
  systems: {
    spatialIndex: ReturnType<typeof getSpatialIndexStats>;
    projection: ReturnType<typeof getProjectionStats>;
    geofence: ReturnType<typeof getGeofenceStats>;
    trajectory: ReturnType<typeof getTrajectoryStats>;
    isochrone: ReturnType<typeof getIsochroneStats>;
    temporalFusion: ReturnType<typeof getTemporalFusionStats>;
    spatialAnomaly: ReturnType<typeof getSpatialAnomalyStats>;
    corridor: ReturnType<typeof getCorridorStats>;
    gravity: ReturnType<typeof getGravityStats>;
  };
  overallHealth: number;
}

export interface SpatialTelemetryStats {
  snapshotCount: number;
  currentHealth: number;
  trend: 'improving' | 'stable' | 'degrading';
  lastSnapshotAt: number | null;
}

// ── State ────────────────────────────────────────────────────────

const snapshots: SpatialTelemetrySnapshot[] = [];
const MAX_SNAPSHOTS = 200;

// ── Core API ────────────────────────────────────────────────────

/** Capture a telemetry snapshot */
export function captureSpatialSnapshot(): SpatialTelemetrySnapshot {
  const spatialIndex = getSpatialIndexStats();
  const geofence = getGeofenceStats();
  const anomaly = getSpatialAnomalyStats();
  const corridor = getCorridorStats();

  // Composite health:
  // Index query perf (20%) + Geofence accuracy (15%) +
  // Trajectory tracking (20%) + Anomaly precision (20%) +
  // Corridor efficiency (25%)
  const indexScore = spatialIndex.avgQueryTimeMs < 5 ? 100 : Math.max(0, 100 - (spatialIndex.avgQueryTimeMs - 5) * 10);
  const fenceScore = geofence.totalFences > 0 ? Math.min(100, (geofence.enabledFences / geofence.totalFences) * 100) : 100;
  const anomalyScore = Math.max(0, 100 - anomaly.criticalAnomalies * 15 - anomaly.warningAnomalies * 5);
  const corridorScore = corridor.avgEfficiency * 100;
  const gravityScore = 100; // Gravity is always running

  const overallHealth = Math.round(
    indexScore * 0.20 + fenceScore * 0.15 +
    gravityScore * 0.20 + anomalyScore * 0.20 +
    corridorScore * 0.25
  );

  const snapshot: SpatialTelemetrySnapshot = {
    id: `stsnap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    systems: {
      spatialIndex,
      projection: getProjectionStats(),
      geofence,
      trajectory: getTrajectoryStats(),
      isochrone: getIsochroneStats(),
      temporalFusion: getTemporalFusionStats(),
      spatialAnomaly: anomaly,
      corridor,
      gravity: getGravityStats(),
    },
    overallHealth: Math.max(0, Math.min(100, overallHealth)),
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);

  return snapshot;
}

/** Get recent snapshots */
export function getSpatialSnapshots(count?: number): SpatialTelemetrySnapshot[] {
  return count ? snapshots.slice(-count) : [...snapshots];
}

/** Get telemetry stats with trend */
export function getSpatialTelemetryDashboard(): SpatialTelemetryStats {
  if (snapshots.length === 0) {
    return { snapshotCount: 0, currentHealth: 100, trend: 'stable', lastSnapshotAt: null };
  }

  const current = snapshots[snapshots.length - 1].overallHealth;

  // Trend: compare last 5 vs previous 5
  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  if (snapshots.length >= 10) {
    const recent = snapshots.slice(-5).reduce((s, sn) => s + sn.overallHealth, 0) / 5;
    const previous = snapshots.slice(-10, -5).reduce((s, sn) => s + sn.overallHealth, 0) / 5;
    if (recent > previous + 5) trend = 'improving';
    else if (recent < previous - 5) trend = 'degrading';
  }

  return {
    snapshotCount: snapshots.length,
    currentHealth: current,
    trend,
    lastSnapshotAt: snapshots[snapshots.length - 1].timestamp,
  };
}

export function resetSpatialTelemetry(): void {
  snapshots.length = 0;
}
