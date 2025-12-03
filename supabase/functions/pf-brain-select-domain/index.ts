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
    const { topic, category } = await req.json();
    
    console.log(`🎯 Selecting optimal domain for topic: ${topic || category}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get active domains in category
    let query = supabaseClient
      .from('brain_reach_domains')
      .select('*')
      .eq('active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: domains, error: domainsError } = await query;

    if (domainsError || !domains || domains.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active domains found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get domain weights if topic provided
    let weights: Record<string, number> = {};
    if (topic) {
      const { data: weightData } = await supabaseClient
        .from('brain_domain_weights')
        .select('domain_name, weight, performance_score, relevance_score')
        .eq('topic', topic);

      if (weightData) {
        weights = weightData.reduce((acc, w) => {
          acc[w.domain_name] = (w.weight * w.performance_score * w.relevance_score);
          return acc;
        }, {} as Record<string, number>);
      }
    }

    // Get today's usage to check rate limits
    const today = new Date().toISOString().split('T')[0];
    const { data: usageData } = await supabaseClient
      .from('brain_domain_usage')
      .select('domain_id, calls_today')
      .eq('calls_date', today);

    const usageMap = new Map(
      (usageData || []).map(u => [u.domain_id, u.calls_today])
    );

    // Score each domain
    const scoredDomains = domains
      .filter(d => (usageMap.get(d.id) || 0) < 6) // Filter out rate-limited
      .map(d => {
        const baseWeight = weights[d.domain_name] || 1.0;
        const trustScore = d.trust_score || 0.7;
        const latencyPenalty = Math.max(0.1, 1 - (d.avg_latency_ms / 5000));
        const recencyBonus = d.last_fetched 
          ? 1 - Math.min(0.5, (Date.now() - new Date(d.last_fetched).getTime()) / (7 * 24 * 60 * 60 * 1000))
          : 0.5;

        const score = (baseWeight * trustScore * latencyPenalty * recencyBonus);

        return {
          domain: d,
          score,
          factors: {
            weight: baseWeight,
            trust: trustScore,
            latency_penalty: latencyPenalty,
            recency: recencyBonus,
          }
        };
      })
      .sort((a, b) => b.score - a.score);

    if (scoredDomains.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'All domains rate limited' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const selected = scoredDomains[0];

    console.log(`✅ Selected domain: ${selected.domain.domain_name} (score: ${selected.score.toFixed(3)})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        selected_domain: {
          id: selected.domain.id,
          name: selected.domain.domain_name,
          category: selected.domain.category,
          endpoint_url: selected.domain.endpoint_url,
          endpoint_type: selected.domain.endpoint_type,
          trust_score: selected.domain.trust_score,
        },
        selection_score: selected.score,
        selection_factors: selected.factors,
        alternatives: scoredDomains.slice(1, 4).map(d => ({
          name: d.domain.domain_name,
          score: d.score,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Domain selection error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});