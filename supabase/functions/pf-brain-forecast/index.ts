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

    console.log('🔮 Cascade v5.0.0: Probabilistic forecasting engine started');

    // Fetch recent global signals
    const { data: signals, error: signalsError } = await supabaseClient
      .from('global_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (signalsError) throw signalsError;

    // Fetch internal metrics for correlation
    const { data: defenseEvents } = await supabaseClient
      .from('defense_events')
      .select('event_type')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const { data: usageLogs } = await supabaseClient
      .from('ai_usage_log')
      .select('provider')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    // Build context for AI forecasting
    const techSignals = signals?.filter(s => s.category === 'tech') || [];
    const avgSentiment = techSignals.reduce((sum, s) => sum + (s.sentiment_score || 0), 0) / (techSignals.length || 1);
    const threatCount = defenseEvents?.length || 0;
    const aiUsageCount = usageLogs?.length || 0;

    const context = {
      recent_tech_headlines: techSignals.slice(0, 10).map(s => s.headline),
      avg_sentiment: avgSentiment.toFixed(2),
      threat_activity: threatCount,
      ai_usage: aiUsageCount,
      analysis_window: '7 days',
    };

    // Call Lovable AI for probabilistic reasoning
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: 'You are Cascade, PromptFluid\'s strategic forecasting AI. Analyze trends and generate probabilistic forecasts for business opportunities and risks.'
        }, {
          role: 'user',
          content: `Based on these signals, generate 3 strategic forecasts for PromptFluid over the next 3-6 months. Return ONLY a JSON array with objects containing: hypothesis, probability (0-1), supporting_factors (array of strings), confidence (0-1), projection_window.

Context: ${JSON.stringify(context, null, 2)}`
        }],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.choices[0].message.content;
    
    // Parse forecasts from AI response
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array in AI response');
    }

    const forecasts = JSON.parse(jsonMatch[0]);

    // Store forecasts in database
    const { data: insertedForecasts, error: insertError } = await supabaseClient
      .from('global_forecasts')
      .insert(forecasts.map((f: any) => ({
        hypothesis: f.hypothesis,
        probability: f.probability,
        supporting_factors: f.supporting_factors,
        confidence: f.confidence,
        projection_window: f.projection_window,
        reviewed: false,
      })));

    if (insertError) {
      console.error('Failed to store forecasts:', insertError);
    } else {
      console.log(`✅ Generated and stored ${forecasts.length} forecasts`);
    }

    // Log learning event
    await supabaseClient.from('learning_logs').insert({
      event_type: 'forecast_generation',
      project_id: 'cascade',
      payload: { 
        forecasts_count: forecasts.length,
        high_prob_count: forecasts.filter((f: any) => f.probability > 0.7).length
      },
      success: true,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        forecasts,
        message: 'Forecasting cycle complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Forecasting error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
