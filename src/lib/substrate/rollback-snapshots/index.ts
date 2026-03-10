/**
 * Rollback Snapshot Storage
 * Enterprise-only persistent state snapshots for safe evolution
 * 
 * Captures system state before evolution changes,
 * enabling confident rollback to known-good states.
 */

import { secureGet, secureSet } from '@/lib/system/secureStorage';

export interface Snapshot {
  id: string;
  label: string;
  timestamp: number;
  trigger: 'manual' | 'pre-evolution' | 'pre-modernizer' | 'pre-seba' | 'scheduled';
  state: Record<string, unknown>;
  moduleVersions: Record<string, string>;
  configHash: string;
  sizeBytes: number;
  metadata: Record<string, unknown>;
}

export interface SnapshotDiff {
  snapshotId: string;
  currentId: string;
  changes: Array<{
    path: string;
    before: unknown;
    after: unknown;
    type: 'added' | 'removed' | 'modified';
  }>;
  totalChanges: number;
}

export interface SnapshotStats {
  totalSnapshots: number;
  totalSizeBytes: number;
  oldestSnapshot: number | null;
  newestSnapshot: number | null;
  byTrigger: Record<string, number>;
}

const STORAGE_KEY = 'pf_rollback_snapshots';
const MAX_SNAPSHOTS = 20;

class RollbackSnapshotStore {
  private static instance: RollbackSnapshotStore;
  private snapshots: Snapshot[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): RollbackSnapshotStore {
    if (!RollbackSnapshotStore.instance) {
      RollbackSnapshotStore.instance = new RollbackSnapshotStore();
    }
    return RollbackSnapshotStore.instance;
  }

  /** Capture a new snapshot of the current system state */
  async capture(options: {
    label: string;
    trigger: Snapshot['trigger'];
    metadata?: Record<string, unknown>;
  }): Promise<Snapshot> {
    this.ensureLoaded();

    // Gather current state
    const { getAllVersions } = await import('@/lib/substrate/versions');
    const moduleVersions = getAllVersions();

    const state = await this.gatherState();
    const stateStr = JSON.stringify(state);

    const snapshot: Snapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      label: options.label,
      timestamp: Date.now(),
      trigger: options.trigger,
      state,
      moduleVersions,
      configHash: this.hashString(stateStr),
      sizeBytes: new Blob([stateStr]).size,
      metadata: options.metadata || {},
    };

    this.snapshots.push(snapshot);

    // Enforce max limit
    while (this.snapshots.length > MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    this.persist();
    return snapshot;
  }

  /** List all snapshots */
  list(): Snapshot[] {
    this.ensureLoaded();
    return [...this.snapshots];
  }

  /** Get a specific snapshot */
  get(snapshotId: string): Snapshot | undefined {
    this.ensureLoaded();
    return this.snapshots.find(s => s.id === snapshotId);
  }

  /** Diff a snapshot against current state */
  async diff(snapshotId: string): Promise<SnapshotDiff | null> {
    const snapshot = this.get(snapshotId);
    if (!snapshot) return null;

    const currentState = await this.gatherState();
    const changes: SnapshotDiff['changes'] = [];

    // Compare top-level keys
    const allKeys = new Set([...Object.keys(snapshot.state), ...Object.keys(currentState)]);
    
    for (const key of allKeys) {
      const before = snapshot.state[key];
      const after = currentState[key];

      if (before === undefined) {
        changes.push({ path: key, before: undefined, after, type: 'added' });
      } else if (after === undefined) {
        changes.push({ path: key, before, after: undefined, type: 'removed' });
      } else if (JSON.stringify(before) !== JSON.stringify(after)) {
        changes.push({ path: key, before, after, type: 'modified' });
      }
    }

    return {
      snapshotId,
      currentId: `current_${Date.now()}`,
      changes,
      totalChanges: changes.length,
    };
  }

  /** Restore system to a snapshot state */
  async restore(snapshotId: string): Promise<{
    success: boolean;
    restoredKeys: string[];
    errors: string[];
  }> {
    const snapshot = this.get(snapshotId);
    if (!snapshot) return { success: false, restoredKeys: [], errors: ['Snapshot not found'] };

    const restoredKeys: string[] = [];
    const errors: string[] = [];

    // Restore state values
    for (const [key, value] of Object.entries(snapshot.state)) {
      try {
        if (typeof localStorage !== 'undefined' && typeof value === 'string') {
          // Rollback restores write raw keys back (they were captured raw)
          localStorage.setItem(key, value);
          restoredKeys.push(key);
        }
      } catch (err) {
        errors.push(`Failed to restore ${key}: ${err}`);
      }
    }

    return { success: errors.length === 0, restoredKeys, errors };
  }

  /** Delete a snapshot */
  delete(snapshotId: string): boolean {
    this.ensureLoaded();
    const idx = this.snapshots.findIndex(s => s.id === snapshotId);
    if (idx < 0) return false;
    this.snapshots.splice(idx, 1);
    this.persist();
    return true;
  }

  /** Get storage stats */
  stats(): SnapshotStats {
    this.ensureLoaded();
    const byTrigger: Record<string, number> = {};
    
    for (const s of this.snapshots) {
      byTrigger[s.trigger] = (byTrigger[s.trigger] || 0) + 1;
    }

    return {
      totalSnapshots: this.snapshots.length,
      totalSizeBytes: this.snapshots.reduce((s, snap) => s + snap.sizeBytes, 0),
      oldestSnapshot: this.snapshots.length > 0 ? this.snapshots[0].timestamp : null,
      newestSnapshot: this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1].timestamp : null,
      byTrigger,
    };
  }

  /** Prune snapshots older than given ms */
  prune(olderThanMs: number): number {
    this.ensureLoaded();
    const cutoff = Date.now() - olderThanMs;
    const before = this.snapshots.length;
    this.snapshots = this.snapshots.filter(s => s.timestamp >= cutoff);
    this.persist();
    return before - this.snapshots.length;
  }

  private async gatherState(): Promise<Record<string, unknown>> {
    const state: Record<string, unknown> = {};
    
    // Capture substrate config state
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('pf_') || key?.startsWith('substrate_')) {
          state[key] = localStorage.getItem(key);
        }
      }
    }

    state._capturedAt = Date.now();
    return state;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;

    try {
      const data = secureGet<Snapshot[]>(STORAGE_KEY);
      if (data) {
        this.snapshots = data;
      }
    } catch {
      /* Storage unavailable — start with empty snapshots */
      this.snapshots = [];
    }
  }

  private persist(): void {
    try {
      secureSet(STORAGE_KEY, this.snapshots);
    } catch {
      // Storage full — prune old snapshots
      this.prune(7 * 24 * 60 * 60 * 1000); // Keep last 7 days
      try {
        secureSet(STORAGE_KEY, this.snapshots);
      } catch {
        /* Still full — nothing we can do */
      }
    }
  }
}

export const rollbackSnapshots = RollbackSnapshotStore.getInstance();
