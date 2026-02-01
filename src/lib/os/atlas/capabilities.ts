/**
 * Atlas Capabilities Store
 * v7.0.0 — Persistent capability toggle management
 */

import { supabase } from '@/integrations/supabase/client';
import type { AtlasCapability } from './types';

// In-memory cache for fast lookups
const capabilityCache = new Map<string, boolean>();
let cacheInitialized = false;

/**
 * Initialize cache from database
 */
export async function initCapabilityCache(): Promise<void> {
  if (cacheInitialized) return;
  
  try {
    const { data } = await supabase
      .from('substrate_capabilities')
      .select('key, enabled');
    
    if (data) {
      data.forEach(cap => capabilityCache.set(cap.key, cap.enabled));
    }
    cacheInitialized = true;
  } catch (error) {
    console.warn('[Atlas] Failed to init capability cache:', error);
  }
}

/**
 * Check if a capability is enabled (fast, cached)
 */
export function isCapabilityEnabled(key: string): boolean {
  // Default to true if not in cache
  return capabilityCache.get(key) ?? true;
}

/**
 * Get all capabilities
 */
export async function listCapabilities(): Promise<AtlasCapability[]> {
  const { data, error } = await supabase
    .from('substrate_capabilities')
    .select('*')
    .order('key');
  
  if (error) {
    console.error('[Atlas] Failed to list capabilities:', error);
    return [];
  }
  
  return (data || []).map(row => ({
    key: row.key,
    enabled: row.enabled,
    updated_at: row.updated_at,
    updated_by: row.updated_by,
    notes: row.notes,
  }));
}

/**
 * Get a single capability
 */
export async function getCapability(key: string): Promise<AtlasCapability | null> {
  const { data, error } = await supabase
    .from('substrate_capabilities')
    .select('*')
    .eq('key', key)
    .maybeSingle();
  
  if (error || !data) return null;
  
  return {
    key: data.key,
    enabled: data.enabled,
    updated_at: data.updated_at,
    updated_by: data.updated_by,
    notes: data.notes,
  };
}

/**
 * Set capability enabled state
 */
export async function setCapability(
  key: string, 
  enabled: boolean, 
  userId?: string,
  notes?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('substrate_capabilities')
    .upsert({
      key,
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: userId,
      notes: notes ?? undefined,
    }, { onConflict: 'key' });
  
  if (error) {
    console.error('[Atlas] Failed to set capability:', error);
    return false;
  }
  
  // Update cache
  capabilityCache.set(key, enabled);
  
  return true;
}

/**
 * Check if Atlas operation is allowed
 */
export async function checkOpAllowed(op: string): Promise<{ allowed: boolean; reason?: string }> {
  await initCapabilityCache();
  
  // Master toggle
  if (!isCapabilityEnabled('atlas.enabled')) {
    return { allowed: false, reason: 'Atlas control plane is disabled' };
  }
  
  // Operation-specific toggles
  const opKey = `${op}.enabled`;
  if (!isCapabilityEnabled(opKey)) {
    return { allowed: false, reason: `Operation '${op}' is disabled` };
  }
  
  return { allowed: true };
}
