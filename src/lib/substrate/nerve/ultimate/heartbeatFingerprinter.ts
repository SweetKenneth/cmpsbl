/**
 * NERVE Ultimate — Heartbeat Fingerprinter
 * Behavioral fingerprints to detect zombie/degraded nodes beyond binary alive/dead.
 * Tracks heartbeat regularity, response patterns, and jitter signatures.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface HeartbeatFingerprint {
  nodeId: string;
  avgIntervalMs: number;
  intervalJitterMs: number;
  regularityScore: number;       // 0–1, 1 = perfectly regular
  classification: NodeClassification;
  anomalyFlags: AnomalyFlag[];
  sampleCount: number;
  lastUpdated: number;
}

export type NodeClassification =
  | 'healthy'         // Regular heartbeats, low jitter
  | 'degraded'        // Irregular intervals, rising jitter
  | 'zombie'          // Heartbeats present but abnormally spaced/irregular
  | 'flapping'        // Rapidly alternating alive/dead
  | 'unknown';        // Insufficient data

export type AnomalyFlag =
  | 'high_jitter'
  | 'interval_drift'
  | 'burst_pattern'
  | 'long_gaps'
  | 'flap_detected';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_INTERVALS = 50;
const MIN_SAMPLES = 5;
const JITTER_THRESHOLD = 0.4;        // 40% CoV = high jitter
const DRIFT_THRESHOLD = 0.3;         // 30% drift from expected interval
const GAP_MULTIPLIER = 3.0;          // 3× expected interval = long gap
const FLAP_WINDOW = 10;
const FLAP_THRESHOLD = 4;            // 4+ state changes in window = flapping

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

interface NodeHeartbeatState {
  nodeId: string;
  heartbeatTimestamps: number[];
  intervals: number[];
  stateChanges: Array<{ timestamp: number; from: string; to: string }>;
  expectedIntervalMs: number;
}

const fingerprints = new Map<string, NodeHeartbeatState>();

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Record a heartbeat observation for a node */
export function recordHeartbeat(nodeId: string, expectedIntervalMs: number = 10_000): HeartbeatFingerprint {
  const now = Date.now();
  let state = fingerprints.get(nodeId);

  if (!state) {
    state = {
      nodeId,
      heartbeatTimestamps: [],
      intervals: [],
      stateChanges: [],
      expectedIntervalMs,
    };
    fingerprints.set(nodeId, state);
  }

  // Record timestamp
  state.heartbeatTimestamps.push(now);

  // Calculate interval from previous heartbeat
  if (state.heartbeatTimestamps.length >= 2) {
    const prev = state.heartbeatTimestamps[state.heartbeatTimestamps.length - 2];
    const interval = now - prev;
    state.intervals.push(interval);
    if (state.intervals.length > MAX_INTERVALS) {
      state.intervals.splice(0, state.intervals.length - MAX_INTERVALS);
    }
  }

  // Trim timestamps
  if (state.heartbeatTimestamps.length > MAX_INTERVALS + 1) {
    state.heartbeatTimestamps.splice(0, state.heartbeatTimestamps.length - (MAX_INTERVALS + 1));
  }

  state.expectedIntervalMs = expectedIntervalMs;

  return buildFingerprint(state);
}

/** Record a state change (alive→suspect, suspect→dead, etc.) */
export function recordStateChange(nodeId: string, fromState: string, toState: string): void {
  let state = fingerprints.get(nodeId);
  if (!state) {
    state = {
      nodeId,
      heartbeatTimestamps: [],
      intervals: [],
      stateChanges: [],
      expectedIntervalMs: 10_000,
    };
    fingerprints.set(nodeId, state);
  }

  state.stateChanges.push({ timestamp: Date.now(), from: fromState, to: toState });
  if (state.stateChanges.length > FLAP_WINDOW * 2) {
    state.stateChanges.splice(0, state.stateChanges.length - FLAP_WINDOW * 2);
  }
}

function buildFingerprint(state: NodeHeartbeatState): HeartbeatFingerprint {
  const intervals = state.intervals;

  if (intervals.length < MIN_SAMPLES) {
    return {
      nodeId: state.nodeId,
      avgIntervalMs: 0,
      intervalJitterMs: 0,
      regularityScore: 0,
      classification: 'unknown',
      anomalyFlags: [],
      sampleCount: intervals.length,
      lastUpdated: Date.now(),
    };
  }

  // Calculate statistics
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  const cov = mean > 0 ? stdDev / mean : 0;

  // Regularity score: 1 - normalized CoV (clamped)
  const regularityScore = Math.max(0, Math.min(1, 1 - cov));

  // Detect anomalies
  const anomalyFlags: AnomalyFlag[] = [];

  if (cov > JITTER_THRESHOLD) anomalyFlags.push('high_jitter');

  // Interval drift from expected
  const driftRatio = Math.abs(mean - state.expectedIntervalMs) / state.expectedIntervalMs;
  if (driftRatio > DRIFT_THRESHOLD) anomalyFlags.push('interval_drift');

  // Long gaps
  const longGaps = intervals.filter(i => i > state.expectedIntervalMs * GAP_MULTIPLIER);
  if (longGaps.length > 0) anomalyFlags.push('long_gaps');

  // Burst pattern: clusters of very short intervals
  const shortIntervals = intervals.filter(i => i < state.expectedIntervalMs * 0.3);
  if (shortIntervals.length > intervals.length * 0.3) anomalyFlags.push('burst_pattern');

  // Flap detection
  const recentChanges = state.stateChanges.slice(-FLAP_WINDOW);
  if (recentChanges.length >= FLAP_THRESHOLD) anomalyFlags.push('flap_detected');

  // Classification
  let classification: NodeClassification = 'healthy';
  if (anomalyFlags.includes('flap_detected')) {
    classification = 'flapping';
  } else if (anomalyFlags.includes('high_jitter') && anomalyFlags.includes('interval_drift')) {
    classification = 'zombie';
  } else if (anomalyFlags.length > 0) {
    classification = 'degraded';
  }

  return {
    nodeId: state.nodeId,
    avgIntervalMs: Math.round(mean),
    intervalJitterMs: Math.round(stdDev),
    regularityScore: Math.round(regularityScore * 1000) / 1000,
    classification,
    anomalyFlags,
    sampleCount: intervals.length,
    lastUpdated: Date.now(),
  };
}

/** Get fingerprint for a specific node */
export function getFingerprint(nodeId: string): HeartbeatFingerprint | null {
  const state = fingerprints.get(nodeId);
  if (!state) return null;
  return buildFingerprint(state);
}

/** Get all fingerprints */
export function getAllFingerprints(): HeartbeatFingerprint[] {
  return Array.from(fingerprints.values()).map(buildFingerprint);
}

/** Get nodes classified as problematic */
export function getProblematicNodes(): HeartbeatFingerprint[] {
  return getAllFingerprints().filter(f =>
    f.classification === 'zombie' || f.classification === 'flapping' || f.classification === 'degraded'
  );
}

/** Reset a node's fingerprint data */
export function resetFingerprint(nodeId: string): boolean {
  return fingerprints.delete(nodeId);
}
