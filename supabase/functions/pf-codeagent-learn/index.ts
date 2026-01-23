/**
 * CodeAgent Continuous Learning System
 * Runs 24/7 to learn coding skills at 60% of daily API budget
 * 
 * Budget Allocation:
 * - 60% for continuous learning (~9,600 calls/day from 16,000+ capacity)
 * - 40% reserved for user tasks and system operations (~6,400 calls/day)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callFreeTierAI, ROUTER_VERSION } from "../_shared/free-tier-router.ts";

const LEARNER_VERSION = "1.0.0";

// Budget configuration: 60% of daily capacity for learning
const DAILY_CAPACITY = 16000;  // Total daily API calls available
const LEARNING_BUDGET_PERCENT = 0.60;
const LEARNING_BUDGET = Math.floor(DAILY_CAPACITY * LEARNING_BUDGET_PERCENT); // ~9,600 calls

// Learning cycle configuration
const CALLS_PER_CYCLE = 3;  // Calls per learning cycle
const CYCLE_INTERVAL_MS = 15 * 60 * 1000;  // 15 minutes between cycles
const MAX_CYCLES_PER_DAY = Math.floor(LEARNING_BUDGET / CALLS_PER_CYCLE);  // ~3,200 cycles

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Coding topics to learn
const CODING_TOPICS = [
  // TypeScript patterns
  { domain: 'typescript', topic: 'error handling patterns', weight: 3 },
  { domain: 'typescript', topic: 'type guards and assertions', weight: 2 },
  { domain: 'typescript', topic: 'generics best practices', weight: 2 },
  { domain: 'typescript', topic: 'async/await patterns', weight: 3 },
  
  // Deno/Edge Functions
  { domain: 'deno', topic: 'edge function optimization', weight: 4 },
  { domain: 'deno', topic: 'CORS handling', weight: 2 },
  { domain: 'deno', topic: 'streaming responses', weight: 2 },
  
  // Supabase patterns
  { domain: 'supabase', topic: 'RLS policy patterns', weight: 4 },
  { domain: 'supabase', topic: 'database triggers', weight: 3 },
  { domain: 'supabase', topic: 'realtime subscriptions', weight: 2 },
  { domain: 'supabase', topic: 'storage bucket policies', weight: 2 },
  
  // React patterns
  { domain: 'react', topic: 'custom hooks', weight: 3 },
  { domain: 'react', topic: 'state management patterns', weight: 2 },
  { domain: 'react', topic: 'performance optimization', weight: 2 },
  
  // Security
  { domain: 'security', topic: 'input validation', weight: 4 },
  { domain: 'security', topic: 'SQL injection prevention', weight: 4 },
  { domain: 'security', topic: 'XSS prevention', weight: 3 },
  
  // API Design
  { domain: 'api', topic: 'rate limiting patterns', weight: 3 },
  { domain: 'api', topic: 'error response standards', weight: 2 },
  { domain: 'api', topic: 'authentication patterns', weight: 3 },
];

interface LearningState {
  cycles_today: number;
  calls_today: number;
  last_cycle: string | null;
  topics_covered: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const { action = 'cycle' } = body;

    console.log(`📚 CodeAgent Learner v${LEARNER_VERSION} | action: ${action}`);

    switch (action) {
      case 'status': {
        const state = await getLearningState(supabase);
        const budgetRemaining = LEARNING_BUDGET - state.calls_today;
        
        return new Response(JSON.stringify({
          success: true,
          version: LEARNER_VERSION,
          router_version: ROUTER_VERSION,
          budget: {
            daily_capacity: DAILY_CAPACITY,
            learning_budget: LEARNING_BUDGET,
            learning_percent: `${LEARNING_BUDGET_PERCENT * 100}%`,
            calls_today: state.calls_today,
            budget_remaining: budgetRemaining,
            cycles_today: state.cycles_today,
            max_cycles_per_day: MAX_CYCLES_PER_DAY,
          },
          last_cycle: state.last_cycle,
          topics_covered_today: state.topics_covered.length,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case 'cycle': {
        const state = await getLearningState(supabase);
        
        // Check if we're within budget
        if (state.calls_today >= LEARNING_BUDGET) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Daily learning budget exhausted',
            calls_used: state.calls_today,
            budget: LEARNING_BUDGET,
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        
        // Select a weighted random topic
        const topic = selectWeightedTopic(state.topics_covered);
        
        // Run the learning cycle
        const result = await runLearningCycle(supabase, topic);
        
        // Update state
        await updateLearningState(supabase, {
          cycles_today: state.cycles_today + 1,
          calls_today: state.calls_today + result.calls_made,
          last_cycle: new Date().toISOString(),
          topics_covered: [...state.topics_covered, `${topic.domain}:${topic.topic}`],
        });
        
        return new Response(JSON.stringify({
          success: true,
          topic: topic,
          patterns_learned: result.patterns_learned,
          calls_made: result.calls_made,
          budget_remaining: LEARNING_BUDGET - state.calls_today - result.calls_made,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      case 'force_learn': {
        // Force learn a specific topic
        const { domain, topic: topicName } = body;
        
        if (!domain || !topicName) {
          return new Response(JSON.stringify({
            success: false,
            error: 'domain and topic required',
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
        }
        
        const result = await runLearningCycle(supabase, { domain, topic: topicName, weight: 1 });
        
        return new Response(JSON.stringify({
          success: true,
          topic: { domain, topic: topicName },
          patterns_learned: result.patterns_learned,
          calls_made: result.calls_made,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      default:
        return new Response(JSON.stringify({
          success: false,
          error: `Unknown action: ${action}`,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

  } catch (error) {
    console.error("❌ Learner error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

/**
 * Get current learning state for today
 */
// deno-lint-ignore no-explicit-any
async function getLearningState(supabase: any): Promise<LearningState> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await supabase
    .from('brain_orchestrator_state')
    .select('state_data')
    .eq('state_key', `learning_state_${today}`)
    .single();
  
  if (data?.state_data) {
    return data.state_data as LearningState;
  }
  
  return {
    cycles_today: 0,
    calls_today: 0,
    last_cycle: null,
    topics_covered: [],
  };
}

/**
 * Update learning state
 */
// deno-lint-ignore no-explicit-any
async function updateLearningState(
  supabase: any,
  state: LearningState
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('brain_orchestrator_state')
    .upsert({
      state_key: `learning_state_${today}`,
      state_data: state,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'state_key' });
}

/**
 * Select a weighted random topic, preferring uncovered topics
 */
function selectWeightedTopic(coveredTopics: string[]): typeof CODING_TOPICS[0] {
  // Filter to uncovered topics or fall back to all topics
  const uncovered = CODING_TOPICS.filter(t => 
    !coveredTopics.includes(`${t.domain}:${t.topic}`)
  );
  
  const pool = uncovered.length > 0 ? uncovered : CODING_TOPICS;
  
  // Weighted random selection
  const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const topic of pool) {
    random -= topic.weight;
    if (random <= 0) {
      return topic;
    }
  }
  
  return pool[0];
}

/**
 * Run a single learning cycle
 */
// deno-lint-ignore no-explicit-any
async function runLearningCycle(
  supabase: any,
  topic: typeof CODING_TOPICS[0]
): Promise<{ patterns_learned: number; calls_made: number }> {
  let callsMade = 0;
  const patterns: Array<{ content: string; tags: string[]; confidence: number }> = [];
  
  try {
    // Call 1: Get coding best practices for the topic
    const practicesPrompt = `You are a senior software engineer. List 3-5 specific, actionable coding best practices for "${topic.topic}" in ${topic.domain}. Format each as a short rule that can be applied directly.`;
    
    const practices = await callFreeTierAI(practicesPrompt, {
      systemPrompt: 'You are an expert programmer. Be concise and practical.',
      temperature: 0.3,
      maxTokens: 500,
    });
    callsMade++;
    
    if (practices.content) {
      patterns.push({
        content: `${topic.domain}/${topic.topic} best practices:\n${practices.content}`,
        tags: [topic.domain, topic.topic.replace(/\s+/g, '_'), 'best_practice'],
        confidence: 0.8,
      });
    }
    
    // Call 2: Get a code example
    const examplePrompt = `Write a concise, production-ready code example demonstrating "${topic.topic}" in ${topic.domain}. Include comments explaining key points. Keep it under 30 lines.`;
    
    const example = await callFreeTierAI(examplePrompt, {
      systemPrompt: 'You are an expert programmer. Write clean, well-commented code.',
      temperature: 0.4,
      maxTokens: 800,
    });
    callsMade++;
    
    if (example.content) {
      patterns.push({
        content: `${topic.domain}/${topic.topic} code example:\n${example.content}`,
        tags: [topic.domain, topic.topic.replace(/\s+/g, '_'), 'code_example'],
        confidence: 0.75,
      });
    }
    
    // Call 3: Get common mistakes to avoid
    const mistakesPrompt = `What are 3 common mistakes developers make with "${topic.topic}" in ${topic.domain}? For each, briefly explain why it's wrong and how to fix it.`;
    
    const mistakes = await callFreeTierAI(mistakesPrompt, {
      systemPrompt: 'You are an expert programmer and code reviewer.',
      temperature: 0.3,
      maxTokens: 500,
    });
    callsMade++;
    
    if (mistakes.content) {
      patterns.push({
        content: `${topic.domain}/${topic.topic} mistakes to avoid:\n${mistakes.content}`,
        tags: [topic.domain, topic.topic.replace(/\s+/g, '_'), 'anti_pattern'],
        confidence: 0.85,
      });
    }
    
    // Store learned patterns in brain
    for (const pattern of patterns) {
      await supabase.from('brain_memories').insert({
        content: pattern.content,
        memory_type: 'code_pattern',
        source: 'continuous_learning',
        confidence: pattern.confidence,
        tags: pattern.tags,
        metadata: {
          domain: topic.domain,
          topic: topic.topic,
          learned_at: new Date().toISOString(),
        },
      });
    }
    
    // Log the learning event
    await supabase.from('brain_events').insert({
      event_type: 'continuous_learning',
      module: 'evolution',
      outcome: 'success',
      data: {
        domain: topic.domain,
        topic: topic.topic,
        patterns_learned: patterns.length,
        calls_made: callsMade,
      },
    });
    
  } catch (error) {
    console.error('Learning cycle error:', error);
    
    await supabase.from('brain_events').insert({
      event_type: 'continuous_learning',
      module: 'evolution',
      outcome: 'failed',
      data: {
        domain: topic.domain,
        topic: topic.topic,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
  
  return {
    patterns_learned: patterns.length,
    calls_made: callsMade,
  };
}
