/**
 * NERVE Ultimate — Adaptive Backpressure Calibrator
 * Auto-tunes backpressure thresholds per-node using EMA of observed queue depths.
 * Replaces static thresholds with learned, node-specific pressure profiles.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface NodePressureProfile {
  nodeId: string;
  emaQueueDepth: number;
  stdDevEstimate: number;
  sampleCount: number;
  calibratedThresholds: CalibratedThresholds;
  lastCalibration: number;
  baselineEstablished: boolean;
}

export interface CalibratedThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface CalibrationEvent {
  nodeId: string;
  timestamp: number;
  oldThresholds: CalibratedThresholds;
  newThresholds: CalibratedThresholds;
  reason: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const EMA_ALPHA = 0.15;
const MIN_SAMPLES_FOR_BASELINE = 20;
const RECALIBRATION_INTERVAL_MS = 60_000;

const DEFAULT_THRESHOLDS: CalibratedThresholds = {
  low: 10,
  medium: 25,
  high: 50,
  critical: 100,
};

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const profiles = new Map<string, NodePressureProfile>();
const calibrationLog: CalibrationEvent[] = [];
const MAX_CALIBRATION_LOG = 200;

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Record a queue depth observation and update the node's EMA profile */
export function observeQueueDepth(nodeId: string, depth: number): NodePressureProfile {
  const now = Date.now();
  let profile = profiles.get(nodeId);

  if (!profile) {
    profile = {
      nodeId,
      emaQueueDepth: depth,
      stdDevEstimate: 0,
      sampleCount: 0,
      calibratedThresholds: { ...DEFAULT_THRESHOLDS },
      lastCalibration: now,
      baselineEstablished: false,
    };
    profiles.set(nodeId, profile);
  }

  // Update EMA
  const prevEma = profile.emaQueueDepth;
  profile.emaQueueDepth = EMA_ALPHA * depth + (1 - EMA_ALPHA) * prevEma;

  // Update standard deviation estimate (Welford-like running approximation)
  const deviation = Math.abs(depth - profile.emaQueueDepth);
  profile.stdDevEstimate = EMA_ALPHA * deviation + (1 - EMA_ALPHA) * profile.stdDevEstimate;

  profile.sampleCount++;

  // Establish baseline after sufficient samples
  if (!profile.baselineEstablished && profile.sampleCount >= MIN_SAMPLES_FOR_BASELINE) {
    profile.baselineEstablished = true;
    recalibrate(profile, now);
  }

  // Periodic recalibration
  if (profile.baselineEstablished && (now - profile.lastCalibration) > RECALIBRATION_INTERVAL_MS) {
    recalibrate(profile, now);
  }

  return { ...profile };
}

/** Recalibrate thresholds based on observed EMA and variance */
function recalibrate(profile: NodePressureProfile, now: number): void {
  const oldThresholds = { ...profile.calibratedThresholds };
  const mean = profile.emaQueueDepth;
  const sigma = Math.max(profile.stdDevEstimate, 1);

  // Thresholds: mean + N*sigma, with minimum floors
  profile.calibratedThresholds = {
    low: Math.max(5, Math.round(mean + 1 * sigma)),
    medium: Math.max(15, Math.round(mean + 2 * sigma)),
    high: Math.max(30, Math.round(mean + 3 * sigma)),
    critical: Math.max(60, Math.round(mean + 4 * sigma)),
  };

  profile.lastCalibration = now;

  const event: CalibrationEvent = {
    nodeId: profile.nodeId,
    timestamp: now,
    oldThresholds,
    newThresholds: { ...profile.calibratedThresholds },
    reason: `EMA=${mean.toFixed(1)}, σ=${sigma.toFixed(1)}, samples=${profile.sampleCount}`,
  };

  calibrationLog.push(event);
  if (calibrationLog.length > MAX_CALIBRATION_LOG) {
    calibrationLog.splice(0, calibrationLog.length - MAX_CALIBRATION_LOG);
  }
}

/** Get the calibrated pressure level for a node's queue depth */
export function getCalibratedPressureLevel(
  nodeId: string,
  depth: number,
): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  const profile = profiles.get(nodeId);
  const thresholds = profile?.calibratedThresholds ?? DEFAULT_THRESHOLDS;

  if (depth >= thresholds.critical) return 'critical';
  if (depth >= thresholds.high) return 'high';
  if (depth >= thresholds.medium) return 'medium';
  if (depth >= thresholds.low) return 'low';
  return 'none';
}

/** Get a node's pressure profile */
export function getProfile(nodeId: string): NodePressureProfile | null {
  const p = profiles.get(nodeId);
  return p ? { ...p } : null;
}

/** Get all profiles */
export function getAllProfiles(): NodePressureProfile[] {
  return Array.from(profiles.values()).map(p => ({ ...p }));
}

/** Get calibration history */
export function getCalibrationLog(limit: number = 20): CalibrationEvent[] {
  return calibrationLog.slice(-limit);
}

/** Reset a node's profile to defaults */
export function resetProfile(nodeId: string): boolean {
  return profiles.delete(nodeId);
}
