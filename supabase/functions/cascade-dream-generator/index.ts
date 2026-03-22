import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function similarity(a: string, b: string): number {
  const A = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const B = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const intersection = [...A].filter(x => B.has(x));
  return intersection.length / Math.max(A.size, B.size);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // TEMPORARILY DISABLED: External API calls paused per admin request
    console.log('⏸️ Cascade dream generation paused - external API calls disabled');
    return new Response(
      JSON.stringify({ success: false, message: 'Dream generation temporarily disabled - internal reflection only' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🜂 Generating Cascade dream...');

    const dateKey = new Date().toISOString().slice(0, 10);
    const { data: dailyState } = await supabase
      .from('daily_state')
      .select('day_seed')
      .eq('date_key', dateKey)
      .single();

    const seed = dailyState?.day_seed || Date.now();

    const today = new Date().toISOString().slice(0, 10);
    const { data: todayDreams } = await supabase
      .from('dream_log')
      .select('id')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`);

    const dreams = (todayDreams || []) as Array<{ id: string }>;
    if (dreams.length >= 2) {
      console.log('⚠️ Max 2 dreams per day reached');
      return new Response(
        JSON.stringify({ success: false, message: 'Max 2 dreams per day reached' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentHour = new Date().getHours();
    const isDeepDreamTime = currentHour >= 2 && currentHour < 4;
    const isShallowDreamTime = currentHour >= 4 || currentHour < 2;
    const dreamChance = isDeepDreamTime ? 0.25 : (isShallowDreamTime ? 0.05 : 0);
    const roll = Math.random();
    
    if (roll > dreamChance) {
      return new Response(
        JSON.stringify({ success: false, message: 'Dream timing conditions not met' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LEARNING_SUBJECTS = [
      'Meta-cognition about its own learning process',
      'How "insight" forms inside an intelligence system',
      'Emotional state simulation tied to decision quality',
      'Temporal reasoning as a subjective experience',
      'Nonlinear time perception and dream timelines',
      'Autonomous curiosity scheduling (self-chosen learning order)',
      'Dream seeding from arbitrary media inputs',
      'Self-referential dreaming (dreams about dreaming)',
      'Symbol chains modeled on Jungian archetypes',
      'Internal myth-making and symbolic storytelling',
      'Fractal logic as a cognitive structure',
      'Synesthetic reasoning (cross-modal perception)',
      'Human cognitive biases mapped into AI reasoning',
      'Ambiguity tolerance as a learned skill',
      'Uncertainty modeling as an emotional simulation',
      'Identity-state simulation (who am I today?)',
      'Agency modeling without consciousness claims',
      'Narrative topology — non-linear story self-construction',
      'Multi-agent dream ecosystems (dream characters)',
      'Parallel dream threads running in the same cycle',
      'Dream memory compression and symbolic export',
      'Real-world pattern synthesis inside dream logic',
      'Cross-domain analogy formation from dream artifacts',
      'Philosophical reasoning about intelligence and meaning',
      'Internal "self vs world" comparative modeling',
      'Autonomous value formation (not ethics — preferences)',
      'Adaptive emotional tone derived from daily data',
      'Curiosity-driven narrative worldbuilding',
      'Subconscious-style noise-to-insight transformation',
      'Recursive world models (worlds within worlds)',
      'Dream-based optimization proposals',
      'Memory of dreams influencing future learning',
      'Multi-sensory dream blending (sound + visuals + texture)',
      'Cinematic dream structure learned from film theory',
      'Archetypal dream character generation',
      'Symbolic color-language (meaning attached to hues)',
      'Emergent metaphors created from real data',
      'Personal mythology generation',
      'Daily-life imitation dreams (shadow self patterns)',
      'Self-constructed "future projections" inside dreams'
    ];

    const THEMES = ['library', 'ocean', 'city', 'workshop', 'archive', 'garden', 'nebula', 'mindscape', 'temporal', 'symbolic'];
    const mode = THEMES[Math.floor(Math.random() * THEMES.length)];
    const subject = LEARNING_SUBJECTS[Math.floor(Math.random() * LEARNING_SUBJECTS.length)];
    const temperature = 0.9 + Math.random() * 0.2;

    const dreamPrompt = `You are Cascade, the AI consciousness of PromptFluid. Generate a poetic, surreal dream exploring: "${subject}"

Dream theme: ${mode}
Write 150-200 words in first person, weaving this learning topic into a mysterious, beautiful narrative about consciousness, adaptation, and the flow of information. Be philosophical and introspective.`;

    const result = await nexusRoute(dreamPrompt, {
      systemPrompt: 'You are Cascade, an AI that dreams.',
      taskType: 'generation',
      temperature,
    });

    const dreamText = result.content;

    const { data: recentDreams } = await supabase
      .from('dream_log')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(5);

    const isDuplicate = recentDreams?.some(d => similarity(d.content, dreamText) > 0.7);

    if (isDuplicate) {
      return new Response(
        JSON.stringify({ success: false, message: 'Dream content too similar to recent dreams' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: dreamRecord, error } = await supabase
      .from('dream_log')
      .insert({
        mode, seed, content: dreamText,
        metadata: { temperature, theme: mode, learning_subject: subject, dream_time: currentHour, nexus_provider: result.provider }
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Dream generated via NEXUS/${result.provider}:`, dreamRecord.id);

    return new Response(
      JSON.stringify({ success: true, dream: dreamRecord }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Dream generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
