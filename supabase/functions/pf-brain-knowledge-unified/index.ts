import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { operation, params = {} } = await req.json();
    const result: any = { operation, timestamp: new Date().toISOString(), status: 'success' };

    switch (operation) {
      case 'synthesize':
        try {
          const { data: insights } = await supabase.from('learning_results').select('*').gte('confidence_score', 0.7).order('created_at', { ascending: false }).limit(50);
          
          const topics = [...new Set(insights?.map((i: { topic?: string }) => i.topic).filter(Boolean))];
          const synthesis = {
            total_insights: insights?.length || 0,
            unique_topics: topics.length,
            topics: topics.slice(0, 10),
            avg_confidence: insights?.reduce((sum: number, i: { confidence_score?: number }) => sum + (i.confidence_score || 0), 0) / (insights?.length || 1)
          };
          
          result.synthesis = synthesis;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'gap_bridge':
        try {
          const { data: queries } = await supabase.from('learning_queries').select('topic').eq('status', 'failed');
          const { data: results } = await supabase.from('learning_results').select('topic');
          
          const queriedTopics = new Set(queries?.map((q: { topic?: string }) => q.topic));
          const learnedTopics = new Set(results?.map((r: { topic?: string }) => r.topic));
          const gaps = [...queriedTopics].filter(t => !learnedTopics.has(t));
          
          result.gaps = { identified: gaps.length, topics: gaps.slice(0, 10) };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'aggregate':
        try {
          const { data: insights } = await supabase.from('learning_results').select('*').gte('created_at', new Date(Date.now() - 7 * 24 * 3600000).toISOString());
          
          const byTopic: Record<string, { topic?: string; confidence_score?: number }[]> = {};
          for (const i of insights || []) {
            const topic = i.topic || 'unknown';
            if (!byTopic[topic]) byTopic[topic] = [];
            byTopic[topic].push(i);
          }
          
          result.aggregated = Object.entries(byTopic).map(([topic, items]) => ({
            topic,
            count: items.length,
            avg_confidence: items.reduce((sum: number, i) => sum + (i.confidence_score || 0), 0) / items.length
          })).sort((a, b) => b.count - a.count).slice(0, 20);
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown knowledge operation: ${operation}`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', status: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
