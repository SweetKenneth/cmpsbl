/**
 * PFV Port → Research Spine
 * Structured query → execute → verify → route pipeline with confidence scoring
 * Benefits: CLM, ORACLE, BRAIN
 * Source: PromptFluid-Vision research/spine.ts
 */

import { supabase } from '@/integrations/supabase/client';

export interface ResearchQuery {
  query: string;
  topic: string;
  source: string;
  weight: number;
  context?: Record<string, any>;
}

export interface ResearchInsight {
  id: string;
  content: string;
  confidence: number;
  sources: string[];
  verified: boolean;
  tags: string[];
}

/**
 * Submit a research query
 */
export async function submitResearchQuery(query: ResearchQuery) {
  const { data, error } = await supabase
    .from('learning_queries')
    .insert({
      query: query.query,
      topic: query.topic,
      source: query.source,
      weight: query.weight,
      status: 'queued',
      context: query.context || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Execute research via edge function
 */
export async function executeResearch(queryId: string) {
  const { data, error } = await supabase.functions.invoke('pf-research-fetch', {
    body: { query_id: queryId },
  });
  if (error) throw error;
  return data?.results || [];
}

/**
 * Get pending research queries ordered by weight
 */
export async function getPendingQueries(limit: number = 10) {
  const { data, error } = await supabase
    .from('learning_queries')
    .select('*')
    .eq('status', 'queued')
    .order('weight', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Extract high-confidence insights with cross-verification
 */
export async function getHighConfidenceInsights(
  minConfidence: number = 0.7,
  limit: number = 20
): Promise<ResearchInsight[]> {
  const { data, error } = await supabase
    .from('learning_results')
    .select(`id, extracted_insights, relevance_score, metadata, learning_confidence (confidence_score, cross_verified, metadata)`)
    .gte('relevance_score', minConfidence)
    .order('relevance_score', { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data || []).map(result => {
    let content = '';
    if (typeof result.extracted_insights === 'string') content = result.extracted_insights;
    else if (Array.isArray(result.extracted_insights)) content = result.extracted_insights[0]?.toString() || '';
    else if (result.extracted_insights) content = JSON.stringify(result.extracted_insights);

    return {
      id: result.id,
      content,
      confidence: result.relevance_score || 0,
      sources: [`${(result.learning_confidence as any)?.metadata?.sources_count || 0} sources`],
      verified: (result.learning_confidence as any)?.cross_verified || false,
      tags: (result.metadata as any)?.tags || [],
    };
  });
}

/**
 * Route insights to target modules via brain_events
 */
export async function routeInsightsToModules(
  insights: ResearchInsight[],
  targetModules: string[]
) {
  await Promise.all(
    targetModules.map(module =>
      supabase.from('brain_events').insert({
        module,
        event_type: 'research_insight',
        data: { insights } as any,
        outcome: 'routed',
      })
    )
  );
}

/**
 * Get research stats summary
 */
export async function getResearchStats() {
  const [
    { data: queries },
    { data: results },
    { data: confidence },
  ] = await Promise.all([
    supabase.from('learning_queries').select('status', { count: 'exact' }),
    supabase.from('learning_results').select('relevance_score', { count: 'exact' }),
    supabase.from('learning_confidence').select('confidence_score, cross_verified'),
  ]);

  const totalQueries = queries?.length || 0;
  const totalResults = results?.length || 0;
  const avgConf = confidence?.reduce((s, c) => s + (c.confidence_score || 0), 0) / (confidence?.length || 1);
  const verified = confidence?.filter(c => c.cross_verified).length || 0;

  return {
    total_queries: totalQueries,
    total_results: totalResults,
    avg_confidence: avgConf,
    verified_results: verified,
    verification_rate: totalResults > 0 ? (verified / totalResults) * 100 : 0,
  };
}
