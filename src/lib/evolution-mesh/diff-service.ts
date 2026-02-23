/**
 * Diff Service — Generates and retrieves system diffs
 * NO side effects on import. All functions explicitly invoked.
 *
 * Actual system_diffs columns:
 *   id (uuid, PK, auto), shadow_run_id (text, nullable),
 *   from_snapshot_id (uuid, nullable), to_snapshot_id (uuid, nullable),
 *   diff_summary_json (jsonb, default '{}'), diff_patch_text (text, nullable),
 *   created_at (timestamptz)
 */

import { supabase } from '@/integrations/supabase/client';

async function generateDiff(
  fromSnapshotId: string,
  toSnapshotId: string,
  options?: { shadowRunId?: string; patchText?: string; summary?: Record<string, unknown> },
) {
  try {
    const { data, error } = await supabase
      .from('system_diffs')
      .insert({
        from_snapshot_id: fromSnapshotId,
        to_snapshot_id: toSnapshotId,
        shadow_run_id: options?.shadowRunId ?? null,
        diff_summary_json: options?.summary ?? {},
        diff_patch_text: options?.patchText ?? null,
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
