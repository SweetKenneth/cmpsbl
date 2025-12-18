/**
 * Cascade v4.0.0 - Sensory Layer Ingestion
 * Processes structured/visual data with embeddings and anomaly detection
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_SOURCES = ['telemetry', 'pf_image_outputs', 'analytics', 'brain_events'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { source, payload } = await req.json();

    if (!ALLOWED_SOURCES.includes(source)) {
      return new Response(
        JSON.stringify({ error: 'Invalid source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📡 Sensory ingestion from ${source}`);

    // Embeddings disabled - requires paid API
    // TODO: Re-enable when embedding API is configured
    const embeddings = null;

    // Simple anomaly detection (temporal drift check)
    const { data: recentEvents } = await sb
      .from('brain_sensory_events')
      .select('payload_json')
      .eq('source', source)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(10);

    let anomalyScore = 0;
    if (recentEvents && recentEvents.length > 5) {
      // Check if payload structure differs significantly
      const recentKeys = recentEvents.map(e => Object.keys(e.payload_json || {}));
      const currentKeys = Object.keys(payload);
      const avgKeyCount = recentKeys.reduce((sum, keys) => sum + keys.length, 0) / recentKeys.length;
      const keyDrift = Math.abs(currentKeys.length - avgKeyCount) / avgKeyCount;
      anomalyScore = Math.min(1, keyDrift);
    }

    // Insert sensory event
    const { data: event, error } = await sb
      .from('brain_sensory_events')
      .insert({
        source,
        payload_json: payload,
        embeddings_vector: embeddings,
        anomaly_score: anomalyScore
      })
      .select()
      .single();

    if (error) throw error;

    // Alert if high anomaly
    if (anomalyScore > 0.7) {
      await sb.from('brain_events').insert({
        event_type: 'sensory_anomaly',
        module: 'sensory_layer',
        data: { event_id: event.id, source, anomaly_score: anomalyScore },
        outcome: 'alert'
      });
      console.log(`⚠️ Anomaly detected: ${anomalyScore.toFixed(2)}`);
    }

    return new Response(
      JSON.stringify({ ok: true, event_id: event.id, anomaly_score: anomalyScore }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sensory ingestion error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
