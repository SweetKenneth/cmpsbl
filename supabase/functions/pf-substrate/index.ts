/**
 * promptfluid® substrate — Unified Cognitive Orchestration
 * v2026.01 — The core substrate that coordinates all modules
 * 
 * Modules:
 * - brain: Memory, learning cycles, reflection
 * - decode: Intent decoding, cognitive interface
 * - defense: Bot detection, threat analysis
 * - nexus: Multi-provider AI routing
 * - vision: Observability, metrics, health
 * 
 * promptfluid® is a cognitive orchestration substrate that provides routing,
 * memory, learning cycles, observability, defense, and execution coordination
 * for AI systems. Model-agnostic. Provider-agnostic. Runs on commodity cloud.
 * 
 * @author Kenneth E Sweet Jr
 * @license Apache-2.0 (core) / GPL-2.0 (WordPress plugins)
 * @contact promptfluid@gmail.com | (760) FLUID-AI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUBSTRATE_VERSION = "2026.01";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.json();
    const { module, action, payload, data } = body;
    const params = payload || data || {}; // Support both payload (client) and data (legacy)

    console.log(`⚡ substrate v${SUBSTRATE_VERSION} | ${module}/${action}`);

    // Route to appropriate module
    switch (module) {
      case "brain":
        return await handleBrain(supabase, action, params, corsHeaders);
      
      case "decode":
      case "cascade": // backwards compatibility
        return await handleDecode(supabase, action, params, req, corsHeaders);
      
      case "defense":
        return await handleDefense(supabase, action, params, corsHeaders);
      
      case "nexus":
        return await handleNexus(supabase, action, params, corsHeaders);
      
      case "vision":
        return await handleVision(supabase, action, params, corsHeaders);
      
      case "status":
        return new Response(
          JSON.stringify({
            success: true,
            substrate: "promptfluid®",
            version: SUBSTRATE_VERSION,
            type: "Cognitive Orchestration Substrate",
            modules: ["brain", "decode", "defense", "nexus", "vision"],
            status: "operational",
            timestamp: new Date().toISOString(),
            latency_ms: Date.now() - startTime,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      default:
        throw new Error(`Unknown module: ${module}`);
    }
  } catch (error) {
    console.error("❌ substrate error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        substrate: "promptfluid®",
        version: SUBSTRATE_VERSION,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

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

    default:
      throw new Error(`Unknown vision action: ${action}`);
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
