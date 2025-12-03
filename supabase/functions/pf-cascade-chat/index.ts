import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // Check today's free-tier usage to pick least-used provider
    const today = new Date().toISOString().split('T')[0];
    const { data: usageData } = await supabaseClient
      .from('ai_learning_data')
      .select('model_name')
      .gte('created_at', `${today}T00:00:00Z`);
    
    const googleCount = usageData?.filter(d => d.model_name?.includes('gemini')).length || 0;
    const cerebrasCount = usageData?.filter(d => d.model_name?.includes('cerebras')).length || 0;
    const groqCount = usageData?.filter(d => d.model_name?.includes('groq') || d.model_name?.includes('llama')).length || 0;
    const togetherCount = usageData?.filter(d => d.model_name?.includes('together')).length || 0;
    const deepseekCount = usageData?.filter(d => d.model_name?.includes('deepseek')).length || 0;
    const hyperbolicCount = usageData?.filter(d => d.model_name?.includes('hyperbolic')).length || 0;

    // Load balance across ALL free providers to maximize daily capacity
    const providers = [
      { name: 'google', count: googleCount, limit: 1500, priority: 1 },
      { name: 'cerebras', count: cerebrasCount, limit: 14400, priority: 1 },
      { name: 'groq', count: groqCount, limit: 14400, priority: 1 },
      { name: 'together', count: togetherCount, limit: 10000, priority: 2 },
      { name: 'deepseek', count: deepseekCount, limit: 5000, priority: 2 },
      { name: 'hyperbolic', count: hyperbolicCount, limit: 8000, priority: 3 }
    ].filter(p => p.count < p.limit * 0.85); // 85% threshold

    // Sort by priority then usage percentage
    providers.sort((a, b) => {
      const aPct = a.count / a.limit;
      const bPct = b.count / b.limit;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return aPct - bPct;
    });

    const selectedProvider = providers[0] || { name: 'google', count: 0 };
    
    console.log(`🎲 Using ${selectedProvider.name} (${selectedProvider.count} calls today, ${providers.length} providers available)`);

    let response;
    let modelUsed = '';

    try {
      if (selectedProvider.name === 'google') {
        const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GOOGLE_AI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
            generationConfig: { maxOutputTokens: 1024 }
          })
        });
        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        modelUsed = 'gemini-2.0-flash-lite';
        
        await supabaseClient.from('cascade_conversations').insert({
          user_email: userEmail || 'anonymous',
          message, reply, is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { model: modelUsed }
        });

        return new Response(JSON.stringify({ success: true, reply }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (selectedProvider.name === 'cerebras') {
        const CEREBRAS_API_KEY = Deno.env.get('CEREBRAS_API_KEY');
        response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
          })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        modelUsed = 'cerebras/llama-3.3-70b';

        await supabaseClient.from('cascade_conversations').insert({
          user_email: userEmail || 'anonymous',
          message, reply, is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { model: modelUsed }
        });

        return new Response(JSON.stringify({ success: true, reply }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (selectedProvider.name === 'together') {
        const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
        response = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
          })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        modelUsed = 'together/llama-3.1-8b';

        await supabaseClient.from('cascade_conversations').insert({
          user_email: userEmail || 'anonymous',
          message, reply, is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { model: modelUsed }
        });

        return new Response(JSON.stringify({ success: true, reply }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (selectedProvider.name === 'deepseek') {
        const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
          })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        modelUsed = 'deepseek/chat';

        await supabaseClient.from('cascade_conversations').insert({
          user_email: userEmail || 'anonymous',
          message, reply, is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { model: modelUsed }
        });

        return new Response(JSON.stringify({ success: true, reply }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (selectedProvider.name === 'hyperbolic') {
        const HYPERBOLIC_API_KEY = Deno.env.get('HYPERBOLIC_API_KEY');
        response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
          })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        modelUsed = 'hyperbolic/llama-3.1-8b';

        await supabaseClient.from('cascade_conversations').insert({
          user_email: userEmail || 'anonymous',
          message, reply, is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { model: modelUsed }
        });

        return new Response(JSON.stringify({ success: true, reply }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
          })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        modelUsed = 'groq/llama-3.1-8b';

        await supabaseClient.from('cascade_conversations').insert({
          user_email: userEmail || 'anonymous',
          message, reply, is_admin: isAdmin,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { model: modelUsed }
        });

        return new Response(JSON.stringify({ success: true, reply }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error(`❌ ${selectedProvider.name} failed:`, error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'AI_UNAVAILABLE',
          reply: "I'm briefly overloaded. Try again in a moment!"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ Chat error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        reply: "I encountered an error. Please try again."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
