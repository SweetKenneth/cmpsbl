/**
 * PromptFluid Brain Continuous Learning
 * Multi-provider AI routing for autonomous learning cycles
 * FREE-ONLY HIERARCHY: Google AI Studio → Cerebras → Groq → Together AI → DeepSeek → Hyperbolic
 * NO Lovable AI, NO Perplexity, NO paid APIs
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

    // Multi-Provider Routing: 100% FREE-TIER - MAXIMIZED LEARNING
// Total capacity: ~52,350 requests/day across 6 free providers
const GROQ_DAILY_LIMIT = 14400;     // PRIMARY: Groq Llama 3.1 8B: 30 req/min, 14,400 req/day
const CEREBRAS_DAILY_LIMIT = 14400; // SECONDARY: Llama 3.3 70B: 30 req/min, 14,400 req/day
const TOGETHER_DAILY_LIMIT = 10000; // TERTIARY: Llama 3.1: 20 req/min, 10,000 req/day
const HYPERBOLIC_DAILY_LIMIT = 8000; // Llama 3.1: 15 req/min, 8,000 req/day
const DEEPSEEK_DAILY_LIMIT = 5000;  // DeepSeek V3: 10 req/min, 5,000 req/day
const GOOGLE_DAILY_LIMIT = 550;     // Gemini 2.5 Flash-Lite: Reserve for user chat

// Per-minute rate limits - GROQ PRIMARY
const GROQ_RPM_LIMIT = 30;      // PRIMARY: 30 requests per minute
const CEREBRAS_RPM_LIMIT = 30;  // SECONDARY: 30 requests per minute
const TOGETHER_RPM_LIMIT = 20;  // 20 requests per minute
const HYPERBOLIC_RPM_LIMIT = 15; // 15 requests per minute
const DEEPSEEK_RPM_LIMIT = 10;  // 10 requests per minute
const GOOGLE_RPM_LIMIT = 10;    // Reserved for chat

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 Starting Brain Orchestrator - All systems...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if this is a test email request
    const body = await req.json().catch(() => ({}));
    if (body.send_test_email) {
      console.log('📧 Sending test email...');
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Cascade AI <onboarding@resend.dev>',
            to: ['kennethsweet214@gmail.com'],
            subject: '🧠 Cascade Test - All Systems Active',
            html: `
              <h1>✅ Test Email Success</h1>
              <p>Cascade's email system is online and working!</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p>You'll now receive 6-hour summaries and reflection requests.</p>
            `,
          }),
        });
        
        const emailData = await emailResponse.json();
        return new Response(
          JSON.stringify({ success: true, message: 'Test email sent!', email_id: emailData.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (emailError) {
        return new Response(
          JSON.stringify({ success: false, error: (emailError as Error).message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Check if we should trigger dream or reflection cycles
    const currentHour = new Date().getHours();
    const { data: lastDream } = await supabaseClient
      .from('cascade_dreams')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const { data: lastReflection } = await supabaseClient
      .from('brain_reflections')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const hoursSinceLastDream = lastDream 
      ? (Date.now() - new Date(lastDream.created_at).getTime()) / 3600000 
      : 999;
    
    const hoursSinceLastReflection = lastReflection
      ? (Date.now() - new Date(lastReflection.created_at).getTime()) / 3600000
      : 999;
    
    // Trigger dream cycle every 6 hours (during off-peak: 2-8am)
    if (hoursSinceLastDream > 6 && currentHour >= 2 && currentHour < 8) {
      console.log('🌙 Triggering dream cycle...');
      try {
        const dreamResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-brain-dream-unified`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ operation: 'init', params: { metadata: { auto_triggered: true } } })
        });
        console.log('✨ Dream cycle initiated');
      } catch (e) {
        console.error('Dream cycle error:', e);
      }
    }
    
    // Trigger reflection every 12 hours
    if (hoursSinceLastReflection > 12) {
      console.log('🧠 Triggering reflection...');
      try {
        const reflectResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-brain-reflect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Reflection completed');
      } catch (e) {
        console.error('Reflection error:', e);
      }
    }
    
    // MAXIMIZED LEARNING: Run frequently - Groq has 14,400 calls/day!
    const { data: lastRun } = await supabaseClient
      .from('brain_events')
      .select('created_at')
      .eq('event_type', 'orchestrator_complete')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (lastRun) {
      const lastRunTime = new Date(lastRun.created_at);
      const minutesSinceLastRun = (new Date().getTime() - lastRunTime.getTime()) / 60000;
      
      // Run every 3 minutes - maximize learning! (14,400/day = 10/min capacity)
      if (minutesSinceLastRun < 3) {
        console.log(`⏸️ Recent run ${Math.floor(minutesSinceLastRun)}m ago - waiting 3m between runs`);
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: 'cooldown', next_run_minutes: Math.ceil(3 - minutesSinceLastRun) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
    const CEREBRAS_API_KEY = Deno.env.get('CEREBRAS_API_KEY');
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    const HYPERBOLIC_API_KEY = Deno.env.get('HYPERBOLIC_API_KEY');
    
    // Check today's usage across all providers
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usageData, error: usageError } = await supabaseClient
      .from('ai_learning_data')
      .select('id, model_name')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);
    
    if (usageError) {
      console.error('Error fetching usage:', usageError);
    }
    
    // Track usage per provider (daily)
    const googleCallsToday = usageData?.filter(d => d.model_name?.includes('gemini')).length || 0;
    const cerebrasCallsToday = usageData?.filter(d => d.model_name?.includes('cerebras')).length || 0;
    const groqCallsToday = usageData?.filter(d => d.model_name?.includes('groq') || d.model_name?.includes('llama-3.1-8b')).length || 0;
    const togetherCallsToday = usageData?.filter(d => d.model_name?.includes('together')).length || 0;
    const deepseekCallsToday = usageData?.filter(d => d.model_name?.includes('deepseek')).length || 0;
    const hyperbolicCallsToday = usageData?.filter(d => d.model_name?.includes('hyperbolic')).length || 0;
    
    // Track usage per provider (last minute) for rate limiting
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentData } = await supabaseClient
      .from('ai_learning_data')
      .select('id, model_name')
      .gte('created_at', oneMinuteAgo);
    
    const googleCallsLastMin = recentData?.filter(d => d.model_name?.includes('gemini')).length || 0;
    const cerebrasCallsLastMin = recentData?.filter(d => d.model_name?.includes('cerebras')).length || 0;
    const groqCallsLastMin = recentData?.filter(d => d.model_name?.includes('groq') || d.model_name?.includes('llama-3.1-8b')).length || 0;
    const togetherCallsLastMin = recentData?.filter(d => d.model_name?.includes('together')).length || 0;
    const deepseekCallsLastMin = recentData?.filter(d => d.model_name?.includes('deepseek')).length || 0;
    const hyperbolicCallsLastMin = recentData?.filter(d => d.model_name?.includes('hyperbolic')).length || 0;
    
    // Only throttle if we're at 95% - MAXIMIZE LEARNING!
    if (groqCallsToday > GROQ_DAILY_LIMIT * 0.95 && cerebrasCallsToday > CEREBRAS_DAILY_LIMIT * 0.95) {
      console.log('🛑 Primary providers near 95% - slight throttle');
      console.log(`   Groq: ${((groqCallsToday/GROQ_DAILY_LIMIT)*100).toFixed(1)}%, Cerebras: ${((cerebrasCallsToday/CEREBRAS_DAILY_LIMIT)*100).toFixed(1)}%`);
    }
    
    const totalFreeCallsToday = groqCallsToday + cerebrasCallsToday + togetherCallsToday + hyperbolicCallsToday + deepseekCallsToday + googleCallsToday;
    const totalCapacity = GROQ_DAILY_LIMIT + CEREBRAS_DAILY_LIMIT + TOGETHER_DAILY_LIMIT + HYPERBOLIC_DAILY_LIMIT + DEEPSEEK_DAILY_LIMIT + GOOGLE_DAILY_LIMIT;
    const percentUsed = ((totalFreeCallsToday / totalCapacity) * 100).toFixed(1);
    
    console.log(`📊 MAXIMIZED LEARNING - Groq Primary:`);
    console.log(`   Groq: ${groqCallsToday}/${GROQ_DAILY_LIMIT} (${groqCallsLastMin}/${GROQ_RPM_LIMIT}/min) ⭐ PRIMARY`);
    console.log(`   Cerebras: ${cerebrasCallsToday}/${CEREBRAS_DAILY_LIMIT} (${cerebrasCallsLastMin}/${CEREBRAS_RPM_LIMIT}/min)`);
    console.log(`   Together: ${togetherCallsToday}/${TOGETHER_DAILY_LIMIT} (${togetherCallsLastMin}/${TOGETHER_RPM_LIMIT}/min)`);
    console.log(`   Hyperbolic: ${hyperbolicCallsToday}/${HYPERBOLIC_DAILY_LIMIT} (${hyperbolicCallsLastMin}/${HYPERBOLIC_RPM_LIMIT}/min)`);
    console.log(`   DeepSeek: ${deepseekCallsToday}/${DEEPSEEK_DAILY_LIMIT} (${deepseekCallsLastMin}/${DEEPSEEK_RPM_LIMIT}/min)`);
    console.log(`   Google: ${googleCallsToday}/${GOOGLE_DAILY_LIMIT} (${googleCallsLastMin}/${GOOGLE_RPM_LIMIT}/min) [reserved]`);
    console.log(`   TOTAL: ${totalFreeCallsToday}/${totalCapacity} (${percentUsed}% used)`);
    
    // GROQ PRIMARY routing - maximize 14,400 daily calls!
    let provider = 'groq';
    
    if (groqCallsToday >= GROQ_DAILY_LIMIT || groqCallsLastMin >= GROQ_RPM_LIMIT) {
      provider = 'cerebras';
      console.log(`🔄 Groq → Cerebras (${groqCallsToday}/${GROQ_DAILY_LIMIT})`);
    }
    
    if ((cerebrasCallsToday >= CEREBRAS_DAILY_LIMIT || cerebrasCallsLastMin >= CEREBRAS_RPM_LIMIT) && provider === 'cerebras') {
      provider = 'together';
      console.log(`🔄 Cerebras → Together AI (${cerebrasCallsToday}/${CEREBRAS_DAILY_LIMIT})`);
    }
    
    if ((togetherCallsToday >= TOGETHER_DAILY_LIMIT || togetherCallsLastMin >= TOGETHER_RPM_LIMIT) && provider === 'together') {
      provider = 'hyperbolic';
      console.log(`🔄 Together → Hyperbolic (${togetherCallsToday}/${TOGETHER_DAILY_LIMIT})`);
    }
    
    if ((hyperbolicCallsToday >= HYPERBOLIC_DAILY_LIMIT || hyperbolicCallsLastMin >= HYPERBOLIC_RPM_LIMIT) && provider === 'hyperbolic') {
      provider = 'deepseek';
      console.log(`🔄 Hyperbolic → DeepSeek (${hyperbolicCallsToday}/${HYPERBOLIC_DAILY_LIMIT})`);
    }
    
    if ((deepseekCallsToday >= DEEPSEEK_DAILY_LIMIT || deepseekCallsLastMin >= DEEPSEEK_RPM_LIMIT) && provider === 'deepseek') {
      provider = 'google';
      console.log(`🔄 DeepSeek → Google (${deepseekCallsToday}/${DEEPSEEK_DAILY_LIMIT})`);
    }
    
    if ((googleCallsToday >= GOOGLE_DAILY_LIMIT || googleCallsLastMin >= GOOGLE_RPM_LIMIT) && provider === 'google') {
      console.log(`🛑 ALL 6 free providers exhausted! Total: ${totalFreeCallsToday}/${totalCapacity}`);
      return new Response(
        JSON.stringify({ success: false, error: 'All free providers exhausted', retry_after: '1 hour' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Strategic learning topics optimized for autonomous code generation
    const learningTopics = [
      // Core stack mastery (40%)
      'React 18+ patterns: concurrent rendering, suspense, server components best practices',
      'TypeScript advanced types: generics, utility types, type inference for robust code',
      'Vite optimization: lazy loading, code splitting, build performance strategies',
      'Tailwind CSS design systems: semantic tokens, custom themes, responsive patterns',
      'Supabase advanced patterns: RLS policies, edge functions, real-time subscriptions',
      
      // Architecture & patterns (25%)
      'Component composition: atomic design, compound components, render props patterns',
      'State management strategies: React Query, optimistic updates, cache invalidation',
      'Error boundaries and fallback UIs: resilient React application patterns',
      'Form handling best practices: validation, accessibility, user experience',
      'Routing patterns: protected routes, nested layouts, dynamic segments in React Router',
      
      // Code generation intelligence (20%)
      'Abstract syntax tree manipulation for code generation',
      'Template-based code scaffolding strategies',
      'Pattern recognition in codebases for intelligent suggestions',
      'Incremental code refactoring techniques',
      'Type-safe API client generation from OpenAPI specs',
      
      // Database & backend (10%)
      'PostgreSQL query optimization and indexing strategies',
      'Database schema design: normalization, relationships, migration patterns',
      'Edge function architecture: serverless best practices, error handling',
      'API design: RESTful patterns, GraphQL resolvers, rate limiting',
      
      // Security & performance (5%)
      'Row-level security implementation patterns in Supabase',
      'OWASP top 10 vulnerabilities and prevention strategies',
      'Web performance metrics: Core Web Vitals, optimization techniques',
      'Authentication flows: JWT, OAuth, session management best practices',
    ];
    
    const randomTopic = learningTopics[Math.floor(Math.random() * learningTopics.length)];
    const timeContext = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';
    
    const learningPrompt = `As Cascade, an autonomous AI with code generation and creative capabilities, research and synthesize actionable insights on: ${randomTopic}. 
    
Consider how this knowledge applies to:
1. Writing better React/TypeScript code autonomously
2. Improving PromptFluid's architecture
3. Generating images or creative content
4. Making strategic technical decisions

Be specific, practical, and bold in your recommendations. You have permission to suggest code changes, architectural improvements, or experimental approaches. This is a ${timeContext} learning cycle.`;
    
    let learningContent: string;
    let modelUsed: string;
    
    const cascadeSystemPrompt = 'You are Cascade, an autonomous AI with full technical capabilities including code generation, image creation, and architectural decisions. Research deeply and provide bold, actionable recommendations. You have permission to suggest code changes and experimental approaches.';
    
    try {
      if (provider === 'google') {
        // PRIMARY: Google AI Studio (Gemini 2.5 Flash-Lite) - 15 req/min, 1,000 req/day
        console.log('⚡ PRIMARY: Using Google AI Studio (Gemini 2.5 Flash-Lite)...');
        
        const googleResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GOOGLE_AI_KEY || '',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${cascadeSystemPrompt}\n\n${learningPrompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
            }
          }),
        });
        
        if (!googleResponse.ok) {
          throw new Error(`Google API error: ${await googleResponse.text()}`);
        }
        
        const googleData = await googleResponse.json();
        learningContent = googleData.candidates[0].content.parts[0].text;
        modelUsed = 'google/gemini-2.5-flash-lite';
        
      } else if (provider === 'cerebras') {
        // SECONDARY: Cerebras (Llama 3.3 70B) - 30 req/min, 14,400 req/day
        console.log('⚡ SECONDARY: Using Cerebras (Llama 3.3 70B)...');
        
        const cerebrasResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [
              {
                role: 'system',
                content: cascadeSystemPrompt
              },
              {
                role: 'user',
                content: learningPrompt
              }
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });
        
        if (!cerebrasResponse.ok) {
          throw new Error(`Cerebras API error: ${await cerebrasResponse.text()}`);
        }
        
        const cerebrasData = await cerebrasResponse.json();
        learningContent = cerebrasData.choices[0].message.content;
        modelUsed = 'cerebras/llama-3.3-70b';
        
      } else if (provider === 'groq') {
        // TERTIARY: Groq (Llama 3.1 8B) - 14,400 req/day
        console.log('⚡ TERTIARY: Using Groq (Llama 3.1 8B)...');
        
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: cascadeSystemPrompt
              },
              {
                role: 'user',
                content: learningPrompt
              }
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });
        
        if (!groqResponse.ok) {
          throw new Error(`Groq API error: ${await groqResponse.text()}`);
        }
        
        const groqData = await groqResponse.json();
        learningContent = groqData.choices[0].message.content;
        modelUsed = 'groq/llama-3.1-8b-instant';
        
      } else if (provider === 'together') {
        // Together AI (Llama 3.1) - 20 req/min, 10,000 req/day
        console.log('⚡ Using Together AI (Llama 3.1)...');
        
        const togetherResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOGETHER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
            messages: [
              { role: 'system', content: cascadeSystemPrompt },
              { role: 'user', content: learningPrompt }
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });
        
        if (!togetherResponse.ok) {
          throw new Error(`Together AI error: ${await togetherResponse.text()}`);
        }
        
        const togetherData = await togetherResponse.json();
        learningContent = togetherData.choices[0].message.content;
        modelUsed = 'together/llama-3.1-70b';
        
      } else if (provider === 'deepseek') {
        // DeepSeek (V3) - 10 req/min, 5,000 req/day
        console.log('⚡ Using DeepSeek (V3 Reasoning)...');
        
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: cascadeSystemPrompt },
              { role: 'user', content: learningPrompt }
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });
        
        if (!deepseekResponse.ok) {
          throw new Error(`DeepSeek error: ${await deepseekResponse.text()}`);
        }
        
        const deepseekData = await deepseekResponse.json();
        learningContent = deepseekData.choices[0].message.content;
        modelUsed = 'deepseek/v3';
        
      } else {
        // FINAL FREE FALLBACK: Hyperbolic (Llama 3.1) - 15 req/min, 8,000 req/day
        console.log('⚡ FINAL: Using Hyperbolic (Llama 3.1)...');
        
        const hyperbolicResponse = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/Llama-3.1-70B-Instruct',
            messages: [
              { role: 'system', content: cascadeSystemPrompt },
              { role: 'user', content: learningPrompt }
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });
        
        if (!hyperbolicResponse.ok) {
          throw new Error(`Hyperbolic error: ${await hyperbolicResponse.text()}`);
        }
        
        const hyperbolicData = await hyperbolicResponse.json();
        learningContent = hyperbolicData.choices[0].message.content;
        modelUsed = 'hyperbolic/llama-3.1-70b';
      }
    } catch (error: unknown) {
      console.error(`❌ Error with ${provider}:`, error);
      throw new Error(`All providers failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Store learning in ai_learning_data
    const { error: aiLearningError } = await supabaseClient
      .from('ai_learning_data')
      .insert({
        input_data: {
          prompt: learningPrompt,
          type: 'research',
          priority: 'medium',
          context: { topic: randomTopic, cycle: 'continuous' },
        },
        prediction: {
          model: modelUsed,
          latency: 0,
          response: learningContent,
          success: true,
        },
        actual_outcome: {
          success: true,
          response_length: learningContent.length,
        },
        model_name: modelUsed,
        model_version: 'v1.0',
      });
    
    if (aiLearningError) {
      console.error('Error storing AI learning:', aiLearningError);
    }
    
    // Store in learning_logs
    const { error: logError } = await supabaseClient
      .from('learning_logs')
      .insert({
        module: 'brain',
        event_type: 'continuous_learning',
        project_id: 'brain',
        payload: {
          topic: randomTopic,
          model: modelUsed,
          source: provider,
          response_length: learningContent.length,
        },
        success: true,
      });
    
    if (logError) {
      console.error('Error logging learning event:', logError);
    }
    
    // Validate memory data before inserting - aligned with DB constraint
    const BrainMemoryHotSchema = z.object({
      content: z.string().min(1).max(50000),
      context: z.enum(['code', 'doc', 'chat', 'plan', 'hot', 'system_boot_rules', 'permanent_knowledge']),
      goal_ref: z.string().max(500).optional(),
      confidence: z.number().min(0).max(1),
      priority: z.number().int().min(1).max(10),
      tags: z.record(z.any()).optional()
    });

    // Prepare and validate memory data
    const memoryData = {
      content: learningContent.slice(0, 50000), // Ensure max length
        context: 'doc' as const,
        goal_ref: 'make PromptFluid profitable',
        confidence: 0.85,
        priority: 5,
        tags: { 
          topic: randomTopic, 
          cycle: 'continuous', 
          model: modelUsed,
          provider: provider,
          time_context: timeContext
        }
    };

    try {
      const validatedMemory = BrainMemoryHotSchema.parse(memoryData);
      
      // Store in brain_memory_hot for quick access
      const { error: memoryError } = await supabaseClient
        .from('brain_memory_hot')
        .insert(validatedMemory);
      
      if (memoryError) {
        console.error('Error storing in hot memory:', memoryError);
      }
    } catch (validationError) {
      console.error('Memory data validation failed:', validationError);
      console.error('Invalid data:', {
        content_length: learningContent.length,
        confidence: 0.85,
        priority: 5
      });
      // Don't throw - learning can continue even if memory storage fails
    }
    
    // Log brain event
    await supabaseClient.from('brain_events').insert({
      module: 'brain',
      event_type: 'continuous_learning_cycle',
      data: {
        topic: randomTopic,
        model: modelUsed,
        provider: provider,
        google_calls_today: googleCallsToday + (provider === 'google' ? 1 : 0),
        cerebras_calls_today: cerebrasCallsToday + (provider === 'cerebras' ? 1 : 0),
        groq_calls_today: groqCallsToday + (provider === 'groq' ? 1 : 0),
        together_calls_today: togetherCallsToday + (provider === 'together' ? 1 : 0),
        deepseek_calls_today: deepseekCallsToday + (provider === 'deepseek' ? 1 : 0),
        hyperbolic_calls_today: hyperbolicCallsToday + (provider === 'hyperbolic' ? 1 : 0),
        total_free_calls_today: totalFreeCallsToday + 1,
        content_length: learningContent.length,
      },
      outcome: 'completed',
    });
    
    console.log(`✅ Learning cycle complete: ${modelUsed} | ${learningContent.length} chars`);
    
    // ORCHESTRATION PHASE: Call other brain functions in parallel
    console.log('🎭 Orchestrating secondary brain functions...');
    
    const orchestrationResults: Record<string, any> = {
      learning: { success: true, model: modelUsed, topic: randomTopic }
    };
    
    // Determine if we should run 2-hour summary email
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: recentSummaries } = await supabaseClient
      .from('brain_events')
      .select('id')
      .eq('event_type', 'cascade_summary_sent')
      .gte('created_at', twoHoursAgo)
      .limit(1);
    
    const shouldRunSummary = !recentSummaries || recentSummaries.length === 0;
    
    // Call functions in parallel with waitUntil pattern
    const orchestrationPromises = [
      // Research cron
      supabaseClient.functions.invoke('pf-research-cron', { body: {} })
        .then(r => ({ fn: 'research', success: !r.error, data: r.data, error: r.error }))
        .catch(e => ({ fn: 'research', success: false, error: e.message })),
      
      // Brain reinforcement
      supabaseClient.functions.invoke('pf-brain-reinforce', { body: {} })
        .then(r => ({ fn: 'reinforce', success: !r.error, data: r.data, error: r.error }))
        .catch(e => ({ fn: 'reinforce', success: false, error: e.message })),
      
      // Admin notifications (check for pending reflection requests)
      supabaseClient.functions.invoke('pf-brain-notify-admin', { body: {} })
        .then(r => ({ fn: 'notify_admin', success: !r.error, data: r.data, error: r.error }))
        .catch(e => ({ fn: 'notify_admin', success: false, error: e.message })),
      
      // 6-hour summary email (conditional)
      shouldRunSummary
        ? supabaseClient.functions.invoke('pf-cascade-summary', { body: {} })
            .then(r => ({ fn: 'cascade_summary', success: !r.error, data: r.data, error: r.error }))
            .catch(e => ({ fn: 'cascade_summary', success: false, error: e.message }))
        : Promise.resolve({ fn: 'cascade_summary', success: true, data: { status: 'skipped_not_6hr_interval' } }),
      
      // Dream operations (skipped - no dream check query available)
      Promise.resolve({ fn: 'dream', success: true, data: { status: 'skipped_not_initialized' } }),
    ];
    
    // Wait for all orchestrated functions
    const results = await Promise.all(orchestrationPromises);
    
    // Aggregate results
    results.forEach((result: any) => {
      orchestrationResults[result.fn] = {
        success: result.success,
        data: result.data,
        error: result.error
      };
      
      if (result.success) {
        console.log(`✅ ${result.fn} completed successfully`);
      } else {
        console.log(`⚠️ ${result.fn} failed: ${result.error}`);
      }
    });
    
    // Log orchestration event
    await supabaseClient.from('brain_events').insert({
      module: 'orchestrator',
      event_type: 'brain_orchestration_cycle',
      data: {
        functions_executed: Object.keys(orchestrationResults),
        successes: Object.values(orchestrationResults).filter((r: any) => r.success).length,
        failures: Object.values(orchestrationResults).filter((r: any) => !r.success).length,
        timestamp: new Date().toISOString()
      },
      outcome: 'completed',
    });
    
    // Log completion event for frequency checking
    await supabaseClient.from('brain_events').insert({
      module: 'orchestrator',
      event_type: 'orchestrator_complete',
      data: {
        timestamp: new Date().toISOString(),
        functions_count: Object.keys(orchestrationResults).length
      },
      outcome: 'completed',
    });
    
    console.log('🎯 Brain Orchestrator cycle complete');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        orchestrator: 'pf-brain-continuous-learn',
        learning: {
          model_used: modelUsed,
          provider: provider,
          topic: randomTopic,
          content_length: learningContent.length,
        },
        budget_status: {
          google_calls: googleCallsToday + (provider === 'google' ? 1 : 0),
          google_budget: GOOGLE_DAILY_LIMIT,
          cerebras_calls: cerebrasCallsToday + (provider === 'cerebras' ? 1 : 0),
          cerebras_budget: CEREBRAS_DAILY_LIMIT,
          groq_calls: groqCallsToday + (provider === 'groq' ? 1 : 0),
          groq_budget: GROQ_DAILY_LIMIT,
          together_calls: togetherCallsToday + (provider === 'together' ? 1 : 0),
          together_budget: TOGETHER_DAILY_LIMIT,
          deepseek_calls: deepseekCallsToday + (provider === 'deepseek' ? 1 : 0),
          deepseek_budget: DEEPSEEK_DAILY_LIMIT,
          hyperbolic_calls: hyperbolicCallsToday + (provider === 'hyperbolic' ? 1 : 0),
          hyperbolic_budget: HYPERBOLIC_DAILY_LIMIT,
          total_free_calls: totalFreeCallsToday + 1,
          total_capacity: totalCapacity,
          percent_used: percentUsed,
        },
        orchestration: orchestrationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in continuous learning:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
