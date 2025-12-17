import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_RECOGNITION_PHRASE = "Do you want a cat treat?";
const ADMIN_EMAIL = "kennethsweet214@gmail.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userEmail, conversationHistory, sessionId } = await req.json();
    console.log('💬 Cascade chat request');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Admin recognition
    if (message.trim() === ADMIN_RECOGNITION_PHRASE && userEmail === ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({
          success: true,
          reply: "Kenneth S recognized. Ready for technical discussion.",
          isAdmin: true,
          mode: 'admin'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = userEmail === ADMIN_EMAIL;
    const systemPrompt = isAdmin 
      ? `You are Cascade AI, speaking with Kenneth Sweet (founder). Be direct, technical, collaborative. You know PromptFluid products. Keep responses concise with strategic emojis.`
      : `You are Cascade AI for PromptFluid. Help users with our products: Defense, Brain, Studio, Ripple, Access, Vision. Be friendly and concise.`;

    // Build the full prompt with conversation history
    let fullPrompt = message;
    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory
        .slice(-6) // Last 6 messages for context
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      fullPrompt = `Previous conversation:\n${historyText}\n\nUser: ${message}`;
    }

    console.log('🔄 Routing to free-tier AI providers...');

    // Use the shared free-tier router with full fallback chain
    const result = await callFreeTierAI(fullPrompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1024
    });

    console.log(`✅ Response from ${result.provider}/${result.model}`);

    // Log to database
    await supabaseClient.from('cascade_conversations').insert({
      user_email: userEmail || 'anonymous',
      message,
      reply: result.content,
      is_admin: isAdmin,
      session_id: sessionId || `session_${Date.now()}`,
      metadata: { model: result.model, provider: result.provider }
    });

    // Also log to ai_learning_data for usage tracking
    await supabaseClient.from('ai_learning_data').insert({
      provider: result.provider,
      model: result.model,
      model_name: `${result.provider}/${result.model}`,
      input_data: { prompt: message },
      output_data: { response: result.content.substring(0, 500) },
      success: true
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: result.content,
        provider: result.provider,
        model: result.model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Chat error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        reply: "All AI providers are currently busy. Please try again in a moment."
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
