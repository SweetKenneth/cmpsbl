/**
 * System Flags — Runtime toggles backed by system_flags DB table
 * Used for admin-controlled features like Shadow Mesh
 */

import { supabase } from '@/integrations/supabase/client';

/** In-memory cache with TTL to avoid hammering the DB */
const cache = new Map<string, { value: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 10_000; // 10 seconds

/**
 * Check if a system flag is enabled.
 * Reads from DB with a short cache to keep it fast.
 */
export async function isSystemFlagEnabled(key: string): Promise<boolean> {
  // Check cache first
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  try {
    const { data, error } = await supabase
      .from('system_flags')
      .select('enabled')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[flags] Failed to read flag "${key}":`, error.message);
      return false;
    }

    const enabled = data?.enabled ?? false;
    cache.set(key, { value: enabled, expiresAt: Date.now() + CACHE_TTL_MS });
    return enabled;
  } catch (err) {
    console.warn(`[flags] Error reading flag "${key}":`, err);
    return false;
  }
}

/**
 * Set a system flag value (admin only — RLS enforced)
 */
export async function setSystemFlag(key: string, enabled: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('system_flags')
    .update({ enabled })
    .eq('key', key);

  if (error) {
    console.error(`[flags] Failed to set flag "${key}":`, error.message);
    return false;
  }

  // Update cache immediately
  cache.set(key, { value: enabled, expiresAt: Date.now() + CACHE_TTL_MS });
  return true;
}

/**
 * Convenience: Is Shadow Mesh enabled?
 */
export async function isShadowMeshEnabled(): Promise<boolean> {
  return isSystemFlagEnabled('shadow_mesh_enabled');
}

/**
 * Invalidate cache for a specific flag
 */
export function invalidateFlagCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
