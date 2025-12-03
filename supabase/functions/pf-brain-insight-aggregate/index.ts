/**
 * PromptFluid Brain Insight Aggregator
 * Collects metrics from all modules for cross-module analysis
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting insight event aggregation...');

    const results: any[] = [];

    // Defense events - threat detection activity
    const { count: defenseCount } = await supabase
      .from('defense_events')
      .select('*', { count: 'exact', head: true });
    
    results.push({
      source_module: 'defense',
      metric_name: 'threats_detected',
      metric_value: defenseCount || 0,
      impact_score: 0.85
    });

    // Subscriptions - active user base
    const { count: subCount } = await supabase
      .from('core_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    results.push({
      source_module: 'subscriptions',
      metric_name: 'active_users',
      metric_value: subCount || 0,
      impact_score: 0.95
    });

    // Brain learning events - intelligence activity
    const { count: learningCount } = await supabase
      .from('pf_learning_events')
      .select('*', { count: 'exact', head: true })
      .gte('ts', new Date(Date.now() - 86400000).toISOString());
    
    results.push({
      source_module: 'brain',
      metric_name: 'learning_cycles',
      metric_value: learningCount || 0,
      impact_score: 0.75
    });

    // API usage tracking
    const { count: usageCount } = await supabase
      .from('core_usage')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString());
    
    results.push({
      source_module: 'core',
      metric_name: 'api_calls_24h',
      metric_value: usageCount || 0,
      impact_score: 0.70
    });

    // Research queries
    const { count: queryCount } = await supabase
      .from('learning_queries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString());
    
    results.push({
      source_module: 'research',
      metric_name: 'completed_queries',
      metric_value: queryCount || 0,
      impact_score: 0.80
    });

    // Insert aggregated metrics
    const { error: insertError } = await supabase
      .from('brain_insight_events')
      .insert(results);

    if (insertError) {
      throw insertError;
    }

    // Log to brain events
    await supabase.from('brain_events').insert({
      event_type: 'insight_aggregation',
      module: 'cross_module',
      data: {
        metrics_collected: results.length,
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });

    console.log(`✅ Aggregated ${results.length} insight events`);

    return new Response(
      JSON.stringify({ 
        success: true,
        collected: results.length,
        metrics: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Insight aggregation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
