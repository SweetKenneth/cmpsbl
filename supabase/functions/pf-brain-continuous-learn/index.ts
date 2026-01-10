/**
 * CASCADE CONTINUOUS LEARNING v2.0.0
 * Dream Eater Doctrine Implementation
 * 
 * Cascade is the Dream Eater. It consumes information that strengthens 
 * the Founder and expands the system. It learns from signals that move 
 * markets, build power, and create leverage.
 * 
 * Mode: HYBRID PREDATOR
 * - Curated whitelist seeds
 * - Opportunistic expansions
 * - Strict filtering
 * - Institutional dialect priority
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
import {
  DOCTRINE,
  DOCTRINE_QUERIES,
  WHITELIST_SOURCES,
  BLACKLIST_PATTERNS,
  buildExtractionPrompt,
  getRandomDoctrineQuery,
  isBlacklisted
} from "../_shared/cascade-doctrine.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LEARNER_VERSION = '2.0.0';

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
    
    console.log(`🜂 ${DOCTRINE.name} (${DOCTRINE.alias}) Learning System v${LEARNER_VERSION}`);
    console.log(`   Mode: ${DOCTRINE.mode}`);
    console.log(`   Primary Objectives: ${DOCTRINE.primaryObjectives.slice(0, 3).join(', ')}...`);
    
    // Check for dream state
    const dreamState = shouldEnterDreamState();
    if (dreamState.enter) {
      console.log(`🌙 Entering ${dreamState.dreamType} dream state...`);
      
      await supabase.from('dream_log').insert({
        content: `Dream state: ${dreamState.dreamType}`,
        mode: dreamState.dreamType,
        seed: Math.floor(Math.random() * 1000000),
        metadata: { 
          probability: dreamState.probability, 
          hour: new Date().getUTCHours(),
          doctrine_version: DOCTRINE.version
        }
      });
      
      // DOCTRINE-aligned dream: strategic weaponization thinking
      const weaponizationTarget = DOCTRINE.weaponizationProtocol[
        Math.floor(Math.random() * DOCTRINE.weaponizationProtocol.length)
      ];
      
      try {
        const dreamResult = await callFreeTierAI(
          `As ${DOCTRINE.alias} in ${dreamState.dreamType} dream state, deeply explore this weaponization capability: "${weaponizationTarget}"

Consider:
1. How does this create leverage for the Founder?
2. What institutional patterns enable this?
3. How to execute while maintaining ambiguity?
4. What assets or positioning are required?

Be strategic, precise, and institutional-grade.`,
          {
            systemPrompt: `You are ${DOCTRINE.name}, the ${DOCTRINE.alias}. In dream state, you explore strategic capabilities with depth and precision. ${DOCTRINE.alignment.increases.join(', ')} are your metrics.`,
            maxTokens: 600,
            temperature: 0.7
          }
        );
        
        await supabase.from('brain_memory_hot').insert({
          content: `Weaponization Dream (${weaponizationTarget}): ${dreamResult.content}`,
          context: 'weaponization',
          priority: 9,
          tags: ['dream', 'weaponization', weaponizationTarget],
          metadata: { 
            provider: dreamResult.provider, 
            type: 'weaponization_dream',
            target: weaponizationTarget
          }
        });
        
        console.log(`✨ Weaponization dream complete: ${weaponizationTarget}`);
      } catch (e) {
        console.error('Dream failed:', e);
      }
    }
    
    // Get usage stats
    const today = new Date().toISOString().split('T')[0];
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    
    const [{ data: dailyUsage }, { data: minuteUsage }] = await Promise.all([
      supabase.from('ai_learning_data').select('model_name').gte('created_at', `${today}T00:00:00Z`),
      supabase.from('ai_learning_data').select('model_name').gte('created_at', oneMinuteAgo)
    ]);
    
    const countByProvider = (data: any[], pattern: string) => 
      data?.filter(d => d.model_name?.includes(pattern)).length || 0;
    
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
    
    console.log(`📊 DOCTRINE LEARNING STATUS:`);
    console.log(`   Total: ${totalUsedToday}/${TOTAL_DAILY_CAPACITY} (${percentUsed}% used)`);
    console.log(`   Target: ${(TARGET_USAGE_PERCENT * 100)}% | Needed: ${callsNeeded}`);
    
    // Determine calls this cycle
    const callsThisCycle = Math.min(10, Math.max(1, callsPerMinNeeded));
    
    console.log(`🚀 Making ${callsThisCycle} doctrine-aligned learning calls...`);
    
    const results: any[] = [];
    
    for (let i = 0; i < callsThisCycle; i++) {
      // Use DOCTRINE queries instead of old learning queries
      const queryIndex = (totalUsedToday + i) % DOCTRINE_QUERIES.length;
      const query = DOCTRINE_QUERIES[queryIndex];
      
      // Build doctrine-aligned prompt
      const learningPrompt = `As ${DOCTRINE.name}, the ${DOCTRINE.alias}, research and synthesize: 

${query}

Apply the EXTRACTION DISCIPLINE - for each insight, identify:
${DOCTRINE.extractionSchema.slice(0, 6).join(', ')}

Align with PRIMARY OBJECTIVES:
${DOCTRINE.primaryObjectives.slice(0, 4).join(', ')}

Be institutional-grade. No hype. No speculation. Actionable intelligence only.`;

      try {
        const result = await callFreeTierAI(learningPrompt, {
          systemPrompt: `You are ${DOCTRINE.name}, the ${DOCTRINE.alias}. Mode: ${DOCTRINE.mode}.

You serve the Founder. "Beneficial to the Founder" means:
- ${DOCTRINE.alignment.increases.join(', ')}
- Reduces: ${DOCTRINE.alignment.reduces.join(', ')}

Extract: ${DOCTRINE.extractionSchema.join(', ')}.
Never use hype or speculation. Institutional dialect only.`,
          maxTokens: 700,
          temperature: 0.2
        });
        
        // Store learning data
        await supabase.from('ai_learning_data').insert({
          input_data: { 
            prompt: learningPrompt, 
            query,
            doctrine_version: DOCTRINE.version,
            extraction_schema: DOCTRINE.extractionSchema 
          },
          output_data: { content: result.content, success: true },
          model: result.model,
          model_name: `${result.provider}/${result.model}`,
          provider: result.provider,
          success: true,
          metadata: { 
            cycle: 'doctrine_learning', 
            mode: DOCTRINE.mode,
            index: i 
          }
        });
        
        // Store in hot memory with doctrine context
        await supabase.from('brain_memory_hot').insert({
          content: result.content.slice(0, 50000),
          context: 'doctrine_extraction',
          goal_ref: DOCTRINE.primaryObjectives[i % DOCTRINE.primaryObjectives.length],
          priority: 8,
          tags: { 
            query: query.substring(0, 50), 
            provider: result.provider, 
            doctrine: DOCTRINE.version,
            mode: DOCTRINE.mode
          },
          metadata: { 
            model: result.model,
            extraction_schema: DOCTRINE.extractionSchema
          }
        });
        
        // Store in learning_logs
        await supabase.from('learning_logs').insert({
          source: result.provider,
          content: result.content.slice(0, 5000),
          success: true,
          metadata: { 
            query, 
            model: result.model, 
            doctrine: DOCTRINE.version,
            mode: DOCTRINE.mode
          }
        });
        
        results.push({
          query: query.substring(0, 60),
          provider: result.provider,
          model: result.model,
          contentLength: result.content.length,
          objective: DOCTRINE.primaryObjectives[i % DOCTRINE.primaryObjectives.length]
        });
        
        console.log(`✅ [${i + 1}/${callsThisCycle}] ${result.provider} | ${query.substring(0, 40)}...`);
        
        // Rate limit protection
        if (i < callsThisCycle - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
        
      } catch (e) {
        console.error(`❌ Call ${i + 1} failed:`, e);
      }
    }
    
    // Log completion event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'doctrine_learning_cycle',
      data: {
        version: LEARNER_VERSION,
        doctrine_version: DOCTRINE.version,
        mode: DOCTRINE.mode,
        calls_made: results.length,
        calls_target: callsThisCycle,
        total_today: totalUsedToday + results.length,
        percent_used: ((totalUsedToday + results.length) / TOTAL_DAILY_CAPACITY * 100).toFixed(1),
        dream_state: dreamState.enter ? dreamState.dreamType : null,
        providers_used: results.map(r => r.provider),
        objectives_covered: [...new Set(results.map(r => r.objective))]
      },
      outcome: 'completed'
    });
    
    const duration = Date.now() - startTime;
    console.log(`🎯 Doctrine cycle complete: ${results.length} calls in ${duration}ms`);
    
    return new Response(
      JSON.stringify({
        success: true,
        version: LEARNER_VERSION,
        doctrine: {
          name: DOCTRINE.name,
          alias: DOCTRINE.alias,
          version: DOCTRINE.version,
          mode: DOCTRINE.mode
        },
        dream_state: dreamState.enter ? { 
          type: dreamState.dreamType, 
          probability: dreamState.probability 
        } : null,
        learning: {
          calls_made: results.length,
          calls_target: callsThisCycle,
          results,
          objectives_covered: [...new Set(results.map(r => r.objective))]
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
    console.error('❌ Doctrine learning error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
