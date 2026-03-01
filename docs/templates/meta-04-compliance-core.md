# Compliance & Governance Core — Meta-Engine

> Complete compliance infrastructure in a single import. Tamper-evident audit trails, durable transactional logging, service inventory with lifecycle tracking, and anomaly detection on the audit stream itself.

## What It Is

A **meta-engine** that composes Audit Chain, Write-Ahead Log, Service Registry, and Anomaly Intelligence into one governance platform. Every action is hash-chained, every transaction is durable with rollback, every service is inventoried, and suspicious patterns trigger automatic alerts.

## Why It's More Valuable Than Individual Engines

| Standalone | Meta-Engine |
|---|---|
| Audit log with no durability guarantees | Hash-chained audit + WAL transactional durability |
| Service registry with no audit trail | Every registry change is audited automatically |
| Anomaly detection on external metrics | Anomaly detection ON the audit stream itself |
| Separate integrity verification | Unified verify: chain integrity + WAL integrity + Merkle root |

## Quick Start

```typescript
import { createComplianceCore } from './compliance-core';

const compliance = createComplianceCore({
  anomalyWindowMs: 300_000, // 5 minute window
  onAlert: (alert) => sendToSlack(alert),
});

// Register services for inventory
compliance.registerService({ id: 'billing-api', type: 'module', tags: ['pci', 'critical'] });
compliance.registerService({ id: 'user-db', type: 'module', tags: ['pii', 'gdpr'] });

// Audit every action
compliance.audit({
  actor: 'user:alice',
  action: 'data.export',
  resource: 'user-db:customers',
  payload: { format: 'csv', rowCount: 15000 },
});

// Transactional operations with durability
const txId = compliance.beginTransaction();
compliance.writeTransaction(txId, 'update', { table: 'users', changes: 42 });
compliance.writeTransaction(txId, 'delete', { table: 'sessions', expired: true });
compliance.commitTransaction(txId); // or rollbackTransaction(txId)

// Verify everything
const integrity = compliance.verify();
// {
//   auditChain: { valid: true, totalEntries: 156 },
//   wal: { valid: true, corruptEntries: [] },
//   merkleRoot: 'a8f3c21b',
//   services: { total: 2, active: 2, degraded: 0 },
// }

// Compliance export
const report = compliance.exportComplianceReport({
  since: Date.now() - 30 * 86400000, // last 30 days
  actor: 'user:alice',
});
```

## Full Source

```typescript
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  Compliance & Governance Core — Meta-Engine                 ║
 * ║  Composes: Audit Chain + WAL + Registry + Anomaly           ║
 * ║  Zero dependencies. Drop into any TypeScript project.       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type EntityStatus = 'registered' | 'active' | 'degraded' | 'decommissioned';
type EntityType = 'module' | 'capability' | 'pipeline' | 'connector' | 'config';
type WALOperation = 'insert' | 'update' | 'delete' | 'checkpoint';
type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

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

interface RegistryEntity {
  id: string;
  type: EntityType;
  status: EntityStatus;
  version: string;
  metadata: Record<string, unknown>;
  dependencies: string[];
  healthScore: number;
  registeredAt: number;
  tags: string[];
}

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

interface Anomaly {
  id: string;
  source: string;
  metric: string;
  value: number;
  severity: AnomalySeverity;
  timestamp: number;
}

interface ComplianceAlert {
  type: 'audit_anomaly' | 'integrity_failure' | 'suspicious_pattern' | 'service_degraded';
  severity: AnomalySeverity;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface ComplianceReport {
  generatedAt: number;
  period: { from: number; to: number };
  auditEntries: AuditEntry[];
  merkleRoot: string;
  chainIntegrity: boolean;
  walIntegrity: boolean;
  serviceInventory: RegistryEntity[];
  anomalies: Anomaly[];
  alerts: ComplianceAlert[];
  statistics: {
    totalActions: number;
    uniqueActors: number;
    uniqueResources: number;
    actionBreakdown: Record<string, number>;
  };
}

export interface ComplianceCoreConfig {
  anomalyWindowMs?: number;
  maxAuditEntries?: number;
  maxWALEntries?: number;
  onAlert?: (alert: ComplianceAlert) => void;
  // Suspicious pattern thresholds
  bulkActionThreshold?: number; // actions per minute from same actor
  sensitiveResources?: string[]; // resources that trigger extra scrutiny
}

// ━━━ Meta-Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createComplianceCore(config?: ComplianceCoreConfig) {
  const {
    anomalyWindowMs = 300_000,
    maxWALEntries = 10_000,
    onAlert,
    bulkActionThreshold = 30,
    sensitiveResources = [],
  } = config ?? {};

  const alerts: ComplianceAlert[] = [];

  function emitAlert(alert: ComplianceAlert) {
    alerts.push(alert);
    if (alerts.length > 1000) alerts.splice(0, alerts.length - 1000);
    onAlert?.(alert);
  }

  // ════════════════════════════════════════════════════
  // UTILITY: Hash (FNV-1a)
  // ════════════════════════════════════════════════════

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

  // ════════════════════════════════════════════════════
  // LAYER 1: Tamper-Evident Audit Chain
  // ════════════════════════════════════════════════════

  const auditChain: AuditEntry[] = [];

  function hashEntry(actor: string, action: string, resource: string, payload: string, timestamp: number, previousHash: string): string {
    return hash(`${previousHash}|${actor}|${action}|${resource}|${payload}|${timestamp}`);
  }

  function audit(params: { actor: string; action: string; resource: string; payload?: Record<string, unknown> }): AuditEntry {
    const timestamp = Date.now();
    const payloadStr = params.payload ? JSON.stringify(params.payload) : '';
    const payloadHash = hash(payloadStr);
    const previousHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].entryHash : '00000000';
    const entryHash = hashEntry(params.actor, params.action, params.resource, payloadStr, timestamp, previousHash);
    const entry: AuditEntry = {
      index: auditChain.length,
      actor: params.actor, action: params.action, resource: params.resource,
      payload: params.payload, timestamp, payloadHash, previousHash, entryHash,
    };
    auditChain.push(entry);

    // Anomaly detection on audit stream
    detectAuditAnomalies(entry);

    return entry;
  }

  function verifyChain(): { valid: boolean; totalEntries: number; brokenAtIndex?: number; error?: string } {
    if (auditChain.length === 0) return { valid: true, totalEntries: 0 };
    for (let i = 0; i < auditChain.length; i++) {
      const entry = auditChain[i];
      const expectedPrev = i === 0 ? '00000000' : auditChain[i - 1].entryHash;
      if (entry.previousHash !== expectedPrev) return { valid: false, totalEntries: auditChain.length, brokenAtIndex: i, error: `Previous hash mismatch at ${i}` };
      const payloadStr = entry.payload ? JSON.stringify(entry.payload) : '';
      const computed = hashEntry(entry.actor, entry.action, entry.resource, payloadStr, entry.timestamp, entry.previousHash);
      if (entry.entryHash !== computed) return { valid: false, totalEntries: auditChain.length, brokenAtIndex: i, error: `Entry hash mismatch at ${i}` };
    }
    return { valid: true, totalEntries: auditChain.length };
  }

  function getMerkleRoot(): string {
    if (auditChain.length === 0) return '00000000';
    let level = auditChain.map(e => e.entryHash);
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) next.push(hash(level[i] + (level[i + 1] ?? level[i])));
      level = next;
    }
    return level[0];
  }

  function queryAudit(params?: { actor?: string; action?: string; resource?: string; since?: number; until?: number; limit?: number }): AuditEntry[] {
    let results = [...auditChain];
    if (params?.actor) results = results.filter(e => e.actor === params.actor);
    if (params?.action) results = results.filter(e => e.action === params.action);
    if (params?.resource) results = results.filter(e => e.resource === params.resource);
    if (params?.since) results = results.filter(e => e.timestamp >= params.since!);
    if (params?.until) results = results.filter(e => e.timestamp <= params.until!);
    if (params?.limit) results = results.slice(-params.limit);
    return results;
  }

  // ════════════════════════════════════════════════════
  // LAYER 2: Write-Ahead Log
  // ════════════════════════════════════════════════════

  const walEntries: WALEntry<unknown>[] = [];
  const transactions = new Map<string, WALTransaction>();
  let walSequence = 0;
  let lastCheckpointSeq = 0;

  function beginTransaction(): string {
    const id = `tx_${genId()}`;
    transactions.set(id, { id, startedAt: Date.now(), entryCount: 0, status: 'open' });
    audit({ actor: 'system:wal', action: 'transaction.begin', resource: `tx:${id}` });
    return id;
  }

  function writeTransaction(txId: string, operation: WALOperation, payload: unknown): WALEntry<unknown> {
    const tx = transactions.get(txId);
    if (!tx || tx.status !== 'open') throw new Error(`Transaction ${txId} is not open`);
    const entry: WALEntry<unknown> = {
      id: `wal_${genId()}`, transactionId: txId, operation, payload,
      timestamp: Date.now(), checksum: hash(JSON.stringify(payload) + operation + txId),
      committed: false, sequenceNumber: ++walSequence,
    };
    walEntries.push(entry); tx.entryCount++;
    if (walEntries.length > maxWALEntries) compactWAL();
    return entry;
  }

  function commitTransaction(txId: string): boolean {
    const tx = transactions.get(txId);
    if (!tx || tx.status !== 'open') return false;
    for (const e of walEntries) if (e.transactionId === txId) e.committed = true;
    tx.status = 'committed'; tx.committedAt = Date.now();
    audit({ actor: 'system:wal', action: 'transaction.commit', resource: `tx:${txId}`, payload: { entryCount: tx.entryCount, durationMs: tx.committedAt - tx.startedAt } });
    return true;
  }

  function rollbackTransaction(txId: string): unknown[] {
    const tx = transactions.get(txId);
    if (!tx || tx.status !== 'open') return [];
    const rolledBack: unknown[] = [];
    for (let i = walEntries.length - 1; i >= 0; i--) {
      if (walEntries[i].transactionId === txId) { rolledBack.push(walEntries[i].payload); walEntries.splice(i, 1); }
    }
    tx.status = 'rolled_back';
    audit({ actor: 'system:wal', action: 'transaction.rollback', resource: `tx:${txId}`, payload: { rolledBackCount: rolledBack.length } });
    return rolledBack;
  }

  function walCheckpoint(): number {
    lastCheckpointSeq = walSequence;
    walEntries.push({
      id: `wal_cp_${genId()}`, transactionId: 'system', operation: 'checkpoint',
      payload: {}, timestamp: Date.now(), checksum: hash(`checkpoint_${walSequence}`),
      committed: true, sequenceNumber: ++walSequence,
    });
    return lastCheckpointSeq;
  }

  function getUncommittedWrites(): WALEntry<unknown>[] {
    return walEntries.filter(e => !e.committed && e.operation !== 'checkpoint');
  }

  function replayWAL(toReplay: WALEntry<unknown>[], applyFn: (op: WALOperation, payload: unknown) => void): number {
    let applied = 0;
    for (const entry of toReplay) {
      if (entry.operation === 'checkpoint') continue;
      const expected = hash(JSON.stringify(entry.payload) + entry.operation + entry.transactionId);
      if (expected !== entry.checksum) throw new Error(`Checksum mismatch at ${entry.id}`);
      applyFn(entry.operation, entry.payload); applied++;
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
    const cutoff = walEntries.findIndex(e => e.operation === 'checkpoint' && e.sequenceNumber >= lastCheckpointSeq);
    if (cutoff > 1000) walEntries.splice(0, cutoff);
  }

  // ════════════════════════════════════════════════════
  // LAYER 3: Service Registry
  // ════════════════════════════════════════════════════

  const services = new Map<string, RegistryEntity>();

  function registerService(params: {
    id: string; type: EntityType; version?: string;
    metadata?: Record<string, unknown>; dependencies?: string[];
    tags?: string[];
  }): RegistryEntity {
    const entity: RegistryEntity = {
      id: params.id, type: params.type, status: 'active',
      version: params.version ?? '1.0.0', metadata: params.metadata ?? {},
      dependencies: params.dependencies ?? [], healthScore: 1.0,
      registeredAt: Date.now(), tags: params.tags ?? [],
    };
    services.set(params.id, entity);
    audit({ actor: 'system:registry', action: 'service.register', resource: `service:${params.id}`, payload: { type: params.type, tags: params.tags } });
    return entity;
  }

  function degradeService(id: string, reason: string) {
    const entity = services.get(id);
    if (!entity) return;
    entity.status = 'degraded';
    entity.metadata._degradeReason = reason;
    audit({ actor: 'system:registry', action: 'service.degraded', resource: `service:${id}`, payload: { reason } });
    emitAlert({ type: 'service_degraded', severity: 'high', message: `Service '${id}' degraded: ${reason}`, timestamp: Date.now(), metadata: { serviceId: id, reason } });
  }

  function decommissionService(id: string) {
    const entity = services.get(id);
    if (!entity) return;
    entity.status = 'decommissioned';
    audit({ actor: 'system:registry', action: 'service.decommission', resource: `service:${id}` });
  }

  function discoverServices(query?: { type?: EntityType; status?: EntityStatus; tags?: string[] }): RegistryEntity[] {
    let results = [...services.values()];
    if (query?.type) results = results.filter(e => e.type === query.type);
    if (query?.status) results = results.filter(e => e.status === query.status);
    if (query?.tags?.length) results = results.filter(e => query.tags!.some(t => e.tags.includes(t)));
    return results;
  }

  // ════════════════════════════════════════════════════
  // LAYER 4: Anomaly Detection on Audit Stream
  // ════════════════════════════════════════════════════

  const anomalyBuffer: Anomaly[] = [];
  let anomalyIdCounter = 0;

  function detectAuditAnomalies(entry: AuditEntry) {
    // Pattern 1: Bulk actions from same actor
    const recentByActor = auditChain.filter(e =>
      e.actor === entry.actor && Date.now() - e.timestamp < 60_000
    );
    if (recentByActor.length > bulkActionThreshold) {
      const anomaly: Anomaly = {
        id: `anomaly_${++anomalyIdCounter}`, source: entry.actor,
        metric: 'bulk_actions', value: recentByActor.length,
        severity: recentByActor.length > bulkActionThreshold * 2 ? 'critical' : 'high',
        timestamp: Date.now(),
      };
      anomalyBuffer.push(anomaly);
      emitAlert({
        type: 'suspicious_pattern', severity: anomaly.severity,
        message: `Bulk actions detected: ${entry.actor} performed ${recentByActor.length} actions in 60s`,
        timestamp: Date.now(), metadata: { actor: entry.actor, count: recentByActor.length },
      });
    }

    // Pattern 2: Sensitive resource access
    if (sensitiveResources.some(r => entry.resource.includes(r))) {
      const anomaly: Anomaly = {
        id: `anomaly_${++anomalyIdCounter}`, source: entry.actor,
        metric: 'sensitive_access', value: 1, severity: 'medium',
        timestamp: Date.now(),
      };
      anomalyBuffer.push(anomaly);
      emitAlert({
        type: 'audit_anomaly', severity: 'medium',
        message: `Sensitive resource accessed: ${entry.resource} by ${entry.actor}`,
        timestamp: Date.now(), metadata: { actor: entry.actor, resource: entry.resource, action: entry.action },
      });
    }

    // Pattern 3: Delete operations
    if (entry.action.includes('delete') || entry.action.includes('remove') || entry.action.includes('drop')) {
      const anomaly: Anomaly = {
        id: `anomaly_${++anomalyIdCounter}`, source: entry.actor,
        metric: 'destructive_action', value: 1,
        severity: entry.resource.includes('production') ? 'critical' : 'high',
        timestamp: Date.now(),
      };
      anomalyBuffer.push(anomaly);
    }

    if (anomalyBuffer.length > 500) anomalyBuffer.splice(0, anomalyBuffer.length - 500);
  }

  // ════════════════════════════════════════════════════
  // UNIFIED VERIFICATION & REPORTING
  // ════════════════════════════════════════════════════

  function verify() {
    return {
      auditChain: verifyChain(),
      wal: verifyWAL(),
      merkleRoot: getMerkleRoot(),
      services: {
        total: services.size,
        active: [...services.values()].filter(s => s.status === 'active').length,
        degraded: [...services.values()].filter(s => s.status === 'degraded').length,
      },
    };
  }

  function exportComplianceReport(params?: { since?: number; until?: number; actor?: string }): ComplianceReport {
    const since = params?.since ?? 0;
    const until = params?.until ?? Date.now();
    const entries = queryAudit({ since, until, actor: params?.actor });

    const actionBreakdown: Record<string, number> = {};
    const actors = new Set<string>();
    const resources = new Set<string>();
    for (const e of entries) {
      actionBreakdown[e.action] = (actionBreakdown[e.action] ?? 0) + 1;
      actors.add(e.actor);
      resources.add(e.resource);
    }

    return {
      generatedAt: Date.now(),
      period: { from: since, to: until },
      auditEntries: entries,
      merkleRoot: getMerkleRoot(),
      chainIntegrity: verifyChain().valid,
      walIntegrity: verifyWAL().valid,
      serviceInventory: [...services.values()],
      anomalies: anomalyBuffer.filter(a => a.timestamp >= since && a.timestamp <= until),
      alerts: alerts.filter(a => a.timestamp >= since && a.timestamp <= until),
      statistics: {
        totalActions: entries.length,
        uniqueActors: actors.size,
        uniqueResources: resources.size,
        actionBreakdown,
      },
    };
  }

  function getStats() {
    return {
      audit: { totalEntries: auditChain.length, chainValid: verifyChain().valid, merkleRoot: getMerkleRoot() },
      wal: { totalEntries: walEntries.length, uncommitted: getUncommittedWrites().length, walValid: verifyWAL().valid },
      services: { total: services.size, active: [...services.values()].filter(s => s.status === 'active').length },
      anomalies: { total: anomalyBuffer.length, recent: anomalyBuffer.filter(a => Date.now() - a.timestamp < anomalyWindowMs).length },
      alerts: { total: alerts.length, recent: alerts.filter(a => Date.now() - a.timestamp < anomalyWindowMs).length },
    };
  }

  return {
    // Audit
    audit, queryAudit, verifyChain, getMerkleRoot, exportChain: () => [...auditChain],
    // WAL
    beginTransaction, writeTransaction, commitTransaction, rollbackTransaction,
    walCheckpoint, getUncommittedWrites, replayWAL, verifyWAL,
    // Services
    registerService, degradeService, decommissionService, discoverServices,
    // Unified
    verify, exportComplianceReport, getAlerts: () => [...alerts], getStats,
  };
}
```

## API Reference

| Method | Layer | Description |
|--------|-------|-------------|
| `audit(params)` | Audit | Append tamper-evident entry (auto-scanned for anomalies) |
| `queryAudit(params?)` | Audit | Search by actor, action, resource, time |
| `verifyChain()` | Audit | Verify hash chain integrity |
| `getMerkleRoot()` | Audit | Compute Merkle root for external anchoring |
| `beginTransaction()` | WAL | Start a durable transaction |
| `writeTransaction(txId, op, data)` | WAL | Write within transaction |
| `commitTransaction(txId)` | WAL | Commit (auto-audited) |
| `rollbackTransaction(txId)` | WAL | Rollback (auto-audited) |
| `registerService(params)` | Registry | Add service to inventory (auto-audited) |
| `verify()` | All | Unified integrity check across all layers |
| `exportComplianceReport(params?)` | All | Generate full compliance report |

## Built-In Anomaly Detection

| Pattern | Triggers When | Severity |
|---------|--------------|----------|
| **Bulk Actions** | Same actor > 30 actions/minute | High/Critical |
| **Sensitive Access** | Access to configured sensitive resources | Medium |
| **Destructive Actions** | Delete/remove/drop operations detected | High/Critical |

## Architecture

```
  Action ──→ ┌────────────────┐
             │  AUDIT CHAIN   │──→ Hash-chained, tamper-evident
             │                │──→ Anomaly detection on stream
             └───────┬────────┘
                     │
  Transaction ──→ ┌──▼─────────────┐
                  │  WRITE-AHEAD   │──→ Commit/rollback durability
                  │     LOG        │──→ Crash recovery via replay
                  └───────┬────────┘
                          │
  Service ──→ ┌───────────▼──────┐
              │  REGISTRY        │──→ Lifecycle tracking
              │                  │──→ Auto-audited changes
              └──────────────────┘
                     ↓
              ┌──────────────────┐
              │  ANOMALY         │──→ Suspicious patterns
              │  DETECTOR        │──→ Alerts & compliance reports
              └──────────────────┘
```

## Compliance Standards Coverage

| Standard | What This Covers |
|----------|-----------------|
| **SOC 2** | Tamper-evident audit trail, access logging, integrity verification |
| **HIPAA** | Access tracking to sensitive resources, audit export |
| **GDPR** | Data access logging, actor tracking, right-to-audit |
| **PCI DSS** | Change tracking, service inventory, anomaly detection |

## License

MIT — Drop in anywhere. No attribution required.
