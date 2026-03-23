/**
 * COMPASS Ultimate — Contextual Waypoint Engine
 * Tracks user/process journeys as waypoint sequences.
 * Detects loops, dead-ends, and optimal paths. Powers "you are here" awareness.
 */

export interface Waypoint {
  id: string;
  nodeId: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface Journey {
  id: string;
  entityId: string;
  entityType: 'user' | 'process' | 'intent';
  waypoints: Waypoint[];
  startedAt: number;
  lastActivityAt: number;
  loopsDetected: number;
  deadEndsDetected: number;
  status: 'active' | 'complete' | 'stalled';
}

export interface JourneyAnalysis {
  journeyId: string;
  totalWaypoints: number;
  uniqueNodes: number;
  loops: Array<{ node: string; count: number }>;
  deadEnds: string[];
  efficiency: number;       // unique/total ratio
  duration: number;
}

export interface WaypointStats {
  totalJourneys: number;
  activeJourneys: number;
  avgWaypointsPerJourney: number;
  avgEfficiency: number;
  topLoopNodes: string[];
}

const MAX_JOURNEYS = 500;
const MAX_WAYPOINTS = 200;
const STALL_TIMEOUT = 300_000; // 5 min

const journeys = new Map<string, Journey>();

export function startJourney(entityId: string, entityType: Journey['entityType']): Journey {
  const j: Journey = {
    id: `journey-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    entityId, entityType, waypoints: [],
    startedAt: Date.now(), lastActivityAt: Date.now(),
    loopsDetected: 0, deadEndsDetected: 0, status: 'active',
  };
  if (journeys.size >= MAX_JOURNEYS) {
    const oldest = [...journeys.values()].sort((a, b) => a.lastActivityAt - b.lastActivityAt)[0];
    if (oldest) journeys.delete(oldest.id);
  }
  journeys.set(j.id, j);
  return j;
}

export function addWaypoint(journeyId: string, nodeId: string, action: string, metadata?: Record<string, unknown>): void {
  const j = journeys.get(journeyId);
  if (!j || j.status !== 'active') return;

  const wp: Waypoint = {
    id: `wp-${j.waypoints.length}`,
    nodeId, action, timestamp: Date.now(), metadata,
  };

  if (j.waypoints.length >= MAX_WAYPOINTS) j.waypoints.shift();
  j.waypoints.push(wp);
  j.lastActivityAt = Date.now();

  // Loop detection: same node visited 3+ times in last 10 waypoints
  const recent = j.waypoints.slice(-10);
  const counts = new Map<string, number>();
  for (const w of recent) counts.set(w.nodeId, (counts.get(w.nodeId) ?? 0) + 1);
  for (const [, c] of counts) {
    if (c >= 3) j.loopsDetected++;
  }
}

export function completeJourney(journeyId: string): void {
  const j = journeys.get(journeyId);
  if (j) j.status = 'complete';
}

export function analyzeJourney(journeyId: string): JourneyAnalysis | null {
  const j = journeys.get(journeyId);
  if (!j) return null;

  const nodeCounts = new Map<string, number>();
  for (const wp of j.waypoints) {
    nodeCounts.set(wp.nodeId, (nodeCounts.get(wp.nodeId) ?? 0) + 1);
  }

  const loops = [...nodeCounts.entries()]
    .filter(([, c]) => c >= 3)
    .map(([node, count]) => ({ node, count }));

  // Dead ends: last waypoint in a sequence with no continuation for 30s+
  const deadEnds: string[] = [];
  for (let i = 0; i < j.waypoints.length - 1; i++) {
    const gap = j.waypoints[i + 1].timestamp - j.waypoints[i].timestamp;
    if (gap > 30_000) deadEnds.push(j.waypoints[i].nodeId);
  }

  return {
    journeyId: j.id,
    totalWaypoints: j.waypoints.length,
    uniqueNodes: nodeCounts.size,
    loops, deadEnds,
    efficiency: j.waypoints.length > 0 ? nodeCounts.size / j.waypoints.length : 0,
    duration: j.lastActivityAt - j.startedAt,
  };
}

export function detectStalledJourneys(): Journey[] {
  const now = Date.now();
  const stalled: Journey[] = [];
  for (const j of journeys.values()) {
    if (j.status === 'active' && now - j.lastActivityAt > STALL_TIMEOUT) {
      j.status = 'stalled';
      stalled.push(j);
    }
  }
  return stalled;
}

export function getWaypointStats(): WaypointStats {
  const all = [...journeys.values()];
  const active = all.filter(j => j.status === 'active');
  const analyses = all.map(j => analyzeJourney(j.id)).filter(Boolean) as JourneyAnalysis[];

  const loopCounts = new Map<string, number>();
  for (const a of analyses) {
    for (const l of a.loops) {
      loopCounts.set(l.node, (loopCounts.get(l.node) ?? 0) + l.count);
    }
  }
  const topLoops = [...loopCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);

  return {
    totalJourneys: all.length,
    activeJourneys: active.length,
    avgWaypointsPerJourney: all.length > 0 ? all.reduce((s, j) => s + j.waypoints.length, 0) / all.length : 0,
    avgEfficiency: analyses.length > 0 ? analyses.reduce((s, a) => s + a.efficiency, 0) / analyses.length : 0,
    topLoopNodes: topLoops,
  };
}

export function resetWaypointState(): void { journeys.clear(); }
