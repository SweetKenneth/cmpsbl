/**
 * S-Tier 036 — Multi-Horizon Prediction Engine
 * CJPI: 94 | Node: ORACLE | ID: S-ORC02
 *
 * Generates predictions across multiple time horizons (short/mid/long)
 * using exponential smoothing with trend decomposition.
 */

export type Horizon = 'short' | 'medium' | 'long';

export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface Prediction {
  horizon: Horizon;
  predictedValue: number;
  confidence: number;   // 0-1
  targetTimestamp: number;
  trend: 'rising' | 'falling' | 'stable';
}

export interface MultiHorizonForecast {
  predictions: Prediction[];
  inputPoints: number;
  generatedAt: string;
}

const HORIZON_PERIODS: Record<Horizon, number> = {
  short: 3_600_000,       // 1 hour
  medium: 86_400_000,     // 1 day
  long: 604_800_000,      // 1 week
};

const SMOOTHING_ALPHA: Record<Horizon, number> = {
  short: 0.8,
  medium: 0.4,
  long: 0.15,
};

function exponentialSmooth(data: number[], alpha: number): number {
  if (data.length === 0) return 0;
  let smoothed = data[0];
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed;
  }
  return smoothed;
}

function detectTrend(data: number[]): 'rising' | 'falling' | 'stable' {
  if (data.length < 3) return 'stable';
  const recent = data.slice(-3);
  const diff = recent[recent.length - 1] - recent[0];
  const range = Math.max(...data) - Math.min(...data) || 1;
  const normDiff = diff / range;
  if (normDiff > 0.05) return 'rising';
  if (normDiff < -0.05) return 'falling';
  return 'stable';
}

export function forecast(points: DataPoint[]): MultiHorizonForecast {
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const values = sorted.map(p => p.value);
  const now = Date.now();
  const trend = detectTrend(values);

  const predictions: Prediction[] = (['short', 'medium', 'long'] as Horizon[]).map(horizon => {
    const alpha = SMOOTHING_ALPHA[horizon];
    const predicted = exponentialSmooth(values, alpha);
    const confidence = Math.min(1, values.length / (horizon === 'short' ? 10 : horizon === 'medium' ? 30 : 100));

    return {
      horizon,
      predictedValue: Math.round(predicted * 1000) / 1000,
      confidence: Math.round(confidence * 100) / 100,
      targetTimestamp: now + HORIZON_PERIODS[horizon],
      trend,
    };
  });

  return { predictions, inputPoints: points.length, generatedAt: new Date().toISOString() };
}
