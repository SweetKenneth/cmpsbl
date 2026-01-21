/**
 * Hybrid Dream Learning System
 * Local + Global dream cycles with privacy guardrails
 */

import { supabase } from '@/integrations/supabase/client';

// Types
export interface DreamImprovement {
  id: string;
  layer: string;
  improvement_type: string;
  category: string;
  title: string;
  payload: any;
  confidence: number;
  applied: boolean;
  created_at: string;
}

export interface DreamCycleLog {
  id: string;
  agency_id: string | null;
  cycle_type: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  improvements_generated: number;
  templates_created: number;
  heuristics_learned: number;
  artifacts_processed: number;
  metadata: any;
}

export interface DreamLearningMetrics {
  skill_improvement_score: number;
  template_diff_score: number;
  artifact_quality_score: number;
  success_rate_delta: number;
  token_efficiency_delta: number;
  tasks_before: number;
  tasks_after: number;
}

export interface DreamConsent {
  allow_global_pooling: boolean;
  allow_template_sharing: boolean;
  allow_heuristic_sharing: boolean;
  privacy_level: string;
  exclude_domains: string[];
}

export interface GlobalBrainImprovement {
  id: string;
  improvement_type: string;
  category: string;
  title: string;
  description: string | null;
  payload: any;
  source_count: number;
  confidence: number;
  adoption_count: number;
  version: string;
  is_active: boolean;
}

// API Functions

/**
 * Trigger local dream cycle for an agency
 */
export async function triggerLocalDreamCycle(agencyId: string): Promise<{ success: boolean; cycleId?: string }> {
  const { data, error } = await supabase.functions.invoke('pf-agency-local-dream', {
    body: { agencyId },
  });

  if (error) {
    console.error('Local dream cycle failed:', error);
    return { success: false };
  }

  return { success: data?.success, cycleId: data?.cycleId };
}

/**
 * Trigger global dream cycle (admin only in production)
 */
export async function triggerGlobalDreamCycle(): Promise<{ success: boolean; cycleId?: string }> {
  const { data, error } = await supabase.functions.invoke('pf-agency-global-dream', {
    body: { force: true },
  });

  if (error) {
    console.error('Global dream cycle failed:', error);
    return { success: false };
  }

  return { success: data?.success, cycleId: data?.cycleId };
}

/**
 * Get local dream improvements for an agency
 */
export async function getLocalImprovements(agencyId: string): Promise<DreamImprovement[]> {
  const { data, error } = await supabase
    .from('agency_dream_memory')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('layer', 'local')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch local improvements:', error);
    return [];
  }

  return data || [];
}

/**
 * Get global substrate brain improvements
 */
export async function getGlobalImprovements(): Promise<GlobalBrainImprovement[]> {
  const { data, error } = await supabase
    .from('substrate_brain_improvements')
    .select('*')
    .eq('is_active', true)
    .order('confidence', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch global improvements:', error);
    return [];
  }

  return data || [];
}

/**
 * Apply a global improvement to a local agency
 */
export async function applyGlobalImprovement(
  agencyId: string,
  improvementId: string
): Promise<boolean> {
  // 1. Get the global improvement
  const { data: improvement, error: fetchError } = await supabase
    .from('substrate_brain_improvements')
    .select('*')
    .eq('id', improvementId)
    .single();

  if (fetchError || !improvement) {
    console.error('Failed to fetch improvement:', fetchError);
    return false;
  }

  // 2. Create local copy
  const { error: insertError } = await supabase
    .from('agency_dream_memory')
    .insert({
      agency_id: agencyId,
      layer: 'local',
      improvement_type: improvement.improvement_type,
      category: improvement.category,
      title: `[Applied] ${improvement.title}`,
      payload: improvement.payload,
      confidence: improvement.confidence,
      applied: true,
      applied_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error('Failed to apply improvement:', insertError);
    return false;
  }

  // 3. Increment adoption count
  await supabase
    .from('substrate_brain_improvements')
    .update({ adoption_count: (improvement.adoption_count || 0) + 1 })
    .eq('id', improvementId);

  return true;
}

/**
 * Get dream cycle logs for an agency
 */
export async function getDreamCycleLogs(agencyId: string | null): Promise<DreamCycleLog[]> {
  let query = supabase
    .from('dream_cycle_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (agencyId) {
    query = query.or(`agency_id.eq.${agencyId},agency_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch dream cycle logs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get dream learning metrics
 */
export async function getDreamLearningMetrics(agencyId: string | null): Promise<DreamLearningMetrics[]> {
  let query = supabase
    .from('dream_learning_metrics')
    .select('*')
    .order('metric_date', { ascending: false })
    .limit(30);

  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch dream metrics:', error);
    return [];
  }

  return data || [];
}

/**
 * Get/Update dream consent for an agency
 */
export async function getDreamConsent(agencyId: string): Promise<DreamConsent | null> {
  const { data, error } = await supabase
    .from('agency_dream_consent')
    .select('*')
    .eq('agency_id', agencyId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch dream consent:', error);
    return null;
  }

  if (!data) {
    // Create default consent
    const { data: newConsent, error: insertError } = await supabase
      .from('agency_dream_consent')
      .insert({
        agency_id: agencyId,
        allow_global_pooling: true,
        allow_template_sharing: true,
        allow_heuristic_sharing: true,
        privacy_level: 'standard',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create dream consent:', insertError);
      return null;
    }

    return newConsent;
  }

  return data;
}

export async function updateDreamConsent(
  agencyId: string,
  updates: Partial<DreamConsent>
): Promise<boolean> {
  const { error } = await supabase
    .from('agency_dream_consent')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('agency_id', agencyId);

  if (error) {
    console.error('Failed to update dream consent:', error);
    return false;
  }

  return true;
}

/**
 * Export dream memory for an agency
 */
export async function exportDreamMemory(agencyId: string): Promise<string> {
  const [localImprovements, globalApplied] = await Promise.all([
    getLocalImprovements(agencyId),
    supabase
      .from('agency_dream_memory')
      .select('*')
      .eq('agency_id', agencyId)
      .eq('applied', true)
  ]);

  const exportData = {
    agency_id: agencyId,
    exported_at: new Date().toISOString(),
    local_improvements: localImprovements,
    applied_global_improvements: globalApplied.data || [],
    version: '1.0.0',
  };

  return JSON.stringify(exportData, null, 2);
}
