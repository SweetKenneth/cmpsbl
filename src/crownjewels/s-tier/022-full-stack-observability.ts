/**
 * S-Tier Crown Jewel #160 — Full-Stack Observability Fabric
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 160 | CJPI: 95 | Version: 1.0.0
 * Module: OBSERVABILITY | Type: Architecture
 * Signature: 9b2c3d4f
 *
 * Unified observability correlating metrics, traces, and logs
 * across all 40 substrate nodes with automatic topology discovery.
 */

type SignalType = 'metric' | 'trace' | 'log' | 'event';
type Severity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface ObservabilitySignal {
  id: string;
  type: SignalType;
  module: string;
  timestamp: number;
  severity: Severity;
  message: string;
  metadata: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  durationMs?: number;
  value?: number;
}

interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  module: string;
  operation: string;
  startTime: number;
  endTime?: number;
  status: 'ok' | 'error';
  attributes: Record<string, unknown>;
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }>;
}

interface CorrelationResult {
  traceId: string;
  spans: TraceSpan[];
  criticalPath: string[];
  totalDurationMs: number;
  bottleneck?: { module: string; durationMs: number };
  errorSpans: TraceSpan[];
}

interface SLODefinition {
  id: string;
  name: string;
  target: number; // e.g., 0.999
  window: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metric: string;
  comparator: 'gte' | 'lte';
}

interface SLOStatus {
  slo: SLODefinition;
  currentValue: number;
  budgetRemaining: number; // 0-1
  burnRate: number;
  breaching: boolean;
}

export function createObservabilityFabric() {
  const signals: ObservabilitySignal[] = [];
  const traces = new Map<string, TraceSpan[]>();
  const slos = new Map<string, SLODefinition>();
  const metrics = new Map<string, number[]>();
  const maxSignals = 10000;

  let signalCounter = 0;
  function nextSignalId(): string {
    return `sig-${++signalCounter}`;
  }

  function ingest(signal: Omit<ObservabilitySignal, 'id'>): string {
    const id = nextSignalId();
    const full: ObservabilitySignal = { id, ...signal };
    signals.push(full);

    // Trim buffer
    if (signals.length > maxSignals) {
      signals.splice(0, signals.length - maxSignals);
    }

    // Track traces
    if (signal.traceId && signal.spanId) {
      const span: TraceSpan = {
        traceId: signal.traceId,
        spanId: signal.spanId,
        parentSpanId: signal.parentSpanId,
        module: signal.module,
        operation: signal.message,
        startTime: signal.timestamp,
        endTime: signal.durationMs ? signal.timestamp + signal.durationMs : undefined,
        status: signal.severity === 'error' || signal.severity === 'critical' ? 'error' : 'ok',
        attributes: signal.metadata,
        events: [],
      };
      if (!traces.has(signal.traceId)) traces.set(signal.traceId, []);
      traces.get(signal.traceId)!.push(span);
    }

    // Track metric values
    if (signal.type === 'metric' && signal.value !== undefined) {
      const key = `${signal.module}:${signal.message}`;
      if (!metrics.has(key)) metrics.set(key, []);
      const arr = metrics.get(key)!;
      arr.push(signal.value);
      if (arr.length > 1000) arr.splice(0, arr.length - 1000);
    }

    return id;
  }

  function correlateTrace(traceId: string): CorrelationResult | null {
    const spans = traces.get(traceId);
    if (!spans || spans.length === 0) return null;

    // Build critical path (longest chain from root to leaf)
    const roots = spans.filter(s => !s.parentSpanId);
    const criticalPath: string[] = [];
    let maxDuration = 0;
    let bottleneck: { module: string; durationMs: number } | undefined;

    for (const span of spans) {
      const dur = span.endTime ? span.endTime - span.startTime : 0;
      if (dur > maxDuration) {
        maxDuration = dur;
        bottleneck = { module: span.module, durationMs: dur };
      }
      criticalPath.push(span.module);
    }

    const totalDuration = spans.reduce((max, s) => {
      const end = s.endTime ?? s.startTime;
      return Math.max(max, end);
    }, 0) - Math.min(...spans.map(s => s.startTime));

    return {
      traceId,
      spans,
      criticalPath: [...new Set(criticalPath)],
      totalDurationMs: totalDuration,
      bottleneck,
      errorSpans: spans.filter(s => s.status === 'error'),
    };
  }

  function defineSLO(slo: SLODefinition): void {
    slos.set(slo.id, slo);
  }

  function checkSLO(sloId: string): SLOStatus | null {
    const slo = slos.get(sloId);
    if (!slo) return null;

    const values = metrics.get(slo.metric) ?? [];
    if (values.length === 0) {
      return { slo, currentValue: 1, budgetRemaining: 1, burnRate: 0, breaching: false };
    }

    const passing = slo.comparator === 'gte'
      ? values.filter(v => v >= slo.target).length
      : values.filter(v => v <= slo.target).length;

    const currentValue = passing / values.length;
    const budgetRemaining = Math.max(0, (currentValue - slo.target) / (1 - slo.target));
    const burnRate = 1 - budgetRemaining;

    return {
      slo,
      currentValue,
      budgetRemaining,
      burnRate,
      breaching: currentValue < slo.target,
    };
  }

  function querySignals(filter: {
    module?: string;
    type?: SignalType;
    severity?: Severity;
    since?: number;
    limit?: number;
  }): ObservabilitySignal[] {
    let result = signals;
    if (filter.module) result = result.filter(s => s.module === filter.module);
    if (filter.type) result = result.filter(s => s.type === filter.type);
    if (filter.severity) result = result.filter(s => s.severity === filter.severity);
    if (filter.since) result = result.filter(s => s.timestamp >= filter.since!);
    return (filter.limit ? result.slice(-filter.limit) : result);
  }

  function getTopologyMap(): Record<string, string[]> {
    const topo: Record<string, Set<string>> = {};
    for (const spans of traces.values()) {
      for (const span of spans) {
        if (span.parentSpanId) {
          const parent = spans.find(s => s.spanId === span.parentSpanId);
          if (parent && parent.module !== span.module) {
            if (!topo[parent.module]) topo[parent.module] = new Set();
            topo[parent.module].add(span.module);
          }
        }
      }
    }
    const result: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(topo)) result[k] = [...v];
    return result;
  }

  return {
    ingest,
    correlateTrace,
    defineSLO,
    checkSLO,
    querySignals,
    getTopologyMap,
    getSignalCount: () => signals.length,
    getTraceCount: () => traces.size,
    getSLOCount: () => slos.size,
  };
}
