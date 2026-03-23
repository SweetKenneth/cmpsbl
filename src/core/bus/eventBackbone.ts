/**
 * CORE — Event Backbone
 * Typed pub/sub event bus with priority lanes (critical/standard/low),
 * backpressure, and dead-letter queue for unhandled events.
 * Ultimate Form v1.0.0
 */

export type EventPriority = 'critical' | 'standard' | 'low';

export interface BusEvent<T = unknown> {
  id: string;
  channel: string;
  priority: EventPriority;
  payload: T;
  sourceModule: string;
  timestamp: string;
  epoch: number;
}

export interface DeadLetterEntry {
  event: BusEvent;
  reason: string;
  failedAt: string;
}

type EventHandler<T = unknown> = (event: BusEvent<T>) => void | Promise<void>;

interface Subscription {
  channel: string;
  handler: EventHandler;
  moduleId: string;
}

const subscriptions = new Map<string, Subscription[]>();
const deadLetterQueue: DeadLetterEntry[] = [];
const MAX_DEAD_LETTERS = 200;
const MAX_QUEUE_DEPTH = 1_000;

// Backpressure tracking
let pendingCount = 0;
let totalEmitted = 0;
let totalDelivered = 0;
let totalDropped = 0;

/**
 * Subscribe to a channel.
 */
export function subscribe<T = unknown>(
  channel: string,
  moduleId: string,
  handler: EventHandler<T>
): () => void {
  if (!subscriptions.has(channel)) subscriptions.set(channel, []);
  const sub: Subscription = { channel, handler: handler as EventHandler, moduleId };
  subscriptions.get(channel)!.push(sub);

  return () => {
    const subs = subscriptions.get(channel);
    if (subs) {
      const idx = subs.indexOf(sub);
      if (idx >= 0) subs.splice(idx, 1);
    }
  };
}

/**
 * Emit an event to a channel.
 * Critical events are processed synchronously; others are deferred.
 */
export function emit<T = unknown>(
  channel: string,
  payload: T,
  sourceModule: string,
  priority: EventPriority = 'standard',
  epoch = 0,
): BusEvent<T> {
  const event: BusEvent<T> = {
    id: crypto.randomUUID(),
    channel,
    priority,
    payload,
    sourceModule,
    timestamp: new Date().toISOString(),
    epoch,
  };

  totalEmitted++;

  // Backpressure check
  if (pendingCount >= MAX_QUEUE_DEPTH && priority !== 'critical') {
    totalDropped++;
    deadLetterQueue.push({
      event: event as BusEvent,
      reason: 'Backpressure — queue depth exceeded',
      failedAt: new Date().toISOString(),
    });
    if (deadLetterQueue.length > MAX_DEAD_LETTERS) deadLetterQueue.shift();
    return event;
  }

  const subs = subscriptions.get(channel) || [];

  if (subs.length === 0) {
    deadLetterQueue.push({
      event: event as BusEvent,
      reason: `No subscribers for channel: ${channel}`,
      failedAt: new Date().toISOString(),
    });
    if (deadLetterQueue.length > MAX_DEAD_LETTERS) deadLetterQueue.shift();
    return event;
  }

  // Sort by priority: critical handlers first
  const deliver = () => {
    pendingCount++;
    for (const sub of subs) {
      try {
        const result = sub.handler(event as BusEvent);
        if (result instanceof Promise) {
          result.catch(() => { /* silent handler failure */ });
        }
        totalDelivered++;
      } catch {
        // Handler failure — don't crash the bus
      }
    }
    pendingCount--;
  };

  if (priority === 'critical') {
    deliver(); // Synchronous for critical
  } else {
    // Deferred for standard/low
    queueMicrotask(deliver);
  }

  return event;
}

/**
 * Broadcast to ALL channels (system-wide event).
 */
export function broadcast<T = unknown>(
  payload: T,
  sourceModule: string,
  priority: EventPriority = 'standard',
): void {
  for (const channel of subscriptions.keys()) {
    emit(channel, payload, sourceModule, priority);
  }
}

export function getDeadLetterQueue(): DeadLetterEntry[] {
  return [...deadLetterQueue];
}

export function getChannels(): string[] {
  return Array.from(subscriptions.keys());
}

export function getSubscriberCount(channel: string): number {
  return subscriptions.get(channel)?.length || 0;
}

export function getBusStats(): {
  totalEmitted: number;
  totalDelivered: number;
  totalDropped: number;
  pendingCount: number;
  deadLetterCount: number;
  channelCount: number;
} {
  return {
    totalEmitted,
    totalDelivered,
    totalDropped,
    pendingCount,
    deadLetterCount: deadLetterQueue.length,
    channelCount: subscriptions.size,
  };
}
