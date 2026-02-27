/**
 * Observability Correlation ID Propagation
 * End-to-end request tracing across module boundaries
 * 
 * Generates and propagates correlation IDs through the engine bus,
 * RIPPLE events, and edge function calls for unified trace analysis.
 */

export interface CorrelationContext {
  correlationId: string;
  parentId: string | null;
  rootId: string;
  moduleId: string;
  operation: string;
  startedAt: number;
  metadata: Record<string, string>;
}

export interface TraceSpan {
  spanId: string;
  correlationId: string;
  parentSpanId: string | null;
  moduleId: string;
  operation: string;
  startedAt: number;
  endedAt: number | null;
  durationMs: number | null;
  status: 'active' | 'completed' | 'failed';
  tags: Record<string, string>;
}

const activeContexts = new Map<string, CorrelationContext>();
const spans: TraceSpan[] = [];
let idCounter = 0;

/**
 * Generate a unique correlation ID
 */
export function generateCorrelationId(): string {
  idCounter++;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `cid-${timestamp}-${random}-${idCounter}`;
}

/**
 * Create a new correlation context (root trace)
 */
export function createContext(moduleId: string, operation: string, metadata?: Record<string, string>): CorrelationContext {
  const id = generateCorrelationId();
  const ctx: CorrelationContext = {
    correlationId: id,
    parentId: null,
    rootId: id,
    moduleId,
    operation,
    startedAt: Date.now(),
    metadata: metadata ?? {},
  };
  activeContexts.set(id, ctx);
  return ctx;
}

/**
 * Fork a child context (for cross-module calls)
 */
export function forkContext(parentCtx: CorrelationContext, moduleId: string, operation: string): CorrelationContext {
  const childId = generateCorrelationId();
  const child: CorrelationContext = {
    correlationId: childId,
    parentId: parentCtx.correlationId,
    rootId: parentCtx.rootId,
    moduleId,
    operation,
    startedAt: Date.now(),
    metadata: { ...parentCtx.metadata },
  };
  activeContexts.set(childId, child);
  return child;
}

/**
 * Start a trace span
 */
export function startSpan(ctx: CorrelationContext, operation?: string): TraceSpan {
  const span: TraceSpan = {
    spanId: generateCorrelationId(),
    correlationId: ctx.correlationId,
    parentSpanId: ctx.parentId,
    moduleId: ctx.moduleId,
    operation: operation ?? ctx.operation,
    startedAt: Date.now(),
    endedAt: null,
    durationMs: null,
    status: 'active',
    tags: {},
  };
  spans.push(span);
  return span;
}

/**
 * End a trace span
 */
export function endSpan(span: TraceSpan, status: 'completed' | 'failed' = 'completed'): TraceSpan {
  span.endedAt = Date.now();
  span.durationMs = span.endedAt - span.startedAt;
  span.status = status;
  return span;
}

/**
 * Get full trace for a correlation ID (root + all children)
 */
export function getTrace(rootId: string): TraceSpan[] {
  return spans.filter(s => {
    const ctx = activeContexts.get(s.correlationId);
    return ctx?.rootId === rootId || s.correlationId === rootId;
  });
}

/**
 * Extract headers for propagation (e.g., to edge functions)
 */
export function extractHeaders(ctx: CorrelationContext): Record<string, string> {
  return {
    'x-correlation-id': ctx.correlationId,
    'x-root-id': ctx.rootId,
    'x-parent-id': ctx.parentId ?? '',
    'x-module-id': ctx.moduleId,
  };
}

/** Get active contexts */
export function getActiveContexts(): CorrelationContext[] {
  return Array.from(activeContexts.values());
}

/** Get all spans */
export function getAllSpans(): TraceSpan[] {
  return [...spans];
}

/** Clean up completed contexts older than maxAgeMs */
export function cleanupContexts(maxAgeMs: number = 3_600_000): number {
  const cutoff = Date.now() - maxAgeMs;
  let removed = 0;
  for (const [id, ctx] of activeContexts) {
    if (ctx.startedAt < cutoff) {
      activeContexts.delete(id);
      removed++;
    }
  }
  return removed;
}
