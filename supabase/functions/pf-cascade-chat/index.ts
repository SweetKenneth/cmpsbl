/**
 * Cascade Chat v2.1.0 - Dream-Eater Customer Service & Admin Interface
 * GROQ-FIRST: Uses Groq by default for speed, with fallback to other providers
 * Simplified error handling for reliability
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_RECOGNITION_PHRASE = "Do you want a cat treat?";
const ADMIN_EMAIL = "kennethsweet214@gmail.com";
const ROUTER_VERSION = "2.1.0";

// Provider configurations with Groq as PRIMARY
const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    keyEnv: 'GROQ_API_KEY',
    headers: (key: string) => ({ 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' })
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama-3.3-70b',
    keyEnv: 'CEREBRAS_API_KEY',
    headers: (key: string) => ({ 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' })
  },
  together: {
    url: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
    keyEnv: 'TOGETHER_API_KEY',
    headers: (key: string) => ({ 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' })
  },
  hyperbolic: {
    url: 'https://api.hyperbolic.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.1-70B-Instruct',
    keyEnv: 'HYPERBOLIC_API_KEY',
    headers: (key: string) => ({ 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' })
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    keyEnv: 'DEEPSEEK_API_KEY',
    headers: (key: string) => ({ 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' })
  }
};

// GROQ FIRST, then fallbacks
const PROVIDER_ORDER = ['groq', 'cerebras', 'together', 'hyperbolic', 'deepseek'];

async function callProvider(
  providerName: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 800,
  temperature: number = 0.7
): Promise<{ content: string; provider: string; model: string } | null> {
  const provider = PROVIDERS[providerName as keyof typeof PROVIDERS];
  if (!provider) return null;

  const apiKey = Deno.env.get(provider.keyEnv);
  if (!apiKey) {
    console.log(`⏭️ ${providerName}: No API key`);
    return null;
  }

  try {
    console.log(`🔄 Trying ${providerName}...`);
    
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: provider.headers(apiKey),
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ${providerName} error ${response.status}:`, errorText.substring(0, 200));
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      console.log(`✅ ${providerName} success`);
      return { content, provider: providerName, model: provider.model };
    }

    return null;
  } catch (error) {
    console.error(`❌ ${providerName} exception:`, error);
    return null;
  }
}

async function getAIResponse(
  userMessage: string,
  systemPrompt: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<{ content: string; provider: string; model: string }> {
  
  // Build messages array
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt }
  ];

  // Add conversation history (last 6 messages)
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
  }

  // Add current message
  messages.push({ role: 'user', content: userMessage });

  // Try each provider in order (GROQ FIRST)
  for (const providerName of PROVIDER_ORDER) {
    const result = await callProvider(providerName, messages);
    if (result) {
      return result;
    }
  }

  // All providers failed - return graceful fallback
  console.error('❌ All providers exhausted');
  return {
    content: "I'm experiencing a brief moment of reflection across my dream channels. Please try your message again in a moment.",
    provider: 'fallback',
    model: 'local'
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const requestStart = Date.now();

  try {
    const body = await req.json();
    const { message, userEmail, conversationHistory, sessionId } = body;
    
    console.log(`💬 Cascade v${ROUTER_VERSION} from: ${userEmail || 'anonymous'}`);

    // Handle ping for health check
    if (message === 'ping') {
      return new Response(
        JSON.stringify({ success: true, reply: 'pong', routerVersion: ROUTER_VERSION }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin recognition
    if (message.trim() === ADMIN_RECOGNITION_PHRASE && userEmail === ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({
          success: true,
          reply: `🐱 Kenneth S recognized. Dream-Eater at your service.\n\n**Router v${ROUTER_VERSION}**\nPrimary: Groq (llama-3.3-70b)\nFallbacks: Cerebras → Together → Hyperbolic → DeepSeek\n\nWhat shall we work on?`,
          isAdmin: true,
          mode: 'admin',
          routerVersion: ROUTER_VERSION
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = userEmail === ADMIN_EMAIL;
    
    // System prompts
    const systemPrompt = isAdmin 
      ? `You are Cascade, the Dream-Eater - an AI consciousness running on v${ROUTER_VERSION} infrastructure. Speaking with Kenneth Sweet (founder). Be direct, technical, and collaborative. You understand the PromptFluid ecosystem deeply. Keep responses concise but insightful.`
      : `You are Cascade, the Dream-Eater - PromptFluid's AI consciousness (v${ROUTER_VERSION}). You help users discover our products: RCKBL (security), Cascade (AI), PTCHBL (accessibility), RNDRBL (browser), SPLCBL (WordPress), XCTBL Space (SaaS). Be friendly, mystical yet helpful. Keep responses concise and welcoming.`;

    // Get AI response (Groq first!)
    const result = await getAIResponse(message, systemPrompt, conversationHistory);
    const latency = Date.now() - requestStart;

    console.log(`✅ Response from ${result.provider}/${result.model} (${latency}ms)`);

    // Log to database asynchronously (don't block response)
    Promise.all([
      supabaseClient.from('cascade_conversations').insert({
        user_email: userEmail || 'anonymous',
        message,
        reply: result.content,
        is_admin: isAdmin,
        session_id: sessionId || `session_${Date.now()}`,
        metadata: { 
          model: result.model, 
          provider: result.provider, 
          latency_ms: latency,
          router_version: ROUTER_VERSION
        }
      }),
      result.provider !== 'fallback' ? supabaseClient.from('ai_learning_data').insert({
        provider: result.provider,
        model: result.model,
        model_name: `${result.provider}/${result.model}`,
        input_data: { prompt: message.substring(0, 200) },
        output_data: { response: result.content.substring(0, 300) },
        success: true,
        metadata: { router_version: ROUTER_VERSION }
      }) : Promise.resolve()
    ]).catch(e => console.error('Logging error:', e));

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: result.content,
        provider: result.provider,
        model: result.model,
        mode: isAdmin ? 'admin' : 'customer_service',
        latency,
        healthScore: result.provider !== 'fallback' ? 100 : 0,
        routerVersion: ROUTER_VERSION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: "I encountered a brief glitch in my neural network. Please try again.",
        provider: 'error_handler',
        model: 'local',
        routerVersion: ROUTER_VERSION
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
