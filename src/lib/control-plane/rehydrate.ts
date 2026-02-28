/**
 * Control Plane Rehydration
 * Loads durable state from database and restores in-memory substrate state.
 * Gated behind 'substrate.persistent_control_plane' feature flag.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEnabled, defineFlag, setOverride } from '@/lib/substrate/feature-flags';
import { configureBudget } from '@/lib/substrate/retry-budget';
import { registerSchema, addMigration } from '@/lib/substrate/schema-registry';

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
}

export async function rehydrateControlPlane(): Promise<RehydrationResult> {
  const start = Date.now();
  const result: RehydrationResult = {
    success: false,
    loaded: { flags: 0, config: 0, canaries: 0, retryBudgets: 0, schemas: 0, chaosRules: 0, idempotencyKeys: 0, cascadeChains: 0, metricsRestored: 0 },
    skipped: false,
    durationMs: 0,
  };

  if (!isEnabled('substrate.persistent_control_plane')) {
    result.skipped = true;
    result.success = true;
    result.durationMs = Date.now() - start;
    console.log('[cp-rehydrate] Persistence disabled, skipping rehydration');
    return result;
  }

  try {
    // Run all loads in parallel
    const [flagsRes, configRes, canariesRes, bucketsRes, schemasRes, chaosRes, idempRes, cascadeRes, metricsRes] = await Promise.allSettled([
      loadFlags(),
      loadConfig(),
      loadCanaries(),
      loadRetryBudgets(),
      loadSchemas(),
      loadChaosRules(),
      loadIdempotencyKeys(),
      loadCascadeHistory(),
      loadMetricsSnapshot(),
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
  console.log(`[cp-rehydrate] Complete in ${result.durationMs}ms:`, result.loaded);
  return result;
}

// ─── Individual Loaders ──────────────────────────────────

async function loadFlags(): Promise<number> {
  const { data, error } = await supabase.from('substrate_flags').select('*');
  if (error || !data) return 0;
  for (const row of data) {
    defineFlag(row.key, row.enabled, row.rollout_percent);
  }
  return data.length;
}

async function loadConfig(): Promise<number> {
  const { data, error } = await supabase.from('substrate_config').select('*');
  if (error || !data) return 0;
  // Store in localStorage for control plane config compatibility
  for (const row of data) {
    try {
      localStorage.setItem(`cp-config:${row.key}`, JSON.stringify(row.value));
    } catch { /* silent */ }
  }
  return data.length;
}

async function loadCanaries(): Promise<number> {
  const { data, error } = await supabase.from('substrate_canaries').select('*');
  if (error || !data) return 0;
  // Canaries are restored into a global registry
  try {
    const stored = data.map(c => ({ id: c.id, percent: c.percent, enabled: c.enabled, metrics: c.metrics_json }));
    localStorage.setItem('cp-canaries', JSON.stringify(stored));
  } catch { /* silent */ }
  return data.length;
}

async function loadRetryBudgets(): Promise<number> {
  const { data, error } = await supabase.from('substrate_retry_buckets').select('*');
  if (error || !data) return 0;
  for (const row of data) {
    configureBudget(row.module, Number(row.max_tokens), Number(row.refill_rate));
  }
  return data.length;
}

async function loadSchemas(): Promise<number> {
  const { data, error } = await supabase.from('substrate_schema_registry').select('*');
  if (error || !data) return 0;
  for (const row of data) {
    const fields = Array.isArray(row.fields_json) ? (row.fields_json as string[]) : [];
    registerSchema(row.entity, row.version, fields);
    const migrations = Array.isArray(row.migrations_json) ? (row.migrations_json as Array<{ from: number; to: number; transform: string }>) : [];
    for (const m of migrations) {
      addMigration(row.entity, m.from, m.to, m.transform);
    }
  }
  return data.length;
}

async function loadChaosRules(): Promise<number> {
  const { data, error } = await supabase.from('substrate_chaos_rules').select('*');
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-chaos-rules', JSON.stringify(data));
  } catch { /* silent */ }
  return data.length;
}

async function loadIdempotencyKeys(): Promise<number> {
  // Only load non-expired keys
  const { data, error } = await supabase
    .from('substrate_idempotency')
    .select('*')
    .gt('expires_at', new Date().toISOString());
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-idempotency', JSON.stringify(data));
  } catch { /* silent */ }
  return data.length;
}

async function loadCascadeHistory(): Promise<number> {
  const { data, error } = await supabase
    .from('substrate_cascade_history')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(50);
  if (error || !data) return 0;
  try {
    localStorage.setItem('cp-cascade-history', JSON.stringify(data));
  } catch { /* silent */ }
  return data.length;
}

async function loadMetricsSnapshot(): Promise<number> {
  const { data, error } = await supabase.from('substrate_metrics_snapshot').select('*');
  if (error || !data) return 0;
  // Restore counters and gauges only (not histogram observations)
  try {
    localStorage.setItem('cp-metrics-snapshot', JSON.stringify(data));
  } catch { /* silent */ }
  return data.length;
}
