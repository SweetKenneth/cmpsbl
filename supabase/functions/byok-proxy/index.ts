/**
 * BYOK Proxy - Routes AI calls through developer's own API keys
 * Zero compute cost to substrate owner
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-developer-id, x-app-id',
};

interface BYOKRequest {
  provider: string;
  model: string;
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

// Provider endpoint mappings
const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  together: 'https://api.together.xyz/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cohere: 'https://api.cohere.ai/v1/chat',
  fireworks: 'https://api.fireworks.ai/inference/v1/chat/completions',
  hyperbolic: 'https://api.hyperbolic.xyz/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
};

// Simple XOR encryption (for demo - use proper encryption in production)
function decryptKey(encrypted: string, salt: string): string {
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const developerId = req.headers.get('x-developer-id');
    const appId = req.headers.get('x-app-id');
    
    if (!developerId || !appId) {
      return new Response(
        JSON.stringify({ error: 'Missing x-developer-id or x-app-id headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: BYOKRequest = await req.json();
    const { provider, model, messages, prompt, max_tokens = 1024, temperature = 0.7 } = body;

    if (!provider || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing provider or model' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get developer's API key
    const { data: keyData, error: keyError } = await supabase
      .from('substrate_developer_keys')
      .select('encrypted_key, rate_limit_rpm')
      .eq('developer_id', developerId)
      .eq('app_id', appId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ 
          error: `No API key configured for provider: ${provider}`,
          hint: 'Use substrate.keys.register() to add your API key'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt the API key
    const encryptionSalt = Deno.env.get('BYOK_ENCRYPTION_SALT') || developerId;
    const apiKey = decryptKey(keyData.encrypted_key, encryptionSalt);

    // Build request for provider
    const endpoint = PROVIDER_ENDPOINTS[provider];
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Unsupported provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format request based on provider
    let providerRequest: Record<string, unknown>;
    let headers: Record<string, string>;

    if (provider === 'anthropic') {
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      };
      providerRequest = {
        model,
        max_tokens,
        messages: messages || [{ role: 'user', content: prompt }],
      };
    } else if (provider === 'cohere') {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
      providerRequest = {
        model,
        message: prompt || messages?.[messages.length - 1]?.content,
        chat_history: messages?.slice(0, -1).map(m => ({
          role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
          message: m.content,
        })),
      };
    } else {
      // OpenAI-compatible format (Groq, Together, DeepSeek, Mistral, etc.)
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };
      providerRequest = {
        model,
        messages: messages || [{ role: 'user', content: prompt }],
        max_tokens,
        temperature,
      };
    }

    // Call the provider
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(providerRequest),
    });

    const result = await response.json();
    const latencyMs = Date.now() - startTime;

    // Extract token usage
    let tokensInput = 0;
    let tokensOutput = 0;

    if (result.usage) {
      tokensInput = result.usage.prompt_tokens || result.usage.input_tokens || 0;
      tokensOutput = result.usage.completion_tokens || result.usage.output_tokens || 0;
    }

    // Log usage to developer's meter
    const today = new Date().toISOString().split('T')[0];
    
    await supabase.from('substrate_usage_meters').upsert({
      developer_id: developerId,
      app_id: appId,
      provider,
      date: today,
      calls_count: 1,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      latency_avg_ms: latencyMs,
      errors_count: response.ok ? 0 : 1,
    }, {
      onConflict: 'developer_id,app_id,provider,date',
    });

    // Normalize response format
    let normalizedResponse;
    
    if (provider === 'anthropic') {
      normalizedResponse = {
        id: result.id,
        model: result.model,
        content: result.content?.[0]?.text,
        usage: {
          prompt_tokens: result.usage?.input_tokens,
          completion_tokens: result.usage?.output_tokens,
          total_tokens: (result.usage?.input_tokens || 0) + (result.usage?.output_tokens || 0),
        },
        latency_ms: latencyMs,
        provider,
        byok: true,
      };
    } else if (provider === 'cohere') {
      normalizedResponse = {
        id: result.generation_id,
        model,
        content: result.text,
        usage: {
          prompt_tokens: result.meta?.tokens?.input_tokens,
          completion_tokens: result.meta?.tokens?.output_tokens,
          total_tokens: (result.meta?.tokens?.input_tokens || 0) + (result.meta?.tokens?.output_tokens || 0),
        },
        latency_ms: latencyMs,
        provider,
        byok: true,
      };
    } else {
      normalizedResponse = {
        id: result.id,
        model: result.model,
        content: result.choices?.[0]?.message?.content,
        usage: result.usage,
        latency_ms: latencyMs,
        provider,
        byok: true,
      };
    }

    return new Response(
      JSON.stringify(normalizedResponse),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('BYOK Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
