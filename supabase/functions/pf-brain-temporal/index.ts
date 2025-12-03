/**
 * PromptFluid Brain Temporal Analysis
 * Analyzes trends and generates forecasts from historical metrics
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

    console.log('🔮 Analyzing temporal trends and generating forecasts...');

    // Get metrics from last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 86400000 * 14).toISOString();
    const { data: metrics, error: metricsError } = await supabase
      .from('brain_temporal_metrics')
      .select('metric_name, metric_value, recorded_at')
      .gte('recorded_at', fourteenDaysAgo)
      .order('recorded_at', { ascending: true });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      throw metricsError;
    }

    if (!metrics || metrics.length === 0) {
      console.log('No historical metrics found');
      return new Response(
        JSON.stringify({ success: true, message: 'No metrics to analyze' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group metrics by name
    const grouped: Record<string, any[]> = {};
    for (const metric of metrics) {
      if (!grouped[metric.metric_name]) {
        grouped[metric.metric_name] = [];
      }
      grouped[metric.metric_name].push(metric);
    }

    console.log(`Found ${Object.keys(grouped).length} unique metrics to analyze`);

    // Generate forecasts for each metric
    const forecasts = [];
    for (const metricName in grouped) {
      const series = grouped[metricName].sort((a, b) => 
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );

      if (series.length < 3) {
        console.log(`Skipping ${metricName} - insufficient data points`);
        continue;
      }

      // Simple linear regression for trend
      const n = series.length;
      const lastValue = series[n - 1].metric_value;
      const firstValue = series[0].metric_value;
      const slope = (lastValue - firstValue) / n;

      // Calculate variance for confidence
      const values = series.map(s => s.metric_value);
      const mean = values.reduce((sum, v) => sum + v, 0) / n;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
      const stdDev = Math.sqrt(variance);
      
      // Confidence inversely proportional to variance
      const confidence = Math.max(0.5, Math.min(0.95, 1 - (stdDev / (mean || 1))));

      // Forecast for 3 days ahead
      const forecast3Day = lastValue + (slope * 3);
      const forecast7Day = lastValue + (slope * 7);

      forecasts.push({
        metric_name: metricName,
        forecast_value: forecast3Day,
        confidence: confidence,
        horizon_days: 3
      });

      forecasts.push({
        metric_name: metricName,
        forecast_value: forecast7Day,
        confidence: confidence * 0.9, // Lower confidence for longer horizon
        horizon_days: 7
      });

      console.log(`📊 ${metricName}: ${lastValue.toFixed(2)} → ${forecast3Day.toFixed(2)} (3d), confidence: ${(confidence*100).toFixed(0)}%`);
    }

    // Store forecasts
    if (forecasts.length > 0) {
      const { error: insertError } = await supabase
        .from('brain_forecasts')
        .insert(forecasts);

      if (insertError) {
        console.error('Error storing forecasts:', insertError);
        throw insertError;
      }
    }

    // Log event
    await supabase.from('brain_events').insert({
      module: 'temporal',
      event_type: 'forecast_generation',
      data: {
        forecasts_generated: forecasts.length,
        metrics_analyzed: Object.keys(grouped).length,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ Generated ${forecasts.length} forecasts from ${Object.keys(grouped).length} metrics`);

    return new Response(
      JSON.stringify({
        success: true,
        forecasts_generated: forecasts.length,
        metrics_analyzed: Object.keys(grouped).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Temporal analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
