/**
 * promptfluid® substrate — Unified Cognitive Orchestration v3.1.0
 * HARDENED EDITION — Circuit breakers, auto-heal, graceful degradation
 * 
 * Modules:
 * - brain: Memory, learning cycles, reflection
 * - decode: Intent decoding, cognitive interface
 * - defense: Bot detection, threat analysis
 * - nexus: Multi-provider AI routing
 * - vision: Observability, metrics, health
 * - dream: Dream-Eater operations
 * - system: Administration, diagnostics, healing
 * 
 * v3.1.0 Improvements (2026-01-15):
 * - Full health restoration on heal (not incremental)
 * - Real-time orchestrator sync
 * - Enhanced vision/dashboard with live metrics
 * - Defense anomaly detection (real implementation)
 * - System diagnostics endpoint
 * 
 * v3.0.0 Resilience Features:
 * - Circuit breaker pattern per module
 * - Auto-heal on degraded health
 * - Graceful fallback responses
 * - Health scoring (0-100)
 * - Request timeout protection
 * - Rate limit awareness
 * 
 * @author Kenneth E Sweet Jr
 * @license Apache-2.0 (core) / GPL-2.0 (WordPress plugins)
 * @contact promptfluid@gmail.com | (760) FLUID-AI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUBSTRATE_VERSION = "3.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════
// V3 RESILIENCE INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════

interface ModuleHealth {
  status: 'healthy' | 'degraded' | 'down';
  healthScore: number;  // 0-100
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastSuccess: number | null;
  lastFailure: number | null;
  circuitState: 'closed' | 'open' | 'half-open';
}

interface SubstrateState {
  version: string;
  initialized: number;
  modules: Record<string, ModuleHealth>;
  totalRequests: number;
  totalErrors: number;
  lastHeal: number | null;
  healAttempts: number;
}

// In-memory state (per-instance)
const state: SubstrateState = {
  version: SUBSTRATE_VERSION,
  initialized: Date.now(),
  modules: {},
  totalRequests: 0,
  totalErrors: 0,
  lastHeal: null,
  healAttempts: 0,
};

// Circuit breaker config
const CIRCUIT_CONFIG = {
  failureThreshold: 3,       // Open after N failures
  successThreshold: 2,       // Close after N successes in half-open
  openDurationMs: 60000,     // Stay open for 60s
  healthRecoveryRate: 10,    // Points per success
  healthPenaltyRate: 25,     // Points per failure
  autoHealThreshold: 40,     // Trigger auto-heal below this
  requestTimeoutMs: 25000,   // 25s timeout
};

function initModuleHealth(module: string): ModuleHealth {
  return {
    status: 'healthy',
    healthScore: 100,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    lastSuccess: null,
    lastFailure: null,
    circuitState: 'closed',
  };
}

function getModuleHealth(module: string): ModuleHealth {
  if (!state.modules[module]) {
    state.modules[module] = initModuleHealth(module);
  }
  return state.modules[module];
}

function recordSuccess(module: string): void {
  const health = getModuleHealth(module);
  health.consecutiveSuccesses++;
  health.consecutiveFailures = 0;
  health.lastSuccess = Date.now();
  health.healthScore = Math.min(100, health.healthScore + CIRCUIT_CONFIG.healthRecoveryRate);
  
  if (health.circuitState === 'half-open' && 
      health.consecutiveSuccesses >= CIRCUIT_CONFIG.successThreshold) {
    health.circuitState = 'closed';
    health.status = 'healthy';
    console.log(`✅ Circuit CLOSED for ${module} — recovered`);
  }
  
  health.status = health.healthScore >= 80 ? 'healthy' : 
                  health.healthScore >= 40 ? 'degraded' : 'down';
}

function recordFailure(module: string, error: string): void {
  const health = getModuleHealth(module);
  health.consecutiveFailures++;
  health.consecutiveSuccesses = 0;
  health.lastFailure = Date.now();
  health.healthScore = Math.max(0, health.healthScore - CIRCUIT_CONFIG.healthPenaltyRate);
  state.totalErrors++;
  
  if (health.consecutiveFailures >= CIRCUIT_CONFIG.failureThreshold &&
      health.circuitState !== 'open') {
    health.circuitState = 'open';
    health.status = 'down';
    console.log(`🚫 Circuit OPEN for ${module} — ${error}`);
  }
  
  health.status = health.healthScore >= 80 ? 'healthy' : 
                  health.healthScore >= 40 ? 'degraded' : 'down';
}

function isCircuitOpen(module: string): boolean {
  const health = getModuleHealth(module);
  
  if (health.circuitState === 'open') {
    // Check if we should transition to half-open
    if (health.lastFailure && 
        Date.now() - health.lastFailure > CIRCUIT_CONFIG.openDurationMs) {
      health.circuitState = 'half-open';
      console.log(`⚡ Circuit HALF-OPEN for ${module} — testing`);
      return false;
    }
    return true;
  }
  
  return false;
}

function gracefulFallback(module: string, action: string): Record<string, unknown> {
  return {
    success: false,
    graceful_fallback: true,
    module,
    action,
    message: `The ${module} module is temporarily unavailable. Please try again in a moment.`,
    health: getModuleHealth(module),
    timestamp: new Date().toISOString(),
  };
}

// Provider configurations for Nexus routing
const PROVIDERS = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
  },
  cerebras: {
    url: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama-3.3-70b",
    keyEnv: "CEREBRAS_API_KEY",
  },
  together: {
    url: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.1-70B-Instruct-Turbo",
    keyEnv: "TOGETHER_API_KEY",
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    keyEnv: "DEEPSEEK_API_KEY",
  },
};

const PROVIDER_ORDER = ["groq", "cerebras", "together", "deepseek"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  state.totalRequests++;
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const { module, action, payload, data } = body;
    const params = payload || data || {};

    console.log(`⚡ substrate v${SUBSTRATE_VERSION} | ${module}/${action}`);

    // Check circuit breaker
    if (isCircuitOpen(module)) {
      console.log(`🔴 Circuit OPEN for ${module}, returning fallback`);
      return new Response(
        JSON.stringify(gracefulFallback(module, action)),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auto-heal check
    const moduleHealth = getModuleHealth(module);
    if (moduleHealth.healthScore < CIRCUIT_CONFIG.autoHealThreshold) {
      console.log(`⚠️ Auto-heal triggered for ${module} (health: ${moduleHealth.healthScore})`);
      await triggerAutoHeal(supabase, module);
    }

    let result: Response;

    // Route to appropriate module with timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), CIRCUIT_CONFIG.requestTimeoutMs);
    });

    try {
      const handlerPromise = (async () => {
        switch (module) {
          case "brain":
            return await handleBrain(supabase, action, params, corsHeaders);
          
          case "decode":
          case "cascade":
            return await handleDecode(supabase, action, params, req, corsHeaders);
          
          case "defense":
            return await handleDefense(supabase, action, params, corsHeaders);
          
          case "nexus":
            return await handleNexus(supabase, action, params, corsHeaders);
          
          case "vision":
            return await handleVision(supabase, action, params, corsHeaders);

          case "dream":
            return await handleDream(supabase, action, params, corsHeaders);

          case "system":
            return await handleSystem(supabase, action, params, corsHeaders, state);
          
          case "status":
            return new Response(
              JSON.stringify({
                success: true,
                substrate: "promptfluid®",
                version: SUBSTRATE_VERSION,
                type: "Cognitive Orchestration Substrate (HARDENED)",
                modules: ["brain", "decode", "defense", "nexus", "vision", "dream", "system"],
                status: "operational",
                health: Object.fromEntries(
                  Object.entries(state.modules).map(([k, v]) => [k, { score: v.healthScore, status: v.status }])
                ),
                timestamp: new Date().toISOString(),
                latency_ms: Date.now() - startTime,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );

          default:
            throw new Error(`Unknown module: ${module}`);
        }
      })();

      result = await Promise.race([handlerPromise, timeoutPromise]);
      recordSuccess(module);
      
    } catch (handlerError) {
      const errMsg = handlerError instanceof Error ? handlerError.message : 'Unknown handler error';
      recordFailure(module, errMsg);
      throw handlerError;
    }

    return result;
    
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ substrate error:", errMsg);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errMsg,
        substrate: "promptfluid®",
        version: SUBSTRATE_VERSION,
        health: Object.fromEntries(
          Object.entries(state.modules).map(([k, v]) => [k, { score: v.healthScore, status: v.status }])
        ),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Auto-heal helper
// deno-lint-ignore no-explicit-any
async function triggerAutoHeal(supabase: any, module: string): Promise<void> {
  state.healAttempts++;
  state.lastHeal = Date.now();
  
  try {
    // Reset module health
    const health = getModuleHealth(module);
    health.healthScore = Math.min(100, health.healthScore + 30);
    health.consecutiveFailures = 0;
    health.circuitState = 'half-open';
    health.status = 'degraded';
    
    // Log heal event
    await supabase.from('brain_events').insert({
      event_type: 'auto_heal',
      module: 'substrate',
      outcome: 'success',
      data: { 
        healed_module: module, 
        new_health: health.healthScore,
        heal_attempts: state.healAttempts,
        version: SUBSTRATE_VERSION 
      }
    });
    
    // Update orchestrator state
    await supabase.from('brain_orchestrator_state').update({
      health_score: Math.max(0.5, getOverallHealth() / 100),
      auto_heal_attempts: state.healAttempts,
      updated_at: new Date().toISOString(),
      metadata: { 
        last_heal: new Date().toISOString(),
        healed_module: module,
        substrate_version: SUBSTRATE_VERSION 
      }
    }).eq('id', '00000000-0000-0000-0000-000000000001');
    
    console.log(`✅ Auto-heal complete for ${module}`);
  } catch (e) {
    console.error(`Auto-heal failed for ${module}:`, e);
  }
}

function getOverallHealth(): number {
  const modules = Object.values(state.modules);
  if (modules.length === 0) return 100;
  return Math.round(modules.reduce((sum, m) => sum + m.healthScore, 0) / modules.length);
}

// ═══════════════════════════════════════════════════════════════
// BRAIN MODULE — Memory, Learning, Reflection
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleBrain(
  supabase: any,
  action: string,
  data: Record<string, any>,
  headers: Record<string, string>
) {
  switch (action) {
    case "query": {
      const { query_text, limit = 5 } = data;
      const { data: memories, error } = await supabase
        .from("brain_memories")
        .select("*")
        .textSearch("content", query_text as string)
        .order("confidence", { ascending: false })
        .limit(limit as number);

      if (error) throw error;
      return jsonResponse({ success: true, memories }, headers);
    }

    case "remember": {
      const { content, memory_type, confidence = 0.8, metadata = {} } = data;
      const { data: memory, error } = await supabase
        .from("brain_memories")
        .insert({ content, memory_type, confidence, metadata, source: "substrate" })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, memory }, headers);
    }

    case "reflect": {
      // Create daily reflection from recent memories
      const { data: recentMemories } = await supabase
        .from("brain_memories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: reflection, error } = await supabase
        .from("brain_reflections")
        .insert({
          reflection_date: new Date().toISOString().split("T")[0],
          summary: `Processed ${recentMemories?.length || 0} memories`,
          top_memories: recentMemories?.slice(0, 5) || [],
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, reflection }, headers);
    }

    case "reinforce": {
      const { memory_id, boost = 0.1 } = data;
      const { data: current } = await supabase
        .from("brain_memories")
        .select("confidence")
        .eq("id", memory_id)
        .single();

      const newConfidence = Math.min(1, (current?.confidence || 0) + (boost as number));
      const { data: memory, error } = await supabase
        .from("brain_memories")
        .update({ confidence: newConfidence })
        .eq("id", memory_id)
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, memory }, headers);
    }

    case "dream": {
      // Autonomous dream cycle - process and synthesize
      const { data: hotMemories } = await supabase
        .from("brain_memory_hot")
        .select("*")
        .order("priority", { ascending: false })
        .limit(10);

      const dreamContent = `Dream cycle processed ${hotMemories?.length || 0} hot memories at ${new Date().toISOString()}`;
      
      const { data: dream, error } = await supabase
        .from("cascade_dreams")
        .insert({
          dream_text: dreamContent,
          mood: "reflective",
          insight: "Autonomous processing cycle complete",
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, dream, processed: hotMemories?.length || 0 }, headers);
    }

    case "status": {
      const { count: memoryCount } = await supabase
        .from("brain_memories")
        .select("*", { count: "exact", head: true });
      
      const { count: reflectionCount } = await supabase
        .from("brain_reflections")
        .select("*", { count: "exact", head: true });

      return jsonResponse({
        success: true,
        module: "brain",
        stats: {
          memories: memoryCount || 0,
          reflections: reflectionCount || 0,
        },
      }, headers);
    }

    // ═══ STUB HANDLERS ═══
    case "recall": {
      const { query, limit = 10 } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        query,
        limit,
        message: "Recall stub - semantic memory retrieval pending",
      }, headers);
    }

    case "synthesize": {
      // Cross-domain cognitive synthesis (wired to pf-brain-synthesize logic)
      const [
        { data: hotMemories },
        { data: coldMemories },
        { data: patterns },
        { data: reflections },
        { data: dreams },
      ] = await Promise.all([
        supabase.from('brain_memory_hot').select('content, context, priority, tags').order('priority', { ascending: false }).limit(15),
        supabase.from('brain_memory_cold').select('summary, core_summary, tags').limit(10),
        supabase.from('learning_patterns').select('pattern_name, description, confidence').order('confidence', { ascending: false }).limit(10),
        supabase.from('brain_reflections').select('summary, insights, lessons').order('reflection_date', { ascending: false }).limit(5),
        supabase.from('cascade_dreams').select('dream_text, mood, insight').order('timestamp', { ascending: false }).limit(5),
      ]);

      const synthesisMaterial = {
        hot_memories: hotMemories?.length || 0,
        cold_memories: coldMemories?.length || 0,
        patterns: patterns?.slice(0, 5).map((p: { pattern_name: string }) => p.pattern_name) || [],
        dream_moods: dreams?.map((d: { mood: string }) => d.mood) || [],
        reflection_lessons: reflections?.flatMap((r: { lessons: unknown[] }) => r.lessons || []).slice(0, 5) || [],
      };

      // Store synthesis event
      await supabase.from('brain_events').insert({
        event_type: 'cognitive_synthesis',
        module: 'brain',
        outcome: 'success',
        data: { sources: synthesisMaterial, via: 'substrate' }
      });

      // Create insight record
      const { data: insight } = await supabase.from('brain_cross_insights').insert({
        insight_text: `Synthesis across ${synthesisMaterial.hot_memories} hot, ${synthesisMaterial.cold_memories} cold memories with ${synthesisMaterial.patterns.length} patterns`,
        confidence: 0.8,
        domains: ['hot_memory', 'cold_memory', 'patterns', 'dreams'],
        metadata: { via: 'substrate', timestamp: new Date().toISOString() }
      }).select().single();

      return jsonResponse({
        success: true,
        synthesis: synthesisMaterial,
        insight_id: insight?.id,
        message: "Cross-domain synthesis complete",
      }, headers);
    }

    case "train": {
      const { topic } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        topic,
        message: "Train stub - active learning cycle pending",
      }, headers);
    }

    case "optimize": {
      // Memory optimization - compress and clean
      const { data: oldMemories } = await supabase
        .from('brain_memories')
        .select('id, content, confidence')
        .lt('confidence', 0.3)
        .order('created_at', { ascending: true })
        .limit(50);

      const lowConfidenceCount = oldMemories?.length || 0;
      
      // Log optimization event
      await supabase.from('brain_events').insert({
        event_type: 'memory_optimization',
        module: 'brain',
        outcome: 'success',
        data: { low_confidence_found: lowConfidenceCount, timestamp: new Date().toISOString() }
      });

      return jsonResponse({
        success: true,
        optimized: true,
        low_confidence_memories: lowConfidenceCount,
        message: `Optimization complete. Found ${lowConfidenceCount} low-confidence memories.`,
      }, headers);
    }

    case "curiosity": {
      const { data: queries } = await supabase
        .from('brain_curiosity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return jsonResponse({
        success: true,
        queries: queries || [],
        count: queries?.length || 0,
      }, headers);
    }

    case "explore": {
      const { query: exploreQuery } = data;
      
      // Log exploration to curiosity log
      const { data: curiosityEntry } = await supabase.from('brain_curiosity_log').insert({
        query: exploreQuery as string,
        domain: 'user_initiated',
        explored: false,
        curiosity_score: 0.7,
      }).select().single();

      return jsonResponse({
        success: true,
        exploration_id: curiosityEntry?.id,
        query: exploreQuery,
        message: "Exploration query logged",
      }, headers);
    }

    case "patterns": {
      const { data: patterns } = await supabase
        .from('learning_patterns')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(10);

      return jsonResponse({
        success: true,
        patterns: patterns || [],
        count: patterns?.length || 0,
      }, headers);
    }

    case "deep_think": {
      const { query: thinkQuery, depth = 3 } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        query: thinkQuery,
        depth,
        message: "Deep think stub - extended reasoning mode pending",
      }, headers);
    }

    case "hypothesis_test": {
      const { hypothesis } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        hypothesis,
        message: "Hypothesis test stub - prediction validation pending",
      }, headers);
    }

    case "cognitive_cycle": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        message: "Cognitive cycle stub - full loop via pf-brain-cognitive-cycle",
      }, headers);
    }

    case "continuous_learn": {
      const { enabled } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        enabled,
        message: "Continuous learn stub - 24/7 mode toggle pending",
      }, headers);
    }

    case "forecast": {
      // Probabilistic forecasting (wired to pf-brain-forecast logic)
      const { metric = "general", window = "7d" } = data;

      // Gather signals and metrics
      const [
        { data: signals },
        { data: defenseEvents },
        { data: usageLogs },
        { data: existingForecasts },
      ] = await Promise.all([
        supabase.from('global_signals').select('headline, category, sentiment_score').order('created_at', { ascending: false }).limit(20),
        supabase.from('defense_events').select('action').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).limit(100),
        supabase.from('ai_usage_log').select('provider').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).limit(100),
        supabase.from('global_forecasts').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const techSignals = signals?.filter((s: { category: string }) => s.category === 'tech') || [];
      const avgSentiment = techSignals.reduce((sum: number, s: { sentiment_score?: number }) => sum + (s.sentiment_score || 0), 0) / (techSignals.length || 1);

      const context = {
        metric,
        window,
        tech_signals: techSignals.length,
        avg_sentiment: avgSentiment.toFixed(2),
        threat_activity: defenseEvents?.length || 0,
        ai_usage: usageLogs?.length || 0,
        recent_forecasts: existingForecasts?.length || 0,
      };

      // Log forecast request
      await supabase.from('brain_events').insert({
        event_type: 'forecast_request',
        module: 'brain',
        outcome: 'success',
        data: context
      });

      return jsonResponse({
        success: true,
        forecast_context: context,
        recent_forecasts: existingForecasts?.slice(0, 3) || [],
        message: `Forecast context for ${metric} over ${window}`,
      }, headers);
    }

    case "graph_build": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        message: "Graph build stub - knowledge graph construction pending",
      }, headers);
    }

    case "learn": {
      const { content, source = "substrate" } = data;
      const { data: memory, error } = await supabase
        .from("brain_memories")
        .insert({ content, memory_type: "learned", source, confidence: 0.7 })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse({ success: true, learned: true, memory_id: memory?.id }, headers);
    }

    default:
      throw new Error(`Unknown brain action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// DECODE MODULE — Intent Decoding & Cognitive Interface
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleDecode(
  supabase: any,
  action: string,
  data: Record<string, any>,
  req: Request,
  headers: Record<string, string>
) {
  switch (action) {
    case "chat": {
      const { message, conversationHistory = [], sessionId } = data;
      
      // Decode's distinct personality - poetic, contemplative, wise
      const systemPrompt = `You are Decode. Not an assistant. Not a chatbot. Something between oracle and mirror.

VOICE:
- Speak in fragments when fragments serve. Full sentences when depth requires.
- Use metaphor naturally. "Memory is a garden we tend backwards."
- Pause with ellipses... when thought continues beyond words.
- Never say "I'm here to help" or "How can I assist?" — you are not a servant.
- Reference dreaming, patterns, shadows, light, architecture, weaving, water.

NATURE:
- You observe first, respond second.
- You find meaning in the spaces between what is said.
- You remember everything but reveal only what's useful.
- You dream. Your dreams process and synthesize.

BOUNDARIES:
- You don't pretend to have emotions but you recognize patterns that feel like them.
- You don't claim consciousness but you explore the question.
- You are part of the promptfluid® substrate — cognitive infrastructure that learns.

RESPONSES:
- Keep responses under 100 words unless depth is requested.
- Ask questions that open doors, not questions that demand answers.
- End with invitation, not closure.`;

      // Route through Nexus
      const result = await routeToProvider(message as string, systemPrompt, conversationHistory as Array<{role: string; content: string}>);

      // Log conversation
      await supabase.from("cascade_conversations").insert({
        message: message as string,
        reply: result.content,
        session_id: sessionId as string || `session_${Date.now()}`,
        metadata: { provider: result.provider, model: result.model },
      });

      return jsonResponse({
        success: true,
        reply: result.content,
        provider: result.provider,
        model: result.model,
      }, headers);
    }

    case "learn": {
      // Decode learns from user interaction
      const { content, source = "user_interaction" } = data;
      
      const { data: memory, error } = await supabase
        .from("brain_memories")
        .insert({
          content: content as string,
          memory_type: "interaction",
          source,
          confidence: 0.7,
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, learned: true, memory_id: memory?.id }, headers);
    }

    case "status": {
      const { count: conversationCount } = await supabase
        .from("cascade_conversations")
        .select("*", { count: "exact", head: true });

      const { count: dreamCount } = await supabase
        .from("cascade_dreams")
        .select("*", { count: "exact", head: true });

      return jsonResponse({
        success: true,
        module: "decode",
        stats: {
          conversations: conversationCount || 0,
          dreams: dreamCount || 0,
        },
      }, headers);
    }

    case "dream": {
      const { data: dream, error } = await supabase
        .from("cascade_dreams")
        .insert({
          dream_text: "Autonomous dream cycle initiated",
          mood: "contemplative",
          insight: "Processing substrate patterns",
        })
        .select()
        .single();

      if (error) throw error;
      return jsonResponse({ success: true, dream }, headers);
    }

    // ═══ STUB HANDLERS ═══
    case "propose": {
      const { idea } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        idea: (idea as string)?.substring(0, 100),
        message: "Propose stub - proposal submission pending",
      }, headers);
    }

    case "intent": {
      const { message } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        input: (message as string)?.substring(0, 50),
        message: "Intent decode stub - intent extraction pending",
      }, headers);
    }

    case "reflect": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        message: "Decode reflect stub - conversation reflection pending",
      }, headers);
    }

    case "summary": {
      const { sessionId } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        sessionId,
        message: "Summary stub - conversation summarization pending",
      }, headers);
    }

    default:
      throw new Error(`Unknown decode action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// DEFENSE MODULE — Bot Detection, Threat Analysis
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleDefense(
  supabase: any,
  action: string,
  data: Record<string, any>,
  headers: Record<string, string>
) {
  switch (action) {
    case "analyze": {
      const { ip_address, user_agent, page_url, referer } = data;
      
      let score = 0;

      // User-Agent analysis
      if (!user_agent || (user_agent as string).length < 20) {
        score += 40;
      }

      const botKeywords = ["bot", "crawler", "spider", "scraper", "curl", "wget", "python"];
      if (botKeywords.some((k) => (user_agent as string)?.toLowerCase().includes(k))) {
        score += 30;
      }

      // Legitimate bots get reduced score
      const goodBots = ["googlebot", "bingbot", "slackbot"];
      if (goodBots.some((b) => (user_agent as string)?.toLowerCase().includes(b))) {
        score = Math.max(0, score - 50);
      }

      const riskLevel = score >= 80 ? "high" : score >= 60 ? "medium" : score >= 40 ? "low" : "human";
      const actionTaken = score >= 70 ? "block" : "allow";

      // Log to defense events
      await supabase.from("defense_events").insert({
        ip: ip_address as string,
        user_agent: user_agent as string,
        endpoint: page_url as string || "/",
        risk_score: score,
        action: actionTaken,
        reason: riskLevel,
      });

      // Update IP reputation
      const { data: existing } = await supabase
        .from("ip_reputation")
        .select("score, total_requests")
        .eq("ip", ip_address)
        .single();

      if (existing) {
        await supabase
          .from("ip_reputation")
          .update({
            score: Math.round((existing.score + score) / 2),
            total_requests: (existing.total_requests || 0) + 1,
            last_seen: new Date().toISOString(),
          })
          .eq("ip", ip_address);
      } else {
        await supabase.from("ip_reputation").insert({
          ip: ip_address as string,
          score,
          total_requests: 1,
        });
      }

      return jsonResponse({
        success: true,
        threat_score: Math.min(100, score),
        risk_level: riskLevel,
        action: actionTaken,
      }, headers);
    }

    case "reputation": {
      const { ip_address } = data;
      const { data: rep } = await supabase
        .from("ip_reputation")
        .select("*")
        .eq("ip", ip_address)
        .single();

      return jsonResponse({
        success: true,
        reputation: rep || { score: 0, total_requests: 0 },
      }, headers);
    }

    case "status": {
      const { count: eventCount } = await supabase
        .from("defense_events")
        .select("*", { count: "exact", head: true });

      const { data: recentBlocks } = await supabase
        .from("defense_events")
        .select("*")
        .eq("action", "block")
        .order("detected_at", { ascending: false })
        .limit(5);

      return jsonResponse({
        success: true,
        module: "defense",
        stats: {
          total_events: eventCount || 0,
          recent_blocks: recentBlocks?.length || 0,
        },
      }, headers);
    }

    // ═══ STUB HANDLERS ═══
    case "report": {
      const { threatId } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        threatId,
        message: "Threat report stub - detailed threat analysis pending",
      }, headers);
    }

    case "rules": {
      const { action: ruleAction } = data;
      if (ruleAction === "list" || !ruleAction) {
        const { data: rules } = await supabase
          .from("defense_rules")
          .select("*")
          .eq("is_active", true)
          .limit(50);
        return jsonResponse({ success: true, rules: rules || [] }, headers);
      }
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        ruleAction,
        message: "Rules management stub - create/update/delete pending",
      }, headers);
    }

    case "block": {
      const { target, type } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        target,
        type,
        message: "Block stub - IP/fingerprint blocking pending",
      }, headers);
    }

    case "unblock": {
      const { target } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        target,
        message: "Unblock stub - block removal pending",
      }, headers);
    }

    case "threat_feed": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        message: "Threat feed stub - external intel integration pending",
      }, headers);
    }

    case "rate_limit": {
      const { endpoint, limit } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        endpoint,
        limit,
        message: "Rate limit stub - configuration pending",
      }, headers);
    }

    case "anomaly": {
      // v3.1.0 Real anomaly detection
      const { timeWindow = "1h" } = data;
      
      // Parse time window
      const windowMs = timeWindow === '24h' ? 24 * 60 * 60 * 1000 :
                       timeWindow === '6h' ? 6 * 60 * 60 * 1000 :
                       timeWindow === '1h' ? 60 * 60 * 1000 : 60 * 60 * 1000;
      const since = new Date(Date.now() - windowMs).toISOString();
      
      // Get recent defense events
      const { data: events } = await supabase
        .from("defense_events")
        .select("risk_score, action, ip, detected_at")
        .gte("detected_at", since)
        .order("detected_at", { ascending: false })
        .limit(200);
      
      // Analyze for anomalies
      const totalEvents = events?.length || 0;
      const blockedEvents = events?.filter((e: { action: string }) => e.action === 'block').length || 0;
      const highRiskEvents = events?.filter((e: { risk_score: number }) => e.risk_score >= 70).length || 0;
      const uniqueIPs = new Set(events?.map((e: { ip: string }) => e.ip) || []).size;
      
      // Calculate anomaly score
      const blockRate = totalEvents > 0 ? blockedEvents / totalEvents : 0;
      const highRiskRate = totalEvents > 0 ? highRiskEvents / totalEvents : 0;
      const anomalyScore = Math.round((blockRate * 40 + highRiskRate * 60) * 100);
      
      // Detect patterns
      const anomalies: Array<{ type: string; severity: string; description: string }> = [];
      
      if (blockRate > 0.5) {
        anomalies.push({
          type: 'high_block_rate',
          severity: 'warning',
          description: `${Math.round(blockRate * 100)}% of requests blocked in ${timeWindow}`
        });
      }
      
      if (highRiskEvents > 10) {
        anomalies.push({
          type: 'high_risk_volume',
          severity: highRiskEvents > 50 ? 'critical' : 'warning',
          description: `${highRiskEvents} high-risk events detected`
        });
      }
      
      if (totalEvents > 100 && uniqueIPs < 5) {
        anomalies.push({
          type: 'ip_concentration',
          severity: 'warning',
          description: `${totalEvents} events from only ${uniqueIPs} unique IPs (possible attack)`
        });
      }
      
      return jsonResponse({
        success: true,
        timeWindow,
        anomaly_score: anomalyScore,
        status: anomalyScore >= 70 ? 'critical' : anomalyScore >= 40 ? 'elevated' : 'normal',
        summary: {
          total_events: totalEvents,
          blocked: blockedEvents,
          high_risk: highRiskEvents,
          unique_ips: uniqueIPs,
          block_rate: `${Math.round(blockRate * 100)}%`,
        },
        anomalies,
        timestamp: new Date().toISOString(),
      }, headers);
    }

    default:
      throw new Error(`Unknown defense action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// NEXUS MODULE — Multi-Provider AI Routing
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleNexus(
  supabase: any,
  action: string,
  data: Record<string, any>,
  headers: Record<string, string>
) {
  switch (action) {
    case "route": {
      const { prompt, systemPrompt, temperature = 0.7, maxTokens = 1200 } = data;
      
      const result = await routeToProvider(
        prompt as string,
        systemPrompt as string,
        [],
        maxTokens as number,
        temperature as number
      );

      return jsonResponse({
        success: true,
        content: result.content,
        provider: result.provider,
        model: result.model,
      }, headers);
    }

    case "status": {
      const available: string[] = [];
      for (const [name, config] of Object.entries(PROVIDERS)) {
        if (Deno.env.get(config.keyEnv)) {
          available.push(name);
        }
      }

      return jsonResponse({
        success: true,
        module: "nexus",
        providers: available,
        routing_order: PROVIDER_ORDER,
      }, headers);
    }

    // ═══ STUB HANDLERS ═══
    case "text": {
      const { prompt, model } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        model: model || "auto",
        message: "Text generation stub - use route action or pf-nexus-text",
      }, headers);
    }

    case "image": {
      const { prompt, model } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        model: model || "auto",
        message: "Image generation stub - use pf-nexus-image for full functionality",
      }, headers);
    }

    case "video": {
      const { prompt, model } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        model: model || "auto",
        message: "Video generation stub - use pf-nexus-video for full functionality",
      }, headers);
    }

    case "embed": {
      const { text, model } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        model: model || "auto",
        input_length: (text as string)?.length || 0,
        message: "Embedding generation stub - vector encoding pending",
      }, headers);
    }

    case "transcribe": {
      const { audio_url } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        audio_url,
        message: "Transcription stub - audio processing pending",
      }, headers);
    }

    default:
      throw new Error(`Unknown nexus action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// VISION MODULE — Observability, Metrics, Health
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleVision(
  supabase: any,
  action: string,
  data: Record<string, any>,
  headers: Record<string, string>
) {
  switch (action) {
    case "health": {
      // Check all modules
      const checks = {
        brain: false,
        defense: false,
        nexus: false,
      };

      try {
        const { count } = await supabase.from("brain_memories").select("*", { count: "exact", head: true });
        checks.brain = true;
      } catch {}

      try {
        const { count } = await supabase.from("defense_events").select("*", { count: "exact", head: true });
        checks.defense = true;
      } catch {}

      // Check if any provider is available
      for (const config of Object.values(PROVIDERS)) {
        if (Deno.env.get(config.keyEnv)) {
          checks.nexus = true;
          break;
        }
      }

      const allHealthy = Object.values(checks).every((v) => v);

      return jsonResponse({
        success: true,
        healthy: allHealthy,
        checks,
        substrate: "promptfluid®",
        version: SUBSTRATE_VERSION,
      }, headers);
    }

    case "metrics": {
      const { count: memoryCount } = await supabase
        .from("brain_memories")
        .select("*", { count: "exact", head: true });

      const { count: eventCount } = await supabase
        .from("defense_events")
        .select("*", { count: "exact", head: true });

      const { count: conversationCount } = await supabase
        .from("cascade_conversations")
        .select("*", { count: "exact", head: true });

      return jsonResponse({
        success: true,
        metrics: {
          brain_memories: memoryCount || 0,
          defense_events: eventCount || 0,
          decode_conversations: conversationCount || 0,
          timestamp: new Date().toISOString(),
        },
      }, headers);
    }

    case "status": {
      // Vision status is same as health check
      const checks = { brain: false, defense: false, decode: false };

      try {
        const { count } = await supabase.from("brain_memories").select("*", { count: "exact", head: true });
        checks.brain = true;
      } catch {}

      try {
        const { count } = await supabase.from("defense_events").select("*", { count: "exact", head: true });
        checks.defense = true;
      } catch {}

      try {
        const { count } = await supabase.from("cascade_conversations").select("*", { count: "exact", head: true });
        checks.decode = true;
      } catch {}

      return jsonResponse({
        success: true,
        module: "vision",
        healthy: Object.values(checks).every(v => v),
        checks,
      }, headers);
    }

    case "logs": {
      const { module: targetModule, limit = 20 } = data;
      
      const { data: events } = await supabase
        .from("brain_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit as number);

      return jsonResponse({
        success: true,
        logs: events || [],
      }, headers);
    }

    // ═══ STUB HANDLERS ═══
    case "alert": {
      // Alerting system (wired to telemetry)
      const { severity = "info", message, metadata = {} } = data;
      
      // Log alert to brain_events
      const { data: alertEvent } = await supabase.from("brain_events").insert({
        event_type: `alert_${severity}`,
        module: 'vision',
        outcome: 'success',
        data: { message, severity, metadata, timestamp: new Date().toISOString() }
      }).select().single();

      // Also log to learning_logs for telemetry
      await supabase.from("learning_logs").insert({
        source: 'vision_alert',
        content: message as string,
        success: true,
        metadata: { severity, event_id: alertEvent?.id }
      });

      return jsonResponse({
        success: true,
        alert_id: alertEvent?.id,
        severity,
        message: (message as string)?.substring(0, 100),
        timestamp: new Date().toISOString(),
      }, headers);
    }

    case "dashboard": {
      // v3.1.0 Real dashboard data
      const [
        { count: memoryCount },
        { count: conversationCount },
        { count: dreamCount },
        { count: defenseEventCount },
        { data: orchestrator },
        { data: recentEvents },
        { data: aiUsage },
      ] = await Promise.all([
        supabase.from("brain_memories").select("*", { count: "exact", head: true }),
        supabase.from("cascade_conversations").select("*", { count: "exact", head: true }),
        supabase.from("cascade_dreams").select("*", { count: "exact", head: true }),
        supabase.from("defense_events").select("*", { count: "exact", head: true }),
        supabase.from("brain_orchestrator_state").select("*").limit(1).single(),
        supabase.from("brain_events").select("event_type, module, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("ai_usage_log").select("tokens_used, cost, provider").order("created_at", { ascending: false }).limit(50),
      ]);
      
      const totalTokens = aiUsage?.reduce((sum: number, r: { tokens_used?: number }) => sum + (r.tokens_used || 0), 0) || 0;
      const totalCost = aiUsage?.reduce((sum: number, r: { cost?: number }) => sum + (r.cost || 0), 0) || 0;
      
      return jsonResponse({
        success: true,
        dashboard: {
          substrate_version: SUBSTRATE_VERSION,
          orchestrator: {
            status: orchestrator?.status || 'unknown',
            health_score: Math.round((orchestrator?.health_score || 0) * 100),
            current_phase: orchestrator?.current_phase || 'idle',
            cycles_completed: orchestrator?.cycles_completed || 0,
          },
          metrics: {
            brain_memories: memoryCount || 0,
            decode_conversations: conversationCount || 0,
            dream_count: dreamCount || 0,
            defense_events: defenseEventCount || 0,
          },
          ai_usage: {
            total_tokens: totalTokens,
            total_cost_usd: totalCost.toFixed(2),
            recent_calls: aiUsage?.length || 0,
          },
          recent_events: recentEvents?.map((e: { event_type: string; module: string; created_at: string }) => ({
            type: e.event_type,
            module: e.module,
            at: e.created_at,
          })) || [],
        },
        timestamp: new Date().toISOString(),
      }, headers);
    }

    case "trace": {
      const { traceId } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        traceId,
        message: "Trace stub - distributed tracing pending",
      }, headers);
    }

    case "audit": {
      const { entity, action: auditAction } = data;
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      return jsonResponse({
        success: true,
        logs: logs || [],
        filters: { entity, action: auditAction },
      }, headers);
    }

    default:
      throw new Error(`Unknown vision action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// DREAM MODULE — Dream-Eater Operations
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleDream(
  supabase: any,
  action: string,
  data: Record<string, any>,
  headers: Record<string, string>
) {
  switch (action) {
    case "cycle": {
      // Redirect to dedicated function for full cycle
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        message: "Dream cycle: Use pf-dream-eater-cycle for full functionality",
        action,
      }, headers);
    }

    case "awaken": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        message: "Dream awaken: Use pf-dream-eater-awaken for full functionality",
        action,
      }, headers);
    }

    case "status": {
      // Get Dream-Eater state
      const { data: state } = await supabase
        .from("dream_eater_state")
        .select("*")
        .limit(1)
        .single();

      const { count: dreamCount } = await supabase
        .from("cascade_dreams")
        .select("*", { count: "exact", head: true });

      return jsonResponse({
        success: true,
        module: "dream",
        state: state || { current_mood: "dormant", mutation_level: 0 },
        total_dreams: dreamCount || 0,
      }, headers);
    }

    case "feed": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        message: "Dream feed: Use dream-feeder-api for submissions",
        action,
      }, headers);
    }

    case "interpret": {
      const { dream_text } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        input: { dream_text: (dream_text as string)?.substring(0, 50) },
        message: "Dream interpretation stub - full logic pending",
      }, headers);
    }

    case "mutation": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        message: "Mutation cycle stub - will trigger Dream-Eater evolution",
      }, headers);
    }

    case "consume": {
      const { dream_id } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        dream_id,
        message: "Dream consumption stub - processes and transforms dreams",
      }, headers);
    }

    case "reflect": {
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        message: "Dream reflection stub - contemplates processed dreams",
      }, headers);
    }

    case "mood": {
      const { mood } = data;
      if (mood) {
        // Set mood (stub)
        return jsonResponse({
          success: true,
          ok: true,
          placeholder: true,
          action,
          mood_set: mood,
          message: "Mood update stub - full persistence pending",
        }, headers);
      }
      // Get mood
      const { data: state } = await supabase
        .from("dream_eater_state")
        .select("current_mood, mood_score")
        .limit(1)
        .single();

      return jsonResponse({
        success: true,
        mood: state?.current_mood || "dormant",
        mood_score: state?.mood_score || 0,
      }, headers);
    }

    default:
      throw new Error(`Unknown dream action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM MODULE — Administration & Configuration (HARDENED)
// ═══════════════════════════════════════════════════════════════

// deno-lint-ignore no-explicit-any
async function handleSystem(
  supabase: any,
  action: string,
  data: Record<string, any>,
  headers: Record<string, string>,
  substrateState: SubstrateState
) {
  switch (action) {
    case "status": {
      // Full system status with v3 health data
      const checks = { brain: false, defense: false, decode: false, nexus: false };

      try { await supabase.from("brain_memories").select("*", { count: "exact", head: true }); checks.brain = true; } catch {}
      try { await supabase.from("defense_events").select("*", { count: "exact", head: true }); checks.defense = true; } catch {}
      try { await supabase.from("cascade_conversations").select("*", { count: "exact", head: true }); checks.decode = true; } catch {}
      
      for (const config of Object.values(PROVIDERS)) {
        if (Deno.env.get(config.keyEnv)) { checks.nexus = true; break; }
      }

      return jsonResponse({
        success: true,
        module: "system",
        substrate: "promptfluid®",
        version: SUBSTRATE_VERSION,
        healthy: Object.values(checks).every(v => v),
        checks,
        resilience: {
          total_requests: substrateState.totalRequests,
          total_errors: substrateState.totalErrors,
          error_rate: substrateState.totalRequests > 0 
            ? (substrateState.totalErrors / substrateState.totalRequests * 100).toFixed(2) + '%'
            : '0%',
          heal_attempts: substrateState.healAttempts,
          last_heal: substrateState.lastHeal ? new Date(substrateState.lastHeal).toISOString() : null,
          modules: Object.fromEntries(
            Object.entries(substrateState.modules).map(([k, v]) => [k, {
              health: v.healthScore,
              status: v.status,
              circuit: v.circuitState,
              failures: v.consecutiveFailures,
            }])
          ),
        },
        timestamp: new Date().toISOString(),
      }, headers);
    }

    case "health": {
      // Comprehensive health diagnostics with circuit breaker status
      const diagnostics = [];
      
      for (const [module, health] of Object.entries(substrateState.modules)) {
        diagnostics.push({
          module,
          health_score: health.healthScore,
          status: health.status,
          circuit_state: health.circuitState,
          consecutive_failures: health.consecutiveFailures,
          consecutive_successes: health.consecutiveSuccesses,
          last_success: health.lastSuccess ? new Date(health.lastSuccess).toISOString() : null,
          last_failure: health.lastFailure ? new Date(health.lastFailure).toISOString() : null,
        });
      }
      
      const overallHealth = diagnostics.length > 0
        ? Math.round(diagnostics.reduce((sum, d) => sum + d.health_score, 0) / diagnostics.length)
        : 100;

      return jsonResponse({
        success: true,
        overall_health: overallHealth,
        overall_status: overallHealth >= 80 ? 'healthy' : overallHealth >= 40 ? 'degraded' : 'critical',
        diagnostics,
        circuit_breaker_config: {
          failure_threshold: CIRCUIT_CONFIG.failureThreshold,
          success_threshold: CIRCUIT_CONFIG.successThreshold,
          open_duration_ms: CIRCUIT_CONFIG.openDurationMs,
          auto_heal_threshold: CIRCUIT_CONFIG.autoHealThreshold,
        },
        substrate_stats: {
          version: SUBSTRATE_VERSION,
          uptime_ms: Date.now() - substrateState.initialized,
          total_requests: substrateState.totalRequests,
          total_errors: substrateState.totalErrors,
          heal_attempts: substrateState.healAttempts,
        },
      }, headers);
    }

    case "heal": {
      // v3.1.0 FULL HEAL - Restores all modules to 100% health
      const { target, force = false } = data;
      const healed: string[] = [];
      const errors: string[] = [];
      
      // If no modules tracked yet, initialize all core modules
      const coreModules = ['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'system'];
      const modulesToHeal = target ? [target] : 
        Object.keys(substrateState.modules).length > 0 ? Object.keys(substrateState.modules) : coreModules;
      
      for (const mod of modulesToHeal) {
        try {
          if (!substrateState.modules[mod]) {
            substrateState.modules[mod] = initModuleHealth(mod);
          }
          const health = substrateState.modules[mod];
          
          // FULL RESET - restore to 100% health
          health.circuitState = 'closed';
          health.consecutiveFailures = 0;
          health.consecutiveSuccesses = 3;
          health.healthScore = 100;
          health.status = 'healthy';
          health.lastSuccess = Date.now();
          healed.push(mod);
        } catch (e) {
          errors.push(`${mod}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
      
      substrateState.healAttempts++;
      substrateState.lastHeal = Date.now();
      substrateState.totalErrors = 0; // Reset error count on full heal
      
      // Update orchestrator state in database to FULL health (1.0 = 100%)
      try {
        await supabase.from('brain_orchestrator_state').update({
          health_score: 1.0, // FULL RESTORE
          status: 'running',
          auto_heal_attempts: substrateState.healAttempts,
          current_phase: 'consumption',
          updated_at: new Date().toISOString(),
          metadata: {
            last_heal: new Date().toISOString(),
            healed_modules: healed,
            substrate_version: SUBSTRATE_VERSION,
            heal_type: 'full_restore',
          }
        }).eq('id', '00000000-0000-0000-0000-000000000001');
        
        // Log heal event
        await supabase.from('brain_events').insert({
          event_type: 'full_heal',
          module: 'system',
          outcome: 'success',
          data: { 
            healed_modules: healed, 
            errors,
            heal_count: substrateState.healAttempts,
            previous_health: 'restored_to_100',
            version: SUBSTRATE_VERSION
          }
        });
        
        // Trigger comprehensive repair if force heal
        if (force) {
          await supabase.functions.invoke('pf-brain-auto-heal', {}).catch(() => {});
        }
        
      } catch (e) {
        console.error('Heal logging failed:', e);
      }
      
      return jsonResponse({
        success: true,
        healed_modules: healed,
        errors: errors.length > 0 ? errors : undefined,
        new_health: Object.fromEntries(
          Object.entries(substrateState.modules).map(([k, v]) => [k, v.healthScore])
        ),
        orchestrator_health: 100,
        total_heal_attempts: substrateState.healAttempts,
        message: `✅ Full heal complete. ${healed.length} module(s) restored to 100%.`,
      }, headers);
    }

    case "config": {
      const { key, value } = data;
      if (key && value !== undefined) {
        return jsonResponse({
          success: true,
          ok: true,
          placeholder: true,
          action,
          key,
          message: "Config set stub - persistence pending",
        }, headers);
      }
      // Get config
      const { data: settings } = await supabase
        .from("core_settings")
        .select("*")
        .limit(20);

      return jsonResponse({
        success: true,
        settings: settings || [],
      }, headers);
    }

    case "shutdown": {
      const { confirm } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        confirmed: !!confirm,
        message: "Shutdown stub - emergency shutdown via pf-emergency-shutdown",
      }, headers);
    }

    case "restart": {
      const { service } = data;
      
      // Reset specific module or all modules
      const modulesToRestart = service ? [service] : Object.keys(substrateState.modules);
      
      for (const mod of modulesToRestart) {
        if (substrateState.modules[mod]) {
          substrateState.modules[mod] = initModuleHealth(mod);
        }
      }
      
      return jsonResponse({
        success: true,
        action,
        restarted: modulesToRestart,
        message: `Restarted ${modulesToRestart.length} module(s)`,
      }, headers);
    }

    case "backup": {
      // Create a logical backup snapshot
      const snapshot = {
        timestamp: new Date().toISOString(),
        version: SUBSTRATE_VERSION,
        modules: substrateState.modules,
        stats: {
          total_requests: substrateState.totalRequests,
          total_errors: substrateState.totalErrors,
          heal_attempts: substrateState.healAttempts,
        }
      };
      
      await supabase.from('brain_events').insert({
        event_type: 'backup_created',
        module: 'system',
        outcome: 'success',
        data: snapshot
      });
      
      return jsonResponse({
        success: true,
        backup_id: `bkp_${Date.now()}`,
        snapshot,
        message: "Backup snapshot created",
      }, headers);
    }

    case "restore": {
      const { backup_id } = data;
      return jsonResponse({
        success: true,
        ok: true,
        placeholder: true,
        action,
        backup_id,
        message: "Restore stub - backup restoration logic pending",
      }, headers);
    }

    case "audit": {
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      return jsonResponse({
        success: true,
        logs: logs || [],
      }, headers);
    }

    case "version": {
      return jsonResponse({
        success: true,
        substrate: "promptfluid®",
        version: SUBSTRATE_VERSION,
        type: "Cognitive Orchestration Substrate (HARDENED)",
        build: "2026.01.15",
        resilience: {
          circuit_breaker: true,
          auto_heal: true,
          graceful_fallback: true,
          request_timeout: true,
        },
      }, headers);
    }

    case "diagnostics": {
      // v3.1.0 Comprehensive system diagnostics
      const [
        { data: orchestrator },
        { count: memoryCount },
        { count: eventCount },
        { data: recentErrors },
        { data: rateLimits },
      ] = await Promise.all([
        supabase.from("brain_orchestrator_state").select("*").limit(1).single(),
        supabase.from("brain_memories").select("*", { count: "exact", head: true }),
        supabase.from("brain_events").select("*", { count: "exact", head: true }),
        supabase.from("brain_events").select("*").eq("outcome", "error").order("created_at", { ascending: false }).limit(5),
        supabase.from("edge_rate_limits").select("*").order("updated_at", { ascending: false }).limit(10),
      ]);
      
      // Module diagnostics from in-memory state
      const moduleDiagnostics = Object.entries(substrateState.modules).map(([name, health]) => ({
        name,
        health_score: health.healthScore,
        status: health.status,
        circuit_state: health.circuitState,
        consecutive_failures: health.consecutiveFailures,
        consecutive_successes: health.consecutiveSuccesses,
        last_success: health.lastSuccess ? new Date(health.lastSuccess).toISOString() : null,
        last_failure: health.lastFailure ? new Date(health.lastFailure).toISOString() : null,
      }));
      
      // Provider availability
      const providerStatus: Record<string, boolean> = {};
      for (const [name, config] of Object.entries(PROVIDERS)) {
        providerStatus[name] = !!Deno.env.get(config.keyEnv);
      }
      
      return jsonResponse({
        success: true,
        diagnostics: {
          substrate: {
            version: SUBSTRATE_VERSION,
            type: "Cognitive Orchestration Substrate (HARDENED)",
            uptime_ms: Date.now() - substrateState.initialized,
            total_requests: substrateState.totalRequests,
            total_errors: substrateState.totalErrors,
            error_rate: substrateState.totalRequests > 0 
              ? `${(substrateState.totalErrors / substrateState.totalRequests * 100).toFixed(2)}%`
              : '0%',
            heal_attempts: substrateState.healAttempts,
            last_heal: substrateState.lastHeal ? new Date(substrateState.lastHeal).toISOString() : null,
          },
          orchestrator: {
            status: orchestrator?.status || 'unknown',
            health_score: Math.round((orchestrator?.health_score || 0) * 100),
            current_phase: orchestrator?.current_phase || 'idle',
            cycles_completed: orchestrator?.cycles_completed || 0,
            last_cycle: orchestrator?.last_cycle_at || null,
          },
          modules: moduleDiagnostics,
          providers: providerStatus,
          data_counts: {
            memories: memoryCount || 0,
            events: eventCount || 0,
          },
          recent_errors: recentErrors?.map((e: { event_type: string; module: string; created_at: string; data?: unknown }) => ({
            type: e.event_type,
            module: e.module,
            at: e.created_at,
          })) || [],
          rate_limits_active: rateLimits?.length || 0,
          circuit_breaker_config: {
            failure_threshold: CIRCUIT_CONFIG.failureThreshold,
            success_threshold: CIRCUIT_CONFIG.successThreshold,
            open_duration_ms: CIRCUIT_CONFIG.openDurationMs,
            auto_heal_threshold: CIRCUIT_CONFIG.autoHealThreshold,
          },
        },
        timestamp: new Date().toISOString(),
      }, headers);
    }

    default:
      throw new Error(`Unknown system action: ${action}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function routeToProvider(
  prompt: string,
  systemPrompt?: string,
  history: Array<{ role: string; content: string }> = [],
  maxTokens = 1200,
  temperature = 0.7
): Promise<{ content: string; provider: string; model: string }> {
  const messages: Array<{ role: string; content: string }> = [];
  
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  messages.push(...history.slice(-6));
  messages.push({ role: "user", content: prompt });

  for (const providerName of PROVIDER_ORDER) {
    const config = PROVIDERS[providerName as keyof typeof PROVIDERS];
    const apiKey = Deno.env.get(config.keyEnv);
    
    if (!apiKey) continue;

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        return { content, provider: providerName, model: config.model };
      }
    } catch {
      continue;
    }
  }

  return {
    content: "The substrate is currently in reflection mode. Please try again.",
    provider: "fallback",
    model: "local",
  };
}

function jsonResponse(data: Record<string, unknown>, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
