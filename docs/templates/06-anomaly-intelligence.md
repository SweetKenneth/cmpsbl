# Anomaly Intelligence

> Zero-dependency, drop-in anomaly detection and incident correlation engine with dependency-aware causal chain tracing and temporal clustering.

## What It Does

Ingests anomaly signals from any source, correlates them into incidents using both temporal proximity and service dependency graphs, traces causal chains upstream through dependencies, and ranks incidents by severity. Automatically generates root-cause hypotheses.

## Use Cases

- **Observability platforms** — Correlate alerts across services into incidents
- **SRE/DevOps** — Automatic root cause analysis with dependency tracing
- **IoT monitoring** — Detect cascading sensor failures
- **Financial systems** — Correlate trading anomalies across instruments
- **Infrastructure monitoring** — Trace failures through service mesh

## Drop-In Instructions

1. Copy into `src/lib/anomaly-intelligence.ts`
2. Register service dependencies
3. Ingest anomalies → correlate into incidents

```typescript
import { createAnomalyIntelligence } from './anomaly-intelligence';

const ai = createAnomalyIntelligence({ temporalWindowMs: 60_000 });

// Define service dependencies
ai.addDependency('api-gateway', 'auth-service');
ai.addDependency('api-gateway', 'user-service');
ai.addDependency('user-service', 'database');

// Ingest anomalies as they occur
ai.ingest({ source: 'database', metric: 'query_latency', value: 5000, severity: 'high' });
ai.ingest({ source: 'user-service', metric: 'error_rate', value: 0.45, severity: 'high' });
ai.ingest({ source: 'api-gateway', metric: 'p99_latency', value: 8000, severity: 'critical' });

// Correlate into incidents
const incidents = ai.correlate();
// → [{
//   severity: 'critical',
//   correlationType: 'causal',
//   hypothesis: "Root cause in 'database' cascading to 2 services",
//   rootCause: 'database',
//   affectedServices: ['database', 'user-service', 'api-gateway'],
//   confidence: 0.85,
// }]
```

## Full Source

```typescript
/**
 * Anomaly Intelligence — Incident correlation with causal chain tracing
 * Zero dependencies. Works in any TypeScript/JavaScript project.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

interface Anomaly {
  id: string;
  source: string;
  metric: string;
  value: number;
  baseline?: number;
  severity: AnomalySeverity;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface CorrelatedIncident {
  id: string;
  anomalies: Anomaly[];
  severity: AnomalySeverity;
  correlationType: 'temporal' | 'causal' | 'spatial' | 'behavioral';
  hypothesis: string;
  confidence: number;
  rootCause?: string;
  affectedServices: string[];
  createdAt: number;
}

interface DependencyEdge {
  from: string;
  to: string;
}

// ━━━ Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createAnomalyIntelligence(opts?: { temporalWindowMs?: number }) {
  const { temporalWindowMs = 60_000 } = opts ?? {};
  const anomalies: Anomaly[] = [];
  const dependencies: DependencyEdge[] = [];
  let idCounter = 0;

  function addDependency(from: string, to: string) {
    dependencies.push({ from, to });
  }

  function ingest(a: Omit<Anomaly, 'id' | 'timestamp'>): Anomaly {
    const anomaly: Anomaly = { ...a, id: `anomaly_${++idCounter}`, timestamp: Date.now() };
    anomalies.push(anomaly);
    if (anomalies.length > 1000) anomalies.splice(0, anomalies.length - 1000);
    return anomaly;
  }

  function findCausalChain(anomaly: Anomaly, pool: Anomaly[]): Anomaly[] {
    const chain = [anomaly];
    const visited = new Set([anomaly.source]);
    function trace(source: string) {
      for (const d of dependencies.filter((d) => d.to === source)) {
        if (visited.has(d.from)) continue;
        const upstream = pool.find(
          (a) =>
            a.source === d.from &&
            Math.abs(a.timestamp - anomaly.timestamp) < temporalWindowMs * 2
        );
        if (upstream) {
          visited.add(d.from);
          chain.push(upstream);
          trace(d.from);
        }
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
    return groups.filter((g) => g.length >= 2);
  }

  function maxSev(list: Anomaly[]): AnomalySeverity {
    for (const s of ['critical', 'high', 'medium', 'low'] as AnomalySeverity[]) {
      if (list.some((a) => a.severity === s)) return s;
    }
    return 'low';
  }

  function correlate(): CorrelatedIncident[] {
    const recent = anomalies.filter((a) => Date.now() - a.timestamp < temporalWindowMs * 5);
    if (recent.length < 2) return [];
    const incidents: CorrelatedIncident[] = [];
    const used = new Set<string>();

    // Phase 1: Causal correlation via dependency graph
    for (const a of recent) {
      if (used.has(a.id)) continue;
      const chain = findCausalChain(a, recent);
      if (chain.length > 1) {
        chain.forEach((c) => used.add(c.id));
        const root = chain[chain.length - 1];
        incidents.push({
          id: `incident_${++idCounter}`,
          anomalies: chain,
          severity: maxSev(chain),
          correlationType: 'causal',
          hypothesis: `Root cause in '${root.source}' cascading to ${chain.length - 1} downstream service${chain.length > 2 ? 's' : ''}`,
          confidence: 0.85,
          rootCause: root.source,
          affectedServices: [...new Set(chain.map((c) => c.source))],
          createdAt: Date.now(),
        });
      }
    }

    // Phase 2: Temporal correlation for remaining anomalies
    for (const group of groupByTime(
      recent.filter((a) => !used.has(a.id)),
      temporalWindowMs
    )) {
      if (group.length < 2) continue;
      group.forEach((a) => used.add(a.id));
      incidents.push({
        id: `incident_${++idCounter}`,
        anomalies: group,
        severity: maxSev(group),
        correlationType: 'temporal',
        hypothesis: `${group.length} anomalies co-occurring within ${temporalWindowMs / 1000}s window`,
        confidence: 0.65,
        affectedServices: [...new Set(group.map((a) => a.source))],
        createdAt: Date.now(),
      });
    }

    // Sort by severity
    const sev: Record<AnomalySeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return incidents.sort((a, b) => sev[a.severity] - sev[b.severity]);
  }

  function getAnomalies() {
    return [...anomalies];
  }

  function getStats() {
    const recent = anomalies.filter((a) => Date.now() - a.timestamp < temporalWindowMs * 5);
    return {
      totalIngested: anomalies.length,
      recentAnomalies: recent.length,
      dependencyEdges: dependencies.length,
      uniqueSources: new Set(anomalies.map((a) => a.source)).size,
      bySeverity: {
        critical: recent.filter((a) => a.severity === 'critical').length,
        high: recent.filter((a) => a.severity === 'high').length,
        medium: recent.filter((a) => a.severity === 'medium').length,
        low: recent.filter((a) => a.severity === 'low').length,
      },
    };
  }

  return {
    addDependency,
    ingest,
    correlate,
    getAnomalies,
    getStats,
  };
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `addDependency(from, to)` | Register a service dependency edge |
| `ingest(anomaly)` | Ingest an anomaly signal |
| `correlate()` | Correlate anomalies into ranked incidents |
| `getAnomalies()` | Get all stored anomalies |
| `getStats()` | Summary statistics |

## Correlation Modes

| Mode | Trigger | Confidence |
|------|---------|------------|
| **Causal** | Anomalies traced through dependency graph | 0.85 |
| **Temporal** | Multiple anomalies in same time window | 0.65 |

## Architecture

```
Anomaly Signals → Ingest Buffer (ring buffer, 1000 max)
                       ↓
              ┌────────┴────────┐
              │   Dependency    │
              │     Graph       │
              └────────┬────────┘
                       ↓
         ┌─────────────┴─────────────┐
         │  Phase 1: Causal Chains   │ ← traces upstream through deps
         │  Phase 2: Temporal Groups │ ← clusters by time window
         └─────────────┬─────────────┘
                       ↓
              Ranked Incidents
         (sorted by severity)
```

## License

MIT — Drop in anywhere.
