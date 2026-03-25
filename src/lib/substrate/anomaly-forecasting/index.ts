/**
 * Anomaly Forecasting Engine
 * Predict breaker trips using BRAIN learning data
 * 
 * Uses historical failure signatures from the predictive-failure engine
 * to forecast upcoming anomalies before they happen.
 */

import { getActivePredictions, type FailurePrediction } from '../predictive-failure';
import { emit } from '../events';

export interface AnomalyForecast {
  id: string;
  nodeId: string;
  metric: string;
  predictedEvent: 'breaker_trip' | 'health_drop' | 'latency_spike' | 'cascade';
  probability: number; // 0-1
  estimatedTimeMs: number;
  confidence: number;
  basedOn: string; // what data drove the forecast
  createdAt: number;
  status: 'active' | 'confirmed' | 'expired' | 'prevented';
}

export interface ForecastConfig {
  enabled: boolean;
  lookAheadMs: number;
  minConfidence: number;
  expirationMs: number;
}

const forecasts: AnomalyForecast[] = [];
let forecastConfig: ForecastConfig = {
  enabled: true,
  lookAheadMs: 600_000, // 10 minutes
  minConfidence: 0.5,
  expirationMs: 900_000, // 15 minutes
};

// Historical patterns: module → avg time between failures
const failurePatterns = new Map<string, { avgIntervalMs: number; lastFailure: number; count: number }>();

export function recordFailureEvent(nodeId: string): void {
  const pattern = failurePatterns.get(nodeId);
  const now = Date.now();

  if (pattern) {
    const interval = now - pattern.lastFailure;
    // Running average
    pattern.avgIntervalMs = Math.round((pattern.avgIntervalMs * pattern.count + interval) / (pattern.count + 1));
    pattern.lastFailure = now;
    pattern.count++;
  } else {
    failurePatterns.set(nodeId, {
      avgIntervalMs: 0,
      lastFailure: now,
      count: 1,
    });
  }
}

// Index of active forecasts by "nodeId::metric" for O(1) dedup lookups
const activeIndex = new Map<string, number>(); // key → index in forecasts[]

function activeKey(nodeId: string, metric: string): string {
  return `${nodeId}::${metric}`;
}

export function generateForecasts(): AnomalyForecast[] {
  if (!forecastConfig.enabled) return [];

  const newForecasts: AnomalyForecast[] = [];
  const now = Date.now();

  // Expire old forecasts + rebuild active index
  activeIndex.clear();
  for (let i = 0; i < forecasts.length; i++) {
    const f = forecasts[i];
    if (f.status === 'active') {
      if (now - f.createdAt > forecastConfig.expirationMs) {
        f.status = 'expired';
      } else {
        activeIndex.set(activeKey(f.nodeId, f.metric), i);
      }
    }
  }

  // Source 1: Predictive failure engine predictions
  const predictions = getActivePredictions(forecastConfig.lookAheadMs);
  for (const pred of predictions) {
    if (pred.confidence < forecastConfig.minConfidence) continue;
    const key = activeKey(pred.moduleId, pred.metric);
    if (activeIndex.has(key)) continue;

    const forecast: AnomalyForecast = {
      id: `forecast-${now}-${pred.moduleId}`,
      nodeId: pred.moduleId, metric: pred.metric,
      predictedEvent: pred.severity === 'critical' ? 'breaker_trip' : 'health_drop',
      probability: pred.confidence, estimatedTimeMs: pred.estimatedTimeToFailureMs,
      confidence: pred.confidence,
      basedOn: `Trend analysis: ${pred.metric} rising toward ${pred.threshold}`,
      createdAt: now, status: 'active',
    };
    activeIndex.set(key, forecasts.length);
    newForecasts.push(forecast);
    forecasts.push(forecast);
  }

  // Source 2: Historical failure patterns
  for (const [nodeId, pattern] of failurePatterns) {
    if (pattern.count < 3 || pattern.avgIntervalMs === 0) continue;
    const expectedNextFailure = pattern.avgIntervalMs - (now - pattern.lastFailure);
    if (expectedNextFailure <= 0 || expectedNextFailure >= forecastConfig.lookAheadMs) continue;

    const key = activeKey(nodeId, 'failure_pattern');
    if (activeIndex.has(key)) continue;

    const probability = Math.min(0.85, 0.4 + (pattern.count / 20));
    const forecast: AnomalyForecast = {
      id: `forecast-pattern-${now}-${nodeId}`,
      nodeId, metric: 'failure_pattern', predictedEvent: 'breaker_trip',
      probability, estimatedTimeMs: expectedNextFailure, confidence: probability,
      basedOn: `Historical pattern: avg interval ${Math.round(pattern.avgIntervalMs / 1000)}s over ${pattern.count} failures`,
      createdAt: now, status: 'active',
    };
    activeIndex.set(key, forecasts.length);
    newForecasts.push(forecast);
    forecasts.push(forecast);
  }

  if (newForecasts.length > 0) {
    emit({
      module: 'brain',
      event_type: 'anomaly_forecasts_generated',
      outcome: 'succeeded',
      data: { count: newForecasts.length, forecasts: newForecasts.map(f => ({ nodeId: f.nodeId, event: f.predictedEvent, probability: f.probability })) },
    });
  }

  // Trim history
  if (forecasts.length > 500) forecasts.splice(0, forecasts.length - 250);

  return newForecasts;
}

export function confirmForecast(forecastId: string): void {
  const f = forecasts.find(x => x.id === forecastId);
  if (f) f.status = 'confirmed';
}

export function markPrevented(forecastId: string): void {
  const f = forecasts.find(x => x.id === forecastId);
  if (f) f.status = 'prevented';
}

export function getActiveForecasts(): AnomalyForecast[] {
  return forecasts.filter(f => f.status === 'active');
}

export function getAllForecasts(limit = 50): AnomalyForecast[] {
  return forecasts.slice(-limit);
}

export function configureForecast(cfg: Partial<ForecastConfig>): ForecastConfig {
  forecastConfig = { ...forecastConfig, ...cfg };
  return { ...forecastConfig };
}

export function getForecastSummary() {
  const active = forecasts.filter(f => f.status === 'active');
  const confirmed = forecasts.filter(f => f.status === 'confirmed');
  const prevented = forecasts.filter(f => f.status === 'prevented');

  return {
    active: active.length,
    totalGenerated: forecasts.length,
    confirmed: confirmed.length,
    prevented: prevented.length,
    accuracy: (confirmed.length + prevented.length) > 0
      ? Math.round((confirmed.length / (confirmed.length + prevented.length)) * 100)
      : 0,
    patternsTracked: failurePatterns.size,
    enabled: forecastConfig.enabled,
  };
}
