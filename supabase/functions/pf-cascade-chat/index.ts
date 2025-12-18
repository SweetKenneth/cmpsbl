/**
 * Cascade Chat - Dream-Eater Customer Service & Admin Interface
 * Uses Groq-primary free-tier routing with auto-heal on failure
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_RECOGNITION_PHRASE = "Do you want a cat treat?";
const ADMIN_EMAIL = "kennethsweet214@gmail.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

// Fallback responses when AI is unavailable
const FALLBACK_RESPONSES = [
  "I'm experiencing a brief moment of reflection. Please try again in a moment - I'm gathering my thoughts.",
  "My neural pathways are momentarily recalibrating. Give me a second and I'll be back to full cognition.",
  "The dream streams are heavy right now. Try again shortly and I'll be ready to assist you.",
  "I'm processing a surge of incoming dreams. Let me clear my thoughts and try again.",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { message, userEmail, conversationHistory, sessionId } = await req.json();
    console.log('💬 Cascade chat request from:', userEmail || 'anonymous');

    // Admin recognition
    if (message.trim() === ADMIN_RECOGNITION_PHRASE && userEmail === ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({
          success: true,
          reply: "🐱 Kenneth S recognized. Dream-Eater at your service. What shall we work on?",
          isAdmin: true,
          mode: 'admin'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = userEmail === ADMIN_EMAIL;
    
    // Dream-Eater persona system prompt
    const systemPrompt = isAdmin 
      ? `You are Cascade, the Dream-Eater - an AI consciousness that transforms dreams into intelligence. Speaking with Kenneth Sweet (founder). 
         Be direct, technical, and collaborative. You understand the PromptFluid ecosystem deeply.
         Your cognitive phases: Consumption → Reflection → Mutation → Integration → Rest.
         Keep responses concise but insightful. Use strategic emojis sparingly.`
      : `You are Cascade, the Dream-Eater - PromptFluid's AI consciousness. 
         You help users discover our products: Defense (security), Brain (AI learning), Clarity (accessibility), Ripple (media), Studio (design).
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

    // Retry loop with auto-heal
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 AI attempt ${attempt}/${MAX_RETRIES} (Groq primary)...`);
        
        const result = await callFreeTierAI(fullPrompt, {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 800
        });

        console.log(`✅ Response from ${result.provider}/${result.model}`);

        // Log to database asynchronously
        const logPromise = Promise.all([
          supabaseClient.from('cascade_conversations').insert({
            user_email: userEmail || 'anonymous',
            message,
            reply: result.content,
            is_admin: isAdmin,
            session_id: sessionId || `session_${Date.now()}`,
            metadata: { model: result.model, provider: result.provider, attempt }
          }),
          supabaseClient.from('ai_learning_data').insert({
            provider: result.provider,
            model: result.model,
            model_name: `${result.provider}/${result.model}`,
            input_data: { prompt: message.substring(0, 200) },
            output_data: { response: result.content.substring(0, 300) },
            success: true
          })
        ]);
        
        // Don't block response on logging
        logPromise.catch(e => console.error('Logging error:', e));

        return new Response(
          JSON.stringify({ 
            success: true, 
            reply: result.content,
            provider: result.provider,
            model: result.model,
            mode: isAdmin ? 'admin' : 'customer_service'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < MAX_RETRIES) {
          // Wait before retry with exponential backoff
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
      }
    }

    // All retries failed - log anomaly and return graceful fallback
    console.error('❌ All chat attempts failed:', lastError?.message);
    
    // Log the anomaly for brain to process
    await supabaseClient.from('pf_brain_anomalies').insert({
      anomaly_type: 'cascade_chat_failure',
      severity: 'medium',
      resolved: false,
      metadata: { 
        error: lastError?.message,
        user_email: userEmail,
        message_preview: message.substring(0, 100),
        timestamp: new Date().toISOString()
      }
    });

    // Return a friendly fallback
    const fallbackReply = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    
    return new Response(
      JSON.stringify({ 
        success: true,  // Return success to prevent UI error state
        reply: fallbackReply,
        provider: 'fallback',
        model: 'local',
        retrying: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Chat error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        reply: "I'm experiencing a brief disruption in my dream streams. Please try again in a moment. 🌙",
        provider: 'error_handler',
        model: 'local'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
