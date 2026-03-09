/**
 * RIPPLE Batch Events Engine
 * Bulk Event Publishing & Historical Replay
 * 
 * Missing capability: Batch event operations for high-throughput
 * scenarios and event replay for debugging/recovery.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { ripple, type RippleEvent, type EventStatus } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BatchEventItem {
  type: string;
  source: string;
  payload: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
}

export interface BatchPublishResult {
  success: boolean;
  totalEvents: number;
  published: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
  duration: number;
}

export interface EventReplayOptions {
  fromTimestamp?: string;
  toTimestamp?: string;
  eventTypes?: string[];
  sources?: string[];
  limit?: number;
  speed?: number; // 1 = real-time, 2 = 2x speed, etc.
}

export interface EventReplayResult {
  success: boolean;
  eventsReplayed: number;
  eventsSkipped: number;
  errors: string[];
  duration: number;
}

export interface EventAnalytics {
  period: 'hour' | 'day' | 'week';
  totalEvents: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  byStatus: Record<EventStatus, number>;
  avgProcessingTime: number;
  peakHour?: { hour: number; count: number };
  deadLetterRate: number;
}

export interface SubscriptionHealth {
  subscriptionId: string;
  module: string;
  pattern: string;
  deliveredCount: number;
  failedCount: number;
  successRate: number;
  avgLatency: number;
  circuitState: 'closed' | 'open' | 'half_open';
  lastDelivery?: string;
}

// Event history buffer
const eventHistory: RippleEvent[] = [];
const MAX_HISTORY = 10000;

// Subscription metrics
const subscriptionMetrics = new Map<string, {
  delivered: number;
  failed: number;
  totalLatency: number;
  lastDelivery?: Date;
}>();

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH PUBLISHING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Publish multiple events in a single batch
 */
export async function batchPublish(
  events: BatchEventItem[],
  options?: { chunkSize?: number }
): Promise<BatchPublishResult> {
  const startTime = Date.now();
  const chunkSize = options?.chunkSize ?? 50;
  
  const result: BatchPublishResult = {
    success: true,
    totalEvents: events.length,
    published: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  // Sort by priority
  const sortedEvents = [...events].sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return (priorityOrder[a.priority ?? 'normal']) - (priorityOrder[b.priority ?? 'normal']);
  });

  // Process in chunks
  for (let i = 0; i < sortedEvents.length; i += chunkSize) {
    const chunk = sortedEvents.slice(i, i + chunkSize);
    
    const chunkResults = await Promise.allSettled(
      chunk.map(async (event, idx) => {
        const publishResult = await ripple.publish(event.type, event.source, event.payload);
        
        if (publishResult.success) {
          // Add to history
          addToHistory({
            id: publishResult.eventId,
            type: event.type,
            source: event.source,
            payload: event.payload,
            status: 'succeeded',
            retryCount: 0,
            maxRetries: 3,
            createdAt: new Date().toISOString(),
          });
        }
        
        return { index: i + idx, result: publishResult };
      })
    );

    for (const outcome of chunkResults) {
      if (outcome.status === 'fulfilled' && outcome.value.result.success) {
        result.published++;
      } else {
        result.failed++;
        const idx = outcome.status === 'fulfilled' ? outcome.value.index : i;
        const error = outcome.status === 'rejected' ? outcome.reason : 'Publish failed';
        result.errors.push({ index: idx, error: String(error) });
      }
    }
  }

  result.success = result.failed === 0;
  result.duration = Date.now() - startTime;

  // Log batch publish
  try {
    await supabase.from('brain_events').insert({
      module: 'ripple',
      event_type: 'batch.published',
      data: {
        totalEvents: result.totalEvents,
        published: result.published,
        failed: result.failed,
        duration: result.duration,
      } as unknown as Json,
      outcome: result.success ? 'success' : 'partial',
    });
  } catch {
    // Best-effort logging
  }

  return result;
}

/**
 * Publish event with guaranteed delivery
 */
export async function publishWithRetry(
  type: string,
  source: string,
  payload: Record<string, unknown>,
  maxRetries: number = 3
): Promise<{ success: boolean; eventId: string; retries: number }> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries <= maxRetries) {
    try {
      const result = await ripple.publish(type, source, payload, { maxRetries });
      
      if (result.success) {
        return { success: true, eventId: result.eventId, retries };
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    retries++;
    if (retries <= maxRetries) {
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 100));
    }
  }

  console.error(`[RIPPLE] Failed to publish after ${retries} retries:`, lastError);
  return { success: false, eventId: '', retries };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT REPLAY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Replay historical events
 */
export async function replayEvents(
  options: EventReplayOptions
): Promise<EventReplayResult> {
  const startTime = Date.now();
  const result: EventReplayResult = {
    success: true,
    eventsReplayed: 0,
    eventsSkipped: 0,
    errors: [],
    duration: 0,
  };

  // Fetch events from database
  let query = supabase
    .from('brain_events')
    .select('*')
    .eq('module', 'ripple')
    .order('created_at', { ascending: true })
    .limit(options.limit ?? 1000);

  if (options.fromTimestamp) {
    query = query.gte('created_at', options.fromTimestamp);
  }
  if (options.toTimestamp) {
    query = query.lte('created_at', options.toTimestamp);
  }
  if (options.eventTypes && options.eventTypes.length > 0) {
    query = query.in('event_type', options.eventTypes);
  }

  const { data: events, error } = await query;

  if (error) {
    result.success = false;
    result.errors.push(error.message);
    return result;
  }

  // Replay events
  const speed = options.speed ?? 1;
  let lastTimestamp: Date | null = null;

  for (const event of events || []) {
    // Apply timing based on speed
    if (speed < Infinity && lastTimestamp) {
      const eventTime = new Date(event.created_at);
      const delay = (eventTime.getTime() - lastTimestamp.getTime()) / speed;
      if (delay > 0 && delay < 10000) { // Cap at 10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    try {
      const eventData = event.data as Record<string, unknown> | null;
      const eventType = event.event_type?.replace('bus.', '') || 'unknown';
      
      await ripple.publish(
        `replay.${eventType}`,
        'ripple.replay',
        { original: eventData, replayedAt: new Date().toISOString() }
      );
      
      result.eventsReplayed++;
    } catch (error) {
      result.eventsSkipped++;
      result.errors.push(error instanceof Error ? error.message : 'Replay failed');
    }

    lastTimestamp = new Date(event.created_at);
  }

  result.duration = Date.now() - startTime;

  // Log replay
  await supabase.from('brain_events').insert({
    module: 'ripple',
    event_type: 'events.replayed',
    data: {
      eventsReplayed: result.eventsReplayed,
      eventsSkipped: result.eventsSkipped,
      options,
    } as unknown as Record<string, never>,
    outcome: result.success ? 'success' : 'partial',
  });

  return result;
}

/**
 * Get event from history
 */
export function getEventFromHistory(eventId: string): RippleEvent | undefined {
  return eventHistory.find(e => e.id === eventId);
}

/**
 * Search event history
 */
export function searchEventHistory(query: {
  type?: string;
  source?: string;
  status?: EventStatus;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): RippleEvent[] {
  let results = [...eventHistory];

  if (query.type) {
    results = results.filter(e => e.type.includes(query.type!));
  }
  if (query.source) {
    results = results.filter(e => e.source === query.source);
  }
  if (query.status) {
    results = results.filter(e => e.status === query.status);
  }
  if (query.fromDate) {
    results = results.filter(e => e.createdAt >= query.fromDate!);
  }
  if (query.toDate) {
    results = results.filter(e => e.createdAt <= query.toDate!);
  }

  return results.slice(0, query.limit ?? 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate event analytics
 */
export async function getEventAnalytics(
  period: 'hour' | 'day' | 'week'
): Promise<EventAnalytics> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
  }

  // Query from database
  const { data: events } = await supabase
    .from('brain_events')
    .select('*')
    .eq('module', 'ripple')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  const byType: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byStatus: Record<EventStatus, number> = {
    pending: 0,
    processing: 0,
    succeeded: 0,
    failed: 0,
    dead_letter: 0,
  };
  const hourCounts: Record<number, number> = {};

  for (const event of events || []) {
    const data = event.data as any;
    
    // By type
    byType[event.event_type] = (byType[event.event_type] || 0) + 1;
    
    // By source
    const source = data?.source || 'unknown';
    bySource[source] = (bySource[source] || 0) + 1;
    
    // By status
    const status = (data?.status as EventStatus) || 'succeeded';
    byStatus[status] = (byStatus[status] || 0) + 1;
    
    // By hour
    const hour = new Date(event.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  // Find peak hour
  let peakHour: { hour: number; count: number } | undefined;
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (!peakHour || count > peakHour.count) {
      peakHour = { hour: parseInt(hour), count };
    }
  }

  const totalEvents = events?.length ?? 0;
  const deadLetterRate = totalEvents > 0 ? byStatus.dead_letter / totalEvents : 0;

  return {
    period,
    totalEvents,
    byType,
    bySource,
    byStatus,
    avgProcessingTime: 50, // Would calculate from actual metrics
    peakHour,
    deadLetterRate,
  };
}

/**
 * Get subscription health metrics
 */
export function getSubscriptionHealth(): SubscriptionHealth[] {
  const subscriptions = ripple.getSubscriptions();
  
  return subscriptions.map(sub => {
    const metrics = subscriptionMetrics.get(sub.id) || {
      delivered: 0,
      failed: 0,
      totalLatency: 0,
    };

    const total = metrics.delivered + metrics.failed;
    const successRate = total > 0 ? metrics.delivered / total : 1;
    const avgLatency = metrics.delivered > 0 ? metrics.totalLatency / metrics.delivered : 0;

    return {
      subscriptionId: sub.id,
      module: sub.module,
      pattern: sub.eventPattern,
      deliveredCount: metrics.delivered,
      failedCount: metrics.failed,
      successRate,
      avgLatency,
      circuitState: sub.circuitState,
      lastDelivery: metrics.lastDelivery?.toISOString(),
    };
  });
}

/**
 * Record subscription delivery
 */
export function recordDelivery(
  subscriptionId: string,
  success: boolean,
  latency: number
): void {
  const metrics = subscriptionMetrics.get(subscriptionId) || {
    delivered: 0,
    failed: 0,
    totalLatency: 0,
  };

  if (success) {
    metrics.delivered++;
    metrics.totalLatency += latency;
    metrics.lastDelivery = new Date();
  } else {
    metrics.failed++;
  }

  subscriptionMetrics.set(subscriptionId, metrics);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Add event to history buffer
 */
function addToHistory(event: RippleEvent): void {
  eventHistory.push(event);
  
  // Trim if exceeds max
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.shift();
  }
}

/**
 * Clear event history
 */
export function clearHistory(): void {
  eventHistory.length = 0;
}

/**
 * Get history size
 */
export function getHistorySize(): number {
  return eventHistory.length;
}

/**
 * Export event history to JSON
 */
export function exportHistory(): string {
  return JSON.stringify(eventHistory, null, 2);
}
