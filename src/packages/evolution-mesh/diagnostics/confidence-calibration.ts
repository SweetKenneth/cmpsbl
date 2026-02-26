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

// ── #14 Calibration Trend Line ──

export interface CalibrationTrendPoint {
  windowStart: number;
  windowEnd: number;
  ece: number;
  mce: number;
  bias: number;
  pointCount: number;
}

export interface CalibrationTrendReport {
  executorId: string;
  trendPoints: CalibrationTrendPoint[];
  direction: 'improving' | 'stable' | 'degrading';
  /** Rate of ECE change per window (negative = improving) */
  eceSlope: number;
  /** Recommended action based on trend */
  recommendation: string;
}

const TREND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a calibration trend line showing ECE/bias over rolling windows.
 */
export function getCalibrationTrend(executorId: string): CalibrationTrendReport {
  const points = calibrationData
    .filter(p => p.executorId === executorId)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (points.length < 20) {
    return {
      executorId,
      trendPoints: [],
      direction: 'stable',
      eceSlope: 0,
      recommendation: 'Insufficient data for trend analysis. Continue recording calibration points.',
    };
  }

  const firstTime = points[0].timestamp;
  const now = Date.now();
  const trendPoints: CalibrationTrendPoint[] = [];

  let windowStart = firstTime;
  while (windowStart < now) {
    const windowEnd = windowStart + TREND_WINDOW_MS;
    const windowPoints = points.filter(p => p.timestamp >= windowStart && p.timestamp < windowEnd);

    if (windowPoints.length >= 5) {
      // Compute ECE for this window
      let eceSum = 0;
      let mce = 0;
      let biasSum = 0;
      let count = 0;

      for (const range of BUCKET_RANGES) {
        const inBucket = windowPoints.filter(p => p.predictedConfidence >= range.min && p.predictedConfidence < range.max);
        if (inBucket.length === 0) continue;
        const avgPred = inBucket.reduce((s, p) => s + p.predictedConfidence, 0) / inBucket.length;
        const actualRate = inBucket.filter(p => p.actualSuccess).length / inBucket.length;
        const error = Math.abs(avgPred - actualRate);
        eceSum += error * inBucket.length;
        mce = Math.max(mce, error);
        biasSum += (avgPred - actualRate) * inBucket.length;
        count += inBucket.length;
      }

      trendPoints.push({
        windowStart,
        windowEnd,
        ece: count > 0 ? Math.round((eceSum / count) * 1000) / 1000 : 1,
        mce: Math.round(mce * 1000) / 1000,
        bias: count > 0 ? Math.round((biasSum / count) * 1000) / 1000 : 0,
        pointCount: windowPoints.length,
      });
    }

    windowStart = windowEnd;
  }

  // Compute slope via simple linear regression on ECE values
  let direction: CalibrationTrendReport['direction'] = 'stable';
  let eceSlope = 0;

  if (trendPoints.length >= 3) {
    const n = trendPoints.length;
    const xMean = (n - 1) / 2;
    const yMean = trendPoints.reduce((s, p) => s + p.ece, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (trendPoints[i].ece - yMean);
      den += (i - xMean) ** 2;
    }
    eceSlope = den > 0 ? Math.round((num / den) * 10000) / 10000 : 0;

    if (eceSlope < -0.005) direction = 'improving';
    else if (eceSlope > 0.005) direction = 'degrading';
  }

  let recommendation: string;
  switch (direction) {
    case 'improving': recommendation = 'Calibration is improving. Maintain current feedback patterns.'; break;
    case 'degrading': recommendation = 'Calibration is degrading. Consider recalibration drills or reducing confidence in unfamiliar domains.'; break;
    default: recommendation = 'Calibration is stable. Monitor for drift in new mutation types.';
  }

  return { executorId, trendPoints, direction, eceSlope, recommendation };
}
