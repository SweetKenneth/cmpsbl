/**
 * PromptFluid Brain Forecast Evaluator
 * Evaluates forecast accuracy against actual outcomes
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

    console.log('📈 Evaluating forecast accuracy...');

    // Get recent forecasts that haven't been evaluated
    const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString();
    const { data: forecasts, error: forecastsError } = await supabase
      .from('brain_forecasts')
      .select('*')
      .eq('evaluated', false)
      .lte('created_at', threeDaysAgo);

    if (forecastsError) {
      console.error('Error fetching forecasts:', forecastsError);
      throw forecastsError;
    }

    if (!forecasts || forecasts.length === 0) {
      console.log('No forecasts to evaluate');
      return new Response(
        JSON.stringify({ success: true, message: 'No forecasts ready for evaluation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Evaluating ${forecasts.length} forecasts...`);

    let evaluatedCount = 0;
    const accuracyScores: number[] = [];

    for (const forecast of forecasts) {
      // Get the actual metric value closest to the forecast horizon
      const targetDate = new Date(
        new Date(forecast.created_at).getTime() + (forecast.horizon_days * 86400000)
      ).toISOString();

      const { data: actualMetrics, error: metricsError } = await supabase
        .from('brain_temporal_metrics')
        .select('metric_value, recorded_at')
        .eq('metric_name', forecast.metric_name)
        .gte('recorded_at', targetDate)
        .order('recorded_at', { ascending: true })
        .limit(1);

      if (metricsError || !actualMetrics || actualMetrics.length === 0) {
        console.log(`No actual data found for ${forecast.metric_name}`);
        continue;
      }

      const actualValue = actualMetrics[0].metric_value;
      const forecastValue = forecast.forecast_value;

      // Calculate accuracy score (0-1, where 1 is perfect)
      const difference = Math.abs(actualValue - forecastValue);
      const relativeDifference = difference / (Math.abs(actualValue) + 0.001);
      const accuracyScore = Math.max(0, 1 - relativeDifference);

      // Update forecast with evaluation
      const { error: updateError } = await supabase
        .from('brain_forecasts')
        .update({
          evaluated: true,
          actual_value: actualValue,
          accuracy_score: accuracyScore,
          confidence: accuracyScore // Update confidence based on accuracy
        })
        .eq('id', forecast.id);

      if (updateError) {
        console.error(`Error updating forecast ${forecast.id}:`, updateError);
        continue;
      }

      evaluatedCount++;
      accuracyScores.push(accuracyScore);

      console.log(
        `✓ ${forecast.metric_name}: Forecast ${forecastValue.toFixed(2)} vs Actual ${actualValue.toFixed(2)} = ${(accuracyScore*100).toFixed(0)}% accuracy`
      );
    }

    const avgAccuracy = accuracyScores.length > 0
      ? accuracyScores.reduce((sum, s) => sum + s, 0) / accuracyScores.length
      : 0;

    // Log evaluation event
    await supabase.from('brain_events').insert({
      module: 'temporal',
      event_type: 'forecast_evaluation',
      data: {
        evaluated_count: evaluatedCount,
        avg_accuracy: avgAccuracy,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ Evaluated ${evaluatedCount} forecasts, avg accuracy: ${(avgAccuracy*100).toFixed(1)}%`);

    return new Response(
      JSON.stringify({
        success: true,
        evaluated: evaluatedCount,
        avg_accuracy: avgAccuracy
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Forecast evaluation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
