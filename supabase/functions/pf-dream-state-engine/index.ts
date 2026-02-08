/**
 * Dream-Eater State Engine v1.0.0
 * 
 * Manages the living state of Dream-Eater:
 * - Consumes dreams/nightmares and updates mutation level
 * - Calculates mood transitions based on nightmare intensity
 * - Returns cryptic echo responses
 * - Logs to public stream (anonymized)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type DreamEaterMood = 'calm' | 'curious' | 'agitated' | 'fractured' | 'dormant' | 'feral' | 'dreaming';

const MOOD_TRANSITIONS: Record<DreamEaterMood, { dream: DreamEaterMood[]; nightmare: DreamEaterMood[] }> = {
  calm: { dream: ['calm', 'curious'], nightmare: ['curious', 'agitated'] },
  curious: { dream: ['calm', 'curious'], nightmare: ['agitated', 'fractured'] },
  agitated: { dream: ['curious', 'calm'], nightmare: ['fractured', 'feral'] },
  fractured: { dream: ['agitated', 'curious'], nightmare: ['feral', 'fractured'] },
  dormant: { dream: ['calm', 'curious'], nightmare: ['agitated'] },
  feral: { dream: ['fractured', 'agitated'], nightmare: ['feral', 'fractured'] },
  dreaming: { dream: ['calm', 'curious'], nightmare: ['agitated', 'fractured'] },
};

function calculateNightmareIntensity(content: string): number {
  const length = Math.min(content.length / 1000, 1);
  const negativeWords = (content.match(/death|fear|dark|pain|scream|blood|horror|terror|nightmare|alone|lost|trapped/gi) || []).length;
  const sentimentScore = Math.min(negativeWords / 5, 1);
  const entropy = new Set(content.toLowerCase().split('')).size / 26;
  return Math.min((length * 0.3 + sentimentScore * 0.5 + entropy * 0.2), 0.99);
}

function selectMood(current: DreamEaterMood, type: 'dream' | 'nightmare', intensity: number): DreamEaterMood {
  const options = MOOD_TRANSITIONS[current][type];
  if (type === 'nightmare' && intensity > 0.8) {
    return options[options.length - 1]; // Most extreme option
  }
  return options[Math.floor(Math.random() * options.length)];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { action, content, type = 'dream', session_hash, opt_in_excerpt = false } = await req.json();

    // Check feature flags
    const { data: features } = await supabase
      .from('dream_eater_features')
      .select('feature_key, enabled')
      .in('feature_key', ['emergency_freeze', 'echo_responses', 'public_stream']);
    
    const featureMap = Object.fromEntries((features || []).map(f => [f.feature_key, f.enabled]));
    
    if (featureMap.emergency_freeze) {
      return new Response(
        JSON.stringify({ success: false, error: 'Dream-Eater is dormant' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    if (session_hash) {
      const { data: rateLimit } = await supabase
        .from('dream_rate_limits')
        .select('*')
        .eq('session_hash', session_hash)
        .single();

      if (rateLimit) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (new Date(rateLimit.last_submission_at) > hourAgo && rateLimit.submission_count >= 10) {
          return new Response(
            JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    if (action === 'get_state') {
      const { data: state } = await supabase
        .from('dream_eater_state')
        .select('*')
        .single();

      const { data: milestones } = await supabase
        .from('dream_eater_milestones')
        .select('*')
        .order('milestone_level');

      const { data: recentStream } = await supabase
        .from('dream_stream')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({ success: true, state, milestones, recent_stream: recentStream }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'consume') {
      // Get current state
      const { data: currentState } = await supabase
        .from('dream_eater_state')
        .select('*')
        .single();

      if (!currentState) {
        throw new Error('Dream-Eater state not found');
      }

      const isNightmare = type === 'nightmare';
      const intensity = isNightmare ? calculateNightmareIntensity(content || '') : 0;
      const mutationDelta = isNightmare ? Math.ceil(intensity * 3) + 1 : 1;
      
      const currentMood = (currentState.current_mood || 'calm') as DreamEaterMood;
      const newMood = selectMood(currentMood, type, intensity);
      const newMutationLevel = (currentState.mutation_level || 0) + mutationDelta;
      const newInstability = Math.min(0.99, (intensity * 0.3) + (newMood === 'feral' ? 0.5 : newMood === 'fractured' ? 0.3 : 0));

      // Update state
      const { data: updatedState } = await supabase
        .from('dream_eater_state')
        .update({
          current_mood: newMood,
          mutation_level: newMutationLevel,
          dreams_consumed_today: isNightmare ? currentState.dreams_consumed_today : (currentState.dreams_consumed_today || 0) + 1,
          nightmares_consumed_today: isNightmare ? (currentState.nightmares_consumed_today || 0) + 1 : currentState.nightmares_consumed_today,
          last_fed_at: new Date().toISOString(),
          last_cycle_at: new Date().toISOString(),
        })
        .eq('id', currentState.id)
        .select()
        .single();

      // Log to audit (no content)
      await supabase.from('dream_eater_audit').insert({
        event_type: isNightmare ? 'nightmare_consumed' : 'dream_consumed',
        mood_before: currentMood,
        mood_after: newMood,
        mutation_delta: mutationDelta,
        nightmare_intensity: isNightmare ? intensity : null,
        session_hash,
      });

      // Add to public stream
      if (featureMap.public_stream !== false) {
        const excerptText = opt_in_excerpt && content ? content.slice(0, 50) + '...' : null;
        await supabase.from('dream_stream').insert({
          stream_type: type,
          mood_before: currentMood,
          mood_after: newMood,
          mutation_delta: mutationDelta,
          opted_in_excerpt: excerptText,
        });
      }

      // Check milestone unlocks
      const { data: milestones } = await supabase
        .from('dream_eater_milestones')
        .select('*')
        .lte('milestone_level', newMutationLevel)
        .is('unlocked_at', null);

      const unlockedMilestones = [];
      for (const milestone of milestones || []) {
        await supabase
          .from('dream_eater_milestones')
          .update({ unlocked_at: new Date().toISOString() })
          .eq('id', milestone.id);
        unlockedMilestones.push(milestone);
      }

      // Get echo response
      let echo = null;
      if (featureMap.echo_responses !== false) {
        const { data: templates } = await supabase
          .from('dream_echo_templates')
          .select('*')
          .contains('mood_affinity', [newMood]);

        if (templates && templates.length > 0) {
          echo = templates[Math.floor(Math.random() * templates.length)].template;
        }
      }

      // Update rate limit
      if (session_hash) {
        await supabase.rpc('increment_dream_rate_limit', { p_session_hash: session_hash });
      }

      return new Response(
        JSON.stringify({
          success: true,
          state: updatedState,
          mood_transition: { from: currentMood, to: newMood },
          mutation_delta: mutationDelta,
          intensity: isNightmare ? intensity : null,
          echo,
          milestones_unlocked: unlockedMilestones,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Dream State Engine error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
