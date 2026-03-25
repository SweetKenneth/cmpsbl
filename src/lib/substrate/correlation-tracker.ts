/**
 * Substrate — Correlation Tracker
 * Links related events, dispatches, and errors by correlation ID.
 * Enables end-to-end request tracing across all substrate layers.
 *
 * Optimizations:
 * - O(1) span lookup via spanIndex Map
 * - Single-pass getActiveCorrelations (no intermediate array + filter)
 * - Partition-aware getRecentCorrelations (avoid full sort)
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
/** O(1) span lookup: spanId → correlationId */
const spanIndex = new Map<string, string>();
const MAX_CORRELATIONS = 500;

/**
 * Start a new correlation trace.
 */
export function startCorrelation(correlationId: string, module: string, action: string): CorrelationEntry {
  const now = new Date().toISOString();
  const spanId = crypto.randomUUID();
  const entry: CorrelationEntry = {
    correlationId,
    spans: [{
      spanId,
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
  spanIndex.set(spanId, correlationId);

  // Evict oldest
  if (correlations.size > MAX_CORRELATIONS) {
    const firstKey = correlations.keys().next().value;
    if (firstKey) {
      const evicted = correlations.get(firstKey);
      if (evicted) {
        for (const s of evicted.spans) spanIndex.delete(s.spanId);
      }
      correlations.delete(firstKey);
    }
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
  spanIndex.set(spanId, correlationId);

  return spanId;
}

/**
 * Complete a span — O(1) via spanIndex.
 */
export function completeSpan(correlationId: string, spanId: string, success: boolean, metadata?: Record<string, unknown>): void {
  const entry = correlations.get(correlationId);
  if (!entry) return;

  // O(1) verification that span belongs to this correlation
  const owner = spanIndex.get(spanId);
  if (owner !== correlationId) return;

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
 * Get active correlations — single-pass, no filter + toArray.
 */
export function getActiveCorrelations(): CorrelationEntry[] {
  const result: CorrelationEntry[] = [];
  for (const c of correlations.values()) {
    if (c.status === 'active') result.push(c);
  }
  return result;
}

/**
 * Get recent completed correlations.
 * Uses single-pass insertion into a bounded sorted array (O(n·k) where k=limit)
 * instead of full array copy + filter + sort (O(n log n)).
 */
export function getRecentCorrelations(limit = 20): CorrelationEntry[] {
  const result: CorrelationEntry[] = [];

  for (const c of correlations.values()) {
    if (c.status === 'active') continue;
    const ts = c.completedAt ?? '';

    // Insert into bounded sorted array
    if (result.length < limit) {
      result.push(c);
      // Bubble into position
      let j = result.length - 1;
      while (j > 0 && (result[j - 1].completedAt ?? '') < ts) {
        result[j] = result[j - 1];
        j--;
      }
      result[j] = c;
    } else if (ts > (result[result.length - 1].completedAt ?? '')) {
      // Replace smallest and bubble up
      result[result.length - 1] = c;
      let j = result.length - 1;
      while (j > 0 && (result[j - 1].completedAt ?? '') < ts) {
        const tmp = result[j];
        result[j] = result[j - 1];
        result[j - 1] = tmp;
        j--;
      }
    }
  }

  return result;
}
