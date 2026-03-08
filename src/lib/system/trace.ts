/**
 * Request Tracing System
 * Distributed tracing for substrate operations
 */

// Trace ID format: valid UUID v4 (required by brain_events table)
export function generateTraceId(): string {
  return crypto.randomUUID();
}

export interface TraceContext {
  trace_id: string;
  parent_span_id?: string;
  span_id: string;
  module?: string;
  action?: string;
  started_at: string;
  metadata?: Record<string, unknown>;
}

// Global trace context store (per-request in async context)
const traceStore = new Map<string, TraceContext>();
const MAX_TRACES = 500;

export function createTraceContext(
  module?: string,
  action?: string,
  parentTraceId?: string
): TraceContext {
  const context: TraceContext = {
    trace_id: parentTraceId || generateTraceId(),
    span_id: generateSpanId(),
    parent_span_id: parentTraceId ? getContext(parentTraceId)?.span_id : undefined,
    module,
    action,
    started_at: new Date().toISOString(),
  };

  traceStore.set(context.trace_id, context);
  return context;
}

export function generateSpanId(): string {
  return Math.random().toString(16).slice(2, 18);
}

export function getContext(traceId: string): TraceContext | undefined {
  return traceStore.get(traceId);
}

export function updateContext(traceId: string, updates: Partial<TraceContext>): void {
  const existing = traceStore.get(traceId);
  if (existing) {
    traceStore.set(traceId, { ...existing, ...updates });
  }
}

export function endContext(traceId: string): TraceContext | undefined {
  const context = traceStore.get(traceId);
  traceStore.delete(traceId);
  return context;
}

// Cleanup old traces (run periodically)
export function cleanupOldTraces(maxAgeMs: number = 300000): number {
  const cutoff = Date.now() - maxAgeMs;
  let cleaned = 0;

  for (const [traceId, context] of traceStore.entries()) {
    const startedAt = new Date(context.started_at).getTime();
    if (startedAt < cutoff) {
      traceStore.delete(traceId);
      cleaned++;
    }
  }

  return cleaned;
}

// Helper to wrap async operations with tracing
export async function withTrace<T>(
  module: string,
  action: string,
  fn: (ctx: TraceContext) => Promise<T>,
  parentTraceId?: string
): Promise<T> {
  const ctx = createTraceContext(module, action, parentTraceId);
  
  try {
    const result = await fn(ctx);
    return result;
  } finally {
    endContext(ctx.trace_id);
  }
}

// Extract trace ID from various sources
export function extractTraceId(source: unknown): string | undefined {
  if (typeof source === 'string') {
    // Accept both UUID format and legacy pf- format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(source)) return source;
    if (source.startsWith('pf-')) return source;
  }
  
  if (typeof source === 'object' && source !== null) {
    const obj = source as Record<string, unknown>;
    if (typeof obj.trace_id === 'string') return obj.trace_id;
    if (typeof obj.traceId === 'string') return obj.traceId;
  }
  
  return undefined;
}

// Get current trace count (for monitoring)
export function getActiveTraceCount(): number {
  return traceStore.size;
}
