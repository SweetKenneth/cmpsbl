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

    const { observation, outcome, context = {} } = await req.json();

    console.log(`📚 Learning from observation...`);

    const confidence = outcome?.success ? 0.8 : 0.5;

    const { data: memory, error } = await supabaseClient
      .from('brain_memories')
      .insert({
        content: observation,
        memory_type: 'learned',
        source: 'experience',
        confidence,
        metadata: {
          outcome,
          context,
          learned_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseClient.from('learning_logs').insert({
      event_type: 'learning_event',
      project_id: context.project_id || 'unknown',
      payload: {
        observation,
        outcome,
        memory_id: memory.id,
        confidence,
      },
      success: true,
    });

    console.log('✅ Learning captured and stored');

    return new Response(
      JSON.stringify({ 
        success: true, 
        memory_id: memory.id,
        confidence,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error during learning:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
