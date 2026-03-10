/**
 * S-Tier 054 — Distributed Tracing Engine
 * CJPI: 93 | Node: OBSERVABILITY | ID: S-OBS02
 *
 * Trace context propagation across substrate module invocations.
 * Each trace is a tree of spans showing the full call graph.
 */

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  module: string;
  operation: string;
  startTime: number;
  endTime: number | null;
  status: 'ok' | 'error';
  tags: Record<string, string>;
}

const traces = new Map<string, Span[]>();
let spanSeq = 0;

function newId(): string {
  return `${++spanSeq}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function startTrace(module: string, operation: string): Span {
  const traceId = newId();
  const span: Span = {
    traceId,
    spanId: newId(),
    parentSpanId: null,
    module,
    operation,
    startTime: Date.now(),
    endTime: null,
    status: 'ok',
    tags: {},
  };
  traces.set(traceId, [span]);
  return span;
}

export function startChildSpan(parent: Span, module: string, operation: string): Span {
  const span: Span = {
    traceId: parent.traceId,
    spanId: newId(),
    parentSpanId: parent.spanId,
    module,
    operation,
    startTime: Date.now(),
    endTime: null,
    status: 'ok',
    tags: {},
  };
  const traceSpans = traces.get(parent.traceId);
  if (traceSpans) traceSpans.push(span);
  return span;
}

export function endSpan(span: Span, status: 'ok' | 'error' = 'ok'): void {
  span.endTime = Date.now();
  span.status = status;
}

export function tagSpan(span: Span, key: string, value: string): void {
  span.tags[key] = value;
}

export function getTrace(traceId: string): Span[] {
  return traces.get(traceId) ?? [];
}

export function getTraceSummary(traceId: string): {
  spanCount: number;
  totalDurationMs: number;
  modules: string[];
  hasErrors: boolean;
} {
  const spans = traces.get(traceId) ?? [];
  const root = spans.find(s => !s.parentSpanId);
  return {
    spanCount: spans.length,
    totalDurationMs: root?.endTime ? root.endTime - root.startTime : 0,
    modules: [...new Set(spans.map(s => s.module))],
    hasErrors: spans.some(s => s.status === 'error'),
  };
}
