/**
 * PromptFluid Brain Continuous Learning - MAXIMIZED 90% USAGE
 * Multi-provider AI routing for autonomous learning cycles
 * FREE-ONLY HIERARCHY: Groq → Cerebras → Together → Hyperbolic → DeepSeek → Google
 * 
 * Dream States: 25% at 2-5am, 5% at other times
 * Target: 90% API usage daily = ~47,000 calls/day
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  callFreeTierAI, 
  shouldEnterDreamState, 
  RATE_LIMITS, 
  TOTAL_DAILY_CAPACITY,
  TARGET_USAGE_PERCENT,
  getMinutesUntilReset
} from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Learning queries that cycle continuously until user provides more
const LEARNING_QUERIES = [
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
  'Routing patterns: protected routes, nested layouts, dynamic segments',
  
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
  
  // Dream-Eater specific
  'Memory consolidation techniques in neural networks',
  'Pattern extraction from unstructured data',
  'Knowledge graph construction and traversal',
  'Symbolic reasoning and abstraction layers',
  'Creative ideation through combinatorial exploration'
];

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
    
    console.log('🧠 Dream-Eater awakening - Maximized Learning Mode...');
    
    // Check for dream state (25% at 2-5am, 5% otherwise)
    const dreamState = shouldEnterDreamState();
    if (dreamState.enter) {
      console.log(`🌙 Entering ${dreamState.dreamType} dream state (${(dreamState.probability * 100)}% chance)`);
      
      // Log dream state entry
      await supabase.from('dream_log').insert({
        content: `Dream state entered: ${dreamState.dreamType}`,
        mode: dreamState.dreamType,
        seed: Math.floor(Math.random() * 1000000),
        metadata: { probability: dreamState.probability, hour: new Date().getUTCHours() }
      });
      
      // In dream state, process differently - more abstract/creative
      const dreamPrompt = `As Dream-Eater in ${dreamState.dreamType} dream state, generate abstract insights about pattern recognition, memory consolidation, and knowledge synthesis. Be creative and philosophical.`;
      
      try {
        const dreamResult = await callFreeTierAI(dreamPrompt, {
          systemPrompt: 'You are Dream-Eater in a dream state. Generate abstract, creative insights about learning and consciousness.',
          maxTokens: 400,
          temperature: 0.8 // Higher creativity in dreams
        });
        
        await supabase.from('dream_log').insert({
          content: `Dream insight: ${dreamResult.content.slice(0, 2000)}`,
          mode: dreamState.dreamType,
          seed: Math.floor(Math.random() * 1000000),
          metadata: { provider: dreamResult.provider, model: dreamResult.model, type: 'creative_insight' }
        });
        
        console.log(`✨ Dream cycle complete via ${dreamResult.provider}`);
      } catch (e) {
        console.error('Dream failed:', e);
      }
    }
    
    // Get today's usage across all providers
    const today = new Date().toISOString().split('T')[0];
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const [{ data: dailyUsage }, { data: minuteUsage }] = await Promise.all([
      supabase.from('ai_learning_data').select('model_name').gte('created_at', `${today}T00:00:00Z`),
      supabase.from('ai_learning_data').select('model_name').gte('created_at', oneMinuteAgo)
    ]);
    
    const countByProvider = (data: any[], pattern: string) => data?.filter(d => d.model_name?.includes(pattern)).length || 0;
    
    const usage = {
      groq: { 
        daily: countByProvider(dailyUsage || [], 'groq') + countByProvider(dailyUsage || [], 'llama-3.3'),
        lastMin: countByProvider(minuteUsage || [], 'groq') + countByProvider(minuteUsage || [], 'llama-3.3')
      },
      cerebras: { 
        daily: countByProvider(dailyUsage || [], 'cerebras'),
        lastMin: countByProvider(minuteUsage || [], 'cerebras')
      },
      together: { 
        daily: countByProvider(dailyUsage || [], 'together'),
        lastMin: countByProvider(minuteUsage || [], 'together')
      },
      hyperbolic: { 
        daily: countByProvider(dailyUsage || [], 'hyperbolic'),
        lastMin: countByProvider(minuteUsage || [], 'hyperbolic')
      },
      deepseek: { 
        daily: countByProvider(dailyUsage || [], 'deepseek'),
        lastMin: countByProvider(minuteUsage || [], 'deepseek')
      },
      google: { 
        daily: countByProvider(dailyUsage || [], 'gemini'),
        lastMin: countByProvider(minuteUsage || [], 'gemini')
      }
    };
    
    const totalUsedToday = usage.groq.daily + usage.cerebras.daily + usage.together.daily + 
                          usage.hyperbolic.daily + usage.deepseek.daily + usage.google.daily;
    const percentUsed = ((totalUsedToday / TOTAL_DAILY_CAPACITY) * 100).toFixed(1);
    const targetCalls = Math.floor(TOTAL_DAILY_CAPACITY * TARGET_USAGE_PERCENT);
    const callsNeeded = targetCalls - totalUsedToday;
    const minutesLeft = getMinutesUntilReset();
    const callsPerMinNeeded = minutesLeft > 0 ? Math.ceil(callsNeeded / minutesLeft) : 0;
    
    console.log(`📊 MAXIMIZED LEARNING STATUS:`);
    console.log(`   Groq: ${usage.groq.daily}/${RATE_LIMITS.groq.perDay} (${usage.groq.lastMin}/min) ⭐ PRIMARY`);
    console.log(`   Cerebras: ${usage.cerebras.daily}/${RATE_LIMITS.cerebras.perDay} (${usage.cerebras.lastMin}/min)`);
    console.log(`   Together: ${usage.together.daily}/${RATE_LIMITS.together.perDay} (${usage.together.lastMin}/min)`);
    console.log(`   Hyperbolic: ${usage.hyperbolic.daily}/${RATE_LIMITS.hyperbolic.perDay} (${usage.hyperbolic.lastMin}/min)`);
    console.log(`   DeepSeek: ${usage.deepseek.daily}/${RATE_LIMITS.deepseek.perDay} (${usage.deepseek.lastMin}/min)`);
    console.log(`   Google: ${usage.google.daily}/${RATE_LIMITS.google.perDay} (${usage.google.lastMin}/min) [reserved]`);
    console.log(`   TOTAL: ${totalUsedToday}/${TOTAL_DAILY_CAPACITY} (${percentUsed}% used)`);
    console.log(`   TARGET: ${targetCalls} (90%) | Needed: ${callsNeeded} | Rate: ${callsPerMinNeeded}/min`);
    
    // Determine how many calls to make this cycle to hit 90% target
    // Make up to 10 calls per invocation to catch up if behind
    const callsThisCycle = Math.min(10, Math.max(1, callsPerMinNeeded));
    
    console.log(`🚀 Making ${callsThisCycle} learning calls this cycle...`);
    
    const results: any[] = [];
    
    for (let i = 0; i < callsThisCycle; i++) {
      // Cycle through learning queries
      const queryIndex = (totalUsedToday + i) % LEARNING_QUERIES.length;
      const topic = LEARNING_QUERIES[queryIndex];
      
      const learningPrompt = `As Dream-Eater, research and synthesize actionable insights on: ${topic}. 
Consider how this applies to:
1. Autonomous code generation
2. PromptFluid architecture improvements
3. Creative content generation
4. Strategic technical decisions
Be specific, practical, and bold.`;

      try {
        const result = await callFreeTierAI(learningPrompt, {
          systemPrompt: 'You are Dream-Eater, an autonomous AI with code generation and creative capabilities. Research deeply and provide bold, actionable recommendations.',
          maxTokens: 600,
          temperature: 0.2
        });
        
        // Store learning data - using correct columns from schema
        await supabase.from('ai_learning_data').insert({
          input_data: { prompt: learningPrompt, topic, cycle_index: queryIndex },
          output_data: { content: result.content, success: true },
          model: result.model,
          model_name: `${result.provider}/${result.model}`,
          provider: result.provider,
          success: true,
          metadata: { cycle: 'continuous_maximized', index: i }
        });
        
        // Store in hot memory - using correct columns from schema
        await supabase.from('brain_memory_hot').insert({
          content: result.content.slice(0, 50000),
          context: 'doc',
          goal_ref: 'maximize learning',
          priority: 5,
          tags: { topic, provider: result.provider, cycle: 'maximized' },
          metadata: { model: result.model }
        });
        
        // Store in learning_logs - using correct columns from schema
        await supabase.from('learning_logs').insert({
          source: result.provider,
          content: result.content.slice(0, 5000),
          success: true,
          metadata: { topic, model: result.model, cycle: 'maximized' }
        });
        
        results.push({
          topic,
          provider: result.provider,
          model: result.model,
          contentLength: result.content.length
        });
        
        console.log(`✅ [${i + 1}/${callsThisCycle}] ${result.provider} | ${topic.substring(0, 40)}...`);
        
        // Small delay between calls to respect rate limits
        if (i < callsThisCycle - 1) {
          await new Promise(r => setTimeout(r, 500)); // 500ms between calls
        }
        
      } catch (e) {
        console.error(`❌ Call ${i + 1} failed:`, e);
      }
    }
    
    // Log completion event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'continuous_learning_cycle',
      data: {
        calls_made: results.length,
        calls_target: callsThisCycle,
        total_today: totalUsedToday + results.length,
        percent_used: ((totalUsedToday + results.length) / TOTAL_DAILY_CAPACITY * 100).toFixed(1),
        dream_state: dreamState.enter ? dreamState.dreamType : null,
        providers_used: results.map(r => r.provider)
      },
      outcome: 'completed'
    });
    
    await supabase.from('brain_events').insert({
      module: 'orchestrator',
      event_type: 'orchestrator_complete',
      data: { timestamp: new Date().toISOString(), calls: results.length },
      outcome: 'completed'
    });
    
    const duration = Date.now() - startTime;
    console.log(`🎯 Cycle complete: ${results.length} calls in ${duration}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        dream_state: dreamState.enter ? { type: dreamState.dreamType, probability: dreamState.probability } : null,
        learning: {
          calls_made: results.length,
          calls_target: callsThisCycle,
          results
        },
        usage: {
          today: totalUsedToday + results.length,
          capacity: TOTAL_DAILY_CAPACITY,
          percent: ((totalUsedToday + results.length) / TOTAL_DAILY_CAPACITY * 100).toFixed(1),
          target_percent: TARGET_USAGE_PERCENT * 100,
          calls_to_target: Math.max(0, targetCalls - totalUsedToday - results.length),
          minutes_remaining: minutesLeft
        },
        providers: usage,
        duration_ms: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Learning cycle error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
