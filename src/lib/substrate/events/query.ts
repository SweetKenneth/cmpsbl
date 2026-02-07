/**
 * Event Query System
 * v7.0.0 — Query and subscribe to substrate events
 * 
 * Respects debugMode — when enabled, realtime subscriptions are skipped
 */

import { supabase } from '@/integrations/supabase/client';
import { redactSecrets } from '@/lib/defense/redact';
import { debugMode } from '@/lib/debug-mode';
import type { EventOutcome } from './emit';

export interface EventRecord {
  id: string;
  module: string;
  event_type: string;
  outcome: EventOutcome;
  message?: string;
  trace_id?: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface EventQueryOptions {
  module?: string;
  modules?: string[];
  outcome?: EventOutcome;
  limit?: number;
  since?: Date;
  until?: Date;
  traceId?: string;
}

// Cache for recent events
const eventCache = new Map<string, { events: EventRecord[]; fetchedAt: number }>();
const CACHE_TTL_MS = 5000;

function getCacheKey(options: EventQueryOptions): string {
  return JSON.stringify(options);
}

export async function queryEvents(options: EventQueryOptions = {}): Promise<EventRecord[]> {
  const cacheKey = getCacheKey(options);
  const cached = eventCache.get(cacheKey);
  
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.events;
  }

  let query = supabase
    .from('brain_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit || 50);

  if (options.module) {
    query = query.eq('module', options.module);
  }

  if (options.modules && options.modules.length > 0) {
    query = query.in('module', options.modules);
  }

  if (options.outcome) {
    query = query.eq('outcome', options.outcome);
  }

  if (options.since) {
    query = query.gte('created_at', options.since.toISOString());
  }

  if (options.until) {
    query = query.lte('created_at', options.until.toISOString());
  }

  if (options.traceId) {
    query = query.eq('trace_id', options.traceId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Event query failed: ${error.message}`);
  }

  const events: EventRecord[] = (data || []).map(row => ({
    id: row.id,
    module: row.module || 'unknown',
    event_type: row.event_type || 'unknown',
    outcome: (row.outcome as EventOutcome) || 'succeeded',
    message: typeof row.data === 'object' && row.data !== null ? (row.data as Record<string, unknown>).message as string : undefined,
    trace_id: row.trace_id,
    data: redactSecrets((row.data || {}) as Record<string, unknown>),
    created_at: row.created_at,
  }));

  eventCache.set(cacheKey, { events, fetchedAt: Date.now() });

  return events;
}

export async function getRecentEvents(limit = 20): Promise<EventRecord[]> {
  return queryEvents({ limit });
}

export async function getModuleEvents(module: string, limit = 20): Promise<EventRecord[]> {
  return queryEvents({ module, limit });
}

export async function getTraceEvents(traceId: string): Promise<EventRecord[]> {
  return queryEvents({ traceId, limit: 100 });
}

export async function getEventStats(since?: Date): Promise<{
  total: number;
  byModule: Record<string, number>;
  byOutcome: Record<EventOutcome, number>;
}> {
  const events = await queryEvents({ 
    since: since || new Date(Date.now() - 24 * 60 * 60 * 1000),
    limit: 1000 
  });

  const byModule: Record<string, number> = {};
  const byOutcome: Record<EventOutcome, number> = {
    started: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
  };

  for (const event of events) {
    byModule[event.module] = (byModule[event.module] || 0) + 1;
    byOutcome[event.outcome] = (byOutcome[event.outcome] || 0) + 1;
  }

  return {
    total: events.length,
    byModule,
    byOutcome,
  };
}

// Subscribe to real-time events
export function subscribeToEvents(
  callback: (event: EventRecord) => void,
  options: { modules?: string[] } = {}
): () => void {
  // Skip if debug mode is active
  if (!debugMode.allowRealtime()) {
    return () => {}; // Return no-op cleanup
  }
  
  const channel = supabase
    .channel('brain-events-live')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'brain_events',
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        
        // Filter by module if specified
        if (options.modules && options.modules.length > 0) {
          if (!options.modules.includes(row.module as string)) {
            return;
          }
        }

        const event: EventRecord = {
          id: row.id as string,
          module: (row.module as string) || 'unknown',
          event_type: (row.event_type as string) || 'unknown',
          outcome: (row.outcome as EventOutcome) || 'succeeded',
          trace_id: row.trace_id as string | undefined,
          data: redactSecrets((row.data || {}) as Record<string, unknown>),
          created_at: row.created_at as string,
        };

        callback(event);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Invalidate cache
export function invalidateEventCache(): void {
  eventCache.clear();
}
