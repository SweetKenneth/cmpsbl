/**
 * CMPSBL® VISION "Vee" — Hardening Layer v2.0.0
 * Enterprise-grade perception hardening — additive, non-breaking
 *
 * 25 hardening capabilities:
 *  1. Metric Integrity Validator (cross-source numeric conflict detection)
 *  2. Anomaly Fingerprinting (deduplicate repeat anomalies via structural hash)
 *  3. Sliding Window Aggregator (configurable tumbling/sliding windows)
 *  4. Signal-to-Noise Filter (suppress low-confidence detections below threshold)
 *  5. Correlation Graph Builder (DAG of cross-module anomaly causation)
 *  6. Provider Drift Detector (statistical drift between provider latency distributions)
 *  7. Metric Decay Engine (exponentially decay stale metric weight)
 *  8. Anomaly Severity Escalator (auto-promote severity on recurrence)
 *  9. Vision Canary Probes (synthetic metric injection for pipeline validation)
 * 10. Metric Cardinality Guard (cap unique label combinations to prevent explosion)
 * 11. Observability Budget Tracker (cost attribution per metric stream)
 * 12. Trace Sampling Strategy (head/tail/priority-based sampling decisions)
 * 13. Metric Compression (delta-of-delta encoding for time series)
 * 14. Alert Fatigue Reducer (deduplicate & coalesce alerts within cooldown windows)
 * 15. Baseline Auto-Calibrator (adaptive baseline recalculation from rolling history)
 * 16. Multi-Resolution Rollup (1m → 5m → 1h → 24h automatic downsampling)
 * 17. Watchdog Heartbeat Monitor (ensure watchdog itself is alive)
 * 18. Perception Confidence Scorer (composite confidence for anomaly detections)
 * 19. Data Quality Gate (reject or flag metrics with impossible values)
 * 20. Provider SLA Tracker (track per-provider uptime against declared SLA)
 * 21. Vision Pipeline Circuit Breaker (disable pipelines that fail repeatedly)
 * 22. Metric Lineage Tracker (provenance chain from raw → aggregated → alerted)
 * 23. Seasonal Adjustment Engine (detect and compensate for periodic patterns)
 * 24. Vision Health Composite (unified health score for the perception layer)
 * 25. Vision Integrity Seal (tamper-evident hash of hardening state)
 */

export const VISION_HARDENING_VERSION = '2.0.0';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Metric Integrity Validator
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntegrityConflict {
  metric: string;
  sources: Array<{ source: string; value: number }>;
  maxDivergence: number;
  timestamp: string;
}

const integrityConflicts: IntegrityConflict[] = [];

export function validateMetricIntegrity(
  metric: string,
  values: Array<{ source: string; value: number }>,
  tolerancePercent = 5
): { valid: boolean; conflict?: IntegrityConflict } {
  if (values.length < 2) return { valid: true };

  const nums = values.map(v => v.value);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const maxDiv = Math.max(...nums.map(n => Math.abs(n - mean)));
  const divergencePercent = mean > 0 ? (maxDiv / mean) * 100 : 0;

  if (divergencePercent > tolerancePercent) {
    const conflict: IntegrityConflict = {
      metric,
      sources: values,
      maxDivergence: Math.round(divergencePercent * 100) / 100,
      timestamp: new Date().toISOString(),
    };
    integrityConflicts.push(conflict);
    if (integrityConflicts.length > 500) integrityConflicts.shift();
    return { valid: false, conflict };
  }
  return { valid: true };
}

export function getIntegrityConflicts(limit = 50): IntegrityConflict[] {
  return integrityConflicts.slice(-limit);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Anomaly Fingerprinting
// ═══════════════════════════════════════════════════════════════════════════════

const fingerprintCache = new Map<string, { count: number; firstSeen: string; lastSeen: string }>();

function computeAnomalyFingerprint(module: string, type: string, details: Record<string, unknown>): string {
  const keys = Object.keys(details).sort().join(',');
  let hash = 0x811c9dc5;
  const str = `${module}:${type}:${keys}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return `af-${hash.toString(16)}`;
}

export function fingerprintAnomaly(
  module: string,
  type: string,
  details: Record<string, unknown>
): { fingerprint: string; isDuplicate: boolean; occurrences: number } {
  const fp = computeAnomalyFingerprint(module, type, details);
  const now = new Date().toISOString();
  const existing = fingerprintCache.get(fp);

  if (existing) {
    existing.count++;
    existing.lastSeen = now;
    return { fingerprint: fp, isDuplicate: true, occurrences: existing.count };
  }

  fingerprintCache.set(fp, { count: 1, firstSeen: now, lastSeen: now });
  if (fingerprintCache.size > 2000) {
    const oldest = fingerprintCache.keys().next().value;
    if (oldest) fingerprintCache.delete(oldest);
  }
  return { fingerprint: fp, isDuplicate: false, occurrences: 1 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Sliding Window Aggregator
// ═══════════════════════════════════════════════════════════════════════════════

export interface WindowConfig {
  sizeMs: number;
  slideMs: number;
  type: 'tumbling' | 'sliding';
}

export interface WindowBucket {
  start: number;
  end: number;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
}

const MAX_WINDOW_STREAMS = 100;
const windowBuffers = new Map<string, Array<{ value: number; ts: number }>>();

export function pushToWindow(stream: string, value: number): void {
  if (!windowBuffers.has(stream)) {
    if (windowBuffers.size >= MAX_WINDOW_STREAMS) {
      const oldest = windowBuffers.keys().next().value;
      if (oldest) windowBuffers.delete(oldest);
    }
    windowBuffers.set(stream, []);
  }
  const buf = windowBuffers.get(stream)!;
  buf.push({ value, ts: Date.now() });
  // Evict entries older than 1 hour
  const cutoff = Date.now() - 3_600_000;
  while (buf.length > 0 && buf[0].ts < cutoff) buf.shift();
}

export function aggregateWindow(stream: string, config: WindowConfig): WindowBucket[] {
  const buf = windowBuffers.get(stream) || [];
  if (buf.length === 0) return [];

  const now = Date.now();
  const buckets: WindowBucket[] = [];
  const step = config.type === 'tumbling' ? config.sizeMs : config.slideMs;

  for (let start = now - config.sizeMs * 10; start <= now; start += step) {
    const end = start + config.sizeMs;
    const entries = buf.filter(e => e.ts >= start && e.ts < end);
    if (entries.length === 0) continue;

    const values = entries.map(e => e.value);
    buckets.push({
      start,
      end,
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    });
  }
  return buckets;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Signal-to-Noise Filter
// ═══════════════════════════════════════════════════════════════════════════════

export interface SNRConfig {
  minConfidence: number;   // 0–1
  minDeviation: number;    // minimum deviation % to surface
  minSampleSize: number;   // minimum data points required
}

const DEFAULT_SNR: SNRConfig = { minConfidence: 0.6, minDeviation: 10, minSampleSize: 5 };

export function passesSignalFilter(
  confidence: number,
  deviationPercent: number,
  sampleSize: number,
  config: Partial<SNRConfig> = {}
): { passes: boolean; reason?: string } {
  const cfg = { ...DEFAULT_SNR, ...config };
  if (sampleSize < cfg.minSampleSize) return { passes: false, reason: `sample_size ${sampleSize} < ${cfg.minSampleSize}` };
  if (confidence < cfg.minConfidence) return { passes: false, reason: `confidence ${confidence} < ${cfg.minConfidence}` };
  if (deviationPercent < cfg.minDeviation) return { passes: false, reason: `deviation ${deviationPercent}% < ${cfg.minDeviation}%` };
  return { passes: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Correlation Graph Builder
// ═══════════════════════════════════════════════════════════════════════════════

export interface CorrelationEdge {
  from: string;     // module:anomaly_type
  to: string;
  weight: number;   // 0–1 co-occurrence strength
  count: number;
  lastSeen: string;
}

const correlationEdges = new Map<string, CorrelationEdge>();

export function recordCorrelation(fromNode: string, toNode: string): void {
  const key = `${fromNode}→${toNode}`;
  const existing = correlationEdges.get(key);
  if (existing) {
    existing.count++;
    // Weight increases but with diminishing returns and natural decay based on age
    const ageMs = Date.now() - new Date(existing.lastSeen).getTime();
    const decayedWeight = existing.weight * Math.pow(0.5, ageMs / 3_600_000); // 1hr half-life
    existing.weight = Math.min(1, decayedWeight + 0.05);
    existing.lastSeen = new Date().toISOString();
  } else {
    correlationEdges.set(key, {
      from: fromNode,
      to: toNode,
      weight: 0.2,
      count: 1,
      lastSeen: new Date().toISOString(),
    });
  }
  if (correlationEdges.size > 1000) {
    // Evict lowest-weight edge instead of oldest (FIFO)
    let lowestKey = '';
    let lowestWeight = Infinity;
    for (const [k, e] of correlationEdges) {
      if (e.weight < lowestWeight) {
        lowestWeight = e.weight;
        lowestKey = k;
      }
    }
    if (lowestKey) correlationEdges.delete(lowestKey);
  }
}

export function getCorrelationGraph(): CorrelationEdge[] {
  return Array.from(correlationEdges.values()).sort((a, b) => b.weight - a.weight);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Provider Drift Detector
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_PROVIDER_LATENCY_ENTRIES = 50;
const providerLatencyHistory = new Map<string, number[]>();

export function recordProviderLatency(provider: string, latencyMs: number): void {
  if (!providerLatencyHistory.has(provider)) {
    if (providerLatencyHistory.size >= MAX_PROVIDER_LATENCY_ENTRIES) {
      const oldest = providerLatencyHistory.keys().next().value;
      if (oldest) providerLatencyHistory.delete(oldest);
    }
    providerLatencyHistory.set(provider, []);
  }
  const hist = providerLatencyHistory.get(provider)!;
  hist.push(latencyMs);
  if (hist.length > 500) hist.shift();
}

export function detectProviderDrift(provider: string): {
  drifted: boolean;
  currentMean: number;
  baselineMean: number;
  driftPercent: number;
} {
  const hist = providerLatencyHistory.get(provider) || [];
  if (hist.length < 20) return { drifted: false, currentMean: 0, baselineMean: 0, driftPercent: 0 };

  const mid = Math.floor(hist.length / 2);
  const baseline = hist.slice(0, mid);
  const current = hist.slice(mid);

  const bMean = baseline.reduce((a, b) => a + b, 0) / baseline.length;
  const cMean = current.reduce((a, b) => a + b, 0) / current.length;
  const drift = bMean > 0 ? ((cMean - bMean) / bMean) * 100 : 0;

  return {
    drifted: Math.abs(drift) > 25,
    currentMean: Math.round(cMean),
    baselineMean: Math.round(bMean),
    driftPercent: Math.round(drift * 10) / 10,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Metric Decay Engine
// ═══════════════════════════════════════════════════════════════════════════════

export function applyDecay(value: number, ageMs: number, halfLifeMs: number): number {
  return value * Math.pow(0.5, ageMs / halfLifeMs);
}

export function decayWeightedAverage(
  entries: Array<{ value: number; timestampMs: number }>,
  halfLifeMs: number
): number {
  const now = Date.now();
  let weightedSum = 0;
  let totalWeight = 0;

  for (const e of entries) {
    const weight = Math.pow(0.5, (now - e.timestampMs) / halfLifeMs);
    weightedSum += e.value * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Anomaly Severity Escalator
// ═══════════════════════════════════════════════════════════════════════════════

type Severity = 'low' | 'medium' | 'high' | 'critical';
const SEVERITY_ORDER: Severity[] = ['low', 'medium', 'high', 'critical'];

const MAX_ESCALATION_ENTRIES = 500;
const escalationTracker = new Map<string, { count: number; currentSeverity: Severity }>();

export function escalateSeverity(
  fingerprint: string,
  baseSeverity: Severity,
  escalateAfter = 3
): Severity {
  const entry = escalationTracker.get(fingerprint);
  if (!entry) {
    if (escalationTracker.size >= MAX_ESCALATION_ENTRIES) {
      const oldest = escalationTracker.keys().next().value;
      if (oldest) escalationTracker.delete(oldest);
    }
    escalationTracker.set(fingerprint, { count: 1, currentSeverity: baseSeverity });
    return baseSeverity;
  }

  entry.count++;
  if (entry.count >= escalateAfter) {
    const idx = SEVERITY_ORDER.indexOf(entry.currentSeverity);
    if (idx < SEVERITY_ORDER.length - 1) {
      entry.currentSeverity = SEVERITY_ORDER[idx + 1];
      entry.count = 0; // reset after escalation
    }
  }
  return entry.currentSeverity;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Vision Canary Probes
// ═══════════════════════════════════════════════════════════════════════════════

export interface CanaryResult {
  probeId: string;
  pipeline: string;
  injectedAt: string;
  detectedAt: string | null;
  latencyMs: number | null;
  success: boolean;
}

const canaryResults: CanaryResult[] = [];

export function injectCanary(pipeline: string): string {
  const probeId = `canary-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  canaryResults.push({
    probeId,
    pipeline,
    injectedAt: new Date().toISOString(),
    detectedAt: null,
    latencyMs: null,
    success: false,
  });
  if (canaryResults.length > 200) canaryResults.shift();
  return probeId;
}

export function acknowledgeCanary(probeId: string): boolean {
  const probe = canaryResults.find(c => c.probeId === probeId);
  if (!probe) return false;
  probe.detectedAt = new Date().toISOString();
  probe.latencyMs = new Date(probe.detectedAt).getTime() - new Date(probe.injectedAt).getTime();
  probe.success = true;
  return true;
}

export function getCanaryHealth(): { total: number; successful: number; avgLatencyMs: number; successRate: number } {
  const recent = canaryResults.slice(-50);
  const successful = recent.filter(c => c.success);
  const latencies = successful.filter(c => c.latencyMs !== null).map(c => c.latencyMs!);
  return {
    total: recent.length,
    successful: successful.length,
    avgLatencyMs: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    successRate: recent.length > 0 ? Math.round((successful.length / recent.length) * 100) : 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Metric Cardinality Guard
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_CARDINALITY_METRICS = 200;
const cardinalityCounts = new Map<string, Set<string>>();
const CARDINALITY_LIMIT = 500;

export function checkCardinality(
  metricName: string,
  labelSignature: string
): { allowed: boolean; currentCardinality: number; limit: number } {
  if (!cardinalityCounts.has(metricName)) {
    // Cap total tracked metrics
    if (cardinalityCounts.size >= MAX_CARDINALITY_METRICS) {
      const oldest = cardinalityCounts.keys().next().value;
      if (oldest) cardinalityCounts.delete(oldest);
    }
    cardinalityCounts.set(metricName, new Set());
  }
  const labels = cardinalityCounts.get(metricName)!;
  if (labels.size < CARDINALITY_LIMIT) {
    labels.add(labelSignature);
  }
  return {
    allowed: labels.size <= CARDINALITY_LIMIT,
    currentCardinality: labels.size,
    limit: CARDINALITY_LIMIT,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Observability Budget Tracker
// ═══════════════════════════════════════════════════════════════════════════════

interface BudgetEntry {
  stream: string;
  pointsIngested: number;
  estimatedCostMicros: number; // cost in microdollars
}

const MAX_BUDGET_STREAMS = 200;
const budgetEntries = new Map<string, BudgetEntry>();

export function recordObservabilityCost(stream: string, points: number, costPerPointMicros = 1): void {
  const entry = budgetEntries.get(stream) || { stream, pointsIngested: 0, estimatedCostMicros: 0 };
  entry.pointsIngested += points;
  entry.estimatedCostMicros += points * costPerPointMicros;
  budgetEntries.set(stream, entry);
}

export function getObservabilityBudget(): { streams: BudgetEntry[]; totalCostMicros: number } {
  const streams = Array.from(budgetEntries.values());
  return {
    streams,
    totalCostMicros: streams.reduce((a, b) => a + b.estimatedCostMicros, 0),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Trace Sampling Strategy
// ═══════════════════════════════════════════════════════════════════════════════

export type SamplingStrategy = 'always' | 'never' | 'head' | 'tail' | 'priority';

export function shouldSampleTrace(
  strategy: SamplingStrategy,
  options: { headRate?: number; isError?: boolean; priority?: number } = {}
): boolean {
  switch (strategy) {
    case 'always': return true;
    case 'never': return false;
    case 'head': return Math.random() < (options.headRate ?? 0.1);
    case 'tail': return options.isError === true;
    case 'priority': return (options.priority ?? 0) >= 2;
    default: return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 13. Metric Compression (delta-of-delta encoding)
// ═══════════════════════════════════════════════════════════════════════════════

export function deltaOfDeltaEncode(values: number[]): number[] {
  if (values.length < 2) return values;
  const deltas: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    deltas.push(values[i] - values[i - 1]);
  }
  const dod: number[] = [deltas[0]];
  for (let i = 1; i < deltas.length; i++) {
    dod.push(deltas[i] - deltas[i - 1]);
  }
  return dod;
}

export function deltaOfDeltaDecode(encoded: number[]): number[] {
  if (encoded.length < 2) return encoded;
  // Reconstruct deltas
  const deltas: number[] = [encoded[0]];
  for (let i = 1; i < encoded.length; i++) {
    deltas.push(encoded[i] + deltas[i - 1]);
  }
  // Reconstruct values
  const values: number[] = [deltas[0]];
  for (let i = 1; i < deltas.length; i++) {
    values.push(deltas[i] + values[i - 1]);
  }
  return values;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 14. Alert Fatigue Reducer
// ═══════════════════════════════════════════════════════════════════════════════

interface AlertRecord {
  key: string;
  count: number;
  firstFired: string;
  lastFired: string;
  suppressed: number;
}

const MAX_ALERT_HISTORY = 500;
const alertHistory = new Map<string, AlertRecord>();
const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export function shouldFireAlert(alertKey: string): { fire: boolean; coalescedCount: number; reason?: string } {
  const now = Date.now();
  const record = alertHistory.get(alertKey);

  if (!record) {
    if (alertHistory.size >= MAX_ALERT_HISTORY) {
      const oldest = alertHistory.keys().next().value;
      if (oldest) alertHistory.delete(oldest);
    }
    alertHistory.set(alertKey, {
      key: alertKey,
      count: 1,
      firstFired: new Date().toISOString(),
      lastFired: new Date().toISOString(),
      suppressed: 0,
    });
    return { fire: true, coalescedCount: 1 };
  }

  const elapsed = now - new Date(record.lastFired).getTime();
  record.count++;

  if (elapsed < ALERT_COOLDOWN_MS) {
    record.suppressed++;
    return { fire: false, coalescedCount: record.count, reason: `cooldown (${Math.round((ALERT_COOLDOWN_MS - elapsed) / 1000)}s remaining)` };
  }

  record.lastFired = new Date().toISOString();
  const coalesced = record.suppressed;
  record.suppressed = 0;
  return { fire: true, coalescedCount: coalesced + 1 };
}

export function getAlertFatigueStats(): { totalAlerts: number; totalSuppressed: number; activeKeys: number } {
  let totalAlerts = 0;
  let totalSuppressed = 0;
  for (const r of alertHistory.values()) {
    totalAlerts += r.count;
    totalSuppressed += r.suppressed;
  }
  return { totalAlerts, totalSuppressed, activeKeys: alertHistory.size };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 15. Baseline Auto-Calibrator
// ═══════════════════════════════════════════════════════════════════════════════

const baselineStore = new Map<string, { values: number[]; baseline: number; lastCalibrated: string }>();

export function calibrateBaseline(metric: string, newValue: number, maxHistory = 100): number {
  const entry = baselineStore.get(metric) || { values: [], baseline: newValue, lastCalibrated: new Date().toISOString() };
  entry.values.push(newValue);
  if (entry.values.length > maxHistory) entry.values.shift();

  // Recalculate baseline as trimmed mean (drop top/bottom 10%)
  const sorted = [...entry.values].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.1);
  const trimmed = sorted.slice(trim, sorted.length - trim || sorted.length);
  entry.baseline = trimmed.length > 0 ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length : newValue;
  entry.lastCalibrated = new Date().toISOString();

  baselineStore.set(metric, entry);
  return entry.baseline;
}

export function getBaseline(metric: string): number | null {
  return baselineStore.get(metric)?.baseline ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 16. Multi-Resolution Rollup
// ═══════════════════════════════════════════════════════════════════════════════

export interface RollupLevel {
  resolution: '1m' | '5m' | '1h' | '24h';
  buckets: Array<{ ts: number; avg: number; min: number; max: number; count: number }>;
}

export function rollup(
  dataPoints: Array<{ ts: number; value: number }>,
  resolution: '1m' | '5m' | '1h' | '24h'
): RollupLevel {
  const intervalMs: Record<string, number> = { '1m': 60_000, '5m': 300_000, '1h': 3_600_000, '24h': 86_400_000 };
  const interval = intervalMs[resolution];
  const grouped = new Map<number, number[]>();

  for (const dp of dataPoints) {
    const bucket = Math.floor(dp.ts / interval) * interval;
    if (!grouped.has(bucket)) grouped.set(bucket, []);
    grouped.get(bucket)!.push(dp.value);
  }

  const buckets = Array.from(grouped.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, values]) => ({
      ts,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }));

  return { resolution, buckets };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 17. Watchdog Heartbeat Monitor
// ═══════════════════════════════════════════════════════════════════════════════

let lastWatchdogBeat = 0;
let watchdogMissedBeats = 0;
const WATCHDOG_INTERVAL_MS = 60_000;

export function recordWatchdogHeartbeat(): void {
  lastWatchdogBeat = Date.now();
  watchdogMissedBeats = 0;
}

export function checkWatchdogAlive(): { alive: boolean; lastBeat: number; missedBeats: number; silenceMs: number } {
  const silenceMs = lastWatchdogBeat > 0 ? Date.now() - lastWatchdogBeat : Infinity;
  if (silenceMs > WATCHDOG_INTERVAL_MS * 3) watchdogMissedBeats++;
  return {
    alive: silenceMs < WATCHDOG_INTERVAL_MS * 3,
    lastBeat: lastWatchdogBeat,
    missedBeats: watchdogMissedBeats,
    silenceMs: lastWatchdogBeat > 0 ? silenceMs : -1,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 18. Perception Confidence Scorer
// ═══════════════════════════════════════════════════════════════════════════════

export function calculatePerceptionConfidence(params: {
  sampleSize: number;
  zScore: number;
  deviationPercent: number;
  baselineAge: number; // how old the baseline is in ms
}): number {
  const sampleWeight = Math.min(1, params.sampleSize / 30);
  const zWeight = Math.min(1, Math.abs(params.zScore) / 4);
  const devWeight = Math.min(1, params.deviationPercent / 100);
  const freshnessWeight = Math.max(0.2, 1 - params.baselineAge / 86_400_000);

  return Math.round(((sampleWeight * 0.3 + zWeight * 0.3 + devWeight * 0.2 + freshnessWeight * 0.2)) * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 19. Data Quality Gate
// ═══════════════════════════════════════════════════════════════════════════════

export interface QualityResult {
  valid: boolean;
  violations: string[];
}

export function validateMetricQuality(name: string, value: number, ts: number): QualityResult {
  const violations: string[] = [];
  if (!Number.isFinite(value)) violations.push('non_finite_value');
  if (value < 0 && !name.includes('delta') && !name.includes('drift')) violations.push('unexpected_negative');
  if (ts > Date.now() + 60_000) violations.push('future_timestamp');
  if (ts < Date.now() - 86_400_000 * 7) violations.push('stale_timestamp_7d');
  if (value > 1e12) violations.push('implausible_magnitude');
  return { valid: violations.length === 0, violations };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 20. Provider SLA Tracker
// ═══════════════════════════════════════════════════════════════════════════════

interface ProviderSLARecord {
  provider: string;
  totalChecks: number;
  successChecks: number;
  uptimePercent: number;
  declaredSLA: number; // e.g. 99.9
  breached: boolean;
}

const slaRecords = new Map<string, ProviderSLARecord>();

export function recordProviderCheck(provider: string, success: boolean, declaredSLA = 99.9): void {
  const rec = slaRecords.get(provider) || { provider, totalChecks: 0, successChecks: 0, uptimePercent: 100, declaredSLA, breached: false };
  rec.totalChecks++;
  if (success) rec.successChecks++;
  rec.uptimePercent = (rec.successChecks / rec.totalChecks) * 100;
  rec.breached = rec.uptimePercent < declaredSLA;
  slaRecords.set(provider, rec);
}

export function getProviderSLAStatus(): ProviderSLARecord[] {
  return Array.from(slaRecords.values());
}

// ═══════════════════════════════════════════════════════════════════════════════
// 21. Vision Pipeline Circuit Breaker
// ═══════════════════════════════════════════════════════════════════════════════

interface PipelineBreaker {
  pipeline: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure: number;
  openedAt: number;
  threshold: number;
  cooldownMs: number;
}

const pipelineBreakers = new Map<string, PipelineBreaker>();

export function getPipelineBreakerState(pipeline: string): PipelineBreaker['state'] {
  const b = pipelineBreakers.get(pipeline);
  if (!b) return 'closed';
  if (b.state === 'open' && Date.now() - b.openedAt > b.cooldownMs) {
    b.state = 'half-open';
  }
  return b.state;
}

export function recordPipelineResult(pipeline: string, success: boolean, threshold = 5, cooldownMs = 120_000): void {
  const b = pipelineBreakers.get(pipeline) || { pipeline, state: 'closed' as const, failures: 0, lastFailure: 0, openedAt: 0, threshold, cooldownMs };

  if (success) {
    if (b.state === 'half-open') b.state = 'closed';
    b.failures = Math.max(0, b.failures - 1);
  } else {
    b.failures++;
    b.lastFailure = Date.now();
    if (b.failures >= threshold) {
      b.state = 'open';
      b.openedAt = Date.now();
    }
  }
  pipelineBreakers.set(pipeline, b);
}

export function getPipelineBreakerStats(): Array<{ pipeline: string; state: string; failures: number }> {
  return Array.from(pipelineBreakers.values()).map(b => ({
    pipeline: b.pipeline,
    state: getPipelineBreakerState(b.pipeline),
    failures: b.failures,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 22. Metric Lineage Tracker
// ═══════════════════════════════════════════════════════════════════════════════

export interface LineageNode {
  id: string;
  stage: 'raw' | 'aggregated' | 'analyzed' | 'alerted';
  metric: string;
  parentId: string | null;
  timestamp: string;
}

const lineageLog: LineageNode[] = [];

export function recordLineage(metric: string, stage: LineageNode['stage'], parentId: string | null = null): string {
  const id = `ln-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  lineageLog.push({ id, stage, metric, parentId, timestamp: new Date().toISOString() });
  if (lineageLog.length > 2000) lineageLog.shift();
  return id;
}

export function getLineageChain(id: string): LineageNode[] {
  const chain: LineageNode[] = [];
  let current = lineageLog.find(n => n.id === id);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? lineageLog.find(n => n.id === current!.parentId) : undefined;
  }
  return chain;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 23. Seasonal Adjustment Engine
// ═══════════════════════════════════════════════════════════════════════════════

export function detectSeasonality(values: number[], periodLength: number): { seasonal: boolean; strength: number } {
  if (values.length < periodLength * 2) return { seasonal: false, strength: 0 };

  // Auto-correlation at the period lag
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  let num = 0;
  let denA = 0;
  let denB = 0;

  for (let i = 0; i < values.length - periodLength; i++) {
    const a = values[i] - mean;
    const b = values[i + periodLength] - mean;
    num += a * b;
    denA += a * a;
    denB += b * b;
  }

  const denominator = Math.sqrt(denA * denB);
  const correlation = denominator > 0 ? num / denominator : 0;

  return {
    seasonal: correlation > 0.5,
    strength: Math.round(Math.max(0, correlation) * 100) / 100,
  };
}

export function deseasonalize(values: number[], periodLength: number): number[] {
  if (values.length < periodLength) return values;
  const seasonalComponent = new Array(periodLength).fill(0);
  const counts = new Array(periodLength).fill(0);

  for (let i = 0; i < values.length; i++) {
    seasonalComponent[i % periodLength] += values[i];
    counts[i % periodLength]++;
  }

  for (let i = 0; i < periodLength; i++) {
    seasonalComponent[i] /= counts[i];
  }

  const grandMean = seasonalComponent.reduce((a, b) => a + b, 0) / periodLength;
  return values.map((v, i) => v - (seasonalComponent[i % periodLength] - grandMean));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 24. Vision Health Composite
// ═══════════════════════════════════════════════════════════════════════════════

export interface VisionHealthReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: {
    anomalyLoad: number;
    canaryHealth: number;
    pipelineHealth: number;
    watchdogHealth: number;
    cardinalityHealth: number;
    alertFatigueScore: number;
  };
  timestamp: string;
}

export function calculateVisionHealth(): VisionHealthReport {
  // Anomaly load (fewer active conflicts = healthier)
  const conflicts = integrityConflicts.length;
  const anomalyLoad = Math.max(0, 100 - conflicts * 5);

  // Canary health
  const canary = getCanaryHealth();
  const canaryHealth = canary.successRate;

  // Pipeline health (% of closed breakers)
  const breakers = getPipelineBreakerStats();
  const closedBreakers = breakers.filter(b => b.state === 'closed').length;
  const pipelineHealth = breakers.length > 0 ? (closedBreakers / breakers.length) * 100 : 100;

  // Watchdog health
  const wd = checkWatchdogAlive();
  const watchdogHealth = wd.alive ? 100 : Math.max(0, 100 - wd.missedBeats * 20);

  // Cardinality health (per-metric: avg utilization of cardinality limit)
  let maxUtilization = 0;
  for (const labels of cardinalityCounts.values()) {
    const utilization = labels.size / CARDINALITY_LIMIT;
    if (utilization > maxUtilization) maxUtilization = utilization;
  }
  const cardinalityHealth = Math.max(0, 100 - maxUtilization * 100);

  // Alert fatigue
  const fatigue = getAlertFatigueStats();
  const alertFatigueScore = fatigue.totalAlerts > 0
    ? Math.max(0, 100 - (fatigue.totalSuppressed / fatigue.totalAlerts) * 100)
    : 100;

  const score = Math.round(
    anomalyLoad * 0.2 +
    canaryHealth * 0.2 +
    pipelineHealth * 0.2 +
    watchdogHealth * 0.15 +
    cardinalityHealth * 0.1 +
    alertFatigueScore * 0.15
  );

  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  return {
    score,
    grade,
    components: { anomalyLoad, canaryHealth, pipelineHealth, watchdogHealth, cardinalityHealth, alertFatigueScore },
    timestamp: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 25. Vision Integrity Seal
// ═══════════════════════════════════════════════════════════════════════════════

export function sealVisionIntegrity(): {
  seal: string;
  components: Record<string, number>;
  timestamp: string;
  version: string;
} {
  const components: Record<string, number> = {
    integrityConflicts: integrityConflicts.length,
    fingerprints: fingerprintCache.size,
    correlationEdges: correlationEdges.size,
    providerHistories: providerLatencyHistory.size,
    escalations: escalationTracker.size,
    canaries: canaryResults.length,
    cardinalityStreams: cardinalityCounts.size,
    budgetStreams: budgetEntries.size,
    alerts: alertHistory.size,
    baselines: baselineStore.size,
    pipelineBreakers: pipelineBreakers.size,
    lineageEntries: lineageLog.length,
    slaProviders: slaRecords.size,
  };

  const payload = JSON.stringify(components);
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  return {
    seal: `vis-${hash.toString(16)}-${Date.now().toString(36)}`,
    components,
    timestamp: new Date().toISOString(),
    version: VISION_HARDENING_VERSION,
  };
}
