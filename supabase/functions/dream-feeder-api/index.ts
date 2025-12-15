/**
 * Dream Feeder Public API
 * Allows external websites to feed dreams/nightmares to the Dream-Eater
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface DreamSubmission {
  dream_content: string;
  dream_type: 'dream' | 'nightmare';
  submitter_name?: string;
  source_domain?: string;
}

interface DreamEaterState {
  id: string;
  current_mood: string;
  mood_score: number;
  dreams_consumed_today: number;
  nightmares_consumed_today: number;
  last_fed_at: string | null;
  mutation_level: number;
  updated_at: string;
}

const analyzeSentiment = (content: string, type: 'dream' | 'nightmare'): number => {
  const positiveWords = ['happy', 'joy', 'love', 'peace', 'beautiful', 'light', 'flying', 'friend', 'safe', 'warm', 'gentle', 'calm', 'free', 'hope', 'wonder'];
  const negativeWords = ['fear', 'dark', 'chase', 'fall', 'death', 'monster', 'trapped', 'lost', 'scream', 'blood', 'pain', 'horror', 'shadow', 'dread', 'terror'];
  
  const lowerContent = content.toLowerCase();
  let score = 0.5;
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 0.04;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 0.04;
  });
  
  // Weight by dream type
  if (type === 'nightmare') score -= 0.15;
  if (type === 'dream') score += 0.05;
  
  return Math.max(0, Math.min(1, score));
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    // GET: Return Dream-Eater state and stats
    if (req.method === 'GET') {
      const { data: stateData } = await sb
        .from('dream_eater_state')
        .select('*')
        .limit(1)
        .single();

      const state = stateData as DreamEaterState | null;

      const { count: totalDreams } = await sb
        .from('dream_feeder_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('dream_type', 'dream');

      const { count: totalNightmares } = await sb
        .from('dream_feeder_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('dream_type', 'nightmare');

      return new Response(
        JSON.stringify({
          ok: true,
          dream_eater: {
            mood: state?.current_mood || 'neutral',
            mood_score: state?.mood_score || 0.5,
            mutation_level: state?.mutation_level || 0,
            last_fed_at: state?.last_fed_at,
          },
          stats: {
            total_dreams: totalDreams || 0,
            total_nightmares: totalNightmares || 0,
            dreams_today: state?.dreams_consumed_today || 0,
            nightmares_today: state?.nightmares_consumed_today || 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST: Submit a dream
    if (req.method === 'POST') {
      const body: DreamSubmission = await req.json();

      // Validate input
      if (!body.dream_content || typeof body.dream_content !== 'string') {
        return new Response(
          JSON.stringify({ error: 'dream_content is required and must be a string' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (body.dream_content.length > 2000) {
        return new Response(
          JSON.stringify({ error: 'dream_content must be 2000 characters or less' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const dreamType = body.dream_type === 'nightmare' ? 'nightmare' : 'dream';
      const sentiment = analyzeSentiment(body.dream_content, dreamType);

      // Get origin domain
      const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown';
      let sourceDomain = 'api';
      try {
        sourceDomain = body.source_domain || new URL(origin).hostname || 'api';
      } catch {
        sourceDomain = body.source_domain || 'api';
      }

      // Insert submission
      const { data: submission, error } = await sb
        .from('dream_feeder_submissions')
        .insert({
          dream_content: body.dream_content.trim().substring(0, 2000),
          dream_type: dreamType,
          sentiment_score: sentiment,
          source: 'api',
          source_domain: sourceDomain.substring(0, 100),
          submitter_name: body.submitter_name?.substring(0, 50) || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Get current state and update
      const { data: stateData } = await sb
        .from('dream_eater_state')
        .select('*')
        .limit(1)
        .single();

      const state = stateData as DreamEaterState | null;

      if (state) {
        // Calculate new mood based on 50% personal dreams, 50% fed dreams
        const personalWeight = 0.5;
        const fedWeight = 0.5;
        const currentScore = state.mood_score || 0.5;
        const newScore = (currentScore * personalWeight) + (sentiment * fedWeight);
        
        // Determine mood
        let newMood: string;
        if (newScore > 0.7) {
          newMood = 'peaceful';
        } else if (newScore > 0.5) {
          newMood = 'dreaming';
        } else if (newScore > 0.3) {
          newMood = 'agitated';
        } else {
          newMood = 'nightmare';
        }

        // Update mutation level
        let mutationLevel = state.mutation_level || 0;
        if (dreamType === 'nightmare') {
          mutationLevel = Math.min(mutationLevel + 1, 10);
        } else if (sentiment > 0.6) {
          mutationLevel = Math.max(mutationLevel - 1, 0);
        }

        await sb
          .from('dream_eater_state')
          .update({
            current_mood: newMood,
            mood_score: newScore,
            dreams_consumed_today: dreamType === 'dream' 
              ? (state.dreams_consumed_today || 0) + 1 
              : state.dreams_consumed_today,
            nightmares_consumed_today: dreamType === 'nightmare' 
              ? (state.nightmares_consumed_today || 0) + 1 
              : state.nightmares_consumed_today,
            last_fed_at: new Date().toISOString(),
            mutation_level: mutationLevel,
            updated_at: new Date().toISOString(),
          })
          .eq('id', state.id);
      }

      console.log(`🌙 Dream fed via API: ${dreamType} from ${sourceDomain}, sentiment: ${sentiment.toFixed(2)}`);

      return new Response(
        JSON.stringify({
          ok: true,
          message: dreamType === 'nightmare' 
            ? 'The Dream-Eater devours your nightmare...' 
            : 'The Dream-Eater savors your dream...',
          submission: {
            id: (submission as any).id,
            type: dreamType,
            sentiment_score: sentiment,
            created_at: (submission as any).created_at,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Dream Feeder API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
