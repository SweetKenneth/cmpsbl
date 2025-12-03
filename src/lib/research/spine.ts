/**
 * PromptFluid Research Spine
 * Autonomous research and verification system for Brain intelligence
 */

import { supabase } from '@/integrations/supabase/client';

export interface ResearchQuery {
  query: string;
  topic: string;
  source: string;
  weight: number;
  context?: Record<string, any>;
}

export interface ResearchResult {
  query_id: string;
  source_api: 'lovable' | 'groq' | 'web_search';
  raw_data: any;
  extracted_insights: string[];
  relevance_score: number;
  metadata?: Record<string, any>;
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
 * Submit a research query to the autonomous research system
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
      context: query.context || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Execute research query using external APIs
 */
export async function executeResearch(queryId: string): Promise<ResearchResult[]> {
  const { data, error } = await supabase.functions.invoke('pf-research-fetch', {
    body: { query_id: queryId }
  });

  if (error) throw error;
  return data.results || [];
}

/**
 * Get pending research queries
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
 * Get research results for a query
 */
export async function getResearchResults(queryId: string) {
  const { data, error } = await supabase
    .from('learning_results')
    .select(`
      *,
      learning_confidence (*)
    `)
    .eq('query_id', queryId)
    .order('relevance_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Verify and cross-reference research findings
 */
export async function verifyResearch(resultId: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('pf-research-verify', {
    body: { result_id: resultId }
  });

  if (error) throw error;
  return data.verified || false;
}

/**
 * Extract high-confidence insights
 */
export async function getHighConfidenceInsights(
  minConfidence: number = 0.7,
  limit: number = 20
): Promise<ResearchInsight[]> {
  const { data, error } = await supabase
    .from('learning_results')
    .select(`
      id,
      extracted_insights,
      relevance_score,
      metadata,
      learning_confidence (
        confidence_score,
        cross_verified,
        metadata
      )
    `)
    .gte('relevance_score', minConfidence)
    .order('relevance_score', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(result => {
    let contentStr = '';
    if (typeof result.extracted_insights === 'string') {
      contentStr = result.extracted_insights;
    } else if (Array.isArray(result.extracted_insights)) {
      contentStr = result.extracted_insights[0]?.toString() || '';
    } else if (result.extracted_insights) {
      contentStr = JSON.stringify(result.extracted_insights);
    }
    
    return {
      id: result.id,
      content: contentStr,
      confidence: result.relevance_score || 0,
      sources: [`${(result.learning_confidence as any)?.metadata?.sources_count || 0} sources`],
      verified: (result.learning_confidence as any)?.cross_verified || false,
      tags: (result.metadata as any)?.tags || []
    };
  });
}

/**
 * Route insights to relevant modules
 */
export async function routeInsights(insights: ResearchInsight[], targetModules: string[]) {
  const promises = targetModules.map(module => 
    supabase.from('brain_events').insert({
      module,
      event_type: 'research_insight',
      data: { insights } as any,
      outcome: 'routed'
    })
  );

  await Promise.all(promises);
}

/**
 * Get research statistics
 */
export async function getResearchStats() {
  const { data: queries } = await supabase
    .from('learning_queries')
    .select('status', { count: 'exact' });

  const { data: results } = await supabase
    .from('learning_results')
    .select('relevance_score', { count: 'exact' });

  const { data: confidence } = await supabase
    .from('learning_confidence')
    .select('confidence_score, cross_verified');

  const totalQueries = queries?.length || 0;
  const totalResults = results?.length || 0;
  const avgConfidence = confidence?.reduce((sum, c) => sum + (c.confidence_score || 0), 0) / (confidence?.length || 1);
  const verifiedCount = confidence?.filter(c => c.cross_verified).length || 0;

  return {
    total_queries: totalQueries,
    total_results: totalResults,
    avg_confidence: avgConfidence,
    verified_results: verifiedCount,
    verification_rate: totalResults > 0 ? (verifiedCount / totalResults) * 100 : 0
  };
}
