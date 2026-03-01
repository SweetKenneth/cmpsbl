# 04 — Control Plane & Persistence

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document describes the control plane's persistence architecture: how runtime state is durably stored, how leader election works, how snapshots are committed, and how the system recovers from crashes.

## 2. Architecture Overview

The Control Plane is a first-class layer containing:

| Component | Role |
|-----------|------|
| INTEL | Aggregation + explanation (Founder-only outputs) |
| ENGINEER | Internal maintenance node (no user UI) |
| DECODE | Conversational service (feeds INTEL/ENGINEER) |
| AUDIT | Compliance trail service |
| NEXUS-CLM Bridge | Routes CLM cycles through NEXUS router |

A single "disable control plane" toggle gates all CP behavior.

## 3. Persistence Domains

The durability layer persists in-memory state across 10 RLS-protected database tables:

| Domain | Table | Contents |
|--------|-------|----------|
| Flags | `cp_flags` | Feature flags, kill switches |
| Config | `cp_config` | Runtime configuration values |
| Canaries | `cp_canaries` | Canary deployment state |
| Retry Budgets | `cp_retry_budgets` | Token bucket state per module |
| Metrics | `cp_metrics_snapshot` | Point-in-time metric captures |
| Cascade History | `cp_cascade_history` | Cascade detection events |
| Idempotency | `cp_idempotency_store` | Request deduplication keys |
| Schemas | `cp_schemas` | Runtime schema versions |
| Queue State | `cp_queue_state` | Pending work items |
| Chaos Rules | `cp_chaos_rules` | Chaos testing configuration |

## 4. Atomic Versioning

All 10 domains are committed in a single transactional revision:

```sql
-- cp_commit_snapshot: commits all domains atomically
BEGIN;
  INSERT INTO cp_revisions (revision_id, domains, hash, committed_at) 
  VALUES (...);
  -- Update all 10 domain tables within the same transaction
COMMIT;
```

### Tamper-Evidence

Each revision includes a SHA-256 hash computed from the canonical JSON representation of all 10 domains:

```
snapshotHash = SHA-256(canonicalizeJson({
  flags, config, canaries, retryBudgets, metrics,
  cascadeHistory, idempotencyStore, schemas, queueState, chaosRules
}))
```

### Verification

```typescript
verifySnapshotHash(revisionId: string): Promise<{ valid: boolean; expected: string; actual: string }>
```

## 5. Leader Election

### Lease-Based Locking

Only one instance (the leader) performs periodic snapshots:

```typescript
cp_acquire_lease(instanceId: string, ttl: number): Promise<boolean>
```

- Leader writes a lease row with expiry timestamp.
- Non-leaders check lease before attempting snapshot.
- If lease expires (leader crash), any instance can acquire.
- Lease TTL: configurable, default 60 seconds.

### Leader vs. Non-Leader Behavior

| Behavior | Leader | Non-Leader |
|----------|--------|------------|
| Periodic snapshot | ✅ Runs scheduler | ❌ |
| Manual flush request | ✅ | ✅ (request only) |
| WAL append | ✅ | ✅ |
| State reads | ✅ | ✅ |
| Lease renewal | ✅ (every TTL/2) | ❌ |

## 6. Write-Ahead Log (WAL)

### Purpose

Captures mutation events between snapshots for point-in-time restoration and lineage tracking.

### Event Structure

```typescript
interface WalEvent {
  id: string;
  domain: string;      // Which of the 10 domains
  operation: string;    // 'set' | 'delete' | 'merge'
  key: string;
  value: unknown;
  timestamp: number;
  instanceId: string;
}
```

### Buffer Management

- Events are buffered in memory and flushed to the database periodically.
- Flush interval: 30 seconds (leader only).
- Buffer size limit: 1000 events (force flush on overflow).
- `drainWalEvents()` — flush all buffered events immediately.

### WAL Statistics

```typescript
getWalStats(): { buffered: number; totalFlushed: number; lastFlushAt: number }
```

## 7. Rehydration

On boot, the system loads the latest committed revision:

```
1. Query cp_revisions ORDER BY committed_at DESC LIMIT 1
2. Load all 10 domain tables for that revision_id
3. Verify snapshot hash matches stored hash
4. If valid: populate in-memory state from loaded domains
5. If invalid: log integrity violation, attempt previous revision
6. Replay any WAL events after the revision's committed_at timestamp
```

### Multi-Instance Safety

Multiple instances can rehydrate simultaneously without conflict because:
- Rehydration is read-only
- Write path is leader-gated
- WAL events are idempotent (keyed by domain + key)

## 8. Persistence Health Dimensions

The control plane exposes four health dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| Persistence | Snapshot freshness, flush success rate |
| Cluster Safety | Leader lease health, multi-instance conflict detection |
| Atomicity | Transaction success rate, partial commit detection |
| Replayability | WAL completeness, gap detection |

## 9. Degraded Mode

If persistence fails (database unreachable):

1. System continues operating from in-memory state.
2. `isDegradedMode()` returns `true`.
3. WAL events accumulate in memory buffer.
4. No snapshots are committed.
5. On recovery: flush accumulated WAL, commit snapshot, exit degraded mode.

## 10. Revision History Access

```typescript
listRevisions(limit?: number): Promise<Revision[]>
restoreToRevision(revisionId: string): Promise<void>
getWalForRevision(revisionId: string): Promise<WalEvent[]>
getWalRange(from: number, to: number): Promise<WalEvent[]>
```

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial control plane documentation |

---

© 2025–2026 PromptFluid®. Confidential.
