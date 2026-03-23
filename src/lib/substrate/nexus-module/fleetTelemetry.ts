/**
 * NEXUS — Fleet Intelligence Dashboard Feed
 * Structured telemetry emitter for live fleet health and routing decisions.
 */

export type FleetEventType =
  | 'routing_decision'
  | 'fallback_triggered'
  | 'provider_degraded'
  | 'provider_recovered'
  | 'budget_alert'
  | 'quota_warning'
  | 'consensus_completed'
  | 'dedup_hit'
  | 'stream_error'
  | 'fleet_reranked';

export interface FleetTelemetryEvent {
  id: string;
  type: FleetEventType;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  providerId?: string;
  metadata: Record<string, unknown>;
  summary: string;
}

export interface FleetSnapshot {
  timestamp: string;
  providerCount: number;
  healthyCount: number;
  degradedCount: number;
  totalRequestsLastHour: number;
  totalCostLastHour: number;
  topProvider: string | null;
  recentEvents: FleetTelemetryEvent[];
}

type FleetListener = (event: FleetTelemetryEvent) => void;

const eventBuffer: FleetTelemetryEvent[] = [];
const listeners: FleetListener[] = [];
const MAX_BUFFER = 500;
let counter = 0;

export function emitFleetEvent(
  type: FleetEventType,
  summary: string,
  options?: { providerId?: string; severity?: 'info' | 'warning' | 'critical'; metadata?: Record<string, unknown> }
): FleetTelemetryEvent {
  const event: FleetTelemetryEvent = {
    id: `fleet-${Date.now()}-${++counter}`,
    type,
    timestamp: new Date().toISOString(),
    severity: options?.severity ?? inferFleetSeverity(type),
    providerId: options?.providerId,
    metadata: options?.metadata ?? {},
    summary,
  };

  eventBuffer.push(event);
  if (eventBuffer.length > MAX_BUFFER) eventBuffer.shift();

  for (const listener of listeners) {
    try { listener(event); } catch {}
  }

  return event;
}

function inferFleetSeverity(type: FleetEventType): 'info' | 'warning' | 'critical' {
  switch (type) {
    case 'provider_degraded':
    case 'budget_alert':
    case 'stream_error':
      return 'warning';
    case 'quota_warning':
      return 'critical';
    case 'fallback_triggered':
      return 'warning';
    default:
      return 'info';
  }
}

export function onFleetEvent(listener: FleetListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getRecentFleetEvents(count = 50): FleetTelemetryEvent[] {
  return eventBuffer.slice(-count);
}

export function getFleetEventsByType(type: FleetEventType): FleetTelemetryEvent[] {
  return eventBuffer.filter(e => e.type === type);
}

export function getFleetEventsByProvider(providerId: string): FleetTelemetryEvent[] {
  return eventBuffer.filter(e => e.providerId === providerId);
}

export function buildFleetSnapshot(
  providerIds: string[],
  healthScores: Map<string, number>,
  requestCount: number,
  costMillicents: number
): FleetSnapshot {
  const healthyCount = providerIds.filter(id => (healthScores.get(id) ?? 0) >= 50).length;

  return {
    timestamp: new Date().toISOString(),
    providerCount: providerIds.length,
    healthyCount,
    degradedCount: providerIds.length - healthyCount,
    totalRequestsLastHour: requestCount,
    totalCostLastHour: costMillicents,
    topProvider: providerIds.length > 0
      ? providerIds.reduce((best, id) =>
          (healthScores.get(id) ?? 0) > (healthScores.get(best) ?? 0) ? id : best
        )
      : null,
    recentEvents: eventBuffer.slice(-10),
  };
}

export function clearFleetBuffer(): void {
  eventBuffer.length = 0;
}
