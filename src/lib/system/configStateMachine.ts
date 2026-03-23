/**
 * Configuration State Machine — SYSTEM v9.0.0
 * Deterministic FSM for system-wide configuration changes
 * with rollback snapshots, conflict detection, and atomic transitions.
 */

import { deepFreeze, boundArray } from './hardening';

// --- Types ---

export type ConfigPhase = 'STABLE' | 'PREPARING' | 'VALIDATING' | 'APPLYING' | 'ROLLING_BACK';

export interface ConfigSnapshot {
  id: string;
  timestamp: number;
  state: Record<string, unknown>;
  phase: ConfigPhase;
  hash: number;
}

export interface ConfigTransition {
  fromPhase: ConfigPhase;
  toPhase: ConfigPhase;
  timestamp: number;
  keys: string[];
  success: boolean;
  error?: string;
}

export interface ConfigConflict {
  key: string;
  currentValue: unknown;
  proposedValue: unknown;
  reason: string;
}

// --- Constants ---

const MAX_SNAPSHOTS = 50;
const MAX_TRANSITIONS = 200;

const VALID_TRANSITIONS: Record<ConfigPhase, ConfigPhase[]> = {
  STABLE: ['PREPARING'],
  PREPARING: ['VALIDATING', 'STABLE'],
  VALIDATING: ['APPLYING', 'STABLE'],
  APPLYING: ['STABLE', 'ROLLING_BACK'],
  ROLLING_BACK: ['STABLE'],
};

// --- State ---

let currentPhase: ConfigPhase = 'STABLE';
const configState: Record<string, unknown> = {};
const snapshots: ConfigSnapshot[] = [];
const transitions: ConfigTransition[] = [];
let pendingChanges: Record<string, unknown> = {};

// --- Hash ---

function hashState(state: Record<string, unknown>): number {
  let hash = 0x811c9dc5;
  const json = JSON.stringify(state, Object.keys(state).sort());
  for (let i = 0; i < json.length; i++) {
    hash ^= json.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

// --- Core ---

export function getConfigPhase(): ConfigPhase {
  return currentPhase;
}

export function getConfigState(): Readonly<Record<string, unknown>> {
  return { ...configState };
}

function transitionTo(phase: ConfigPhase, keys: string[], success: boolean, error?: string): void {
  const allowed = VALID_TRANSITIONS[currentPhase];
  if (!allowed.includes(phase)) {
    throw new Error(`[ConfigFSM] Invalid transition: ${currentPhase} → ${phase}`);
  }

  transitions.push({
    fromPhase: currentPhase,
    toPhase: phase,
    timestamp: Date.now(),
    keys,
    success,
    error,
  });

  if (transitions.length > MAX_TRANSITIONS) {
    transitions.splice(0, transitions.length - MAX_TRANSITIONS);
  }

  currentPhase = phase;
}

function takeSnapshot(): ConfigSnapshot {
  const snap: ConfigSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    state: JSON.parse(JSON.stringify(configState)),
    phase: currentPhase,
    hash: hashState(configState),
  };

  snapshots.push(snap);
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);
  }

  return snap;
}

export function detectConflicts(proposed: Record<string, unknown>): ConfigConflict[] {
  const conflicts: ConfigConflict[] = [];

  for (const [key, value] of Object.entries(proposed)) {
    if (key in configState) {
      const current = configState[key];
      if (typeof current !== typeof value) {
        conflicts.push({
          key,
          currentValue: current,
          proposedValue: value,
          reason: `Type mismatch: ${typeof current} → ${typeof value}`,
        });
      }
    }
  }

  return conflicts;
}

export function prepareConfigChange(changes: Record<string, unknown>): {
  conflicts: ConfigConflict[];
  snapshotId: string;
} {
  if (currentPhase !== 'STABLE') {
    throw new Error(`[ConfigFSM] Cannot prepare changes in phase: ${currentPhase}`);
  }

  const snap = takeSnapshot();
  const keys = Object.keys(changes);
  transitionTo('PREPARING', keys, true);

  const conflicts = detectConflicts(changes);
  pendingChanges = { ...changes };

  return { conflicts, snapshotId: snap.id };
}

export function validateAndApply(): { success: boolean; error?: string } {
  if (currentPhase !== 'PREPARING') {
    return { success: false, error: `Cannot validate in phase: ${currentPhase}` };
  }

  const keys = Object.keys(pendingChanges);
  transitionTo('VALIDATING', keys, true);

  // Validate all pending changes
  const conflicts = detectConflicts(pendingChanges);
  if (conflicts.length > 0) {
    transitionTo('STABLE', keys, false, 'Conflicts detected');
    pendingChanges = {};
    return { success: false, error: `${conflicts.length} conflicts detected` };
  }

  transitionTo('APPLYING', keys, true);

  try {
    for (const [key, value] of Object.entries(pendingChanges)) {
      configState[key] = value;
    }
    pendingChanges = {};
    transitionTo('STABLE', keys, true);
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    transitionTo('ROLLING_BACK', keys, false, error);
    rollbackToLastSnapshot();
    return { success: false, error };
  }
}

export function rollbackToLastSnapshot(): boolean {
  const lastSnap = snapshots[snapshots.length - 1];
  if (!lastSnap) return false;

  // Restore state
  for (const key of Object.keys(configState)) {
    delete configState[key];
  }
  Object.assign(configState, lastSnap.state);

  if (currentPhase === 'ROLLING_BACK') {
    transitionTo('STABLE', Object.keys(lastSnap.state), true);
  }

  pendingChanges = {};
  return true;
}

export function rollbackToSnapshot(snapshotId: string): boolean {
  const snap = snapshots.find(s => s.id === snapshotId);
  if (!snap) return false;

  for (const key of Object.keys(configState)) {
    delete configState[key];
  }
  Object.assign(configState, snap.state);
  return true;
}

export function setConfigDirect(key: string, value: unknown): void {
  if (currentPhase !== 'STABLE') {
    throw new Error(`[ConfigFSM] Cannot set config in phase: ${currentPhase}`);
  }
  configState[key] = value;
}

export function getSnapshots(): ConfigSnapshot[] {
  return [...snapshots];
}

export function getTransitions(): ConfigTransition[] {
  return [...transitions];
}

export function getConfigHash(): number {
  return hashState(configState);
}

export function clearConfigFSM(): void {
  currentPhase = 'STABLE';
  for (const key of Object.keys(configState)) delete configState[key];
  snapshots.length = 0;
  transitions.length = 0;
  pendingChanges = {};
}
