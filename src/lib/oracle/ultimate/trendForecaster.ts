/**
 * ORACLE Ultimate #2 — Trend Forecaster (Time-Series)
 * EMA, double-exponential smoothing, linear regression,
 * anomaly detection via Z-score, seasonal pattern detection.
 */

// ── Types ──

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}

export interface ForecastHorizon {
  horizon: '5min' | '1hr' | '24hr';
  predicted: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

export interface TrendAnalysis {
  seriesId: string;
  currentValue: number;
  ema: number;
  slope: number;
  rSquared: number;
  zScore: number;
  isAnomaly: boolean;
  seasonality: 'none' | 'daily' | 'weekly';
  forecasts: ForecastHorizon[];
  updatedAt: number;
}

export interface ForecastConfig {
  emaAlpha?: number;         // Default 0.3
  anomalyThreshold?: number; // Z-score threshold, default 2.5
  windowSize?: number;       // Points to keep, default 500
}

// ── State ──

const series = new Map<string, TimeSeriesPoint[]>();
const configs = new Map<string, ForecastConfig>();
const analyses = new Map<string, TrendAnalysis>();
let totalForecasts = 0;
let totalAnomalies = 0;

const DEFAULT_CONFIG: Required<ForecastConfig> = {
  emaAlpha: 0.3,
  anomalyThreshold: 2.5,
  windowSize: 500,
};

// ── Helpers ──

function getConfig(seriesId: string): Required<ForecastConfig> {
  const c = configs.get(seriesId);
  return { ...DEFAULT_CONFIG, ...c };
}

function computeEMA(points: TimeSeriesPoint[], alpha: number): number {
  if (points.length === 0) return 0;
  let ema = points[0].value;
  for (let i = 1; i < points.length; i++) {
    ema = alpha * points[i].value + (1 - alpha) * ema;
  }
  return ema;
}

function linearRegression(points: TimeSeriesPoint[]): { slope: number; intercept: number; rSquared: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.value ?? 0, rSquared: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += points[i].value;
    sumXY += i * points[i].value;
    sumX2 += i * i;
    sumY2 += points[i].value * points[i].value;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² calculation
  const yMean = sumY / n;
  const ssTotal = sumY2 - n * yMean * yMean;
  const ssResidual = points.reduce((s, p, i) => {
    const predicted = intercept + slope * i;
    return s + (p.value - predicted) ** 2;
  }, 0);
  const rSquared = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, rSquared };
}

function computeZScore(value: number, points: TimeSeriesPoint[]): number {
  if (points.length < 3) return 0;
  const values = points.map(p => p.value);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  return std > 0 ? (value - mean) / std : 0;
}

function detectSeasonality(points: TimeSeriesPoint[]): 'none' | 'daily' | 'weekly' {
  if (points.length < 48) return 'none'; // Need at least 2 days of hourly data
  // Simple autocorrelation check at 24h and 168h lags
  const values = points.map(p => p.value);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;

  const autocorr = (lag: number): number => {
    if (lag >= values.length) return 0;
    let num = 0, den = 0;
    for (let i = 0; i < values.length - lag; i++) {
      num += (values[i] - mean) * (values[i + lag] - mean);
      den += (values[i] - mean) ** 2;
    }
    return den > 0 ? num / den : 0;
  };

  const dailyCorr = autocorr(24);
  const weeklyCorr = autocorr(168);

  if (weeklyCorr > 0.5) return 'weekly';
  if (dailyCorr > 0.5) return 'daily';
  return 'none';
}

// ── Core API ──

export function addDataPoint(seriesId: string, value: number, timestamp?: number): void {
  const ts = timestamp ?? Date.now();
  const cfg = getConfig(seriesId);
  let pts = series.get(seriesId);
  if (!pts) {
    pts = [];
    series.set(seriesId, pts);
  }
  pts.push({ timestamp: ts, value });
  // Trim to window
  if (pts.length > cfg.windowSize) {
    pts.splice(0, pts.length - cfg.windowSize);
  }
}

export function setForecastConfig(seriesId: string, config: ForecastConfig): void {
  configs.set(seriesId, config);
}

export function forecast(seriesId: string): TrendAnalysis | null {
  const pts = series.get(seriesId);
  if (!pts || pts.length < 2) return null;

  const cfg = getConfig(seriesId);
  const currentValue = pts[pts.length - 1].value;
  const ema = computeEMA(pts, cfg.emaAlpha);
  const { slope, intercept, rSquared } = linearRegression(pts);
  const zScore = computeZScore(currentValue, pts);
  const isAnomaly = Math.abs(zScore) > cfg.anomalyThreshold;
  const seasonality = detectSeasonality(pts);

  if (isAnomaly) totalAnomalies++;

  // Forecast at 3 horizons using regression + confidence decay
  const n = pts.length;
  const stepsPerHorizon = { '5min': 5, '1hr': 60, '24hr': 1440 };
  const forecasts: ForecastHorizon[] = (['5min', '1hr', '24hr'] as const).map(horizon => {
    const steps = stepsPerHorizon[horizon];
    const predicted = intercept + slope * (n + steps);
    const confidence = Math.max(0, Math.min(1, rSquared * Math.exp(-steps / (n * 2))));
    const uncertainty = Math.abs(currentValue - ema) * (1 + steps / n);
    return {
      horizon,
      predicted,
      confidence: Math.round(confidence * 1000) / 1000,
      lowerBound: predicted - uncertainty,
      upperBound: predicted + uncertainty,
    };
  });

  totalForecasts++;

  const analysis: TrendAnalysis = {
    seriesId, currentValue, ema: Math.round(ema * 1000) / 1000,
    slope: Math.round(slope * 10000) / 10000,
    rSquared: Math.round(rSquared * 1000) / 1000,
    zScore: Math.round(zScore * 100) / 100,
    isAnomaly, seasonality, forecasts, updatedAt: Date.now(),
  };
  analyses.set(seriesId, analysis);
  return analysis;
}

export function getLatestAnalysis(seriesId: string): TrendAnalysis | null {
  return analyses.get(seriesId) ?? null;
}

export function getForecastStats(): { totalSeries: number; totalForecasts: number; totalAnomalies: number } {
  return { totalSeries: series.size, totalForecasts, totalAnomalies };
}

export function resetForecastState(): void {
  series.clear();
  configs.clear();
  analyses.clear();
  totalForecasts = 0;
  totalAnomalies = 0;
}
