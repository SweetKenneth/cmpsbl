/**
 * Substrate — Correlation Tracker
 * Links related events, dispatches, and errors by correlation ID.
 * Enables end-to-end request tracing across all substrate layers.
 */

export interface CorrelationEntry {
  correlationId: string;
  spans: CorrelationSpan[];
  startedAt: string;
  completedAt: string | null;
  status: 'active' | 'completed' | 'failed';
  durationMs: number | null;
}

export interface CorrelationSpan {
  spanId: string;
  module: string;
  action: string;
  startedAt: string;
  completedAt: string | null;
  success: boolean | null;
  metadata?: Record<string, unknown>;
}

const correlations = new Map<string, CorrelationEntry>();
const MAX_CORRELATIONS = 500;

/**
 * Start a new correlation trace.
 */
export function startCorrelation(correlationId: string, module: string, action: string): CorrelationEntry {
  const now = new Date().toISOString();
  const entry: CorrelationEntry = {
    correlationId,
    spans: [{
      spanId: crypto.randomUUID(),
      module,
      action,
      startedAt: now,
      completedAt: null,
      success: null,
    }],
    startedAt: now,
    completedAt: null,
    status: 'active',
    durationMs: null,
  };

  correlations.set(correlationId, entry);

  // Evict oldest
  if (correlations.size > MAX_CORRELATIONS) {
    const firstKey = correlations.keys().next().value;
    if (firstKey) correlations.delete(firstKey);
  }

  return entry;
}

/**
 * Add a span to an existing correlation.
 */
export function addSpan(correlationId: string, module: string, action: string): string | null {
  const entry = correlations.get(correlationId);
  if (!entry) return null;

  const spanId = crypto.randomUUID();
  entry.spans.push({
    spanId,
    module,
    action,
    startedAt: new Date().toISOString(),
    completedAt: null,
    success: null,
  });

  return spanId;
}

/**
 * Complete a span.
 */
export function completeSpan(correlationId: string, spanId: string, success: boolean, metadata?: Record<string, unknown>): void {
  const entry = correlations.get(correlationId);
  if (!entry) return;

  // Reverse search — most recent span is most likely target
  const now = new Date().toISOString();
  for (let i = entry.spans.length - 1; i >= 0; i--) {
    if (entry.spans[i].spanId === spanId) {
      entry.spans[i].completedAt = now;
      entry.spans[i].success = success;
      if (metadata) entry.spans[i].metadata = metadata;
      return;
    }
  }
}

/**
 * Complete an entire correlation.
 */
export function completeCorrelation(correlationId: string, success: boolean): void {
  const entry = correlations.get(correlationId);
  if (!entry) return;

  entry.completedAt = new Date().toISOString();
  entry.status = success ? 'completed' : 'failed';
  entry.durationMs = new Date(entry.completedAt).getTime() - new Date(entry.startedAt).getTime();
}

/**
 * Get a correlation trace.
 */
export function getCorrelation(correlationId: string): CorrelationEntry | null {
  return correlations.get(correlationId) ?? null;
}

/**
 * Get active correlations.
 */
export function getActiveCorrelations(): CorrelationEntry[] {
  return Array.from(correlations.values()).filter(c => c.status === 'active');
}

/**
 * Get recent completed correlations.
 */
export function getRecentCorrelations(limit = 20): CorrelationEntry[] {
  return Array.from(correlations.values())
    .filter(c => c.status !== 'active')
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, limit);
}
