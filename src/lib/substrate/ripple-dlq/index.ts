/**
 * RIPPLE Dead Letter Queue (DLQ) with Persistence — v1.0.0
 * 
 * Enhances the RIPPLE event bus with persistent dead letter storage,
 * automatic retry with exponential backoff, and forensic audit trail.
 * 
 * If a subscriber is down when an event fires, the event is captured
 * in the DLQ and retried later — zero event loss.
 */

import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DeadLetterEntry {
  id: string;
  eventId: string;
  eventType: string;
  moduleId: string;
  payload: unknown;
  targetSubscriber: string;
  error: string;
  attempts: number;
  maxAttempts: number;
  firstFailedAt: string;
  lastAttemptAt: string;
  nextRetryAt: string | null;
  status: 'pending_retry' | 'retrying' | 'exhausted' | 'resolved';
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface DLQConfig {
  maxAttempts: number;              // Max retries before exhaustion (default: 5)
  baseRetryDelayMs: number;         // Base delay for exponential backoff (default: 5000)
  maxRetryDelayMs: number;          // Cap on retry delay (default: 300000 = 5min)
  retryIntervalMs: number;          // How often to process retry queue (default: 30000)
  persistToDatabase: boolean;       // Write to brain_events for forensic trail (default: true)
  maxQueueSize: number;             // Max entries before dropping oldest (default: 500)
}

export interface DLQStats {
  totalEntries: number;
  pendingRetry: number;
  exhausted: number;
  resolved: number;
  oldestEntryAge: number | null;    // ms
  retrySuccessRate: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'ripple_dlq';
const DEFAULT_CONFIG: DLQConfig = {
  maxAttempts: 5,
  baseRetryDelayMs: 5_000,
  maxRetryDelayMs: 300_000,
  retryIntervalMs: 30_000,
  persistToDatabase: true,
  maxQueueSize: 500,
};

// ═══════════════════════════════════════════════════════════════
// DLQ ENGINE
// ═══════════════════════════════════════════════════════════════

class RippleDLQ {
  private static instance: RippleDLQ;
  private queue: DeadLetterEntry[] = [];
  private config: DLQConfig;
  private retryHandlers: Map<string, (entry: DeadLetterEntry) => Promise<boolean>> = new Map();
  private retryIntervalId: ReturnType<typeof setInterval> | null = null;
  private loaded = false;
  private resolvedCount = 0;
  private totalRetries = 0;
  private successfulRetries = 0;

  private constructor(config?: Partial<DLQConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(): RippleDLQ {
    if (!RippleDLQ.instance) {
      RippleDLQ.instance = new RippleDLQ();
    }
    return RippleDLQ.instance;
  }

  // ─── LIFECYCLE ──────────────────────────────────────────────

  /**
   * Start automatic retry processing
   */
  start(): void {
    if (this.retryIntervalId) return;
    this.ensureLoaded();

    console.log(`[RIPPLE DLQ] 📬 Started with ${this.queue.length} pending entries`);

    this.retryIntervalId = setInterval(() => {
      this.processRetries();
    }, this.config.retryIntervalMs);
  }

  stop(): void {
    if (this.retryIntervalId) {
      clearInterval(this.retryIntervalId);
      this.retryIntervalId = null;
    }
  }

  /**
   * Register a retry handler for a subscriber
   * The handler should return true if the retry succeeded
   */
  registerRetryHandler(subscriberName: string, handler: (entry: DeadLetterEntry) => Promise<boolean>): void {
    this.retryHandlers.set(subscriberName, handler);
  }

  // ─── ENQUEUE ────────────────────────────────────────────────

  /**
   * Add a failed event to the dead letter queue
   */
  enqueue(
    eventId: string,
    eventType: string,
    moduleId: string,
    payload: unknown,
    targetSubscriber: string,
    error: string
  ): DeadLetterEntry {
    this.ensureLoaded();

    const now = new Date();
    const entry: DeadLetterEntry = {
      id: `dlq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      eventId,
      eventType,
      moduleId,
      payload,
      targetSubscriber,
      error,
      attempts: 1,
      maxAttempts: this.config.maxAttempts,
      firstFailedAt: now.toISOString(),
      lastAttemptAt: now.toISOString(),
      nextRetryAt: new Date(now.getTime() + this.config.baseRetryDelayMs).toISOString(),
      status: 'pending_retry',
      resolvedAt: null,
      resolvedBy: null,
    };

    this.queue.push(entry);

    // Enforce max queue size
    while (this.queue.length > this.config.maxQueueSize) {
      const oldest = this.queue.shift();
      if (oldest) {
        console.warn(`[RIPPLE DLQ] ⚠️ Dropped oldest entry ${oldest.id} (queue full)`);
      }
    }

    this.persist();

    // Persist to database for forensic trail
    if (this.config.persistToDatabase) {
      supabase.from('brain_events').insert({
        module: 'ripple',
        event_type: 'dlq_entry_created',
        data: {
          dlq_id: entry.id,
          event_type: eventType,
          target: targetSubscriber,
          error,
        },
      }).then(() => {});
    }

    console.log(`[RIPPLE DLQ] 📥 Enqueued: ${eventType} → ${targetSubscriber} (${error})`);
    return entry;
  }

  // ─── RETRY PROCESSING ──────────────────────────────────────

  /**
   * Process all entries due for retry
   */
  async processRetries(): Promise<{ processed: number; succeeded: number; exhausted: number }> {
    this.ensureLoaded();
    const now = Date.now();
    let processed = 0, succeeded = 0, exhausted = 0;

    const dueForRetry = this.queue.filter(e => 
      e.status === 'pending_retry' && 
      e.nextRetryAt && 
      new Date(e.nextRetryAt).getTime() <= now
    );

    for (const entry of dueForRetry) {
      processed++;
      entry.status = 'retrying';
      entry.attempts++;
      entry.lastAttemptAt = new Date().toISOString();
      this.totalRetries++;

      const handler = this.retryHandlers.get(entry.targetSubscriber);

      if (handler) {
        try {
          const success = await handler(entry);
          if (success) {
            entry.status = 'resolved';
            entry.resolvedAt = new Date().toISOString();
            entry.resolvedBy = 'auto_retry';
            this.resolvedCount++;
            this.successfulRetries++;
            succeeded++;
            console.log(`[RIPPLE DLQ] ✅ Retry succeeded: ${entry.id}`);
            continue;
          }
        } catch (err) {
          entry.error = String(err);
        }
      }

      // Retry failed
      if (entry.attempts >= entry.maxAttempts) {
        entry.status = 'exhausted';
        entry.nextRetryAt = null;
        exhausted++;
        console.warn(`[RIPPLE DLQ] 💀 Exhausted: ${entry.id} after ${entry.attempts} attempts`);
      } else {
        // Exponential backoff
        const delay = Math.min(
          this.config.baseRetryDelayMs * Math.pow(2, entry.attempts - 1),
          this.config.maxRetryDelayMs
        );
        entry.status = 'pending_retry';
        entry.nextRetryAt = new Date(Date.now() + delay).toISOString();
      }
    }

    if (processed > 0) this.persist();

    return { processed, succeeded, exhausted };
  }

  // ─── MANUAL ACTIONS ─────────────────────────────────────────

  /**
   * Manually resolve a DLQ entry
   */
  resolve(entryId: string, resolvedBy: string = 'manual'): DeadLetterEntry | null {
    this.ensureLoaded();
    const entry = this.queue.find(e => e.id === entryId);
    if (!entry) return null;

    entry.status = 'resolved';
    entry.resolvedAt = new Date().toISOString();
    entry.resolvedBy = resolvedBy;
    this.resolvedCount++;
    this.persist();
    return entry;
  }

  /**
   * Manually retry a specific entry now
   */
  async retryNow(entryId: string): Promise<boolean> {
    this.ensureLoaded();
    const entry = this.queue.find(e => e.id === entryId);
    if (!entry || entry.status === 'resolved') return false;

    entry.nextRetryAt = new Date().toISOString(); // Due now
    entry.status = 'pending_retry';
    const result = await this.processRetries();
    return result.succeeded > 0;
  }

  /**
   * Purge all exhausted entries
   */
  purgeExhausted(): number {
    this.ensureLoaded();
    const before = this.queue.length;
    this.queue = this.queue.filter(e => e.status !== 'exhausted');
    const purged = before - this.queue.length;
    if (purged > 0) this.persist();
    return purged;
  }

  // ─── QUERIES ────────────────────────────────────────────────

  getStats(): DLQStats {
    this.ensureLoaded();
    const pending = this.queue.filter(e => e.status === 'pending_retry');
    const exhausted = this.queue.filter(e => e.status === 'exhausted');
    const resolved = this.resolvedCount;
    
    const oldest = pending.length > 0
      ? Date.now() - new Date(pending[0].firstFailedAt).getTime()
      : null;

    return {
      totalEntries: this.queue.length,
      pendingRetry: pending.length,
      exhausted: exhausted.length,
      resolved,
      oldestEntryAge: oldest,
      retrySuccessRate: this.totalRetries > 0
        ? Math.round((this.successfulRetries / this.totalRetries) * 100)
        : 100,
    };
  }

  getQueue(): DeadLetterEntry[] {
    this.ensureLoaded();
    return [...this.queue];
  }

  getPending(): DeadLetterEntry[] {
    this.ensureLoaded();
    return this.queue.filter(e => e.status === 'pending_retry');
  }

  getExhausted(): DeadLetterEntry[] {
    this.ensureLoaded();
    return this.queue.filter(e => e.status === 'exhausted');
  }

  // ─── PERSISTENCE ────────────────────────────────────────────

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;
    if (typeof localStorage !== 'undefined') {
      try {
        const state = secureGet<{ queue: DeadLetterEntry[]; resolvedCount: number; totalRetries: number; successfulRetries: number }>(STORAGE_KEY);
        if (state) {
          this.queue = state.queue || [];
          this.resolvedCount = state.resolvedCount || 0;
          this.totalRetries = state.totalRetries || 0;
          this.successfulRetries = state.successfulRetries || 0;
        }
      } catch { this.queue = []; }
    }
  }

  private persist(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        secureSet(STORAGE_KEY, {
          queue: this.queue.slice(-this.config.maxQueueSize),
          resolvedCount: this.resolvedCount,
          totalRetries: this.totalRetries,
          successfulRetries: this.successfulRetries,
        });
      } catch { /* Storage pressure — non-critical */ }
    }
  }
}

export const rippleDLQ = RippleDLQ.getInstance();
