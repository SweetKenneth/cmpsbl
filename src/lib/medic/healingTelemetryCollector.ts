/**
 * MEDIC — Healing Telemetry Collector
 * Event bus tracking MTTR, triage accuracy, repair success rates,
 * transplant outcomes, and quarantine durations.
 * @module medic/healingTelemetryCollector
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type HealingEventType =
  | 'triage_assessed'
  | 'root_cause_identified'
  | 'playbook_executed'
  | 'transplant_started'
  | 'transplant_completed'
  | 'transplant_failed'
  | 'quarantine_entered'
  | 'quarantine_readmitted'
  | 'repair_success'
  | 'repair_failed'
  | 'degradation_predicted'
  | 'healing_ticket_created';

export interface HealingEvent {
  type: HealingEventType;
  nodeId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface HealingSnapshot {
  windowMs: number;
  totalEvents: number;
  mttr: number;                    // ms
  triageCount: number;
  repairSuccessRate: number;       // 0–100
  transplantSuccessRate: number;   // 0–100
  quarantineAvgDurationMs: number;
  healingTicketsCreated: number;
  predictionsIssued: number;
}

type HealingListener = (event: HealingEvent) => void;

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_EVENTS = 1000;
const DEFAULT_WINDOW_MS = 3600 * 1000;

// ── State ──────────────────────────────────────────────────────────────────

const events: HealingEvent[] = [];
const listeners: HealingListener[] = [];
const repairTimestamps = new Map<string, number>(); // nodeId → repair start

// ── Core ───────────────────────────────────────────────────────────────────

export function emitHealing(event: HealingEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  // Track repair start/end for MTTR
  if (event.type === 'playbook_executed' && event.nodeId) {
    repairTimestamps.set(event.nodeId, event.timestamp);
  }
  if ((event.type === 'repair_success' || event.type === 'repair_failed') && event.nodeId) {
    repairTimestamps.delete(event.nodeId);
  }

  for (const listener of listeners) {
    try { listener(event); } catch { /* non-blocking */ }
  }
}

export function subscribeHealing(listener: HealingListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function healingSnapshot(windowMs = DEFAULT_WINDOW_MS): HealingSnapshot {
  const cutoff = Date.now() - windowMs;
  const windowed = events.filter(e => e.timestamp >= cutoff);

  const count = (type: HealingEventType) => windowed.filter(e => e.type === type).length;

  const repairSuccesses = count('repair_success');
  const repairFailures = count('repair_failed');
  const transplantCompleted = count('transplant_completed');
  const transplantFailed = count('transplant_failed');

  // MTTR from repair_success events
  const repairEvents = windowed.filter(e => e.type === 'repair_success' && e.metadata?.durationMs);
  const mttr = repairEvents.length > 0
    ? Math.round(repairEvents.reduce((s, e) => s + (e.metadata?.durationMs as number || 0), 0) / repairEvents.length)
    : 0;

  // Quarantine durations
  const quarantineReadmits = windowed.filter(e => e.type === 'quarantine_readmitted' && e.metadata?.durationMs);
  const quarantineAvg = quarantineReadmits.length > 0
    ? Math.round(quarantineReadmits.reduce((s, e) => s + (e.metadata?.durationMs as number || 0), 0) / quarantineReadmits.length)
    : 0;

  return {
    windowMs,
    totalEvents: windowed.length,
    mttr,
    triageCount: count('triage_assessed'),
    repairSuccessRate: (repairSuccesses + repairFailures) > 0
      ? Math.round((repairSuccesses / (repairSuccesses + repairFailures)) * 100)
      : 100,
    transplantSuccessRate: (transplantCompleted + transplantFailed) > 0
      ? Math.round((transplantCompleted / (transplantCompleted + transplantFailed)) * 100)
      : 100,
    quarantineAvgDurationMs: quarantineAvg,
    healingTicketsCreated: count('healing_ticket_created'),
    predictionsIssued: count('degradation_predicted'),
  };
}

export function getRecentHealingEvents(count = 50): HealingEvent[] {
  return events.slice(-count);
}

export function resetHealingTelemetry(): void {
  events.length = 0;
  listeners.length = 0;
  repairTimestamps.clear();
}
