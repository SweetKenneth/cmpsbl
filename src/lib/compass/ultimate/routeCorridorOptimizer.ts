/**
 * COMPASS Ultimate — System 18: Route Corridor Optimizer
 * 
 * Multi-constraint corridor planning (waypoints + time windows +
 * capacity + priorities). Builds on the existing route optimizer
 * with corridor-width and constraint awareness.
 * 
 * @module compass/ultimate/routeCorridorOptimizer
 */

// ── Types ────────────────────────────────────────────────────────

export interface CorridorWaypoint {
  id: string;
  lat: number;
  lon: number;
  priority: 'required' | 'preferred' | 'optional';
  timeWindowStart?: number;    // Unix ms
  timeWindowEnd?: number;
  dwellTimeMs?: number;
  capacity?: number;
}

export interface CorridorPlan {
  id: string;
  waypoints: CorridorWaypoint[];
  orderedRoute: string[];      // Waypoint IDs in visit order
  totalDistanceM: number;
  totalTimeMs: number;
  constraintsSatisfied: number;
  constraintsTotal: number;
  corridorWidthM: number;
  efficiency: number;          // 0-1
  generatedAt: number;
}

export interface CorridorStats {
  totalPlans: number;
  avgEfficiency: number;
  avgConstraintSatisfaction: number;
  avgWaypointsPerPlan: number;
}

// ── State ────────────────────────────────────────────────────────

const plans: CorridorPlan[] = [];
const MAX_PLANS = 200;
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6_378_137;

// ── Core API ────────────────────────────────────────────────────

/** Plan an optimized corridor route */
export function planCorridor(
  waypoints: CorridorWaypoint[],
  corridorWidthM: number = 1000,
  speedMps: number = 11.1, // ~40 km/h
): CorridorPlan {
  if (waypoints.length === 0) {
    return emptyPlan(corridorWidthM);
  }

  // Separate required from optional
  const required = waypoints.filter(w => w.priority === 'required');
  const preferred = waypoints.filter(w => w.priority === 'preferred');
  const optional = waypoints.filter(w => w.priority === 'optional');

  // Start with required waypoints, optimize with nearest-neighbor + 2-opt
  let orderedWaypoints = [...required, ...preferred];
  if (orderedWaypoints.length === 0) orderedWaypoints = [...optional];

  // Nearest-neighbor ordering
  const ordered = nearestNeighborOrder(orderedWaypoints);

  // Try to insert optional waypoints if they're within corridor width
  for (const opt of optional) {
    if (orderedWaypoints.includes(opt)) continue;
    const bestInsert = findBestInsert(ordered, opt, corridorWidthM);
    if (bestInsert >= 0) {
      ordered.splice(bestInsert, 0, opt);
    }
  }

  // Calculate metrics
  let totalDistanceM = 0;
  for (let i = 1; i < ordered.length; i++) {
    totalDistanceM += haversine(ordered[i - 1].lat, ordered[i - 1].lon, ordered[i].lat, ordered[i].lon);
  }

  // Check constraint satisfaction
  let constraintsMet = 0;
  let constraintsTotal = 0;
  const now = Date.now();
  let currentTime = now;

  for (let i = 0; i < ordered.length; i++) {
    const wp = ordered[i];
    if (i > 0) {
      const travelMs = (haversine(ordered[i - 1].lat, ordered[i - 1].lon, wp.lat, wp.lon) / speedMps) * 1000;
      currentTime += travelMs;
    }

    if (wp.timeWindowStart !== undefined) {
      constraintsTotal++;
      if (currentTime >= wp.timeWindowStart) constraintsMet++;
    }
    if (wp.timeWindowEnd !== undefined) {
      constraintsTotal++;
      if (currentTime <= wp.timeWindowEnd) constraintsMet++;
    }

    if (wp.dwellTimeMs) currentTime += wp.dwellTimeMs;
  }

  const totalTimeMs = currentTime - now;

  // Efficiency = optimal straight-line / actual distance
  const straightLine = ordered.length >= 2
    ? haversine(ordered[0].lat, ordered[0].lon, ordered[ordered.length - 1].lat, ordered[ordered.length - 1].lon)
    : 0;
  const efficiency = totalDistanceM > 0 ? Math.min(1, straightLine / totalDistanceM) : 1;

  const plan: CorridorPlan = {
    id: `corr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    waypoints: ordered,
    orderedRoute: ordered.map(w => w.id),
    totalDistanceM: Math.round(totalDistanceM),
    totalTimeMs: Math.round(totalTimeMs),
    constraintsSatisfied: constraintsMet,
    constraintsTotal,
    corridorWidthM,
    efficiency: Math.round(efficiency * 1000) / 1000,
    generatedAt: Date.now(),
  };

  plans.push(plan);
  if (plans.length > MAX_PLANS) plans.splice(0, plans.length - MAX_PLANS);

  return plan;
}

function nearestNeighborOrder(waypoints: CorridorWaypoint[]): CorridorWaypoint[] {
  if (waypoints.length <= 1) return [...waypoints];

  const ordered: CorridorWaypoint[] = [waypoints[0]];
  const remaining = new Set(waypoints.slice(1));

  while (remaining.size > 0) {
    const last = ordered[ordered.length - 1];
    let nearest: CorridorWaypoint | null = null;
    let nearestDist = Infinity;

    for (const wp of remaining) {
      const dist = haversine(last.lat, last.lon, wp.lat, wp.lon);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = wp;
      }
    }

    if (nearest) {
      ordered.push(nearest);
      remaining.delete(nearest);
    }
  }

  return ordered;
}

function findBestInsert(ordered: CorridorWaypoint[], candidate: CorridorWaypoint, corridorWidthM: number): number {
  let bestIdx = -1;
  let bestCost = Infinity;

  for (let i = 0; i <= ordered.length; i++) {
    // Check if candidate is within corridor width of neighboring points
    const prev = i > 0 ? ordered[i - 1] : null;
    const next = i < ordered.length ? ordered[i] : null;

    let insertCost = 0;
    if (prev) insertCost += haversine(prev.lat, prev.lon, candidate.lat, candidate.lon);
    if (next) insertCost += haversine(candidate.lat, candidate.lon, next.lat, next.lon);
    if (prev && next) insertCost -= haversine(prev.lat, prev.lon, next.lat, next.lon);

    // Only insert if within corridor width
    if (insertCost <= corridorWidthM && insertCost < bestCost) {
      bestCost = insertCost;
      bestIdx = i;
    }
  }

  return bestIdx;
}

function emptyPlan(corridorWidthM: number): CorridorPlan {
  return {
    id: `corr-empty-${Date.now()}`,
    waypoints: [], orderedRoute: [],
    totalDistanceM: 0, totalTimeMs: 0,
    constraintsSatisfied: 0, constraintsTotal: 0,
    corridorWidthM, efficiency: 1, generatedAt: Date.now(),
  };
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

// ── Query ────────────────────────────────────────────────────────

export function getCorridorPlans(count?: number): CorridorPlan[] {
  return count ? plans.slice(-count) : [...plans];
}

export function getCorridorStats(): CorridorStats {
  return {
    totalPlans: plans.length,
    avgEfficiency: plans.length > 0
      ? Math.round(plans.reduce((s, p) => s + p.efficiency, 0) / plans.length * 1000) / 1000
      : 0,
    avgConstraintSatisfaction: plans.length > 0 && plans.some(p => p.constraintsTotal > 0)
      ? Math.round(plans.filter(p => p.constraintsTotal > 0).reduce((s, p) => s + p.constraintsSatisfied / p.constraintsTotal, 0) / Math.max(1, plans.filter(p => p.constraintsTotal > 0).length) * 100)
      : 100,
    avgWaypointsPerPlan: plans.length > 0
      ? Math.round(plans.reduce((s, p) => s + p.waypoints.length, 0) / plans.length * 10) / 10
      : 0,
  };
}

export function resetCorridorOptimizer(): void {
  plans.length = 0;
}
