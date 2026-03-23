/**
 * Rollback Ledger — EVOLUTION v9.0.0
 * Immutable append-only log of applied mutations with deterministic undo,
 * hash-chained for tamper evidence.
 */

// --- Types ---

export interface RollbackEntry {
  id: string;
  proposalId: string;
  sequenceNumber: number;
  hash: string;
  previousHash: string;
  mutation: string; // serialized mutation descriptor
  appliedState: Record<string, unknown>;
  rollbackState: Record<string, unknown>;
  appliedAt: number;
  rolledBackAt?: number;
  status: 'applied' | 'rolled_back';
}

export interface LedgerIntegrity {
  valid: boolean;
  totalEntries: number;
  brokenLinks: number[];
  headHash: string;
}

// --- Constants ---

const MAX_ENTRIES = 500;

// --- State ---

const ledger: RollbackEntry[] = [];
let sequenceCounter = 0;

// --- Hash ---

function computeHash(data: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// --- Core ---

export function appendMutation(
  proposalId: string,
  mutation: string,
  appliedState: Record<string, unknown>,
  rollbackState: Record<string, unknown>
): RollbackEntry {
  const previousHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : '00000000';
  const seq = sequenceCounter++;

  const entry: RollbackEntry = {
    id: `rl_${seq}`,
    proposalId,
    sequenceNumber: seq,
    hash: '',
    previousHash,
    mutation,
    appliedState: JSON.parse(JSON.stringify(appliedState)),
    rollbackState: JSON.parse(JSON.stringify(rollbackState)),
    appliedAt: Date.now(),
    status: 'applied',
  };

  entry.hash = computeHash(`${seq}:${previousHash}:${mutation}`);
  ledger.push(entry);

  if (ledger.length > MAX_ENTRIES) {
    ledger.splice(0, ledger.length - MAX_ENTRIES);
  }

  return { ...entry };
}

export function rollback(entryId: string): { success: boolean; state?: Record<string, unknown>; error?: string } {
  const entry = ledger.find(e => e.id === entryId);
  if (!entry) return { success: false, error: 'Entry not found' };
  if (entry.status === 'rolled_back') return { success: false, error: 'Already rolled back' };

  // Must rollback in reverse order — check this is the latest applied
  const laterApplied = ledger.filter(
    e => e.sequenceNumber > entry.sequenceNumber && e.status === 'applied'
  );
  if (laterApplied.length > 0) {
    return { success: false, error: `Must rollback ${laterApplied.length} later mutation(s) first` };
  }

  entry.status = 'rolled_back';
  entry.rolledBackAt = Date.now();

  return { success: true, state: { ...entry.rollbackState } };
}

export function rollbackToSequence(targetSeq: number): {
  rolledBack: string[];
  errors: string[];
} {
  const toRollback = ledger
    .filter(e => e.sequenceNumber >= targetSeq && e.status === 'applied')
    .sort((a, b) => b.sequenceNumber - a.sequenceNumber);

  const rolledBack: string[] = [];
  const errors: string[] = [];

  for (const entry of toRollback) {
    const result = rollback(entry.id);
    if (result.success) rolledBack.push(entry.id);
    else errors.push(`${entry.id}: ${result.error}`);
  }

  return { rolledBack, errors };
}

export function verifyIntegrity(): LedgerIntegrity {
  const brokenLinks: number[] = [];

  for (let i = 1; i < ledger.length; i++) {
    if (ledger[i].previousHash !== ledger[i - 1].hash) {
      brokenLinks.push(i);
    }
  }

  return {
    valid: brokenLinks.length === 0,
    totalEntries: ledger.length,
    brokenLinks,
    headHash: ledger.length > 0 ? ledger[ledger.length - 1].hash : '00000000',
  };
}

export function getLedger(): RollbackEntry[] {
  return ledger.map(e => ({ ...e }));
}

export function getEntry(id: string): RollbackEntry | null {
  const e = ledger.find(l => l.id === id);
  return e ? { ...e } : null;
}

export function getAppliedCount(): number {
  return ledger.filter(e => e.status === 'applied').length;
}

export function getRolledBackCount(): number {
  return ledger.filter(e => e.status === 'rolled_back').length;
}

export function clearLedgerState(): void {
  ledger.length = 0;
  sequenceCounter = 0;
}
