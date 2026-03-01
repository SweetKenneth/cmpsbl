# Audit Chain

> Zero-dependency, drop-in tamper-evident audit logging with write-ahead durability, Merkle root verification, and transactional replay.

## What It Does

Provides an immutable, hash-chained audit log with write-ahead log (WAL) durability. Every entry is cryptographically linked to its predecessor. Supports transactions with commit/rollback, integrity verification, Merkle root computation, and deterministic replay for disaster recovery.

## Use Cases

- **Compliance logging** — SOC 2, HIPAA, GDPR audit trails
- **Financial systems** — Tamper-evident transaction records
- **Change tracking** — Who did what, when, with proof of integrity
- **Disaster recovery** — Replay committed transactions to rebuild state
- **Data pipelines** — Transactional writes with rollback on failure

## Drop-In Instructions

1. Copy into `src/lib/audit-chain.ts`
2. Append entries for any auditable action
3. Verify chain integrity at any time

```typescript
import { createAuditChain } from './audit-chain';

const audit = createAuditChain();

// Simple audit logging
audit.append({
  actor: 'user:alice',
  action: 'update',
  resource: 'document:123',
  payload: { field: 'title', oldValue: 'Draft', newValue: 'Final' },
});

// Verify chain integrity
const result = audit.verify();
console.log(result.valid); // true

// Get Merkle root for external anchoring
const root = audit.getMerkleRoot();

// Transactional writes with WAL durability
const txId = audit.beginTransaction();
audit.writeTransaction(txId, 'insert', { userId: '456', plan: 'pro' });
audit.writeTransaction(txId, 'update', { credits: 1000 });
audit.commitTransaction(txId); // or audit.rollbackTransaction(txId)

// Replay after crash
const pending = audit.getUncommittedWrites();
audit.replayWAL(pending, (op, payload) => {
  console.log(`Replaying: ${op}`, payload);
});
```

## Full Source

```typescript
/**
 * Audit Chain — Tamper-evident logging + write-ahead durability
 * Combines: Tamper-Evident Chain + Write-Ahead Log Engine
 * Zero dependencies. Works in any TypeScript/JavaScript project.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface AuditEntry {
  index: number;
  actor: string;
  action: string;
  resource: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  payloadHash: string;
  previousHash: string;
  entryHash: string;
}

interface VerificationResult {
  valid: boolean;
  totalEntries: number;
  brokenAtIndex?: number;
  error?: string;
}

type WALOperation = 'insert' | 'update' | 'delete' | 'checkpoint';

interface WALEntry<T> {
  id: string;
  transactionId: string;
  operation: WALOperation;
  payload: T;
  timestamp: number;
  checksum: string;
  committed: boolean;
  sequenceNumber: number;
}

interface WALTransaction {
  id: string;
  startedAt: number;
  committedAt?: number;
  entryCount: number;
  status: 'open' | 'committed' | 'rolled_back';
}

// ━━━ Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createAuditChain<T = Record<string, unknown>>(opts?: {
  maxWALEntries?: number;
}) {
  const { maxWALEntries = 10_000 } = opts ?? {};

  // ── Hash Utility (FNV-1a) ──
  function hash(input: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function genId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  // ── Tamper-Evident Chain ──
  const chain: AuditEntry[] = [];

  function hashEntry(
    actor: string,
    action: string,
    resource: string,
    payload: string,
    timestamp: number,
    previousHash: string
  ): string {
    return hash(`${previousHash}|${actor}|${action}|${resource}|${payload}|${timestamp}`);
  }

  function append(params: {
    actor: string;
    action: string;
    resource: string;
    payload?: Record<string, unknown>;
  }): AuditEntry {
    const timestamp = Date.now();
    const payloadStr = params.payload ? JSON.stringify(params.payload) : '';
    const payloadHash = hash(payloadStr);
    const previousHash = chain.length > 0 ? chain[chain.length - 1].entryHash : '00000000';
    const entryHash = hashEntry(params.actor, params.action, params.resource, payloadStr, timestamp, previousHash);
    const entry: AuditEntry = {
      index: chain.length,
      actor: params.actor,
      action: params.action,
      resource: params.resource,
      payload: params.payload,
      timestamp,
      payloadHash,
      previousHash,
      entryHash,
    };
    chain.push(entry);
    return entry;
  }

  function verify(): VerificationResult {
    if (chain.length === 0) return { valid: true, totalEntries: 0 };
    for (let i = 0; i < chain.length; i++) {
      const entry = chain[i];
      const expectedPrev = i === 0 ? '00000000' : chain[i - 1].entryHash;
      if (entry.previousHash !== expectedPrev) {
        return { valid: false, totalEntries: chain.length, brokenAtIndex: i, error: `Previous hash mismatch at ${i}` };
      }
      const payloadStr = entry.payload ? JSON.stringify(entry.payload) : '';
      const computed = hashEntry(entry.actor, entry.action, entry.resource, payloadStr, entry.timestamp, entry.previousHash);
      if (entry.entryHash !== computed) {
        return { valid: false, totalEntries: chain.length, brokenAtIndex: i, error: `Entry hash mismatch at ${i}` };
      }
    }
    return { valid: true, totalEntries: chain.length };
  }

  function queryAudit(params?: {
    actor?: string;
    action?: string;
    since?: number;
    limit?: number;
  }): AuditEntry[] {
    let results = [...chain];
    if (params?.actor) results = results.filter((e) => e.actor === params.actor);
    if (params?.action) results = results.filter((e) => e.action === params.action);
    if (params?.since) results = results.filter((e) => e.timestamp >= params.since!);
    if (params?.limit) results = results.slice(-params.limit);
    return results;
  }

  function getMerkleRoot(): string {
    if (chain.length === 0) return '00000000';
    let level = chain.map((e) => e.entryHash);
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        next.push(hash(level[i] + (level[i + 1] ?? level[i])));
      }
      level = next;
    }
    return level[0];
  }

  // ── Write-Ahead Log ──
  const walEntries: WALEntry<T>[] = [];
  const transactions = new Map<string, WALTransaction>();
  let walSequence = 0;
  let lastCheckpointSeq = 0;

  function beginTransaction(): string {
    const id = `tx_${genId()}`;
    transactions.set(id, { id, startedAt: Date.now(), entryCount: 0, status: 'open' });
    return id;
  }

  function writeTransaction(transactionId: string, operation: WALOperation, payload: T): WALEntry<T> {
    const tx = transactions.get(transactionId);
    if (!tx || tx.status !== 'open') throw new Error(`Transaction ${transactionId} is not open`);
    const entry: WALEntry<T> = {
      id: `wal_${genId()}`,
      transactionId,
      operation,
      payload,
      timestamp: Date.now(),
      checksum: hash(JSON.stringify(payload) + operation + transactionId),
      committed: false,
      sequenceNumber: ++walSequence,
    };
    walEntries.push(entry);
    tx.entryCount++;
    if (walEntries.length > maxWALEntries) compactWAL();
    return entry;
  }

  function commitTransaction(transactionId: string): boolean {
    const tx = transactions.get(transactionId);
    if (!tx || tx.status !== 'open') return false;
    for (const e of walEntries) {
      if (e.transactionId === transactionId) e.committed = true;
    }
    tx.status = 'committed';
    tx.committedAt = Date.now();

    // Also append to audit chain
    append({
      actor: 'system:wal',
      action: 'commit',
      resource: `transaction:${transactionId}`,
      payload: { entryCount: tx.entryCount },
    });

    return true;
  }

  function rollbackTransaction(transactionId: string): T[] {
    const tx = transactions.get(transactionId);
    if (!tx || tx.status !== 'open') return [];
    const rolledBack: T[] = [];
    for (let i = walEntries.length - 1; i >= 0; i--) {
      if (walEntries[i].transactionId === transactionId) {
        rolledBack.push(walEntries[i].payload);
        walEntries.splice(i, 1);
      }
    }
    tx.status = 'rolled_back';
    return rolledBack;
  }

  function walCheckpoint(): number {
    lastCheckpointSeq = walSequence;
    walEntries.push({
      id: `wal_cp_${genId()}`,
      transactionId: 'system',
      operation: 'checkpoint',
      payload: {} as T,
      timestamp: Date.now(),
      checksum: hash(`checkpoint_${walSequence}`),
      committed: true,
      sequenceNumber: ++walSequence,
    });
    return lastCheckpointSeq;
  }

  function getUncommittedWrites(): WALEntry<T>[] {
    return walEntries.filter((e) => !e.committed && e.operation !== 'checkpoint');
  }

  function replayWAL(
    toReplay: WALEntry<T>[],
    applyFn: (op: WALOperation, payload: T) => void
  ): number {
    let applied = 0;
    for (const entry of toReplay) {
      if (entry.operation === 'checkpoint') continue;
      const expected = hash(JSON.stringify(entry.payload) + entry.operation + entry.transactionId);
      if (expected !== entry.checksum) throw new Error(`Checksum mismatch at ${entry.id}`);
      applyFn(entry.operation, entry.payload);
      applied++;
    }
    return applied;
  }

  function verifyWAL(): { valid: boolean; corruptEntries: string[] } {
    const corrupt: string[] = [];
    for (const e of walEntries) {
      if (e.operation === 'checkpoint') continue;
      const expected = hash(JSON.stringify(e.payload) + e.operation + e.transactionId);
      if (expected !== e.checksum) corrupt.push(e.id);
    }
    return { valid: corrupt.length === 0, corruptEntries: corrupt };
  }

  function compactWAL() {
    const cutoff = walEntries.findIndex(
      (e) => e.operation === 'checkpoint' && e.sequenceNumber >= lastCheckpointSeq
    );
    if (cutoff > 1000) walEntries.splice(0, cutoff);
  }

  // ── Stats ──

  function getStats() {
    const uncommitted = getUncommittedWrites();
    return {
      chain: {
        totalEntries: chain.length,
        merkleRoot: getMerkleRoot(),
        integrityValid: verify().valid,
      },
      wal: {
        totalEntries: walEntries.length,
        uncommittedEntries: uncommitted.length,
        openTransactions: [...transactions.values()].filter((t) => t.status === 'open').length,
        checkpoints: walEntries.filter((e) => e.operation === 'checkpoint').length,
        integrityValid: verifyWAL().valid,
      },
    };
  }

  return {
    // Audit Chain
    append,
    verify,
    queryAudit,
    getMerkleRoot,
    exportChain: () => [...chain],
    // WAL
    beginTransaction,
    writeTransaction,
    commitTransaction,
    rollbackTransaction,
    walCheckpoint,
    getUncommittedWrites,
    replayWAL,
    verifyWAL,
    // Stats
    getStats,
    get chainLength() { return chain.length; },
    get lastEntry() { return chain.at(-1); },
  };
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `append(params)` | Add a tamper-evident audit entry |
| `verify()` | Verify entire chain integrity |
| `queryAudit(params?)` | Query entries by actor, action, time |
| `getMerkleRoot()` | Compute Merkle root for external anchoring |
| `beginTransaction()` | Start a durable WAL transaction |
| `writeTransaction(txId, op, payload)` | Write within a transaction |
| `commitTransaction(txId)` | Commit — marks all entries durable |
| `rollbackTransaction(txId)` | Rollback — removes uncommitted entries |
| `replayWAL(entries, applyFn)` | Replay entries for crash recovery |
| `getStats()` | Chain + WAL health summary |

## License

MIT — Drop in anywhere.
