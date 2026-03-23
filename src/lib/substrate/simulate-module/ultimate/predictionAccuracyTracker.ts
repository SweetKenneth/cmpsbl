/**
 * SIMULATE Ultimate — System 9: Prediction Accuracy Tracker
 * 
 * Compares simulated outcomes to actual outcomes when changes are applied.
 * Hebbian learning on model calibration — accurate models get reinforced.
 * Full simulation audit trail.
 * 
 * @module simulate/ultimate/predictionAccuracyTracker
 */

// ── Types ────────────────────────────────────────────────────────

export interface PredictionRecord {
  id: string;
  simulationId: string;
  scenarioType: string;
  predictedMetrics: Record<string, number>;
  predictedAt: string;
  resolved: boolean;
  actualMetrics?: Record<string, number>;
  resolvedAt?: string;
  accuracy?: number;            // 0-1
  errors?: Record<string, number>;  // Per-metric absolute error
}

export interface ModelCalibration {
  scenarioType: string;
  totalPredictions: number;
  resolvedPredictions: number;
  avgAccuracy: number;          // EMA-weighted
  weight: number;               // Hebbian weight 0-1
  bias: number;                 // Systematic over/under prediction
  lastCalibrated: string;
}

// ── State ────────────────────────────────────────────────────────

const predictions: Map<string, PredictionRecord> = new Map();
const calibrations: Map<string, ModelCalibration> = new Map();
const MAX_PREDICTIONS = 1000;
const EMA_ALPHA = 0.15;
const HEBBIAN_STRENGTHEN = 0.06;
const HEBBIAN_WEAKEN = 0.03;

// ── Core API ────────────────────────────────────────────────────

/** Record a prediction from a simulation */
export function recordPrediction(
  simulationId: string,
  scenarioType: string,
  predictedMetrics: Record<string, number>,
): PredictionRecord {
  const record: PredictionRecord = {
    id: crypto.randomUUID(),
    simulationId,
    scenarioType,
    predictedMetrics,
    predictedAt: new Date().toISOString(),
    resolved: false,
  };

  predictions.set(record.id, record);
  if (predictions.size > MAX_PREDICTIONS) {
    const oldest = predictions.keys().next().value;
    if (oldest) predictions.delete(oldest);
  }

  return record;
}

/** Resolve a prediction with actual outcomes */
export function resolvePrediction(
  predictionId: string,
  actualMetrics: Record<string, number>,
): PredictionRecord | null {
  const record = predictions.get(predictionId);
  if (!record || record.resolved) return null;

  record.actualMetrics = actualMetrics;
  record.resolved = true;
  record.resolvedAt = new Date().toISOString();

  // Calculate accuracy
  const errors: Record<string, number> = {};
  let totalError = 0;
  let metricCount = 0;

  for (const [key, predicted] of Object.entries(record.predictedMetrics)) {
    const actual = actualMetrics[key];
    if (actual !== undefined) {
      const denom = Math.max(Math.abs(actual), Math.abs(predicted), 1);
      const error = Math.abs(predicted - actual) / denom;
      errors[key] = Math.round(error * 10000) / 10000;
      totalError += error;
      metricCount++;
    }
  }

  record.errors = errors;
  record.accuracy = metricCount > 0
    ? Math.round(Math.max(0, 1 - totalError / metricCount) * 10000) / 10000
    : 0;

  // Update calibration
  updateCalibration(record.scenarioType, record.accuracy, record.predictedMetrics, actualMetrics);

  return record;
}

function updateCalibration(
  scenarioType: string,
  accuracy: number,
  predicted: Record<string, number>,
  actual: Record<string, number>,
): void {
  const existing = calibrations.get(scenarioType);

  // Calculate bias (positive = overprediction)
  let biasSum = 0;
  let biasCount = 0;
  for (const key of Object.keys(predicted)) {
    if (actual[key] !== undefined) {
      biasSum += predicted[key] - actual[key];
      biasCount++;
    }
  }
  const newBias = biasCount > 0 ? biasSum / biasCount : 0;

  if (existing) {
    existing.totalPredictions++;
    existing.resolvedPredictions++;
    existing.avgAccuracy = existing.avgAccuracy * (1 - EMA_ALPHA) + accuracy * EMA_ALPHA;
    existing.bias = existing.bias * 0.8 + newBias * 0.2;

    // Hebbian: strengthen accurate models, weaken inaccurate
    if (accuracy > 0.8) {
      existing.weight = Math.min(1, existing.weight + HEBBIAN_STRENGTHEN * (1 - existing.weight));
    } else if (accuracy < 0.5) {
      existing.weight = Math.max(0.05, existing.weight - HEBBIAN_WEAKEN);
    }

    existing.lastCalibrated = new Date().toISOString();
  } else {
    calibrations.set(scenarioType, {
      scenarioType,
      totalPredictions: 1,
      resolvedPredictions: 1,
      avgAccuracy: accuracy,
      weight: 0.5,
      bias: newBias,
      lastCalibrated: new Date().toISOString(),
    });
  }
}

/** Get calibration for a scenario type */
export function getCalibration(scenarioType: string): ModelCalibration | undefined {
  return calibrations.get(scenarioType);
}

/** Get all calibrations */
export function getAllCalibrations(): ModelCalibration[] {
  return Array.from(calibrations.values()).sort((a, b) => b.weight - a.weight);
}

/** Get prediction accuracy across all resolved predictions */
export function getOverallAccuracy(): number {
  const resolved = Array.from(predictions.values()).filter(p => p.resolved && p.accuracy !== undefined);
  if (resolved.length === 0) return 0;
  return Math.round((resolved.reduce((s, p) => s + (p.accuracy || 0), 0) / resolved.length) * 100);
}

export function getAccuracyTrackerHealth() {
  const allPredictions = Array.from(predictions.values());
  const resolved = allPredictions.filter(p => p.resolved);

  return {
    totalPredictions: predictions.size,
    resolvedPredictions: resolved.length,
    pendingPredictions: predictions.size - resolved.length,
    overallAccuracy: getOverallAccuracy(),
    calibratedModels: calibrations.size,
    strongModels: Array.from(calibrations.values()).filter(c => c.weight > 0.7).length,
  };
}

export function resetAccuracyTracker(): void {
  predictions.clear();
  calibrations.clear();
}
