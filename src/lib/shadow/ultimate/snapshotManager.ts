/**
 * SHADOW Ultimate — Snapshot Manager
 * Point-in-time state capture and restoration.
 * Immutable snapshots for deterministic replay.
 */

export interface StateSnapshot {
  id: string;
  sessionId: string;
  label: string;
  stateHash: string;
  stateData: Record<string, unknown>;
  sizeBytes: number;
  capturedAt: number;
  immutable: boolean;
}

export interface SnapshotComparison {
  snapshotA: string;
  snapshotB: string;
  identical: boolean;
  diffKeys: string[];
  diffCount: number;
  comparedAt: number;
}

export interface SnapshotStats {
  totalSnapshots: number;
  totalSizeBytes: number;
  totalComparisons: number;
  avgSizeBytes: number;
}

const MAX_SNAPSHOTS = 300;
const MAX_COMPARISONS = 200;

const snapshots = new Map<string, StateSnapshot>();
const snapshotComparisons: SnapshotComparison[] = [];

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function captureSnapshot(
  sessionId: string, label: string, stateData: Record<string, unknown>
): StateSnapshot {
  const serialized = JSON.stringify(stateData);
  const snap: StateSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId, label,
    stateHash: fnvHash(serialized),
    stateData: JSON.parse(serialized), // deep clone
    sizeBytes: serialized.length,
    capturedAt: Date.now(), immutable: true,
  };

  if (snapshots.size >= MAX_SNAPSHOTS) {
    const oldest = [...snapshots.values()].sort((a, b) => a.capturedAt - b.capturedAt)[0];
    if (oldest) snapshots.delete(oldest.id);
  }
  snapshots.set(snap.id, snap);
  return snap;
}

export function restoreSnapshot(snapshotId: string): Record<string, unknown> | null {
  const snap = snapshots.get(snapshotId);
  if (!snap) return null;
  return JSON.parse(JSON.stringify(snap.stateData)); // deep clone
}

export function compareSnapshots(snapIdA: string, snapIdB: string): SnapshotComparison | null {
  const a = snapshots.get(snapIdA);
  const b = snapshots.get(snapIdB);
  if (!a || !b) return null;

  const keysA = new Set(Object.keys(a.stateData));
  const keysB = new Set(Object.keys(b.stateData));
  const allKeys = new Set([...keysA, ...keysB]);
  const diffKeys: string[] = [];

  for (const key of allKeys) {
    if (JSON.stringify(a.stateData[key]) !== JSON.stringify(b.stateData[key])) {
      diffKeys.push(key);
    }
  }

  const comp: SnapshotComparison = {
    snapshotA: snapIdA, snapshotB: snapIdB,
    identical: diffKeys.length === 0 && a.stateHash === b.stateHash,
    diffKeys, diffCount: diffKeys.length, comparedAt: Date.now(),
  };
  if (snapshotComparisons.length >= MAX_COMPARISONS) snapshotComparisons.shift();
  snapshotComparisons.push(comp);
  return comp;
}

export function getSnapshotStats(): SnapshotStats {
  const all = [...snapshots.values()];
  const totalSize = all.reduce((s, snap) => s + snap.sizeBytes, 0);
  return {
    totalSnapshots: all.length,
    totalSizeBytes: totalSize,
    totalComparisons: snapshotComparisons.length,
    avgSizeBytes: all.length > 0 ? totalSize / all.length : 0,
  };
}

export function resetSnapshotState(): void { snapshots.clear(); snapshotComparisons.length = 0; }
