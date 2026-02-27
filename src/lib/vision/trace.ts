/**
 * CMPSBL VISION — Trace Context Utilities
 * Distributed tracing with causal chain support
 */

export interface TraceContext {
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
  source_operation?: string;
  correlation_keys?: Record<string, string>;
}

/**
 * Generate a new trace ID
 */
export function generateTraceId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a new span ID
 */
export function generateSpanId(): string {
  return crypto.randomUUID();
}

/**
 * Start a new trace for a root operation
 */
export function startTrace(
  sourceOperation: string,
  correlation?: Record<string, string>
): TraceContext {
  return {
    trace_id: generateTraceId(),
    span_id: generateSpanId(),
    source_operation: sourceOperation,
    correlation_keys: correlation,
  };
}

/**
 * Create a child span within an existing trace
 */
export function nextSpan(
  traceId: string,
  parentSpanId?: string,
  correlation?: Record<string, string>
): TraceContext {
  return {
    trace_id: traceId,
    span_id: generateSpanId(),
    parent_span_id: parentSpanId,
    correlation_keys: correlation,
  };
}

/**
 * Attach trace context to an event object
 */
export function attachTraceContext<T extends Record<string, unknown>>(
  event: T,
  context: TraceContext
): T & TraceContext {
  return {
    ...event,
    trace_id: context.trace_id,
    span_id: context.span_id,
    parent_span_id: context.parent_span_id,
    source_operation: context.source_operation,
    correlation_keys: context.correlation_keys,
  };
}

/**
 * Extract trace context from an event if present
 */
export function extractTraceContext(
  event: Record<string, unknown>
): TraceContext | null {
  if (!event.trace_id && !event.span_id) return null;
  
  return {
    trace_id: event.trace_id as string,
    span_id: event.span_id as string,
    parent_span_id: event.parent_span_id as string | undefined,
    source_operation: event.source_operation as string | undefined,
    correlation_keys: event.correlation_keys as Record<string, string> | undefined,
  };
}

/**
 * Build a timeline from trace events
 */
export interface TraceTimelineEntry {
  module: string;
  event_type: string;
  created_at: string;
  span_id: string;
  parent_span_id?: string;
  correlation_keys?: Record<string, string>;
  outcome?: string;
  duration_ms?: number;
}

export function buildTraceTimeline(
  events: Array<{
    module: string;
    event_type: string;
    created_at: string;
    span_id?: string;
    parent_span_id?: string;
    correlation_keys?: Record<string, string>;
    outcome?: string;
    data?: Record<string, unknown>;
  }>
): TraceTimelineEntry[] {
  return events
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((e) => ({
      module: e.module,
      event_type: e.event_type,
      created_at: e.created_at,
      span_id: e.span_id || '',
      parent_span_id: e.parent_span_id,
      correlation_keys: e.correlation_keys,
      outcome: e.outcome,
      duration_ms: (e.data?.duration_ms as number) || undefined,
    }));
}
