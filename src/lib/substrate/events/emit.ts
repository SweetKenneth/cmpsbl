/**
 * Event Emission System
 * Canonical event stream for all substrate operations
 */

import { supabase } from '@/integrations/supabase/client';
import { generateTraceId } from '@/lib/system/trace';
import { redactSecrets } from '@/lib/defense/redact';
import { log } from '@/lib/system/log';
import type { Json } from '@/integrations/supabase/types';

export type EventOutcome = 'started' | 'succeeded' | 'failed' | 'skipped';

export interface SubstrateEvent {
  module: string;
  event_type: string;
  outcome: EventOutcome;
  message?: string;
  trace_id: string;
  data?: Record<string, unknown>;
}

export interface EmitOptions {
  skipRedaction?: boolean;
  immediate?: boolean;
}

// Event queue for batching
const eventQueue: SubstrateEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL_MS = 1000;
const MAX_QUEUE_SIZE = 20;

// Track consecutive flush failures for circuit-breaker-like behavior
let consecutiveFlushFailures = 0;
const MAX_FLUSH_FAILURES = 5;
const FLUSH_BACKOFF_BASE_MS = 2000;

async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  // Don't attempt to flush if user is not authenticated
  // Guard against missing auth object (test env / SSR)
  let session: any = null;
  try {
    const result = await supabase.auth?.getSession?.();
    session = result?.data?.session;
  } catch {
    // supabase not initialized — drain and bail
  }
  if (!session) {
    // Silently drain the queue — unauthenticated writes will always fail
    eventQueue.length = 0;
    return;
  }

  // Circuit breaker: if too many consecutive failures, skip flush and drain queue slowly
  if (consecutiveFlushFailures >= MAX_FLUSH_FAILURES) {
    const backoff = FLUSH_BACKOFF_BASE_MS * Math.pow(2, Math.min(consecutiveFlushFailures - MAX_FLUSH_FAILURES, 5));
    // Drop oldest events to prevent memory growth
    if (eventQueue.length > MAX_QUEUE_SIZE * 2) {
      eventQueue.splice(0, eventQueue.length - MAX_QUEUE_SIZE);
    }
    // Attempt recovery probe after backoff
    if (Date.now() % backoff < FLUSH_INTERVAL_MS) {
      consecutiveFlushFailures = Math.max(0, consecutiveFlushFailures - 1);
    }
    return;
  }

  const events = eventQueue.splice(0, eventQueue.length);
  
  try {
    const { error } = await supabase.from('brain_events').insert(
      events.map(e => ({
        module: e.module,
        event_type: e.event_type,
        outcome: e.outcome,
        data: (e.data || {}) as Json,
        trace_id: e.trace_id,
        created_at: new Date().toISOString(),
      }))
    );

    if (error) {
      consecutiveFlushFailures++;
      log.error('events', 'Failed to flush events', { error: error.message, count: events.length, failures: consecutiveFlushFailures });
      // Do NOT re-queue on permission/RLS errors — they will never succeed
      const isPermissionError = error.message?.includes('row-level security') || error.message?.includes('permission denied');
      if (!isPermissionError) {
        const requeue = events.slice(0, Math.max(0, MAX_QUEUE_SIZE - eventQueue.length));
        eventQueue.unshift(...requeue);
      }
    } else {
      consecutiveFlushFailures = 0;
      log.debug('events', `Flushed ${events.length} events`);
    }
  } catch (err) {
    consecutiveFlushFailures++;
    log.error('events', 'Event flush error', { error: String(err), failures: consecutiveFlushFailures });
    // Don't re-queue on hard errors to prevent infinite loops
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushEvents();
  }, FLUSH_INTERVAL_MS);
}

const MAX_EVENT_DATA_SIZE = 50_000; // 50KB per event data payload

export async function emit(
  event: Omit<SubstrateEvent, 'trace_id'> & { trace_id?: string },
  options: EmitOptions = {}
): Promise<string> {
  const trace_id = event.trace_id || generateTraceId();
  
  // Truncate oversized data payloads to prevent memory/DB bloat
  let safeData = event.data || {};
  try {
    const serialized = JSON.stringify(safeData);
    if (serialized.length > MAX_EVENT_DATA_SIZE) {
      safeData = { _truncated: true, _originalSize: serialized.length, module: event.module, event_type: event.event_type };
    }
  } catch {
    safeData = { _serializationError: true, module: event.module };
  }

  const fullEvent: SubstrateEvent = {
    ...event,
    trace_id,
    data: options.skipRedaction ? safeData : redactSecrets(safeData),
  };

  if (options.immediate) {
    try {
      // Skip immediate writes if not authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return trace_id;

      const { error } = await supabase.from('brain_events').insert({
        module: fullEvent.module,
        event_type: fullEvent.event_type,
        outcome: fullEvent.outcome,
        data: (fullEvent.data || {}) as Json,
        trace_id: fullEvent.trace_id,
        created_at: new Date().toISOString(),
      });

      if (error) {
        log.error('events', 'Failed to emit event', { error: error.message, event_type: fullEvent.event_type });
      }
    } catch (err) {
      log.error('events', 'Event emission error', { error: String(err) });
    }
  } else {
    eventQueue.push(fullEvent);
    
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      flushEvents();
    } else {
      scheduleFlush();
    }
  }

  return trace_id;
}

// Convenience helpers for common patterns
export const emitStarted = (module: string, action: string, data?: Record<string, unknown>, traceId?: string) =>
  emit({ module, event_type: `${action}.started`, outcome: 'started', data, trace_id: traceId }, { immediate: true });

export const emitSucceeded = (module: string, action: string, data?: Record<string, unknown>, traceId?: string) =>
  emit({ module, event_type: `${action}.succeeded`, outcome: 'succeeded', data, trace_id: traceId });

export const emitFailed = (module: string, action: string, error: string, data?: Record<string, unknown>, traceId?: string) =>
  emit({ 
    module, 
    event_type: `${action}.failed`, 
    outcome: 'failed', 
    message: error,
    data: { ...data, error }, 
    trace_id: traceId 
  }, { immediate: true });

// Clean up queue on page unload (no beacon — endpoint doesn't exist)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Simply drain the queue — events are best-effort
    eventQueue.length = 0;
  });
}

// Force flush (for testing or immediate needs)
export const forceFlush = flushEvents;
