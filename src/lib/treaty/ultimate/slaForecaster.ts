/**
 * TREATY Ultimate — SLA Forecaster
 * Predictive SLA compliance scoring using EMA trend analysis
 * and breach probability estimation.
 */

export interface SLAForecast {
  contractId: string;
  metric: string;
  currentValue: number;
  trend: 'improving' | 'stable' | 'degrading';
  trendSlope: number;
  predictedValue7d: number;
  predictedValue30d: number;
  breachProbability: number; // 0–1
  confidenceInterval: { low: number; high: number };
  updatedAt: number;
}

export interface ForecastHistory {
  contractId: string;
  metric: string;
  samples: Array<{ value: number; timestamp: number }>;
  emaShort: number; // 7-point EMA
  emaLong: number;  // 30-point EMA
}

const EMA_SHORT_ALPHA = 2 / (7 + 1);
const EMA_LONG_ALPHA = 2 / (30 + 1);
const MAX_SAMPLES = 200;
const MAX_HISTORIES = 500;

const histories = new Map<string, ForecastHistory>();
const forecasts = new Map<string, SLAForecast>();

function historyKey(contractId: string, metric: string): string {
  return `${contractId}:${metric}`;
}

export function recordSLASample(contractId: string, metric: string, value: number): ForecastHistory {
  const key = historyKey(contractId, metric);
  let history = histories.get(key);

  if (!history) {
    if (histories.size >= MAX_HISTORIES) {
      // Evict oldest
      const firstKey = histories.keys().next().value;
      if (firstKey) histories.delete(firstKey);
    }
    history = {
      contractId,
      metric,
      samples: [],
      emaShort: value,
      emaLong: value,
    };
    histories.set(key, history);
  }

  if (history.samples.length >= MAX_SAMPLES) history.samples.shift();
  history.samples.push({ value, timestamp: Date.now() });

  // Update EMAs
  history.emaShort = value * EMA_SHORT_ALPHA + history.emaShort * (1 - EMA_SHORT_ALPHA);
  history.emaLong = value * EMA_LONG_ALPHA + history.emaLong * (1 - EMA_LONG_ALPHA);

  return history;
}

export function forecastSLA(contractId: string, metric: string, slaMinimum: number): SLAForecast {
  const key = historyKey(contractId, metric);
  const history = histories.get(key);

  if (!history || history.samples.length < 3) {
    const noData: SLAForecast = {
      contractId, metric, currentValue: 0,
      trend: 'stable', trendSlope: 0,
      predictedValue7d: 0, predictedValue30d: 0,
      breachProbability: 0,
      confidenceInterval: { low: 0, high: 0 },
      updatedAt: Date.now(),
    };
    forecasts.set(key, noData);
    return noData;
  }

  const current = history.samples[history.samples.length - 1].value;

  // Trend detection via EMA crossover
  const trendSlope = history.emaShort - history.emaLong;
  let trend: SLAForecast['trend'];
  if (trendSlope > 0.01) trend = 'improving';
  else if (trendSlope < -0.01) trend = 'degrading';
  else trend = 'stable';

  // Linear extrapolation from recent samples
  const recentN = Math.min(history.samples.length, 14);
  const recent = history.samples.slice(-recentN);
  const n = recent.length;
  const xMean = (n - 1) / 2;
  const yMean = recent.reduce((s, p) => s + p.value, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (recent[i].value - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den > 0 ? num / den : 0;

  const predicted7d = current + slope * 7;
  const predicted30d = current + slope * 30;

  // Variance for confidence interval
  const variance = recent.reduce((s, p) => s + (p.value - yMean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Breach probability: how likely the predicted value crosses below minimum
  // Using z-score approximation
  const distToMin7d = predicted7d - slaMinimum;
  const zScore = stdDev > 0 ? distToMin7d / stdDev : (distToMin7d >= 0 ? 10 : -10);
  // Simplified CDF approximation
  const breachProbability = Math.max(0, Math.min(1, 0.5 - 0.5 * Math.tanh(zScore * 0.7)));

  const forecast: SLAForecast = {
    contractId, metric,
    currentValue: current,
    trend,
    trendSlope: Math.round(trendSlope * 10000) / 10000,
    predictedValue7d: Math.round(predicted7d * 1000) / 1000,
    predictedValue30d: Math.round(predicted30d * 1000) / 1000,
    breachProbability: Math.round(breachProbability * 1000) / 1000,
    confidenceInterval: {
      low: Math.round((predicted7d - 2 * stdDev) * 1000) / 1000,
      high: Math.round((predicted7d + 2 * stdDev) * 1000) / 1000,
    },
    updatedAt: Date.now(),
  };

  forecasts.set(key, forecast);
  return forecast;
}

export function getForecasts(): SLAForecast[] { return Array.from(forecasts.values()); }
export function getForecast(contractId: string, metric: string): SLAForecast | undefined {
  return forecasts.get(historyKey(contractId, metric));
}
export function getForecastStats() {
  const all = Array.from(forecasts.values());
  return {
    total: all.length,
    degrading: all.filter(f => f.trend === 'degrading').length,
    atRisk: all.filter(f => f.breachProbability > 0.5).length,
    avgBreachProbability: all.length > 0
      ? Math.round(all.reduce((s, f) => s + f.breachProbability, 0) / all.length * 1000) / 1000
      : 0,
  };
}
