/**
 * CMPSBL® Analysis Engine — Observability & Signal Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Three-layer analysis system:
 *   1. Metric capture (timing + frequency)
 *   2. Rolling baseline (sliding window)
 *   3. Anomaly detection (deterministic deviation)
 *
 * Emits structured events for behavioral verification.
 * Routes anomaly signals to the Orchestration Engine (CORTEX).
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeSignal } from './orchestration-engine';
import { recordAnomaly } from './dynamic-rule-generator';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AnalysisEffect =
  | 'metric_recorded'
  | 'baseline_updated'
  | 'anomaly_detected';

export interface AnalysisEvent {
  readonly primitive: string;
  readonly effect: AnalysisEffect;
  readonly timestamp: number;
  readonly value?: number;
}

export interface MetricRecord {
  readonly primitive: string;
  readonly durationMs: number;
  readonly timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const metrics = new Map<string, MetricRecord[]>();
const analysisEvents: AnalysisEvent[] = [];

const WINDOW_SIZE = 20;
const ANOMALY_THRESHOLD = 2.5;

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EVENT EMISSION
// ═══════════════════════════════════════════════════════════════════════════════

function emit(
  primitive: string,
  effect: AnalysisEffect,
  value?: number,
): void {
  analysisEvents.push({
    primitive,
    effect,
    timestamp: Date.now(),
    value,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — METRIC CAPTURE
// ═══════════════════════════════════════════════════════════════════════════════

function updateMetrics(
  primitive: string,
  duration: number,
): void {
  const current = metrics.get(primitive) ?? [];

  if (current.length >= WINDOW_SIZE) {
    current.shift();
  }

  current.push({
    primitive,
    durationMs: duration,
    timestamp: Date.now(),
  });

  metrics.set(primitive, current);

  emit(primitive, 'metric_recorded', duration);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — BASELINE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════════

function calculateBaseline(values: number[]): { avg: number; std: number } {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;

  const std = Math.sqrt(variance);

  return { avg, std };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectAnomaly(
  primitive: string,
  duration: number,
): void {
  const records = metrics.get(primitive);
  if (!records || records.length < 5) return;

  const values = records.map(r => r.durationMs);
  const { avg, std } = calculateBaseline(values);

  emit(primitive, 'baseline_updated', avg);

  if (std === 0) return;

  const deviation = Math.abs(duration - avg) / std;

  if (deviation >= ANOMALY_THRESHOLD) {
    emit(primitive, 'anomaly_detected', duration);
    routeSignal(primitive, 'anomaly_detected', { duration });

    // Phase 6: Feed anomaly to dynamic rule generator for auto-rule evaluation
    recordAnomaly(primitive, deviation);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — EVENT ACCESS (PROOF LAYER)
// ═══════════════════════════════════════════════════════════════════════════════

export function getAnalysisEvents(): readonly AnalysisEvent[] {
  return [...analysisEvents];
}

export function getAnalysisEventsForPrimitive(
  primitive: string,
): readonly AnalysisEvent[] {
  return analysisEvents.filter(e => e.primitive === primitive);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetAnalysisEngine(): void {
  metrics.clear();
  analysisEvents.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — ANALYSIS WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a function with deterministic analysis capture.
 *
 * Behavior:
 *   1. Record execution start time
 *   2. Execute L1 function unchanged
 *   3. Capture duration into rolling metrics window
 *   4. Run anomaly detection against baseline
 *   5. Return original result unchanged
 */
export function wrapAnalysis<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function analysisWrapper(this: any, ...args: any[]) {
    const start = Date.now();

    const result = targetFn.apply(this, args);

    const duration = Date.now() - start;

    updateMetrics(primitiveName, duration);
    detectAnomaly(primitiveName, duration);

    return result;
  } as T;
}
