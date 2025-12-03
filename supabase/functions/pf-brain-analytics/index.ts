import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { timeframe = '24h' } = await req.json().catch(() => ({}));

    // Calculate timeframe
    let hoursBack = 24;
    if (timeframe === '7d') hoursBack = 168;
    if (timeframe === '30d') hoursBack = 720;
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    console.log(`📊 Generating brain analytics for last ${timeframe}`);

    // 1. Learning Activity Metrics
    const { data: learningQueries } = await supabase
      .from('learning_queries')
      .select('*')
      .gte('created_at', cutoffTime);

    const { data: learningResults } = await supabase
      .from('learning_results')
      .select('*, learning_confidence(*)')
      .gte('created_at', cutoffTime);

    // 2. Memory Formation & Graph Growth
    const { data: memoryHot } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .gte('created_at', cutoffTime);

    const { data: graphEdges } = await supabase
      .from('brain_graph_edges')
      .select('*')
      .gte('created_at', cutoffTime);

    // 3. AI Provider Performance & Costs
    const { data: aiUsage } = await supabase
      .from('ai_usage_log')
      .select('*')
      .gte('created_at', cutoffTime);

    const { data: aiQuota } = await supabase
      .from('ai_daily_quota')
      .select('*')
      .gte('date', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString().split('T')[0]);

    // 4. Curiosity & Exploration Metrics
    const { data: curiosityLog } = await supabase
      .from('brain_curiosity_log')
      .select('*')
      .gte('created_at', cutoffTime);

    const { data: curiositySettings } = await supabase
      .from('brain_curiosity_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    // 5. Brain Events & Actions
    const { data: brainEvents } = await supabase
      .from('brain_events')
      .select('*')
      .gte('created_at', cutoffTime);

    // 6. Learning Patterns & Insights
    const { data: learningPatterns } = await supabase
      .from('learning_patterns')
      .select('*')
      .gte('discovered_at', cutoffTime);

    // 7. Reflections & Deep Thinking
    const { data: reflections } = await supabase
      .from('brain_reflections')
      .select('*')
      .gte('created_at', cutoffTime);

    // Calculate analytics
    const analytics = {
      timeframe,
      generated_at: new Date().toISOString(),
      
      // Learning Activity
      learning: {
        total_queries: learningQueries?.length || 0,
        completed_queries: learningQueries?.filter(q => q.status === 'completed').length || 0,
        pending_queries: learningQueries?.filter(q => q.status === 'pending').length || 0,
        failed_queries: learningQueries?.filter(q => q.status === 'failed').length || 0,
        total_results: learningResults?.length || 0,
        avg_confidence: learningResults?.reduce((sum, r) => sum + (r.learning_confidence?.[0]?.confidence_score || 0), 0) / (learningResults?.length || 1),
        high_confidence_results: learningResults?.filter(r => (r.learning_confidence?.[0]?.confidence_score || 0) > 0.8).length || 0,
        
        // Topic breakdown
        top_topics: getTopTopics(learningQueries || [], 10),
        query_sources: getQuerySources(learningQueries || []),
      },

      // Memory & Graph
      memory: {
        hot_memories_created: memoryHot?.length || 0,
        new_graph_edges: graphEdges?.length || 0,
        avg_memory_strength: memoryHot?.reduce((sum, m) => sum + m.strength, 0) / (memoryHot?.length || 1),
        
        // Memory distribution by topic
        memory_by_topic: getMemoryDistribution(memoryHot || []),
        
        // Graph connectivity
        unique_nodes_connected: new Set([
          ...(graphEdges?.map(e => e.from_entry_id) || []),
          ...(graphEdges?.map(e => e.to_entry_id) || [])
        ]).size,
        avg_edge_strength: graphEdges?.reduce((sum, e) => sum + e.strength, 0) / (graphEdges?.length || 1),
      },

      // AI Provider Performance
      ai_performance: {
        lovable: {
          total_calls: aiUsage?.filter(u => u.provider === 'lovable').length || 0,
          successful_calls: aiUsage?.filter(u => u.provider === 'lovable' && u.success).length || 0,
          failed_calls: aiUsage?.filter(u => u.provider === 'lovable' && !u.success).length || 0,
          success_rate: calculateSuccessRate(aiUsage?.filter(u => u.provider === 'lovable') || []),
          daily_usage: aiQuota?.filter(q => q.provider === 'lovable').map(q => ({
            date: q.date,
            calls: q.calls_made,
            budget: q.calls_budget,
            utilization: ((q.calls_made / q.calls_budget) * 100).toFixed(1) + '%'
          })) || [],
        },
        groq: {
          total_calls: aiUsage?.filter(u => u.provider === 'groq').length || 0,
          successful_calls: aiUsage?.filter(u => u.provider === 'groq' && u.success).length || 0,
          failed_calls: aiUsage?.filter(u => u.provider === 'groq' && !u.success).length || 0,
          success_rate: calculateSuccessRate(aiUsage?.filter(u => u.provider === 'groq') || []),
          total_tokens: aiQuota?.filter(q => q.provider === 'groq').reduce((sum, q) => sum + (q.tokens_used || 0), 0) || 0,
          estimated_cost: (aiQuota?.filter(q => q.provider === 'groq').reduce((sum, q) => sum + (q.tokens_used || 0), 0) || 0) * 0.00000059,
          daily_usage: aiQuota?.filter(q => q.provider === 'groq').map(q => ({
            date: q.date,
            calls: q.calls_made,
            tokens: q.tokens_used,
            cost: (q.tokens_used * 0.00000059).toFixed(6)
          })) || [],
        },
        cost_efficiency: {
          total_estimated_cost: calculateTotalCost(aiQuota || []),
          cost_per_learning_result: calculateTotalCost(aiQuota || []) / (learningResults?.length || 1),
          lovable_ai_savings: '100% free tier usage',
        }
      },

      // Curiosity & Exploration
      curiosity: {
        current_settings: curiositySettings || null,
        exploration_calls: curiosityLog?.filter(c => c.strategy === 'explore').length || 0,
        exploitation_calls: curiosityLog?.filter(c => c.strategy === 'exploit').length || 0,
        exploration_ratio: (curiosityLog?.filter(c => c.strategy === 'explore').length || 0) / (curiosityLog?.length || 1),
        avg_novelty_score: curiosityLog?.reduce((sum, c) => sum + (c.novelty_score || 0), 0) / (curiosityLog?.length || 1),
        avg_value_score: curiosityLog?.reduce((sum, c) => sum + (c.value_score || 0), 0) / (curiosityLog?.length || 1),
        
        // Performance by strategy
        strategy_performance: {
          explore: {
            calls: curiosityLog?.filter(c => c.strategy === 'explore').length || 0,
            avg_outcome: curiosityLog?.filter(c => c.strategy === 'explore').reduce((sum, c) => sum + (c.outcome_score || 0), 0) / (curiosityLog?.filter(c => c.strategy === 'explore').length || 1),
          },
          exploit: {
            calls: curiosityLog?.filter(c => c.strategy === 'exploit').length || 0,
            avg_outcome: curiosityLog?.filter(c => c.strategy === 'exploit').reduce((sum, c) => sum + (c.outcome_score || 0), 0) / (curiosityLog?.filter(c => c.strategy === 'exploit').length || 1),
          }
        }
      },

      // Brain Activity
      brain_activity: {
        total_events: brainEvents?.length || 0,
        events_by_module: getEventsByModule(brainEvents || []),
        events_by_type: getEventsByType(brainEvents || []),
        successful_outcomes: brainEvents?.filter(e => ['completed', 'success', 'routed'].includes(e.outcome)).length || 0,
        failed_outcomes: brainEvents?.filter(e => ['failed', 'error'].includes(e.outcome)).length || 0,
      },

      // Learning Patterns & Insights
      insights: {
        total_patterns: learningPatterns?.length || 0,
        pattern_confidence: learningPatterns?.reduce((sum, p) => sum + p.confidence_score, 0) / (learningPatterns?.length || 1),
        pattern_types: getPatternTypes(learningPatterns || []),
        
        // Pattern categories
        top_patterns: learningPatterns?.sort((a, b) => b.confidence_score - a.confidence_score).slice(0, 10).map(p => ({
          pattern: p.pattern_text?.substring(0, 100),
          confidence: p.confidence_score,
          occurrences: p.occurrence_count,
          category: p.category
        })) || [],
      },

      // Reflections & Deep Thinking
      reflection: {
        total_reflections: reflections?.length || 0,
        avg_depth_score: reflections?.reduce((sum, r) => sum + (r.depth_score || 0), 0) / (reflections?.length || 1),
        reflection_types: getReflectionTypes(reflections || []),
        insights_generated: reflections?.filter(r => r.insights_generated > 0).length || 0,
      },

      // System Health
      health: {
        hourly_learning_rate: (learningResults?.length || 0) / hoursBack,
        memory_formation_rate: (memoryHot?.length || 0) / hoursBack,
        graph_growth_rate: (graphEdges?.length || 0) / hoursBack,
        system_uptime: calculateUptime(brainEvents || []),
        error_rate: calculateErrorRate(brainEvents || []),
      }
    };

    console.log(`✅ Analytics generated: ${analytics.learning.total_queries} queries, ${analytics.memory.hot_memories_created} memories, ${analytics.ai_performance.lovable.total_calls} AI calls`);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analytics generation error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function getTopTopics(queries: any[], limit: number) {
  const topicCounts = new Map<string, number>();
  queries.forEach(q => {
    const topic = q.metadata?.topic || q.metadata?.category || 'general';
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  });
  return Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic, count]) => ({ topic, count }));
}

function getQuerySources(queries: any[]) {
  const sources = {
    user: queries.filter(q => q.metadata?.source === 'user').length,
    automated: queries.filter(q => q.metadata?.automated).length,
    curiosity: queries.filter(q => q.metadata?.source === 'curiosity').length,
    scheduled: queries.filter(q => q.metadata?.source === 'scheduled').length,
  };
  return sources;
}

function getMemoryDistribution(memories: any[]) {
  const distribution = new Map<string, number>();
  memories.forEach(m => {
    const topic = m.metadata?.topic || m.context?.substring(0, 20) || 'unknown';
    distribution.set(topic, (distribution.get(topic) || 0) + 1);
  });
  return Array.from(distribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));
}

function calculateSuccessRate(calls: any[]) {
  if (calls.length === 0) return 0;
  const successful = calls.filter(c => c.success).length;
  return ((successful / calls.length) * 100).toFixed(2) + '%';
}

function calculateTotalCost(quotas: any[]) {
  return quotas
    .filter(q => q.provider === 'groq')
    .reduce((sum, q) => sum + (q.tokens_used || 0) * 0.00000059, 0);
}

function getEventsByModule(events: any[]) {
  const modules = new Map<string, number>();
  events.forEach(e => {
    modules.set(e.module, (modules.get(e.module) || 0) + 1);
  });
  return Object.fromEntries(modules);
}

function getEventsByType(events: any[]) {
  const types = new Map<string, number>();
  events.forEach(e => {
    types.set(e.event_type, (types.get(e.event_type) || 0) + 1);
  });
  return Object.fromEntries(types);
}

function getPatternTypes(patterns: any[]) {
  const types = new Map<string, number>();
  patterns.forEach(p => {
    types.set(p.category || 'general', (types.get(p.category || 'general') || 0) + 1);
  });
  return Object.fromEntries(types);
}

function getReflectionTypes(reflections: any[]) {
  const types = new Map<string, number>();
  reflections.forEach(r => {
    types.set(r.reflection_type || 'general', (types.get(r.reflection_type || 'general') || 0) + 1);
  });
  return Object.fromEntries(types);
}

function calculateUptime(events: any[]) {
  const totalEvents = events.length;
  const errorEvents = events.filter(e => ['failed', 'error'].includes(e.outcome)).length;
  return (((totalEvents - errorEvents) / (totalEvents || 1)) * 100).toFixed(2) + '%';
}

function calculateErrorRate(events: any[]) {
  const totalEvents = events.length;
  const errorEvents = events.filter(e => ['failed', 'error'].includes(e.outcome)).length;
  return ((errorEvents / (totalEvents || 1)) * 100).toFixed(2) + '%';
}
