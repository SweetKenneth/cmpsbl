/**
 * Control Plane Rehydration (v2 — Revision-Aware)
 * Loads durable state from database and restores in-memory substrate state.
 * Supports point-in-time restore via revision_id parameter.
 * Gated behind 'substrate.persistent_control_plane' feature flag.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEnabled, defineFlag } from '@/lib/substrate/feature-flags';
import { configureBudget } from '@/lib/substrate/retry-budget';
import { registerSchema, addMigration } from '@/lib/substrate/schema-registry';
import { getEnv, getTenantId } from './identity';

export interface RehydrationResult {
  success: boolean;
  loaded: {
    flags: number;
    config: number;
    canaries: number;
    retryBudgets: number;
    schemas: number;
    chaosRules: number;
    idempotencyKeys: number;
    cascadeChains: number;
    metricsRestored: number;
  };
  skipped: boolean;
  durationMs: number;
  revisionId: number | null;
  snapshotHash: string | null;
}

export async function rehydrateControlPlane(targetRevisionId?: number): Promise<RehydrationResult> {
  const start = Date.now();
  const result: RehydrationResult = {
    success: false,
    loaded: { flags: 0, config: 0, canaries: 0, retryBudgets: 0, schemas: 0, chaosRules: 0, idempotencyKeys: 0, cascadeChains: 0, metricsRestored: 0 },
    skipped: false,
    durationMs: 0,
    revisionId: null,
    snapshotHash: null,
  };

  if (!isEnabled('substrate.persistent_control_plane')) {
    result.skipped = true;
    result.success = true;
    result.durationMs = Date.now() - start;
    console.log('[cp-rehydrate] Persistence disabled, skipping rehydration');
    return result;
  }

  const env = getEnv();
  const tenantId = getTenantId();

  try {
    // Determine target revision
    let revisionId = targetRevisionId ?? null;
    
    // Check URL param for point-in-time restore
    if (!revisionId && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const revParam = params.get('rev');
      if (revParam) revisionId = parseInt(revParam, 10);
    }

    // If no specific revision, load latest committed
    if (!revisionId) {
      const { data: latestRev } = await supabase
        .from('substrate_cp_revisions')
        .select('revision_id, snapshot_hash')
        .eq('env', env)
        .eq('tenant_id', tenantId)
        .eq('status', 'committed')
        .order('revision_id', { ascending: false })
        .limit(1)
        .single();

      if (latestRev) {
        revisionId = latestRev.revision_id;
        result.snapshotHash = latestRev.snapshot_hash;
      }
    }

    result.revisionId = revisionId;

    // Run all loads in parallel
    const [flagsRes, configRes, canariesRes, bucketsRes, schemasRes, chaosRes, idempRes, cascadeRes, metricsRes] = await Promise.allSettled([
      loadFlags(env, tenantId, revisionId),
      loadConfig(env, tenantId, revisionId),
      loadCanaries(env, tenantId, revisionId),
      loadRetryBudgets(env, tenantId, revisionId),
      loadSchemas(env, tenantId, revisionId),
      loadChaosRules(env, tenantId, revisionId),
      loadIdempotencyKeys(env, tenantId, revisionId),
      loadCascadeHistory(env, tenantId, revisionId),
      loadMetricsSnapshot(env, tenantId, revisionId),
    ]);

    if (flagsRes.status === 'fulfilled') result.loaded.flags = flagsRes.value;
    if (configRes.status === 'fulfilled') result.loaded.config = configRes.value;
    if (canariesRes.status === 'fulfilled') result.loaded.canaries = canariesRes.value;
    if (bucketsRes.status === 'fulfilled') result.loaded.retryBudgets = bucketsRes.value;
    if (schemasRes.status === 'fulfilled') result.loaded.schemas = schemasRes.value;
    if (chaosRes.status === 'fulfilled') result.loaded.chaosRules = chaosRes.value;
    if (idempRes.status === 'fulfilled') result.loaded.idempotencyKeys = idempRes.value;
    if (cascadeRes.status === 'fulfilled') result.loaded.cascadeChains = cascadeRes.value;
    if (metricsRes.status === 'fulfilled') result.loaded.metricsRestored = metricsRes.value;

    result.success = true;
  } catch (err) {
    console.error('[cp-rehydrate] Rehydration failed:', err);
  }

  result.durationMs = Date.now() - start;
  console.log(`[cp-rehydrate] Complete in ${result.durationMs}ms (rev=${result.revisionId}):`, result.loaded);
  return result;
}

// ─── Query builder helper ────────────────────────────────

function buildQuery(table: string, env: string, tenantId: string, revisionId: number | null) {
  let query = supabase.from(table as any).select('*').eq('env', env).eq('tenant_id', tenantId);
  if (revisionId !== null) {
    query = query.eq('revision_id', revisionId);
  }
  return query;
}

// ─── Individual Loaders ──────────────────────────────────

async function loadFlags(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_flags', env, tenantId, revisionId);
  if (error || !data) return 0;
  for (const row of data) {
    defineFlag((row as any).key, (row as any).enabled, (row as any).rollout_percent);
  }
  return data.length;
}

async function loadConfig(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_config', env, tenantId, revisionId);
  if (error || !data) return 0;
  for (const row of data) {
    try {
      localStorage.setItem(`cp-config:${(row as any).key}`, JSON.stringify((row as any).value));
    } catch { /* cache only */ }
  }
  return data.length;
}

async function loadCanaries(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_canaries', env, tenantId, revisionId);
  if (error || !data) return 0;
  try {
    const stored = data.map((c: any) => ({ id: c.id, percent: c.percent, enabled: c.enabled, metrics: c.metrics_json }));
    localStorage.setItem('cp-canaries', JSON.stringify(stored));
  } catch { /* cache only */ }
  return data.length;
}

async function loadRetryBudgets(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_retry_buckets', env, tenantId, revisionId);
  if (error || !data) return 0;
  for (const row of data) {
    configureBudget((row as any).module, Number((row as any).max_tokens), Number((row as any).refill_rate));
  }
  return data.length;
}

async function loadSchemas(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_schema_registry', env, tenantId, revisionId);
  if (error || !data) return 0;
  for (const row of data) {
    const r = row as any;
    const fields = Array.isArray(r.fields_json) ? (r.fields_json as string[]) : [];
    registerSchema(r.entity, r.version, fields);
    const migrations = Array.isArray(r.migrations_json) ? (r.migrations_json as Array<{ from: number; to: number; transform: string }>) : [];
    for (const m of migrations) {
      addMigration(r.entity, m.from, m.to, m.transform);
    }
  }
  return data.length;
}

async function loadChaosRules(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_chaos_rules', env, tenantId, revisionId);
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-chaos-rules', JSON.stringify(data));
  } catch { /* cache only */ }
  return data.length;
}

async function loadIdempotencyKeys(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  let query = supabase
    .from('substrate_idempotency')
    .select('*')
    .eq('env', env)
    .eq('tenant_id', tenantId)
    .gt('expires_at', new Date().toISOString());
  if (revisionId !== null) {
    query = query.eq('revision_id', revisionId);
  }
  const { data, error } = await query;
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-idempotency', JSON.stringify(data));
  } catch { /* cache only */ }
  return data.length;
}

async function loadCascadeHistory(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  let query = supabase
    .from('substrate_cascade_history')
    .select('*')
    .eq('env', env)
    .eq('tenant_id', tenantId)
    .order('detected_at', { ascending: false })
    .limit(50);
  if (revisionId !== null) {
    query = query.eq('revision_id', revisionId);
  }
  const { data, error } = await query;
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-cascade-history', JSON.stringify(data));
  } catch { /* cache only */ }
  return data.length;
}

async function loadMetricsSnapshot(env: string, tenantId: string, revisionId: number | null): Promise<number> {
  const { data, error } = await buildQuery('substrate_metrics_snapshot', env, tenantId, revisionId);
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-metrics-snapshot', JSON.stringify(data));
  } catch { /* cache only */ }
  return data.length;
}
