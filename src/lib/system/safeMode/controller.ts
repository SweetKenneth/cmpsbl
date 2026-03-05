/**
 * Safe Mode Controller — Cascade severity + deterministic containment
 * S1: local isolation, S2: freeze evolution + degrade, S3: full Safe Mode
 */

import type { SafeModeLevel, SafeModeState } from '../scheduler/types';

export type CascadeSeverity = 'S1' | 'S2' | 'S3';

export interface CascadeEvent {
  id: string;
  severity: CascadeSeverity;
  origin_module: string;
  affected_modules: string[];
  actions_taken: ContainmentAction[];
  timestamp: string;
  resolved: boolean;
  resolved_at: string | null;
}

export interface ContainmentAction {
  type: 'isolate_origin' | 'open_downstream_breakers' | 'freeze_evolution' | 'degrade_features' | 'safe_mode' | 'lock_spend';
  target: string;
  executed_at: string;
}

// In-memory state
let safeModeState: SafeModeState = {
  level: 'off',
  activated_at: null,
  activated_by: null,
  reason: null,
  cascade_event_id: null,
};

const cascadeLog: CascadeEvent[] = [];
const MAX_CASCADE_LOG = 200;

/** Determine cascade severity from affected modules */
export function classifySeverity(originModule: string, affectedModules: string[]): CascadeSeverity {
  const coreModules = ['CORE', 'SYSTEM', 'DEFENSE', 'IDENTITY'];
  const affectedUpper = affectedModules.map(m => m.toUpperCase());
  const hitCore = affectedUpper.some(m => coreModules.includes(m));
  const count = affectedModules.length;

  if (hitCore && count >= 3) return 'S3';
  if (count >= 4) return 'S2';
  if (count >= 2) return 'S1';
  return 'S1';
}

/** Execute deterministic containment for a cascade */
export function containCascade(
  originModule: string,
  affectedModules: string[],
  actorId: string
): CascadeEvent {
  const severity = classifySeverity(originModule, affectedModules);
  const now = new Date().toISOString();
  const actions: ContainmentAction[] = [];

  // S1: Isolate origin + open downstream breakers
  actions.push({ type: 'isolate_origin', target: originModule, executed_at: now });
  for (const m of affectedModules) {
    actions.push({ type: 'open_downstream_breakers', target: m, executed_at: now });
  }

  // S2: Also freeze evolution + degrade nonessential
  if (severity === 'S2' || severity === 'S3') {
    actions.push({ type: 'freeze_evolution', target: 'EVOLUTION', executed_at: now });
    actions.push({ type: 'degrade_features', target: 'nonessential', executed_at: now });
  }

  // S3: Full Safe Mode
  if (severity === 'S3') {
    actions.push({ type: 'safe_mode', target: 'system', executed_at: now });
    actions.push({ type: 'lock_spend', target: 'providers', executed_at: now });
    setSafeMode('read_only', actorId, `S3 cascade from ${originModule}`, null);
  }

  const event: CascadeEvent = {
    id: crypto.randomUUID(),
    severity,
    origin_module: originModule,
    affected_modules: affectedModules,
    actions_taken: actions,
    timestamp: now,
    resolved: false,
    resolved_at: null,
  };

  cascadeLog.push(event);
  if (cascadeLog.length > MAX_CASCADE_LOG) cascadeLog.splice(0, cascadeLog.length - MAX_CASCADE_LOG);

  // Update safe mode state for S3
  if (severity === 'S3') {
    safeModeState.cascade_event_id = event.id;
  }

  return event;
}

/** Set Safe Mode level (governor/admin only) */
export function setSafeMode(level: SafeModeLevel, actorId: string, reason: string, cascadeEventId: string | null): void {
  safeModeState = {
    level,
    activated_at: level === 'off' ? null : new Date().toISOString(),
    activated_by: actorId,
    reason,
    cascade_event_id: cascadeEventId,
  };
}

/** Get current Safe Mode state */
export function getSafeModeState(): SafeModeState {
  return { ...safeModeState };
}

/** Resolve a cascade event */
export function resolveCascade(eventId: string): boolean {
  const event = cascadeLog.find(e => e.id === eventId);
  if (!event || event.resolved) return false;
  event.resolved = true;
  event.resolved_at = new Date().toISOString();
  return true;
}

/** Get cascade history */
export function getCascadeLog(limit = 50): CascadeEvent[] {
  return cascadeLog.slice(-limit);
}

/** Check if system is in degraded or higher safe mode */
export function isInSafeMode(): boolean {
  return safeModeState.level !== 'off';
}
