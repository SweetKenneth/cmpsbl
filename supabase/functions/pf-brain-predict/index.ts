/**
 * PromptFluid Brain Prediction Synthesizer
 * Converts insights into ranked action proposals
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Validate input with Zod
    const { z } = await import('https://deno.land/x/zod@v3.22.4/mod.ts');
    const PredictSchema = z.object({
      lookback_hours: z.number().int().min(1).max(48).optional().default(6),
      limit: z.number().int().min(1).max(100).optional().default(50)
    });
    
    const body = req.method === 'POST' ? await req.json() : {};
    const validation = PredictSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { lookback_hours } = validation.data;

    console.log('Starting prediction synthesis...');

    // Fetch recent insights
    const since = new Date(Date.now() - lookback_hours * 60 * 60 * 1000).toISOString();
    const { data: insights, error: insightsError } = await sb
      .from('brain_cross_insights')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (insightsError) throw insightsError;

    // Fetch allowed actions from policy
    const { data: policyData } = await sb
      .from('brain_policy')
      .select('value')
      .eq('key', 'actions.allowed')
      .single();

    const allowed = policyData?.value || {};

    const proposals: any[] = [];

    for (const insight of insights || []) {
      const proposal = proposeFromInsight(insight);
      if (!proposal) continue;
      
      const actionType = proposal.proposal_detail.action;
      if (!allowed[actionType]) {
        console.log(`Action ${actionType} not in allowed list, skipping`);
        continue;
      }

      proposals.push({
        proposal_title: proposal.proposal_title,
        proposal_detail: proposal.proposal_detail,
        expected_impact: proposal.expected_impact,
        source_insight_id: insight.id,
        status: 'proposed'
      });
    }

    // Insert proposals
    if (proposals.length > 0) {
      const { error: insertError } = await sb
        .from('brain_actions_queue')
        .insert(proposals);

      if (insertError) throw insertError;
    }

    // Log to brain events
    await sb.from('brain_events').insert({
      event_type: 'prediction_synthesis',
      module: 'decision_kernel',
      data: {
        insights_analyzed: insights?.length || 0,
        proposals_created: proposals.length,
        timestamp: new Date().toISOString()
      },
      outcome: 'success'
    });

    console.log(`✅ Generated ${proposals.length} action proposals`);

    return new Response(
      JSON.stringify({
        success: true,
        proposed: proposals.length,
        proposals
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Prediction synthesis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function proposeFromInsight(insight: any): any | null {
  const title = insight.insight_title?.toLowerCase() || '';

  // Map insight patterns to safe actions
  if (title.includes('security') || title.includes('retention')) {
    return {
      proposal_title: 'Enable Defense Monitor Mode',
      proposal_detail: {
        action: 'set_defense_mode_monitor',
        params: { enabled: true, window: '48h' }
      },
      expected_impact: {
        metric: 'retention_rate',
        lift: 0.02,
        window: '7d'
      }
    };
  }

  if (title.includes('uptime') || title.includes('performance')) {
    return {
      proposal_title: 'Increase Cache Warm Rate',
      proposal_detail: {
        action: 'schedule_cache_warm',
        params: { cron: '*/10 * * * *', duration: '24h' }
      },
      expected_impact: {
        metric: 'api_latency_ms',
        lift: -20,
        window: '24h'
      }
    };
  }

  if (title.includes('demand') || title.includes('queue') || title.includes('api')) {
    return {
      proposal_title: 'Tune Queue Concurrency',
      proposal_detail: {
        action: 'tune_queue_concurrency',
        params: { min: 4, max: 8 }
      },
      expected_impact: {
        metric: 'queue_wait_ms',
        lift: -30,
        window: '24h'
      }
    };
  }

  if (title.includes('intelligence') || title.includes('learning')) {
    return {
      proposal_title: 'Adjust AI Provider Weights',
      proposal_detail: {
        action: 'adjust_provider_weights',
        params: { groq: 0.4, openai: 0.35, anthropic: 0.25 }
      },
      expected_impact: {
        metric: 'learning_quality_score',
        lift: 0.05,
        window: '48h'
      }
    };
  }

  return null;
}
