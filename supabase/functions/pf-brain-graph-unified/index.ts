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
      case 'build':
        try {
          const { data: insights } = await supabase.from('learning_results').select('*').limit(50);
          const nodes = insights?.map((i: { id: string; topic?: string; confidence_score?: number }) => ({ id: i.id, topic: i.topic, weight: i.confidence_score })) || [];
          const edges: { source_id: string; target_id: string; relationship: string }[] = [];
          for (let i = 0; i < nodes.length - 1; i++) {
            if (Math.random() > 0.7) edges.push({ source_id: nodes[i].id, target_id: nodes[i + 1].id, relationship: 'related' });
          }
          if (edges.length > 0) await supabase.from('brain_graph_edges').insert(edges);
          result.graph = { nodes: nodes.length, edges: edges.length };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'fusion':
        try {
          const { data: patterns } = await supabase.from('learning_patterns').select('*').limit(20);
          const fused = patterns?.reduce((acc: { pattern1: string; pattern2: string; fusion_type: string; strength: number }[], p: { pattern_type?: string; reinforcement_count?: number }, i: number) => {
            if (i % 2 === 0 && patterns[i + 1]) {
              acc.push({ pattern1: p.pattern_type || '', pattern2: patterns[i + 1].pattern_type || '', fusion_type: 'merged', strength: ((p.reinforcement_count || 0) + (patterns[i + 1].reinforcement_count || 0)) / 2 });
            }
            return acc;
          }, []) || [];
          result.fusions = fused;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'remix':
        try {
          const { data: concepts } = await supabase.from('learning_results').select('topic, insight').limit(30);
          const remixed = concepts?.map((c: { topic?: string }) => ({ original: c.topic, remix: concepts.filter((c2: { topic?: string }) => c2.topic !== c.topic).slice(0, 2).map((c2: { topic?: string }) => c2.topic), novelty: Math.random() })).slice(0, 10) || [];
          result.remixes = remixed;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown graph operation: ${operation}`;
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
