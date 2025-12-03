/**
 * PromptFluid Nexus Router
 * Free-stack only AI routing with analytics
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";
import { logNexus } from "../_shared/nexus-log.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { 
      prompt, 
      systemPrompt, 
      temperature = 0.7, 
      maxTokens = 1200, 
      metadata = {} 
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await callFreeTierAI(prompt, { 
      systemPrompt, 
      temperature, 
      maxTokens 
    });

    const latency = Date.now() - startTime;

    // Log successful routing
    await logNexus({
      provider: result.provider,
      latency_ms: latency,
      token_count: Math.ceil(prompt.length / 4),
      cost_usd_est: 0,
      status: 'success',
      route_key: metadata.routeKey || 'default'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: result.content,
        provider: result.provider,
        model: result.model,
        latency_ms: latency
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const latency = Date.now() - startTime;
    
    // Log failure
    await logNexus({
      provider: 'unknown',
      latency_ms: latency,
      token_count: 0,
      cost_usd_est: 0,
      status: 'failure',
      route_key: 'error'
    });

    console.error('Nexus routing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
