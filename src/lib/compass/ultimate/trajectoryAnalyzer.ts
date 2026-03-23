/**
 * COMPASS Ultimate — System 14: Trajectory Analyzer
 * 
 * Movement pattern detection — speed, heading, stops, clustering
 * (DBSCAN-inspired). Tracks entity movement over time for
 * behavioral pattern extraction.
 * 
 * @module compass/ultimate/trajectoryAnalyzer
 */

// ── Types ────────────────────────────────────────────────────────

export interface TrajectoryPoint {
  lat: number;
  lon: number;
  timestamp: number;
}

export interface TrajectorySegment {
  from: TrajectoryPoint;
  to: TrajectoryPoint;
  distanceM: number;
  speedMps: number;
  headingDeg: number;
  durationMs: number;
}

export interface StopDetection {
  centroidLat: number;
  centroidLon: number;
  startTime: number;
  endTime: number;
  dwellMs: number;
  pointCount: number;
}

export interface TrajectoryCluster {
  id: string;
  centroidLat: number;
  centroidLon: number;
  pointCount: number;
  radiusM: number;
  frequency: number;       // How many trajectories visit this cluster
}

export interface TrajectoryAnalysis {
  entityId: string;
  totalPoints: number;
  totalDistanceM: number;
  totalDurationMs: number;
  avgSpeedMps: number;
  maxSpeedMps: number;
  segments: TrajectorySegment[];
  stops: StopDetection[];
  clusters: TrajectoryCluster[];
}

export interface TrajectoryStats {
  totalTrajectories: number;
  totalPointsTracked: number;
  totalStopsDetected: number;
  totalClusters: number;
  avgTrajectoryLength: number;
}

// ── State ────────────────────────────────────────────────────────

const trajectories: Map<string, TrajectoryPoint[]> = new Map();
const clusters: TrajectoryCluster[] = [];
const MAX_POINTS_PER_ENTITY = 1000;
const MAX_ENTITIES = 500;
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6_378_137;

// Stop detection params
const STOP_RADIUS_M = 50;
const STOP_MIN_DURATION_MS = 120_000; // 2 minutes
// Cluster params
const CLUSTER_RADIUS_M = 200;
const CLUSTER_MIN_POINTS = 3;

let totalStops = 0;

// ── Core API ────────────────────────────────────────────────────

/** Record a position for an entity */
export function recordPosition(entityId: string, lat: number, lon: number, timestamp?: number): void {
  if (!trajectories.has(entityId)) {
    trajectories.set(entityId, []);
    if (trajectories.size > MAX_ENTITIES) {
      const oldest = trajectories.keys().next().value;
      if (oldest) trajectories.delete(oldest);
    }
  }

  const points = trajectories.get(entityId)!;
  points.push({ lat, lon, timestamp: timestamp ?? Date.now() });

  if (points.length > MAX_POINTS_PER_ENTITY) {
    points.splice(0, points.length - MAX_POINTS_PER_ENTITY);
  }
}

/** Analyze trajectory for an entity */
export function analyzeTrajectory(entityId: string): TrajectoryAnalysis | null {
  const points = trajectories.get(entityId);
  if (!points || points.length < 2) return null;

  const segments: TrajectorySegment[] = [];
  let totalDistanceM = 0;
  let maxSpeedMps = 0;

  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    const distanceM = haversine(from.lat, from.lon, to.lat, to.lon);
    const durationMs = to.timestamp - from.timestamp;
    const speedMps = durationMs > 0 ? distanceM / (durationMs / 1000) : 0;
    const headingDeg = bearing(from.lat, from.lon, to.lat, to.lon);

    segments.push({ from, to, distanceM, speedMps, headingDeg, durationMs });
    totalDistanceM += distanceM;
    if (speedMps > maxSpeedMps) maxSpeedMps = speedMps;
  }

  const totalDurationMs = points[points.length - 1].timestamp - points[0].timestamp;
  const stops = detectStops(points);
  totalStops += stops.length;

  const entityClusters = detectClusters(points);

  return {
    entityId,
    totalPoints: points.length,
    totalDistanceM: Math.round(totalDistanceM),
    totalDurationMs,
    avgSpeedMps: totalDurationMs > 0 ? Math.round((totalDistanceM / (totalDurationMs / 1000)) * 100) / 100 : 0,
    maxSpeedMps: Math.round(maxSpeedMps * 100) / 100,
    segments,
    stops,
    clusters: entityClusters,
  };
}

/** Detect stops in a point sequence */
function detectStops(points: TrajectoryPoint[]): StopDetection[] {
  const stops: StopDetection[] = [];
  let i = 0;

  while (i < points.length) {
    let j = i + 1;
    while (j < points.length) {
      const dist = haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon);
      if (dist > STOP_RADIUS_M) break;
      j++;
    }

    const duration = (j > i + 1) ? points[j - 1].timestamp - points[i].timestamp : 0;
    if (duration >= STOP_MIN_DURATION_MS) {
      const cluster = points.slice(i, j);
      const centLat = cluster.reduce((s, p) => s + p.lat, 0) / cluster.length;
      const centLon = cluster.reduce((s, p) => s + p.lon, 0) / cluster.length;

      stops.push({
        centroidLat: Math.round(centLat * 1e6) / 1e6,
        centroidLon: Math.round(centLon * 1e6) / 1e6,
        startTime: points[i].timestamp,
        endTime: points[j - 1].timestamp,
        dwellMs: duration,
        pointCount: j - i,
      });
    }
    i = Math.max(i + 1, j);
  }

  return stops;
}

/** DBSCAN-inspired clustering */
function detectClusters(points: TrajectoryPoint[]): TrajectoryCluster[] {
  const visited = new Set<number>();
  const result: TrajectoryCluster[] = [];

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;

    const neighbors: number[] = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue;
      if (haversine(points[i].lat, points[i].lon, points[j].lat, points[j].lon) <= CLUSTER_RADIUS_M) {
        neighbors.push(j);
      }
    }

    if (neighbors.length >= CLUSTER_MIN_POINTS) {
      visited.add(i);
      const clusterIndices = [i, ...neighbors];
      for (const n of neighbors) visited.add(n);

      const clusterPts = clusterIndices.map(idx => points[idx]);
      const centLat = clusterPts.reduce((s, p) => s + p.lat, 0) / clusterPts.length;
      const centLon = clusterPts.reduce((s, p) => s + p.lon, 0) / clusterPts.length;
      const maxR = Math.max(...clusterPts.map(p => haversine(centLat, centLon, p.lat, p.lon)));

      result.push({
        id: `tc-${Date.now()}-${result.length}`,
        centroidLat: Math.round(centLat * 1e6) / 1e6,
        centroidLon: Math.round(centLon * 1e6) / 1e6,
        pointCount: clusterPts.length,
        radiusM: Math.round(maxR),
        frequency: 1,
      });
    }
  }

  return result;
}

// ── Helpers ──────────────────────────────────────────────────────

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const y = Math.sin(dLon) * Math.cos(lat2 * DEG_TO_RAD);
  const x = Math.cos(lat1 * DEG_TO_RAD) * Math.sin(lat2 * DEG_TO_RAD) - Math.sin(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.cos(dLon);
  return ((Math.atan2(y, x) / DEG_TO_RAD) + 360) % 360;
}

// ── Stats ────────────────────────────────────────────────────────

export function getTrajectoryStats(): TrajectoryStats {
  const allPoints = [...trajectories.values()];
  const totalPoints = allPoints.reduce((s, pts) => s + pts.length, 0);

  return {
    totalTrajectories: trajectories.size,
    totalPointsTracked: totalPoints,
    totalStopsDetected: totalStops,
    totalClusters: clusters.length,
    avgTrajectoryLength: trajectories.size > 0 ? Math.round(totalPoints / trajectories.size) : 0,
  };
}

export function resetTrajectoryAnalyzer(): void {
  trajectories.clear();
  clusters.length = 0;
  totalStops = 0;
}
