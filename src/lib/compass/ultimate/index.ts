/**
 * COMPASS Ultimate Form — v9.0.0 "Meridian"
 * Unified export and lifecycle API for all 10 Ultimate Form systems.
 *
 * Systems:
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
 */

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

// ═══════════════════════════════════════════════════════════════════════════════
// LIFECYCLE API
// ═══════════════════════════════════════════════════════════════════════════════

export interface CompassUltimateHealth {
  version: string;
  codename: string;
  initialized: boolean;
  systems: {
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
  };
  overallHealth: number;
}

let initialized = false;

export function init(): void {
  if (initialized) return;
  initialized = true;
  console.log('[COMPASS] Ultimate Form v9.0.0 "Meridian" initialized — 10 systems online');
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
  };

  const healthScores = Object.values(systems).map(s => s.healthy ? 100 : 40);
  const overallHealth = Math.round(healthScores.reduce((s, h) => s + h, 0) / healthScores.length);

  return { version: '9.0.0', codename: 'Meridian', initialized, systems, overallHealth };
}

export function runCLM(): { driftAlerts: number; frontierCoverage: number; trend: string } {
  const drift = getDriftStats();
  const frontier = getFrontierStats();
  const telemetry = getCompassTelemetryStats();
  return { driftAlerts: drift.totalAlerts, frontierCoverage: frontier.coverageRate, trend: telemetry.trendDirection };
}

export function resilience(): {
  noCriticalDrift: boolean;
  routesHealthy: boolean;
  temporalClean: boolean;
  bearingConfident: boolean;
} {
  const drift = getDriftStats();
  const routes = getRouteStats();
  const temporal = getTemporalStats();
  const bearing = getBearingStats();
  return {
    noCriticalDrift: drift.criticalDrifts === 0,
    routesHealthy: routes.avgReliability > 0.3 || routes.totalRoutes === 0,
    temporalClean: temporal.anomalyRate < 0.3 || temporal.totalEvents === 0,
    bearingConfident: bearing.avgConfidence > 0.3 || bearing.totalBearings === 0,
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
  initialized = false;
}
