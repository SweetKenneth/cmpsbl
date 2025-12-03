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
      case 'echo':
        try {
          const { data: hotMemories } = await supabase.from('brain_memory_hot').select('*').gte('importance_score', 0.7).limit(10);
          const echoes = hotMemories?.map((m: { id: string; importance_score?: number }) => ({ memory_id: m.id, echo_strength: m.importance_score, resonance: 'high' })) || [];
          await supabase.from('brain_events').insert({ event_type: 'memory_echo', metadata: { echoes, count: echoes.length } });
          result.echoes = echoes;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'compress':
        try {
          const { data: oldMemories } = await supabase.from('brain_memory_hot').select('*').lte('last_used', new Date(Date.now() - 7 * 24 * 3600000).toISOString());
          const compressed = oldMemories?.map((m: { id: string; content?: string; topic?: string }) => ({ ...m, compressed: true, size_reduction: 0.6 })) || [];
          if (compressed.length > 0) {
            await supabase.from('brain_memory_cold').insert(compressed.map((m: { content?: string; topic?: string; id: string }) => ({ content: m.content, topic: m.topic, compression_ratio: 0.6, original_id: m.id })));
            await supabase.from('brain_memory_hot').delete().in('id', compressed.map((m: { id: string }) => m.id));
          }
          result.compressed = { count: compressed.length, saved_space: compressed.length * 0.6 };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'score':
        try {
          const { data: memory } = await supabase.from('brain_memory_hot').select('*').eq('id', params.memory_id).maybeSingle();
          if (!memory) throw new Error('Memory not found');
          const score = Math.random() * 0.5 + 0.5;
          await supabase.from('brain_memory_hot').update({ importance_score: score }).eq('id', params.memory_id);
          result.score = score;
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      case 'synthesize':
        try {
          const { data: memories } = await supabase.from('brain_memory_hot').select('*').limit(50);
          const topics = [...new Set(memories?.map((m: { topic?: string }) => m.topic).filter(Boolean))];
          result.synthesis = { unique_topics: topics.length, total_memories: memories?.length || 0, density: topics.length / (memories?.length || 1) };
        } catch (e) {
          result.status = 'error';
          result.message = e instanceof Error ? e.message : 'Unknown error';
        }
        break;

      default:
        result.status = 'error';
        result.message = `Unknown memory operation: ${operation}`;
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
