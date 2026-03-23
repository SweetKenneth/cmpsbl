/**
 * INTENT Ultimate — System 8: Execution Telemetry & Feedback Loop
 * 
 * Tracks every intent through its lifecycle: received → classified → decomposed →
 * routed → executed → verified. Feeds data back into classifier for improvement.
 * 
 * @module intent/ultimate/executionTelemetry
 */

// ── Types ────────────────────────────────────────────────────────

export type IntentPhase = 'received' | 'classified' | 'decomposed' | 'amplified' | 'arbitrated' | 'routed' | 'executing' | 'executed' | 'verified' | 'failed' | 'rolled_back';

export interface IntentLifecycleEvent {
  intentId: string;
  phase: IntentPhase;
  timestamp: string;
  durationMs: number; // Time in this phase
  metadata?: Record<string, unknown>;
}

export interface IntentLifecycle {
  intentId: string;
  intentType: string;
  sourceModule: string;
  events: IntentLifecycleEvent[];
  currentPhase: IntentPhase;
  totalDurationMs: number;
  success: boolean | null; // null = in progress
  startedAt: string;
  completedAt?: string;
}

export interface TelemetrySnapshot {
  timestamp: string;
  activeIntents: number;
  completedIntents: number;
  failedIntents: number;
  avgDurationMs: number;
  p95DurationMs: number;
  phaseBreakdown: Record<IntentPhase, { count: number; avgMs: number }>;
  successRate: number;
}

// ── State ────────────────────────────────────────────────────────

const lifecycles: Map<string, IntentLifecycle> = new Map();
const snapshots: TelemetrySnapshot[] = [];
const MAX_LIFECYCLES = 500;
const MAX_SNAPSHOTS = 100;

// ── Core API ────────────────────────────────────────────────────

/** Begin tracking an intent lifecycle */
export function beginTracking(intentId: string, intentType: string, sourceModule: string): IntentLifecycle {
  const lifecycle: IntentLifecycle = {
    intentId,
    intentType,
    sourceModule,
    events: [{
      intentId,
      phase: 'received',
      timestamp: new Date().toISOString(),
      durationMs: 0,
    }],
    currentPhase: 'received',
    totalDurationMs: 0,
    success: null,
    startedAt: new Date().toISOString(),
  };

  lifecycles.set(intentId, lifecycle);
  if (lifecycles.size > MAX_LIFECYCLES) {
    const oldest = lifecycles.keys().next().value;
    if (oldest) lifecycles.delete(oldest);
  }

  return lifecycle;
}

/** Record a phase transition */
export function recordPhase(
  intentId: string,
  phase: IntentPhase,
  durationMs: number,
  metadata?: Record<string, unknown>,
): void {
  const lifecycle = lifecycles.get(intentId);
  if (!lifecycle) return;

  lifecycle.events.push({
    intentId,
    phase,
    timestamp: new Date().toISOString(),
    durationMs,
    metadata,
  });

  lifecycle.currentPhase = phase;
  lifecycle.totalDurationMs += durationMs;

  if (phase === 'verified') {
    lifecycle.success = true;
    lifecycle.completedAt = new Date().toISOString();
  } else if (phase === 'failed' || phase === 'rolled_back') {
    lifecycle.success = false;
    lifecycle.completedAt = new Date().toISOString();
  }
}

/** Get lifecycle for an intent */
export function getLifecycle(intentId: string): IntentLifecycle | undefined {
  return lifecycles.get(intentId);
}

/** Get all active (in-progress) lifecycles */
export function getActiveLifecycles(): IntentLifecycle[] {
  return Array.from(lifecycles.values()).filter(l => l.success === null);
}

/** Generate a telemetry snapshot */
export function generateSnapshot(): TelemetrySnapshot {
  const all = Array.from(lifecycles.values());
  const completed = all.filter(l => l.success === true);
  const failed = all.filter(l => l.success === false);
  const active = all.filter(l => l.success === null);

  // Phase breakdown
  const phaseStats: Record<string, { count: number; totalMs: number }> = {};
  for (const lc of all) {
    for (const event of lc.events) {
      if (!phaseStats[event.phase]) phaseStats[event.phase] = { count: 0, totalMs: 0 };
      phaseStats[event.phase].count++;
      phaseStats[event.phase].totalMs += event.durationMs;
    }
  }

  const phaseBreakdown = {} as Record<IntentPhase, { count: number; avgMs: number }>;
  for (const [phase, stats] of Object.entries(phaseStats)) {
    phaseBreakdown[phase as IntentPhase] = {
      count: stats.count,
      avgMs: stats.count > 0 ? Math.round(stats.totalMs / stats.count) : 0,
    };
  }

  // P95 duration
  const durations = completed.map(c => c.totalDurationMs).sort((a, b) => a - b);
  const p95Idx = Math.floor(durations.length * 0.95);
  const p95 = durations[p95Idx] || 0;

  const snapshot: TelemetrySnapshot = {
    timestamp: new Date().toISOString(),
    activeIntents: active.length,
    completedIntents: completed.length,
    failedIntents: failed.length,
    avgDurationMs: completed.length > 0
      ? Math.round(completed.reduce((s, c) => s + c.totalDurationMs, 0) / completed.length)
      : 0,
    p95DurationMs: p95,
    phaseBreakdown,
    successRate: (completed.length + failed.length) > 0
      ? Math.round((completed.length / (completed.length + failed.length)) * 100)
      : 100,
  };

  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);

  return snapshot;
}

/** Get telemetry health */
export function getTelemetryHealth() {
  const all = Array.from(lifecycles.values());
  const recent = all.slice(-50);
  const completed = recent.filter(l => l.success === true);
  const failed = recent.filter(l => l.success === false);

  return {
    trackedIntents: all.length,
    activeIntents: all.filter(l => l.success === null).length,
    successRate: (completed.length + failed.length) > 0
      ? Math.round((completed.length / (completed.length + failed.length)) * 100)
      : 100,
    snapshotCount: snapshots.length,
  };
}

/** Reset */
export function resetTelemetry(): void {
  lifecycles.clear();
  snapshots.length = 0;
}
