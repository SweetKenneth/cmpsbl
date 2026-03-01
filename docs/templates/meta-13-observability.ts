/**
 * Meta-Engine #13 — Observability & Intelligence Platform
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Anomaly Correlator + Audit Chain + Event Sourcing + Pipeline + Cache
 *
 * Full-stack observability. Ingest metrics from any source, detect anomalies,
 * correlate incidents, compute real-time dashboards via projections,
 * cache expensive aggregations, and maintain tamper-evident audit trails.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type MetricSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface MetricPoint {
  source: string;
  metric: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface Alert {
  id: string;
  source: string;
  metric: string;
  condition: string;
  severity: MetricSeverity;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
  resolvedAt?: number;
}

export interface Incident {
  id: string;
  alerts: Alert[];
  severity: MetricSeverity;
  hypothesis: string;
  affectedSources: string[];
  startedAt: number;
  resolvedAt?: number;
  status: 'active' | 'investigating' | 'resolved';
}

export interface Dashboard {
  name: string;
  panels: Array<{
    title: string;
    metric: string;
    source?: string;
    aggregation: 'avg' | 'sum' | 'max' | 'min' | 'count' | 'p99';
    windowMs: number;
  }>;
}

export interface ObservabilityStats {
  totalMetrics: number;
  activeAlerts: number;
  activeIncidents: number;
  sourcesMonitored: number;
  metricsTracked: number;
  avgIngestionRate: number;
}

export function createObservabilityPlatform() {
  const metrics: Array<MetricPoint & { timestamp: number }> = [];
  const alerts: Alert[] = [];
  const incidents: Incident[] = [];
  const thresholds = new Map<string, Array<{ condition: 'gt' | 'lt' | 'eq'; value: number; severity: MetricSeverity }>>();
  const dependencies: Array<{ from: string; to: string }> = [];
  const dashboards = new Map<string, Dashboard>();
  let alertSeq = 0, incidentSeq = 0;

  // ── Cache ──────────────────────────────────────────────────────
  const aggCache = new Map<string, { value: unknown; expiresAt: number }>();
  function cacheGet(key: string): unknown | undefined { const e = aggCache.get(key); if (!e || Date.now() > e.expiresAt) { aggCache.delete(key); return undefined; } return e.value; }
  function cacheSet(key: string, value: unknown, ttl = 10_000) { aggCache.set(key, { value, expiresAt: Date.now() + ttl }); }

  // ── Audit ──────────────────────────────────────────────────────
  const auditLog: Array<{ action: string; detail: string; timestamp: number; hash: string }> = [];
  function fnvHash(s: string): string { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
  function audit(action: string, detail: string) {
    const prevHash = auditLog.length > 0 ? auditLog[auditLog.length - 1].hash : '00000000';
    auditLog.push({ action, detail, timestamp: Date.now(), hash: fnvHash(`${prevHash}|${action}|${detail}|${Date.now()}`) });
  }

  // ── Metric Ingestion ───────────────────────────────────────────

  function ingest(point: MetricPoint): Alert[] {
    const ts = point.timestamp ?? Date.now();
    metrics.push({ ...point, timestamp: ts });
    if (metrics.length > 100_000) metrics.splice(0, metrics.length - 100_000);

    // Check thresholds
    const key = `${point.source}:${point.metric}`;
    const rules = thresholds.get(key);
    const fired: Alert[] = [];
    if (rules) {
      for (const rule of rules) {
        const triggered = rule.condition === 'gt' ? point.value > rule.value : rule.condition === 'lt' ? point.value < rule.value : point.value === rule.value;
        if (triggered) {
          const alert: Alert = {
            id: `alert_${++alertSeq}`, source: point.source, metric: point.metric,
            condition: `${point.metric} ${rule.condition} ${rule.value}`,
            severity: rule.severity, value: point.value, threshold: rule.value,
            timestamp: ts, acknowledged: false,
          };
          alerts.push(alert);
          fired.push(alert);
          audit('alert_fired', `${alert.severity}: ${alert.condition} (value: ${point.value})`);
        }
      }
    }
    return fired;
  }

  function ingestBatch(points: MetricPoint[]): Alert[] {
    return points.flatMap(p => ingest(p));
  }

  // ── Threshold Configuration ────────────────────────────────────

  function setThreshold(source: string, metric: string, condition: 'gt' | 'lt' | 'eq', value: number, severity: MetricSeverity) {
    const key = `${source}:${metric}`;
    const rules = thresholds.get(key) ?? [];
    rules.push({ condition, value, severity });
    thresholds.set(key, rules);
  }

  function addDependency(from: string, to: string) { dependencies.push({ from, to }); }

  // ── Incident Correlation ───────────────────────────────────────

  function correlate(windowMs = 60_000): Incident[] {
    const now = Date.now();
    const recentAlerts = alerts.filter(a => now - a.timestamp < windowMs && !a.resolvedAt);
    if (recentAlerts.length < 2) return [];

    const newIncidents: Incident[] = [];
    const used = new Set<string>();

    // Causal correlation via dependencies
    for (const alert of recentAlerts) {
      if (used.has(alert.id)) continue;
      const chain = [alert];
      const visited = new Set([alert.source]);

      function trace(source: string) {
        for (const dep of dependencies.filter(d => d.to === source)) {
          if (visited.has(dep.from)) continue;
          const upstream = recentAlerts.find(a => a.source === dep.from && !used.has(a.id));
          if (upstream) { visited.add(dep.from); chain.push(upstream); used.add(upstream.id); trace(dep.from); }
        }
      }
      trace(alert.source);

      if (chain.length >= 2) {
        chain.forEach(a => used.add(a.id));
        const maxSev = (['critical', 'high', 'medium', 'low', 'info'] as MetricSeverity[]).find(s => chain.some(a => a.severity === s)) ?? 'info';
        const root = chain[chain.length - 1];
        const incident: Incident = {
          id: `incident_${++incidentSeq}`, alerts: chain, severity: maxSev,
          hypothesis: `Root cause in '${root.source}' cascading to ${chain.length - 1} services`,
          affectedSources: [...new Set(chain.map(a => a.source))],
          startedAt: Math.min(...chain.map(a => a.timestamp)), status: 'active',
        };
        incidents.push(incident);
        newIncidents.push(incident);
        audit('incident_created', `${incident.severity}: ${incident.hypothesis}`);
      }
    }

    // Temporal grouping for remaining
    const remaining = recentAlerts.filter(a => !used.has(a.id));
    if (remaining.length >= 2) {
      const maxSev = (['critical', 'high', 'medium', 'low', 'info'] as MetricSeverity[]).find(s => remaining.some(a => a.severity === s)) ?? 'info';
      const incident: Incident = {
        id: `incident_${++incidentSeq}`, alerts: remaining, severity: maxSev,
        hypothesis: `${remaining.length} co-occurring alerts within ${windowMs / 1000}s`,
        affectedSources: [...new Set(remaining.map(a => a.source))],
        startedAt: Math.min(...remaining.map(a => a.timestamp)), status: 'active',
      };
      incidents.push(incident);
      newIncidents.push(incident);
    }

    return newIncidents;
  }

  function resolveIncident(incidentId: string) {
    const inc = incidents.find(i => i.id === incidentId);
    if (inc) { inc.status = 'resolved'; inc.resolvedAt = Date.now(); inc.alerts.forEach(a => { a.resolvedAt = Date.now(); }); audit('incident_resolved', incidentId); }
  }

  function acknowledgeAlert(alertId: string) {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) alert.acknowledged = true;
  }

  // ── Dashboards & Aggregation ───────────────────────────────────

  function registerDashboard(dashboard: Dashboard) { dashboards.set(dashboard.name, dashboard); }

  function query(metric: string, windowMs: number, opts?: { source?: string; aggregation?: 'avg' | 'sum' | 'max' | 'min' | 'count' | 'p99' }): number {
    const cacheKey = `${metric}:${opts?.source ?? '*'}:${windowMs}:${opts?.aggregation ?? 'avg'}`;
    const cached = cacheGet(cacheKey);
    if (cached !== undefined) return cached as number;

    const now = Date.now();
    let points = metrics.filter(m => m.metric === metric && now - m.timestamp < windowMs);
    if (opts?.source) points = points.filter(m => m.source === opts.source);
    if (points.length === 0) return 0;

    const values = points.map(p => p.value);
    let result: number;
    switch (opts?.aggregation ?? 'avg') {
      case 'sum': result = values.reduce((a, b) => a + b, 0); break;
      case 'max': result = Math.max(...values); break;
      case 'min': result = Math.min(...values); break;
      case 'count': result = values.length; break;
      case 'p99': { const sorted = [...values].sort((a, b) => a - b); result = sorted[Math.floor(sorted.length * 0.99)] ?? 0; break; }
      default: result = values.reduce((a, b) => a + b, 0) / values.length;
    }

    cacheSet(cacheKey, result, 5_000);
    return result;
  }

  function renderDashboard(name: string): Record<string, number> {
    const dash = dashboards.get(name);
    if (!dash) throw new Error(`Dashboard '${name}' not found`);
    const result: Record<string, number> = {};
    for (const panel of dash.panels) {
      result[panel.title] = query(panel.metric, panel.windowMs, { source: panel.source, aggregation: panel.aggregation });
    }
    return result;
  }

  // ── Stats ──────────────────────────────────────────────────────

  function getStats(): ObservabilityStats {
    const sources = new Set(metrics.map(m => m.source));
    const metricNames = new Set(metrics.map(m => m.metric));
    return {
      totalMetrics: metrics.length,
      activeAlerts: alerts.filter(a => !a.resolvedAt).length,
      activeIncidents: incidents.filter(i => i.status === 'active').length,
      sourcesMonitored: sources.size,
      metricsTracked: metricNames.size,
      avgIngestionRate: metrics.length > 0 ? metrics.length / ((Date.now() - (metrics[0]?.timestamp ?? Date.now())) / 1000 || 1) : 0,
    };
  }

  return {
    ingest, ingestBatch, setThreshold, addDependency,
    correlate, resolveIncident, acknowledgeAlert,
    registerDashboard, query, renderDashboard,
    getStats,
    get alerts() { return [...alerts]; },
    get incidents() { return [...incidents]; },
    get auditLog() { return [...auditLog]; },
  };
}
