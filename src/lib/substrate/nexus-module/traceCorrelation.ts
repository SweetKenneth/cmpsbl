/**
 * NEXUS — Trace Correlation Engine
 * End-to-end request tracing from intent → NEXUS → provider → response.
 */

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  providerId?: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: 'active' | 'success' | 'error';
  metadata: Record<string, unknown>;
  tags: string[];
}

export interface TraceContext {
  traceId: string;
  spans: TraceSpan[];
  rootOperation: string;
  startTime: number;
  endTime?: number;
  totalDurationMs?: number;
  status: 'active' | 'completed' | 'failed';
}

const activeTraces = new Map<string, TraceContext>();
const completedTraces: TraceContext[] = [];
const MAX_COMPLETED = 500;
let spanCounter = 0;

function generateId(): string {
  return `${Date.now().toString(36)}-${(++spanCounter).toString(36)}`;
}

export function startTrace(operation: string, metadata?: Record<string, unknown>): TraceContext {
  const traceId = `trace-${generateId()}`;
  const rootSpan: TraceSpan = {
    traceId,
    spanId: `span-${generateId()}`,
    operation,
    startTime: Date.now(),
    status: 'active',
    metadata: metadata ?? {},
    tags: ['root'],
  };

  const ctx: TraceContext = {
    traceId,
    spans: [rootSpan],
    rootOperation: operation,
    startTime: Date.now(),
    status: 'active',
  };

  activeTraces.set(traceId, ctx);
  return ctx;
}

export function addSpan(
  traceId: string,
  operation: string,
  options?: { parentSpanId?: string; providerId?: string; metadata?: Record<string, unknown>; tags?: string[] }
): TraceSpan | null {
  const ctx = activeTraces.get(traceId);
  if (!ctx) return null;

  const span: TraceSpan = {
    traceId,
    spanId: `span-${generateId()}`,
    parentSpanId: options?.parentSpanId,
    operation,
    providerId: options?.providerId,
    startTime: Date.now(),
    status: 'active',
    metadata: options?.metadata ?? {},
    tags: options?.tags ?? [],
  };

  ctx.spans.push(span);
  return span;
}

export function completeSpan(
  traceId: string,
  spanId: string,
  status: 'success' | 'error' = 'success',
  metadata?: Record<string, unknown>
): void {
  const ctx = activeTraces.get(traceId);
  if (!ctx) return;

  const span = ctx.spans.find(s => s.spanId === spanId);
  if (!span) return;

  span.endTime = Date.now();
  span.durationMs = span.endTime - span.startTime;
  span.status = status;
  if (metadata) Object.assign(span.metadata, metadata);
}

export function completeTrace(traceId: string, status: 'completed' | 'failed' = 'completed'): TraceContext | null {
  const ctx = activeTraces.get(traceId);
  if (!ctx) return null;

  ctx.endTime = Date.now();
  ctx.totalDurationMs = ctx.endTime - ctx.startTime;
  ctx.status = status;

  // Close any active spans
  for (const span of ctx.spans) {
    if (span.status === 'active') {
      span.endTime = Date.now();
      span.durationMs = span.endTime - span.startTime;
      span.status = status === 'completed' ? 'success' : 'error';
    }
  }

  activeTraces.delete(traceId);
  completedTraces.push(ctx);
  if (completedTraces.length > MAX_COMPLETED) completedTraces.shift();

  return ctx;
}

export function getTrace(traceId: string): TraceContext | undefined {
  return activeTraces.get(traceId) ??
    completedTraces.find(t => t.traceId === traceId);
}

export function getRecentTraces(count = 20): TraceContext[] {
  return completedTraces.slice(-count);
}

export function getActiveTraceCount(): number {
  return activeTraces.size;
}

export function getTracesByProvider(providerId: string, count = 20): TraceContext[] {
  return completedTraces
    .filter(t => t.spans.some(s => s.providerId === providerId))
    .slice(-count);
}
