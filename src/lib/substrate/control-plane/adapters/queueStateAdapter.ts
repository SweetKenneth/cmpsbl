/**
 * Control Plane Queue State Adapter — Typed, Bounded, Durable
 *
 * Provides namespaced key-value storage backed by `control_plane_state` table.
 * Falls back to legacy `brain_events` append-only storage if the new table
 * is unreachable (missing, RLS error, outage). Further degrades to in-memory
 * LRU cache if all DB access fails.
 *
 * Key namespaces:
 *   "encode:plan:<plan_id>"
 *   "encode:discussion:<plan_id>:<msg_id>"
 *   "bus:event:<seq>"
 *
 * Toggle: set CP_TABLE_ENABLED = false to force legacy path without code removal.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { emit } from '../../events/emit';

// ═══════════════════════════════════════════════════════════════
// FEATURE FLAG
// ═══════════════════════════════════════════════════════════════

const CP_TABLE_ENABLED = true;

// ═══════════════════════════════════════════════════════════════
// LRU CACHE
// ═══════════════════════════════════════════════════════════════

const MAX_MEMORY_KEYS = 1000;
const MEMORY_TTL_MS: number | null = 10 * 60 * 1000; // 10 min; set null to disable

interface CacheEntry {
  value: unknown;
  meta?: Record<string, unknown>;
  updated_at: number;
}

/** Bounded LRU map — insertion order tracks recency via delete+set */
const lru = new Map<string, CacheEntry>();

function lruGet<T>(key: string): T | null {
  const entry = lru.get(key);
  if (!entry) return null;

  // TTL check
  if (MEMORY_TTL_MS !== null && Date.now() - entry.updated_at > MEMORY_TTL_MS) {
    lru.delete(key);
    return null;
  }

  // Refresh recency
  lru.delete(key);
  lru.set(key, entry);
  return entry.value as T;
}

function lruSet(key: string, value: unknown, meta?: Record<string, unknown>): void {
  // Delete first so re-insert moves to end (most recent)
  lru.delete(key);
  lru.set(key, { value, meta, updated_at: Date.now() });

  // Evict oldest entries (beginning of Map iteration) until within cap
  while (lru.size > MAX_MEMORY_KEYS) {
    const oldest = lru.keys().next().value;
    if (oldest !== undefined) lru.delete(oldest);
    else break;
  }
}

function lruDelete(key: string): void {
  lru.delete(key);
}

function lruScan<T>(prefix: string): Array<{ key: string; value: T }> {
  const results: Array<{ key: string; value: T }> = [];
  const now = Date.now();
  for (const [key, entry] of lru) {
    if (!key.startsWith(prefix)) continue;
    if (MEMORY_TTL_MS !== null && now - entry.updated_at > MEMORY_TTL_MS) {
      lru.delete(key);
      continue;
    }
    results.push({ key, value: entry.value as T });
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// REACHABILITY
// ═══════════════════════════════════════════════════════════════

let degradedMode = false;
let usingLegacy = false;
let lastHealthCheck = 0;
let lastHealthResult: 'cp' | 'legacy' | 'memory' = 'cp';
const HEALTH_CHECK_TTL_MS = 30_000;

type StorageMode = 'cp' | 'legacy' | 'memory';

async function resolveStorageMode(): Promise<StorageMode> {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_TTL_MS) return lastHealthResult;
  lastHealthCheck = now;

  // Try new CP table first
  if (CP_TABLE_ENABLED) {
    try {
      const { error } = await supabase
        .from('control_plane_state')
        .select('key')
        .limit(1)
        .maybeSingle();
      if (!error) {
        if (degradedMode || usingLegacy) {
          degradedMode = false;
          usingLegacy = false;
          emit({
            module: 'system',
            event_type: 'cp_recovered',
            outcome: 'succeeded',
            data: { reason: 'CP table reachable — resuming durable storage' },
          });
        }
        lastHealthResult = 'cp';
        return 'cp';
      }
    } catch { /* fall through */ }
  }

  // Try legacy brain_events
  try {
    const { error } = await supabase
      .from('brain_events')
      .select('id')
      .limit(1)
      .maybeSingle();
    if (!error) {
      if (!usingLegacy) {
        usingLegacy = true;
        emit({
          module: 'system',
          event_type: 'cp_degraded_mode',
          outcome: 'failed',
          data: { reason: 'CP table unreachable — falling back to legacy event storage' },
        });
      }
      lastHealthResult = 'legacy';
      return 'legacy';
    }
  } catch { /* fall through */ }

  // Full degraded — memory only
  if (!degradedMode) {
    degradedMode = true;
    emit({
      module: 'system',
      event_type: 'cp_degraded_mode',
      outcome: 'failed',
      data: { reason: 'Database unreachable — falling back to in-memory storage' },
    });
  }
  lastHealthResult = 'memory';
  return 'memory';
}

// ═══════════════════════════════════════════════════════════════
// KEY VALIDATION
// ═══════════════════════════════════════════════════════════════

const MAX_KEY_LENGTH = 512;

function validateKey(key: string): void {
  if (!key || key.trim().length === 0) throw new Error('CP key must not be empty or whitespace-only');
  if (key.length > MAX_KEY_LENGTH) throw new Error(`CP key exceeds max length (${MAX_KEY_LENGTH})`);
  if (key.includes('\0')) throw new Error('CP key must not contain null bytes');
}

// ═══════════════════════════════════════════════════════════════
// SERIALIZATION
// ═══════════════════════════════════════════════════════════════

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

function deserialize<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Store a value with optional metadata.
 * Writes to CP table, legacy brain_events, or memory depending on availability.
 */
export async function cpPut<T>(
  key: string,
  value: T,
  meta?: Record<string, unknown>
): Promise<void> {
  validateKey(key);

  // Always write to LRU (fast path + fallback)
  lruSet(key, value, meta);

  const mode = await resolveStorageMode();

  if (mode === 'cp') {
    try {
      await supabase.from('control_plane_state').upsert(
        [{
          key,
          value: JSON.parse(serialize(value)) as Record<string, unknown>,
          meta: (meta ?? {}) as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        }],
        { onConflict: 'key' }
      );
      return;
    } catch { /* fall through to legacy */ }
  }

  if (mode === 'cp' || mode === 'legacy') {
    try {
      await supabase.from('brain_events').insert([{
        event_type: `cp_state:${key}`,
        module: 'control_plane',
        data: { key, value: serialize(value), meta } as Record<string, unknown>,
        outcome: 'success',
      }]);
    } catch { /* memory fallback active */ }
  }
}

/**
 * Retrieve a value by key.
 * Tries LRU first, then CP table, then legacy brain_events.
 */
export async function cpGet<T>(key: string): Promise<T | null> {
  validateKey(key);

  // Fast path: LRU
  const cached = lruGet<T>(key);
  if (cached !== null) return cached;

  const mode = await resolveStorageMode();

  // CP table path
  if (mode === 'cp') {
    try {
      const { data, error } = await supabase
        .from('control_plane_state')
        .select('value, meta')
        .eq('key', key)
        .maybeSingle();

      if (!error && data) {
        const parsed = data.value as T;
        lruSet(key, parsed, (data.meta as Record<string, unknown>) ?? undefined);
        return parsed;
      }
    } catch { /* fall through */ }
  }

  // Legacy path
  if (mode === 'cp' || mode === 'legacy') {
    try {
      const { data } = await supabase
        .from('brain_events')
        .select('data')
        .eq('event_type', `cp_state:${key}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.data) {
        const record = data.data as Record<string, unknown>;
        const parsed = deserialize<T>(record.value as string);
        lruSet(key, parsed, (record.meta as Record<string, unknown>) ?? undefined);
        return parsed;
      }
    } catch { /* fall through */ }
  }

  return null;
}

/**
 * List values by key prefix.
 * Returns up to 200 results ordered by most recent.
 */
export async function cpList<T>(prefix: string): Promise<Array<{ key: string; value: T }>> {
  const mode = await resolveStorageMode();

  // CP table path — authoritative when available
  if (mode === 'cp') {
    try {
      const { data, error } = await supabase
        .from('control_plane_state')
        .select('key, value, meta')
        .like('key', `${prefix}%`)
        .order('updated_at', { ascending: false })
        .limit(200);

      if (!error && data && data.length > 0) {
        const results: Array<{ key: string; value: T }> = [];
        for (const row of data) {
          const parsed = row.value as T;
          lruSet(row.key, parsed, (row.meta as Record<string, unknown>) ?? undefined);
          results.push({ key: row.key, value: parsed });
        }
        return results;
      }
    } catch { /* fall through */ }
  }

  // Legacy path
  if (mode === 'cp' || mode === 'legacy') {
    try {
      const { data } = await supabase
        .from('brain_events')
        .select('data')
        .like('event_type', `cp_state:${prefix}%`)
        .order('created_at', { ascending: false })
        .limit(200);

      if (data && data.length > 0) {
        const results: Array<{ key: string; value: T }> = [];
        const seen = new Set<string>();
        for (const row of data) {
          const record = row.data as Record<string, unknown>;
          if (record?.key && record?.value && !seen.has(record.key as string)) {
            seen.add(record.key as string);
            const parsed = deserialize<T>(record.value as string);
            lruSet(record.key as string, parsed, (record.meta as Record<string, unknown>) ?? undefined);
            results.push({ key: record.key as string, value: parsed });
          }
        }
        return results;
      }
    } catch { /* fall through */ }
  }

  // Memory-only scan
  return lruScan<T>(prefix);
}

/**
 * Delete a key from all stores.
 */
export async function cpDelete(key: string): Promise<void> {
  validateKey(key);
  lruDelete(key);

  const mode = await resolveStorageMode();

  if (mode === 'cp') {
    try {
      await supabase.from('control_plane_state').delete().eq('key', key);
    } catch { /* best effort */ }
  }
  // Legacy entries are append-only — logical deletion via LRU eviction
}

// ═══════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════

/** Check if CP storage is in degraded mode */
export function isDegraded(): boolean {
  return degradedMode || usingLegacy;
}

/** Force a health recheck */
export async function recheckHealth(): Promise<boolean> {
  lastHealthCheck = 0;
  const mode = await resolveStorageMode();
  return mode === 'cp';
}

/** Get current storage mode for diagnostics */
export function getStorageMode(): string {
  return lastHealthResult;
}

/** Get LRU cache stats */
export function getCacheStats(): { size: number; maxSize: number; ttlMs: number | null } {
  return { size: lru.size, maxSize: MAX_MEMORY_KEYS, ttlMs: MEMORY_TTL_MS };
}
