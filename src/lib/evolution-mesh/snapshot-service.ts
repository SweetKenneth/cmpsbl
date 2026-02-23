/**
 * Snapshot Service — Creates and retrieves system snapshots
 * NO side effects on import. All functions explicitly invoked.
 * 
 * Actual system_snapshots columns:
 *   id (uuid, PK, auto), type (text, NOT NULL), commit_hash (text),
 *   executor_hash (text), rule_hash (text), file_manifest_hash (text),
 *   metrics_json (jsonb, default '{}'), created_at (timestamptz)
 */

import { supabase } from '@/integrations/supabase/client';

async function createSnapshot(
  type: string,
  metadata?: {
    commitHash?: string;
    executorHash?: string;
    ruleHash?: string;
    fileManifestHash?: string;
    metrics?: Record<string, unknown>;
  },
) {
  try {
    const { data, error } = await supabase
      .from('system_snapshots')
      .insert({
        type,
        commit_hash: metadata?.commitHash ?? null,
        executor_hash: metadata?.executorHash ?? null,
        rule_hash: metadata?.ruleHash ?? null,
        file_manifest_hash: metadata?.fileManifestHash ?? null,
        metrics_json: metadata?.metrics ?? {},
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

async function getSnapshot(id: string) {
  try {
    const { data, error } = await supabase
      .from('system_snapshots')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export const snapshotService = { createSnapshot, listSnapshots, getSnapshot };
