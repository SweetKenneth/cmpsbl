/**
 * S-Tier Crown Jewel #14 — MEMORY Event Sourcing Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 14 | CJPI: 93 | Module: MEMORY | Type: Architecture
 *
 * Append-only event store with materialized view projections,
 * snapshots, event replay, stream isolation, and temporal queries.
 * Foundation for CQRS, audit trails, and undo/redo systems.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface DomainEvent<T = unknown> {
  id: string;
  stream: string;
  type: string;
  payload: T;
  timestamp: number;
  version: number;
  metadata?: Record<string, unknown>;
  causationId?: string;
  correlationId?: string;
}

export interface Projection<TState> {
  name: string;
  initialState: TState;
  handlers: Record<string, (state: TState, event: DomainEvent) => TState>;
}

export interface Snapshot<TState> {
  stream: string;
  projection: string;
  state: TState;
  version: number;
  timestamp: number;
}

export function createEventStore() {
  const events: DomainEvent[] = [];
  const projections = new Map<string, Projection<any>>();
  const snapshots = new Map<string, Snapshot<any>>();
  let globalSequence = 0;

  // ── Event Append ─────────────────────────────────────────────────

  function append<T>(stream: string, type: string, payload: T, meta?: { causationId?: string; correlationId?: string; metadata?: Record<string, unknown> }): DomainEvent<T> {
    const streamEvents = events.filter(e => e.stream === stream);
    const version = streamEvents.length + 1;
    const event: DomainEvent<T> = {
      id: `evt_${++globalSequence}_${Date.now().toString(36)}`,
      stream,
      type,
      payload,
      timestamp: Date.now(),
      version,
      metadata: meta?.metadata,
      causationId: meta?.causationId,
      correlationId: meta?.correlationId,
    };
    events.push(event as DomainEvent);
    return event;
  }

  function appendBatch(stream: string, batch: Array<{ type: string; payload: unknown }>): DomainEvent[] {
    return batch.map(b => append(stream, b.type, b.payload));
  }

  // ── Stream Queries ───────────────────────────────────────────────

  function getStream(stream: string, opts?: { fromVersion?: number; toVersion?: number }): DomainEvent[] {
    let result = events.filter(e => e.stream === stream);
    if (opts?.fromVersion) result = result.filter(e => e.version >= opts.fromVersion!);
    if (opts?.toVersion) result = result.filter(e => e.version <= opts.toVersion!);
    return result;
  }

  function getByType(type: string, opts?: { since?: number; limit?: number }): DomainEvent[] {
    let result = events.filter(e => e.type === type);
    if (opts?.since) result = result.filter(e => e.timestamp >= opts.since!);
    if (opts?.limit) result = result.slice(-opts.limit);
    return result;
  }

  function getByCorrelation(correlationId: string): DomainEvent[] {
    return events.filter(e => e.correlationId === correlationId);
  }

  // ── Projections ──────────────────────────────────────────────────

  function registerProjection<TState>(projection: Projection<TState>) {
    projections.set(projection.name, projection);
  }

  function project<TState>(projectionName: string, stream: string): TState {
    const proj = projections.get(projectionName) as Projection<TState> | undefined;
    if (!proj) throw new Error(`Projection '${projectionName}' not registered`);

    // Check for snapshot
    const snapKey = `${projectionName}:${stream}`;
    const snap = snapshots.get(snapKey) as Snapshot<TState> | undefined;
    let state = snap ? { ...snap.state } : { ...proj.initialState };
    const fromVersion = snap ? snap.version + 1 : 1;

    const streamEvents = getStream(stream, { fromVersion });
    for (const event of streamEvents) {
      const handler = proj.handlers[event.type];
      if (handler) state = handler(state, event);
    }

    return state;
  }

  function takeSnapshot<TState>(projectionName: string, stream: string): Snapshot<TState> {
    const state = project<TState>(projectionName, stream);
    const streamEvents = getStream(stream);
    const version = streamEvents.length;
    const snap: Snapshot<TState> = {
      stream, projection: projectionName,
      state, version, timestamp: Date.now(),
    };
    snapshots.set(`${projectionName}:${stream}`, snap);
    return snap;
  }

  // ── Replay ───────────────────────────────────────────────────────

  function replay(stream: string, handler: (event: DomainEvent) => void, opts?: { fromVersion?: number }) {
    const streamEvents = getStream(stream, opts);
    for (const event of streamEvents) handler(event);
  }

  // ── Stats ────────────────────────────────────────────────────────

  function getStats() {
    const streams = new Set(events.map(e => e.stream));
    return {
      totalEvents: events.length,
      streams: streams.size,
      projections: projections.size,
      snapshots: snapshots.size,
      eventTypes: [...new Set(events.map(e => e.type))],
    };
  }

  return {
    append, appendBatch,
    getStream, getByType, getByCorrelation,
    registerProjection, project, takeSnapshot,
    replay, getStats,
    get length() { return events.length; },
  };
}
