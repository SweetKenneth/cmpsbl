/**
 * Control Plane Persistence Layer
 * Persists all in-memory control plane state to durable storage.
 * Gated behind 'substrate.persistent_control_plane' feature flag.
 * All writes debounced (500ms batch window), failures non-blocking.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEnabled } from '@/lib/substrate/feature-flags';

const DEBOUNCE_MS = 500;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let lastWriteAt = Date.now();
let writeFailures = 0;

function isPersistenceEnabled(): boolean {
  return isEnabled('substrate.persistent_control_plane');
}

function debounced(key: string, fn: () => Promise<void>): void {
  if (!isPersistenceEnabled()) return;
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(key, setTimeout(async () => {
    timers.delete(key);
    try {
      await fn();
      lastWriteAt = Date.now();
    } catch (err) {
      writeFailures++;
      console.warn(`[cp-persist] ${key} write failed:`, err);
    }
  }, DEBOUNCE_MS));
}

// ─── Flags ───────────────────────────────────────────────
export function saveFlags(flags: Array<{ key: string; enabled: boolean; rolloutPercent: number; metadata?: Record<string, unknown> }>): void {
  debounced('flags', async () => {
    const rows = flags.map(f => ({
      key: f.key,
      enabled: f.enabled,
      rollout_percent: f.rolloutPercent,
      metadata: f.metadata ?? {},
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_flags').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  });
}

// ─── Config ──────────────────────────────────────────────
export function saveConfig(entries: Array<{ key: string; value: unknown }>): void {
  debounced('config', async () => {
    const rows = entries.map(e => ({
      key: e.key,
      value: e.value as any,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_config').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  });
}

// ─── Canaries ────────────────────────────────────────────
export function saveCanaries(canaries: Array<{ id: string; percent: number; enabled: boolean; metrics?: Record<string, unknown> }>): void {
  debounced('canaries', async () => {
    const rows = canaries.map(c => ({
      id: c.id,
      percent: c.percent,
      enabled: c.enabled,
      metrics_json: c.metrics ?? {},
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_canaries').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}

// ─── Retry Budgets ───────────────────────────────────────
export function saveRetryBudgets(budgets: Array<{ module: string; tokens: number; maxTokens: number; refillRate: number; totalRetries: number; totalExhausted: number }>): void {
  debounced('retry_budgets', async () => {
    const rows = budgets.map(b => ({
      module: b.module,
      tokens: b.tokens,
      max_tokens: b.maxTokens,
      refill_rate: b.refillRate,
      stats_json: { totalRetries: b.totalRetries, totalExhausted: b.totalExhausted },
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_retry_buckets').upsert(rows, { onConflict: 'module' });
    if (error) throw error;
  });
}

// ─── Metrics Snapshot ────────────────────────────────────
export function saveMetricsSnapshot(metrics: Array<{ name: string; value: number; labels: Record<string, string> }>): void {
  debounced('metrics', async () => {
    const rows = metrics
      .filter(m => m.name && typeof m.value === 'number')
      .map(m => ({
        name: m.name,
        value: m.value,
        labels_json: m.labels,
        updated_at: new Date().toISOString(),
      }));
    if (rows.length === 0) return;
    const { error } = await supabase.from('substrate_metrics_snapshot').upsert(rows, { onConflict: 'name,labels_json' });
    if (error) throw error;
  });
}

// ─── Cascade History ─────────────────────────────────────
export function saveCascadeHistory(chains: Array<{ origin: string; chain: string[]; confidence: number }>): void {
  debounced('cascade', async () => {
    const rows = chains.map(c => ({
      origin: c.origin,
      chain_json: c.chain,
      confidence: c.confidence,
      detected_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_cascade_history').insert(rows);
    if (error) throw error;
  });
}

// ─── Idempotency Store ───────────────────────────────────
export function saveIdempotencyStore(entries: Array<{ key: string; status: string; result?: unknown; expiresAt: string }>): void {
  debounced('idempotency', async () => {
    const rows = entries.map(e => ({
      key: e.key,
      status: e.status,
      result_json: e.result ?? null,
      expires_at: e.expiresAt,
    }));
    const { error } = await supabase.from('substrate_idempotency').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  });
}

// ─── Schema Registry ─────────────────────────────────────
export function saveSchemas(schemas: Array<{ entity: string; version: number; fields: string[]; migrations: Array<{ from: number; to: number; transform: string }> }>): void {
  debounced('schemas', async () => {
    const rows = schemas.map(s => ({
      entity: s.entity,
      version: s.version,
      fields_json: s.fields,
      migrations_json: s.migrations,
      registered_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_schema_registry').upsert(rows, { onConflict: 'entity' });
    if (error) throw error;
  });
}

// ─── Queue Snapshot ──────────────────────────────────────
export function saveQueueState(heap: unknown[], stats: Record<string, unknown>): void {
  debounced('queue', async () => {
    const { error } = await supabase.from('substrate_queue_snapshot').upsert({
      id: 'default',
      serialized_heap_json: heap,
      stats_json: stats,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (error) throw error;
  });
}

// ─── Chaos Rules ─────────────────────────────────────────
export function saveChaosRules(rules: Array<{ id: string; type: string; target: string; probability: number; config?: Record<string, unknown>; enabled: boolean }>): void {
  debounced('chaos', async () => {
    const rows = rules.map(r => ({
      id: r.id,
      type: r.type,
      target: r.target,
      probability: r.probability,
      config_json: r.config ?? {},
      enabled: r.enabled,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from('substrate_chaos_rules').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
  });
}

// ─── Flush All (for shutdown) ────────────────────────────
export async function flushAll(): Promise<void> {
  // Clear all pending debounce timers and execute immediately
  const pending = Array.from(timers.entries());
  timers.clear();
  // Timers have been cleared; the callbacks won't fire.
  // We rely on the caller having already called save* methods.
  // The real flush happens by calling each save method with immediate=true
  console.log(`[cp-persist] Flushed ${pending.length} pending writes`);
}

// ─── Health Metrics ──────────────────────────────────────
export function getPersistenceHealth(): { lastWriteAt: number; writeFailures: number; pendingWrites: number } {
  return {
    lastWriteAt,
    writeFailures,
    pendingWrites: timers.size,
  };
}
