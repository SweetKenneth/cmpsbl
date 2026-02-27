/**
 * Intent Mesh — Pipeline Crystallization
 * Save discovered resolver chains as reusable pipelines
 * 
 * When the mesh discovers a productive resolver chain (e.g., DEFENSE → IDENTITY + RELAY),
 * users can "crystallize" that configuration into a saved pipeline for replay.
 */

import { supabase } from '@/integrations/supabase/client';
import { broadcastIntent } from './router';
import type { MeshReceipt } from './types';

export interface MeshSavedPipeline {
  id: string;
  name: string;
  description: string | null;
  source_module: string;
  intent_type: string;
  domains: string[];
  governance_mode: string;
  resolver_chain: string[];
  input_template: Record<string, unknown>;
  discovered_from: string | null;
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all saved pipelines
 */
export async function getSavedPipelines(): Promise<MeshSavedPipeline[]> {
  const { data, error } = await supabase
    .from('mesh_saved_pipelines')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[Mesh:Pipelines] Failed to fetch:', error);
    return [];
  }
  return (data || []) as unknown as MeshSavedPipeline[];
}

/**
 * Save a pipeline from a mesh receipt (crystallization)
 */
export async function savePipelineFromReceipt(
  receipt: MeshReceipt,
  name: string,
  description?: string
): Promise<MeshSavedPipeline | null> {
  const pipeline = {
    name,
    description: description || `Discovered: ${receipt.source_module} → ${(receipt.resolved_by || []).join(' + ')} via ${receipt.intent_type}`,
    source_module: receipt.source_module,
    intent_type: receipt.intent_type,
    domains: receipt.target_modules || [],
    governance_mode: receipt.governance_mode,
    resolver_chain: receipt.resolved_by || [],
    input_template: receipt.input_summary || {},
    discovered_from: receipt.id || null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('mesh_saved_pipelines')
    .insert([pipeline as any])
    .select()
    .single();

  if (error) {
    console.error('[Mesh:Pipelines] Save failed:', error);
    throw error;
  }
  return data as unknown as MeshSavedPipeline;
}

/**
 * Run a saved pipeline — re-broadcasts the intent with the stored config
 */
export async function runSavedPipeline(pipeline: MeshSavedPipeline) {
  const result = await broadcastIntent({
    sourceModule: pipeline.source_module,
    intentType: pipeline.intent_type,
    domains: pipeline.domains,
    input: pipeline.input_template as Record<string, unknown>,
    governanceMode: (pipeline.governance_mode as 'read_only' | 'governed' | 'emergency') || 'read_only',
  });

  // Increment run count (fire-and-forget)
  supabase
    .from('mesh_saved_pipelines')
    .update({ 
      run_count: (pipeline.run_count || 0) + 1, 
      last_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', pipeline.id)
    .then(() => {});

  return result;
}

/**
 * Delete a saved pipeline
 */
export async function deletePipeline(id: string): Promise<void> {
  const { error } = await supabase
    .from('mesh_saved_pipelines')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
