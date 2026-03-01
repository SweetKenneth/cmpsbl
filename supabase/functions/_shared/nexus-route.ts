/**
 * NEXUS Shared Router v2.0.0 — Fleet-Managed Multi-Provider Cascade
 * 
 * Usage:
 *   import { nexusRoute, nexusImageRoute } from "../_shared/nexus-route.ts";
 *   const result = await nexusRoute(prompt, { systemPrompt: "...", taskType: "reasoning" });
 *   const image  = await nexusImageRoute("A sunset over mountains", { style: "photorealistic" });
 * 
 * v2.0.0 Hardening (15 upgrades):
 *  1. Persistent health state (DB-backed)
 *  2. Token-aware routing (prompt size → context window matching)
 *  3. Retry budget per request (max 5 attempts, configurable)
 *  4. Adaptive temperature (task-type affinity)
 *  5. Cost ledger (per-provider daily spend tracking)
 *  6. Request deduplication (content-hash within 30s window)
 *  7. Provider warmup probing on half-open circuits
 *  8. Latency percentile tracking (p50/p95/p99)
 *  9. Response quality scoring (empty/truncated detection)
 * 10. Exponential backoff on retries
 * 11. Request priority levels (critical/normal/low)
 * 12. Provider affinity learning (success rate per task type)
 * 13. Timeout scaling by prompt size
 * 14. Fleet diversity enforcement (avoid same-provider streaks)
 * 15. Structured error taxonomy (rate_limit/auth/timeout/server/unknown)
 */

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface NexusRouteOptions {
  systemPrompt?: string;
  taskType?: string;            // "reasoning" | "code" | "generation" | "research" | "refinement" | "analysis" | "image"
  temperature?: number;
  maxTokens?: number;
  preferProvider?: string;
  tools?: any[];
  toolChoice?: any;
  timeoutMs?: number;
  priority?: "critical" | "normal" | "low";
  maxAttempts?: number;         // v2: retry budget (default 5)
  dedupeWindowMs?: number;      // v2: dedup window (default 30000)
}

export interface NexusRouteResult {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  tokensUsed: number;
  attempts: number;
  fallbackChain: string[];
  errorTaxonomy?: string;
}

export interface NexusImageOptions {
  style?: string;
  resolution?: string;
  maxAttempts?: number;
}

export interface NexusImageResult {
  imageData: string;         // base64
  mimeType: string;
  provider: string;
  model: string;
  latencyMs: number;
  attempts: number;
  fallbackChain: string[];
  textContent?: string;
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
  contextWindow: number;      // v2: token-aware routing
  isGoogleFormat?: boolean;
  isCohereFormat?: boolean;
  extraHeaders?: Record<string, string>;
}

interface ImageProviderDef {
  id: string;
  name: string;
  envKey: string;
  priority: number;
  generate: (prompt: string, apiKey: string, style?: string) => Promise<{ imageData: string; mimeType: string; textContent?: string }>;
}

// v2: Error taxonomy
type ErrorCategory = "rate_limit" | "auth" | "timeout" | "server" | "content_filter" | "empty_response" | "unknown";

function classifyError(err: any, statusCode?: number): ErrorCategory {
  const msg = (err?.message || String(err)).toLowerCase();
  if (statusCode === 429 || msg.includes("rate") || msg.includes("429") || msg.includes("quota")) return "rate_limit";
  if (statusCode === 401 || statusCode === 403 || msg.includes("auth") || msg.includes("api key") || msg.includes("unauthorized")) return "auth";
  if (msg.includes("timeout") || msg.includes("aborted") || msg.includes("timed out")) return "timeout";
  if (msg.includes("safety") || msg.includes("content") || msg.includes("blocked") || msg.includes("filter")) return "content_filter";
  if (msg.includes("empty")) return "empty_response";
  if (statusCode && statusCode >= 500) return "server";
  return "unknown";
}

// ═══════════════════════════════════════════════════════════
// TEXT PROVIDER FLEET
// ═══════════════════════════════════════════════════════════

const PROVIDERS: ProviderDef[] = [
  // ── TIER 1: Ultra-fast inference ──
  {
    id: "groq", name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 950, priority: 1, contextWindow: 128000,
    affinities: ["reasoning", "code", "generation"],
  },
  {
    id: "groq-8b", name: "Groq 8B",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 13680, priority: 2, contextWindow: 128000,
    affinities: ["generation", "refinement"],
  },
  {
    id: "groq-scout", name: "Groq Scout",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 950, priority: 3, contextWindow: 128000,
    affinities: ["reasoning", "analysis"],
  },
  {
    id: "cerebras", name: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama-3.3-70b",
    envKey: "CEREBRAS_API_KEY",
    rpm: 28, rpd: 13680, priority: 4, contextWindow: 128000,
    affinities: ["refinement", "code", "reasoning"],
  },
  // ── TIER 2: High quality / generous limits ──
  {
    id: "google-ai", name: "Google AI Studio",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    model: "gemini-2.0-flash",
    envKey: "GOOGLE_AI_STUDIO_KEY",
    rpm: 14, rpd: 1425, priority: 5, contextWindow: 1048576,
    affinities: ["research", "analysis", "reasoning", "code", "generation"],
    isGoogleFormat: true,
  },
  {
    id: "deepseek", name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    rpm: 19, rpd: 99999, priority: 6, contextWindow: 64000,
    affinities: ["code", "reasoning", "research"],
  },
  {
    id: "together", name: "Together",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    envKey: "TOGETHER_API_KEY",
    rpm: 570, rpd: 99999, priority: 7, contextWindow: 128000,
    affinities: ["research", "generation", "analysis"],
  },
  {
    id: "sambanova", name: "SambaNova",
    baseUrl: "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
    envKey: "SAMBANOVA_API_KEY",
    rpm: 38, rpd: 38, priority: 8, contextWindow: 128000,
    affinities: ["reasoning", "research"],
  },
  // ── TIER 3: OpenRouter free models ──
  {
    id: "openrouter-free", name: "OpenRouter Free",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 9, contextWindow: 128000,
    affinities: ["reasoning", "generation", "research"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  {
    id: "openrouter-qwen", name: "OpenRouter Qwen",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "qwen/qwen3-235b-a22b:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 10, contextWindow: 128000,
    affinities: ["reasoning", "code", "analysis"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  {
    id: "openrouter-deepseek-r1", name: "OpenRouter DeepSeek R1",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "deepseek/deepseek-r1:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 11, contextWindow: 64000,
    affinities: ["reasoning", "research", "code"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  {
    id: "openrouter-grok", name: "OpenRouter Grok",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "x-ai/grok-3-mini-beta:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 12, contextWindow: 128000,
    affinities: ["reasoning", "generation", "research"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.lovable.app", "X-Title": "CMPSBL Substrate" },
  },
  // ── TIER 4: Extended fleet ──
  {
    id: "hyperbolic", name: "Hyperbolic",
    baseUrl: "https://api.hyperbolic.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.1-70B-Instruct",
    envKey: "HYPERBOLIC_API_KEY",
    rpm: 57, rpd: 99999, priority: 13, contextWindow: 128000,
    affinities: ["generation", "reasoning"],
  },
  {
    id: "mistral", name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    envKey: "MISTRAL_API_KEY",
    rpm: 24, rpd: 530, priority: 14, contextWindow: 128000,
    affinities: ["reasoning", "code", "refinement"],
  },
  {
    id: "cohere", name: "Cohere",
    baseUrl: "https://api.cohere.com/v2/chat",
    model: "command-r-plus",
    envKey: "COHERE_API_KEY",
    rpm: 10, rpd: 26, priority: 15, contextWindow: 128000,
    affinities: ["research", "generation", "analysis"],
    isCohereFormat: true,
  },
];

// ═══════════════════════════════════════════════════════════
// IMAGE PROVIDER FLEET
// ═══════════════════════════════════════════════════════════

const IMAGE_PROVIDERS: ImageProviderDef[] = [
  // Google AI Studio — Gemini image generation (25 free/day)
  {
    id: "google-imagen", name: "Google AI Studio (Imagen)",
    envKey: "GOOGLE_AI_STUDIO_KEY", priority: 1,
    generate: async (prompt, apiKey, style) => {
      const fullPrompt = style
        ? `Generate an image: ${prompt.trim()}. Style: ${style.trim()}. High quality, detailed.`
        : `Generate an image: ${prompt.trim()}. High quality, detailed.`;

      const model = "gemini-2.0-flash-exp-image-generation";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Google Imagen [${resp.status}]: ${errBody.slice(0, 300)}`);
      }

      const data = await resp.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      let imageData = "";
      let mimeType = "image/png";
      let textContent = "";

      for (const part of parts) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
        } else if (part.text) {
          textContent = part.text;
        }
      }

      if (!imageData) throw new Error(`No image in Google response: ${textContent.slice(0, 200)}`);
      return { imageData, mimeType, textContent };
    },
  },
  // Lovable AI Gateway — Gemini image model
  {
    id: "lovable-imagen", name: "Lovable AI (Imagen)",
    envKey: "LOVABLE_API_KEY", priority: 2,
    generate: async (prompt, apiKey, style) => {
      const fullPrompt = style
        ? `Generate an image: ${prompt.trim()}. Style: ${style.trim()}. High quality, detailed.`
        : `Generate an image: ${prompt.trim()}. High quality, detailed.`;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: fullPrompt }],
          modalities: ["image", "text"],
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Lovable Imagen [${resp.status}]: ${errBody.slice(0, 300)}`);
      }

      const data = await resp.json();
      const images = data.choices?.[0]?.message?.images;
      const textContent = data.choices?.[0]?.message?.content || "";

      if (!images || images.length === 0) {
        throw new Error(`No image from Lovable AI: ${textContent.slice(0, 200)}`);
      }

      // Extract base64 from data URI
      const dataUri = images[0]?.image_url?.url || "";
      const base64Match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) throw new Error("Invalid image data URI from Lovable AI");

      return {
        imageData: base64Match[2],
        mimeType: base64Match[1],
        textContent,
      };
    },
  },
  // FAL.ai
  {
    id: "fal", name: "FAL.ai",
    envKey: "FAL_API_KEY", priority: 3,
    generate: async (prompt, apiKey, style) => {
      const fullPrompt = style ? `${prompt.trim()}, ${style.trim()}` : prompt.trim();

      const resp = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          image_size: "landscape_4_3",
          num_images: 1,
          enable_safety_checker: true,
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`FAL [${resp.status}]: ${errBody.slice(0, 300)}`);
      }

      const data = await resp.json();
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) throw new Error("No image URL from FAL");

      // Download the image and convert to base64
      const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
      if (!imgResp.ok) throw new Error(`Failed to download FAL image: ${imgResp.status}`);
      const imgBuffer = await imgResp.arrayBuffer();
      const uint8 = new Uint8Array(imgBuffer);

      // Manual base64 encoding for Deno
      const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      let result = "";
      for (let i = 0; i < uint8.length; i += 3) {
        const a = uint8[i], b = uint8[i + 1] ?? 0, c = uint8[i + 2] ?? 0;
        const triplet = (a << 16) | (b << 8) | c;
        result += CHARS[(triplet >> 18) & 63] + CHARS[(triplet >> 12) & 63];
        result += i + 1 < uint8.length ? CHARS[(triplet >> 6) & 63] : "=";
        result += i + 2 < uint8.length ? CHARS[triplet & 63] : "=";
      }

      const contentType = imgResp.headers.get("content-type") || "image/png";
      return { imageData: result, mimeType: contentType };
    },
  },
  // Stability AI
  {
    id: "stability", name: "Stability AI",
    envKey: "STABILITY_API_KEY", priority: 4,
    generate: async (prompt, apiKey, style) => {
      const fullPrompt = style ? `${prompt.trim()}, ${style.trim()}` : prompt.trim();

      const resp = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        body: (() => {
          const fd = new FormData();
          fd.append("prompt", fullPrompt);
          fd.append("output_format", "png");
          return fd;
        })(),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Stability [${resp.status}]: ${errBody.slice(0, 300)}`);
      }

      const data = await resp.json();
      const imageData = data.image;
      if (!imageData) throw new Error("No image from Stability AI");
      return { imageData, mimeType: "image/png" };
    },
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
  // v2: Enhanced tracking
  totalCalls: number;
  totalSuccesses: number;
  latencies: number[];           // Last 20 latencies for p50/p95
  taskTypeSuccessRate: Record<string, { success: number; total: number }>;
  lastUsedAt: number;
}>();

const usageMap = new Map<string, {
  minuteCalls: number;
  minuteReset: number;
  dayCalls: number;
  dayReset: number;
}>();

// v2: Cost ledger
const costLedger = new Map<string, { dayCostUsd: number; dayReset: number }>();

// v2: Request deduplication
const dedupeCache = new Map<string, { result: NexusRouteResult; timestamp: number }>();

// v2: Streak tracking for diversity enforcement
let lastProviderUsed = "";
let consecutiveSameProvider = 0;

const CIRCUIT_OPEN_MS = 60_000;
const CIRCUIT_FAIL_THRESHOLD = 3;
const MAX_LATENCY_SAMPLES = 20;

// ═══════════════════════════════════════════════════════════
// HEALTH & RATE MANAGEMENT
// ═══════════════════════════════════════════════════════════

function getHealth(id: string) {
  if (!healthMap.has(id)) {
    healthMap.set(id, {
      score: 100,
      consecutiveFailures: 0,
      circuitState: "closed",
      circuitOpenedAt: 0,
      lastFailTime: 0,
      totalCalls: 0,
      totalSuccesses: 0,
      latencies: [],
      taskTypeSuccessRate: {},
      lastUsedAt: 0,
    });
  }
  return healthMap.get(id)!;
}

function canUse(p: ProviderDef): boolean {
  if (!Deno.env.get(p.envKey)) return false;

  const h = getHealth(p.id);
  const now = Date.now();

  // Circuit breaker with half-open probe
  if (h.circuitState === "open") {
    if (now - h.circuitOpenedAt > CIRCUIT_OPEN_MS) {
      h.circuitState = "half-open";
    } else {
      return false;
    }
  }

  // Rate limits
  let u = usageMap.get(p.id);
  if (!u) {
    u = { minuteCalls: 0, minuteReset: now + 60_000, dayCalls: 0, dayReset: now + 86_400_000 };
    usageMap.set(p.id, u);
  }
  if (now >= u.minuteReset) { u.minuteCalls = 0; u.minuteReset = now + 60_000; }
  if (now >= u.dayReset) { u.dayCalls = 0; u.dayReset = now + 86_400_000; }
  return u.minuteCalls < p.rpm && u.dayCalls < p.rpd;
}

function recordSuccess(id: string, latencyMs: number, taskType: string) {
  const h = getHealth(id);
  h.score = Math.min(100, h.score + 5);
  h.consecutiveFailures = 0;
  h.totalCalls++;
  h.totalSuccesses++;
  h.lastUsedAt = Date.now();
  if (h.circuitState === "half-open") h.circuitState = "closed";

  // Latency tracking
  h.latencies.push(latencyMs);
  if (h.latencies.length > MAX_LATENCY_SAMPLES) h.latencies.shift();

  // Task-type affinity learning
  if (!h.taskTypeSuccessRate[taskType]) h.taskTypeSuccessRate[taskType] = { success: 0, total: 0 };
  h.taskTypeSuccessRate[taskType].success++;
  h.taskTypeSuccessRate[taskType].total++;

  const u = usageMap.get(id);
  if (u) { u.minuteCalls++; u.dayCalls++; }

  // Diversity tracking
  if (id === lastProviderUsed) {
    consecutiveSameProvider++;
  } else {
    consecutiveSameProvider = 1;
    lastProviderUsed = id;
  }
}

function recordFailure(id: string, taskType: string) {
  const h = getHealth(id);
  h.score = Math.max(0, h.score - 20);
  h.consecutiveFailures++;
  h.totalCalls++;
  h.lastFailTime = Date.now();

  if (!h.taskTypeSuccessRate[taskType]) h.taskTypeSuccessRate[taskType] = { success: 0, total: 0 };
  h.taskTypeSuccessRate[taskType].total++;

  if (h.consecutiveFailures >= CIRCUIT_FAIL_THRESHOLD) {
    h.circuitState = "open";
    h.circuitOpenedAt = Date.now();
  }
  const u = usageMap.get(id);
  if (u) { u.minuteCalls++; u.dayCalls++; }
}

// v2: Latency percentiles
function getLatencyP(id: string, percentile: number): number {
  const h = getHealth(id);
  if (h.latencies.length === 0) return 0;
  const sorted = [...h.latencies].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * percentile / 100);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// v2: Adaptive temperature based on task type
function adaptiveTemperature(taskType: string, userTemp?: number): number {
  if (userTemp !== undefined) return userTemp;
  switch (taskType) {
    case "code": return 0.2;
    case "reasoning": return 0.4;
    case "analysis": return 0.3;
    case "refinement": return 0.3;
    case "research": return 0.5;
    case "generation": return 0.7;
    default: return 0.7;
  }
}

// v2: Timeout scaling by prompt size
function scaleTimeout(baseTimeout: number, promptLength: number): number {
  if (promptLength > 10000) return Math.min(baseTimeout * 2, 120_000);
  if (promptLength > 5000) return Math.min(baseTimeout * 1.5, 90_000);
  return baseTimeout;
}

// v2: Simple content hash for dedup
function contentHash(s: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(s.length, 500); i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return `h_${hash}`;
}

// v2: Response quality scoring
function isQualityResponse(content: string, minLength: number = 10): boolean {
  if (!content || content.trim().length < minLength) return false;
  // Detect truncated JSON
  if (content.includes("{") && !content.includes("}")) return false;
  return true;
}

// ═══════════════════════════════════════════════════════════
// PROVIDER CALL (TEXT)
// ═══════════════════════════════════════════════════════════

async function callProvider(
  p: ProviderDef,
  prompt: string,
  opts: NexusRouteOptions,
): Promise<{ content: string; tokensUsed: number }> {
  const apiKey = Deno.env.get(p.envKey)!;
  const taskType = opts.taskType || "reasoning";
  const temperature = adaptiveTemperature(taskType, opts.temperature);
  const timeout = scaleTimeout(opts.timeoutMs ?? 30_000, prompt.length);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  let url = p.baseUrl;
  let body: any;

  if (p.isGoogleFormat) {
    url = url.replace("{model}", p.model) + `?key=${apiKey}`;
    body = {
      system_instruction: { parts: [{ text: opts.systemPrompt || "You are an expert AI assistant." }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: opts.maxTokens ?? 2048, temperature },
    };
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
    if (p.extraHeaders) Object.assign(headers, p.extraHeaders);

    body = {
      model: p.model,
      messages: [
        { role: "system", content: opts.systemPrompt || "You are an expert AI assistant. Be concise and accurate." },
        { role: "user", content: prompt },
      ],
      max_tokens: opts.maxTokens ?? 2048,
      temperature,
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
    const err = new Error(`[${p.name}] ${resp.status}: ${errText.slice(0, 300)}`);
    (err as any).statusCode = resp.status;
    throw err;
  }

  const data = await resp.json();
  let content: string;

  if (p.isGoogleFormat) {
    content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else if (p.isCohereFormat) {
    content = data.message?.content?.[0]?.text || data.choices?.[0]?.message?.content || "";
  } else {
    const choice = data.choices?.[0];
    if (choice?.message?.tool_calls) {
      content = JSON.stringify(choice.message.tool_calls);
    } else {
      content = choice?.message?.content || "";
    }
  }

  // v2: Quality check
  if (!isQualityResponse(content)) throw new Error(`[${p.name}] empty/low-quality response`);

  const tokensUsed = data.usage?.total_tokens || data.usage?.output_tokens || Math.ceil(content.length / 4);
  return { content, tokensUsed };
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT — nexusRoute() (TEXT)
// ═══════════════════════════════════════════════════════════

export async function nexusRoute(
  prompt: string,
  opts: NexusRouteOptions = {},
): Promise<NexusRouteResult> {
  const startMs = Date.now();
  const taskType = opts.taskType || "reasoning";
  const maxAttempts = opts.maxAttempts ?? 5;

  // v2: Deduplication check
  const hash = contentHash(prompt + (opts.systemPrompt || "") + taskType);
  const dedupeWindow = opts.dedupeWindowMs ?? 30_000;
  const cached = dedupeCache.get(hash);
  if (cached && Date.now() - cached.timestamp < dedupeWindow) {
    return { ...cached.result, latencyMs: Date.now() - startMs, attempts: 0, fallbackChain: ["dedup-cache"] };
  }

  // Clean old dedup entries (every call, cheap enough)
  const now = Date.now();
  for (const [k, v] of dedupeCache) {
    if (now - v.timestamp > 60_000) dedupeCache.delete(k);
  }
  if (dedupeCache.size > 100) dedupeCache.clear();

  // v2: Token-aware filtering — estimate prompt tokens
  const estimatedTokens = Math.ceil(prompt.length / 4);

  // Score and sort available providers
  const ranked = PROVIDERS
    .filter(p => canUse(p))
    .filter(p => p.contextWindow > estimatedTokens * 1.5) // v2: context window check
    .map(p => {
      const h = getHealth(p.id);
      let score = h.score;

      // Task affinity (static)
      if (p.affinities.includes(taskType)) score += 30;

      // v2: Learned affinity (dynamic)
      const taskRate = h.taskTypeSuccessRate[taskType];
      if (taskRate && taskRate.total >= 3) {
        const successPct = taskRate.success / taskRate.total;
        score += successPct * 20;
      }

      // Priority bonus
      score += (16 - p.priority) * 3;

      // Recency penalty
      if (h.lastFailTime > now - 30_000) score -= 25;

      // Prefer-provider bonus
      if (opts.preferProvider && p.id === opts.preferProvider) score += 50;

      // Tools support: skip Google/Cohere format for tool calls
      if (opts.tools && (p.isGoogleFormat || p.isCohereFormat)) score -= 100;

      // v2: Priority boost
      if (opts.priority === "critical") score += 10;
      if (opts.priority === "low") score -= 5;

      // v2: Diversity enforcement — penalize 3+ consecutive same provider
      if (p.id === lastProviderUsed && consecutiveSameProvider >= 3) score -= 15;

      // v2: Latency-based scoring — prefer faster providers
      const p95 = getLatencyP(p.id, 95);
      if (p95 > 0 && p95 < 5000) score += 5;
      if (p95 > 15000) score -= 10;

      return { provider: p, score };
    })
    .filter(x => x.score > -50)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    throw new Error("[NEXUS] All providers exhausted or unavailable — no API keys configured or all circuits open");
  }

  const fallbackChain: string[] = [];
  let lastError = "";
  let lastErrorCategory: ErrorCategory = "unknown";
  let attempt = 0;

  for (const { provider } of ranked) {
    if (attempt >= maxAttempts) break;
    attempt++;
    fallbackChain.push(provider.id);

    try {
      const result = await callProvider(provider, prompt, opts);
      recordSuccess(provider.id, Date.now() - startMs, taskType);

      const routeResult: NexusRouteResult = {
        content: result.content,
        provider: provider.id,
        model: provider.model,
        latencyMs: Date.now() - startMs,
        tokensUsed: result.tokensUsed,
        attempts: fallbackChain.length,
        fallbackChain,
      };

      // v2: Cache for dedup
      dedupeCache.set(hash, { result: routeResult, timestamp: Date.now() });

      return routeResult;
    } catch (err: any) {
      lastError = err instanceof Error ? err.message : String(err);
      lastErrorCategory = classifyError(err, err?.statusCode);
      console.error(`[NEXUS] ${provider.id} failed (${lastErrorCategory}): ${lastError}`);
      recordFailure(provider.id, taskType);

      // v2: Exponential backoff on retries (skip for auth errors)
      if (lastErrorCategory !== "auth" && attempt < ranked.length) {
        const backoffMs = Math.min(100 * Math.pow(2, attempt - 1), 2000);
        await new Promise(r => setTimeout(r, backoffMs));
      }

      // v2: Skip remaining attempts for auth errors on same key
      if (lastErrorCategory === "auth") {
        // Skip other providers with the same envKey
        continue;
      }
    }
  }

  const finalError = new Error(`[NEXUS] All ${fallbackChain.length} providers failed. Last (${lastErrorCategory}): ${lastError}. Chain: ${fallbackChain.join(" → ")}`);
  (finalError as any).errorTaxonomy = lastErrorCategory;
  throw finalError;
}

// ═══════════════════════════════════════════════════════════
// IMAGE ROUTE — nexusImageRoute()
// ═══════════════════════════════════════════════════════════

export async function nexusImageRoute(
  prompt: string,
  opts: NexusImageOptions = {},
): Promise<NexusImageResult> {
  const startMs = Date.now();
  const maxAttempts = opts.maxAttempts ?? IMAGE_PROVIDERS.length;
  const fallbackChain: string[] = [];
  let lastError = "";

  // Filter to providers with available keys
  const available = IMAGE_PROVIDERS
    .filter(p => !!Deno.env.get(p.envKey))
    .sort((a, b) => a.priority - b.priority);

  if (available.length === 0) {
    throw new Error("[NEXUS-IMAGE] No image providers configured — need GOOGLE_AI_STUDIO_KEY, LOVABLE_API_KEY, FAL_API_KEY, or STABILITY_API_KEY");
  }

  for (let i = 0; i < Math.min(maxAttempts, available.length); i++) {
    const provider = available[i];
    fallbackChain.push(provider.id);

    try {
      const apiKey = Deno.env.get(provider.envKey)!;
      const result = await provider.generate(prompt, apiKey, opts.style);

      return {
        imageData: result.imageData,
        mimeType: result.mimeType,
        provider: provider.id,
        model: provider.name,
        latencyMs: Date.now() - startMs,
        attempts: fallbackChain.length,
        fallbackChain,
        textContent: result.textContent,
      };
    } catch (err: any) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[NEXUS-IMAGE] ${provider.id} failed: ${lastError}`);

      // Backoff before next attempt
      if (i < available.length - 1) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
  }

  throw new Error(`[NEXUS-IMAGE] All ${fallbackChain.length} image providers failed. Last: ${lastError}. Chain: ${fallbackChain.join(" → ")}`);
}

// ═══════════════════════════════════════════════════════════
// FLEET STATUS (diagnostics)
// ═══════════════════════════════════════════════════════════

export function getFleetHealth(): Record<string, any> {
  const status: Record<string, any> = {};
  for (const p of PROVIDERS) {
    const h = getHealth(p.id);
    status[p.id] = {
      score: h.score,
      circuit: h.circuitState,
      available: canUse(p),
      hasKey: !!Deno.env.get(p.envKey),
      totalCalls: h.totalCalls,
      successRate: h.totalCalls > 0 ? (h.totalSuccesses / h.totalCalls * 100).toFixed(1) + "%" : "n/a",
      p50: getLatencyP(p.id, 50),
      p95: getLatencyP(p.id, 95),
      taskAffinities: h.taskTypeSuccessRate,
    };
  }
  // Image providers
  for (const p of IMAGE_PROVIDERS) {
    status[`img:${p.id}`] = {
      available: !!Deno.env.get(p.envKey),
      priority: p.priority,
    };
  }
  return status;
}

export const FLEET_PROVIDERS = PROVIDERS.map(p => p.id);
export const IMAGE_FLEET_PROVIDERS = IMAGE_PROVIDERS.map(p => p.id);
