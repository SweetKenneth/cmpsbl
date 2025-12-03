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
    console.log('🔄 Starting persona pattern refinement cycle...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get recent persona states (last 24h)
    const { data: recentStates } = await supabaseClient
      .from('brain_persona_state')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (!recentStates || recentStates.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No recent states to analyze', refined: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze tone distribution
    const toneDistribution: Record<string, number> = {};
    const styleEffectiveness: Record<string, { count: number, avgConfidence: number }> = {};

    recentStates.forEach(state => {
      toneDistribution[state.tone] = (toneDistribution[state.tone] || 0) + 1;
      
      if (!styleEffectiveness[state.response_style]) {
        styleEffectiveness[state.response_style] = { count: 0, avgConfidence: 0 };
      }
      styleEffectiveness[state.response_style].count++;
      styleEffectiveness[state.response_style].avgConfidence += state.confidence;
    });

    // Calculate average confidence per style
    Object.keys(styleEffectiveness).forEach(style => {
      const data = styleEffectiveness[style];
      data.avgConfidence = data.avgConfidence / data.count;
    });

    // Update pattern weights based on effectiveness
    let patternsUpdated = 0;
    for (const [style, data] of Object.entries(styleEffectiveness)) {
      const weight = Math.max(0.1, Math.min(2.0, data.avgConfidence * 1.5));
      
      const { error } = await supabaseClient
        .from('brain_persona_patterns')
        .upsert({
          trigger_pattern: `response_style_${style}`,
          inferred_state: style,
          weight: weight,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'trigger_pattern'
        });

      if (!error) patternsUpdated++;
    }

    // Log refinement event
    await supabaseClient.from('brain_events').insert({
      module: 'persona',
      event_type: 'refinement_cycle',
      data: {
        states_analyzed: recentStates.length,
        tone_distribution: toneDistribution,
        style_effectiveness: styleEffectiveness,
        patterns_updated: patternsUpdated
      }
    });

    console.log(`✅ Refined ${patternsUpdated} persona patterns based on ${recentStates.length} states`);

    return new Response(
      JSON.stringify({ 
        success: true,
        refined: patternsUpdated,
        analyzed: recentStates.length,
        insights: {
          dominant_tone: Object.entries(toneDistribution).sort((a, b) => b[1] - a[1])[0]?.[0],
          best_style: Object.entries(styleEffectiveness).sort((a, b) => b[1].avgConfidence - a[1].avgConfidence)[0]?.[0]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Persona refinement error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
