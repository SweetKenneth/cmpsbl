/**
 * ORACLE Ultimate #11 — Oracle Telemetry Nexus
 * Predictions/hour, accuracy rate, calibration drift,
 * recommendation adoption rate, lead time tracking.
 */

// ── Types ──

export interface OracleTelemetrySnapshot {
  predictionsPerHour: number;
  accuracyRate: number;
  calibrationDrift: number;
  avgLeadTimeMs: number;
  recommendationAdoptionRate: number;
  modelCount: number;
  avgModelCredibility: number;
  activeWarnings: number;
  riskScore: number;
  systemHealth: number;
  generatedAt: number;
}

interface TelemetryEvent {
  type: 'prediction' | 'recommendation' | 'warning' | 'simulation' | 'causal_test';
  timestamp: number;
  durationMs: number;
  success: boolean;
}

// ── State ──

const events: TelemetryEvent[] = [];
const MAX_EVENTS = 5000;
let emaPredictionsPerHour = 0;
let emaAccuracy = 0.5;
const EMA_ALPHA = 0.15;

// ── Core ──

export function recordTelemetryEvent(type: TelemetryEvent['type'], durationMs: number, success: boolean): void {
  events.push({ type, timestamp: Date.now(), durationMs, success });
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  // Update EMAs
  if (type === 'prediction') {
    emaAccuracy = EMA_ALPHA * (success ? 1 : 0) + (1 - EMA_ALPHA) * emaAccuracy;
  }
}

export function getSnapshot(externalMetrics: {
  modelCount?: number;
  avgCredibility?: number;
  activeWarnings?: number;
  overallRisk?: number;
  adoptionRate?: number;
  brierScore?: number;
} = {}): OracleTelemetrySnapshot {
  const now = Date.now();
  const hourAgo = now - 3600_000;
  const recentPredictions = events.filter(e => e.type === 'prediction' && e.timestamp > hourAgo);

  const allPredictions = events.filter(e => e.type === 'prediction');
  const successfulPredictions = allPredictions.filter(e => e.success);
  const accuracyRate = allPredictions.length > 0 ? successfulPredictions.length / allPredictions.length : 0;

  const avgDuration = allPredictions.length > 0
    ? allPredictions.reduce((s, e) => s + e.durationMs, 0) / allPredictions.length
    : 0;

  // Calibration drift = |brierScore - 0| — how far from perfect calibration
  const calibrationDrift = externalMetrics.brierScore ?? 0;

  const health = Math.round(
    (accuracyRate * 40 + (1 - calibrationDrift) * 30 + Math.min(1, recentPredictions.length / 10) * 30) 
  );

  return {
    predictionsPerHour: recentPredictions.length,
    accuracyRate: Math.round(accuracyRate * 1000) / 1000,
    calibrationDrift: Math.round(calibrationDrift * 10000) / 10000,
    avgLeadTimeMs: Math.round(avgDuration * 100) / 100,
    recommendationAdoptionRate: externalMetrics.adoptionRate ?? 0,
    modelCount: externalMetrics.modelCount ?? 0,
    avgModelCredibility: externalMetrics.avgCredibility ?? 0,
    activeWarnings: externalMetrics.activeWarnings ?? 0,
    riskScore: externalMetrics.overallRisk ?? 0,
    systemHealth: health,
    generatedAt: now,
  };
}

export function getTelemetryStats(): { totalEvents: number; eventsByType: Record<string, number> } {
  const byType: Record<string, number> = {};
  for (const e of events) {
    byType[e.type] = (byType[e.type] ?? 0) + 1;
  }
  return { totalEvents: events.length, eventsByType: byType };
}

export function resetTelemetryState(): void {
  events.length = 0;
  emaPredictionsPerHour = 0;
  emaAccuracy = 0.5;
}
