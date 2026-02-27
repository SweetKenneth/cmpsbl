/**
 * Mesh Health Monitor — Push alerts on drift/resolution rate drops
 * Watches affinity drift, resolution rates, and latency
 */

import { supabase } from '@/integrations/supabase/client';
import { getMeshStats } from './router';
import { buildAffinityMatrix, type AffinityMatrix } from './affinity-matrix';

export interface MeshHealthAlert {
  id: string;
  type: 'drift' | 'resolution_drop' | 'latency_spike' | 'resolver_down' | 'cluster_fragmentation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  module?: string;
  metric?: number;
  threshold?: number;
  timestamp: string;
}

export interface MeshHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  alerts: MeshHealthAlert[];
  lastCheck: string;
  successRate: number;
  avgLatencyMs: number;
  activeResolvers: number;
  driftCount: number;
}

const THRESHOLDS = {
  SUCCESS_RATE_WARNING: 0.85,
  SUCCESS_RATE_CRITICAL: 0.7,
  LATENCY_WARNING_MS: 500,
  LATENCY_CRITICAL_MS: 1000,
  DRIFT_THRESHOLD: 0.15,
  CLUSTER_COHESION_MIN: 0.3,
};

let lastAlerts: MeshHealthAlert[] = [];
let listeners: Array<(alerts: MeshHealthAlert[]) => void> = [];

export function onHealthAlert(fn: (alerts: MeshHealthAlert[]) => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function emitAlerts(alerts: MeshHealthAlert[]) {
  const newAlerts = alerts.filter(a => !lastAlerts.find(la => la.id === a.id));
  if (newAlerts.length > 0) {
    lastAlerts = alerts;
    listeners.forEach(fn => fn(newAlerts));
  }
}

function makeAlert(
  type: MeshHealthAlert['type'],
  severity: MeshHealthAlert['severity'],
  title: string,
  message: string,
  extra?: Partial<MeshHealthAlert>
): MeshHealthAlert {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    type, severity, title, message,
    timestamp: new Date().toISOString(),
    ...extra,
  };
}

/**
 * Run a full health check and return status + alerts
 */
export async function checkMeshHealth(): Promise<MeshHealthStatus> {
  const alerts: MeshHealthAlert[] = [];

  // 1. Get mesh stats
  const stats = await getMeshStats();

  // 2. Check success rate
  if (stats.successRate < THRESHOLDS.SUCCESS_RATE_CRITICAL) {
    alerts.push(makeAlert('resolution_drop', 'critical',
      'Resolution Rate Critical',
      `Success rate dropped to ${(stats.successRate * 100).toFixed(0)}% (threshold: ${THRESHOLDS.SUCCESS_RATE_CRITICAL * 100}%)`,
      { metric: stats.successRate, threshold: THRESHOLDS.SUCCESS_RATE_CRITICAL }
    ));
  } else if (stats.successRate < THRESHOLDS.SUCCESS_RATE_WARNING) {
    alerts.push(makeAlert('resolution_drop', 'warning',
      'Resolution Rate Declining',
      `Success rate at ${(stats.successRate * 100).toFixed(0)}% — monitor closely`,
      { metric: stats.successRate, threshold: THRESHOLDS.SUCCESS_RATE_WARNING }
    ));
  }

  // 3. Check latency
  if (stats.avgDurationMs > THRESHOLDS.LATENCY_CRITICAL_MS) {
    alerts.push(makeAlert('latency_spike', 'critical',
      'Latency Spike Detected',
      `Average resolution latency ${stats.avgDurationMs}ms exceeds ${THRESHOLDS.LATENCY_CRITICAL_MS}ms`,
      { metric: stats.avgDurationMs, threshold: THRESHOLDS.LATENCY_CRITICAL_MS }
    ));
  } else if (stats.avgDurationMs > THRESHOLDS.LATENCY_WARNING_MS) {
    alerts.push(makeAlert('latency_spike', 'warning',
      'Elevated Latency',
      `Average resolution latency ${stats.avgDurationMs}ms exceeds warning threshold`,
      { metric: stats.avgDurationMs, threshold: THRESHOLDS.LATENCY_WARNING_MS }
    ));
  }

  // 4. Check affinity drift
  let driftCount = 0;
  let matrix: AffinityMatrix | null = null;
  try {
    matrix = await buildAffinityMatrix();
    driftCount = matrix.driftAlerts.length;

    for (const drift of matrix.driftAlerts) {
      const severity = Math.abs(drift.change) > 0.3 ? 'critical' : 'warning';
      alerts.push(makeAlert('drift', severity,
        `Affinity Drift: ${drift.moduleA}↔${drift.moduleB}`,
        `Score shifted ${drift.change > 0 ? '+' : ''}${(drift.change * 100).toFixed(0)}% (${(drift.previousScore * 100).toFixed(0)}% → ${(drift.currentScore * 100).toFixed(0)}%)`,
        { module: `${drift.moduleA}↔${drift.moduleB}`, metric: drift.change, threshold: THRESHOLDS.DRIFT_THRESHOLD }
      ));
    }

    // 5. Check cluster fragmentation
    const weakClusters = matrix.clusters.filter(c => c.cohesion < THRESHOLDS.CLUSTER_COHESION_MIN);
    if (weakClusters.length > 0) {
      alerts.push(makeAlert('cluster_fragmentation', 'info',
        'Cluster Cohesion Weakening',
        `${weakClusters.length} cluster(s) below cohesion threshold: ${weakClusters.map(c => c.name).join(', ')}`,
      ));
    }
  } catch {
    // Affinity check failed — non-blocking
  }

  // Calculate overall health score
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const score = Math.max(0, 100 - criticalCount * 25 - warningCount * 10);
  const overall = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'degraded' : 'healthy';

  emitAlerts(alerts);

  return {
    overall,
    score,
    alerts,
    lastCheck: new Date().toISOString(),
    successRate: stats.successRate,
    avgLatencyMs: stats.avgDurationMs,
    activeResolvers: stats.totalIntents > 0 ? stats.topRoutes.length : 0,
    driftCount,
  };
}
