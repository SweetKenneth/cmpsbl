/**
 * COMPASS Ultimate Form — v10.0.0 "Navigator Prime"
 * Unified export and lifecycle API for all 20 Ultimate Form systems.
 *
 * Original Systems (v9.0.0 "Meridian"):
 *  1. Coordinate Registry
 *  2. Contextual Waypoint Engine
 *  3. Semantic Proximity Graph
 *  4. Temporal Cartography
 *  5. Route Optimizer
 *  6. Drift Compass
 *  7. Landmark Registry
 *  8. Exploration Frontier
 *  9. Bearing Calculator
 * 10. Compass Telemetry
 *
 * Geospatial Systems (v10.0.0 "Navigator Prime"):
 * 11. Geospatial R-Tree Index
 * 12. Multi-Projection Engine
 * 13. Geofence Engine
 * 14. Trajectory Analyzer
 * 15. Isochrone Generator
 * 16. Temporal Fusion Engine
 * 17. Spatial Anomaly Detector
 * 18. Route Corridor Optimizer
 * 19. Coordinate Gravity Model
 * 20. Spatial Telemetry Dashboard
 */

// ── Original 10 Systems ─────────────────────────────────────────
export * from './coordinateRegistry';
export * from './waypointEngine';
export * from './proximityGraph';
export * from './temporalCartography';
export * from './routeOptimizer';
export * from './driftCompass';
export * from './landmarkRegistry';
export * from './explorationFrontier';
export * from './bearingCalculator';
export * from './compassTelemetry';

// ── Geospatial 10 Systems ───────────────────────────────────────
export * from './spatialIndex';
export * from './projectionEngine';
export * from './geofenceEngine';
export * from './trajectoryAnalyzer';
export * from './isochroneGenerator';
export * from './temporalFusion';
export * from './spatialAnomalyDetector';
export * from './routeCorridorOptimizer';
export * from './coordinateGravity';
export * from './spatialTelemetry';

// ── Imports for Lifecycle ───────────────────────────────────────
import { getCoordinateStats, resetCoordinateState } from './coordinateRegistry';
import { getWaypointStats, resetWaypointState } from './waypointEngine';
import { getProximityStats, resetProximityState } from './proximityGraph';
import { getTemporalStats, resetTemporalState } from './temporalCartography';
import { getRouteStats, resetRouteState } from './routeOptimizer';
import { getDriftStats, resetDriftState } from './driftCompass';
import { getLandmarkStats, resetLandmarkState } from './landmarkRegistry';
import { getFrontierStats, resetFrontierState } from './explorationFrontier';
import { getBearingStats, resetBearingState } from './bearingCalculator';
import { getCompassTelemetryStats, resetCompassTelemetryState } from './compassTelemetry';
import { getSpatialIndexStats, resetSpatialIndex } from './spatialIndex';
import { getProjectionStats, resetProjectionEngine } from './projectionEngine';
import { getGeofenceStats, resetGeofenceEngine } from './geofenceEngine';
import { getTrajectoryStats, resetTrajectoryAnalyzer } from './trajectoryAnalyzer';
import { getIsochroneStats, resetIsochroneGenerator } from './isochroneGenerator';
import { getTemporalFusionStats, resetTemporalFusion } from './temporalFusion';
import { getSpatialAnomalyStats, resetSpatialAnomalyDetector } from './spatialAnomalyDetector';
import { getCorridorStats, resetCorridorOptimizer } from './routeCorridorOptimizer';
import { getGravityStats, resetGravityModel } from './coordinateGravity';
import { getSpatialTelemetryDashboard, resetSpatialTelemetry } from './spatialTelemetry';

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompassUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
    // Original 10
    coordinateRegistry: { healthy: boolean; entities: number; dimensionality: number };
    waypointEngine: { healthy: boolean; journeys: number; efficiency: number };
    proximityGraph: { healthy: boolean; nodes: number; edges: number };
    temporalCartography: { healthy: boolean; events: number; anomalyRate: number };
    routeOptimizer: { healthy: boolean; edges: number; avgReliability: number };
    driftCompass: { healthy: boolean; measurements: number; criticalDrifts: number };
    landmarkRegistry: { healthy: boolean; landmarks: number; avgPerDay: number };
    explorationFrontier: { healthy: boolean; coverage: number; unexplored: number };
    bearingCalculator: { healthy: boolean; bearings: number; avgConfidence: number };
    compassTelemetry: { healthy: boolean; snapshots: number; trend: string };
    // Geospatial 10
    spatialIndex: { healthy: boolean; entries: number; avgQueryMs: number };
    projectionEngine: { healthy: boolean; transformations: number };
    geofenceEngine: { healthy: boolean; fences: number; events: number };
    trajectoryAnalyzer: { healthy: boolean; trajectories: number; stops: number };
    isochroneGenerator: { healthy: boolean; generated: number };
    temporalFusion: { healthy: boolean; patterns: number; hotspots: number };
    spatialAnomalyDetector: { healthy: boolean; anomalies: number; critical: number };
    corridorOptimizer: { healthy: boolean; plans: number; avgEfficiency: number };
    gravityModel: { healthy: boolean; bodies: number; energy: number };
    spatialTelemetryDashboard: { healthy: boolean; health: number; trend: string };
  };
  overallHealth: number;
}

let initialized = false;

export function init(): void {
  if (initialized) return;
  initialized = true;
  console.log('[COMPASS] Ultimate Form v10.0.0 "Navigator Prime" initialized — 20 systems online');
}

export function health(): CompassUltimateHealth {
  const coords = getCoordinateStats();
  const waypoints = getWaypointStats();
  const proximity = getProximityStats();
  const temporal = getTemporalStats();
  const routes = getRouteStats();
  const drift = getDriftStats();
  const landmarks = getLandmarkStats();
  const frontier = getFrontierStats();
  const bearing = getBearingStats();
  const telemetry = getCompassTelemetryStats();
  const spatial = getSpatialIndexStats();
  const projection = getProjectionStats();
  const geofence = getGeofenceStats();
  const trajectory = getTrajectoryStats();
  const isochrone = getIsochroneStats();
  const fusion = getTemporalFusionStats();
  const anomaly = getSpatialAnomalyStats();
  const corridor = getCorridorStats();
  const gravity = getGravityStats();
  const dashboard = getSpatialTelemetryDashboard();

  const systems = {
    coordinateRegistry: { healthy: true, entities: coords.totalEntities, dimensionality: coords.dimensionality },
    waypointEngine: { healthy: waypoints.avgEfficiency > 0.2 || waypoints.totalJourneys === 0, journeys: waypoints.totalJourneys, efficiency: waypoints.avgEfficiency },
    proximityGraph: { healthy: true, nodes: proximity.totalNodes, edges: proximity.totalEdges },
    temporalCartography: { healthy: temporal.anomalyRate < 0.5 || temporal.totalEvents === 0, events: temporal.totalEvents, anomalyRate: temporal.anomalyRate },
    routeOptimizer: { healthy: routes.avgReliability > 0.3 || routes.totalRoutes === 0, edges: routes.totalEdges, avgReliability: routes.avgReliability },
    driftCompass: { healthy: drift.criticalDrifts < 10, measurements: drift.totalMeasurements, criticalDrifts: drift.criticalDrifts },
    landmarkRegistry: { healthy: true, landmarks: landmarks.totalLandmarks, avgPerDay: landmarks.avgPerDay },
    explorationFrontier: { healthy: true, coverage: frontier.coverageRate, unexplored: frontier.unexploredCells },
    bearingCalculator: { healthy: bearing.avgConfidence > 0.3 || bearing.totalBearings === 0, bearings: bearing.totalBearings, avgConfidence: bearing.avgConfidence },
    compassTelemetry: { healthy: telemetry.trendDirection !== 'degrading', snapshots: telemetry.snapshotCount, trend: telemetry.trendDirection },
    spatialIndex: { healthy: spatial.avgQueryTimeMs < 10, entries: spatial.totalEntries, avgQueryMs: spatial.avgQueryTimeMs },
    projectionEngine: { healthy: true, transformations: projection.totalTransformations },
    geofenceEngine: { healthy: true, fences: geofence.totalFences, events: geofence.totalEvents },
    trajectoryAnalyzer: { healthy: true, trajectories: trajectory.totalTrajectories, stops: trajectory.totalStopsDetected },
    isochroneGenerator: { healthy: true, generated: isochrone.totalGenerated },
    temporalFusion: { healthy: true, patterns: fusion.totalPatterns, hotspots: fusion.totalHotspots },
    spatialAnomalyDetector: { healthy: anomaly.criticalAnomalies < 10, anomalies: anomaly.totalAnomalies, critical: anomaly.criticalAnomalies },
    corridorOptimizer: { healthy: true, plans: corridor.totalPlans, avgEfficiency: corridor.avgEfficiency },
    gravityModel: { healthy: true, bodies: gravity.totalBodies, energy: gravity.totalEnergy },
    spatialTelemetryDashboard: { healthy: dashboard.trend !== 'degrading', health: dashboard.currentHealth, trend: dashboard.trend },
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '10.0.0', codename: 'Navigator Prime', initialized, systems, overallHealth };
}

export function runCLM(): { driftAlerts: number; frontierCoverage: number; trend: string; spatialHealth: number } {
  const drift = getDriftStats();
  const frontier = getFrontierStats();
  const telemetry = getCompassTelemetryStats();
  const dashboard = getSpatialTelemetryDashboard();
  return {
    driftAlerts: drift.totalAlerts,
    frontierCoverage: frontier.coverageRate,
    trend: telemetry.trendDirection,
    spatialHealth: dashboard.currentHealth,
  };
}

export function resilience(): {
  noCriticalDrift: boolean;
  routesHealthy: boolean;
  temporalClean: boolean;
  bearingConfident: boolean;
  spatialIndexFast: boolean;
  noSpatialAnomalies: boolean;
} {
  const drift = getDriftStats();
  const routeS = getRouteStats();
  const temporalS = getTemporalStats();
  const bearingS = getBearingStats();
  const spatialS = getSpatialIndexStats();
  const anomalyS = getSpatialAnomalyStats();
  return {
    noCriticalDrift: drift.criticalDrifts === 0,
    routesHealthy: routeS.avgReliability > 0.3 || routeS.totalRoutes === 0,
    temporalClean: temporalS.anomalyRate < 0.3 || temporalS.totalEvents === 0,
    bearingConfident: bearingS.avgConfidence > 0.3 || bearingS.totalBearings === 0,
    spatialIndexFast: spatialS.avgQueryTimeMs < 5,
    noSpatialAnomalies: anomalyS.criticalAnomalies === 0,
  };
}

export function resetAll(): void {
  resetCoordinateState();
  resetWaypointState();
  resetProximityState();
  resetTemporalState();
  resetRouteState();
  resetDriftState();
  resetLandmarkState();
  resetFrontierState();
  resetBearingState();
  resetCompassTelemetryState();
  resetSpatialIndex();
  resetProjectionEngine();
  resetGeofenceEngine();
  resetTrajectoryAnalyzer();
  resetIsochroneGenerator();
  resetTemporalFusion();
  resetSpatialAnomalyDetector();
  resetCorridorOptimizer();
  resetGravityModel();
  resetSpatialTelemetry();
  initialized = false;
}
