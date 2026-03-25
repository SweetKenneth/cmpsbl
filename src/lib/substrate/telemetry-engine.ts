/**
 * CMPSBL® Telemetry Engine
 * Canonical Observability Layer
 * 
 * The Telemetry Engine is the single source of truth for all execution observability.
 * It records engine execution events, governance blocks, compliance signals, and
 * evolution cycle outcomes without affecting execution flow.
 * 
 * Responsibilities:
 * - Record engine execution events (start/end, success/failure)
 * - Record governance blocks and overrides
 * - Record Inclusive scan results (internal + external)
 * - Record EVOLUTION cycle outcomes
 * - Emit structured, normalized telemetry events
 * - Provide queryable telemetry history
 */

import { supabase } from '@/integrations/supabase/client';
import { shouldSample as shouldSampleFn } from './telemetry-sampler';
import type { EngineName, DispatchResult, DispatchErrorCode } from './engine-bus';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TelemetryEventType = 
  | 'engine_dispatch_start'
  | 'engine_dispatch_end'
  | 'engine_dispatch_error'
  | 'governance_block'
  | 'governance_override'
  | 'inclusive_scan'
  | 'inclusive_repair'
  | 'inclusive_validate'
  | 'evolution_scan'
  | 'evolution_apply_shadow'
  | 'evolution_apply_production'
  | 'evolution_verify'
  | 'evolution_rollback'
  | 'state_read'
  | 'state_write'
  | 'state_validation_warning'
  | 'custom';

export type TelemetrySeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  severity: TelemetrySeverity;
  timestamp: string;
  source: {
    engine?: EngineName;
    module?: string;
    action?: string;
  };
  payload: {
    durationMs?: number;
    success?: boolean;
    errorCode?: DispatchErrorCode;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  };
  correlation_id?: string;
  session_id?: string;
}

export interface TelemetryState {
  initialized: boolean;
  totalEvents: number;
  eventsByType: Record<TelemetryEventType, number>;
  eventsBySeverity: Record<TelemetrySeverity, number>;
  recentEvents: TelemetryEvent[];
  lastEventTimestamp: string | null;
}

export interface TelemetryQuery {
  type?: TelemetryEventType | TelemetryEventType[];
  severity?: TelemetrySeverity | TelemetrySeverity[];
  engine?: EngineName;
  module?: string;
  since?: string;
  limit?: number;
  correlation_id?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TELEMETRY ENGINE CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class TelemetryEngineClient {
  private static instance: TelemetryEngineClient;
  // Ring buffer for event log — O(1) insertion, bounded memory, no splice()
  private eventRing: TelemetryEvent[];
  private eventHead = 0;
  private eventCount = 0;
  private readonly MAX_EVENT_LOG = 500;
  private state: TelemetryState = {
    initialized: false,
    totalEvents: 0,
    eventsByType: {} as Record<TelemetryEventType, number>,
    eventsBySeverity: {} as Record<TelemetrySeverity, number>,
    recentEvents: [],
    lastEventTimestamp: null,
  };
  private currentSessionId: string;

  private constructor() {
    this.eventRing = new Array(this.MAX_EVENT_LOG);
    this.currentSessionId = this.generateId();
    this.state.initialized = true;
    this.initializeCounters();
  }

  static getInstance(): TelemetryEngineClient {
    if (!TelemetryEngineClient.instance) {
      TelemetryEngineClient.instance = new TelemetryEngineClient();
    }
    return TelemetryEngineClient.instance;
  }

  private initializeCounters(): void {
    const types: TelemetryEventType[] = [
      'engine_dispatch_start', 'engine_dispatch_end', 'engine_dispatch_error',
      'governance_block', 'governance_override',
      'inclusive_scan', 'inclusive_repair', 'inclusive_validate',
      'evolution_scan', 'evolution_apply_shadow', 'evolution_apply_production',
      'evolution_verify', 'evolution_rollback',
      'state_read', 'state_write', 'state_validation_warning', 'custom'
    ];
    for (const type of types) {
      this.state.eventsByType[type] = 0;
    }

    const severities: TelemetrySeverity[] = ['debug', 'info', 'warn', 'error', 'critical'];
    for (const severity of severities) {
      this.state.eventsBySeverity[severity] = 0;
    }
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE EMIT METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Emit a telemetry event (non-blocking, side-effect free)
   * Optimized: batches persistence calls to reduce DB write pressure
   */
  emit(
    type: TelemetryEventType,
    severity: TelemetrySeverity,
    source: TelemetryEvent['source'],
    payload: TelemetryEvent['payload'],
    correlationId?: string
  ): TelemetryEvent {
    // Apply sampling — drop debug/info noise during bursts
    if (!shouldSampleFn(severity)) {
      // Return a stub event without recording or persisting
      return {
        id: 'sampled-out',
        type,
        severity,
        timestamp: new Date().toISOString(),
        source,
        payload,
        correlation_id: correlationId,
        session_id: this.currentSessionId,
      };
    }

    const event: TelemetryEvent = {
      id: this.generateId(),
      type,
      severity,
      timestamp: new Date().toISOString(),
      source,
      payload,
      correlation_id: correlationId,
      session_id: this.currentSessionId,
    };

    // Update state (non-blocking)
    this.recordEvent(event);

    // Batch persistence — only persist warn/error/critical immediately
    if (severity === 'error' || severity === 'critical' || severity === 'warn') {
      this.persistEvent(event).catch(() => {});
    } else {
      this.enqueuePersistence(event);
    }

    return event;
  }

  /**
   * Emit engine dispatch start
   */
  emitDispatchStart(
    engine: EngineName,
    command: string,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      'engine_dispatch_start',
      'info',
      { engine, action: command },
      { metadata: { command } },
      correlationId
    );
  }

  /**
   * Emit engine dispatch end
   */
  emitDispatchEnd<T>(
    result: DispatchResult<T>,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      result.success ? 'engine_dispatch_end' : 'engine_dispatch_error',
      result.success ? 'info' : 'error',
      { engine: result.engine, action: result.command },
      {
        durationMs: result.durationMs,
        success: result.success,
        errorCode: result.errorCode,
        errorMessage: result.error,
        metadata: { retryCount: result.retryCount, stage: result.stage },
      },
      correlationId
    );
  }

  /**
   * Emit governance block event
   */
  emitGovernanceBlock(
    module: string,
    action: string,
    reason: string,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      'governance_block',
      'warn',
      { module, action },
      { metadata: { reason, blocked: true } },
      correlationId
    );
  }

  /**
   * Emit governance override event
   */
  emitGovernanceOverride(
    module: string,
    action: string,
    overrideReason: string,
    approvedBy?: string,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      'governance_override',
      'warn',
      { module, action },
      { metadata: { overrideReason, approvedBy, overridden: true } },
      correlationId
    );
  }

  /**
   * Emit Inclusive scan result
   */
  emitInclusiveScan(
    target: string,
    score: number,
    issueCount: number,
    isInternal: boolean,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      'inclusive_scan',
      score >= 80 ? 'info' : score >= 50 ? 'warn' : 'error',
      { module: 'inclusive', action: 'scan' },
      {
        success: true,
        metadata: { target, score, issueCount, isInternal },
      },
      correlationId
    );
  }

  /**
   * Emit EVOLUTION cycle event
   */
  emitEvolutionEvent(
    action: 'scan' | 'apply_shadow' | 'apply_production' | 'verify' | 'rollback',
    planId: string,
    success: boolean,
    details?: Record<string, unknown>,
    correlationId?: string
  ): TelemetryEvent {
    const typeMap: Record<string, TelemetryEventType> = {
      scan: 'evolution_scan',
      apply_shadow: 'evolution_apply_shadow',
      apply_production: 'evolution_apply_production',
      verify: 'evolution_verify',
      rollback: 'evolution_rollback',
    };

    return this.emit(
      typeMap[action] || 'custom',
      success ? 'info' : 'error',
      { module: 'evolution', action },
      {
        success,
        metadata: { planId, ...details },
      },
      correlationId
    );
  }

  /**
   * Emit state read event
   */
  emitStateRead(
    schema: string,
    field?: string,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      'state_read',
      'debug',
      { module: 'state_engine' },
      { metadata: { schema, field } },
      correlationId
    );
  }

  /**
   * Emit state write event
   */
  emitStateWrite(
    schema: string,
    field: string,
    valid: boolean,
    correlationId?: string
  ): TelemetryEvent {
    return this.emit(
      valid ? 'state_write' : 'state_validation_warning',
      valid ? 'debug' : 'warn',
      { module: 'state_engine' },
      { success: valid, metadata: { schema, field } },
      correlationId
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Query telemetry events
   */
  query(q: TelemetryQuery = {}): TelemetryEvent[] {
    const limit = q.limit || this.MAX_EVENT_LOG;

    // Fast path: no filters → return tail of ring buffer
    const hasFilter = q.type || q.severity || q.engine || q.module || q.since || q.correlation_id;
    if (!hasFilter) {
      return this.readRingTail(Math.min(limit, this.eventCount));
    }

    // Pre-compute filter sets for O(1) lookups
    const typeSet = q.type ? new Set(Array.isArray(q.type) ? q.type : [q.type]) : null;
    const sevSet = q.severity ? new Set(Array.isArray(q.severity) ? q.severity : [q.severity]) : null;
    const sinceMs = q.since ? new Date(q.since).getTime() : 0;

    // Single-pass filter (iterate backwards for limit optimization)
    const result: TelemetryEvent[] = [];
    for (let i = 0; i < this.eventCount && result.length < limit; i++) {
      // Reverse order: most recent first
      const idx = (this.eventHead - 1 - i + this.MAX_EVENT_LOG) % this.MAX_EVENT_LOG;
      const e = this.eventRing[idx];
      if (!e) continue;
      if (typeSet && !typeSet.has(e.type)) continue;
      if (sevSet && !sevSet.has(e.severity)) continue;
      if (q.engine && e.source.engine !== q.engine) continue;
      if (q.module && e.source.module !== q.module) continue;
      if (sinceMs && new Date(e.timestamp).getTime() < sinceMs) continue;
      if (q.correlation_id && e.correlation_id !== q.correlation_id) continue;
      result.push(e);
    }

    return result.reverse();
  }

  /**
   * Get telemetry state
   */
  getState(): TelemetryState {
    return {
      ...this.state,
      recentEvents: this.readRingTail(20),
    };
  }

  /**
   * Get events by engine — reverse scan for limit optimization
   */
  getEventsByEngine(engine: EngineName, limit: number = 20): TelemetryEvent[] {
    const result: TelemetryEvent[] = [];
    for (let i = 0; i < this.eventCount && result.length < limit; i++) {
      const idx = (this.eventHead - 1 - i + this.MAX_EVENT_LOG) % this.MAX_EVENT_LOG;
      const e = this.eventRing[idx];
      if (e && e.source.engine === engine) result.push(e);
    }
    return result.reverse();
  }

  /**
   * Get error events — reverse scan for limit optimization
   */
  getErrors(limit: number = 50): TelemetryEvent[] {
    const result: TelemetryEvent[] = [];
    for (let i = 0; i < this.eventCount && result.length < limit; i++) {
      const idx = (this.eventHead - 1 - i + this.MAX_EVENT_LOG) % this.MAX_EVENT_LOG;
      const e = this.eventRing[idx];
      if (e) {
        const s = e.severity;
        if (s === 'error' || s === 'critical') result.push(e);
      }
    }
    return result.reverse();
  }

  /**
   * Get governance events — reverse scan for limit optimization
   */
  getGovernanceEvents(limit: number = 50): TelemetryEvent[] {
    const result: TelemetryEvent[] = [];
    for (let i = 0; i < this.eventCount && result.length < limit; i++) {
      const idx = (this.eventHead - 1 - i + this.MAX_EVENT_LOG) % this.MAX_EVENT_LOG;
      const e = this.eventRing[idx];
      if (e) {
        const t = e.type;
        if (t === 'governance_block' || t === 'governance_override') result.push(e);
      }
    }
    return result.reverse();
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.currentSessionId;
  }

  /**
   * Start new session
   */
  startNewSession(): string {
    this.currentSessionId = this.generateId();
    return this.currentSessionId;
  }

  /**
   * Reset state (for testing)
   */
  reset(): void {
    this.eventRing = new Array(this.MAX_EVENT_LOG);
    this.eventHead = 0;
    this.eventCount = 0;
    this.state.totalEvents = 0;
    this.initializeCounters();
    this.state.lastEventTimestamp = null;
    this.currentSessionId = this.generateId();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private persistenceQueue: TelemetryEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_INTERVAL_MS = 5_000;
  private readonly MAX_BATCH_SIZE = 25;

  private recordEvent(event: TelemetryEvent): void {
    // Ring buffer insertion — O(1), no splice/shift needed
    this.eventRing[this.eventHead] = event;
    this.eventHead = (this.eventHead + 1) % this.MAX_EVENT_LOG;
    if (this.eventCount < this.MAX_EVENT_LOG) this.eventCount++;

    // Update counters
    this.state.totalEvents++;
    this.state.eventsByType[event.type] = (this.state.eventsByType[event.type] || 0) + 1;
    this.state.eventsBySeverity[event.severity] = (this.state.eventsBySeverity[event.severity] || 0) + 1;
    this.state.lastEventTimestamp = event.timestamp;
  }

  /** Read the most recent `count` events from the ring buffer in chronological order */
  private readRingTail(count: number): TelemetryEvent[] {
    const n = Math.min(count, this.eventCount);
    const result: TelemetryEvent[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const idx = (this.eventHead - n + i + this.MAX_EVENT_LOG) % this.MAX_EVENT_LOG;
      result[i] = this.eventRing[idx];
    }
    return result;
  }

  /** Enqueue low-severity events for batched persistence */
  private enqueuePersistence(event: TelemetryEvent): void {
    this.persistenceQueue.push(event);

    // Flush immediately if batch is full
    if (this.persistenceQueue.length >= this.MAX_BATCH_SIZE) {
      this.flushPersistenceQueue();
      return;
    }

    // Otherwise schedule a flush
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flushPersistenceQueue(), this.FLUSH_INTERVAL_MS);
    }
  }

  /** Flush batched events in a single network call */
  private flushPersistenceQueue(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.persistenceQueue.length === 0) return;

    const batch = this.persistenceQueue.splice(0, this.MAX_BATCH_SIZE);
    supabase.functions.invoke('pf-telemetry-log', {
      body: {
        batch: batch.map(event => ({
          event_name: event.type,
          event_data: {
            id: event.id,
            severity: event.severity,
            source: event.source,
            payload: event.payload,
          },
          session_id: event.session_id,
          metadata: { correlation_id: event.correlation_id },
        })),
      },
    }).catch(() => {});
  }

  private async persistEvent(event: TelemetryEvent): Promise<void> {
    try {
      await supabase.functions.invoke('pf-telemetry-log', {
        body: {
          event_name: event.type,
          event_data: {
            id: event.id,
            severity: event.severity,
            source: event.source,
            payload: event.payload,
          },
          session_id: event.session_id,
          metadata: { correlation_id: event.correlation_id },
        },
      });
    } catch {
      // Silently fail
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const telemetryEngine = TelemetryEngineClient.getInstance();
export { TelemetryEngineClient };
