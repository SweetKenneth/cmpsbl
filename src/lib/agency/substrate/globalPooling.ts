/**
 * Global Pooling System
 * Optional heuristic sharing across agencies with privacy controls
 */

import { supabase } from '@/integrations/supabase/client';

export interface PoolingConsent {
  allow_global_pooling: boolean;
  allow_template_sharing: boolean;
  allow_heuristic_sharing: boolean;
  privacy_level: 'strict' | 'standard' | 'open';
  exclude_domains: string[];
}

export interface PooledHeuristic {
  id: string;
  title: string;
  category: string;
  description: string | null;
  success_rate: number;
  usage_count: number;
  confidence: number;
}

/**
 * Check if agency has enabled global pooling
 */
export async function getPoolingConsent(agencyId: string): Promise<PoolingConsent | null> {
  const { data, error } = await supabase
    .from('agency_dream_consent')
    .select('allow_global_pooling, allow_template_sharing, allow_heuristic_sharing, privacy_level, exclude_domains')
    .eq('agency_id', agencyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No consent record, return defaults
      return {
        allow_global_pooling: true,
        allow_template_sharing: true,
        allow_heuristic_sharing: true,
        privacy_level: 'standard',
        exclude_domains: [],
      };
    }
    console.error('Failed to fetch pooling consent:', error);
    return null;
  }

  return {
    ...data,
    privacy_level: (data.privacy_level as 'strict' | 'standard' | 'open') || 'standard',
    exclude_domains: data.exclude_domains || [],
  };
}

/**
 * Anonymize heuristic data before sharing
 */
function anonymizeHeuristic(heuristic: any): any {
  // Remove identifying information
  const anonymized = { ...heuristic };
  delete anonymized.source_agency_id;
  delete anonymized.source_task_id;

  // Scrub payload of any potential PII
  if (anonymized.payload) {
    const payloadStr = JSON.stringify(anonymized.payload);
    // Remove emails, URLs with specific domains, etc.
    const scrubbed = payloadStr
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/https?:\/\/[^\s"]+/g, '[URL]');
    anonymized.payload = JSON.parse(scrubbed);
  }

  return anonymized;
}

/**
 * Upload local heuristics to global pool
 */
export async function uploadToGlobalPool(
  agencyId: string,
  heuristicIds: string[]
): Promise<{ uploaded: number; skipped: number }> {
  const consent = await getPoolingConsent(agencyId);
  
  if (!consent?.allow_global_pooling || !consent?.allow_heuristic_sharing) {
    return { uploaded: 0, skipped: heuristicIds.length };
  }

  // Fetch heuristics to upload
  const { data: heuristics, error: fetchError } = await supabase
    .from('substrate_heuristics')
    .select('*')
    .in('id', heuristicIds)
    .eq('source_agency_id', agencyId);

  if (fetchError || !heuristics) {
    console.error('Failed to fetch heuristics for upload:', fetchError);
    return { uploaded: 0, skipped: heuristicIds.length };
  }

  let uploaded = 0;
  let skipped = 0;

  for (const h of heuristics) {
    // Skip if in excluded domains
    if (consent.exclude_domains.some(d => h.category?.includes(d))) {
      skipped++;
      continue;
    }

    // Only share high-confidence heuristics
    if ((h.confidence || 0) < 0.7) {
      skipped++;
      continue;
    }

    // Anonymize and upload
    const anonymized = anonymizeHeuristic(h);

    const { error: insertError } = await supabase
      .from('substrate_brain_improvements')
      .insert({
        improvement_type: 'heuristic',
        category: h.category,
        title: h.title,
        description: h.description,
        payload: anonymized.payload,
        source_count: 1,
        confidence: h.confidence,
        is_active: true,
      });

    if (!insertError) {
      // Mark as global
      await supabase
        .from('substrate_heuristics')
        .update({ is_global: true })
        .eq('id', h.id);

      uploaded++;
    } else {
      skipped++;
    }
  }

  return { uploaded, skipped };
}

/**
 * Download heuristics from global pool
 */
export async function downloadFromGlobalPool(
  agencyId: string,
  category?: string,
  limit: number = 20
): Promise<PooledHeuristic[]> {
  const consent = await getPoolingConsent(agencyId);
  
  if (!consent?.allow_global_pooling) {
    return [];
  }

  let query = supabase
    .from('substrate_brain_improvements')
    .select('id, title, category, description, confidence, adoption_count')
    .eq('is_active', true)
    .eq('improvement_type', 'heuristic')
    .order('confidence', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to download from global pool:', error);
    return [];
  }

  return (data || []).map(h => ({
    id: h.id,
    title: h.title || '',
    category: h.category,
    description: h.description,
    success_rate: 0.8, // Default for global heuristics
    usage_count: h.adoption_count || 0,
    confidence: h.confidence || 0.7,
  }));
}

/**
 * Apply a global heuristic to local agency
 */
export async function applyGlobalHeuristic(
  agencyId: string,
  globalHeuristicId: string
): Promise<boolean> {
  // Fetch global heuristic
  const { data: global, error: fetchError } = await supabase
    .from('substrate_brain_improvements')
    .select('*')
    .eq('id', globalHeuristicId)
    .single();

  if (fetchError || !global) {
    console.error('Failed to fetch global heuristic:', fetchError);
    return false;
  }

  // Create local copy
  const { error: insertError } = await supabase
    .from('substrate_heuristics')
    .insert({
      heuristic_type: 'adopted',
      category: global.category,
      title: `[Global] ${global.title}`,
      description: global.description,
      payload: global.payload,
      source_agency_id: agencyId,
      confidence: global.confidence,
      is_global: true,
      is_active: true,
    });

  if (insertError) {
    console.error('Failed to apply global heuristic:', insertError);
    return false;
  }

  // Increment adoption count (fire-and-forget, non-blocking)
  supabase
    .from('substrate_brain_improvements')
    .update({ adoption_count: (global.adoption_count || 0) + 1 })
    .eq('id', globalHeuristicId)
    .then(({ error: updateErr }) => {
      if (updateErr) console.error('Failed to increment adoption count:', updateErr);
    });

  return true;
}
