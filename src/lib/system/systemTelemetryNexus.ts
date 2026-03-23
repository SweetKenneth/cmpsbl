/**
 * System Telemetry Nexus — SYSTEM v9.0.0
 * Unified telemetry emitter providing real-time SYSTEM health,
 * audit results, repair actions, and degradation state.
 */

// --- Types ---

export type TelemetryEventType =
  | 'audit_completed'
  | 'repair_executed'
  | 'degradation_change'
  | 'health_update'
  | 'config_change'
  | 'lifecycle_transition'
  | 'budget_alert'
  | 'prediction_generated'
  | 'maintenance_window'
  | 'chain_verification';

export interface SystemTelemetryEvent {
  id: string;
  type: TelemetryEventType;
  timestamp: number;
  source: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data: Record<string, unknown>;
  correlationId?: string;
}

export interface TelemetrySnapshot {
  timestamp: number;
  healthScore: number;
  degradationLevel: string;
  activeAlerts: number;
  pendingRepairs: number;
  auditScore: number;
  chainIntegrity: number;
  nodesOnline: number;
  nodesTotal: number;
  eventRate: number; // events per minute
}

type TelemetryListener = (event: SystemTelemetryEvent) => void;

// --- Constants ---

const MAX_EVENTS = 1000;
const MAX_SNAPSHOTS = 200;
const RATE_WINDOW_MS = 60_000;

// --- State ---

const eventBuffer: SystemTelemetryEvent[] = [];
const snapshots: TelemetrySnapshot[] = [];
const listeners: Set<TelemetryListener> = new Set();
let eventCounter = 0;

// --- Core ---

export function emit(
  type: TelemetryEventType,
  data: Record<string, unknown>,
  opts: {
    source?: string;
    severity?: SystemTelemetryEvent['severity'];
    correlationId?: string;
  } = {}
): SystemTelemetryEvent {
  const event: SystemTelemetryEvent = {
    id: `sys_tel_${++eventCounter}`,
    type,
    timestamp: Date.now(),
    source: opts.source ?? 'SYSTEM',
    severity: opts.severity ?? inferSeverity(type),
    data,
    correlationId: opts.correlationId,
  };

  eventBuffer.push(event);
  if (eventBuffer.length > MAX_EVENTS) {
    eventBuffer.splice(0, eventBuffer.length - MAX_EVENTS);
  }

  // Fan out to listeners (non-blocking)
  for (const listener of listeners) {
    try { listener(event); } catch { /* non-blocking */ }
  }

  return event;
}

function inferSeverity(type: TelemetryEventType): SystemTelemetryEvent['severity'] {
  switch (type) {
    case 'degradation_change': return 'warning';
    case 'budget_alert': return 'warning';
    case 'repair_executed': return 'info';
    case 'prediction_generated': return 'warning';
    case 'chain_verification': return 'info';
    default: return 'info';
  }
}

export function subscribe(listener: TelemetryListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function takeSnapshot(metrics: Omit<TelemetrySnapshot, 'timestamp' | 'eventRate'>): TelemetrySnapshot {
  const now = Date.now();
  const recentEvents = eventBuffer.filter(e => now - e.timestamp < RATE_WINDOW_MS);

  const snapshot: TelemetrySnapshot = {
    ...metrics,
    timestamp: now,
    eventRate: Math.round((recentEvents.length / RATE_WINDOW_MS) * 60_000),
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);
  }

  return snapshot;
}

export function getRecentEvents(count: number = 50): SystemTelemetryEvent[] {
  return eventBuffer.slice(-count);
}

export function getEventsByType(type: TelemetryEventType, count: number = 50): SystemTelemetryEvent[] {
  return eventBuffer.filter(e => e.type === type).slice(-count);
}

export function getSnapshots(count: number = 20): TelemetrySnapshot[] {
  return snapshots.slice(-count);
}

export function getLatestSnapshot(): TelemetrySnapshot | null {
  return snapshots.length > 0 ? { ...snapshots[snapshots.length - 1] } : null;
}

export function getEventRate(): number {
  const now = Date.now();
  const recent = eventBuffer.filter(e => now - e.timestamp < RATE_WINDOW_MS);
  return Math.round((recent.length / RATE_WINDOW_MS) * 60_000);
}

export function getEventCount(): number {
  return eventBuffer.length;
}

export function clearTelemetryState(): void {
  eventBuffer.length = 0;
  snapshots.length = 0;
  listeners.clear();
  eventCounter = 0;
}
