/**
 * COMPASS Ultimate — Drift Compass
 * Detects when the substrate's behavior is drifting from its intended trajectory.
 * Measures conceptual drift, performance drift, and priority drift.
 */

export type DriftType = 'conceptual' | 'performance' | 'priority';

export interface DriftMeasurement {
  id: string;
  type: DriftType;
  dimension: string;
  baseline: number;
  current: number;
  delta: number;
  severity: 'none' | 'minor' | 'moderate' | 'critical';
  measuredAt: number;
}

export interface DriftAlert {
  measurementId: string;
  type: DriftType;
  dimension: string;
  message: string;
  severity: 'minor' | 'moderate' | 'critical';
  timestamp: number;
}

export interface DriftStats {
  totalMeasurements: number;
  totalAlerts: number;
  criticalDrifts: number;
  avgDelta: number;
  driftingDimensions: string[];
}

const EMA_ALPHA = 0.15;
const MAX_MEASUREMENTS = 1000;
const MAX_ALERTS = 200;
const MINOR_THRESHOLD = 0.1;
const MODERATE_THRESHOLD = 0.25;
const CRITICAL_THRESHOLD = 0.5;

const baselines = new Map<string, number>();  // "type:dimension" → baseline
const currentValues = new Map<string, number>();
const measurements: DriftMeasurement[] = [];
const alerts: DriftAlert[] = [];

export function setBaseline(type: DriftType, dimension: string, value: number): void {
  baselines.set(`${type}:${dimension}`, value);
  currentValues.set(`${type}:${dimension}`, value);
}

export function recordObservation(type: DriftType, dimension: string, value: number): DriftMeasurement {
  const key = `${type}:${dimension}`;

  if (!baselines.has(key)) {
    baselines.set(key, value);
    currentValues.set(key, value);
  }

  // EMA smoothing
  const prev = currentValues.get(key) ?? value;
  const smoothed = prev * (1 - EMA_ALPHA) + value * EMA_ALPHA;
  currentValues.set(key, smoothed);

  const baseline = baselines.get(key)!;
  const delta = baseline !== 0 ? Math.abs(smoothed - baseline) / Math.abs(baseline) : Math.abs(smoothed - baseline);

  const severity: DriftMeasurement['severity'] =
    delta >= CRITICAL_THRESHOLD ? 'critical'
    : delta >= MODERATE_THRESHOLD ? 'moderate'
    : delta >= MINOR_THRESHOLD ? 'minor'
    : 'none';

  const measurement: DriftMeasurement = {
    id: `drift-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, dimension, baseline, current: smoothed,
    delta, severity, measuredAt: Date.now(),
  };

  if (measurements.length >= MAX_MEASUREMENTS) measurements.shift();
  measurements.push(measurement);

  // Generate alert if drifting
  if (severity !== 'none') {
    const alert: DriftAlert = {
      measurementId: measurement.id,
      type, dimension,
      message: `${type} drift on "${dimension}": ${(delta * 100).toFixed(1)}% from baseline (${baseline.toFixed(2)} → ${smoothed.toFixed(2)})`,
      severity, timestamp: Date.now(),
    };
    if (alerts.length >= MAX_ALERTS) alerts.shift();
    alerts.push(alert);
  }

  return measurement;
}

export function recalibrateBaseline(type: DriftType, dimension: string): void {
  const key = `${type}:${dimension}`;
  const current = currentValues.get(key);
  if (current !== undefined) baselines.set(key, current);
}

export function getRecentAlerts(limit: number = 20): DriftAlert[] {
  return alerts.slice(-limit);
}

export function getDriftStats(): DriftStats {
  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const avgDelta = measurements.length > 0
    ? measurements.reduce((s, m) => s + m.delta, 0) / measurements.length
    : 0;
  const drifting = [...new Set(
    measurements.filter(m => m.severity !== 'none').map(m => m.dimension)
  )];

  return {
    totalMeasurements: measurements.length,
    totalAlerts: alerts.length,
    criticalDrifts: critCount,
    avgDelta,
    driftingDimensions: drifting,
  };
}

export function resetDriftState(): void {
  baselines.clear();
  currentValues.clear();
  measurements.length = 0;
  alerts.length = 0;
}
