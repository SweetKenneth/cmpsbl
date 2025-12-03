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

    console.log('⚡ Running brain optimization...');

    const { data: lowConfidence, error: lowError } = await supabaseClient
      .from('brain_memories')
      .select('id')
      .lt('confidence', 0.3);

    if (lowError) throw lowError;

    let deleted = 0;
    if (lowConfidence && lowConfidence.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('brain_memories')
        .delete()
        .in('id', lowConfidence.map(m => m.id));

      if (!deleteError) deleted = lowConfidence.length;
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: stale, error: staleError } = await supabaseClient
      .from('brain_memories')
      .select('id, confidence')
      .lt('last_accessed', oneWeekAgo.toISOString())
      .gt('confidence', 0);

    let decayed = 0;
    if (stale && stale.length > 0) {
      for (const memory of stale) {
        await supabaseClient
          .from('brain_memories')
          .update({ confidence: Math.max(0, memory.confidence - 0.1) })
          .eq('id', memory.id);
      }
      decayed = stale.length;
    }

    await supabaseClient.from('learning_logs').insert({
      event_type: 'brain_optimization',
      project_id: 'brain_system',
      payload: {
        memories_deleted: deleted,
        memories_decayed: decayed,
        optimized_at: new Date().toISOString(),
      },
      success: true,
    });

    console.log(`✅ Optimization complete: ${deleted} deleted, ${decayed} decayed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted,
        decayed,
        total_optimized: deleted + decayed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error optimizing brain:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
