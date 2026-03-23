/**
 * CMPSBL® DREAM — Semantic Drift Detection
 * Monitors confidence decay across derivation generations.
 * Auto-pauses dream synthesis when drift score > 0.2.
 */

import { MAX_GENERATION } from './lineageTracker';

export interface DriftReport {
  chainId: string;
  driftScore: number;        // avg confidence loss per generation
  maxDrift: number;           // worst single-generation drop
  driftDirection: 'stable' | 'degrading' | 'critical';
  generationScores: Array<{ generation: number; avgConfidence: number }>;
  shouldPause: boolean;
  timestamp: string;
}

export interface DriftState {
  paused: boolean;
  pausedAt: string | null;
  pauseReason: string | null;
  totalDriftChecks: number;
  criticalDriftCount: number;
  avgDriftScore: number;
}

// Threshold
const DRIFT_PAUSE_THRESHOLD = 0.2;
const MAX_DRIFT_REPORTS = 500;

// State
let driftState: DriftState = {
  paused: false,
  pausedAt: null,
  pauseReason: null,
  totalDriftChecks: 0,
  criticalDriftCount: 0,
  avgDriftScore: 0,
};

const driftHistory: DriftReport[] = [];

/**
 * Analyze drift in a confidence sequence across generations
 */
export function analyzeDrift(
  chainId: string,
  generationConfidences: Array<{ generation: number; avgConfidence: number }>
): DriftReport {
  const sorted = [...generationConfidences].sort((a, b) => a.generation - b.generation);

  let totalDrift = 0;
  let maxDrift = 0;
  const losses: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const loss = sorted[i - 1].avgConfidence - sorted[i].avgConfidence;
    losses.push(loss);
    totalDrift += loss;
    maxDrift = Math.max(maxDrift, loss);
  }

  const driftScore = losses.length > 0 ? totalDrift / losses.length : 0;

  let driftDirection: DriftReport['driftDirection'] = 'stable';
  if (driftScore > DRIFT_PAUSE_THRESHOLD) driftDirection = 'critical';
  else if (driftScore > 0.1) driftDirection = 'degrading';

  const shouldPause = driftScore > DRIFT_PAUSE_THRESHOLD;

  const report: DriftReport = {
    chainId,
    driftScore: Math.round(driftScore * 1000) / 1000,
    maxDrift: Math.round(maxDrift * 1000) / 1000,
    driftDirection,
    generationScores: sorted,
    shouldPause,
    timestamp: new Date().toISOString(),
  };

  // Update state
  driftState.totalDriftChecks++;
  driftState.avgDriftScore = driftState.avgDriftScore + 0.1 * (driftScore - driftState.avgDriftScore);

  if (shouldPause && !driftState.paused) {
    driftState.paused = true;
    driftState.pausedAt = new Date().toISOString();
    driftState.pauseReason = `Drift score ${driftScore.toFixed(3)} exceeds threshold ${DRIFT_PAUSE_THRESHOLD} in chain ${chainId}`;
    driftState.criticalDriftCount++;
  }

  driftHistory.push(report);
  if (driftHistory.length > MAX_DRIFT_REPORTS) driftHistory.shift();

  return report;
}

/**
 * Resume dream synthesis after BRAIN revalidation
 */
export function resumeAfterRevalidation(validatedBy: string = 'brain'): boolean {
  if (!driftState.paused) return false;
  driftState.paused = false;
  driftState.pausedAt = null;
  driftState.pauseReason = null;
  return true;
}

/**
 * Check if dream synthesis is currently paused due to drift
 */
export function isDreamPaused(): boolean {
  return driftState.paused;
}

/**
 * Get drift state
 */
export function getDriftState(): DriftState {
  return { ...driftState };
}

/**
 * Get recent drift reports
 */
export function getDriftHistory(limit: number = 20): DriftReport[] {
  return driftHistory.slice(-limit);
}

/**
 * Get drift threshold
 */
export function getDriftThreshold(): number {
  return DRIFT_PAUSE_THRESHOLD;
}
