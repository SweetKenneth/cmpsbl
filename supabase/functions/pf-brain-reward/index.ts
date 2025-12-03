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

    const { memory_id, reward_score, outcome_type = 'positive' } = await req.json();

    console.log(`🎁 Applying reward to memory: ${memory_id}, score: ${reward_score}`);

    const { data: current } = await supabaseClient
      .from('brain_memories')
      .select('confidence')
      .eq('id', memory_id)
      .single();

    const boost = outcome_type === 'positive' ? reward_score : -reward_score;
    const newConfidence = Math.max(0, Math.min(1, (current?.confidence || 0.5) + boost));

    const { data: updated, error } = await supabaseClient
      .from('brain_memories')
      .update({ 
        confidence: newConfidence,
        last_accessed: new Date().toISOString(),
      })
      .eq('id', memory_id)
      .select()
      .single();

    if (error) throw error;

    await supabaseClient.from('learning_logs').insert({
      event_type: 'reward_applied',
      project_id: 'brain_system',
      payload: {
        memory_id,
        reward_score,
        outcome_type,
        old_confidence: current?.confidence,
        new_confidence: newConfidence,
      },
      success: true,
    });

    console.log(`✅ Reward applied: ${current?.confidence} → ${newConfidence}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        memory: updated,
        confidence_change: newConfidence - (current?.confidence || 0),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error applying reward:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
