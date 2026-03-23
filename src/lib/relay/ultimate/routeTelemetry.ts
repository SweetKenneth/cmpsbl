/**
 * RELAY Ultimate — Route Telemetry
 * Per-edge latency tracking, throughput metrics, error rates, compression ratios.
 * Bottleneck detection and historical pattern analysis.
 */

export interface EdgeMetrics {
  edgeKey: string;
  from: string;
  to: string;
  totalMessages: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorCount: number;
  errorRate: number;
  totalBytesIn: number;
  totalBytesOut: number;
  compressionRatio: number;
  lastUpdated: number;
  latencySamples: number[];
}

export interface BottleneckAlert {
  id: string;
  edgeKey: string;
  reason: string;
  severity: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  detectedAt: number;
}

export interface RouteTelemetryStats {
  totalEdges: number;
  totalMessages: number;
  avgLatency: number;
  avgErrorRate: number;
  bottleneckCount: number;
  totalBytes: number;
}

const MAX_EDGES = 300;
const MAX_LATENCY_SAMPLES = 100;
const MAX_BOTTLENECKS = 100;
const LATENCY_THRESHOLD = 500;  // ms
const ERROR_RATE_THRESHOLD = 0.2;

const edgeMetrics = new Map<string, EdgeMetrics>();
const bottlenecks: BottleneckAlert[] = [];

function metricsKey(from: string, to: string): string { return `${from}→${to}`; }

export function recordEdgeMetric(
  from: string, to: string, latencyMs: number,
  bytesIn: number, bytesOut: number, success: boolean
): void {
  const key = metricsKey(from, to);
  let metrics = edgeMetrics.get(key);

  if (!metrics) {
    if (edgeMetrics.size >= MAX_EDGES) {
      const oldest = [...edgeMetrics.entries()]
        .sort((a, b) => a[1].lastUpdated - b[1].lastUpdated)[0];
      if (oldest) edgeMetrics.delete(oldest[0]);
    }
    metrics = {
      edgeKey: key, from, to,
      totalMessages: 0, totalLatencyMs: 0, avgLatencyMs: 0, p95LatencyMs: 0,
      errorCount: 0, errorRate: 0,
      totalBytesIn: 0, totalBytesOut: 0, compressionRatio: 1,
      lastUpdated: Date.now(), latencySamples: [],
    };
    edgeMetrics.set(key, metrics);
  }

  metrics.totalMessages++;
  metrics.totalLatencyMs += latencyMs;
  metrics.avgLatencyMs = metrics.totalLatencyMs / metrics.totalMessages;
  metrics.totalBytesIn += bytesIn;
  metrics.totalBytesOut += bytesOut;
  metrics.compressionRatio = metrics.totalBytesIn > 0 ? metrics.totalBytesOut / metrics.totalBytesIn : 1;

  if (!success) metrics.errorCount++;
  metrics.errorRate = metrics.errorCount / metrics.totalMessages;

  // Track latency samples for percentile
  if (metrics.latencySamples.length >= MAX_LATENCY_SAMPLES) metrics.latencySamples.shift();
  metrics.latencySamples.push(latencyMs);
  const sorted = [...metrics.latencySamples].sort((a, b) => a - b);
  metrics.p95LatencyMs = sorted[Math.floor(sorted.length * 0.95)] ?? latencyMs;

  metrics.lastUpdated = Date.now();

  // Bottleneck detection
  if (metrics.avgLatencyMs > LATENCY_THRESHOLD) {
    addBottleneck(key, 'High average latency', 'avgLatencyMs', metrics.avgLatencyMs, LATENCY_THRESHOLD);
  }
  if (metrics.errorRate > ERROR_RATE_THRESHOLD && metrics.totalMessages > 10) {
    addBottleneck(key, 'High error rate', 'errorRate', metrics.errorRate, ERROR_RATE_THRESHOLD);
  }
}

function addBottleneck(edgeKey: string, reason: string, metric: string, value: number, threshold: number): void {
  // Don't duplicate for same edge+metric
  const exists = bottlenecks.some(b => b.edgeKey === edgeKey && b.metric === metric && Date.now() - b.detectedAt < 60_000);
  if (exists) return;

  const alert: BottleneckAlert = {
    id: `bn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    edgeKey, reason,
    severity: value > threshold * 2 ? 'critical' : 'warning',
    metric, value, threshold, detectedAt: Date.now(),
  };
  if (bottlenecks.length >= MAX_BOTTLENECKS) bottlenecks.shift();
  bottlenecks.push(alert);
}

export function getEdgeMetrics(from: string, to: string): EdgeMetrics | null {
  return edgeMetrics.get(metricsKey(from, to)) ?? null;
}

export function getRouteTelemetryStats(): RouteTelemetryStats {
  const all = [...edgeMetrics.values()];
  return {
    totalEdges: all.length,
    totalMessages: all.reduce((s, m) => s + m.totalMessages, 0),
    avgLatency: all.length > 0 ? all.reduce((s, m) => s + m.avgLatencyMs, 0) / all.length : 0,
    avgErrorRate: all.length > 0 ? all.reduce((s, m) => s + m.errorRate, 0) / all.length : 0,
    bottleneckCount: bottlenecks.length,
    totalBytes: all.reduce((s, m) => s + m.totalBytesIn + m.totalBytesOut, 0),
  };
}

export function resetRouteTelemetryState(): void { edgeMetrics.clear(); bottlenecks.length = 0; }
