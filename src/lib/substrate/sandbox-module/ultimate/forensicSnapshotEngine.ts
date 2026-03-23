/**
 * Forensic Snapshot Engine
 * 
 * Creates immutable, hash-sealed forensic captures of sandbox state
 * for security investigations and debugging.
 * 
 * @module sandbox/ultimate/forensicSnapshotEngine
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface ForensicSnapshot {
  id: string;
  sandboxId: string;
  trigger: 'crash' | 'escape_attempt' | 'resource_exhaustion' | 'manual' | 'anomaly';
  memoryState: Record<string, unknown>;
  executionStack: string[];
  filesystemSnapshot: Record<string, string>;
  networkLog: Array<{ domain: string; method: string; timestamp: number }>;
  timelinePosition: number;
  contentHash: string;
  previousHash: string | null;
  createdAt: number;
  retentionUntil: number | null;
  critical: boolean;
}

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_RETENTION_DAYS = 30;

// ── State ──────────────────────────────────────────────────────

const snapshots: ForensicSnapshot[] = [];
let lastHash: string | null = null;

// ── Hash (simplified) ──────────────────────────────────────────

function computeHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `fh-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

// ── Core ───────────────────────────────────────────────────────

/** Capture a forensic snapshot */
export function captureSnapshot(
  sandboxId: string,
  trigger: ForensicSnapshot['trigger'],
  state: {
    memoryState: Record<string, unknown>;
    executionStack: string[];
    filesystemSnapshot: Record<string, string>;
    networkLog: Array<{ domain: string; method: string; timestamp: number }>;
    timelinePosition: number;
  },
  critical: boolean = false,
): ForensicSnapshot {
  const dataStr = JSON.stringify({ sandboxId, trigger, ...state, previousHash: lastHash });
  const contentHash = computeHash(dataStr);

  const snapshot: ForensicSnapshot = {
    id: `snap-${sandboxId}-${Date.now()}`,
    sandboxId,
    trigger,
    ...state,
    contentHash,
    previousHash: lastHash,
    createdAt: Date.now(),
    retentionUntil: critical ? null : Date.now() + DEFAULT_RETENTION_DAYS * 86_400_000,
    critical,
  };

  lastHash = contentHash;
  snapshots.push(snapshot);
  return snapshot;
}

/** Verify snapshot chain integrity */
export function verifyChain(): { valid: boolean; brokenAt: number | null } {
  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i].previousHash !== snapshots[i - 1].contentHash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true, brokenAt: null };
}

/** Get snapshots for a sandbox */
export function getSnapshots(sandboxId?: string): ForensicSnapshot[] {
  if (sandboxId) return snapshots.filter(s => s.sandboxId === sandboxId);
  return [...snapshots];
}

/** Get snapshot by ID */
export function getSnapshot(id: string): ForensicSnapshot | undefined {
  return snapshots.find(s => s.id === id);
}

/** Clean expired snapshots */
export function cleanExpired(): number {
  const now = Date.now();
  let removed = 0;
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].retentionUntil && snapshots[i].retentionUntil! < now) {
      snapshots.splice(i, 1);
      removed++;
    }
  }
  return removed;
}

export function getForensicHealth() {
  const chain = verifyChain();
  return {
    totalSnapshots: snapshots.length,
    criticalSnapshots: snapshots.filter(s => s.critical).length,
    chainIntegrity: chain.valid,
    oldestSnapshot: snapshots.length > 0 ? snapshots[0].createdAt : null,
  };
}

export function resetForensics(): void {
  snapshots.length = 0;
  lastHash = null;
}
