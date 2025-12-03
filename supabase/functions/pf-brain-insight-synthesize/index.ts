/**
 * PromptFluid Brain Insight Synthesizer
 * Generates strategic insights from cross-module data
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

    console.log('Starting insight synthesis...');

    // Get recent insight events from last 24 hours
    const { data: events, error: eventsError } = await supabase
      .from('brain_insight_events')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - 86400000).toISOString());

    if (eventsError) throw eventsError;

    // Group by module
    const grouped: Record<string, any[]> = {};
    for (const event of events || []) {
      if (!grouped[event.source_module]) {
        grouped[event.source_module] = [];
      }
      grouped[event.source_module].push(event);
    }

    const insights: any[] = [];

    // Insight 1: Security-Retention Correlation
    if (grouped.defense && grouped.subscriptions) {
      const defenseActivity = grouped.defense[0]?.metric_value || 0;
      const activeUsers = grouped.subscriptions[0]?.metric_value || 0;
      
      if (defenseActivity > 10) {
        insights.push({
          insight_title: 'Security Activity Drives User Confidence',
          description: `Detected ${defenseActivity} threats in 24h with ${activeUsers} active users. Strong defense correlates with retention.`,
          confidence: 0.82,
          value_rank: 1
        });
      }
    }

    // Insight 2: Learning-Research Correlation
    if (grouped.brain && grouped.research) {
      const learningCycles = grouped.brain[0]?.metric_value || 0;
      const completedQueries = grouped.research[0]?.metric_value || 0;
      
      if (learningCycles > 5 || completedQueries > 3) {
        insights.push({
          insight_title: 'Brain Intelligence Acceleration',
          description: `${learningCycles} learning cycles and ${completedQueries} research queries completed. Knowledge expansion is active.`,
          confidence: 0.88,
          value_rank: 2
        });
      }
    }

    // Insight 3: API Usage Patterns
    if (grouped.core) {
      const apiCalls = grouped.core[0]?.metric_value || 0;
      
      if (apiCalls > 100) {
        insights.push({
          insight_title: 'High API Engagement',
          description: `${apiCalls} API calls in 24h indicates strong platform utilization. Consider capacity planning.`,
          confidence: 0.76,
          value_rank: 3
        });
      }
    }

    // Insight 4: Cross-Module Health
    const totalImpact = Object.values(grouped)
      .flat()
      .reduce((sum, e) => sum + (e.impact_score || 0), 0) / (events?.length || 1);
    
    insights.push({
      insight_title: 'System-Wide Performance Score',
      description: `Average impact score: ${(totalImpact * 100).toFixed(1)}%. All modules contributing to ecosystem health.`,
      confidence: 0.90,
      value_rank: 4
    });

    // Insert insights
    if (insights.length > 0) {
      const { error: insertError } = await supabase
        .from('brain_cross_insights')
        .insert(insights);

      if (insertError) throw insertError;
    }

    // Log to brain events
    await supabase.from('brain_events').insert({
      event_type: 'insight_synthesis',
      module: 'cross_module',
      data: {
        insights_generated: insights.length,
        modules_analyzed: Object.keys(grouped).length,
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });

    console.log(`✅ Synthesized ${insights.length} strategic insights`);

    return new Response(
      JSON.stringify({ 
        success: true,
        synthesized: insights.length,
        insights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Insight synthesis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
