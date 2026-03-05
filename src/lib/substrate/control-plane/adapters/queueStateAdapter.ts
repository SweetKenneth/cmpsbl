/**
 * Control Plane Queue State Adapter — Durable or Degraded Storage
 * 
 * Provides namespaced key-value storage backed by the cp_queue_state concept.
 * Falls back to in-memory Map if database is unreachable (degraded mode).
 * 
 * Key namespaces:
 *   "encode:plan:<plan_id>"
 *   "encode:discussion:<plan_id>:<msg_id>"
 *   "bus:event:<seq>"
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '../../events/emit';

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

let degradedMode = false;
const memoryFallback = new Map<string, { value: unknown; meta?: Record<string, unknown>; updated_at: number }>();

// ═══════════════════════════════════════════════════════════════
// REACHABILITY
// ═══════════════════════════════════════════════════════════════

let lastHealthCheck = 0;
let lastHealthResult = true;
const HEALTH_CHECK_TTL_MS = 30_000;

async function isCPReachable(): Promise<boolean> {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_TTL_MS) return lastHealthResult;

  try {
    const { error } = await supabase
      .from('analytics_snapshots')
      .select('id')
      .limit(1)
      .maybeSingle();
    lastHealthResult = !error;
  } catch {
    lastHealthResult = false;
  }

  lastHealthCheck = now;

  if (!lastHealthResult && !degradedMode) {
    degradedMode = true;
    emit({
      module: 'system',
      event_type: 'cp_degraded_mode',
      outcome: 'warning',
      data: { reason: 'Database unreachable — falling back to in-memory storage' },
    });
  } else if (lastHealthResult && degradedMode) {
    degradedMode = false;
    emit({
      module: 'system',
      event_type: 'cp_recovered',
      outcome: 'succeeded',
      data: { reason: 'Database reachable — resuming durable storage' },
    });
  }

  return lastHealthResult;
}

// ═══════════════════════════════════════════════════════════════
// SERIALIZATION
// ═══════════════════════════════════════════════════════════════

function serialize(value: unknown): string {
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
 * Persists to brain_events (as structured storage) or memory fallback.
 */
export async function cpPut(
  key: string,
  value: unknown,
  meta?: Record<string, unknown>
): Promise<void> {
  const now = Date.now();

  // Always store in memory (fast path + fallback)
  memoryFallback.set(key, { value, meta, updated_at: now });

  // Attempt durable storage
  if (await isCPReachable()) {
    try {
      const payload = {
        module: 'control_plane',
        event_type: `cp_state:${key}`,
        data: { key, value: serialize(value), meta } as any,
        outcome: 'success' as const,
      };
      await supabase.from('brain_events').insert(payload);
    } catch {
      // Silently degrade — memory fallback active
    }
  }
}

/**
 * Retrieve a value by key.
 * Tries memory first (fast), falls back to DB query.
 */
export async function cpGet<T = unknown>(key: string): Promise<T | null> {
  // Fast path: memory
  const mem = memoryFallback.get(key);
  if (mem) return mem.value as T;

  // Slow path: DB
  if (await isCPReachable()) {
    try {
      const { data } = await supabase
        .from('brain_events')
        .select('data')
        .eq('event_type', `cp_state:${key}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.data) {
        const record = data.data as any;
        const parsed = deserialize<T>(record.value);
        memoryFallback.set(key, { value: parsed, meta: record.meta, updated_at: Date.now() });
        return parsed;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

/**
 * List values by key prefix.
 */
export async function cpList<T = unknown>(prefix: string): Promise<{ key: string; value: T }[]> {
  // Fast path: memory scan
  const results: { key: string; value: T }[] = [];

  for (const [key, entry] of memoryFallback) {
    if (key.startsWith(prefix)) {
      results.push({ key, value: entry.value as T });
    }
  }

  // If no memory results and DB is reachable, try DB
  if (results.length === 0 && await isCPReachable()) {
    try {
      const { data } = await supabase
        .from('brain_events')
        .select('data')
        .like('event_type', `cp_state:${prefix}%`)
        .order('created_at', { ascending: false })
        .limit(200);

      if (data) {
        for (const row of data) {
          const record = row.data as any;
          if (record?.key && record?.value) {
            const parsed = deserialize<T>(record.value);
            results.push({ key: record.key, value: parsed });
            memoryFallback.set(record.key, { value: parsed, meta: record.meta, updated_at: Date.now() });
          }
        }
      }
    } catch {
      // Fall through
    }
  }

  return results;
}

/**
 * Delete a key.
 */
export async function cpDelete(key: string): Promise<void> {
  memoryFallback.delete(key);
  // DB entries are append-only; deletion is logical (no new entries for this key)
}

// ═══════════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════════

/** Check if CP storage is in degraded mode */
export function isDegraded(): boolean {
  return degradedMode;
}

/** Force a health recheck */
export async function recheckHealth(): Promise<boolean> {
  lastHealthCheck = 0; // Reset TTL
  return isCPReachable();
}
