import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { timeframe = '7d', project_id } = await req.json();

    console.log(`📈 Analyzing learning data: ${timeframe}`);

    const now = new Date();
    const daysAgo = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    let query = supabaseClient
      .from('learning_logs')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    const { data: logs, error } = await query;

    if (error) throw error;

    const analysis = {
      total_events: logs?.length || 0,
      success_rate: logs?.length 
        ? (logs.filter(l => l.success).length / logs.length) * 100 
        : 0,
      event_types: logs?.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      projects: logs?.reduce((acc, log) => {
        acc[log.project_id] = (acc[log.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
      timeline: logs?.reduce((acc, log) => {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {},
    };

    const insights = [];
    
    if (analysis.success_rate < 80) {
      insights.push({
        type: 'warning',
        message: `Success rate is ${analysis.success_rate.toFixed(1)}%, below optimal threshold`,
      });
    }

    const mostCommonEvent = Object.entries(analysis.event_types)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (mostCommonEvent) {
      insights.push({
        type: 'info',
        message: `Most common event: ${mostCommonEvent[0]} (${mostCommonEvent[1]} occurrences)`,
      });
    }

    console.log('✅ Analysis complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        insights,
        timeframe,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error analyzing learning data:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
