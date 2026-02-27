/**
 * CMPSBL Nexus Metrics
 * Performance tracking and system health monitoring
 *
 * 
 * Respects debugMode — when enabled, metrics recording and flushing is skipped
 */

import { supabase } from '@/integrations/supabase/client';
import { debugMode } from '@/lib/debug-mode';
import { secureGet, secureSet, secureRemove } from '@/lib/system/secureStorage';

interface Metric {
  name: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

// In-memory metrics buffer
let metricsBuffer: Metric[] = [];
const BUFFER_FLUSH_INTERVAL = 5000; // Flush every 5 seconds
const MAX_BUFFER_SIZE = 100;

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metricsBuffer = [];
  try {
    secureRemove('nexus_metrics');
  } catch (error) {
    console.warn('[Metrics] Failed to clear stored metrics:', error);
  }
}

/**
 * Record a metric event
 */
export async function recordMetric(
  name: string,
  metadata?: Record<string, any>
): Promise<void> {
  // Skip if debug mode is active
  if (!debugMode.allowMetrics()) {
    return;
  }
  
  const metric: Metric = {
    name,
    value: 1,
    metadata,
    timestamp: Date.now(),
  };

  metricsBuffer.push(metric);

  // Auto-flush if buffer is full
  if (metricsBuffer.length >= MAX_BUFFER_SIZE) {
    await flushMetrics();
  }
}

/**
 * Flush metrics buffer to storage
 */
export async function flushMetrics(): Promise<void> {
  // Skip if debug mode is active
  if (!debugMode.allowMetrics()) {
    return;
  }
  
  if (metricsBuffer.length === 0) return;

  const batch = [...metricsBuffer];
  metricsBuffer.length = 0;

  try {
    const existing = secureGet<Metric[]>('nexus_metrics') || [];
    secureSet('nexus_metrics', [...existing, ...batch].slice(-1000));
  } catch (error) {
    console.error('[Metrics] Failed to flush metrics:', error);
  }
}

/**
 * Get system metrics summary
 */
export async function getMetricsSummary(timeRange: number = 3600000) {
  const metrics = secureGet<Metric[]>('nexus_metrics');
  if (!metrics || metrics.length === 0) return null;
  const now = Date.now();
  const recent = metrics.filter(m => now - m.timestamp < timeRange);

  const summary = {
    total_calls: recent.filter(m => m.name === 'ai_request_completed').length,
    cache_hits: recent.filter(m => m.name === 'cache_hit').length,
    failures: recent.filter(m => m.name === 'ai_request_failed').length,
    avg_latency: calculateAvgLatency(recent),
    requests_by_type: groupByType(recent),
  };

  return summary;
}

function calculateAvgLatency(metrics: Metric[]): number {
  const completed = metrics.filter(m => m.name === 'ai_request_completed' && m.metadata?.latency);
  if (completed.length === 0) return 0;
  
  const sum = completed.reduce((acc, m) => acc + (m.metadata?.latency || 0), 0);
  return sum / completed.length;
}

function groupByType(metrics: Metric[]): Record<string, number> {
  const grouped: Record<string, number> = {};
  
  metrics.forEach(m => {
    const type = m.metadata?.type || 'unknown';
    grouped[type] = (grouped[type] || 0) + 1;
  });

  return grouped;
}

/**
 * Initialize periodic metric flushing
 */
export function startMetricsCollection(): () => void {
  const interval = setInterval(() => {
    if (debugMode.allowMetrics()) {
      flushMetrics();
    }
  }, BUFFER_FLUSH_INTERVAL);
  return () => clearInterval(interval);
}
