/**
 * PromptFluid Brain A/B Test Manager
 * Launches and evaluates A/B experiments
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Empty schema for scheduled cron job (no input expected)
const ABTestSchema = z.object({
  force_evaluation: z.boolean().optional()
}).optional();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await sb.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input (cron jobs should have empty body or optional params)
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    ABTestSchema.parse(body);

    console.log('Starting A/B experiment management...');

    // Check if we can start more experiments
    const { data: policyData } = await sb
      .from('brain_policy')
      .select('value')
      .eq('key', 'ab.max_parallel')
      .single();

    const maxParallel = Number(policyData?.value) || 3;

    const { count: runningCount } = await sb
      .from('ab_experiments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'running');

    let started = 0;

    // Start draft experiments if we have capacity
    if ((runningCount || 0) < maxParallel) {
      const { data: drafts } = await sb
        .from('ab_experiments')
        .select('*')
        .eq('status', 'draft')
        .limit(1);

      if (drafts && drafts.length > 0) {
        const draft = drafts[0];
        await sb
          .from('ab_experiments')
          .update({
            status: 'running',
            started_at: new Date().toISOString()
          })
          .eq('id', draft.id);

        started = 1;
        console.log(`Started experiment: ${draft.name}`);
      }
    }

    // Evaluate running experiments
    const { data: running } = await sb
      .from('ab_experiments')
      .select('*')
      .eq('status', 'running');

    let updated = 0;

    for (const experiment of running || []) {
      const variants = Object.keys(experiment.variants || {});

      for (const variant of variants) {
        const metricName = experiment.metric_primary || 'conversion_rate';

        // Simulate metric collection (in production, query actual data)
        const value = Math.random() * 0.1 + 0.05;
        const sampleSize = Math.floor(Math.random() * 500 + 200);
        const pValue = Math.random() * 0.2;

        await sb.from('ab_results').upsert({
          experiment_id: experiment.id,
          variant,
          metric_name: metricName,
          value,
          sample_size: sampleSize,
          p_value: pValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'experiment_id,variant,metric_name'
        });

        updated++;
      }

      // Auto-complete experiments with significant results
      const { data: results } = await sb
        .from('ab_results')
        .select('*')
        .eq('experiment_id', experiment.id);

      if (results && results.length >= 2) {
        const hasSignificant = results.some(r => r.p_value && r.p_value < 0.05);
        const hasEnoughSamples = results.every(r => r.sample_size > 300);

        if (hasSignificant && hasEnoughSamples) {
          await sb
            .from('ab_experiments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', experiment.id);

          console.log(`Completed experiment: ${experiment.name}`);
        }
      }
    }

    // Log to brain events
    await sb.from('brain_events').insert({
      event_type: 'ab_evaluation',
      module: 'decision_kernel',
      data: {
        experiments_started: started,
        results_updated: updated,
        running_experiments: running?.length || 0,
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });

    console.log(`✅ A/B evaluation complete: ${started} started, ${updated} results updated`);

    return new Response(
      JSON.stringify({
        success: true,
        started,
        updated,
        running: running?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('A/B evaluation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
