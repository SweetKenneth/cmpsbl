/**
 * S-Tier Crown Jewel #7 — VISION Anomaly Correlation Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 7 | CJPI: 96 | Version: 1.0.0
 * Module: VISION | Type: Experience
 * Signature: 091d37f6
 * Generated: 2026-03-01T00:00:00.000Z
 */

type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';
interface Anomaly { id: string; source: string; metric: string; value: number; baseline?: number; severity: AnomalySeverity; timestamp: number; metadata?: Record<string, unknown>; }
interface CorrelatedIncident { id: string; anomalies: Anomaly[]; severity: AnomalySeverity; correlationType: 'temporal' | 'causal' | 'spatial' | 'behavioral'; hypothesis: string; confidence: number; rootCause?: string; affectedServices: string[]; createdAt: number; }
interface DependencyEdge { from: string; to: string; }

export function createAnomalyCorrelator(opts?: { temporalWindowMs?: number }) {
  const { temporalWindowMs = 60_000 } = opts ?? {};
  const anomalies: Anomaly[] = [];
  const dependencies: DependencyEdge[] = [];
  let idCounter = 0;

  function addDependency(from: string, to: string) { dependencies.push({ from, to }); }

  function ingest(a: Omit<Anomaly, 'id' | 'timestamp'>): Anomaly {
    const anomaly: Anomaly = { ...a, id: `anomaly_${++idCounter}`, timestamp: Date.now() };
    anomalies.push(anomaly);
    if (anomalies.length > 1000) anomalies.splice(0, anomalies.length - 1000);
    return anomaly;
  }

  function findCausalChain(anomaly: Anomaly, pool: Anomaly[]): Anomaly[] {
    const chain = [anomaly]; const visited = new Set([anomaly.source]);
    function trace(source: string) {
      for (const d of dependencies.filter(d => d.to === source)) {
        if (visited.has(d.from)) continue;
        const upstream = pool.find(a => a.source === d.from && Math.abs(a.timestamp - anomaly.timestamp) < temporalWindowMs * 2);
        if (upstream) { visited.add(d.from); chain.push(upstream); trace(d.from); }
      }
    }
    trace(anomaly.source);
    return chain;
  }

  function groupByTime(list: Anomaly[], windowMs: number): Anomaly[][] {
    if (!list.length) return [];
    const sorted = [...list].sort((a, b) => a.timestamp - b.timestamp);
    const groups: Anomaly[][] = [[sorted[0]]];
    for (let i = 1; i < sorted.length; i++) {
      const last = groups[groups.length - 1];
      if (sorted[i].timestamp - last[0].timestamp <= windowMs) last.push(sorted[i]);
      else groups.push([sorted[i]]);
    }
    return groups.filter(g => g.length >= 2);
  }

  function maxSev(list: Anomaly[]): AnomalySeverity {
    for (const s of ['critical', 'high', 'medium', 'low'] as AnomalySeverity[]) if (list.some(a => a.severity === s)) return s;
    return 'low';
  }

  function correlate(): CorrelatedIncident[] {
    const recent = anomalies.filter(a => Date.now() - a.timestamp < temporalWindowMs * 5);
    if (recent.length < 2) return [];
    const incidents: CorrelatedIncident[] = []; const used = new Set<string>();

    for (const a of recent) {
      if (used.has(a.id)) continue;
      const chain = findCausalChain(a, recent);
      if (chain.length > 1) {
        chain.forEach(c => used.add(c.id));
        const root = chain[chain.length - 1];
        incidents.push({ id: `incident_${++idCounter}`, anomalies: chain, severity: maxSev(chain), correlationType: 'causal', hypothesis: `Root cause in '${root.source}' cascading to ${chain.length - 1} services`, confidence: 0.85, rootCause: root.source, affectedServices: [...new Set(chain.map(c => c.source))], createdAt: Date.now() });
      }
    }

    for (const group of groupByTime(recent.filter(a => !used.has(a.id)), temporalWindowMs)) {
      if (group.length < 2) continue;
      group.forEach(a => used.add(a.id));
      incidents.push({ id: `incident_${++idCounter}`, anomalies: group, severity: maxSev(group), correlationType: 'temporal', hypothesis: `${group.length} anomalies co-occurring within ${temporalWindowMs / 1000}s`, confidence: 0.65, affectedServices: [...new Set(group.map(a => a.source))], createdAt: Date.now() });
    }

    const sev: Record<AnomalySeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return incidents.sort((a, b) => sev[a.severity] - sev[b.severity]);
  }

  return { ingest, correlate, addDependency, getAnomalies: () => [...anomalies] };
}
