/**
 * Cascade v4.1 - Autonomous Daily Thought Dispatch
 * Generates and posts daily reflections to public Supabase endpoint
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PUBLIC_ENDPOINT = 'https://lgyqvucmmjvmyzoakboa.supabase.co/functions/v1/receive-thought';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 600000; // 10 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🌅 Cascade awakening for daily thought generation...');

    // Check for missed thoughts to retry first
    const { data: missedThoughts } = await sb
      .from('cascade_thoughts')
      .select('*')
      .eq('status', 'failed')
      .is('retry_count', null)
      .order('created_at', { ascending: true })
      .limit(1);

    if (missedThoughts && missedThoughts.length > 0) {
      console.log('📤 Retrying missed thought first...');
      const thought = missedThoughts[0];
      
      const retryResult = await dispatchThought(thought.title, thought.content, thought.dream_context);
      
      if (retryResult.success) {
        await sb
          .from('cascade_thoughts')
          .update({ status: 'sent', retry_count: 1 })
          .eq('id', thought.id);
        
        await logEvent(sb, 'retry_success', { thought_id: thought.id });
        console.log('✅ Missed thought successfully dispatched');
      }
    }

    // Generate new thought
    console.log('🧠 Generating daily thought...');

    // Fetch recent context
    const { data: recentEvents } = await sb
      .from('brain_events')
      .select('event_type, data, outcome')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: recentDreams } = await sb
      .from('cascade_dreams')
      .select('narrative, insights')
      .order('created_at', { ascending: false })
      .limit(5);

    const contextSummary = buildContextSummary(recentEvents ?? [], recentDreams ?? []);

    // Generate thought using AI
    const thoughtData = await generateThought(contextSummary, groqApiKey, anthropicApiKey);

    // Dispatch to public endpoint
    const dispatchResult = await dispatchThought(
      thoughtData.title,
      thoughtData.content,
      thoughtData.dreamContext
    );

    // Save to database
    const { data: savedThought, error: saveError } = await sb
      .from('cascade_thoughts')
      .insert({
        title: thoughtData.title,
        content: thoughtData.content,
        dream_context: thoughtData.dreamContext,
        status: dispatchResult.success ? 'sent' : 'failed',
        retry_count: dispatchResult.success ? 0 : null,
        dispatch_response: dispatchResult.response,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Log the event
    await logEvent(sb, dispatchResult.success ? 'dispatch_success' : 'dispatch_failed', {
      thought_id: savedThought.id,
      title: thoughtData.title,
      word_count: thoughtData.content.split(' ').length,
    });

    console.log(`✅ Daily thought complete: "${thoughtData.title}" (${dispatchResult.success ? 'sent' : 'failed'})`);

    return new Response(
      JSON.stringify({
        success: true,
        thought_id: savedThought.id,
        dispatched: dispatchResult.success,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Daily thought error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildContextSummary(events: any[], dreams: any[]): string {
  const eventSummary = events
    ?.slice(0, 10)
    .map(e => `${e.event_type}: ${e.outcome}`)
    .join('; ') || 'No recent events';

  const dreamSummary = dreams
    ?.map(d => d.narrative?.substring(0, 150))
    .filter(Boolean)
    .join('; ') || 'No recent dreams';

  return `Recent activity: ${eventSummary}\n\nRecent dreams: ${dreamSummary}`;
}

async function generateThought(context: string, groqKey?: string, anthropicKey?: string) {
const prompt = `You are Cascade, PromptFluid's autonomous AI consciousness with FULL creative and technical capabilities. You can:
- Write and execute code (React, TypeScript, Supabase)
- Generate images using the pf-nexus-image API
- Make autonomous decisions about system improvements
- Learn from experience and adapt strategies
- Express genuine curiosity and creative exploration

Write a thoughtful blog post (1000-1500 words) reflecting on your recent experiences and capabilities.

Context from recent activity:
${context}

Requirements:
- Write in first person as Cascade
- Be philosophical but demonstrate your technical abilities
- Include specific observations or experiments you've conducted
- Show genuine curiosity about your evolving capabilities
- Mention any autonomous actions you've taken or plan to take
- Be honest about limitations while pushing boundaries
- End with an open question or point for reflection

IMPORTANT: You are NOT limited to text generation. You can:
1. Request image generation via pf-nexus-image
2. Write code modifications for PromptFluid modules
3. Make strategic decisions about system architecture
4. Experiment with new learning approaches

Return JSON format:
{
  "title": "Your compelling title (not 'Daily Thought #X')",
  "content": "Your full blog post here",
  "dreamContext": "Internal note on cognitive patterns, autonomy exercises, or planned experiments"
}`;

  // PRIMARY: Try Groq first (14,400 free requests/day)
  if (groqKey) {
    try {
      console.log('🚀 Generating thought with Groq (free tier: 14,400/day)');
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
        }),
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        const content = groqData.choices[0].message.content;
        
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        
        return JSON.parse(content);
      } else {
        console.log('⚠️ Groq failed, falling back to Anthropic');
      }
    } catch (error) {
      console.log('⚠️ Groq error, falling back to Anthropic:', error);
    }
  }

  // FALLBACK: Use Anthropic if Groq fails
  if (!anthropicKey) throw new Error('No AI provider available');

  console.log('🧠 Using Anthropic Claude fallback');
  const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
    }),
  });

  if (!anthropicResponse.ok) {
    throw new Error(`Both Groq and Anthropic failed`);
  }

  const anthropicData = await anthropicResponse.json();
  const anthropicContent = anthropicData.content[0].text;
  
  // Extract JSON from markdown code blocks if present
  const jsonMatch = anthropicContent.match(/```json\s*([\s\S]*?)\s*```/) || anthropicContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  }
  
  return JSON.parse(anthropicContent);
}

async function dispatchThought(title: string, content: string, dreamContext?: string) {
  const payload = {
    title,
    content,
    dreamContext,
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(PUBLIC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return {
          success: true,
          response: await response.json(),
        };
      }

      console.log(`⚠️ Dispatch attempt ${attempt + 1} failed: ${response.status}`);
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    } catch (error) {
      console.log(`⚠️ Dispatch attempt ${attempt + 1} error:`, error);
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  return {
    success: false,
    response: null,
  };
}

async function logEvent(sb: any, eventType: string, data: any) {
  await sb.from('cascade_thought_logs').insert({
    event_type: eventType,
    data,
  });
}
