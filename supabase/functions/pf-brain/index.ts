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

    const { action, data } = await req.json();

    console.log(`🧠 Brain orchestration: ${action}`);

    switch (action) {
      case 'query': {
        const { query_text, limit = 5 } = data;
        
        const { data: memories, error } = await supabaseClient
          .from('brain_memories')
          .select('*')
          .textSearch('content', query_text)
          .order('confidence', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, memories }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remember': {
        const { content, memory_type, confidence = 0.8, metadata = {} } = data;
        
        const { data: memory, error } = await supabaseClient
          .from('brain_memories')
          .insert({
            content,
            memory_type,
            confidence,
            metadata,
            source: 'brain_orchestration',
          })
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Memory stored:', memory.id);

        return new Response(
          JSON.stringify({ success: true, memory }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'forget': {
        const { memory_id, decay_amount = 0.1 } = data;
        
        const { data: current } = await supabaseClient
          .from('brain_memories')
          .select('confidence')
          .eq('id', memory_id)
          .single();

        const newConfidence = Math.max(0, (current?.confidence || 0) - decay_amount);
        
        const { data: memory, error } = await supabaseClient
          .from('brain_memories')
          .update({ confidence: newConfidence })
          .eq('id', memory_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, memory }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reinforce': {
        const { memory_id, boost_amount = 0.1 } = data;
        
        const { data: current } = await supabaseClient
          .from('brain_memories')
          .select('confidence')
          .eq('id', memory_id)
          .single();

        const newConfidence = Math.min(1, (current?.confidence || 0) + boost_amount);
        
        const { data: memory, error } = await supabaseClient
          .from('brain_memories')
          .update({ 
            confidence: newConfidence,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', memory_id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, memory }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Brain error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
