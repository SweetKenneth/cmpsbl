/**
 * RIPPLE Module Enhancements — v7.5.0 SYNERGY Epoch
 * EventRouter, PriorityQueue, DeadLetterHandler, EventReplay
 */

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT ROUTER — Intelligent event routing with transforms
// ═══════════════════════════════════════════════════════════════════════════════

interface RouteConfig {
  id: string;
  pattern: RegExp;
  targets: string[];
  transform?: (event: RippleEvent) => RippleEvent;
  filter?: (event: RippleEvent) => boolean;
  priority: number;
}

interface RippleEvent {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
  metadata?: Record<string, unknown>;
}

interface RoutingResult {
  event: RippleEvent;
  matchedRoutes: string[];
  deliveredTo: string[];
  transformsApplied: number;
  latencyMs: number;
}

export class EventRouter {
  private routes: RouteConfig[] = [];
  private handlers: Map<string, Array<(event: RippleEvent) => void>> = new Map();

  /** Register a route */
  registerRoute(config: Omit<RouteConfig, 'id'>): string {
    const id = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.routes.push({ ...config, id });
    this.routes.sort((a, b) => b.priority - a.priority);
    return id;
  }

  /** Register an event handler for a target */
  registerHandler(target: string, handler: (event: RippleEvent) => void): void {
    const handlers = this.handlers.get(target) || [];
    handlers.push(handler);
    this.handlers.set(target, handlers);
  }

  /** Route an event */
  route(event: RippleEvent): RoutingResult {
    const startTime = Date.now();
    const matchedRoutes: string[] = [];
    const deliveredTo: string[] = [];
    let transformsApplied = 0;

    let currentEvent = { ...event };

    for (const route of this.routes) {
      if (!route.pattern.test(event.type)) continue;
      if (route.filter && !route.filter(currentEvent)) continue;

      matchedRoutes.push(route.id);

      // Apply transform if defined
      if (route.transform) {
        currentEvent = route.transform(currentEvent);
        transformsApplied++;
      }

      // Deliver to targets
      for (const target of route.targets) {
        const handlers = this.handlers.get(target) || [];
        for (const handler of handlers) {
          try {
            handler(currentEvent);
            if (!deliveredTo.includes(target)) {
              deliveredTo.push(target);
            }
          } catch (error) {
            console.error(`Handler error for target ${target}:`, error);
          }
        }
      }
    }

    return {
      event: currentEvent,
      matchedRoutes,
      deliveredTo,
      transformsApplied,
      latencyMs: Date.now() - startTime,
    };
  }

  /** Remove a route */
  removeRoute(routeId: string): boolean {
    const index = this.routes.findIndex(r => r.id === routeId);
    if (index > -1) {
      this.routes.splice(index, 1);
      return true;
    }
    return false;
  }

  /** Get routing statistics */
  getStats(): { routeCount: number; handlerCount: number; targetCount: number } {
    let handlerCount = 0;
    for (const handlers of this.handlers.values()) {
      handlerCount += handlers.length;
    }

    return {
      routeCount: this.routes.length,
      handlerCount,
      targetCount: this.handlers.size,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIORITY QUEUE — Event queue with TTL and priority ordering
// ═══════════════════════════════════════════════════════════════════════════════

interface QueuedEvent {
  event: RippleEvent;
  priority: number;
  ttl: number;
  enqueuedAt: number;
  attempts: number;
}

interface QueueStats {
  size: number;
  expired: number;
  processed: number;
  avgWaitTime: number;
}

export class PriorityQueue {
  private queue: QueuedEvent[] = [];
  private processed: number = 0;
  private expired: number = 0;
  private waitTimes: number[] = [];

  /** Enqueue an event with priority */
  enqueue(event: RippleEvent, priority: number = 1, ttlMs: number = 30000): void {
    const queued: QueuedEvent = {
      event,
      priority,
      ttl: ttlMs,
      enqueuedAt: Date.now(),
      attempts: 0,
    };

    // Insert in priority order (higher priority first)
    const insertIdx = this.queue.findIndex(q => q.priority < priority);
    if (insertIdx === -1) {
      this.queue.push(queued);
    } else {
      this.queue.splice(insertIdx, 0, queued);
    }
  }

  /** Dequeue the highest priority event */
  dequeue(): RippleEvent | null {
    this.pruneExpired();

    const queued = this.queue.shift();
    if (!queued) return null;

    const waitTime = Date.now() - queued.enqueuedAt;
    this.waitTimes.push(waitTime);
    if (this.waitTimes.length > 100) this.waitTimes.shift();

    this.processed++;
    return queued.event;
  }

  /** Peek at the next event without removing */
  peek(): RippleEvent | null {
    this.pruneExpired();
    return this.queue[0]?.event || null;
  }

  /** Requeue an event (for retry) */
  requeue(event: RippleEvent, maxAttempts: number = 3): boolean {
    const queued = this.queue.find(q => q.event.id === event.id);
    if (queued) {
      queued.attempts++;
      if (queued.attempts >= maxAttempts) {
        return false; // Max attempts reached
      }
      // Decrease priority on retry
      queued.priority = Math.max(0, queued.priority - 1);
      this.queue.sort((a, b) => b.priority - a.priority);
      return true;
    }
    return false;
  }

  private pruneExpired(): void {
    const now = Date.now();
    const originalLength = this.queue.length;
    this.queue = this.queue.filter(q => now - q.enqueuedAt < q.ttl);
    this.expired += originalLength - this.queue.length;
  }

  /** Get queue statistics */
  getStats(): QueueStats {
    this.pruneExpired();
    return {
      size: this.queue.length,
      expired: this.expired,
      processed: this.processed,
      avgWaitTime: this.waitTimes.length > 0
        ? this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
        : 0,
    };
  }

  /** Clear the queue */
  clear(): void {
    this.queue = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEAD LETTER HANDLER — Failed event management
// ═══════════════════════════════════════════════════════════════════════════════

interface DeadLetter {
  event: RippleEvent;
  error: string;
  failedAt: number;
  retryCount: number;
  lastRetryAt?: number;
}

interface DeadLetterStats {
  total: number;
  retriable: number;
  permanent: number;
  avgRetries: number;
}

export class DeadLetterHandler {
  private deadLetters: Map<string, DeadLetter> = new Map();
  private maxRetries: number = 3;
  private retryDelayMs: number = 60000; // 1 minute

  /** Add a failed event to dead letter queue */
  add(event: RippleEvent, error: string): void {
    const existing = this.deadLetters.get(event.id);
    
    if (existing) {
      existing.retryCount++;
      existing.lastRetryAt = Date.now();
      existing.error = error;
    } else {
      this.deadLetters.set(event.id, {
        event,
        error,
        failedAt: Date.now(),
        retryCount: 0,
      });
    }
  }

  /** Get events ready for retry */
  getRetriable(): RippleEvent[] {
    const now = Date.now();
    const retriable: RippleEvent[] = [];

    for (const dl of this.deadLetters.values()) {
      if (dl.retryCount >= this.maxRetries) continue;
      
      const lastAttempt = dl.lastRetryAt || dl.failedAt;
      const retryDelay = this.retryDelayMs * Math.pow(2, dl.retryCount); // Exponential backoff
      
      if (now - lastAttempt >= retryDelay) {
        retriable.push(dl.event);
      }
    }

    return retriable;
  }

  /** Mark an event as successfully retried */
  markResolved(eventId: string): boolean {
    return this.deadLetters.delete(eventId);
  }

  /** Get permanently failed events */
  getPermanentlyFailed(): DeadLetter[] {
    return Array.from(this.deadLetters.values())
      .filter(dl => dl.retryCount >= this.maxRetries);
  }

  /** Purge old dead letters */
  purge(maxAgeMs: number = 7 * 86400000): number {
    const now = Date.now();
    let purged = 0;

    for (const [id, dl] of this.deadLetters.entries()) {
      if (now - dl.failedAt > maxAgeMs) {
        this.deadLetters.delete(id);
        purged++;
      }
    }

    return purged;
  }

  /** Get dead letter statistics */
  getStats(): DeadLetterStats {
    const deadLetters = Array.from(this.deadLetters.values());
    const retriable = deadLetters.filter(dl => dl.retryCount < this.maxRetries);
    const permanent = deadLetters.filter(dl => dl.retryCount >= this.maxRetries);
    const totalRetries = deadLetters.reduce((a, b) => a + b.retryCount, 0);

    return {
      total: deadLetters.length,
      retriable: retriable.length,
      permanent: permanent.length,
      avgRetries: deadLetters.length > 0 ? totalRetries / deadLetters.length : 0,
    };
  }

  /** Set retry configuration */
  setConfig(maxRetries: number, retryDelayMs: number): void {
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT REPLAY — Historical event replay for debugging/recovery
// ═══════════════════════════════════════════════════════════════════════════════

interface ReplayOptions {
  from: number;
  to: number;
  filter?: (event: RippleEvent) => boolean;
  speed: number;  // 1 = real-time, 2 = 2x speed, etc.
}

interface ReplaySession {
  id: string;
  options: ReplayOptions;
  status: 'pending' | 'running' | 'paused' | 'completed';
  progress: number;
  eventsReplayed: number;
  startedAt?: number;
  completedAt?: number;
}

export class EventReplay {
  private eventLog: RippleEvent[] = [];
  private sessions: Map<string, ReplaySession> = new Map();
  private maxLogSize: number = 10000;

  /** Log an event for future replay */
  log(event: RippleEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  /** Create a replay session */
  createSession(options: ReplayOptions): string {
    const id = `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.sessions.set(id, {
      id,
      options,
      status: 'pending',
      progress: 0,
      eventsReplayed: 0,
    });

    return id;
  }

  /** Get events for a replay session */
  getEventsForReplay(sessionId: string): RippleEvent[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    let events = this.eventLog.filter(e => 
      e.timestamp >= session.options.from && 
      e.timestamp <= session.options.to
    );

    if (session.options.filter) {
      events = events.filter(session.options.filter);
    }

    return events;
  }

  /** Start/resume a replay session */
  async replay(
    sessionId: string, 
    handler: (event: RippleEvent) => Promise<void>
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'running';
    session.startedAt = Date.now();

    const events = this.getEventsForReplay(sessionId);
    const totalEvents = events.length;

    for (let i = 0; i < events.length; i++) {
      if (session.status === 'paused') break;

      const event = events[i];
      await handler(event);

      session.eventsReplayed++;
      session.progress = (i + 1) / totalEvents;

      // Calculate delay for timing accuracy
      if (i < events.length - 1 && session.options.speed > 0 && session.status === 'running') {
        const timeDiff = events[i + 1].timestamp - event.timestamp;
        const delay = timeDiff / session.options.speed;
        if (delay > 0 && delay < 10000) { // Max 10s delay
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (session.status === 'running') {
      session.status = 'completed';
      session.completedAt = Date.now();
    }
  }

  /** Pause a replay session */
  pause(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'running') {
      session.status = 'paused';
      return true;
    }
    return false;
  }

  /** Get session status */
  getSession(sessionId: string): ReplaySession | null {
    return this.sessions.get(sessionId) || null;
  }

  /** Get event log statistics */
  getLogStats(): {
    eventCount: number;
    oldestEvent: number;
    newestEvent: number;
    eventTypes: Record<string, number>;
  } {
    const eventTypes: Record<string, number> = {};
    
    for (const event of this.eventLog) {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    }

    return {
      eventCount: this.eventLog.length,
      oldestEvent: this.eventLog[0]?.timestamp || 0,
      newestEvent: this.eventLog[this.eventLog.length - 1]?.timestamp || 0,
      eventTypes,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const rippleEnhancements = {
  EventRouter,
  PriorityQueue,
  DeadLetterHandler,
  EventReplay,
};

export type {
  RouteConfig,
  RippleEvent,
  RoutingResult,
  QueuedEvent,
  QueueStats,
  DeadLetter,
  DeadLetterStats,
  ReplayOptions,
  ReplaySession,
};
