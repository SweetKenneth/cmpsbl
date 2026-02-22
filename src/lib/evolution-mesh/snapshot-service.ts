/**
 * Snapshot Service — Creates and retrieves system snapshots
 * NO side effects on import. All functions explicitly invoked.
 */

import { supabase } from '@/integrations/supabase/client';

async function createSnapshot(label: string, metadata?: Record<string, unknown>) {
  try {
    const { data, error } = await supabase
      .from('system_snapshots')
      .insert({
        label,
        snapshot_data: metadata ?? {},
        created_by: (await supabase.auth.getUser()).data.user?.id ?? 'system',
      } as never)
      .select()
      .single();

    if (error) {
      console.warn('[EvolutionMesh:Snapshot] Failed to create snapshot:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[EvolutionMesh:Snapshot] Error:', err);
    return { success: false, error: 'Snapshot creation failed' };
  }
}

async function listSnapshots(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('system_snapshots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[EvolutionMesh:Snapshot] Failed to list:', error.message);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

export const snapshotService = { createSnapshot, listSnapshots };
