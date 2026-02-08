/**
 * Dream-Eater Daily Reset v1.0.0
 * 
 * Cron job that resets daily counters while preserving mutation level.
 * Schedule: 0 0 * * * (midnight UTC)
 */

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get current state for logging
    const { data: currentState } = await supabase
      .from('dream_eater_state')
      .select('*')
      .single();

    if (!currentState) {
      throw new Error('Dream-Eater state not found');
    }

    // Determine if mood should shift toward dormant overnight
    const shouldDormant = Math.random() < 0.3; // 30% chance to become dormant
    const newMood = shouldDormant ? 'dormant' : currentState.current_mood;

    // Reset daily counters, preserve mutation level
    const { data: updatedState, error } = await supabase
      .from('dream_eater_state')
      .update({
        dreams_consumed_today: 0,
        nightmares_consumed_today: 0,
        cycle_count_today: 0,
        current_mood: newMood,
        reset_reason: 'daily_reset',
        last_decay_at: new Date().toISOString(),
      })
      .eq('id', currentState.id)
      .select()
      .single();

    if (error) throw error;

    // Log the reset
    await supabase.from('dream_eater_audit').insert({
      event_type: 'daily_reset',
      mood_before: currentState.current_mood,
      mood_after: newMood,
      mutation_delta: 0,
    });

    // Clean up old rate limits (older than 24h)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('dream_rate_limits')
      .delete()
      .lt('last_submission_at', dayAgo);

    // Log event
    await supabase.from('brain_events').insert({
      event_type: 'dream_eater_daily_reset',
      module: 'dream_eater',
      outcome: 'success',
      data: {
        previous_dreams: currentState.dreams_consumed_today,
        previous_nightmares: currentState.nightmares_consumed_today,
        mutation_level: currentState.mutation_level,
        became_dormant: shouldDormant,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        previous_state: {
          dreams: currentState.dreams_consumed_today,
          nightmares: currentState.nightmares_consumed_today,
        },
        new_state: updatedState,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Daily Reset error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
