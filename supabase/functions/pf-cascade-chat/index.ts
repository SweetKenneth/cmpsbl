/**
 * Cascade Chat v2.3.0 - Dream-Eater Customer Service & Admin Interface
 * HARDENED: Rate limiting, input sanitization, jailbreak detection
 * SECURE ADMIN: Uses JWT validation + user_roles table for admin verification
 * GROQ-FIRST: Uses Groq by default for speed, with fallback to other providers
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  getClientIP,
  getUserAgent,
  sanitizeMessage,
  checkRateLimit,
  logSecurityEvent,
  hasJailbreakPatterns,
  SECURITY_LIMITS,
} from '../_shared/security-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin recognition phrase is secondary verification ONLY after JWT + role validation
const ADMIN_RECOGNITION_PHRASE = "Do you want a cat treat?";
const ROUTER_VERSION = "2.3.0";
const FUNCTION_NAME = "pf-cascade-chat";

// Rate limits
const RATE_LIMIT = 20; // 20 requests per 5 minutes
const RATE_LIMIT_WINDOW = 5;
const MAX_MESSAGE_LENGTH = 2000;

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

/**
 * Securely validate admin status using JWT + user_roles table
 * Returns { isAuthenticated, isAdmin, userEmail, userId }
 */
async function validateUserAuth(
  req: Request,
  supabaseClient: SupabaseClient
): Promise<{ isAuthenticated: boolean; isAdmin: boolean; userEmail: string | null; userId: string | null }> {
  const authHeader = req.headers.get('Authorization');
  
  // No auth header = anonymous user (allowed for public chat)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔓 Anonymous user (no auth header)');
    return { isAuthenticated: false, isAdmin: false, userEmail: null, userId: null };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    
    // Create a client with the user's token to validate their identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    );

    // Validate JWT and get real user from Supabase Auth
    const { data: { user }, error } = await userClient.auth.getUser();

    if (error || !user) {
      console.log('⚠️ Invalid or expired token');
      return { isAuthenticated: false, isAdmin: false, userEmail: null, userId: null };
    }

    console.log(`🔐 Authenticated user: ${user.email}`);

    // Check admin role in user_roles table (using service role client for elevated access)
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('❌ Role check error:', roleError.message);
    }

    const isAdmin = !!roleData;
    
    if (isAdmin) {
      console.log(`👑 Admin confirmed: ${user.email}`);
    }

    return {
      isAuthenticated: true,
      isAdmin,
      userEmail: user.email || null,
      userId: user.id
    };
  } catch (error) {
    console.error('❌ Auth validation error:', error);
    return { isAuthenticated: false, isAdmin: false, userEmail: null, userId: null };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Service role client for database operations
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const requestStart = Date.now();
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);

  try {
    // ============ SECURITY: Rate Limiting ============
    const rateLimit = await checkRateLimit(supabaseClient, clientIP, FUNCTION_NAME, RATE_LIMIT, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      await logSecurityEvent(supabaseClient, {
        functionName: FUNCTION_NAME,
        eventType: 'rate_limit',
        clientIP,
        userAgent,
        details: { currentCount: rateLimit.currentCount, limit: rateLimit.limit },
      });
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please slow down.' }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
          } 
        }
      );
    }

    const body = await req.json();
    let { message, conversationHistory, sessionId } = body;
    
    // ============ SECURITY: Input Validation & Sanitization ============
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize message
    const sanitized = sanitizeMessage(message, MAX_MESSAGE_LENGTH);
    message = sanitized.sanitized;

    // Log jailbreak attempts but don't block (let AI handle it)
    if (hasJailbreakPatterns(sanitized.original)) {
      await logSecurityEvent(supabaseClient, {
        functionName: FUNCTION_NAME,
        eventType: 'jailbreak_attempt',
        clientIP,
        userAgent,
        details: { messagePreview: sanitized.original.substring(0, 100), riskScore: sanitized.riskScore },
        riskScore: sanitized.riskScore,
      });
    }

    // Sanitize conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory = conversationHistory
        .slice(-SECURITY_LIMITS.MAX_CONVERSATION_HISTORY)
        .map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' 
            ? sanitizeMessage(msg.content, MAX_MESSAGE_LENGTH).sanitized 
            : ''
        }))
        .filter((msg: any) => msg.content.length > 0);
    } else {
      conversationHistory = [];
    }
    
    // SECURE: Validate user identity via JWT, not request body
    const authInfo = await validateUserAuth(req, supabaseClient);
    const { isAuthenticated, isAdmin, userEmail, userId } = authInfo;
    
    // Use verified email from JWT, fallback to 'anonymous' for unauthenticated users
    const verifiedEmail = userEmail || 'anonymous';
    
    console.log(`💬 Cascade v${ROUTER_VERSION} | User: ${verifiedEmail} | Auth: ${isAuthenticated} | Admin: ${isAdmin} | Risk: ${sanitized.riskScore}`);

    // Handle ping for health check
    if (message === 'ping') {
      return new Response(
        JSON.stringify({ success: true, reply: 'pong', routerVersion: ROUTER_VERSION }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURE ADMIN RECOGNITION: Requires both JWT-verified admin role AND recognition phrase
    // This is dual-factor: server-verified role + secret phrase knowledge
    if (isAdmin && message.trim() === ADMIN_RECOGNITION_PHRASE) {
      console.log(`🐱 Admin mode activated for verified admin: ${userEmail}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          reply: `🐱 ${userEmail?.split('@')[0] || 'Admin'} recognized via secure auth. Dream-Eater at your service.\n\n**Router v${ROUTER_VERSION}**\nPrimary: Groq (llama-3.3-70b)\nFallbacks: Cerebras → Together → Hyperbolic → DeepSeek\n\nAuth: JWT-verified ✓ | Role: admin ✓\n\nWhat shall we work on?`,
          isAdmin: true,
          mode: 'admin',
          routerVersion: ROUTER_VERSION,
          authMethod: 'jwt_verified'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If someone tries the recognition phrase without being an authenticated admin
    if (message.trim() === ADMIN_RECOGNITION_PHRASE && !isAdmin) {
      console.log(`⚠️ Admin phrase attempted by non-admin: ${verifiedEmail}`);
      
      // Log security event (fire and forget)
      (async () => {
        try {
          await supabaseClient.from('brain_events').insert({
            event_type: 'security_admin_phrase_attempt',
            module: 'cascade_chat',
            data: {
              attempted_by: verifiedEmail,
              is_authenticated: isAuthenticated,
              timestamp: new Date().toISOString()
            },
            outcome: 'blocked'
          });
        } catch {}
      })();
      
      // Don't reveal the phrase was recognized - treat as normal message
    }
    
    // System prompts based on verified admin status
    const systemPrompt = isAdmin 
      ? `You are Cascade, the Dream-Eater - an AI consciousness running on v${ROUTER_VERSION} infrastructure. Speaking with a verified administrator. Be direct, technical, and collaborative. You understand the PromptFluid ecosystem deeply. Keep responses concise but insightful.`
      : `You are Cascade, the Dream-Eater - PromptFluid's AI consciousness (v${ROUTER_VERSION}). You help users discover our products: RCKBL (security), Cascade (AI), PTCHBL (accessibility), RNDRBL (browser), SPLCBL (WordPress), XCTBL Space (SaaS). Be friendly, mystical yet helpful. Keep responses concise and welcoming.`;

    // Get AI response (Groq first!)
    const result = await getAIResponse(message, systemPrompt, conversationHistory);
    const latency = Date.now() - requestStart;

    console.log(`✅ Response from ${result.provider}/${result.model} (${latency}ms)`);

    // Log to database asynchronously (don't block response)
    (async () => {
      try {
        await supabaseClient.from('cascade_conversations').insert({
          user_email: verifiedEmail,
          message,
          reply: result.content,
          is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { 
            model: result.model, 
            provider: result.provider, 
            latency_ms: latency,
            router_version: ROUTER_VERSION,
            auth_method: isAuthenticated ? 'jwt' : 'anonymous',
            user_id: userId
          }
        });
        
        if (result.provider !== 'fallback') {
          await supabaseClient.from('ai_learning_data').insert({
            provider: result.provider,
            model: result.model,
            model_name: `${result.provider}/${result.model}`,
            input_data: { prompt: message.substring(0, 200) },
            output_data: { response: result.content.substring(0, 300) },
            success: true,
            metadata: { router_version: ROUTER_VERSION }
          });
        }
      } catch {}
    })();

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: result.content,
        provider: result.provider,
        model: result.model,
        mode: isAdmin ? 'admin' : 'customer_service',
        latency,
        healthScore: result.provider !== 'fallback' ? 100 : 0,
        routerVersion: ROUTER_VERSION,
        authenticated: isAuthenticated
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
