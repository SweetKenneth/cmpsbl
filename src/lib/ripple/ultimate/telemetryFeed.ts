/**
 * RIPPLE Live Telemetry Feed — v9.0.0 "Tsunami"
 * 
 * Real-time throughput, per-topic latency percentiles (p50/p95/p99),
 * subscriber lag metrics, DLQ depth, and hot topic heatmap.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ThroughputMetrics {
  eventsPerSecond: number;
  eventsPerSecondEMA: number;
  peakEventsPerSecond: number;
  totalEventsProcessed: number;
  publishLatencyP50: number;
  publishLatencyP95: number;
  publishLatencyP99: number;
}

export interface TopicLatency {
  topic: string;
  p50: number;
  p95: number;
  p99: number;
  sampleCount: number;
  lastUpdated: string;
}

export interface SubscriberLag {
  subscriberId: string;
  module: string;
  pendingEvents: number;
  lagMs: number;
  lastDeliveredAt: string | null;
  throughput: number;
}

export interface HeatmapEntry {
  topic: string;
  intensity: number;   // 0-1 normalized
  eventsLast60s: number;
  trend: 'rising' | 'stable' | 'falling';
}

export interface TelemetrySnapshot {
  timestamp: string;
  throughput: ThroughputMetrics;
  topicLatencies: TopicLatency[];
  subscriberLags: SubscriberLag[];
  heatmap: HeatmapEntry[];
  dlqDepth: number;
  activeAlerts: number;
  systemHealth: number;     // 0-100
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_LATENCY_SAMPLES = 200;
const THROUGHPUT_WINDOW_S = 10;
const HEATMAP_WINDOW_S = 60;
const EMA_ALPHA = 0.15;

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

// Throughput
const throughputBuckets: number[] = new Array(THROUGHPUT_WINDOW_S).fill(0);
let throughputIdx = 0;
let lastThroughputTick = Date.now();
let totalEventsProcessed = 0;
let peakEps = 0;
let epsEMA = 0;

// Latency
const globalLatencySamples: number[] = [];
const topicLatencySamples = new Map<string, number[]>();

// Subscriber lag
const subscriberLags = new Map<string, SubscriberLag>();

// Heatmap
const topicHeatCounts = new Map<string, { counts: number[]; idx: number; lastTick: number }>();

// ═══════════════════════════════════════════════════════════════════════════════
// RECORDING
// ═══════════════════════════════════════════════════════════════════════════════

/** Record a published event for throughput tracking. */
export function recordPublishEvent(topic: string, latencyMs: number): void {
  // Throughput
  tickThroughput();
  throughputBuckets[throughputIdx]++;
  totalEventsProcessed++;

  // Global latency
  globalLatencySamples.push(latencyMs);
  if (globalLatencySamples.length > MAX_LATENCY_SAMPLES) globalLatencySamples.shift();

  // Topic latency
  const topicSamples = topicLatencySamples.get(topic) ?? [];
  topicSamples.push(latencyMs);
  if (topicSamples.length > MAX_LATENCY_SAMPLES) topicSamples.shift();
  topicLatencySamples.set(topic, topicSamples);

  // Heatmap
  recordHeat(topic);
}

/** Update subscriber lag data. */
export function updateSubscriberLag(
  subscriberId: string,
  module: string,
  pendingEvents: number,
  lagMs: number,
  lastDeliveredAt: string | null,
  throughput: number
): void {
  subscriberLags.set(subscriberId, {
    subscriberId,
    module,
    pendingEvents,
    lagMs,
    lastDeliveredAt,
    throughput,
  });
}

/** Remove subscriber lag tracking. */
export function removeSubscriberLag(subscriberId: string): void {
  subscriberLags.delete(subscriberId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNALS
// ═══════════════════════════════════════════════════════════════════════════════

function tickThroughput(): void {
  const now = Date.now();
  const elapsed = now - lastThroughputTick;

  if (elapsed >= 1000) {
    const ticks = Math.min(Math.floor(elapsed / 1000), THROUGHPUT_WINDOW_S);
    for (let i = 0; i < ticks; i++) {
      throughputIdx = (throughputIdx + 1) % THROUGHPUT_WINDOW_S;
      throughputBuckets[throughputIdx] = 0;
    }
    lastThroughputTick = now;
  }
}

function recordHeat(topic: string): void {
  let heat = topicHeatCounts.get(topic);
  if (!heat) {
    heat = { counts: new Array(HEATMAP_WINDOW_S).fill(0), idx: 0, lastTick: Date.now() };
    topicHeatCounts.set(topic, heat);
  }

  // Tick
  const now = Date.now();
  const elapsed = Math.floor((now - heat.lastTick) / 1000);
  if (elapsed > 0) {
    for (let i = 0; i < Math.min(elapsed, HEATMAP_WINDOW_S); i++) {
      heat.idx = (heat.idx + 1) % HEATMAP_WINDOW_S;
      heat.counts[heat.idx] = 0;
    }
    heat.lastTick = now;
  }

  heat.counts[heat.idx]++;
}

function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

/** Get current throughput metrics. */
export function getThroughputMetrics(): ThroughputMetrics {
  tickThroughput();
  const eps = throughputBuckets.reduce((s, c) => s + c, 0) / THROUGHPUT_WINDOW_S;
  epsEMA = EMA_ALPHA * eps + (1 - EMA_ALPHA) * epsEMA;
  peakEps = Math.max(peakEps, eps);

  return {
    eventsPerSecond: Math.round(eps * 10) / 10,
    eventsPerSecondEMA: Math.round(epsEMA * 10) / 10,
    peakEventsPerSecond: Math.round(peakEps * 10) / 10,
    totalEventsProcessed,
    publishLatencyP50: Math.round(percentile(globalLatencySamples, 0.5) * 100) / 100,
    publishLatencyP95: Math.round(percentile(globalLatencySamples, 0.95) * 100) / 100,
    publishLatencyP99: Math.round(percentile(globalLatencySamples, 0.99) * 100) / 100,
  };
}

/** Get latency for all topics. */
export function getTopicLatencies(): TopicLatency[] {
  const results: TopicLatency[] = [];
  for (const [topic, samples] of topicLatencySamples.entries()) {
    results.push({
      topic,
      p50: Math.round(percentile(samples, 0.5) * 100) / 100,
      p95: Math.round(percentile(samples, 0.95) * 100) / 100,
      p99: Math.round(percentile(samples, 0.99) * 100) / 100,
      sampleCount: samples.length,
      lastUpdated: new Date().toISOString(),
    });
  }
  return results.sort((a, b) => b.p95 - a.p95);
}

/** Get subscriber lags. */
export function getSubscriberLags(): SubscriberLag[] {
  return Array.from(subscriberLags.values()).sort((a, b) => b.lagMs - a.lagMs);
}

/** Get the topic heatmap. */
export function getHeatmap(): HeatmapEntry[] {
  const entries: HeatmapEntry[] = [];
  let maxCount = 1;

  // First pass: calculate max
  for (const [, heat] of topicHeatCounts.entries()) {
    const total = heat.counts.reduce((s, c) => s + c, 0);
    maxCount = Math.max(maxCount, total);
  }

  // Second pass: build entries
  for (const [topic, heat] of topicHeatCounts.entries()) {
    const total = heat.counts.reduce((s, c) => s + c, 0);
    const firstHalf = heat.counts.slice(0, Math.floor(HEATMAP_WINDOW_S / 2)).reduce((s, c) => s + c, 0);
    const secondHalf = heat.counts.slice(Math.floor(HEATMAP_WINDOW_S / 2)).reduce((s, c) => s + c, 0);

    let trend: 'rising' | 'stable' | 'falling' = 'stable';
    if (secondHalf > firstHalf * 1.3) trend = 'rising';
    else if (secondHalf < firstHalf * 0.7) trend = 'falling';

    entries.push({
      topic,
      intensity: total / maxCount,
      eventsLast60s: total,
      trend,
    });
  }

  return entries.sort((a, b) => b.intensity - a.intensity);
}

/** Generate a full telemetry snapshot. */
export function getTelemetrySnapshot(dlqDepth: number = 0, activeAlertCount: number = 0): TelemetrySnapshot {
  const throughput = getThroughputMetrics();

  // System health: penalize high latency, high DLQ, active alerts
  let health = 100;
  if (throughput.publishLatencyP95 > 100) health -= 10;
  if (throughput.publishLatencyP95 > 500) health -= 20;
  if (dlqDepth > 10) health -= 15;
  if (dlqDepth > 100) health -= 25;
  health -= activeAlertCount * 10;
  health = Math.max(0, Math.min(100, health));

  return {
    timestamp: new Date().toISOString(),
    throughput,
    topicLatencies: getTopicLatencies().slice(0, 20),
    subscriberLags: getSubscriberLags().slice(0, 20),
    heatmap: getHeatmap().slice(0, 30),
    dlqDepth,
    activeAlerts: activeAlertCount,
    systemHealth: health,
  };
}

/** Reset all telemetry state. */
export function resetTelemetryState(): void {
  throughputBuckets.fill(0);
  throughputIdx = 0;
  totalEventsProcessed = 0;
  peakEps = 0;
  epsEMA = 0;
  globalLatencySamples.length = 0;
  topicLatencySamples.clear();
  subscriberLags.clear();
  topicHeatCounts.clear();
}
