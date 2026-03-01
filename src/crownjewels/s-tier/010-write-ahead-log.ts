/**
 * S-Tier Crown Jewel #10 — MEMORY Write-Ahead Log (WAL)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 10 | CJPI: 95 | Module: MEMORY | Type: Architecture
 * 
 * Crash-recoverable operation journal. Every mutation is logged before
 * execution, enabling replay on failure. Supports checkpoints, compaction,
 * and configurable durability guarantees.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface WALEntry<T = unknown> {
  sequence: number;
  operation: string;
  payload: T;
  timestamp: number;
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  checkpointId?: string;
  retryCount: number;
  error?: string;
}

export interface WALConfig {
  maxEntries?: number;
  maxRetries?: number;
  compactionThreshold?: number;
  onPersist?: (entries: WALEntry[]) => Promise<void>;
  onRestore?: () => Promise<WALEntry[]>;
}

export interface WALStats {
  totalEntries: number;
  pending: number;
  committed: number;
  failed: number;
  rolledBack: number;
  checkpoints: number;
  compactions: number;
}

export function createWriteAheadLog(config: WALConfig = {}) {
  const {
    maxEntries = 10_000,
    maxRetries = 3,
    compactionThreshold = 5_000,
    onPersist,
    onRestore,
  } = config;

  let entries: WALEntry[] = [];
  let sequence = 0;
  let compactionCount = 0;
  const checkpoints = new Map<string, number>();

  // ── Core Operations ──────────────────────────────────────────────

  function append<T>(operation: string, payload: T): WALEntry<T> {
    const entry: WALEntry<T> = {
      sequence: ++sequence,
      operation,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };
    entries.push(entry as WALEntry);
    if (entries.length > maxEntries) entries.splice(0, entries.length - maxEntries);
    return entry;
  }

  function commit(seq: number): boolean {
    const entry = entries.find(e => e.sequence === seq);
    if (!entry || entry.status !== 'pending') return false;
    entry.status = 'committed';
    return true;
  }

  function rollback(seq: number, error?: string): boolean {
    const entry = entries.find(e => e.sequence === seq);
    if (!entry) return false;
    entry.status = 'rolled_back';
    entry.error = error;
    return true;
  }

  function fail(seq: number, error: string): boolean {
    const entry = entries.find(e => e.sequence === seq);
    if (!entry) return false;
    entry.retryCount++;
    if (entry.retryCount >= maxRetries) {
      entry.status = 'failed';
      entry.error = error;
      return false;
    }
    entry.error = error;
    return true; // can retry
  }

  // ── Execute with WAL guarantee ───────────────────────────────────

  async function execute<T, R>(
    operation: string,
    payload: T,
    executor: (payload: T) => Promise<R>,
  ): Promise<{ result: R; entry: WALEntry<T> }> {
    const entry = append(operation, payload);
    try {
      const result = await executor(payload);
      commit(entry.sequence);
      return { result, entry };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const canRetry = fail(entry.sequence, msg);
      if (canRetry) {
        return execute(operation, payload, executor);
      }
      rollback(entry.sequence, msg);
      throw err;
    }
  }

  // ── Checkpoints & Compaction ─────────────────────────────────────

  function checkpoint(id?: string): string {
    const cpId = id ?? `cp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    checkpoints.set(cpId, sequence);
    return cpId;
  }

  function replaySince(checkpointId: string): WALEntry[] {
    const seq = checkpoints.get(checkpointId);
    if (seq === undefined) return [];
    return entries.filter(e => e.sequence > seq);
  }

  function getPending(): WALEntry[] {
    return entries.filter(e => e.status === 'pending');
  }

  function compact(): number {
    const before = entries.length;
    const minCheckpointSeq = checkpoints.size > 0
      ? Math.min(...checkpoints.values())
      : sequence;
    entries = entries.filter(
      e => e.status === 'pending' || e.sequence >= minCheckpointSeq,
    );
    compactionCount++;
    return before - entries.length;
  }

  function shouldCompact(): boolean {
    return entries.filter(e => e.status === 'committed').length >= compactionThreshold;
  }

  // ── Persistence ──────────────────────────────────────────────────

  async function persist(): Promise<void> {
    if (onPersist) await onPersist([...entries]);
  }

  async function restore(): Promise<number> {
    if (!onRestore) return 0;
    const restored = await onRestore();
    entries = restored;
    sequence = restored.length > 0
      ? Math.max(...restored.map(e => e.sequence))
      : 0;
    return restored.length;
  }

  // ── Stats ────────────────────────────────────────────────────────

  function getStats(): WALStats {
    return {
      totalEntries: entries.length,
      pending: entries.filter(e => e.status === 'pending').length,
      committed: entries.filter(e => e.status === 'committed').length,
      failed: entries.filter(e => e.status === 'failed').length,
      rolledBack: entries.filter(e => e.status === 'rolled_back').length,
      checkpoints: checkpoints.size,
      compactions: compactionCount,
    };
  }

  return {
    append, commit, rollback, fail, execute,
    checkpoint, replaySince, getPending,
    compact, shouldCompact,
    persist, restore,
    getStats,
    get entries() { return [...entries]; },
    get sequence() { return sequence; },
  };
}
