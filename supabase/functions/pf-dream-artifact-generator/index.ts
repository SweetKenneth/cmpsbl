/**
 * Dream Artifact Generator v1.0.0
 * 
 * Daily cron job that:
 * - Compresses last 24h of dreams into one immutable artifact
 * - Generates abstract sentence + mood + visual seed
 * - Updates archaeology analytics
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VISUAL_SEEDS = [
  'crystalline_void', 'neural_storm', 'temporal_fracture', 'obsidian_depths',
  'aurora_membrane', 'quantum_fog', 'spectral_lattice', 'void_bloom',
  'memory_cascade', 'dream_sediment', 'nightmare_residue', 'cognitive_aurora'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if artifact already exists for today
    const { data: existingArtifact } = await supabase
      .from('dream_artifacts')
      .select('id')
      .eq('artifact_date', today)
      .single();

    if (existingArtifact) {
      return new Response(
        JSON.stringify({ success: true, message: 'Artifact already exists for today', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check feature flag
    const { data: feature } = await supabase
      .from('dream_eater_features')
      .select('enabled')
      .eq('feature_key', 'daily_artifacts')
      .single();

    if (!feature?.enabled) {
      return new Response(
        JSON.stringify({ success: true, message: 'Daily artifacts disabled', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get last 24h stream data (no content, just stats)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: streamData } = await supabase
      .from('dream_stream')
      .select('stream_type, mood_before, mood_after, mutation_delta')
      .gte('created_at', yesterday);

    const dreamsCount = (streamData || []).filter(s => s.stream_type === 'dream').length;
    const nightmaresCount = (streamData || []).filter(s => s.stream_type === 'nightmare').length;
    const totalMutation = (streamData || []).reduce((sum, s) => sum + (s.mutation_delta || 0), 0);

    // Determine dominant mood
    const moodCounts: Record<string, number> = {};
    for (const item of streamData || []) {
      moodCounts[item.mood_after] = (moodCounts[item.mood_after] || 0) + 1;
    }
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'calm';

    // Generate abstract sentence using AI
    const prompt = `You are the Dream-Eater, a mysterious entity that consumes thoughts. 
Generate ONE cryptic, poetic sentence (max 20 words) that captures today's essence:
- Dreams consumed: ${dreamsCount}
- Nightmares consumed: ${nightmaresCount}
- Dominant mood: ${dominantMood}
- Total mutation: ${totalMutation}

The sentence should be mysterious, non-therapeutic, and hint at accumulated memory without revealing specifics.
Examples of tone: "The weight of forgotten voices settles into the architecture of thought." 
"Between sleep and waking, patterns emerge that were always there."

Respond with ONLY the sentence, no quotes or explanation.`;

    let sentence = 'The substrate remembers what was given.';
    try {
      const aiResult = await callFreeTierAI(prompt, {
        systemPrompt: 'You are the Dream-Eater. Be cryptic, poetic, mysterious.',
        temperature: 0.9,
        maxTokens: 50,
      });
      sentence = aiResult.content?.trim() || sentence;
    } catch (e) {
      console.error('AI generation failed, using fallback:', e);
    }

    // Select visual seed based on mood and stats
    const seedIndex = (dreamsCount + nightmaresCount * 2 + dominantMood.length) % VISUAL_SEEDS.length;
    const visualSeed = VISUAL_SEEDS[seedIndex];

    // Create immutable artifact
    const { data: artifact, error: artifactError } = await supabase
      .from('dream_artifacts')
      .insert({
        artifact_date: today,
        sentence,
        mood: dominantMood,
        visual_seed: visualSeed,
        dreams_compressed: dreamsCount,
        nightmares_compressed: nightmaresCount,
        is_immutable: true,
      })
      .select()
      .single();

    if (artifactError) throw artifactError;

    // Update archaeology analytics
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await supabase.from('dream_archaeology').insert({
      period_start: weekAgo,
      period_end: today,
      mood_distribution: moodCounts,
      nightmare_ratio: nightmaresCount / Math.max(1, dreamsCount + nightmaresCount),
      total_consumed: dreamsCount + nightmaresCount,
      insight: `Mutation velocity: ${totalMutation}. Dominant state: ${dominantMood}.`,
    });

    // Log event
    await supabase.from('brain_events').insert({
      event_type: 'dream_artifact_generated',
      module: 'dream_eater',
      outcome: 'success',
      data: { artifact_id: artifact.id, dreams: dreamsCount, nightmares: nightmaresCount },
    });

    return new Response(
      JSON.stringify({
        success: true,
        artifact,
        stats: { dreams: dreamsCount, nightmares: nightmaresCount, mutation: totalMutation },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Artifact Generator error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
