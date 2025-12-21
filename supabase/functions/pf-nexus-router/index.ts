/**
 * PromptFluid Nexus Router v2.0.0
 * Free-stack AI routing with v2 circuit breakers, self-healing, and graceful degradation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  callFreeTierAI, 
  getGracefulFallback,
  getRouterStatus,
  ROUTER_VERSION 
} from "../_shared/free-tier-router.ts";
import { logNexus } from "../_shared/nexus-log.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

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
      priority = 'speed',
      metadata = {} 
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔌 Nexus v${ROUTER_VERSION} routing request (priority: ${priority})...`);

    // Retry loop with v2 self-healing
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await callFreeTierAI(prompt, { 
          systemPrompt, 
          temperature, 
          maxTokens,
          priority,
          enableCircuitBreaker: true,
          enableSelfHealing: attempt === MAX_RETRIES
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
            latency_ms: latency,
            healthScore: result.healthScore,
            routerVersion: ROUTER_VERSION
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ Nexus attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }
    }

    // All retries failed - use graceful fallback
    const latency = Date.now() - startTime;
    
    await logNexus({
      provider: 'graceful_fallback',
      latency_ms: latency,
      token_count: 0,
      cost_usd_est: 0,
      status: 'success',
      route_key: metadata.routeKey || 'fallback'
    });

    const fallback = getGracefulFallback('unavailable');

    return new Response(
      JSON.stringify({ 
        success: true,
        content: fallback,
        provider: 'graceful_fallback',
        model: 'local',
        latency_ms: latency,
        healthScore: 0,
        routerVersion: ROUTER_VERSION,
        degraded: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const latency = Date.now() - startTime;
    
    // Log failure
    await logNexus({
      provider: 'error',
      latency_ms: latency,
      token_count: 0,
      cost_usd_est: 0,
      status: 'failure',
      route_key: 'error'
    });

    console.error('Nexus routing error:', error);
    
    const errorFallback = getGracefulFallback('error');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackContent: errorFallback,
        routerVersion: ROUTER_VERSION
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
