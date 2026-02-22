/**
 * Diff Service — Generates and retrieves system diffs
 * NO side effects on import. All functions explicitly invoked.
 */

import { supabase } from '@/integrations/supabase/client';

async function generateDiff(baseSnapshotId: string, targetSnapshotId: string) {
  try {
    const { data, error } = await supabase
      .from('system_diffs')
      .insert({
        base_snapshot_id: baseSnapshotId,
        target_snapshot_id: targetSnapshotId,
        diff_data: {},
        status: 'generated',
      } as never)
      .select()
      .single();

    if (error) {
      console.warn('[EvolutionMesh:Diff] Failed to generate:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('[EvolutionMesh:Diff] Error:', err);
    return { success: false, error: 'Diff generation failed' };
  }
}

async function listDiffs(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('system_diffs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export const diffService = { generateDiff, listDiffs };
