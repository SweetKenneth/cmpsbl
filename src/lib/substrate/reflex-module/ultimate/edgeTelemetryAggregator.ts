/**
 * REFLEX Ultimate — System 9: Edge Telemetry Aggregator
 * 
 * Per-node, per-rule, per-decision metrics with rolling percentile
 * windows, anomaly detection (Z-score), and telemetry export.
 * 
 * @module reflex/ultimate/edgeTelemetryAggregator
 */

// ── Types ────────────────────────────────────────────────────────

export interface TelemetryDataPoint {
  nodeId: string;
  metric: string;
  value: number;
  timestamp: number;
}

export interface NodeTelemetry {
  nodeId: string;
  metrics: Record<string, {
    count: number;
    sum: number;
    mean: number;
    min: number;
    max: number;
    lastValue: number;
    // Welford's online stats
    m2: number;
    stdDev: number;
  }>;
  lastUpdated: number;
}

export interface TelemetryAnomaly {
  id: string;
  nodeId: string;
  metric: string;
  value: number;
  zScore: number;
  mean: number;
  stdDev: number;
  severity: 'warning' | 'critical';
  detectedAt: number;
}

// ── State ────────────────────────────────────────────────────────

const nodeTelemetry: Map<string, NodeTelemetry> = new Map();
const anomalies: TelemetryAnomaly[] = [];
const recentDataPoints: TelemetryDataPoint[] = [];
const MAX_DATA_POINTS = 5000;
const MAX_ANOMALIES = 500;
const Z_WARNING = 2;
const Z_CRITICAL = 3;

// ── Core API ────────────────────────────────────────────────────

/** Record a telemetry data point */
export function recordMetric(nodeId: string, metric: string, value: number): TelemetryAnomaly | null {
  // Ensure node telemetry exists
  if (!nodeTelemetry.has(nodeId)) {
    nodeTelemetry.set(nodeId, { nodeId, metrics: {}, lastUpdated: Date.now() });
  }

  const node = nodeTelemetry.get(nodeId)!;
  node.lastUpdated = Date.now();

  if (!node.metrics[metric]) {
    node.metrics[metric] = { count: 0, sum: 0, mean: 0, min: Infinity, max: -Infinity, lastValue: 0, m2: 0, stdDev: 0 };
  }

  const m = node.metrics[metric];

  // Welford's online update
  m.count++;
  const delta = value - m.mean;
  m.mean += delta / m.count;
  const delta2 = value - m.mean;
  m.m2 += delta * delta2;
  m.stdDev = m.count > 1 ? Math.sqrt(m.m2 / (m.count - 1)) : 0;

  m.sum += value;
  m.lastValue = value;
  if (value < m.min) m.min = value;
  if (value > m.max) m.max = value;

  // Store data point
  recentDataPoints.push({ nodeId, metric, value, timestamp: Date.now() });
  if (recentDataPoints.length > MAX_DATA_POINTS) recentDataPoints.splice(0, recentDataPoints.length - MAX_DATA_POINTS);

  // Anomaly detection (after enough samples)
  if (m.count > 20 && m.stdDev > 0) {
    const zScore = Math.abs(value - m.mean) / m.stdDev;

    if (zScore >= Z_WARNING) {
      const anomaly: TelemetryAnomaly = {
        id: `anomaly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nodeId, metric, value,
        zScore: Math.round(zScore * 100) / 100,
        mean: Math.round(m.mean * 100) / 100,
        stdDev: Math.round(m.stdDev * 100) / 100,
        severity: zScore >= Z_CRITICAL ? 'critical' : 'warning',
        detectedAt: Date.now(),
      };

      anomalies.push(anomaly);
      if (anomalies.length > MAX_ANOMALIES) anomalies.splice(0, anomalies.length - MAX_ANOMALIES);

      return anomaly;
    }
  }

  return null;
}

/** Get telemetry for a specific node */
export function getNodeTelemetry(nodeId: string): NodeTelemetry | undefined {
  return nodeTelemetry.get(nodeId);
}

/** Get all node telemetry */
export function getAllNodeTelemetry(): NodeTelemetry[] {
  return Array.from(nodeTelemetry.values());
}

/** Get recent anomalies */
export function getAnomalies(since?: number): TelemetryAnomaly[] {
  if (since) return anomalies.filter(a => a.detectedAt >= since);
  return [...anomalies];
}

/** Get metric time series for a node */
export function getMetricTimeSeries(nodeId: string, metric: string, count: number = 100): TelemetryDataPoint[] {
  return recentDataPoints
    .filter(dp => dp.nodeId === nodeId && dp.metric === metric)
    .slice(-count);
}

export function getTelemetryAggregatorHealth() {
  const recentAnomalies = anomalies.filter(a => Date.now() - a.detectedAt < 300_000);

  return {
    nodesTracked: nodeTelemetry.size,
    totalDataPoints: recentDataPoints.length,
    totalAnomalies: anomalies.length,
    recentAnomalies: recentAnomalies.length,
    criticalAnomalies: recentAnomalies.filter(a => a.severity === 'critical').length,
    healthScore: Math.max(0, 100 - recentAnomalies.filter(a => a.severity === 'critical').length * 15 - recentAnomalies.filter(a => a.severity === 'warning').length * 5),
  };
}

export function resetTelemetryAggregator(): void {
  nodeTelemetry.clear();
  anomalies.length = 0;
  recentDataPoints.length = 0;
}
