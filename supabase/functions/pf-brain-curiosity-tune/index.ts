/**
 * PromptFluid Brain Curiosity Tuner
 * Adjusts exploration vs exploitation ratios based on learning success
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🎯 Tuning curiosity ratios based on recent performance...');

    // Get reflections from last 3 days
    const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString();
    const { data: reflections, error: reflError } = await supabase
      .from('brain_reflection_log')
      .select('accuracy, applied_value, novelty')
      .gte('reflection_date', threeDaysAgo);

    if (reflError) {
      console.error('Error fetching reflections:', reflError);
      throw reflError;
    }

    if (!reflections || reflections.length === 0) {
      console.log('No recent reflections found, maintaining current ratios');
      return new Response(
        JSON.stringify({ success: true, message: 'No reflections to analyze' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate average performance metrics
    const avgAccuracy = reflections.reduce((sum, r) => sum + (r.accuracy || 0.5), 0) / reflections.length;
    const avgValue = reflections.reduce((sum, r) => sum + (r.applied_value || 0.5), 0) / reflections.length;
    const avgNovelty = reflections.reduce((sum, r) => sum + (r.novelty || 0.5), 0) / reflections.length;
    
    const successScore = (avgAccuracy + avgValue) / 2;

    console.log(`Performance metrics - Accuracy: ${avgAccuracy.toFixed(2)}, Value: ${avgValue.toFixed(2)}, Novelty: ${avgNovelty.toFixed(2)}`);

    // Determine new curiosity ratios
    let exploration = 0.35;
    let exploitation = 0.65;
    let trend = 'stable';

    // Low success: increase exploration to find new promising areas
    if (successScore < 0.4) {
      exploration = 0.50;
      exploitation = 0.50;
      trend = 'exploring';
      console.log('📈 Low success detected - increasing exploration');
    }
    // High success: focus on deepening current areas
    else if (successScore > 0.7) {
      exploration = 0.25;
      exploitation = 0.75;
      trend = 'focused';
      console.log('🎯 High success detected - focusing on exploitation');
    }
    // Low novelty: inject more exploration
    else if (avgNovelty < 0.3) {
      exploration = 0.45;
      exploitation = 0.55;
      trend = 'seeking_novelty';
      console.log('🔍 Low novelty detected - seeking new topics');
    }
    // Balanced performance
    else {
      trend = 'balanced';
      console.log('⚖️ Performance balanced - maintaining moderate exploration');
    }

    // Update settings
    const { error: updateError } = await supabase
      .from('brain_curiosity_settings')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        exploration_ratio: exploration,
        exploitation_ratio: exploitation,
        last_adjusted: new Date().toISOString(),
        performance_trend: trend
      });

    if (updateError) {
      console.error('Error updating settings:', updateError);
      throw updateError;
    }

    // Log event
    await supabase.from('brain_events').insert({
      module: 'curiosity',
      event_type: 'tuning_complete',
      data: {
        exploration_ratio: exploration,
        exploitation_ratio: exploitation,
        trend,
        success_score: successScore,
        reflections_analyzed: reflections.length
      }
    });

    console.log(`✅ Curiosity tuned - Explore: ${(exploration*100).toFixed(0)}%, Exploit: ${(exploitation*100).toFixed(0)}%`);

    return new Response(
      JSON.stringify({
        success: true,
        exploration_ratio: exploration,
        exploitation_ratio: exploitation,
        performance_trend: trend,
        metrics: {
          accuracy: avgAccuracy,
          value: avgValue,
          novelty: avgNovelty,
          success_score: successScore
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Curiosity tuning error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
