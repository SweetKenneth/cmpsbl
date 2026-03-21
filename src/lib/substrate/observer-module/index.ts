/**
 * OBSERVER — The Watchdog (Node 27)
 * Production-ready observability, telemetry aggregation, anomaly detection,
 * watchdog monitoring, and alert management.
 */

import { log } from '@/lib/system/log';
import { generateTraceId } from '@/lib/system/trace';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Telemetry Aggregation
// ═══════════════════════════════════════════════════════════════════════════════

export interface TelemetrySnapshot {
  module: string;
  metrics: Record<string, number>;
  anomalies: AnomalyFlag[];
  sampledAt: string;
}

export interface AnomalyFlag {
  module: string;
  metric: string;
  value: number;
  threshold: number;
  zScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertCondition {
  id: string;
  module: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  silencedUntil?: number;
  lastTriggeredAt?: number;
  triggerCount: number;
}

export interface WatchdogReport {
  status: 'healthy' | 'degraded' | 'critical';
  activeAlerts: AlertCondition[];
  silencedAlerts: number;
  modulesMonitored: number;
  lastSweepAt: string;
  healthScoreByModule: Record<string, number>;
  escalationQueue: EscalationEntry[];
}

export interface EscalationEntry {
  alertId: string;
  module: string;
  reason: string;
  escalatedAt: string;
  acknowledged: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Rolling Telemetry Buffer
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_TELEMETRY_ENTRIES = 500;
const telemetryBuffer: TelemetrySnapshot[] = [];
const alertConditions: AlertCondition[] = [];
const escalationQueue: EscalationEntry[] = [];

/** Ingest a new telemetry snapshot from any module */
export function ingestTelemetry(snapshot: TelemetrySnapshot): void {
  telemetryBuffer.push(snapshot);
  if (telemetryBuffer.length > MAX_TELEMETRY_ENTRIES) {
    telemetryBuffer.shift();
  }
  // Run anomaly detection on ingest
  const anomalies = detectAnomalies(snapshot);
  if (anomalies.length > 0) {
    snapshot.anomalies = anomalies;
    evaluateAlerts(snapshot.module, snapshot.metrics);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Statistical Anomaly Detection (Z-Score based)
// ═══════════════════════════════════════════════════════════════════════════════

function detectAnomalies(snapshot: TelemetrySnapshot): AnomalyFlag[] {
  const anomalies: AnomalyFlag[] = [];
  const recentForModule = telemetryBuffer
    .filter(t => t.module === snapshot.module)
    .slice(-50); // Last 50 readings

  if (recentForModule.length < 5) return anomalies; // Not enough data

  for (const [metric, value] of Object.entries(snapshot.metrics)) {
    const historicalValues = recentForModule
      .map(t => t.metrics[metric])
      .filter((v): v is number => v !== undefined);

    if (historicalValues.length < 5) continue;

    const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
    const variance = historicalValues.reduce((a, b) => a + (b - mean) ** 2, 0) / historicalValues.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) continue;

    const zScore = Math.abs((value - mean) / stdDev);

    if (zScore > 2) {
      const severity: AnomalyFlag['severity'] =
        zScore > 4 ? 'critical' : zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low';

      anomalies.push({
        module: snapshot.module,
        metric,
        value,
        threshold: mean + 2 * stdDev,
        zScore: Math.round(zScore * 100) / 100,
        severity,
      });
    }
  }

  return anomalies;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Alert Management
// ═══════════════════════════════════════════════════════════════════════════════

export function registerAlert(condition: Omit<AlertCondition, 'triggerCount' | 'lastTriggeredAt'>): void {
  const existing = alertConditions.find(a => a.id === condition.id);
  if (existing) {
    Object.assign(existing, condition);
  } else {
    alertConditions.push({ ...condition, triggerCount: 0 });
  }
}

export function silenceAlert(alertId: string, durationMs: number): boolean {
  const alert = alertConditions.find(a => a.id === alertId);
  if (!alert) return false;
  alert.silencedUntil = Date.now() + durationMs;
  return true;
}

function evaluateAlerts(module: string, metrics: Record<string, number>): void {
  const now = Date.now();
  for (const alert of alertConditions) {
    if (alert.module !== module && alert.module !== '*') continue;
    if (alert.silencedUntil && now < alert.silencedUntil) continue;

    const value = metrics[alert.metric];
    if (value === undefined) continue;

    let triggered = false;
    switch (alert.operator) {
      case '>': triggered = value > alert.threshold; break;
      case '<': triggered = value < alert.threshold; break;
      case '>=': triggered = value >= alert.threshold; break;
      case '<=': triggered = value <= alert.threshold; break;
      case '==': triggered = value === alert.threshold; break;
    }

    if (triggered) {
      alert.triggerCount++;
      alert.lastTriggeredAt = now;

      // Auto-escalate after 3 triggers
      if (alert.triggerCount >= 3 && alert.severity === 'critical') {
        escalationQueue.push({
          alertId: alert.id,
          module: alert.module,
          reason: `${alert.metric} ${alert.operator} ${alert.threshold} triggered ${alert.triggerCount}× (value: ${value})`,
          escalatedAt: new Date().toISOString(),
          acknowledged: false,
        });
        log.warn('observer', `Escalation: ${alert.id} for ${module}`, { value, threshold: alert.threshold });
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — Watchdog Sweep
// ═══════════════════════════════════════════════════════════════════════════════

let lastSweepAt = new Date().toISOString();

export function runWatchdogSweep(): WatchdogReport {
  const traceId = generateTraceId();
  lastSweepAt = new Date().toISOString();

  const now = Date.now();
  const activeAlerts = alertConditions.filter(a =>
    a.lastTriggeredAt && (now - a.lastTriggeredAt < 300_000) && // Triggered in last 5min
    (!a.silencedUntil || now >= a.silencedUntil)
  );
  const silencedAlerts = alertConditions.filter(a => a.silencedUntil && now < a.silencedUntil).length;

  // Compute health score per module from recent telemetry
  const moduleScores: Record<string, number> = {};
  const recentModules = new Set(telemetryBuffer.slice(-100).map(t => t.module));
  for (const mod of recentModules) {
    const recent = telemetryBuffer.filter(t => t.module === mod).slice(-20);
    const anomalyCount = recent.reduce((sum, t) => sum + (t.anomalies?.length || 0), 0);
    const score = Math.max(0, Math.min(100, 100 - anomalyCount * 10));
    moduleScores[mod] = score;
  }

  const overallStatus: WatchdogReport['status'] =
    activeAlerts.some(a => a.severity === 'critical') ? 'critical' :
    activeAlerts.length > 0 ? 'degraded' : 'healthy';

  log.debug('observer', `Watchdog sweep: ${overallStatus}`, { activeAlerts: activeAlerts.length }, traceId);

  return {
    status: overallStatus,
    activeAlerts,
    silencedAlerts,
    modulesMonitored: recentModules.size,
    lastSweepAt,
    healthScoreByModule: moduleScores,
    escalationQueue: escalationQueue.filter(e => !e.acknowledged),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — Telemetry Summary Resolver
// ═══════════════════════════════════════════════════════════════════════════════

export interface TelemetrySummary {
  totalSnapshots: number;
  modulesTracked: string[];
  recentAnomalies: AnomalyFlag[];
  metricTrends: Record<string, { current: number; avg: number; trend: 'rising' | 'falling' | 'stable' }>;
  alertCount: number;
}

export function getTelemetrySummary(moduleFilter?: string): TelemetrySummary {
  const filtered = moduleFilter
    ? telemetryBuffer.filter(t => t.module === moduleFilter)
    : telemetryBuffer;

  const recent = filtered.slice(-50);
  const modules = [...new Set(filtered.map(t => t.module))];

  // Aggregate recent anomalies
  const recentAnomalies = recent.flatMap(t => t.anomalies || []).slice(-20);

  // Compute metric trends from last 20 samples
  const metricTrends: TelemetrySummary['metricTrends'] = {};
  if (recent.length >= 4) {
    const allMetrics = new Set(recent.flatMap(t => Object.keys(t.metrics)));
    for (const metric of allMetrics) {
      const values = recent.map(t => t.metrics[metric]).filter((v): v is number => v !== undefined);
      if (values.length < 4) continue;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const current = values[values.length - 1];
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const delta = (secondAvg - firstAvg) / (firstAvg || 1);
      const trend: 'rising' | 'falling' | 'stable' =
        delta > 0.05 ? 'rising' : delta < -0.05 ? 'falling' : 'stable';
      metricTrends[metric] = { current, avg: Math.round(avg * 100) / 100, trend };
    }
  }

  return {
    totalSnapshots: filtered.length,
    modulesTracked: modules,
    recentAnomalies,
    metricTrends,
    alertCount: alertConditions.filter(a => a.lastTriggeredAt && (Date.now() - a.lastTriggeredAt < 300_000)).length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — Acknowledge Escalation
// ═══════════════════════════════════════════════════════════════════════════════

export function acknowledgeEscalation(alertId: string): boolean {
  const entry = escalationQueue.find(e => e.alertId === alertId && !e.acknowledged);
  if (!entry) return false;
  entry.acknowledged = true;
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — Reset (for testing)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetObserver(): void {
  telemetryBuffer.length = 0;
  alertConditions.length = 0;
  escalationQueue.length = 0;
}
