/**
 * COMPASS CLM — Continuous Learning Module
 * Monitors route efficiency, forecast accuracy, pattern staleness, and capacity.
 */

import { getCompassState, getCompassHealth } from '../compass-module';

export interface CompassCLMInsight {
  id: string;
  type: 'efficiency_drop' | 'accuracy_decline' | 'pattern_stale' | 'forecast_divergence' | 'capacity_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: number;
  threshold: number;
  timestamp: number;
}

export interface CompassCLMReport {
  health: number;
  totalRoutes: number;
  totalForecasts: number;
  avgRouteEfficiency: number;
  avgForecastAccuracy: number;
  patternCount: number;
  insights: CompassCLMInsight[];
  lastCycleAt: number;
}

let lastCycleAt = 0;
const insightHistory: CompassCLMInsight[] = [];
const MAX_INSIGHTS = 100;

function createInsight(
  type: CompassCLMInsight['type'],
  severity: CompassCLMInsight['severity'],
  message: string,
  metric: number,
  threshold: number,
): CompassCLMInsight {
  const insight: CompassCLMInsight = {
    id: `compass-clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, severity, message, metric, threshold, timestamp: Date.now(),
  };
  if (insightHistory.length >= MAX_INSIGHTS) insightHistory.shift();
  insightHistory.push(insight);
  return insight;
}

export function runCompassCLMCycle(): CompassCLMReport {
  const state = getCompassState();
  const health = getCompassHealth();
  const insights: CompassCLMInsight[] = [];

  // 1. Route efficiency drop
  if (state.avgRouteEfficiency > 0 && state.avgRouteEfficiency < 0.6) {
    insights.push(createInsight(
      'efficiency_drop', state.avgRouteEfficiency < 0.4 ? 'high' : 'medium',
      `Average route efficiency at ${(state.avgRouteEfficiency * 100).toFixed(1)}% (threshold: 60%)`,
      state.avgRouteEfficiency * 100, 60,
    ));
  }

  // 2. Forecast accuracy decline
  if (state.avgForecastAccuracy > 0 && state.avgForecastAccuracy < 0.7) {
    insights.push(createInsight(
      'accuracy_decline', state.avgForecastAccuracy < 0.5 ? 'high' : 'medium',
      `Average forecast accuracy at ${(state.avgForecastAccuracy * 100).toFixed(1)}% (threshold: 70%)`,
      state.avgForecastAccuracy * 100, 70,
    ));
  }

  // 3. Stale temporal patterns
  if (state.patterns.length > 0) {
    const lowConf = state.patterns.filter(p => p.confidence < 0.3);
    if (lowConf.length > 0) {
      insights.push(createInsight(
        'pattern_stale', 'low',
        `${lowConf.length} temporal pattern(s) with <30% confidence — may need recalibration`,
        lowConf.length, 0,
      ));
    }
  }

  // 4. Forecast divergence — predictions with rapidly declining confidence
  const recentForecasts = state.forecasts.slice(-10);
  const divergent = recentForecasts.filter(f =>
    f.predictions.length > 0 && f.predictions[f.predictions.length - 1].confidence < 0.4,
  );
  if (divergent.length >= 3) {
    insights.push(createInsight(
      'forecast_divergence', 'medium',
      `${divergent.length} recent forecasts with low tail confidence`,
      divergent.length, 3,
    ));
  }

  // 5. Capacity
  if (state.routes.length >= 180) {
    insights.push(createInsight(
      'capacity_warning', 'low',
      `Route store at ${state.routes.length}/200 capacity`,
      state.routes.length, 180,
    ));
  }

  lastCycleAt = Date.now();

  return {
    health,
    totalRoutes: state.totalRoutes,
    totalForecasts: state.totalForecasts,
    avgRouteEfficiency: state.avgRouteEfficiency,
    avgForecastAccuracy: state.avgForecastAccuracy,
    patternCount: state.patterns.length,
    insights,
    lastCycleAt,
  };
}

export function compassCLM() {
  return {
    run: runCompassCLMCycle,
    getInsights: () => [...insightHistory],
    getLastCycleAt: () => lastCycleAt,
  };
}
