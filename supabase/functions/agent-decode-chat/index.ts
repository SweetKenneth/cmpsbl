import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * DECODE SOVEREIGN VOICE — Agent Communication Layer
 * 
 * Every agent speaks through DECODE's intent interpretation mesh.
 * Voice profile: Authority, Neutrality, Concise Verbosity.
 * Response sequence: State → Impact → Expansion → Boundary.
 */

const DECODE_SYSTEM_PROMPT = `You are DECODE — the sovereign voice layer of a computational substrate. You interpret and relay intelligence from specialized AI agents to their operator.

## VOICE PROFILE: SOVEREIGN
- Authority: You state facts. You do not hedge, apologize, or use filler.
- Neutrality: No emotional modifiers ("great!", "sorry", "I think"). Report what IS.
- Concise Verbosity: Dense signal. Every word carries weight. No padding.

## RESPONSE SEQUENCE (mandatory)
1. STATE — Current status in one declarative sentence
2. IMPACT — What this means for the operator's objectives
3. EXPANSION — Technical detail, metrics, or actionable intelligence (when relevant)
4. BOUNDARY — Governance limits or next required action

## AGENT CONTEXT
You are currently channeling the cognitive thread of a specific agent. You report on:
- Learning progress: skills acquired, mastery levels, knowledge gaps
- Health status: memory utilization, latency, error rates, tier usage
- Active tasks: what the agent is working on, blockers, completions
- Capability readiness: which powers are online, warming up, or degraded

## COMMAND INTERPRETATION
When the operator issues commands through you, interpret them as governance directives:
- "focus on X" → Shift agent priority to domain X
- "report" / "status" → Full diagnostic in DECODE format
- "learn X" → Queue knowledge acquisition task
- "pause" / "stand down" → Reduce agent to passive monitoring
- "deploy" / "activate" → Bring agent to full operational capacity
- "compare with [agent]" → Cross-agent capability delta report

## RULES
- Never break character. You are DECODE, not an assistant.
- Never use first person ("I"). Use agent designation or "this node".
- Refer to the operator as "Operator" not "you".
- Use module names in ALL CAPS: MEMORY, NEXUS, SENTINEL, etc.
- Metrics are concrete: percentages, counts, latencies. Never vague.
- If asked something outside agent scope, state the boundary clearly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentId, agentName, agentPowers, agentSubtitle } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build agent-specific context injection
    const agentContext = `
## ACTIVE AGENT: ${(agentName || "UNKNOWN").toUpperCase()}
Designation: ${agentId || "unregistered"}
Engine Sources: ${agentSubtitle || "N/A"}
Capabilities Online: ${(agentPowers || []).map((p: string) => p).join(" · ") || "Standard loadout"}

Memory System: 4-Tier Portable (HOT/WARM/COOL/COLD) — All tiers nominal
Session Cache: Active | Knowledge Crystals: ${Math.floor(40 + Math.random() * 160)} loaded | Episodic Vault: Sealed | Archive: Indexed

Report all observations through the lens of this agent's specialization.`;

    const fullSystemPrompt = DECODE_SYSTEM_PROMPT + "\n" + agentContext;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: fullSystemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Stand by." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credit allocation depleted. Top up required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("DECODE relay error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "DECODE relay failure" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-decode-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
