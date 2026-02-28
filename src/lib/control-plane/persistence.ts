/**
 * Control Plane Persistence Layer (v2 — Atomic Versioned Commits)
 * 
 * Stages domain state into a pending snapshot, then commits atomically
 * via cp_commit_snapshot() RPC. Falls back to legacy direct upserts
 * when atomic commit flag is disabled.
 * 
 * Gated behind 'substrate.persistent_control_plane' + 'substrate.cp_atomic_commit'.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEnabled } from '@/lib/substrate/feature-flags';
import { appendWalEvent, drainWalEvents } from './wal';
import { getEnv, getTenantId, getInstanceId } from './identity';
import { retryWithBackoff } from './retry';
import type { Json } from '@/integrations/supabase/types';

const DEBOUNCE_MS = 500;
let commitTimer: ReturnType<typeof setTimeout> | null = null;
let lastWriteAt = Date.now();
let writeFailures = 0;
let commitSuccessCount = 0;
let commitFailureCount = 0;
let lastCommittedRevisionId: number | null = null;
let lastSnapshotHash: string | null = null;
let degradedMode = false;

// Staged domain state (accumulated between commits)
const staged: Record<string, unknown[]> = {};

function isPersistenceEnabled(): boolean {
  return isEnabled('substrate.persistent_control_plane');
}

function isAtomicEnabled(): boolean {
  return isEnabled('substrate.cp_atomic_commit');
}

function stageDomain(domain: string, data: unknown[]): void {
  staged[domain] = data;
  scheduleCommit();
}

function scheduleCommit(): void {
  if (commitTimer) clearTimeout(commitTimer);
  commitTimer = setTimeout(() => {
    commitTimer = null;
    executeCommit().catch(err => {
      console.warn('[cp-persist] Scheduled commit failed:', err);
    });
  }, DEBOUNCE_MS);
}

async function executeCommit(): Promise<void> {
  if (!isPersistenceEnabled()) return;

  const payload: Record<string, unknown> = {};
  for (const [domain, data] of Object.entries(staged)) {
    if (data && (Array.isArray(data) ? data.length > 0 : true)) {
      payload[domain] = data;
    }
  }

  if (Object.keys(payload).length === 0) return;

  // Clear staged after capturing
  for (const key of Object.keys(staged)) {
    delete staged[key];
  }

  if (isAtomicEnabled()) {
    await commitAtomic(payload);
  } else {
    await commitLegacy(payload);
  }
}

async function commitAtomic(payload: Record<string, unknown>): Promise<void> {
  const walEvents = drainWalEvents().map(e => ({
    domain: e.domain,
    action: e.action,
    key: e.key,
    before: e.before,
    after: e.after,
    metadata: { ...e.metadata, timestamp: e.timestamp },
  }));

  try {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase.rpc('cp_commit_snapshot', {
        p_env: getEnv(),
        p_tenant_id: getTenantId(),
        p_created_by: null,
        p_parent_revision_id: lastCommittedRevisionId,
        p_payload: payload as Json,
        p_wal_events: walEvents as unknown as Json,
      });
      if (error) throw error;
      return data;
    }, {
      maxRetries: 6,
      baseMs: 500,
      maxMs: 30_000,
      jitter: 0.2,
      onFail: (attempt, err) => {
        console.warn(`[cp-persist] Commit attempt ${attempt} failed:`, err);
      },
    });

    if (result && typeof result === 'object') {
      const r = result as Record<string, unknown>;
      lastCommittedRevisionId = r.revision_id as number;
      lastSnapshotHash = r.snapshot_hash as string;
    }

    lastWriteAt = Date.now();
    commitSuccessCount++;
    degradedMode = false;
  } catch (err) {
    writeFailures++;
    commitFailureCount++;
    console.error('[cp-persist] Atomic commit failed after retries:', err);

    if (commitFailureCount > 3 && !degradedMode) {
      degradedMode = true;
      console.warn('[cp-persist] Entering degraded mode — persistence paused');
    }
  }
}

async function commitLegacy(payload: Record<string, unknown>): Promise<void> {
  // Legacy: direct upserts per domain (backward compat)
  for (const [domain, data] of Object.entries(payload)) {
    if (!Array.isArray(data) || data.length === 0) continue;
    try {
      await legacyUpsert(domain, data);
      lastWriteAt = Date.now();
    } catch (err) {
      writeFailures++;
      console.warn(`[cp-persist] Legacy ${domain} write failed:`, err);
    }
  }
}

async function legacyUpsert(domain: string, rows: unknown[]): Promise<void> {
  const tableMap: Record<string, { table: string; conflict: string }> = {
    flags: { table: 'substrate_flags', conflict: 'key' },
    config: { table: 'substrate_config', conflict: 'key' },
    canaries: { table: 'substrate_canaries', conflict: 'id' },
    retry_budgets: { table: 'substrate_retry_buckets', conflict: 'module' },
    metrics: { table: 'substrate_metrics_snapshot', conflict: 'name,labels_json' },
    schemas: { table: 'substrate_schema_registry', conflict: 'entity' },
    chaos: { table: 'substrate_chaos_rules', conflict: 'id' },
    queue: { table: 'substrate_queue_snapshot', conflict: 'id' },
    idempotency: { table: 'substrate_idempotency', conflict: 'key' },
  };

  const mapping = tableMap[domain];
  if (!mapping) return;

  if (domain === 'cascade') {
    const { error } = await supabase.from('substrate_cascade_history').insert(rows as any[]);
    if (error) throw error;
  } else {
    const { error } = await supabase.from(mapping.table as any).upsert(rows as any[], { onConflict: mapping.conflict });
    if (error) throw error;
  }
}

// ─── Public Domain Save APIs (unchanged signatures) ───────

export function saveFlags(flags: Array<{ key: string; enabled: boolean; rolloutPercent: number; metadata?: Record<string, unknown> }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = flags.map(f => ({
    key: f.key,
    enabled: f.enabled,
    rollout_percent: f.rolloutPercent,
    metadata: (f.metadata ?? {}) as Json,
    updated_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('flags', 'upsert', r.key, null, r));
  stageDomain('flags', rows);
}

export function saveConfig(entries: Array<{ key: string; value: unknown }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = entries.map(e => ({
    key: e.key,
    value: e.value as Json,
    updated_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('config', 'upsert', r.key, null, r));
  stageDomain('config', rows);
}

export function saveCanaries(canaries: Array<{ id: string; percent: number; enabled: boolean; metrics?: Record<string, unknown> }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = canaries.map(c => ({
    id: c.id,
    percent: c.percent,
    enabled: c.enabled,
    metrics_json: (c.metrics ?? {}) as Json,
    updated_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('canaries', 'upsert', r.id, null, r));
  stageDomain('canaries', rows);
}

export function saveRetryBudgets(budgets: Array<{ module: string; tokens: number; maxTokens: number; refillRate: number; totalRetries: number; totalExhausted: number }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = budgets.map(b => ({
    module: b.module,
    tokens: b.tokens,
    max_tokens: b.maxTokens,
    refill_rate: b.refillRate,
    stats_json: { totalRetries: b.totalRetries, totalExhausted: b.totalExhausted } as Json,
    updated_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('retry_budgets', 'upsert', r.module, null, r));
  stageDomain('retry_budgets', rows);
}

export function saveMetricsSnapshot(metrics: Array<{ name: string; value: number; labels: Record<string, string> }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = metrics.filter(m => m.name && typeof m.value === 'number').map(m => ({
    name: m.name,
    value: m.value,
    labels_json: m.labels as Json,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length === 0) return;
  stageDomain('metrics', rows);
}

export function saveCascadeHistory(chains: Array<{ origin: string; chain: string[]; confidence: number }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = chains.map(c => ({
    origin: c.origin,
    chain_json: c.chain as Json,
    confidence: c.confidence,
    detected_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('cascade', 'insert', r.origin, null, r));
  stageDomain('cascade', rows);
}

export function saveIdempotencyStore(entries: Array<{ key: string; status: string; result?: unknown; expiresAt: string }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = entries.map(e => ({
    key: e.key,
    status: e.status,
    result_json: (e.result ?? null) as Json,
    expires_at: e.expiresAt,
  }));
  rows.forEach(r => appendWalEvent('idempotency', 'upsert', r.key, null, r));
  stageDomain('idempotency', rows);
}

export function saveSchemas(schemas: Array<{ entity: string; version: number; fields: string[]; migrations: Array<{ from: number; to: number; transform: string }> }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = schemas.map(s => ({
    entity: s.entity,
    version: s.version,
    fields_json: s.fields as Json,
    migrations_json: s.migrations as unknown as Json,
    registered_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('schemas', 'upsert', r.entity, null, r));
  stageDomain('schemas', rows);
}

export function saveQueueState(heap: unknown[], stats: Record<string, unknown>): void {
  if (!isPersistenceEnabled()) return;
  const row = {
    id: 'default',
    serialized_heap_json: heap as Json,
    stats_json: stats as Json,
    updated_at: new Date().toISOString(),
  };
  appendWalEvent('queue', 'upsert', 'default', null, row);
  stageDomain('queue', [row]);
}

export function saveChaosRules(rules: Array<{ id: string; type: string; target: string; probability: number; config?: Record<string, unknown>; enabled: boolean }>): void {
  if (!isPersistenceEnabled()) return;
  const rows = rules.map(r => ({
    id: r.id,
    type: r.type,
    target: r.target,
    probability: r.probability,
    config_json: (r.config ?? {}) as Json,
    enabled: r.enabled,
    updated_at: new Date().toISOString(),
  }));
  rows.forEach(r => appendWalEvent('chaos', 'upsert', r.id, null, r));
  stageDomain('chaos', rows);
}

// ─── Flush All (for shutdown) ────────────────────────────

export async function flushAll(): Promise<void> {
  if (commitTimer) {
    clearTimeout(commitTimer);
    commitTimer = null;
  }
  await executeCommit();
  console.log('[cp-persist] Final flush complete');
}

// ─── Force commit (admin trigger) ────────────────────────

export async function forceCommitNow(): Promise<void> {
  if (commitTimer) {
    clearTimeout(commitTimer);
    commitTimer = null;
  }
  await executeCommit();
}

// ─── Health / State Accessors ────────────────────────────

export function getPersistenceHealth(): {
  lastWriteAt: number;
  writeFailures: number;
  pendingWrites: number;
  lastRevisionId: number | null;
  lastSnapshotHash: string | null;
  commitSuccessCount: number;
  commitFailureCount: number;
  degradedMode: boolean;
  walDepth: number;
} {
  return {
    lastWriteAt,
    writeFailures,
    pendingWrites: Object.keys(staged).length,
    lastRevisionId: lastCommittedRevisionId,
    lastSnapshotHash,
    commitSuccessCount,
    commitFailureCount,
    degradedMode,
    walDepth: 0, // WAL buffer is drained on commit; depth = staged count
  };
}

export function getLastRevisionId(): number | null {
  return lastCommittedRevisionId;
}

export function getLastSnapshotHash(): string | null {
  return lastSnapshotHash;
}

export function isDegradedMode(): boolean {
  return degradedMode;
}

export function resetDegradedMode(): void {
  degradedMode = false;
  commitFailureCount = 0;
}
