/**
 * ENGINEER — Engineer Telemetry Nexus
 * Unified event bus tracking MTTR, finding velocity, proposal approval rates,
 * and auto-tune effectiveness with time-windowed snapshots.
 * @module engineer/engineerTelemetryNexus
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type EngineerEventType =
  | 'finding_created'
  | 'finding_resolved'
  | 'proposal_created'
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'repair_started'
  | 'repair_completed'
  | 'repair_failed'
  | 'tune_applied'
  | 'tune_reverted'
  | 'regression_detected'
  | 'anomaly_detected';

export interface EngineerEvent {
  type: EngineerEventType;
  timestamp: number;
  nodeId?: string;
  metadata?: Record<string, unknown>;
}

export interface TelemetrySnapshot {
  windowMs: number;
  findingVelocity: number;      // findings per hour
  mttr: number;                 // mean time to repair (ms)
  proposalApprovalRate: number; // 0–100%
  tuneEffectiveness: number;    // 0–100% (applied vs reverted)
  repairSuccessRate: number;    // 0–100%
  totalEvents: number;
  regressionCount: number;
  anomalyCount: number;
}

type Listener = (event: EngineerEvent) => void;

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_EVENTS = 1000;
const DEFAULT_WINDOW_MS = 3600 * 1000; // 1 hour

// ── State ──────────────────────────────────────────────────────────────────

const events: EngineerEvent[] = [];
const listeners: Listener[] = [];

// Track finding open/close for MTTR
const openFindings = new Map<string, number>(); // findingId → open timestamp

// ── Core ───────────────────────────────────────────────────────────────────

export function emit(event: EngineerEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  // Track MTTR
  if (event.type === 'finding_created' && event.metadata?.findingId) {
    openFindings.set(event.metadata.findingId as string, event.timestamp);
  }
  if (event.type === 'finding_resolved' && event.metadata?.findingId) {
    openFindings.delete(event.metadata.findingId as string);
  }

  // Fan-out to listeners (non-blocking)
  for (const listener of listeners) {
    try { listener(event); } catch { /* non-blocking */ }
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function snapshot(windowMs = DEFAULT_WINDOW_MS): TelemetrySnapshot {
  const cutoff = Date.now() - windowMs;
  const windowed = events.filter(e => e.timestamp >= cutoff);

  const count = (type: EngineerEventType) => windowed.filter(e => e.type === type).length;

  const findingsCreated = count('finding_created');
  const findingsResolved = count('finding_resolved');
  const proposalsCreated = count('proposal_created');
  const proposalsApproved = count('proposal_approved');
  const proposalsRejected = count('proposal_rejected');
  const repairsCompleted = count('repair_completed');
  const repairsFailed = count('repair_failed');
  const tunesApplied = count('tune_applied');
  const tunesReverted = count('tune_reverted');
  const regressions = count('regression_detected');
  const anomalies = count('anomaly_detected');

  // MTTR: average time between finding_created and finding_resolved
  const resolvedEvents = windowed.filter(e => e.type === 'finding_resolved' && e.metadata?.findingId);
  const createdEvents = windowed.filter(e => e.type === 'finding_created' && e.metadata?.findingId);
  const createdMap = new Map(createdEvents.map(e => [e.metadata!.findingId as string, e.timestamp]));
  const repairTimes: number[] = [];
  for (const re of resolvedEvents) {
    const openedAt = createdMap.get(re.metadata!.findingId as string);
    if (openedAt) repairTimes.push(re.timestamp - openedAt);
  }
  const mttr = repairTimes.length > 0
    ? Math.round(repairTimes.reduce((a, b) => a + b, 0) / repairTimes.length)
    : 0;

  const windowHours = windowMs / (3600 * 1000);

  return {
    windowMs,
    findingVelocity: Math.round((findingsCreated / windowHours) * 100) / 100,
    mttr,
    proposalApprovalRate: proposalsCreated > 0
      ? Math.round((proposalsApproved / (proposalsApproved + proposalsRejected || 1)) * 100)
      : 0,
    tuneEffectiveness: (tunesApplied + tunesReverted) > 0
      ? Math.round((tunesApplied / (tunesApplied + tunesReverted)) * 100)
      : 100,
    repairSuccessRate: (repairsCompleted + repairsFailed) > 0
      ? Math.round((repairsCompleted / (repairsCompleted + repairsFailed)) * 100)
      : 100,
    totalEvents: windowed.length,
    regressionCount: regressions,
    anomalyCount: anomalies,
  };
}

export function getRecentEvents(count = 50): EngineerEvent[] {
  return events.slice(-count);
}

export function resetTelemetry(): void {
  events.length = 0;
  listeners.length = 0;
  openFindings.clear();
}
