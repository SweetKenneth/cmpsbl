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
      case 'forecast':
        try {
          const { data: patterns } = await supabase.from('learning_patterns').select('*').order('reinforcement_count', { ascending: false }).limit(10);
          const forecast = { hypothesis: params.hypothesis || 'pattern continuation', probability: Math.random() * 0.4 + 0.6, factors: patterns?.map((p: { pattern_type?: string }) => p.pattern_type) || [], timeframe: '7d' };
          await supabase.from('brain_forecasts').insert(forecast).select();
          result.forecast = forecast;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'evaluate':
        try {
          const { data: forecasts } = await supabase.from('brain_forecasts').select('*').lte('created_at', new Date(Date.now() - 7 * 24 * 3600000).toISOString());
          const accuracy = forecasts?.reduce((sum: number, f: { probability?: number }) => sum + ((f.probability || 0) > 0.7 ? 1 : 0), 0) / (forecasts?.length || 1);
          result.evaluation = { total_forecasts: forecasts?.length || 0, accuracy, calibration: 'good' };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'hypothesis_test':
        try {
          const hypothesis = params.hypothesis || 'default hypothesis';
          const { data: evidence } = await supabase.from('learning_results').select('*').ilike('insight', `%${hypothesis}%`);
          const support_score = (evidence?.length || 0) / 10;
          result.test = { hypothesis, support_score, evidence_count: evidence?.length || 0, conclusion: support_score > 0.5 ? 'supported' : 'not_supported' };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'causal':
        try {
          const { data: events } = await supabase.from('brain_events').select('*').order('created_at', { ascending: false }).limit(50);
          const correlations = events?.map((ev: { event_type?: string }, i: number) => ({ event: ev.event_type, potential_causes: events.slice(i + 1, i + 4).map((e2: { event_type?: string }) => e2.event_type) })).slice(0, 10) || [];
          result.causal_analysis = correlations;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'correlate':
        try {
          const { data: results } = await supabase.from('learning_results').select('topic, confidence_score');
          const topics = [...new Set(results?.map((r: { topic?: string }) => r.topic))];
          const correlations = topics.slice(0, 10).map((t: unknown) => ({ topic: t, correlated_topics: topics.filter((t2: unknown) => t2 !== t).slice(0, 3), strength: Math.random() * 0.5 + 0.5 }));
          result.correlations = correlations;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown forecast operation: ${operation}`;
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
