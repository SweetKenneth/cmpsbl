/**
 * Clockless Habitat — Temporal Drift Engine
 * vX.UI.ULTIMATE
 *
 * Maps system telemetry into atmospheric temporal states.
 * No visible clock. Time embodied atmospherically.
 */

import { getLatestSnapshot, type MetricSnapshot } from '@/core/metrics/snapshotEngine';
import { queryEvents, type SystemEvent } from '@/core/events/eventStore';

// ═══ Temporal States ═══════════════════════════════════════════════

export type TemporalState = 'CALM' | 'ACTIVE' | 'SURGE' | 'INSTABILITY';

export interface TemporalReading {
  state: TemporalState;
  repairVelocity: number;       // events/hour
  anomalyRate: number;           // 0–1
  clmFrequency: number;          // cycles/hour
  latencyTrend: number;          // ms average
  escalationCount: number;       // last window
  /** Visual expression parameters */
  lightWarmth: number;           // 0 = cool, 1 = warm
  pulseRhythm: number;           // seconds per cycle
  motionDensity: number;         // 0 = sparse, 1 = dense
  depthCompression: number;      // 0 = expanded, 1 = compressed
  peripheralDarkening: number;   // 0 = none, 0.08 = max subtle
}

// ═══ Thresholds ════════════════════════════════════════════════════

const THRESHOLDS = {
  escalationSurge: 5,
  escalationInstability: 12,
  anomalyActive: 0.15,
  anomalySurge: 0.35,
  anomalyInstability: 0.6,
  repairVelocityHigh: 8,
} as const;

// ═══ Compute ═══════════════════════════════════════════════════════

function computeRepairVelocity(events: SystemEvent[], windowHours: number): number {
  const cutoff = Date.now() - windowHours * 3600_000;
  const repairs = events.filter(
    e => e.type === 'PROBE_REPAIRED' && new Date(e.timestamp).getTime() >= cutoff
  );
  return repairs.length / windowHours;
}

function computeAnomalyRate(snapshot: MetricSnapshot | null): number {
  if (!snapshot) return 0;
  const modules = Object.values(snapshot.modules);
  if (modules.length === 0) return 0;
  const unhealthy = modules.filter(m => m.healthScore < 70).length;
  return unhealthy / modules.length;
}

function computeEscalationCount(events: SystemEvent[], windowHours: number): number {
  const cutoff = Date.now() - windowHours * 3600_000;
  return events.filter(
    e => e.type === 'PROBE_ESCALATED' && new Date(e.timestamp).getTime() >= cutoff
  ).length;
}

function computeCLMFrequency(events: SystemEvent[], windowHours: number): number {
  const cutoff = Date.now() - windowHours * 3600_000;
  const cycles = events.filter(
    e => e.type === 'INTEGRITY_CHECK' && new Date(e.timestamp).getTime() >= cutoff
  );
  return cycles.length / windowHours;
}

function computeLatencyTrend(snapshot: MetricSnapshot | null): number {
  if (!snapshot) return 0;
  const latencies = Object.values(snapshot.modules)
    .map(m => m.rates['avgLatency'] ?? m.rates['routingLatency'] ?? 0)
    .filter(v => v > 0);
  return latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;
}

// ═══ State Resolution ═════════════════════════════════════════════

function resolveState(anomalyRate: number, escalationCount: number, repairVelocity: number): TemporalState {
  if (anomalyRate >= THRESHOLDS.anomalyInstability || escalationCount >= THRESHOLDS.escalationInstability) {
    return 'INSTABILITY';
  }
  if (anomalyRate >= THRESHOLDS.anomalySurge || escalationCount >= THRESHOLDS.escalationSurge) {
    return 'SURGE';
  }
  if (anomalyRate >= THRESHOLDS.anomalyActive || repairVelocity >= THRESHOLDS.repairVelocityHigh) {
    return 'ACTIVE';
  }
  return 'CALM';
}

// ═══ Expression Mapping ═══════════════════════════════════════════

function mapToExpression(state: TemporalState): Pick<
  TemporalReading,
  'lightWarmth' | 'pulseRhythm' | 'motionDensity' | 'depthCompression' | 'peripheralDarkening'
> {
  switch (state) {
    case 'CALM':
      return {
        lightWarmth: 0.7,
        pulseRhythm: 4.0,
        motionDensity: 0.2,
        depthCompression: 0,
        peripheralDarkening: 0,
      };
    case 'ACTIVE':
      return {
        lightWarmth: 0.55,
        pulseRhythm: 3.0,
        motionDensity: 0.4,
        depthCompression: 0.1,
        peripheralDarkening: 0.02,
      };
    case 'SURGE':
      return {
        lightWarmth: 0.35,
        pulseRhythm: 2.0,
        motionDensity: 0.65,
        depthCompression: 0.3,
        peripheralDarkening: 0.05,
      };
    case 'INSTABILITY':
      return {
        lightWarmth: 0.15,
        pulseRhythm: 1.2,
        motionDensity: 0.85,
        depthCompression: 0.6,
        peripheralDarkening: 0.08,
      };
  }
}

// ═══ Public API ════════════════════════════════════════════════════

const EVENT_WINDOW_HOURS = 6;

export function readTemporalState(): TemporalReading {
  const snapshot = getLatestSnapshot();
  const recentEvents = queryEvents({ limit: 500 });

  const repairVelocity = computeRepairVelocity(recentEvents, EVENT_WINDOW_HOURS);
  const anomalyRate = computeAnomalyRate(snapshot);
  const escalationCount = computeEscalationCount(recentEvents, EVENT_WINDOW_HOURS);
  const clmFrequency = computeCLMFrequency(recentEvents, EVENT_WINDOW_HOURS);
  const latencyTrend = computeLatencyTrend(snapshot);

  const state = resolveState(anomalyRate, escalationCount, repairVelocity);
  const expression = mapToExpression(state);

  return {
    state,
    repairVelocity,
    anomalyRate,
    clmFrequency,
    latencyTrend,
    escalationCount,
    ...expression,
  };
}
