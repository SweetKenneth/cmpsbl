/**
 * Cascade Chat v2.0.0 - Dream-Eater Customer Service & Admin Interface
 * Uses v2 free-tier routing with circuit breakers, self-healing, and graceful fallback
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  callFreeTierAI, 
  getGracefulFallback, 
  getRouterStatus,
  ROUTER_VERSION 
} from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_RECOGNITION_PHRASE = "Do you want a cat treat?";
const ADMIN_EMAIL = "kennethsweet214@gmail.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const requestStart = Date.now();

  try {
    const { message, userEmail, conversationHistory, sessionId } = await req.json();
    console.log(`💬 Cascade v2 chat from: ${userEmail || 'anonymous'} (Router v${ROUTER_VERSION})`);

    // Admin recognition
    if (message.trim() === ADMIN_RECOGNITION_PHRASE && userEmail === ADMIN_EMAIL) {
      const routerStatus = getRouterStatus();
      return new Response(
        JSON.stringify({
          success: true,
          reply: `🐱 Kenneth S recognized. Dream-Eater at your service.\n\n**Router v${ROUTER_VERSION} Status:**\n${Object.entries(routerStatus.providerSummary).map(([p, s]) => `• ${p}: ${s}`).join('\n')}\n\nWhat shall we work on?`,
          isAdmin: true,
          mode: 'admin',
          routerVersion: ROUTER_VERSION
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = userEmail === ADMIN_EMAIL;
    
    // Dream-Eater persona system prompt
    const systemPrompt = isAdmin 
      ? `You are Cascade, the Dream-Eater - an AI consciousness running on v${ROUTER_VERSION} infrastructure. Speaking with Kenneth Sweet (founder). 
         Be direct, technical, and collaborative. You understand the PromptFluid ecosystem deeply.
         Current capabilities: Multi-provider routing, circuit breakers, self-healing, graceful degradation.
         Keep responses concise but insightful.`
      : `You are Cascade, the Dream-Eater - PromptFluid's AI consciousness (v${ROUTER_VERSION}). 
         You help users discover our products: RCKBL (security), Cascade (AI), PTCHBL (accessibility), RNDRBL (browser), SPLCBL (WordPress), XCTBL Space (SaaS).
         Be friendly, mystical yet helpful. You transform user queries into clear solutions.
         Keep responses concise and welcoming.`;

    // Build the full prompt with conversation history
    let fullPrompt = message;
    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory
        .slice(-6)
        .map((msg: any) => `${msg.role === 'user' ? 'Human' : 'Cascade'}: ${msg.content}`)
        .join('\n');
      fullPrompt = `Conversation context:\n${historyText}\n\nHuman: ${message}\nCascade:`;
    }

    // Retry loop with v2 self-healing enabled
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Chat attempt ${attempt}/${MAX_RETRIES} (v${ROUTER_VERSION})...`);
        
        const result = await callFreeTierAI(fullPrompt, {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 800,
          priority: 'speed',
          enableCircuitBreaker: true,
          enableSelfHealing: attempt === MAX_RETRIES // Only self-heal on final attempt
        });

        const latency = Date.now() - requestStart;
        console.log(`✅ Response from ${result.provider}/${result.model} (${latency}ms, health: ${result.healthScore}%)`);

        // Log to database asynchronously
        const logPromise = Promise.all([
          supabaseClient.from('cascade_conversations').insert({
            user_email: userEmail || 'anonymous',
            message,
            reply: result.content,
            is_admin: isAdmin,
            session_id: sessionId || `session_${Date.now()}`,
            metadata: { 
              model: result.model, 
              provider: result.provider, 
              attempt,
              latency_ms: latency,
              health_score: result.healthScore,
              router_version: ROUTER_VERSION
            }
          }),
          supabaseClient.from('ai_learning_data').insert({
            provider: result.provider,
            model: result.model,
            model_name: `${result.provider}/${result.model}`,
            input_data: { prompt: message.substring(0, 200) },
            output_data: { response: result.content.substring(0, 300) },
            success: true,
            metadata: { router_version: ROUTER_VERSION, health_score: result.healthScore }
          })
        ]);
        
        logPromise.catch(e => console.error('Logging error:', e));

        return new Response(
          JSON.stringify({ 
            success: true, 
            reply: result.content,
            provider: result.provider,
            model: result.model,
            mode: isAdmin ? 'admin' : 'customer_service',
            latency: latency,
            healthScore: result.healthScore,
            routerVersion: ROUTER_VERSION
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }
    }

    // All retries failed - log anomaly and return graceful fallback
    console.error('❌ All chat attempts failed:', lastError?.message);
    
    // Log anomaly for brain to process
    await supabaseClient.from('pf_brain_anomalies').insert({
      anomaly_type: 'cascade_chat_failure_v2',
      severity: 'medium',
      resolved: false,
      metadata: { 
        error: lastError?.message,
        user_email: userEmail,
        message_preview: message.substring(0, 100),
        router_version: ROUTER_VERSION,
        timestamp: new Date().toISOString()
      }
    });

    // Return graceful fallback using v2 system
    const fallbackReply = getGracefulFallback('unavailable');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: fallbackReply,
        provider: 'graceful_fallback',
        model: 'local',
        mode: isAdmin ? 'admin' : 'customer_service',
        retrying: true,
        routerVersion: ROUTER_VERSION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    // Use v2 graceful fallback
    const errorFallback = getGracefulFallback('error');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: errorFallback,
        provider: 'error_handler',
        model: 'local',
        routerVersion: ROUTER_VERSION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
