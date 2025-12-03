/**
 * PromptFluid Brain Reinforcement
 * Strengthens memory weights based on successful outcomes
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ReinforceSchema = z.object({
  lookbackHours: z.number().int().min(1).max(168).optional().default(24),
  minOutcomeScore: z.number().min(-1).max(1).optional().default(0.5)
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const validation = ReinforceSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lookbackHours, minOutcomeScore } = validation.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting reinforcement cycle...', { lookbackHours, minOutcomeScore });

    // Get reinforcement logs from the specified lookback period
    const lookbackTime = new Date(Date.now() - lookbackHours * 3600000).toISOString();
    const { data: logs, error: logsError } = await supabase
      .from('brain_reinforcement_log')
      .select('memory_id, outcome_score, event_type')
      .gte('triggered_at', lookbackTime)
      .gte('outcome_score', minOutcomeScore);

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      throw logsError;
    }

    console.log(`Processing ${logs?.length || 0} reinforcement events...`);

    // Incorporate meta-feedback results to adjust reinforcement
    const { data: feedbackData } = await supabase.rpc('compute_feedback_summary');
    let avgAccuracy = 0.5;
    if (feedbackData && feedbackData.length > 0) {
      const accuracyMetric = feedbackData.find((f: any) => f.metric === 'avg_accuracy');
      avgAccuracy = accuracyMetric?.value || 0.5;
    }
    const feedbackAdjustment = (avgAccuracy - 0.5) * 0.2;
    console.log(`Feedback adjustment factor: ${feedbackAdjustment.toFixed(3)}`);

    // Process each log entry
    let reinforcedCount = 0;
    const processedMemories = new Set<string>();

    for (const log of logs || []) {
      if (!log.memory_id || processedMemories.has(log.memory_id)) continue;

      // Apply meta-feedback adjustment to reinforcement delta
      const adjustedDelta = (log.outcome_score || 1.0) + feedbackAdjustment;

      // Call the database function to increment reinforcement score
      const { error: updateError } = await supabase.rpc('increment_reinforcement_score', {
        mid: log.memory_id,
        delta: adjustedDelta
      });

      if (updateError) {
        console.error(`Error reinforcing ${log.memory_id}:`, updateError);
      } else {
        reinforcedCount++;
        processedMemories.add(log.memory_id);
        console.log(`Reinforced memory ${log.memory_id} with adjusted score ${adjustedDelta.toFixed(2)}`);
      }
    }

    // Log event to brain_events
    await supabase.from('brain_events').insert({
      module: 'reinforcement',
      event_type: 'cycle_complete',
      data: {
        reinforced_count: reinforcedCount,
        logs_processed: logs?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Reinforcement complete: ${reinforcedCount} memories strengthened`);

    return new Response(
      JSON.stringify({ 
        success: true,
        reinforced: reinforcedCount,
        logs_processed: logs?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Reinforcement error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
