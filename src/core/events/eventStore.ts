/**
 * GOAL — Event-Sourced Event Store
 * Append-only log for all system events (repairs, auth failures, deployments, etc.)
 * DECODE may query but may NOT fabricate events.
 * vX.STRUCTURE.2
 */

// ═══ Types ════════════════════════════════════════════════════════

export type EventType =
  | 'PROBE_REPAIRED'
  | 'PROBE_ESCALATED'
  | 'PROBE_FAILED_SAFE'
  | 'AUTH_FAILURE'
  | 'ENGINE_DEPLOY'
  | 'HEALTH_STATE_CHANGE'
  | 'SNAPSHOT_CAPTURED'
  | 'INTEGRITY_CHECK'
  | 'DECODE_QUERY'
  | 'CIRCUIT_BREAKER_TRIP'
  | 'CIRCUIT_BREAKER_RESET'
  | 'MEMORY_TIER_CHANGE'
  | 'RATE_LIMIT_HIT'
  | 'MODULE_RECOVERY'
  | 'EVOLUTION_APPLIED'
  | 'EVOLUTION_ROLLBACK'
  | 'GOVERNANCE_VETO'
  | 'TENANT_CIRCUIT_TRIP'
  | 'SNAPSHOT_DRIFT_DETECTED'
  | 'QUOTA_EXHAUSTED'
  | 'SUBSYSTEM_HEALED';

export interface SystemEvent {
  eventId: string;
  type: EventType;
  module: string;
  entityId: string;
  beforeState: string;
  afterState: string;
  timestamp: string;
  correlationId: string;
}

// ═══ Store ═════════════════════════════════════════════════════════

const events: SystemEvent[] = [];
const MAX_EVENTS = 10_000;

/**
 * Append an event to the store. Immutable — once appended, cannot be modified.
 */
export function appendEvent(
  type: EventType,
  module: string,
  entityId: string,
  beforeState: string,
  afterState: string,
  correlationId?: string
): SystemEvent {
  const event: SystemEvent = {
    eventId: crypto.randomUUID(),
    type,
    module,
    entityId,
    beforeState,
    afterState,
    timestamp: new Date().toISOString(),
    correlationId: correlationId ?? crypto.randomUUID(),
  };

  events.push(event);

  // Evict oldest if over max
  while (events.length > MAX_EVENTS) {
    events.shift();
  }

  return event;
}

// ═══ Queries (Read-Only for DECODE) ═══════════════════════════════

export function queryEvents(filter?: {
  type?: EventType;
  module?: string;
  since?: string;
  limit?: number;
  correlationId?: string;
}): SystemEvent[] {
  let result = [...events];

  if (filter?.type) {
    result = result.filter(e => e.type === filter.type);
  }
  if (filter?.module) {
    result = result.filter(e => e.module === filter.module);
  }
  if (filter?.correlationId) {
    result = result.filter(e => e.correlationId === filter.correlationId);
  }
  if (filter?.since) {
    const since = new Date(filter.since).getTime();
    result = result.filter(e => new Date(e.timestamp).getTime() >= since);
  }

  // Most recent first
  result.reverse();

  if (filter?.limit) {
    result = result.slice(0, filter.limit);
  }

  return result;
}

export function getEventCount(): number {
  return events.length;
}

export function getEventsByCorrelation(correlationId: string): SystemEvent[] {
  return events.filter(e => e.correlationId === correlationId);
}

export function getRecentEvents(limit = 50): SystemEvent[] {
  return [...events].reverse().slice(0, limit);
}

/**
 * Get event type distribution for telemetry.
 */
export function getEventDistribution(): Record<EventType, number> {
  const dist = {} as Record<EventType, number>;
  for (const e of events) {
    dist[e.type] = (dist[e.type] || 0) + 1;
  }
  return dist;
}
