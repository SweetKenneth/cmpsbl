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
      case 'check':
        try {
          const { data: hotMemory } = await supabase.from('brain_memory_hot').select('*').gte('last_used', new Date(Date.now() - 3600000).toISOString());
          
          result.context_status = {
            hot_items: hotMemory?.length || 0,
            freshness: hotMemory && hotMemory.length > 0 ? 'fresh' : 'stale',
            needs_refresh: (hotMemory?.length || 0) < 5
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'weave':
        try {
          const { data: memories } = await supabase.from('brain_memory_hot').select('*').limit(20);
          const { data: patterns } = await supabase.from('learning_patterns').select('*').limit(10);
          
          const woven = {
            memory_topics: [...new Set(memories?.map((m: { topic?: string }) => m.topic).filter(Boolean))],
            pattern_types: [...new Set(patterns?.map((p: { pattern_type?: string }) => p.pattern_type).filter(Boolean))],
            context_strength: ((memories?.length || 0) + (patterns?.length || 0)) / 30
          };
          
          result.woven_context = woven;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'continuity':
        try {
          const { data: recent } = await supabase.from('learning_queries').select('*').order('created_at', { ascending: false }).limit(10);
          
          const topics = recent?.map((r: { topic?: string }) => r.topic).filter(Boolean) || [];
          const uniqueTopics = new Set(topics);
          
          result.continuity = {
            recent_topics: topics,
            topic_diversity: uniqueTopics.size / (topics.length || 1),
            continuous: uniqueTopics.size < topics.length * 0.5
          };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'remix':
        try {
          const { data: concepts } = await supabase.from('learning_results').select('topic, insight').order('created_at', { ascending: false }).limit(20);
          
          const remixed = concepts?.map((c: { topic?: string }) => ({
            original_topic: c.topic,
            related_concepts: concepts.filter((c2: { topic?: string }) => c2.topic !== c.topic).map((c2: { topic?: string }) => c2.topic).slice(0, 3)
          })).slice(0, 5);
          
          result.remixed_concepts = remixed || [];
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown context operation: ${operation}`;
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
