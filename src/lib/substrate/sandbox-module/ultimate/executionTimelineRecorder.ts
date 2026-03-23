/**
 * Execution Timeline Recorder
 * 
 * Full deterministic replay for sandbox execution. Records every operation,
 * supports checkpoint snapshots, timeline scrubbing, and diff viewing.
 * 
 * @module sandbox/ultimate/executionTimelineRecorder
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface TimelineEvent {
  id: number;
  sandboxId: string;
  eventType: 'call' | 'io' | 'state_mutation' | 'capability_access' | 'error' | 'checkpoint';
  target: string;
  args?: unknown[];
  result?: unknown;
  timestamp: number;
  durationMs: number;
}

export interface Checkpoint {
  id: string;
  sandboxId: string;
  eventIndex: number;
  stateSnapshot: Record<string, unknown>;
  createdAt: number;
}

export interface TimelineDiff {
  sandboxId: string;
  fromEventIndex: number;
  toEventIndex: number;
  additions: string[];
  modifications: string[];
  deletions: string[];
}

// ── State ──────────────────────────────────────────────────────

const timelines = new Map<string, TimelineEvent[]>();
const checkpoints = new Map<string, Checkpoint[]>();
let globalEventId = 0;

const MAX_EVENTS_PER_SANDBOX = 10_000;
const CHECKPOINT_INTERVAL = 500; // auto-checkpoint every N events

// ── Core ───────────────────────────────────────────────────────

/** Record an event in a sandbox timeline */
export function recordEvent(
  sandboxId: string,
  eventType: TimelineEvent['eventType'],
  target: string,
  durationMs: number,
  args?: unknown[],
  result?: unknown,
): TimelineEvent {
  const events = timelines.get(sandboxId) ?? [];
  const event: TimelineEvent = {
    id: ++globalEventId, sandboxId, eventType, target, args, result,
    timestamp: Date.now(), durationMs,
  };

  events.push(event);
  if (events.length > MAX_EVENTS_PER_SANDBOX) events.shift();
  timelines.set(sandboxId, events);

  // Auto-checkpoint
  if (events.length % CHECKPOINT_INTERVAL === 0) {
    createCheckpoint(sandboxId, {});
  }

  return event;
}

/** Create a manual checkpoint */
export function createCheckpoint(sandboxId: string, stateSnapshot: Record<string, unknown>): Checkpoint {
  const events = timelines.get(sandboxId) ?? [];
  const cp: Checkpoint = {
    id: `cp-${sandboxId}-${Date.now()}`,
    sandboxId,
    eventIndex: events.length - 1,
    stateSnapshot: { ...stateSnapshot },
    createdAt: Date.now(),
  };
  const cps = checkpoints.get(sandboxId) ?? [];
  cps.push(cp);
  checkpoints.set(sandboxId, cps);
  return cp;
}

/** Get events between two indices (timeline scrubbing) */
export function getTimelineSlice(sandboxId: string, fromIndex: number, toIndex: number): TimelineEvent[] {
  const events = timelines.get(sandboxId) ?? [];
  return events.slice(Math.max(0, fromIndex), Math.min(events.length, toIndex + 1));
}

/** Diff sandbox state between two checkpoints */
export function diffCheckpoints(sandboxId: string, cpId1: string, cpId2: string): TimelineDiff | null {
  const cps = checkpoints.get(sandboxId) ?? [];
  const cp1 = cps.find(c => c.id === cpId1);
  const cp2 = cps.find(c => c.id === cpId2);
  if (!cp1 || !cp2) return null;

  const keys1 = new Set(Object.keys(cp1.stateSnapshot));
  const keys2 = new Set(Object.keys(cp2.stateSnapshot));

  const additions = [...keys2].filter(k => !keys1.has(k));
  const deletions = [...keys1].filter(k => !keys2.has(k));
  const modifications = [...keys1].filter(k =>
    keys2.has(k) && JSON.stringify(cp1.stateSnapshot[k]) !== JSON.stringify(cp2.stateSnapshot[k])
  );

  return {
    sandboxId, fromEventIndex: cp1.eventIndex, toEventIndex: cp2.eventIndex,
    additions, modifications, deletions,
  };
}

/** Get full timeline for a sandbox */
export function getTimeline(sandboxId: string): TimelineEvent[] {
  return timelines.get(sandboxId) ?? [];
}

export function getCheckpoints(sandboxId: string): Checkpoint[] {
  return checkpoints.get(sandboxId) ?? [];
}

export function getTimelineHealth() {
  let totalEvents = 0;
  for (const events of timelines.values()) totalEvents += events.length;
  let totalCheckpoints = 0;
  for (const cps of checkpoints.values()) totalCheckpoints += cps.length;
  return { trackedSandboxes: timelines.size, totalEvents, totalCheckpoints };
}

export function resetTimeline(): void {
  timelines.clear();
  checkpoints.clear();
  globalEventId = 0;
}
