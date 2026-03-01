/**
 * S-Tier Crown Jewel #10 — MEMORY Write-Ahead Log Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 10 | CJPI: 95 | Version: 1.0.0
 * Module: MEMORY | Type: Architecture
 * Signature: 3c406a29
 * Generated: 2026-03-01T00:00:00.000Z
 */

type WALOperation = 'insert' | 'update' | 'delete' | 'checkpoint';

interface WALEntry<T> { id: string; transactionId: string; operation: WALOperation; payload: T; timestamp: number; checksum: string; committed: boolean; sequenceNumber: number; }
interface WALTransaction { id: string; startedAt: number; committedAt?: number; entryCount: number; status: 'open' | 'committed' | 'rolled_back'; }
interface WALStats { totalEntries: number; uncommittedEntries: number; openTransactions: number; checkpoints: number; oldestUncommittedAge: number; sizeEstimateBytes: number; }

export function createWAL<T = unknown>(opts?: { maxEntries?: number; compactThreshold?: number }) {
  const { maxEntries = 10_000, compactThreshold = 5_000 } = opts ?? {};
  const entries: WALEntry<T>[] = [];
  const transactions = new Map<string, WALTransaction>();
  let sequence = 0;
  let lastCheckpointSeq = 0;

  function fnv1a(str: string): string { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
  function genId(): string { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

  function begin(): string { const id = `tx_${genId()}`; transactions.set(id, { id, startedAt: Date.now(), entryCount: 0, status: 'open' }); return id; }

  function write(transactionId: string, operation: WALOperation, payload: T): WALEntry<T> {
    const tx = transactions.get(transactionId);
    if (!tx || tx.status !== 'open') throw new Error(`Transaction ${transactionId} is not open`);
    const entry: WALEntry<T> = { id: `wal_${genId()}`, transactionId, operation, payload, timestamp: Date.now(), checksum: fnv1a(JSON.stringify(payload) + operation + transactionId), committed: false, sequenceNumber: ++sequence };
    entries.push(entry); tx.entryCount++;
    if (entries.length > maxEntries) compact();
    return entry;
  }

  function commit(transactionId: string): boolean {
    const tx = transactions.get(transactionId);
    if (!tx || tx.status !== 'open') return false;
    for (const e of entries) if (e.transactionId === transactionId) e.committed = true;
    tx.status = 'committed'; tx.committedAt = Date.now();
    return true;
  }

  function rollback(transactionId: string): T[] {
    const tx = transactions.get(transactionId);
    if (!tx || tx.status !== 'open') return [];
    const rolledBack: T[] = [];
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].transactionId === transactionId) { rolledBack.push(entries[i].payload); entries.splice(i, 1); }
    }
    tx.status = 'rolled_back';
    return rolledBack;
  }

  function checkpoint(): number {
    lastCheckpointSeq = sequence;
    entries.push({ id: `wal_cp_${genId()}`, transactionId: 'system', operation: 'checkpoint', payload: {} as T, timestamp: Date.now(), checksum: fnv1a(`checkpoint_${sequence}`), committed: true, sequenceNumber: ++sequence });
    return lastCheckpointSeq;
  }

  function replay(toReplay: WALEntry<T>[], applyFn: (op: WALOperation, payload: T) => void): number {
    let applied = 0;
    for (const entry of toReplay) {
      if (entry.operation === 'checkpoint') continue;
      const expected = fnv1a(JSON.stringify(entry.payload) + entry.operation + entry.transactionId);
      if (expected !== entry.checksum) throw new Error(`Checksum mismatch at ${entry.id}`);
      applyFn(entry.operation, entry.payload); applied++;
    }
    return applied;
  }

  function compact() {
    const cutoff = entries.findIndex(e => e.operation === 'checkpoint' && e.sequenceNumber >= lastCheckpointSeq);
    if (cutoff > compactThreshold) entries.splice(0, cutoff);
  }

  function verify(): { valid: boolean; corruptEntries: string[] } {
    const corrupt: string[] = [];
    for (const e of entries) { if (e.operation === 'checkpoint') continue; const expected = fnv1a(JSON.stringify(e.payload) + e.operation + e.transactionId); if (expected !== e.checksum) corrupt.push(e.id); }
    return { valid: corrupt.length === 0, corruptEntries: corrupt };
  }

  function getStats(): WALStats {
    const uncommitted = entries.filter(e => !e.committed);
    return { totalEntries: entries.length, uncommittedEntries: uncommitted.length, openTransactions: [...transactions.values()].filter(t => t.status === 'open').length, checkpoints: entries.filter(e => e.operation === 'checkpoint').length, oldestUncommittedAge: uncommitted.length > 0 ? Date.now() - uncommitted[0].timestamp : 0, sizeEstimateBytes: JSON.stringify(entries).length };
  }

  return { begin, write, commit, rollback, checkpoint, getUncommitted: () => entries.filter(e => !e.committed && e.operation !== 'checkpoint'), getSinceCheckpoint: () => entries.filter(e => e.sequenceNumber > lastCheckpointSeq && e.committed), replay, verify, getStats, compact };
}
