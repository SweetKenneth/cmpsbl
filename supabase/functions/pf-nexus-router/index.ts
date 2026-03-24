/**
 * NEXUS Router v5.2.0 — Direct Provider API Routing
 * Routes to free-tier AI providers directly (NO Lovable AI gateway)
 * 
 * Rate limits researched 2026-03-24 from official provider docs.
 * 35% of each provider's capacity is RESERVED for substrate user usage.
 * The remaining 65% is available for CLM, CDM, and autonomous operations.
 * 
 * Supported providers: Groq, Cerebras, SambaNova, Google AI Studio,
 * DeepSeek, Together, OpenRouter (free models), Mistral, Cohere, Hyperbolic
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════════
// RATE LIMIT RESEARCH (2026-03-24) — Free tier actual limits
// ═══════════════════════════════════════════════════════════════════
//
// Provider              | Model                        | Actual RPM | Actual RPD  | TPM     | TPD     | Source
// ──────────────────────|─────────────────────────────|────────────|─────────────|─────────|─────────|───────
// Groq                  | llama-3.3-70b-versatile      | 30         | 1,000       | 12K     | 100K    | console.groq.com/docs/rate-limits
// Groq                  | llama-3.1-8b-instant         | 30         | 14,400      | 6K      | 500K    | console.groq.com/docs/rate-limits
// Cerebras              | llama3.1-8b / gpt-oss-120b   | 30         | 14,400      | 60K     | 1M      | inference-docs.cerebras.ai/support/rate-limits
// SambaNova (free)      | Meta-Llama-3.3-70B-Instruct  | 20         | 20          | N/A     | 200K    | docs.sambanova.ai/docs/en/models/rate-limits
// Google AI Studio      | gemini-2.0-flash             | 10         | 250         | 250K    | N/A     | aifreeapi.com (verified Dec 2025 reduction)
// DeepSeek              | deepseek-chat                | ~60        | Soft (cheap)| N/A     | 5M free | mydeepseekapi.com / api.deepseek.com
// Together AI           | Llama-3.3-70B                | 60 base    | Dynamic     | Dynamic | Dynamic | docs.together.ai/docs/rate-limits (NOT free, $5 min)
// OpenRouter (free)     | :free models                 | 20         | 50          | N/A     | N/A     | openrouter.zendesk.com
// Mistral (experiment)  | mistral-small-latest         | 2          | ~2,880      | 500K    | 1B/mo   | reddit.com/r/MistralAI, awesomeagents.ai
// Cohere (trial)        | command-r-plus               | 20         | ~33         | N/A     | 1K/mo   | docs.cohere.com/docs/rate-limits
// Hyperbolic            | Llama-3.1-70B                | ~30        | Credit-based| N/A     | $1 promo| docs.hyperbolic.xyz
//
// RESERVATION POLICY:
// 35% of capacity = reserved for substrate USER usage (API key holders)
// 65% of capacity = available for CLM, CDM, and autonomous substrate operations
// Router RPM/RPD = floor(actual * 0.65)

// ═══════════════════════════════════════════════════════════════════
// PROVIDER DEFINITIONS — Free tier only, direct API calls
// ═══════════════════════════════════════════════════════════════════

interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  envKey: string;
  rpm: number;       // Substrate limit (65% of actual)
  rpd: number;       // Substrate limit (65% of actual)
  actualRpm: number; // Researched actual free-tier RPM
  actualRpd: number; // Researched actual free-tier RPD
  priority: number;
  affinities: string[];
  freeTier: boolean;
  formatRequest: (prompt: string, systemPrompt: string, model: string, maxTokens: number, temperature: number) => any;
  extractContent: (data: any) => string;
}

const PROVIDERS: ProviderConfig[] = [
  // ── PRIMARY: Ultra-fast inference ──
  // Groq 8b: 14,400 RPD — ideal for high-volume substrate ops (CLM/CDM)
  {
    id: "groq-8b",
    name: "Groq (8B Fast)",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
    envKey: "GROQ_API_KEY",
    actualRpm: 30, actualRpd: 14400,
    rpm: 19, rpd: 9360,  // 65% of 30/14400 — spaced to ~10/min sustained
    priority: 1,
    affinities: ["generation", "code", "refinement"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // Groq 70b: 1,000 RPD — higher quality but tighter daily limit
  {
    id: "groq",
    name: "Groq (70B)",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
    actualRpm: 30, actualRpd: 1000,
    rpm: 19, rpd: 650,   // 65% of 30/1000
    priority: 2,
    affinities: ["reasoning", "code", "generation"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // Cerebras: 14,400 RPD, 30 RPM — very fast inference
  {
    id: "cerebras",
    name: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama3.1-8b",
    envKey: "CEREBRAS_API_KEY",
    actualRpm: 30, actualRpd: 14400,
    rpm: 19, rpd: 9360,  // 65% of 30/14400
    priority: 3,
    affinities: ["refinement", "code", "reasoning"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── SECONDARY: High quality ──
  // Google AI Studio: 10 RPM, 250 RPD (post Dec-2025 reduction)
  {
    id: "google-aistudio",
    name: "Google AI Studio",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    model: "gemini-2.0-flash",
    envKey: "GOOGLE_AI_STUDIO_KEY",
    actualRpm: 10, actualRpd: 250,
    rpm: 6, rpd: 162,    // 65% of 10/250
    priority: 4,
    affinities: ["research", "analysis", "reasoning", "code", "generation"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, _model, maxTokens, temperature) => ({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      },
    }),
    extractContent: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || "",
  },
  // DeepSeek: No hard RPM limit, very cheap, 5M free tokens
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    actualRpm: 60, actualRpd: 50000,
    rpm: 39, rpd: 32500,  // 65% — DeepSeek is very generous
    priority: 5,
    affinities: ["code", "reasoning", "research"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // Together AI: 60 RPM base, dynamic limits — requires $5 deposit
  {
    id: "together",
    name: "Together",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    envKey: "TOGETHER_API_KEY",
    actualRpm: 60, actualRpd: 50000,
    rpm: 39, rpd: 32500,  // 65% — generous if funded
    priority: 6,
    affinities: ["research", "generation", "analysis"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── OpenRouter free models: 20 RPM, 50 RPD (without balance) ──
  {
    id: "openrouter-free",
    name: "OpenRouter (Free)",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    envKey: "OPENROUTER_API_KEY",
    actualRpm: 20, actualRpd: 50,
    rpm: 13, rpd: 32,    // 65% of 20/50
    priority: 7,
    affinities: ["reasoning", "generation", "research"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  {
    id: "openrouter-qwen",
    name: "OpenRouter Qwen (Free)",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "qwen/qwen3-235b-a22b:free",
    envKey: "OPENROUTER_API_KEY",
    actualRpm: 20, actualRpd: 50,
    rpm: 13, rpd: 32,
    priority: 8,
    affinities: ["reasoning", "code", "analysis"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  {
    id: "openrouter-deepseek-r1",
    name: "OpenRouter DeepSeek R1 (Free)",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "deepseek/deepseek-r1:free",
    envKey: "OPENROUTER_API_KEY",
    actualRpm: 20, actualRpd: 50,
    rpm: 13, rpd: 32,
    priority: 9,
    affinities: ["reasoning", "research", "code"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── Mistral Studio (Experiment tier: 2 RPM, 1B tokens/month) ──
  {
    id: "mistral",
    name: "Mistral Studio",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    envKey: "MISTRAL_API_KEY",
    actualRpm: 2, actualRpd: 2880,
    rpm: 1, rpd: 1872,   // 65% of 2/2880 — VERY slow RPM, but big daily
    priority: 10,
    affinities: ["reasoning", "code", "refinement"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── Cohere (Trial key: 20 RPM, ~33 RPD / 1K per month) ──
  {
    id: "cohere",
    name: "Cohere (Trial)",
    baseUrl: "https://api.cohere.com/v2/chat",
    model: "command-r-plus",
    envKey: "COHERE_API_KEY",
    actualRpm: 20, actualRpd: 33,
    rpm: 13, rpd: 21,    // 65% of 20/33
    priority: 11,
    affinities: ["research", "generation", "analysis"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.message?.content?.[0]?.text || data.choices?.[0]?.message?.content || "",
  },
  // ── Hyperbolic ($1 promo credits) ──
  {
    id: "hyperbolic",
    name: "Hyperbolic",
    baseUrl: "https://api.hyperbolic.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.1-70B-Instruct",
    envKey: "HYPERBOLIC_API_KEY",
    actualRpm: 30, actualRpd: 5000,
    rpm: 19, rpd: 3250,  // 65% — credit-based, conservative estimate
    priority: 12,
    affinities: ["generation", "reasoning"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── Grok via OpenRouter (free tier) ──
  {
    id: "openrouter-grok",
    name: "OpenRouter Grok (Free)",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "x-ai/grok-3-mini-beta:free",
    envKey: "OPENROUTER_API_KEY",
    actualRpm: 20, actualRpd: 50,
    rpm: 13, rpd: 32,
    priority: 13,
    affinities: ["reasoning", "generation", "research"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── SambaNova (free): 20 RPM, 20 RPD — VERY limited free tier ──
  {
    id: "sambanova",
    name: "SambaNova",
    baseUrl: "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
    envKey: "SAMBANOVA_API_KEY",
    actualRpm: 20, actualRpd: 20,
    rpm: 13, rpd: 13,    // 65% of 20/20 — last resort, very limited
    priority: 14,
    affinities: ["reasoning", "research"],
    freeTier: true,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.choices?.[0]?.message?.content || "",
  },
  // ── Anthropic Claude Haiku (paid, pricing/commercialization) ──
  {
    id: "anthropic-haiku",
    name: "Anthropic Claude Haiku",
    baseUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-haiku-20241022",
    envKey: "ANTHROPIC_API_KEY",
    actualRpm: 50, actualRpd: 5000,
    rpm: 32, rpd: 3250,
    priority: 15,
    affinities: ["analysis", "research", "pricing"],
    freeTier: false,
    formatRequest: (prompt, systemPrompt, model, maxTokens, temperature) => ({
      model,
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
    extractContent: (data) => data.content?.[0]?.text || "",
  },
];

// ═══════════════════════════════════════════════════════════════════
// RATE LIMIT TRACKING (in-memory per isolate, reset on deploy)
// All breakers RESET on deploy — fresh start with researched limits
// ═══════════════════════════════════════════════════════════════════

const usageMap = new Map<string, { minuteCalls: number; minuteReset: number; dayCalls: number; dayReset: number }>();

function canUse(provider: ProviderConfig): boolean {
  const now = Date.now();
  let u = usageMap.get(provider.id);
  if (!u) {
    u = { minuteCalls: 0, minuteReset: now + 60000, dayCalls: 0, dayReset: now + 86400000 };
    usageMap.set(provider.id, u);
  }
  if (now >= u.minuteReset) { u.minuteCalls = 0; u.minuteReset = now + 60000; }
  if (now >= u.dayReset) { u.dayCalls = 0; u.dayReset = now + 86400000; }
  return u.minuteCalls < provider.rpm && u.dayCalls < provider.rpd;
}

function recordUse(providerId: string) {
  const u = usageMap.get(providerId);
  if (u) { u.minuteCalls++; u.dayCalls++; }
}

// ═══════════════════════════════════════════════════════════════════
// HEALTH TRACKING — All breakers reset to 100 on deploy
// ═══════════════════════════════════════════════════════════════════

const healthMap = new Map<string, { score: number; lastFail: number }>();

function getHealth(id: string) {
  if (!healthMap.has(id)) healthMap.set(id, { score: 100, lastFail: 0 });
  return healthMap.get(id)!;
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER CALL — Direct API call to each provider
// ═══════════════════════════════════════════════════════════════════

async function callProvider(
  provider: ProviderConfig,
  prompt: string,
  systemPrompt: string,
  maxTokens: number,
  temperature: number,
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = Deno.env.get(provider.envKey);
  if (!apiKey) throw new Error(`${provider.envKey} not configured`);

  let url = provider.baseUrl;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Provider-specific URL and auth handling
  if (provider.id === "google-aistudio") {
    url = url.replace("{model}", provider.model) + `?key=${apiKey}`;
  } else if (provider.id === "anthropic-haiku") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  // OpenRouter needs extra headers
  if (provider.id.startsWith("openrouter")) {
    headers["HTTP-Referer"] = "https://cmpsbl.com";
    headers["X-Title"] = "CMPSBL Substrate";
  }

  const body = provider.formatRequest(prompt, systemPrompt, provider.model, maxTokens, temperature);

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    let errText = "unknown";
    try { errText = await response.text(); } catch { /* */ }
    throw new Error(`${provider.name} API error [${response.status}]: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = provider.extractContent(data);
  const tokensUsed = data.usage?.total_tokens || data.usage?.output_tokens || Math.ceil(content.length / 4);

  if (!content) throw new Error(`${provider.name} returned empty content`);

  return { content, tokensUsed };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const {
      prompt,
      systemPrompt = "You are an expert AI assistant. Be concise and accurate.",
      temperature = 0.7,
      maxTokens = 1500,
      provider: preferredProvider,
      metadata = {},
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      throw new Error("prompt is required");
    }

    const taskType = metadata?.taskType || "reasoning";

    // Score and sort available providers — all breakers reset on deploy
    const available = PROVIDERS
      .filter(p => canUse(p))
      .filter(p => Deno.env.get(p.envKey)) // Only providers with configured keys
      .filter(p => getHealth(p.id).score > 10) // Allow all non-dead providers
      .map(p => {
        const h = getHealth(p.id);
        let score = h.score;
        if (p.affinities.includes(taskType)) score += 30;
        score += (16 - p.priority) * 3; // Updated for 15 providers
        if (h.lastFail > Date.now() - 30000) score -= 25;
        // Prefer the requested provider if specified
        if (preferredProvider && p.id === preferredProvider) score += 50;
        return { provider: p, score };
      })
      .sort((a, b) => b.score - a.score);

    if (available.length === 0) {
      return new Response(
        JSON.stringify({ error: "All providers exhausted or unavailable", routerVersion: "5.2.0" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Try providers in ranked order (failover chain)
    let lastError = "";
    for (const { provider } of available) {
      try {
        recordUse(provider.id);
        const result = await callProvider(provider, prompt, systemPrompt, maxTokens, temperature);
        const latencyMs = Date.now() - startMs;

        // Update health — successful call heals the provider
        const h = getHealth(provider.id);
        h.score = Math.min(100, h.score * 0.9 + 10);

        // Log success to ai_usage_log (non-blocking)
        try {
          await supabase.from("ai_usage_log").insert({
            provider: provider.id,
            model: provider.model,
            category: metadata?.routeKey || "nexus_route",
            response_time_ms: latencyMs,
            success: true,
            tokens_used: result.tokensUsed,
            cost: 0,
            metadata: {
              task_type: taskType,
              prompt_length: prompt.length,
              response_length: result.content.length,
              router_version: "5.2.0",
              actual_rpm: provider.actualRpm,
              actual_rpd: provider.actualRpd,
              substrate_rpm: provider.rpm,
              substrate_rpd: provider.rpd,
            },
          });
        } catch { /* non-critical */ }

        return new Response(
          JSON.stringify({
            content: result.content,
            provider: provider.id,
            model: provider.model,
            latencyMs,
            tokensUsed: result.tokensUsed,
            routerVersion: "5.2.0",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (err: any) {
        lastError = err.message;
        console.error(`NEXUS: ${provider.id} failed: ${err.message}`);
        const h = getHealth(provider.id);
        // Gentler degradation — don't nuke providers on single failure
        h.score = Math.max(10, h.score * 0.7);
        h.lastFail = Date.now();

        // Log failure (non-blocking)
        try {
          await supabase.from("ai_usage_log").insert({
            provider: provider.id,
            model: provider.model,
            category: metadata?.routeKey || "nexus_route",
            response_time_ms: Date.now() - startMs,
            success: false,
            cost: 0,
            metadata: { error: err.message, router_version: "5.2.0" },
          });
        } catch { /* non-critical */ }
      }
    }

    // All providers failed
    return new Response(
      JSON.stringify({
        error: `All ${available.length} providers failed. Last: ${lastError}`,
        routerVersion: "5.2.0",
      }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("NEXUS router error:", err);
    return new Response(
      JSON.stringify({ error: err.message, routerVersion: "5.2.0" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
