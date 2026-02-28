/**
 * Delta Trend Regression Detection
 * Analyzes evolution deltas over time to detect declining health trends.
 * Blocks evolution promotion when regression patterns emerge.
 */

export interface EvolutionDeltaPoint {
  proposalId: string;
  timestamp: number;
  healthDelta: number;
  auditDelta: number;
  debtDelta: number;
  entropyDelta: number;
}

export interface RegressionReport {
  isRegressing: boolean;
  regressionScore: number; // 0-1, higher = worse
  trendDirection: 'improving' | 'stable' | 'declining' | 'volatile';
  blockedReason: string | null;
  metrics: {
    healthTrend: number;
    debtTrend: number;
    entropyTrend: number;
    consecutiveDeclines: number;
    volatilityIndex: number;
  };
  recommendation: string;
}

const REGRESSION_THRESHOLDS = {
  consecutiveDeclines: 3,
  healthTrendMin: -0.15,
  debtGrowthMax: 0.2,
  entropyGrowthMax: 0.25,
  volatilityMax: 0.4,
};

function linearTrend(values: number[]): number {
  if (values.length < 2) return 0;
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function volatility(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function detectRegression(
  deltas: EvolutionDeltaPoint[],
  thresholds = REGRESSION_THRESHOLDS,
): RegressionReport {
  if (deltas.length < 2) {
    return {
      isRegressing: false,
      regressionScore: 0,
      trendDirection: 'stable',
      blockedReason: null,
      metrics: { healthTrend: 0, debtTrend: 0, entropyTrend: 0, consecutiveDeclines: 0, volatilityIndex: 0 },
      recommendation: 'Insufficient data for trend analysis.',
    };
  }

  const sorted = [...deltas].sort((a, b) => a.timestamp - b.timestamp);
  const healthDeltas = sorted.map(d => d.healthDelta);
  const debtDeltas = sorted.map(d => d.debtDelta);
  const entropyDeltas = sorted.map(d => d.entropyDelta);

  const healthTrend = linearTrend(healthDeltas);
  const debtTrend = linearTrend(debtDeltas);
  const entropyTrend = linearTrend(entropyDeltas);
  const volatilityIndex = volatility(healthDeltas);

  // Count consecutive declines
  let consecutiveDeclines = 0;
  for (let i = healthDeltas.length - 1; i >= 0; i--) {
    if (healthDeltas[i] < 0) consecutiveDeclines++;
    else break;
  }

  // Regression scoring
  let regressionScore = 0;
  if (healthTrend < 0) regressionScore += Math.min(0.3, Math.abs(healthTrend));
  if (debtTrend > 0) regressionScore += Math.min(0.2, debtTrend);
  if (entropyTrend > 0) regressionScore += Math.min(0.2, entropyTrend);
  if (consecutiveDeclines >= thresholds.consecutiveDeclines) regressionScore += 0.2;
  if (volatilityIndex > thresholds.volatilityMax) regressionScore += 0.1;
  regressionScore = Math.min(1, regressionScore);

  const isRegressing = regressionScore > 0.4;

  let trendDirection: RegressionReport['trendDirection'];
  if (volatilityIndex > thresholds.volatilityMax) trendDirection = 'volatile';
  else if (healthTrend > 0.05) trendDirection = 'improving';
  else if (healthTrend < -0.05) trendDirection = 'declining';
  else trendDirection = 'stable';

  let blockedReason: string | null = null;
  if (consecutiveDeclines >= thresholds.consecutiveDeclines) {
    blockedReason = `${consecutiveDeclines} consecutive health declines detected. Evolution promotion blocked.`;
  } else if (healthTrend < thresholds.healthTrendMin) {
    blockedReason = `Health trend ${healthTrend.toFixed(3)} below minimum threshold. Evolution promotion blocked.`;
  }

  const recommendation = isRegressing
    ? 'Review recent evolutions for root cause. Consider rolling back to last healthy snapshot.'
    : trendDirection === 'improving'
      ? 'System health improving. Safe to continue evolution.'
      : 'System stable. Monitor next evolution cycle.';

  return {
    isRegressing,
    regressionScore,
    trendDirection,
    blockedReason,
    metrics: { healthTrend, debtTrend, entropyTrend, consecutiveDeclines, volatilityIndex },
    recommendation,
  };
}

export function shouldBlockPromotion(deltas: EvolutionDeltaPoint[]): {
  blocked: boolean;
  reason: string;
} {
  const report = detectRegression(deltas);
  return {
    blocked: report.blockedReason !== null,
    reason: report.blockedReason ?? 'No regression detected.',
  };
}
