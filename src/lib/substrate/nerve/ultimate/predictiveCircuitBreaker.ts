/**
 * NERVE Ultimate — Predictive Circuit Breaker
 * Pre-emptive circuit opening based on degradation trend analysis.
 * Uses sliding-window failure rate and latency Z-scores to predict trips.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DegradationTrend {
  nodeId: string;
  windowSize: number;
  failureRate: number;           // 0.0–1.0
  latencyTrend: 'stable' | 'rising' | 'critical';
  latencyZScore: number;
  predictedTripMs: number | null; // estimated time to trip, null if stable
  recommendation: 'none' | 'watch' | 'pre_trip' | 'immediate_trip';
  timestamp: number;
}

export interface TrendSample {
  timestamp: number;
  success: boolean;
  latencyMs: number;
}

interface NodeTrendState {
  nodeId: string;
  samples: TrendSample[];
  emaLatency: number;
  emaFailureRate: number;
  latencyVariance: number;
  preTripped: boolean;
  preTrippedAt: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const WINDOW_SIZE = 50;
const EMA_ALPHA = 0.2;
const PRE_TRIP_FAILURE_RATE = 0.4;    // Pre-trip at 40% failure rate
const IMMEDIATE_TRIP_FAILURE_RATE = 0.6;
const LATENCY_Z_CRITICAL = 2.5;
const LATENCY_Z_WATCH = 1.5;
const PRE_TRIP_COOLDOWN_MS = 15_000;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const trends = new Map<string, NodeTrendState>();

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Record a signal outcome for trend analysis */
export function recordOutcome(nodeId: string, success: boolean, latencyMs: number): DegradationTrend {
  let state = trends.get(nodeId);

  if (!state) {
    state = {
      nodeId,
      samples: [],
      emaLatency: latencyMs,
      emaFailureRate: success ? 0 : 1,
      latencyVariance: 0,
      preTripped: false,
      preTrippedAt: 0,
    };
    trends.set(nodeId, state);
  }

  // Add sample
  state.samples.push({ timestamp: Date.now(), success, latencyMs });
  if (state.samples.length > WINDOW_SIZE) {
    state.samples.splice(0, state.samples.length - WINDOW_SIZE);
  }

  // Update EMA latency
  state.emaLatency = EMA_ALPHA * latencyMs + (1 - EMA_ALPHA) * state.emaLatency;

  // Update EMA failure rate
  const failureVal = success ? 0 : 1;
  state.emaFailureRate = EMA_ALPHA * failureVal + (1 - EMA_ALPHA) * state.emaFailureRate;

  // Update latency variance (running approximation)
  const deviation = latencyMs - state.emaLatency;
  state.latencyVariance = EMA_ALPHA * (deviation * deviation) + (1 - EMA_ALPHA) * state.latencyVariance;

  return analyzeTrend(state);
}

/** Analyze current degradation trend for a node */
function analyzeTrend(state: NodeTrendState): DegradationTrend {
  const now = Date.now();
  const stdDev = Math.sqrt(Math.max(state.latencyVariance, 0.01));
  const zScore = state.samples.length > 5
    ? (state.samples[state.samples.length - 1].latencyMs - state.emaLatency) / stdDev
    : 0;

  // Determine latency trend
  let latencyTrend: DegradationTrend['latencyTrend'] = 'stable';
  if (zScore > LATENCY_Z_CRITICAL) latencyTrend = 'critical';
  else if (zScore > LATENCY_Z_WATCH) latencyTrend = 'rising';

  // Determine recommendation
  let recommendation: DegradationTrend['recommendation'] = 'none';
  let predictedTripMs: number | null = null;

  if (state.emaFailureRate >= IMMEDIATE_TRIP_FAILURE_RATE) {
    recommendation = 'immediate_trip';
  } else if (state.emaFailureRate >= PRE_TRIP_FAILURE_RATE || latencyTrend === 'critical') {
    recommendation = 'pre_trip';
    // Estimate time to trip based on failure rate acceleration
    const recentFailures = state.samples.slice(-10).filter(s => !s.success).length;
    const failureAccel = recentFailures / 10;
    if (failureAccel > 0) {
      const remainingToTrip = IMMEDIATE_TRIP_FAILURE_RATE - state.emaFailureRate;
      predictedTripMs = Math.round((remainingToTrip / failureAccel) * 10_000);
    }
  } else if (state.emaFailureRate > 0.15 || latencyTrend === 'rising') {
    recommendation = 'watch';
  }

  return {
    nodeId: state.nodeId,
    windowSize: state.samples.length,
    failureRate: state.emaFailureRate,
    latencyTrend,
    latencyZScore: Math.round(zScore * 100) / 100,
    predictedTripMs,
    recommendation,
    timestamp: now,
  };
}

/** Get current degradation trend for a node */
export function getTrend(nodeId: string): DegradationTrend | null {
  const state = trends.get(nodeId);
  if (!state) return null;
  return analyzeTrend(state);
}

/** Get all nodes with active degradation trends */
export function getAllTrends(): DegradationTrend[] {
  return Array.from(trends.values()).map(analyzeTrend);
}

/** Get nodes that should be pre-emptively tripped */
export function getPreTripCandidates(): DegradationTrend[] {
  return getAllTrends().filter(t =>
    t.recommendation === 'pre_trip' || t.recommendation === 'immediate_trip'
  );
}

/** Mark a node as pre-tripped */
export function markPreTripped(nodeId: string): boolean {
  const state = trends.get(nodeId);
  if (!state) return false;
  state.preTripped = true;
  state.preTrippedAt = Date.now();
  return true;
}

/** Check if pre-trip cooldown has elapsed */
export function isPreTripCooldownElapsed(nodeId: string): boolean {
  const state = trends.get(nodeId);
  if (!state || !state.preTripped) return true;
  return (Date.now() - state.preTrippedAt) > PRE_TRIP_COOLDOWN_MS;
}

/** Reset a node's trend data */
export function resetTrend(nodeId: string): boolean {
  return trends.delete(nodeId);
}
