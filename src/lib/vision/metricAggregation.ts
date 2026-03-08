/**
 * CMPSBL® VISION — Real-Time Metric Aggregation
 * Live metric collection, aggregation, and streaming
 */

import { supabase } from '@/integrations/supabase/client';
import { SubstrateModule } from '@/lib/substrate';

export interface MetricPoint {
  timestamp: string;
  module: SubstrateModule;
  metric: string;
  value: number;
  tags?: Record<string, string>;
}

export interface AggregatedMetric {
  metric: string;
  module?: SubstrateModule;
  period: '1m' | '5m' | '15m' | '1h' | '24h';
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface MetricAlert {
  id: string;
  metric: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  currentValue: number;
  triggered: boolean;
  message: string;
}

// In-memory ring buffer for real-time metrics (avoids O(n) shift)
const MAX_BUFFER_SIZE = 1000;
const metricRing: (MetricPoint | null)[] = new Array(MAX_BUFFER_SIZE).fill(null);
let ringHead = 0;
let ringCount = 0;

/** Get buffer contents as ordered array (oldest → newest) */
function getBufferContents(): MetricPoint[] {
  if (ringCount === 0) return [];
  const result: MetricPoint[] = [];
  const start = ringCount < MAX_BUFFER_SIZE ? 0 : ringHead;
  const len = Math.min(ringCount, MAX_BUFFER_SIZE);
  for (let i = 0; i < len; i++) {
    const idx = (start + i) % MAX_BUFFER_SIZE;
    if (metricRing[idx]) result.push(metricRing[idx]!);
  }
  return result;
}

/**
 * Record a metric point (O(1) insertion via ring buffer)
 */
export function recordMetric(
  module: SubstrateModule,
  metric: string,
  value: number,
  tags?: Record<string, string>
): void {
  const point: MetricPoint = {
    timestamp: new Date().toISOString(),
    module,
    metric,
    value,
    tags,
  };
  
  metricRing[ringHead] = point;
  ringHead = (ringHead + 1) % MAX_BUFFER_SIZE;
  ringCount++;
}

/**
 * Get real-time metrics from buffer
 */
export function getRealtimeMetrics(
  options?: {
    module?: SubstrateModule;
    metric?: string;
    since?: Date;
    limit?: number;
  }
): MetricPoint[] {
  let results = getBufferContents();
  
  if (options?.module) {
    results = results.filter(m => m.module === options.module);
  }
  
  if (options?.metric) {
    results = results.filter(m => m.metric === options.metric);
  }
  
  if (options?.since) {
    const sinceTime = options.since.getTime();
    results = results.filter(m => new Date(m.timestamp).getTime() >= sinceTime);
  }
  
  if (options?.limit) {
    results = results.slice(-options.limit);
  }
  
  return results;
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Aggregate metrics over a time period
 */
export async function aggregateMetrics(
  metric: string,
  period: AggregatedMetric['period'],
  options?: {
    module?: SubstrateModule;
    fromBuffer?: boolean;
  }
): Promise<AggregatedMetric> {
  const periodMs: Record<string, number> = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '24h': 86400000,
  };
  
  const since = new Date(Date.now() - periodMs[period]);
  let values: number[] = [];
  
  if (options?.fromBuffer) {
    // Aggregate from in-memory buffer
    const points = getRealtimeMetrics({
      module: options.module,
      metric,
      since,
    });
    values = points.map(p => p.value);
  } else {
    // Aggregate from database
    try {
      const { data } = await supabase
        .from('brain_events')
        .select('data')
        .eq('event_type', 'metric')
        .gte('created_at', since.toISOString());
      
      values = (data || [])
        .filter(d => (d.data as any)?.metric === metric)
        .filter(d => !options?.module || (d.data as any)?.module === options.module)
        .map(d => (d.data as any)?.value || 0);
    } catch (error) {
      console.error('Error aggregating metrics:', error);
    }
  }
  
  if (values.length === 0) {
    return {
      metric,
      module: options?.module,
      period,
      count: 0,
      sum: 0,
      avg: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  
  return {
    metric,
    module: options?.module,
    period,
    count: values.length,
    sum,
    avg: sum / values.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

/**
 * Get dashboard metrics summary
 */
export async function getDashboardMetrics(): Promise<{
  requests: AggregatedMetric;
  latency: AggregatedMetric;
  errors: AggregatedMetric;
  memory: AggregatedMetric;
  activeModules: number;
  healthScore: number;
}> {
  const [requests, latency, errors, memory] = await Promise.all([
    aggregateMetrics('request_count', '1h'),
    aggregateMetrics('response_time', '1h'),
    aggregateMetrics('error_count', '1h'),
    aggregateMetrics('memory_usage', '1h'),
  ]);
  
  // Get active module count
  const recentMetrics = getRealtimeMetrics({ since: new Date(Date.now() - 300000) });
  const activeModules = new Set(recentMetrics.map(m => m.module)).size;
  
  // Calculate health score
  const errorRate = requests.count > 0 ? errors.count / requests.count : 0;
  const latencyScore = Math.max(0, 100 - latency.p95 / 20);
  const errorScore = Math.max(0, 100 - errorRate * 200);
  const healthScore = (latencyScore + errorScore) / 2;
  
  return {
    requests,
    latency,
    errors,
    memory,
    activeModules,
    healthScore: Math.round(healthScore),
  };
}

/**
 * Check metric alerts
 */
export async function checkMetricAlerts(): Promise<MetricAlert[]> {
  const alerts: MetricAlert[] = [];
  
  // Define alert conditions
  const alertConfigs = [
    { metric: 'error_count', condition: 'above' as const, threshold: 10, message: 'High error rate detected' },
    { metric: 'response_time', condition: 'above' as const, threshold: 2000, message: 'High latency detected' },
    { metric: 'memory_usage', condition: 'above' as const, threshold: 80, message: 'Memory pressure detected' },
  ];
  
  for (const config of alertConfigs) {
    const aggregated = await aggregateMetrics(config.metric, '5m', { fromBuffer: true });
    const currentValue = config.metric === 'error_count' ? aggregated.count : aggregated.avg;
    
    let triggered = false;
    if (config.condition === 'above') {
      triggered = currentValue > config.threshold;
    } else if (config.condition === 'below') {
      triggered = currentValue < config.threshold;
    }
    
    alerts.push({
      id: `alert-${config.metric}`,
      metric: config.metric,
      condition: config.condition,
      threshold: config.threshold,
      currentValue,
      triggered,
      message: triggered ? config.message : `${config.metric} is within normal range`,
    });
  }
  
  return alerts;
}

/**
 * Get metric time series for charting
 */
export function getMetricTimeSeries(
  metric: string,
  bucketMs: number = 60000,
  options?: {
    module?: SubstrateModule;
    limit?: number;
  }
): Array<{ timestamp: string; value: number }> {
  const points = getRealtimeMetrics({
    module: options?.module,
    metric,
    limit: options?.limit,
  });
  
  if (points.length === 0) return [];
  
  // Group by time bucket
  const buckets: Record<number, number[]> = {};
  
  for (const point of points) {
    const bucketTime = Math.floor(new Date(point.timestamp).getTime() / bucketMs) * bucketMs;
    if (!buckets[bucketTime]) buckets[bucketTime] = [];
    buckets[bucketTime].push(point.value);
  }
  
  // Average each bucket
  return Object.entries(buckets)
    .map(([time, values]) => ({
      timestamp: new Date(parseInt(time)).toISOString(),
      value: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Flush metrics buffer to database
 */
let flushInProgress = false;

export async function flushMetricsToDatabase(): Promise<{
  flushed: number;
  errors: number;
}> {
  // Guard against concurrent flushes causing duplicate writes
  if (flushInProgress) return { flushed: 0, errors: 0 };
  
  const toFlush = getBufferContents().slice(0, 100);
  if (toFlush.length === 0) return { flushed: 0, errors: 0 };
  
  flushInProgress = true;
  let errors = 0;
  
  try {
    const events = toFlush.map(m => ({
      module: m.module,
      event_type: 'metric',
      data: {
        metric: m.metric,
        value: m.value,
        tags: m.tags,
      },
      created_at: m.timestamp,
    }));
    
    const { error } = await supabase.from('brain_events').insert(events);
    
    if (error) {
      errors = toFlush.length;
      // Don't try to re-insert — ring buffer still has them for next flush
    }
  } catch {
    errors = toFlush.length;
  } finally {
    flushInProgress = false;
  }
  
  return { flushed: toFlush.length - errors, errors };
}
