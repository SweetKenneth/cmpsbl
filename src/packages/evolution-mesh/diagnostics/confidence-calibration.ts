/**
 * Evolution Mesh — Confidence Calibration Tracker
 * Measures alignment between executor self-reported confidence and actual outcomes.
 * High calibration = confidence matches reality. Low = overconfident or underconfident.
 */

export interface CalibrationPoint {
  executorId: string;
  mutationId: string;
  predictedConfidence: number; // 0.0–1.0
  actualSuccess: boolean;
  timestamp: number;
}

export interface CalibrationBucket {
  range: string;
  predicted: number;
  actualSuccessRate: number;
  count: number;
  calibrationError: number; // abs(predicted - actual)
}

export interface CalibrationReport {
  executorId: string;
  totalPoints: number;
  buckets: CalibrationBucket[];
  /** Expected Calibration Error — lower is better */
  ece: number;
  /** Maximum Calibration Error */
  mce: number;
  /** Bias: positive = overconfident, negative = underconfident */
  bias: number;
  calibrationGrade: 'excellent' | 'good' | 'fair' | 'poor' | 'uncalibrated';
}

const calibrationData: CalibrationPoint[] = [];
const MAX_DATA = 20_000;
const BUCKET_RANGES = [
  { label: '0-10%', min: 0, max: 0.1 },
  { label: '10-20%', min: 0.1, max: 0.2 },
  { label: '20-30%', min: 0.2, max: 0.3 },
  { label: '30-40%', min: 0.3, max: 0.4 },
  { label: '40-50%', min: 0.4, max: 0.5 },
  { label: '50-60%', min: 0.5, max: 0.6 },
  { label: '60-70%', min: 0.6, max: 0.7 },
  { label: '70-80%', min: 0.7, max: 0.8 },
  { label: '80-90%', min: 0.8, max: 0.9 },
  { label: '90-100%', min: 0.9, max: 1.01 },
];

/**
 * Record a confidence prediction and actual outcome.
 */
export function recordCalibration(
  executorId: string,
  mutationId: string,
  predictedConfidence: number,
  actualSuccess: boolean,
): void {
  calibrationData.push({
    executorId,
    mutationId,
    predictedConfidence: Math.max(0, Math.min(1, predictedConfidence)),
    actualSuccess,
    timestamp: Date.now(),
  });
  if (calibrationData.length > MAX_DATA) calibrationData.splice(0, calibrationData.length - MAX_DATA);
}

/**
 * Generate a calibration report for an executor.
 */
export function getCalibrationReport(executorId: string): CalibrationReport {
  const points = calibrationData.filter(p => p.executorId === executorId);

  if (points.length < 10) {
    return {
      executorId,
      totalPoints: points.length,
      buckets: [],
      ece: 1.0,
      mce: 1.0,
      bias: 0,
      calibrationGrade: 'uncalibrated',
    };
  }

  const buckets: CalibrationBucket[] = [];
  let eceSum = 0;
  let mce = 0;
  let totalBias = 0;
  let weightedCount = 0;

  for (const range of BUCKET_RANGES) {
    const inBucket = points.filter(p => p.predictedConfidence >= range.min && p.predictedConfidence < range.max);
    if (inBucket.length === 0) continue;

    const avgPredicted = inBucket.reduce((s, p) => s + p.predictedConfidence, 0) / inBucket.length;
    const actualRate = inBucket.filter(p => p.actualSuccess).length / inBucket.length;
    const error = Math.abs(avgPredicted - actualRate);

    buckets.push({
      range: range.label,
      predicted: Math.round(avgPredicted * 1000) / 1000,
      actualSuccessRate: Math.round(actualRate * 1000) / 1000,
      count: inBucket.length,
      calibrationError: Math.round(error * 1000) / 1000,
    });

    eceSum += error * inBucket.length;
    weightedCount += inBucket.length;
    mce = Math.max(mce, error);
    totalBias += (avgPredicted - actualRate) * inBucket.length;
  }

  const ece = weightedCount > 0 ? eceSum / weightedCount : 1.0;
  const bias = weightedCount > 0 ? totalBias / weightedCount : 0;

  let calibrationGrade: CalibrationReport['calibrationGrade'];
  if (ece < 0.05) calibrationGrade = 'excellent';
  else if (ece < 0.10) calibrationGrade = 'good';
  else if (ece < 0.20) calibrationGrade = 'fair';
  else calibrationGrade = 'poor';

  return {
    executorId,
    totalPoints: points.length,
    buckets,
    ece: Math.round(ece * 1000) / 1000,
    mce: Math.round(mce * 1000) / 1000,
    bias: Math.round(bias * 1000) / 1000,
    calibrationGrade,
  };
}

/**
 * Get all calibration data points for an executor.
 */
export function getCalibrationPoints(executorId: string): CalibrationPoint[] {
  return calibrationData.filter(p => p.executorId === executorId);
}
