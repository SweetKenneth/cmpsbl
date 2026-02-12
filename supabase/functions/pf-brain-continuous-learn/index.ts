/**
 * SUBSTRATE CONTINUOUS LEARNING v3.0.0
 * Technical Mastery Engine — Per-Module Job-Specific Learning
 * 
 * BRAIN + ENCODED get 80% of learning budget (coding/architecture)
 * All other modules get 20% (job-specific improvement)
 * Results are stored as module-tagged brain_events for Decode to report on.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  callFreeTierAI, 
  shouldEnterDreamState, 
  TOTAL_DAILY_CAPACITY,
  TARGET_USAGE_PERCENT,
  getMinutesUntilReset
} from "../_shared/free-tier-router.ts";
import {
  DOCTRINE,
  ALL_MODULES,
  PRIORITY_MODULES,
  getRandomModuleQuery,
  buildModuleLearningPrompt,
  buildModuleSystemPrompt,
} from "../_shared/cascade-doctrine.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LEARNER_VERSION = '3.0.0';

// Allocate calls per cycle across modules
// 80% to BRAIN+ENCODED, 20% spread across remaining 12 modules
function allocateCalls(totalCalls: number): { module: string; count: number }[] {
  const priorityBudget = Math.max(2, Math.ceil(totalCalls * 0.8));
  const otherBudget = Math.max(1, totalCalls - priorityBudget);
  
  const allocation: { module: string; count: number }[] = [];
  
  // Split priority budget between brain and encoded
  const brainCalls = Math.ceil(priorityBudget / 2);
  const encodedCalls = priorityBudget - brainCalls;
  allocation.push({ module: 'brain', count: brainCalls });
  allocation.push({ module: 'encoded', count: encodedCalls });
  
  // Rotate through other modules — pick a subset each cycle
  const otherModules = ALL_MODULES.filter(m => !PRIORITY_MODULES.includes(m));
  // Pick 2-3 random modules each cycle to spread learning
  const shuffled = otherModules.sort(() => Math.random() - 0.5);
  const selectedOthers = shuffled.slice(0, Math.min(3, otherBudget));
  
  const perOther = Math.max(1, Math.floor(otherBudget / selectedOthers.length));
  for (const mod of selectedOthers) {
    allocation.push({ module: mod, count: perOther });
  }
  
  return allocation;
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
    
    console.log(`🧠 Substrate Technical Learning v${LEARNER_VERSION}`);
    console.log(`   Mode: ${DOCTRINE.mode}`);
    console.log(`   Focus: BRAIN+ENCODED 80% | Other modules 20%`);
    
    // Get usage stats
    const today = new Date().toISOString().split('T')[0];
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const [{ data: dailyUsage }, { data: minuteUsage }] = await Promise.all([
      supabase.from('ai_learning_data').select('model_name').gte('created_at', `${today}T00:00:00Z`),
      supabase.from('ai_learning_data').select('model_name').gte('created_at', oneMinuteAgo)
    ]);
    
    const totalUsedToday = dailyUsage?.length || 0;
    const percentUsed = ((totalUsedToday / TOTAL_DAILY_CAPACITY) * 100).toFixed(1);
    const targetCalls = Math.floor(TOTAL_DAILY_CAPACITY * TARGET_USAGE_PERCENT);
    const callsNeeded = targetCalls - totalUsedToday;
    const minutesLeft = getMinutesUntilReset();
    const callsPerMinNeeded = minutesLeft > 0 ? Math.ceil(callsNeeded / minutesLeft) : 0;
    
    console.log(`📊 Usage: ${totalUsedToday}/${TOTAL_DAILY_CAPACITY} (${percentUsed}%)`);
    console.log(`   Target: ${(TARGET_USAGE_PERCENT * 100)}% | Needed: ${callsNeeded}`);
    
    // Determine total calls this cycle
    const callsThisCycle = Math.min(10, Math.max(2, callsPerMinNeeded));
    const allocation = allocateCalls(callsThisCycle);
    
    console.log(`🚀 Allocating ${callsThisCycle} calls:`, allocation.map(a => `${a.module}=${a.count}`).join(', '));
    
    const results: any[] = [];
    const moduleInsights: Record<string, string[]> = {};
    
    for (const { module, count } of allocation) {
      for (let i = 0; i < count; i++) {
        const query = getRandomModuleQuery(module);
        const learningPrompt = buildModuleLearningPrompt(module, query);
        const systemPrompt = buildModuleSystemPrompt(module);
        
        try {
          const result = await callFreeTierAI(learningPrompt, {
            systemPrompt,
            maxTokens: 700,
            temperature: 0.2
          });
          
          // Store learning data
          await supabase.from('ai_learning_data').insert({
            input_data: { prompt: learningPrompt, query, module },
            output_data: { content: result.content, success: true },
            model: result.model,
            model_name: `${result.provider}/${result.model}`,
            provider: result.provider,
            success: true,
            metadata: { cycle: 'module_learning', module, mode: DOCTRINE.mode }
          });
          
          // Store in hot memory with module context
          await supabase.from('brain_memory_hot').insert({
            content: result.content.slice(0, 50000),
            context: `module_learning:${module}`,
            goal_ref: module,
            priority: module === 'brain' || module === 'encoded' ? 9 : 7,
            tags: { module, query: query.substring(0, 50), provider: result.provider },
            metadata: { model: result.model, module, learning_version: LEARNER_VERSION }
          });
          
          // Track insights for the brain_event summary
          if (!moduleInsights[module]) moduleInsights[module] = [];
          moduleInsights[module].push(result.content.substring(0, 200));
          
          results.push({
            module,
            query: query.substring(0, 60),
            provider: result.provider,
            model: result.model,
            contentLength: result.content.length,
          });
          
          console.log(`✅ [${module.toUpperCase()}] ${result.provider} | ${query.substring(0, 40)}...`);
          
          // Rate limit
          await new Promise(r => setTimeout(r, 500));
          
        } catch (e) {
          console.error(`❌ [${module}] Failed:`, e);
        }
      }
    }
    
    // Log per-module learning events so Decode can report on them
    for (const [module, insights] of Object.entries(moduleInsights)) {
      await supabase.from('brain_events').insert({
        module,
        event_type: 'module_learning_insight',
        outcome: 'success',
        data: {
          module,
          insights_count: insights.length,
          summary: insights.map(i => i.substring(0, 150)).join(' | '),
          learning_version: LEARNER_VERSION,
          mode: DOCTRINE.mode,
        }
      });
    }
    
    // Log overall cycle completion
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'technical_learning_cycle',
      data: {
        version: LEARNER_VERSION,
        mode: DOCTRINE.mode,
        calls_made: results.length,
        calls_target: callsThisCycle,
        total_today: totalUsedToday + results.length,
        percent_used: ((totalUsedToday + results.length) / TOTAL_DAILY_CAPACITY * 100).toFixed(1),
        allocation: allocation.map(a => ({ module: a.module, calls: a.count })),
        modules_covered: [...new Set(results.map(r => r.module))],
        providers_used: [...new Set(results.map(r => r.provider))],
      },
      outcome: 'completed'
    });
    
    const duration = Date.now() - startTime;
    console.log(`🎯 Technical learning cycle complete: ${results.length} calls in ${duration}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        version: LEARNER_VERSION,
        mode: DOCTRINE.mode,
        learning: {
          calls_made: results.length,
          calls_target: callsThisCycle,
          allocation,
          results,
          modules_covered: [...new Set(results.map(r => r.module))],
        },
        usage: {
          today: totalUsedToday + results.length,
          capacity: TOTAL_DAILY_CAPACITY,
          percent: ((totalUsedToday + results.length) / TOTAL_DAILY_CAPACITY * 100).toFixed(1),
          target_percent: TARGET_USAGE_PERCENT * 100,
          calls_to_target: Math.max(0, targetCalls - totalUsedToday - results.length),
          minutes_remaining: minutesLeft
        },
        duration_ms: duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Technical learning error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
