/**
 * COMPASS Module — Spatial-Temporal Reasoning & Forecasting
 * Geo-distance (Haversine), 2-opt route optimization, time-series decomposition
 * with decaying confidence, and real temporal pattern detection.
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeoPoint { lat: number; lng: number; altitude?: number; timestamp?: number; }
export interface GeoRegion { id: string; name: string; bounds: { ne: GeoPoint; sw: GeoPoint }; properties: Record<string, unknown>; }

export interface Route {
  id: string;
  waypoints: GeoPoint[];
  distanceKm: number;
  durationMinutes: number;
  efficiency: number;
  optimized: boolean;
  twoOptImproved: boolean;
  iterations: number;
  timestamp: number;
}

export interface TimeSeriesForecast {
  id: string;
  metric: string;
  dataPoints: { timestamp: number; value: number }[];
  predictions: { timestamp: number; value: number; confidence: number }[];
  decomposition: { trend: number[]; seasonal: number[]; residual: number[] };
  trend: 'increasing' | 'stable' | 'decreasing' | 'seasonal';
  accuracy: number;
  generatedAt: number;
}

export type PatternType = 'seasonality' | 'trend' | 'anomaly' | 'changepoint';

export interface TemporalPattern {
  id: string;
  type: PatternType;
  name: string;
  periodMs: number;
  amplitude: number;
  phase: number;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, unknown>;
}

export interface CompassModuleState {
  initialized: boolean;
  regions: GeoRegion[];
  routes: Route[];
  forecasts: TimeSeriesForecast[];
  patterns: TemporalPattern[];
  totalRoutes: number;
  totalForecasts: number;
  avgRouteEfficiency: number;
  avgForecastAccuracy: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

const state: CompassModuleState = {
  initialized: false,
  regions: [],
  routes: [],
  forecasts: [],
  patterns: [],
  totalRoutes: 0,
  totalForecasts: 0,
  avgRouteEfficiency: 0,
  avgForecastAccuracy: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initCompass(): void {
  emitStarted('compass', 'init', {});
  try {
    initCircuitBreaker('compass', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('compass', '2.0.0');
    hardening = createModuleHardening('compass', { maxConcurrent: 10, rateLimit: 100, healthThreshold: 30 });
    state.initialized = true;
    hardening.startAutoRestore(() => getCompassHealth(), () => { state.avgRouteEfficiency = 0; state.avgForecastAccuracy = 0; }, 30_000);
    hardening.snapshot(state);
    emitSucceeded('compass', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('compass', 'init', err instanceof Error ? err.message : String(err));
  }
}

// ─── Haversine Distance ───────────────────────────────────────────────────────

export function calculateDistance(a: GeoPoint, b: GeoPoint): number {
  const R = 6371; // Earth radius km
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// ─── Route Optimization (Nearest-Neighbor + 2-Opt) ────────────────────────────

function totalRouteDistance(pts: GeoPoint[]): number {
  let d = 0;
  for (let i = 0; i < pts.length - 1; i++) d += calculateDistance(pts[i], pts[i + 1]);
  return d;
}

function twoOptImprove(pts: GeoPoint[]): { route: GeoPoint[]; improved: boolean; iterations: number } {
  const route = [...pts];
  let improved = true;
  let iterations = 0;
  const maxIterations = 500;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const d1 = calculateDistance(route[i - 1], route[i]) + calculateDistance(route[j], route[j + 1] ?? route[0]);
        const d2 = calculateDistance(route[i - 1], route[j]) + calculateDistance(route[i], route[j + 1] ?? route[0]);
        if (d2 < d1) {
          // Reverse the segment between i and j
          const segment = route.slice(i, j + 1).reverse();
          route.splice(i, segment.length, ...segment);
          improved = true;
        }
      }
    }
  }
  return { route, improved: iterations > 1, iterations };
}

export function optimizeRoute(waypoints: GeoPoint[]): Route {
  const fallback: Route = {
    id: `rt-fallback-${Date.now()}`, waypoints, distanceKm: 0, durationMinutes: 0,
    efficiency: 0, optimized: false, twoOptImproved: false, iterations: 0, timestamp: Date.now(),
  };

  if (waypoints.length < 2) return fallback;

  const { result } = withResilienceSync('compass', () => {
    // Step 1: Nearest-neighbor heuristic for initial path
    const nn = [...waypoints];
    for (let i = 0; i < nn.length - 1; i++) {
      let nearest = i + 1;
      let nearestDist = calculateDistance(nn[i], nn[i + 1]);
      for (let j = i + 2; j < nn.length; j++) {
        const d = calculateDistance(nn[i], nn[j]);
        if (d < nearestDist) { nearest = j; nearestDist = d; }
      }
      if (nearest !== i + 1) [nn[i + 1], nn[nearest]] = [nn[nearest], nn[i + 1]];
    }

    const nnDist = totalRouteDistance(nn);

    // Step 2: 2-opt improvement phase
    const { route: optimized, improved, iterations } = twoOptImprove(nn);
    const optDist = totalRouteDistance(optimized);

    // Efficiency = optimal / actual (capped at 1.0)
    const efficiency = nnDist > 0 ? clampNumber(optDist / nnDist, 0, 1, 0.8) : 1;

    const route: Route = {
      id: `rt-${Date.now()}-${state.totalRoutes}`,
      waypoints: optimized,
      distanceKm: Math.round(optDist * 100) / 100,
      durationMinutes: Math.round(optDist * 1.2 * 100) / 100,
      efficiency,
      optimized: true,
      twoOptImproved: improved,
      iterations,
      timestamp: Date.now(),
    };

    if (state.routes.length >= 200) state.routes.shift();
    state.routes.push(route);
    state.totalRoutes++;
    recalculate();

    emit({ module: 'compass', event_type: 'route_optimized', outcome: 'succeeded', data: { id: route.id, distanceKm: route.distanceKm, efficiency, twoOpt: improved, iterations } });
    return route;
  }, fallback, 'optimize_route');

  return result;
}

// ─── Time-Series Decomposition & Forecasting ──────────────────────────────────

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += values[i]; sumXY += i * values[i]; sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function decompose(values: number[]): { trend: number[]; seasonal: number[]; residual: number[] } {
  const n = values.length;

  // Trend: linear regression
  const { slope, intercept } = linearRegression(values);
  const trend = Array.from({ length: n }, (_, i) => intercept + slope * i);

  // Detrend
  const detrended = values.map((v, i) => v - trend[i]);

  // Seasonal: attempt period detection via simple autocorrelation (check periods 2-7)
  let bestPeriod = 1;
  let bestCorr = -Infinity;
  for (let p = 2; p <= Math.min(7, Math.floor(n / 3)); p++) {
    let corr = 0;
    let count = 0;
    for (let i = p; i < n; i++) {
      corr += detrended[i] * detrended[i - p];
      count++;
    }
    if (count > 0) corr /= count;
    if (corr > bestCorr) { bestCorr = corr; bestPeriod = p; }
  }

  // Average seasonal component by period position
  const seasonalAvg = new Array(bestPeriod).fill(0);
  const seasonalCount = new Array(bestPeriod).fill(0);
  for (let i = 0; i < n; i++) {
    seasonalAvg[i % bestPeriod] += detrended[i];
    seasonalCount[i % bestPeriod]++;
  }
  for (let p = 0; p < bestPeriod; p++) {
    seasonalAvg[p] = seasonalCount[p] > 0 ? seasonalAvg[p] / seasonalCount[p] : 0;
  }

  const seasonal = Array.from({ length: n }, (_, i) => seasonalAvg[i % bestPeriod]);
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  return { trend, seasonal, residual };
}

export function forecastTimeSeries(metric: string, dataPoints: { timestamp: number; value: number }[], horizonSteps: number = 10): TimeSeriesForecast {
  const values = dataPoints.map(d => d.value);
  const n = values.length;
  if (n < 2) {
    return {
      id: `fc-empty-${Date.now()}`, metric, dataPoints, predictions: [],
      decomposition: { trend: [], seasonal: [], residual: [] },
      trend: 'stable', accuracy: 0, generatedAt: Date.now(),
    };
  }

  // Step 1: Decompose into trend + seasonal + residual
  const { trend: trendArr, seasonal, residual } = decompose(values);

  // Step 2: Extrapolate trend via linear regression
  const { slope, intercept } = linearRegression(values);

  // Step 3: Determine trend direction
  const trendDir: TimeSeriesForecast['trend'] =
    slope > Math.abs(values[0] || 1) * 0.01 ? 'increasing' :
    slope < -Math.abs(values[0] || 1) * 0.01 ? 'decreasing' : 'stable';

  // Step 4: Project forward with decaying confidence
  const lastTs = dataPoints[n - 1].timestamp;
  const interval = n > 1 ? (dataPoints[n - 1].timestamp - dataPoints[0].timestamp) / (n - 1) : 3600_000;
  const baseConfidence = 0.95;
  const decayFactor = 0.92; // Exponential decay per step

  // Find seasonal period length for projection
  const seasonalPeriod = seasonal.length > 0 ? Math.max(1, new Set(seasonal.map((_, i) => seasonal[i])).size > 1 ? seasonal.length : 1) : 1;

  const predictions = Array.from({ length: clampNumber(horizonSteps, 1, 100, 10) }, (_, i) => {
    const trendValue = intercept + slope * (n + i);
    const seasonalValue = seasonal[(n + i) % seasonalPeriod] || 0;
    const confidence = clampNumber(baseConfidence * Math.pow(decayFactor, i), 0.1, 1, 0.5);

    return {
      timestamp: lastTs + interval * (i + 1),
      value: Math.round((trendValue + seasonalValue) * 100) / 100,
      confidence: Math.round(confidence * 1000) / 1000,
    };
  });

  // Accuracy: based on residual variance vs signal variance
  const meanVal = values.reduce((s, v) => s + v, 0) / n;
  const totalVar = values.reduce((s, v) => s + (v - meanVal) ** 2, 0) / n;
  const residVar = residual.reduce((s, r) => s + r ** 2, 0) / n;
  const rSquared = totalVar > 0 ? clampNumber(1 - residVar / totalVar, 0, 1, 0.5) : 0.5;

  const forecast: TimeSeriesForecast = {
    id: `fc-${Date.now()}-${state.totalForecasts}`, metric, dataPoints, predictions,
    decomposition: { trend: trendArr, seasonal, residual },
    trend: trendDir,
    accuracy: Math.round(rSquared * 100) / 100,
    generatedAt: Date.now(),
  };

  if (state.forecasts.length >= 100) state.forecasts.shift();
  state.forecasts.push(forecast);
  state.totalForecasts++;
  recalculate();

  emit({ module: 'compass', event_type: 'forecast_generated', outcome: 'succeeded', data: { id: forecast.id, metric, accuracy: forecast.accuracy, trend: trendDir, steps: horizonSteps } });
  return forecast;
}

// ─── Temporal Pattern Detection ───────────────────────────────────────────────

export function detectPatterns(dataPoints: { timestamp: number; value: number }[]): TemporalPattern[] {
  if (dataPoints.length < 10) return [];
  const values = dataPoints.map(d => d.value);
  const n = values.length;
  const patterns: TemporalPattern[] = [];
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / n);

  // 1. Trend detection
  const { slope } = linearRegression(values);
  const trendStrength = Math.abs(slope * n) / (Math.abs(mean) || 1);
  if (trendStrength > 0.05) {
    patterns.push({
      id: `pat-trend-${Date.now()}`, type: 'trend',
      name: slope > 0 ? 'increasing_trend' : 'decreasing_trend',
      periodMs: 0, amplitude: Math.abs(slope * n), phase: 0,
      confidence: clampNumber(Math.min(trendStrength * 2, 1), 0, 1, 0.5),
      startIndex: 0, endIndex: n - 1,
      metadata: { slope, direction: slope > 0 ? 'increasing' : 'decreasing' },
    });
  }

  // 2. Anomaly detection (z-score > 3.0 from moving average)
  if (stdDev > 0) {
    const windowSize = Math.min(10, Math.floor(n / 3));
    for (let i = windowSize; i < n; i++) {
      const windowSlice = values.slice(i - windowSize, i);
      const windowMean = windowSlice.reduce((s, v) => s + v, 0) / windowSize;
      const windowStd = Math.sqrt(windowSlice.reduce((s, v) => s + (v - windowMean) ** 2, 0) / windowSize);
      if (windowStd > 0) {
        const zScore = Math.abs(values[i] - windowMean) / windowStd;
        if (zScore > 3.0) {
          patterns.push({
            id: `pat-anomaly-${Date.now()}-${i}`, type: 'anomaly',
            name: `anomaly_at_${i}`, periodMs: 0, amplitude: values[i] - windowMean, phase: 0,
            confidence: clampNumber(1 - 1 / zScore, 0.5, 1, 0.7),
            startIndex: i, endIndex: i,
            metadata: { zScore: Math.round(zScore * 100) / 100, value: values[i], windowMean },
          });
        }
      }
    }
  }

  // 3. Seasonality detection (autocorrelation at common periods)
  const periodsToCheck = [
    { name: 'daily_cycle', ms: 86400_000 },
    { name: 'weekly_cycle', ms: 604800_000 },
    { name: 'monthly_cycle', ms: 2592000_000 },
  ];
  for (const { name, ms } of periodsToCheck) {
    // Estimate period in data-point indices
    if (n < 2) continue;
    const interval = (dataPoints[n - 1].timestamp - dataPoints[0].timestamp) / (n - 1);
    if (interval <= 0) continue;
    const periodIdx = Math.round(ms / interval);
    if (periodIdx < 2 || periodIdx >= n / 2) continue;

    // Compute autocorrelation at this lag
    let corr = 0, norm1 = 0, norm2 = 0;
    for (let i = 0; i < n - periodIdx; i++) {
      const a = values[i] - mean;
      const b = values[i + periodIdx] - mean;
      corr += a * b;
      norm1 += a * a;
      norm2 += b * b;
    }
    const denom = Math.sqrt(norm1 * norm2);
    const r = denom > 0 ? corr / denom : 0;

    if (r > 0.3) {
      patterns.push({
        id: `pat-${name}-${Date.now()}`, type: 'seasonality', name,
        periodMs: ms, amplitude: stdDev * r, phase: 0,
        confidence: clampNumber(r, 0.3, 1, 0.5),
        startIndex: 0, endIndex: n - 1,
        metadata: { autocorrelation: Math.round(r * 1000) / 1000, periodIndex: periodIdx },
      });
    }
  }

  // 4. Changepoint detection (structural shift in distribution)
  if (n >= 20) {
    const halfWindow = Math.floor(n / 4);
    let maxShift = 0, maxShiftIdx = -1;
    for (let i = halfWindow; i < n - halfWindow; i++) {
      const leftMean = values.slice(i - halfWindow, i).reduce((s, v) => s + v, 0) / halfWindow;
      const rightMean = values.slice(i, i + halfWindow).reduce((s, v) => s + v, 0) / halfWindow;
      const shift = Math.abs(rightMean - leftMean);
      if (shift > maxShift) { maxShift = shift; maxShiftIdx = i; }
    }
    if (stdDev > 0 && maxShift / stdDev > 1.5 && maxShiftIdx >= 0) {
      patterns.push({
        id: `pat-changepoint-${Date.now()}`, type: 'changepoint',
        name: 'structural_shift', periodMs: 0, amplitude: maxShift, phase: 0,
        confidence: clampNumber(maxShift / (stdDev * 3), 0.3, 1, 0.5),
        startIndex: maxShiftIdx, endIndex: maxShiftIdx,
        metadata: { shiftMagnitude: Math.round(maxShift * 100) / 100, normalizedShift: Math.round(maxShift / stdDev * 100) / 100 },
      });
    }
  }

  state.patterns = patterns;
  emit({ module: 'compass', event_type: 'patterns_detected', outcome: 'succeeded', data: { count: patterns.length, types: [...new Set(patterns.map(p => p.type))] } });
  return patterns;
}

// ─── Internals ────────────────────────────────────────────────────────────────

function recalculate(): void {
  const routes = state.routes.slice(-20);
  state.avgRouteEfficiency = routes.length > 0 ? Math.round(routes.reduce((s, r) => s + r.efficiency, 0) / routes.length * 100) / 100 : 0;
  const fcs = state.forecasts.slice(-20);
  state.avgForecastAccuracy = fcs.length > 0 ? Math.round(fcs.reduce((s, f) => s + f.accuracy, 0) / fcs.length * 100) / 100 : 0;
}

// ─── Health (multi-factor) ────────────────────────────────────────────────────

export function getCompassHealth(): number {
  if (!state.initialized) return 0;
  if (hardening?.isDegraded()) return 40;

  let score = 100;

  // Factor 1: Route efficiency (weight: 30)
  if (state.totalRoutes > 0) {
    if (state.avgRouteEfficiency < 0.4) score -= 30;
    else if (state.avgRouteEfficiency < 0.6) score -= 20;
    else if (state.avgRouteEfficiency < 0.75) score -= 10;
  }

  // Factor 2: Forecast accuracy (weight: 30)
  if (state.totalForecasts > 0) {
    if (state.avgForecastAccuracy < 0.5) score -= 30;
    else if (state.avgForecastAccuracy < 0.7) score -= 15;
    else if (state.avgForecastAccuracy < 0.8) score -= 5;
  }

  // Factor 3: Pattern freshness (weight: 20)
  const stalePatterns = state.patterns.filter(p => p.confidence < 0.3);
  if (stalePatterns.length > state.patterns.length * 0.5 && state.patterns.length > 0) score -= 20;
  else if (stalePatterns.length > 0) score -= 5;

  // Factor 4: Capacity (weight: 20)
  if (state.routes.length >= 180) score -= 10;
  if (state.forecasts.length >= 90) score -= 10;

  return clampNumber(score, 0, 100, 50);
}

// ─── Accessors ────────────────────────────────────────────────────────────────

export function getCompassState(): CompassModuleState { return { ...state }; }
export function getCompassResilience() { return getModuleResilienceReport('compass', getCompassHealth()); }
export function getCompassEngine() { return moduleEngine; }
export function getCompassHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeCompassEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
