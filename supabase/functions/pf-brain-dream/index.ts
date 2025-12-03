/**
 * Cascade v4.0.0 - Dream Cycles
 * Creative sandbox for experimental thinking with budget controls
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DREAM_BUDGET_USD = 0.50; // Max $0.50 per dream session
const DREAM_PROMPTS = [
  "What emerging AI patterns could disrupt cybersecurity in the next 6 months?",
  "How might PromptFluid modules collaborate to create unexpected value?",
  "What unconventional data sources could enhance our threat intelligence?",
  "Design a futuristic feature for PromptFluid that doesn't exist yet"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('💭 Starting dream cycle...');

    // Select random dream prompt
    const seedPrompt = DREAM_PROMPTS[Math.floor(Math.random() * DREAM_PROMPTS.length)];

    // Use OpenAI (primary) → Free models (fallback)
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const CEREBRAS_API_KEY = Deno.env.get("CEREBRAS_API_KEY");
    
    let response;
    let dreamOutput = '';
    let estimatedCost = 0;
    let provider = 'openai';

    try {
      // Try OpenAI first (GPT-5 Nano for speed)
      console.log('💭 Using OpenAI GPT-5 Nano for dream cycle...');
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5-nano-2025-08-07",
          messages: [
            {
              role: "system",
              content: "You are Cascade's creative dreaming mode. Generate innovative, boundary-pushing ideas. Be bold and experimental."
            },
            {
              role: "user",
              content: seedPrompt
            }
          ],
          max_completion_tokens: 800
        }),
      });

      if (!response.ok) throw new Error('OpenAI failed');
      
      const data = await response.json();
      dreamOutput = data.choices?.[0]?.message?.content || '';
      // GPT-5 Nano cost: ~$0.04/1M input, ~$0.16/1M output tokens
      const inputTokens = data.usage?.prompt_tokens || 50;
      const outputTokens = data.usage?.completion_tokens || 800;
      estimatedCost = (inputTokens * 0.00000004) + (outputTokens * 0.00000016);
      
    } catch (openaiError) {
      console.log('⚠️ OpenAI failed, trying free providers...');
      
      try {
        // Fallback to Groq (free tier)
        console.log('💭 Using Groq (free tier)...');
        provider = 'groq';
        
        response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "You are Cascade's creative dreaming mode. Generate innovative, boundary-pushing ideas. Be bold and experimental."
              },
              {
                role: "user",
                content: seedPrompt
              }
            ],
            max_tokens: 800
          }),
        });

        if (!response.ok) throw new Error('Groq failed');
        
        const data = await response.json();
        dreamOutput = data.choices?.[0]?.message?.content || '';
        estimatedCost = 0; // Free tier
        
      } catch (groqError) {
        // Final fallback to Cerebras (free tier)
        console.log('⚠️ Groq failed, using Cerebras (free tier)...');
        provider = 'cerebras';
        
        response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CEREBRAS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama3.1-8b",
            messages: [
              {
                role: "system",
                content: "You are Cascade's creative dreaming mode. Generate innovative, boundary-pushing ideas. Be bold and experimental."
              },
              {
                role: "user",
                content: seedPrompt
              }
            ],
            max_tokens: 800
          }),
        });

        if (!response.ok) {
          throw new Error(`All providers failed`);
        }

        const data = await response.json();
        dreamOutput = data.choices?.[0]?.message?.content || '';
        estimatedCost = 0; // Free tier
      }
    }

    // Auto-tag based on content
    const tags = [];
    if (dreamOutput.toLowerCase().includes('security')) tags.push('security');
    if (dreamOutput.toLowerCase().includes('ai')) tags.push('ai');
    if (dreamOutput.toLowerCase().includes('user')) tags.push('ux');
    if (dreamOutput.toLowerCase().includes('data')) tags.push('data');
    if (tags.length === 0) tags.push('general');

    // Store dream session
    const { data: session, error } = await sb
      .from('dream_sessions')
      .insert({
        seed_prompt: seedPrompt,
        outputs_json: [{ content: dreamOutput, timestamp: new Date().toISOString() }],
        tags,
        budget_used_usd: estimatedCost
      })
      .select()
      .single();

    if (error) throw error;

    // Log to brain events
    await sb.from('brain_events').insert({
      event_type: 'dream_cycle_complete',
      module: 'dream_engine',
      data: {
        session_id: session.id,
        tags,
        cost: estimatedCost,
        provider,
        seed: seedPrompt.substring(0, 50)
      },
      outcome: 'completed'
    });

    console.log(`✅ Dream session created: ${session.id}`);

    return new Response(
      JSON.stringify({
        ok: true,
        session_id: session.id,
        tags,
        cost: estimatedCost,
        output_preview: dreamOutput.substring(0, 200)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Dream cycle error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
