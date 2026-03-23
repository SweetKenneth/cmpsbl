/**
 * NERVE Ultimate — Signal Replay Journal
 * Append-only forensic signal history for replay and debugging.
 * Captures every signal that passes through NERVE's emission pipeline.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface JournalEntry {
  readonly id: string;
  readonly signalId: string;
  readonly from: string;
  readonly to: string;
  readonly type: string;
  readonly priority: string;
  readonly payload: Record<string, unknown>;
  readonly outcome: 'delivered' | 'deduped' | 'circuit_blocked' | 'backpressured' | 'ttl_expired' | 'error';
  readonly latencyMs: number;
  readonly timestamp: number;
  readonly idempotencyKey?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ReplayFilter {
  from?: string;
  to?: string;
  type?: string;
  outcome?: JournalEntry['outcome'];
  since?: number;
  until?: number;
  limit?: number;
}

export interface JournalStats {
  totalEntries: number;
  byOutcome: Record<string, number>;
  bySource: Record<string, number>;
  avgLatencyMs: number;
  oldestEntry: number;
  newestEntry: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_JOURNAL_SIZE = 5_000;
const COMPACTION_THRESHOLD = 6_000;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const journal: JournalEntry[] = [];
let entryCounter = 0;

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Append a signal event to the journal (immutable, append-only) */
export function recordSignalEvent(
  signalId: string,
  from: string,
  to: string,
  type: string,
  priority: string,
  payload: Record<string, unknown>,
  outcome: JournalEntry['outcome'],
  latencyMs: number,
  idempotencyKey?: string,
  metadata?: Record<string, unknown>,
): JournalEntry {
  const entry: JournalEntry = {
    id: `jnl-${++entryCounter}-${Date.now()}`,
    signalId,
    from,
    to,
    type,
    priority,
    payload: Object.freeze({ ...payload }),
    outcome,
    latencyMs,
    timestamp: Date.now(),
    idempotencyKey,
    metadata: metadata ? Object.freeze({ ...metadata }) : undefined,
  };

  journal.push(entry);

  // Compaction: trim oldest entries when exceeding threshold
  if (journal.length > COMPACTION_THRESHOLD) {
    journal.splice(0, journal.length - MAX_JOURNAL_SIZE);
  }

  return entry;
}

/** Replay signals matching filter criteria */
export function replaySignals(filter: ReplayFilter = {}): JournalEntry[] {
  let results = journal.slice();

  if (filter.from) results = results.filter(e => e.from === filter.from);
  if (filter.to) results = results.filter(e => e.to === filter.to);
  if (filter.type) results = results.filter(e => e.type === filter.type);
  if (filter.outcome) results = results.filter(e => e.outcome === filter.outcome);
  if (filter.since) results = results.filter(e => e.timestamp >= filter.since!);
  if (filter.until) results = results.filter(e => e.timestamp <= filter.until!);

  if (filter.limit && filter.limit > 0) {
    results = results.slice(-filter.limit);
  }

  return results;
}

/** Get a specific journal entry by ID */
export function getJournalEntry(id: string): JournalEntry | null {
  return journal.find(e => e.id === id) ?? null;
}

/** Get journal statistics */
export function getJournalStats(): JournalStats {
  if (journal.length === 0) {
    return {
      totalEntries: 0,
      byOutcome: {},
      bySource: {},
      avgLatencyMs: 0,
      oldestEntry: 0,
      newestEntry: 0,
    };
  }

  const byOutcome: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let totalLatency = 0;

  for (const entry of journal) {
    byOutcome[entry.outcome] = (byOutcome[entry.outcome] ?? 0) + 1;
    bySource[entry.from] = (bySource[entry.from] ?? 0) + 1;
    totalLatency += entry.latencyMs;
  }

  return {
    totalEntries: journal.length,
    byOutcome,
    bySource,
    avgLatencyMs: totalLatency / journal.length,
    oldestEntry: journal[0].timestamp,
    newestEntry: journal[journal.length - 1].timestamp,
  };
}

/** Get the last N journal entries */
export function getRecentEntries(count: number = 50): JournalEntry[] {
  return journal.slice(-count);
}

/** Clear all journal entries (admin/reset only) */
export function clearJournal(): number {
  const cleared = journal.length;
  journal.length = 0;
  entryCounter = 0;
  return cleared;
}
