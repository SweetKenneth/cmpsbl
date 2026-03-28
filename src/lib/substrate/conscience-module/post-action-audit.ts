/**
 * CONSCIENCE — Post-Action Audit Loop
 * Compares predicted ethical scores against actual execution outcomes.
 * Feeds back into ethical memory for continuous calibration.
 */

import { recordOutcome, storePrecedent, type EthicalPrecedent } from './ethical-memory';

export interface PostActionReport {
  evaluationId: string;
  action: string;
  predictedScore: number;
  predictedRecommendation: 'proceed' | 'caution' | 'block';
  actualOutcome: 'positive' | 'negative' | 'neutral';
  calibrationDelta: number;   // predicted vs actual alignment (-1 to 1)
  precedentId: string;
  timestamp: number;
}

const MAX_REPORTS = 300;
const reports: PostActionReport[] = [];
let writeIdx = 0;
let totalReports = 0;

// EMA for calibration tracking
let calibrationEMA = 0;
const EMA_ALPHA = 0.1;

function outcomeToScore(outcome: 'positive' | 'negative' | 'neutral'): number {
  if (outcome === 'positive') return 1;
  if (outcome === 'neutral') return 0.5;
  return 0;
}

/** Record the actual outcome of a previously evaluated action */
export function recordPostActionOutcome(
  evaluationId: string,
  action: string,
  predictedScore: number,
  predictedRecommendation: 'proceed' | 'caution' | 'block',
  frameworkScores: Record<string, number>,
  actualOutcome: 'positive' | 'negative' | 'neutral',
): PostActionReport {
  // Store as precedent
  const precedent: EthicalPrecedent = storePrecedent(
    action, predictedScore, predictedRecommendation, frameworkScores,
  );
  recordOutcome(precedent.id, actualOutcome);

  // Calculate calibration delta
  const normalizedPrediction = predictedScore / 100;
  const actualScore = outcomeToScore(actualOutcome);
  const calibrationDelta = actualScore - normalizedPrediction;

  // Update EMA
  calibrationEMA = EMA_ALPHA * calibrationDelta + (1 - EMA_ALPHA) * calibrationEMA;

  const report: PostActionReport = {
    evaluationId,
    action: action.slice(0, 200),
    predictedScore,
    predictedRecommendation,
    actualOutcome,
    calibrationDelta,
    precedentId: precedent.id,
    timestamp: Date.now(),
  };

  if (totalReports < MAX_REPORTS) {
    reports.push(report);
  } else {
    reports[writeIdx] = report;
  }
  writeIdx = (writeIdx + 1) % MAX_REPORTS;
  totalReports++;

  return report;
}

/** Get the current calibration health */
export function getCalibrationHealth(): {
  ema: number;
  accuracy: number;
  totalReports: number;
  recentAccuracy: number;
} {
  const recent = reports.slice(-50);
  let accurateCount = 0;
  for (const r of recent) {
    // "Accurate" if delta is within ±0.3
    if (Math.abs(r.calibrationDelta) <= 0.3) accurateCount++;
  }

  const allAccurate = reports.reduce((c, r) => c + (Math.abs(r.calibrationDelta) <= 0.3 ? 1 : 0), 0);

  return {
    ema: Math.round(calibrationEMA * 1000) / 1000,
    accuracy: reports.length > 0 ? Math.round((allAccurate / reports.length) * 100) : 100,
    totalReports: reports.length,
    recentAccuracy: recent.length > 0 ? Math.round((accurateCount / recent.length) * 100) : 100,
  };
}

/** Get recent post-action reports */
export function getRecentReports(count: number = 20): PostActionReport[] {
  return reports.slice(-count);
}
