/**
 * NERVE Ultimate — Nerve Telemetry Nexus
 * Unified event bus with MTTR, throughput, efficiency, and operational metrics.
 * Single source of truth for all NERVE observability data.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type NerveTelemetryEventType =
  | 'signal_emitted'
  | 'signal_received'
  | 'signal_dropped'
  | 'circuit_opened'
  | 'circuit_closed'
  | 'circuit_half_open'
  | 'backpressure_change'
  | 'node_state_change'
  | 'cascade_detected'
  | 'dlq_enqueued'
  | 'dlq_retried'
  | 'priority_rebalanced'
  | 'edge_degraded'
  | 'calibration_event';

export interface NerveTelemetryEvent {
  id: string;
  type: NerveTelemetryEventType;
  source: string;
  target?: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface NerveThroughputMetrics {
  signalsPerSecond: number;
  successRate: number;
  dropRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  windowDurationMs: number;
}

export interface NerveEfficiencyMetrics {
  dedupSavingsPercent: number;
  backpressureUtilization: number;
  circuitBreakerEffectiveness: number;
  dlqRecoveryRate: number;
  priorityRebalanceRate: number;
}

export interface NerveMTTRMetrics {
  avgCircuitRecoveryMs: number;
  avgNodeRecoveryMs: number;
  avgCascadeContainmentMs: number;
  sampleCount: number;
}

export interface NerveOperationalSummary {
  throughput: NerveThroughputMetrics;
  efficiency: NerveEfficiencyMetrics;
  mttr: NerveMTTRMetrics;
  healthScore: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_EVENTS = 2_000;
const THROUGHPUT_WINDOW_MS = 60_000;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const events: NerveTelemetryEvent[] = [];
let eventCounter = 0;

// MTTR tracking
const recoveryTimes = {
  circuit: [] as number[],
  node: [] as number[],
  cascade: [] as number[],
};
const MAX_RECOVERY_SAMPLES = 100;

// ═══════════════════════════════════════════════════════════════
// EVENT INGESTION
// ═══════════════════════════════════════════════════════════════

/** Emit a telemetry event into the nexus */
export function emit(
  type: NerveTelemetryEventType,
  source: string,
  data: Record<string, unknown>,
  target?: string,
): NerveTelemetryEvent {
  const event: NerveTelemetryEvent = {
    id: `ntx-${++eventCounter}`,
    type,
    source,
    target,
    timestamp: Date.now(),
    data,
  };

  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  return event;
}

/** Record a recovery time for MTTR calculation */
export function recordRecovery(
  category: 'circuit' | 'node' | 'cascade',
  durationMs: number,
): void {
  const arr = recoveryTimes[category];
  arr.push(durationMs);
  if (arr.length > MAX_RECOVERY_SAMPLES) arr.splice(0, arr.length - MAX_RECOVERY_SAMPLES);
}

// ═══════════════════════════════════════════════════════════════
// METRICS COMPUTATION
// ═══════════════════════════════════════════════════════════════

/** Calculate throughput metrics over the recent window */
export function getThroughputMetrics(): NerveThroughputMetrics {
  const now = Date.now();
  const windowEvents = events.filter(e => (now - e.timestamp) < THROUGHPUT_WINDOW_MS);

  const emitted = windowEvents.filter(e => e.type === 'signal_emitted').length;
  const received = windowEvents.filter(e => e.type === 'signal_received').length;
  const dropped = windowEvents.filter(e => e.type === 'signal_dropped').length;

  const total = emitted + dropped;
  const windowSec = THROUGHPUT_WINDOW_MS / 1000;

  // Extract latencies from signal_emitted events
  const latencies = windowEvents
    .filter(e => e.type === 'signal_emitted' && typeof e.data.latencyMs === 'number')
    .map(e => e.data.latencyMs as number)
    .sort((a, b) => a - b);

  const avgLatency = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;
  const p95Idx = Math.floor(latencies.length * 0.95);
  const p95 = latencies.length > 0 ? latencies[Math.min(p95Idx, latencies.length - 1)] : 0;

  return {
    signalsPerSecond: Math.round((emitted / windowSec) * 100) / 100,
    successRate: total > 0 ? Math.round((received / total) * 1000) / 1000 : 1,
    dropRate: total > 0 ? Math.round((dropped / total) * 1000) / 1000 : 0,
    avgLatencyMs: Math.round(avgLatency * 100) / 100,
    p95LatencyMs: Math.round(p95 * 100) / 100,
    windowDurationMs: THROUGHPUT_WINDOW_MS,
  };
}

/** Calculate efficiency metrics */
export function getEfficiencyMetrics(): NerveEfficiencyMetrics {
  const total = events.length;
  if (total === 0) {
    return {
      dedupSavingsPercent: 0,
      backpressureUtilization: 0,
      circuitBreakerEffectiveness: 0,
      dlqRecoveryRate: 0,
      priorityRebalanceRate: 0,
    };
  }

  const signalEvents = events.filter(e =>
    e.type === 'signal_emitted' || e.type === 'signal_dropped'
  ).length;
  const dedupDrops = events.filter(e =>
    e.type === 'signal_dropped' && e.data.reason === 'deduped'
  ).length;
  const bpEvents = events.filter(e => e.type === 'backpressure_change').length;
  const circuitEvents = events.filter(e =>
    e.type === 'circuit_opened' || e.type === 'circuit_closed'
  ).length;
  const dlqEnqueued = events.filter(e => e.type === 'dlq_enqueued').length;
  const dlqRetried = events.filter(e => e.type === 'dlq_retried').length;
  const rebalanced = events.filter(e => e.type === 'priority_rebalanced').length;

  return {
    dedupSavingsPercent: signalEvents > 0 ? Math.round((dedupDrops / signalEvents) * 10000) / 100 : 0,
    backpressureUtilization: Math.round((bpEvents / total) * 10000) / 100,
    circuitBreakerEffectiveness: Math.round((circuitEvents / Math.max(total, 1)) * 10000) / 100,
    dlqRecoveryRate: dlqEnqueued > 0 ? Math.round((dlqRetried / dlqEnqueued) * 1000) / 1000 : 0,
    priorityRebalanceRate: Math.round((rebalanced / Math.max(total, 1)) * 10000) / 100,
  };
}

/** Calculate Mean Time To Recovery metrics */
export function getMTTRMetrics(): NerveMTTRMetrics {
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return {
    avgCircuitRecoveryMs: Math.round(avg(recoveryTimes.circuit)),
    avgNodeRecoveryMs: Math.round(avg(recoveryTimes.node)),
    avgCascadeContainmentMs: Math.round(avg(recoveryTimes.cascade)),
    sampleCount: recoveryTimes.circuit.length + recoveryTimes.node.length + recoveryTimes.cascade.length,
  };
}

/** Get full operational summary */
export function getOperationalSummary(): NerveOperationalSummary {
  const throughput = getThroughputMetrics();
  const efficiency = getEfficiencyMetrics();
  const mttr = getMTTRMetrics();

  // Composite health score
  let health = 100;
  if (throughput.dropRate > 0.1) health -= 15;
  if (throughput.dropRate > 0.3) health -= 20;
  if (throughput.avgLatencyMs > 200) health -= 10;
  if (throughput.avgLatencyMs > 500) health -= 15;
  if (mttr.avgCircuitRecoveryMs > 60_000) health -= 10;
  if (efficiency.dlqRecoveryRate < 0.5 && efficiency.dlqRecoveryRate > 0) health -= 10;
  health = Math.max(0, Math.min(100, health));

  return {
    throughput,
    efficiency,
    mttr,
    healthScore: health,
    timestamp: Date.now(),
  };
}

/** Get recent events */
export function getRecentEvents(limit: number = 50): NerveTelemetryEvent[] {
  return events.slice(-limit);
}

/** Get events by type */
export function getEventsByType(type: NerveTelemetryEventType, limit: number = 50): NerveTelemetryEvent[] {
  return events.filter(e => e.type === type).slice(-limit);
}

/** Clear all telemetry data */
export function clearTelemetry(): void {
  events.length = 0;
  eventCounter = 0;
  recoveryTimes.circuit.length = 0;
  recoveryTimes.node.length = 0;
  recoveryTimes.cascade.length = 0;
}
