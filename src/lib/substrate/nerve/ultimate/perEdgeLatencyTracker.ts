/**
 * NERVE Ultimate — Per-Edge Latency Tracker
 * Tracks individual edge latency with EMA baselines and degradation alerts.
 * Replaces global average with topology-aware per-edge monitoring.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EdgeLatencyProfile {
  edgeKey: string;
  from: string;
  to: string;
  emaLatencyMs: number;
  stdDevMs: number;
  sampleCount: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  p95LatencyMs: number;
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  lastSampleAt: number;
}

export interface EdgeDegradationAlert {
  edgeKey: string;
  from: string;
  to: string;
  currentLatencyMs: number;
  baselineMs: number;
  zScore: number;
  severity: 'warning' | 'critical';
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const EMA_ALPHA = 0.15;
const MAX_SAMPLES_FOR_P95 = 100;
const DEGRADATION_Z_WARNING = 2.0;
const DEGRADATION_Z_CRITICAL = 3.0;
const STALE_EDGE_MS = 120_000;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

interface EdgeState {
  from: string;
  to: string;
  emaLatencyMs: number;
  varianceEstimate: number;
  sampleCount: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  recentSamples: number[];
  lastSampleAt: number;
}

const edges = new Map<string, EdgeState>();
const alerts: EdgeDegradationAlert[] = [];
const MAX_ALERTS = 500;

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

function edgeKey(from: string, to: string): string {
  return `${from}→${to}`;
}

/** Record a latency sample for an edge */
export function recordEdgeLatency(
  from: string,
  to: string,
  latencyMs: number,
): EdgeLatencyProfile {
  const key = edgeKey(from, to);
  const now = Date.now();
  let state = edges.get(key);

  if (!state) {
    state = {
      from,
      to,
      emaLatencyMs: latencyMs,
      varianceEstimate: 0,
      sampleCount: 0,
      minLatencyMs: latencyMs,
      maxLatencyMs: latencyMs,
      recentSamples: [],
      lastSampleAt: now,
    };
    edges.set(key, state);
  }

  // Update EMA
  const prevEma = state.emaLatencyMs;
  state.emaLatencyMs = EMA_ALPHA * latencyMs + (1 - EMA_ALPHA) * prevEma;

  // Update variance
  const deviation = latencyMs - state.emaLatencyMs;
  state.varianceEstimate = EMA_ALPHA * (deviation * deviation) + (1 - EMA_ALPHA) * state.varianceEstimate;

  // Update min/max
  state.minLatencyMs = Math.min(state.minLatencyMs, latencyMs);
  state.maxLatencyMs = Math.max(state.maxLatencyMs, latencyMs);

  // Track recent samples for P95
  state.recentSamples.push(latencyMs);
  if (state.recentSamples.length > MAX_SAMPLES_FOR_P95) {
    state.recentSamples.splice(0, state.recentSamples.length - MAX_SAMPLES_FOR_P95);
  }

  state.sampleCount++;
  state.lastSampleAt = now;

  // Check for degradation
  if (state.sampleCount > 10) {
    const stdDev = Math.sqrt(Math.max(state.varianceEstimate, 0.01));
    const zScore = (latencyMs - state.emaLatencyMs) / stdDev;

    if (zScore > DEGRADATION_Z_CRITICAL) {
      emitAlert(key, from, to, latencyMs, state.emaLatencyMs, zScore, 'critical');
    } else if (zScore > DEGRADATION_Z_WARNING) {
      emitAlert(key, from, to, latencyMs, state.emaLatencyMs, zScore, 'warning');
    }
  }

  return buildProfile(key, state);
}

function emitAlert(
  key: string, from: string, to: string,
  currentMs: number, baselineMs: number, zScore: number,
  severity: 'warning' | 'critical',
): void {
  alerts.push({
    edgeKey: key,
    from,
    to,
    currentLatencyMs: currentMs,
    baselineMs,
    zScore: Math.round(zScore * 100) / 100,
    severity,
    timestamp: Date.now(),
  });
  if (alerts.length > MAX_ALERTS) alerts.splice(0, alerts.length - MAX_ALERTS);
}

function buildProfile(key: string, state: EdgeState): EdgeLatencyProfile {
  const stdDev = Math.sqrt(Math.max(state.varianceEstimate, 0));
  const sorted = [...state.recentSamples].sort((a, b) => a - b);
  const p95Index = Math.floor(sorted.length * 0.95);
  const p95 = sorted.length > 0 ? sorted[Math.min(p95Index, sorted.length - 1)] : 0;

  let status: EdgeLatencyProfile['status'] = 'unknown';
  if (state.sampleCount >= 5) {
    const lastSample = state.recentSamples[state.recentSamples.length - 1];
    const zScore = stdDev > 0 ? (lastSample - state.emaLatencyMs) / stdDev : 0;
    if (zScore > DEGRADATION_Z_CRITICAL) status = 'critical';
    else if (zScore > DEGRADATION_Z_WARNING) status = 'degraded';
    else status = 'healthy';
  }

  // Mark stale edges
  if ((Date.now() - state.lastSampleAt) > STALE_EDGE_MS) status = 'unknown';

  return {
    edgeKey: key,
    from: state.from,
    to: state.to,
    emaLatencyMs: Math.round(state.emaLatencyMs * 100) / 100,
    stdDevMs: Math.round(stdDev * 100) / 100,
    sampleCount: state.sampleCount,
    minLatencyMs: state.minLatencyMs,
    maxLatencyMs: state.maxLatencyMs,
    p95LatencyMs: Math.round(p95 * 100) / 100,
    status,
    lastSampleAt: state.lastSampleAt,
  };
}

/** Get a specific edge profile */
export function getEdgeProfile(from: string, to: string): EdgeLatencyProfile | null {
  const state = edges.get(edgeKey(from, to));
  if (!state) return null;
  return buildProfile(edgeKey(from, to), state);
}

/** Get all edge profiles */
export function getAllEdgeProfiles(): EdgeLatencyProfile[] {
  return Array.from(edges.entries()).map(([key, state]) => buildProfile(key, state));
}

/** Get degraded edges */
export function getDegradedEdges(): EdgeLatencyProfile[] {
  return getAllEdgeProfiles().filter(p => p.status === 'degraded' || p.status === 'critical');
}

/** Get recent degradation alerts */
export function getAlerts(limit: number = 20): EdgeDegradationAlert[] {
  return alerts.slice(-limit);
}

/** Get topology health summary */
export function getTopologyHealthSummary(): {
  totalEdges: number;
  healthy: number;
  degraded: number;
  critical: number;
  unknown: number;
  avgLatencyMs: number;
} {
  const profiles = getAllEdgeProfiles();
  const healthy = profiles.filter(p => p.status === 'healthy').length;
  const degraded = profiles.filter(p => p.status === 'degraded').length;
  const critical = profiles.filter(p => p.status === 'critical').length;
  const unknown = profiles.filter(p => p.status === 'unknown').length;
  const avgLatency = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + p.emaLatencyMs, 0) / profiles.length
    : 0;

  return {
    totalEdges: profiles.length,
    healthy, degraded, critical, unknown,
    avgLatencyMs: Math.round(avgLatency * 100) / 100,
  };
}
