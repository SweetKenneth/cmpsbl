/**
 * NEXUS Shared Router — Importable multi-provider cascade
 * 
 * Usage in any edge function:
 *   import { nexusRoute } from "../_shared/nexus-route.ts";
 *   const result = await nexusRoute(prompt, { systemPrompt: "...", taskType: "reasoning" });
 *   console.log(result.content, result.provider, result.latencyMs);
 * 
 * Supports: Groq fleet, Cerebras, Google AI Studio, OpenRouter (free),
 *           DeepSeek, Together, SambaNova, Hyperbolic, Mistral, Cohere
 * 
 * Features:
 * - Health-weighted provider scoring with affinity matching
 * - Circuit breaker (3 failures → open for 60s → half-open probe)
 * - Per-minute / per-day rate limit tracking
 * - 30s timeout per provider call
 * - Auto-cascade through full fleet on failure
 */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface NexusRouteOptions {
  systemPrompt?: string;
  taskType?: string;            // "reasoning" | "code" | "generation" | "research" | "refinement" | "analysis"
  temperature?: number;
  maxTokens?: number;
  preferProvider?: string;      // Force-prefer a specific provider id
  tools?: any[];                // OpenAI-compatible tool definitions
  toolChoice?: any;             // Tool choice directive
  timeoutMs?: number;           // Per-provider timeout (default 30000)
}

export interface NexusRouteResult {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  tokensUsed: number;
  attempts: number;
  fallbackChain: string[];
}

interface ProviderDef {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  envKey: string;
  rpm: number;
  rpd: number;
  priority: number;
  affinities: string[];
  isGoogleFormat?: boolean;
  isCohereFormat?: boolean;
  extraHeaders?: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════
// PROVIDER FLEET
// ═══════════════════════════════════════════════════════════

const PROVIDERS: ProviderDef[] = [
  // ── TIER 1: Ultra-fast inference ──
  {
    id: "groq", name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 950, priority: 1,
    affinities: ["reasoning", "code", "generation"],
  },
  {
    id: "groq-8b", name: "Groq 8B",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 13680, priority: 2,
    affinities: ["generation", "refinement"],
  },
  {
    id: "groq-scout", name: "Groq Scout",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 950, priority: 3,
    affinities: ["reasoning", "analysis"],
  },
  {
    id: "cerebras", name: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama-3.3-70b",
    envKey: "CEREBRAS_API_KEY",
    rpm: 28, rpd: 13680, priority: 4,
    affinities: ["refinement", "code", "reasoning"],
  },
  // ── TIER 2: High quality / generous limits ──
  {
    id: "google-ai", name: "Google AI Studio",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    model: "gemini-2.0-flash",
    envKey: "GOOGLE_AI_STUDIO_KEY",
    rpm: 14, rpd: 1425, priority: 5,
    affinities: ["research", "analysis", "reasoning", "code", "generation"],
    isGoogleFormat: true,
  },
  {
    id: "deepseek", name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    rpm: 19, rpd: 99999, priority: 6,
    affinities: ["code", "reasoning", "research"],
  },
  {
    id: "together", name: "Together",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    envKey: "TOGETHER_API_KEY",
    rpm: 570, rpd: 99999, priority: 7,
    affinities: ["research", "generation", "analysis"],
  },
  {
    id: "sambanova", name: "SambaNova",
    baseUrl: "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
    envKey: "SAMBANOVA_API_KEY",
    rpm: 38, rpd: 38, priority: 8,
    affinities: ["reasoning", "research"],
  },
  // ── TIER 3: OpenRouter free models ──
  {
    id: "openrouter-free", name: "OpenRouter Free",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 9,
    affinities: ["reasoning", "generation", "research"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  {
    id: "openrouter-qwen", name: "OpenRouter Qwen",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "qwen/qwen3-235b-a22b:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 10,
    affinities: ["reasoning", "code", "analysis"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  {
    id: "openrouter-deepseek-r1", name: "OpenRouter DeepSeek R1",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "deepseek/deepseek-r1:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 11,
    affinities: ["reasoning", "research", "code"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  // ── TIER 4: Extended fleet ──
  {
    id: "hyperbolic", name: "Hyperbolic",
    baseUrl: "https://api.hyperbolic.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.1-70B-Instruct",
    envKey: "HYPERBOLIC_API_KEY",
    rpm: 57, rpd: 99999, priority: 12,
    affinities: ["generation", "reasoning"],
  },
  {
    id: "mistral", name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    envKey: "MISTRAL_API_KEY",
    rpm: 24, rpd: 530, priority: 13,
    affinities: ["reasoning", "code", "refinement"],
  },
  {
    id: "cohere", name: "Cohere",
    baseUrl: "https://api.cohere.com/v2/chat",
    model: "command-r-plus",
    envKey: "COHERE_API_KEY",
    rpm: 10, rpd: 26, priority: 14,
    affinities: ["research", "generation", "analysis"],
    isCohereFormat: true,
  },
];

// ═══════════════════════════════════════════════════════════
// IN-MEMORY STATE (per edge function isolate)
// ═══════════════════════════════════════════════════════════

const healthMap = new Map<string, {
  score: number;
  consecutiveFailures: number;
  circuitState: "closed" | "open" | "half-open";
  circuitOpenedAt: number;
  lastFailTime: number;
}>();

const usageMap = new Map<string, {
  minuteCalls: number;
  minuteReset: number;
  dayCalls: number;
  dayReset: number;
}>();

const CIRCUIT_OPEN_MS = 60_000;
const CIRCUIT_FAIL_THRESHOLD = 3;

function getHealth(id: string) {
  if (!healthMap.has(id)) {
    healthMap.set(id, { score: 100, consecutiveFailures: 0, circuitState: "closed", circuitOpenedAt: 0, lastFailTime: 0 });
  }
  return healthMap.get(id)!;
}

function canUse(p: ProviderDef): boolean {
  // Check API key
  if (!Deno.env.get(p.envKey)) return false;

  // Check circuit breaker
  const h = getHealth(p.id);
  const now = Date.now();
  if (h.circuitState === "open") {
    if (now - h.circuitOpenedAt > CIRCUIT_OPEN_MS) {
      h.circuitState = "half-open"; // Allow one probe
    } else {
      return false;
    }
  }

  // Check rate limits
  let u = usageMap.get(p.id);
  if (!u) {
    u = { minuteCalls: 0, minuteReset: now + 60_000, dayCalls: 0, dayReset: now + 86_400_000 };
    usageMap.set(p.id, u);
  }
  if (now >= u.minuteReset) { u.minuteCalls = 0; u.minuteReset = now + 60_000; }
  if (now >= u.dayReset) { u.dayCalls = 0; u.dayReset = now + 86_400_000; }
  return u.minuteCalls < p.rpm && u.dayCalls < p.rpd;
}

function recordSuccess(id: string) {
  const h = getHealth(id);
  h.score = Math.min(100, h.score + 5);
  h.consecutiveFailures = 0;
  if (h.circuitState === "half-open") h.circuitState = "closed";
  const u = usageMap.get(id);
  if (u) { u.minuteCalls++; u.dayCalls++; }
}

function recordFailure(id: string) {
  const h = getHealth(id);
  h.score = Math.max(0, h.score - 20);
  h.consecutiveFailures++;
  h.lastFailTime = Date.now();
  if (h.consecutiveFailures >= CIRCUIT_FAIL_THRESHOLD) {
    h.circuitState = "open";
    h.circuitOpenedAt = Date.now();
  }
  const u = usageMap.get(id);
  if (u) { u.minuteCalls++; u.dayCalls++; }
}

// ═══════════════════════════════════════════════════════════
// PROVIDER CALL
// ═══════════════════════════════════════════════════════════

async function callProvider(
  p: ProviderDef,
  prompt: string,
  opts: NexusRouteOptions,
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = Deno.env.get(p.envKey)!;
  const timeout = opts.timeoutMs ?? 30_000;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let url = p.baseUrl;
  let body: any;

  if (p.isGoogleFormat) {
    // Google AI Studio format
    url = url.replace("{model}", p.model) + `?key=${apiKey}`;
    body = {
      system_instruction: { parts: [{ text: opts.systemPrompt || "You are an expert AI assistant." }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: opts.maxTokens ?? 2048, temperature: opts.temperature ?? 0.7 },
    };
  } else {
    // OpenAI-compatible format
    headers["Authorization"] = `Bearer ${apiKey}`;
    if (p.extraHeaders) Object.assign(headers, p.extraHeaders);

    body = {
      model: p.model,
      messages: [
        { role: "system", content: opts.systemPrompt || "You are an expert AI assistant. Be concise and accurate." },
        { role: "user", content: prompt },
      ],
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
    };
    if (opts.tools) {
      body.tools = opts.tools;
      if (opts.toolChoice) body.tool_choice = opts.toolChoice;
    }
  }

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout),
  });

  if (!resp.ok) {
    let errText = "";
    try { errText = await resp.text(); } catch { /* ignore */ }
    throw new Error(`[${p.name}] ${resp.status}: ${errText.slice(0, 300)}`);
  }

  const data = await resp.json();
  let content: string;

  if (p.isGoogleFormat) {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (p.isCohereFormat) {
    content = data.message?.content?.[0]?.text || data.choices?.[0]?.message?.content || "";
  } else {
    // Check for tool calls first
    const choice = data.choices?.[0];
    if (choice?.message?.tool_calls) {
      content = JSON.stringify(choice.message.tool_calls);
    } else {
      content = choice?.message?.content || "";
    }
  }

  if (!content) throw new Error(`[${p.name}] empty response`);

  const tokensUsed = data.usage?.total_tokens || data.usage?.output_tokens || Math.ceil(content.length / 4);
  return { content, tokensUsed };
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT — nexusRoute()
// ═══════════════════════════════════════════════════════════

/**
 * Route a prompt through the full NEXUS provider fleet.
 * Automatically selects the best provider based on health, affinity, and rate limits.
 * Cascades through the entire fleet on failure.
 */
export async function nexusRoute(
  prompt: string,
  opts: NexusRouteOptions = {},
): Promise<NexusRouteResult> {
  const startMs = Date.now();
  const taskType = opts.taskType || "reasoning";

  // Score and sort available providers
  const ranked = PROVIDERS
    .filter(p => canUse(p))
    .map(p => {
      const h = getHealth(p.id);
      let score = h.score;
      if (p.affinities.includes(taskType)) score += 30;
      score += (15 - p.priority) * 3; // Priority bonus
      if (h.lastFailTime > Date.now() - 30_000) score -= 25;
      if (opts.preferProvider && p.id === opts.preferProvider) score += 50;
      // Tools support: skip Google/Cohere format for tool calls
      if (opts.tools && (p.isGoogleFormat || p.isCohereFormat)) score -= 100;
      return { provider: p, score };
    })
    .filter(x => x.score > -50)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    throw new Error("[NEXUS] All providers exhausted or unavailable — no API keys configured or all circuits open");
  }

  const fallbackChain: string[] = [];
  let lastError = "";

  for (const { provider } of ranked) {
    fallbackChain.push(provider.id);
    try {
      const result = await callProvider(provider, prompt, opts);
      recordSuccess(provider.id);
      return {
        content: result.content,
        provider: provider.id,
        model: provider.model,
        latencyMs: Date.now() - startMs,
        tokensUsed: result.tokensUsed,
        attempts: fallbackChain.length,
        fallbackChain,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[NEXUS] ${provider.id} failed: ${lastError}`);
      recordFailure(provider.id);
    }
  }

  throw new Error(`[NEXUS] All ${fallbackChain.length} providers failed. Last: ${lastError}. Chain: ${fallbackChain.join(" → ")}`);
}

/**
 * Get current fleet health status (for diagnostics)
 */
export function getFleetHealth(): Record<string, { score: number; circuit: string; available: boolean }> {
  const status: Record<string, any> = {};
  for (const p of PROVIDERS) {
    const h = getHealth(p.id);
    status[p.id] = {
      score: h.score,
      circuit: h.circuitState,
      available: canUse(p),
      hasKey: !!Deno.env.get(p.envKey),
    };
  }
  return status;
}

/**
 * List of all provider IDs in the fleet
 */
export const FLEET_PROVIDERS = PROVIDERS.map(p => p.id);
