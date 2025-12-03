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

    const { directive, priority = 'medium', context = {} } = await req.json();

    console.log(`🎯 Processing brain directive: ${directive}`);

    const { data: memory, error } = await supabaseClient
      .from('brain_memories')
      .insert({
        content: directive,
        memory_type: 'directive',
        source: 'system',
        confidence: priority === 'high' ? 0.95 : priority === 'low' ? 0.6 : 0.8,
        metadata: {
          priority,
          context,
          issued_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseClient.from('learning_logs').insert({
      event_type: 'directive_issued',
      project_id: 'brain_system',
      payload: {
        directive,
        priority,
        memory_id: memory.id,
      },
      success: true,
    });

    console.log('✅ Directive stored and logged');

    return new Response(
      JSON.stringify({ 
        success: true, 
        directive_id: memory.id,
        message: 'Directive accepted and stored',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error processing directive:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
