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

    const { training_data, memory_type = 'learned', source = 'manual' } = await req.json();

    console.log(`🧠 Training brain with ${training_data?.length || 0} items`);

    if (!training_data || !Array.isArray(training_data)) {
      throw new Error('training_data must be an array');
    }

    const memories = training_data.map(item => ({
      content: item.content || item.text || String(item),
      memory_type,
      source,
      confidence: item.confidence || 0.7,
      metadata: item.metadata || {},
    }));

    const { data: inserted, error } = await supabaseClient
      .from('brain_memories')
      .insert(memories)
      .select();

    if (error) throw error;

    await supabaseClient.from('learning_logs').insert({
      event_type: 'brain_training',
      project_id: 'brain_system',
      payload: {
        memories_added: inserted?.length || 0,
        source,
        memory_type,
      },
      success: true,
    });

    console.log(`✅ Brain trained with ${inserted?.length} new memories`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        memories_added: inserted?.length,
        memories: inserted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error training brain:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
