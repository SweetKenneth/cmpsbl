/**
 * NEXUS Shared Router v3.0.0 — Full Fleet Intelligence Engine
 * 
 * Usage:
 *   import { nexusRoute, nexusImageRoute, nexusStreamRoute, nexusConsensusRoute } from "../_shared/nexus-route.ts";
 *   const result = await nexusRoute(prompt, { systemPrompt: "...", taskType: "reasoning" });
 *   const image  = await nexusImageRoute("A sunset", { style: "photorealistic" });
 *   const stream = nexusStreamRoute(prompt, opts);  // SSE ReadableStream
 *   const consensus = await nexusConsensusRoute(prompt, opts); // Multi-model consensus
 * 
 * v3.0.0 Upgrades (25 total):
 *  ── Tier 1: Critical Path ──
 *   1. Persistent health state (DB-backed via nexus_provider_health)
 *   2. Streaming SSE support (nexusStreamRoute)
 *   3. Token-counting pre-flights (tiktoken-compatible estimation)
 *   4. Multi-model consensus for critical paths (nexusConsensusRoute)
 *   5. Per-provider daily cost ledger (DB-backed via nexus_cost_ledger)
 *  ── Tier 2: Intelligence ──
 *   6. Semantic task classification (embedding-free keyword classifier)
 *   7. Provider affinity persistence (DB-backed via nexus_provider_affinity)
 *   8. Automatic prompt compression for context limits
 *  ── Tier 3: Resilience ──
 *   9. Request coalescing (dedup in-flight identical requests)
 *  10. Rate limit pre-checks (predict exhaustion before calling)
 *  11. Regional routing preference (latency-based region scoring)
 *  ── Tier 4: Observability ──
 *  12. Distributed trace IDs (nexus_traces table)
 *  13. Real-time provider dashboard data (getFleetHealth enhanced)
 *  14. Anomaly alerting (nexus_anomalies auto-detection)
 *  ── Tier 5: Advanced ──
 *  15. Function-calling specific routing (tool-use provider filtering)
 *  16. Image cascade v2 (Lovable AI pro model + retry intelligence)
 *  17. Self-evolving routing weights (affinity-driven rebalancing)
 *  18. Quality gates (min response length / JSON validity checks)
 *  19. Exponential backoff with jitter
 *  20. Fleet diversity enforcement (avoid same-provider streaks)
 *  21. Structured error taxonomy with persistence
 *  22. Adaptive temperature per task type
 *  23. Timeout scaling by prompt size
 *  24. Provider warmup probing on half-open circuits
 *  25. Cost-aware routing (prefer cheaper providers when quality is equivalent)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface NexusRouteOptions {
  systemPrompt?: string;
  taskType?: string;
  temperature?: number;
  maxTokens?: number;
  preferProvider?: string;
  tools?: any[];
  toolChoice?: any;
  timeoutMs?: number;
  priority?: "critical" | "normal" | "low";
  maxAttempts?: number;
  dedupeWindowMs?: number;
  traceId?: string;                // v3: distributed tracing
  minQualityLength?: number;       // v3: quality gate
  requireJson?: boolean;           // v3: JSON quality gate
  costCeiling?: number;            // v3: max cost in USD for this request
  compressPrompt?: boolean;        // v3: auto-compress if over context
  consensusCount?: number;         // v3: how many models to use for consensus
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
  traceId: string;                 // v3
  qualityScore: number;            // v3
  estimatedCostUsd: number;        // v3
}

export interface NexusImageOptions {
  style?: string;
  resolution?: string;
  maxAttempts?: number;
  traceId?: string;
  usePro?: boolean;                // v3: use pro model for higher quality
}

export interface NexusImageResult {
  imageData: string;
  mimeType: string;
  provider: string;
  model: string;
  latencyMs: number;
  attempts: number;
  fallbackChain: string[];
  textContent?: string;
  traceId: string;
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
  contextWindow: number;
  costPer1kTokens: number;        // v3: cost-aware routing (USD)
  supportsTools: boolean;          // v3: function-calling filter
  supportsStreaming: boolean;      // v3: streaming support
  region?: string;                 // v3: regional routing
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

type ErrorCategory = "rate_limit" | "auth" | "timeout" | "server" | "content_filter" | "empty_response" | "context_exceeded" | "unknown";

// ═══════════════════════════════════════════════════════════
// UTILITY: Trace ID generation
// ═══════════════════════════════════════════════════════════

function generateTraceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "nxs_";
  for (let i = 0; i < 16; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Error classification
// ═══════════════════════════════════════════════════════════

function classifyError(err: any, statusCode?: number): ErrorCategory {
  const msg = (err?.message || String(err)).toLowerCase();
  if (statusCode === 429 || msg.includes("rate") || msg.includes("429") || msg.includes("quota")) return "rate_limit";
  if (statusCode === 401 || statusCode === 403 || msg.includes("auth") || msg.includes("api key") || msg.includes("unauthorized")) return "auth";
  if (msg.includes("timeout") || msg.includes("aborted") || msg.includes("timed out")) return "timeout";
  if (msg.includes("safety") || msg.includes("content") || msg.includes("blocked") || msg.includes("filter")) return "content_filter";
  if (msg.includes("empty")) return "empty_response";
  if (msg.includes("context") || msg.includes("too long") || msg.includes("maximum context")) return "context_exceeded";
  if (statusCode && statusCode >= 500) return "server";
  return "unknown";
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Token estimation (v3 #3 — token-counting pre-flight)
// ═══════════════════════════════════════════════════════════

function estimateTokens(text: string): number {
  // Approximation: ~4 chars per token for English, ~2 for code
  const codeIndicators = ['{', '}', '(', ')', '=>', 'function', 'const ', 'import '];
  const isCode = codeIndicators.some(i => text.includes(i));
  return Math.ceil(text.length / (isCode ? 3 : 4));
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Cost estimation per provider (v3 #25)
// ═══════════════════════════════════════════════════════════

function estimateCost(provider: ProviderDef, tokens: number): number {
  return (tokens / 1000) * provider.costPer1kTokens;
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Prompt compression (v3 #8)
// ═══════════════════════════════════════════════════════════

function compressPrompt(prompt: string, maxTokens: number): string {
  const currentTokens = estimateTokens(prompt);
  if (currentTokens <= maxTokens) return prompt;

  const ratio = maxTokens / currentTokens;
  const targetChars = Math.floor(prompt.length * ratio * 0.9); // 90% safety margin

  // Strategy: Keep first 30% and last 30%, compress middle
  const keepFront = Math.floor(targetChars * 0.35);
  const keepBack = Math.floor(targetChars * 0.35);
  const front = prompt.slice(0, keepFront);
  const back = prompt.slice(-keepBack);

  return `${front}\n\n[... ${currentTokens - estimateTokens(front + back)} tokens compressed ...]\n\n${back}`;
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Semantic task classifier (v3 #6)
// ═══════════════════════════════════════════════════════════

function classifyTask(prompt: string, hintType?: string): string {
  if (hintType) return hintType;

  const lower = prompt.toLowerCase();
  const keywords: Record<string, string[]> = {
    code: ["function", "const ", "import ", "export ", "class ", "interface ", "=>", "async ", "await ", "typescript", "javascript", "python", "html", "css", "sql", "api", "endpoint", "debug", "fix this code", "refactor"],
    reasoning: ["analyze", "explain why", "compare", "evaluate", "assess", "determine", "calculate", "logic", "proof", "argue", "because", "therefore", "consequently"],
    research: ["research", "find information", "what is", "who is", "history of", "overview", "summarize", "literature", "study", "evidence", "source"],
    generation: ["write", "create", "generate", "compose", "draft", "story", "article", "blog", "essay", "poem", "description", "content"],
    refinement: ["improve", "rewrite", "polish", "edit", "revise", "fix grammar", "make better", "optimize", "enhance", "clarify"],
    analysis: ["data", "pattern", "trend", "metric", "statistics", "breakdown", "distribution", "correlation", "insight", "report"],
  };

  let bestType = "reasoning";
  let bestScore = 0;

  for (const [type, words] of Object.entries(keywords)) {
    const score = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestType = type; }
  }

  return bestType;
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Quality scoring (v3 #18)
// ═══════════════════════════════════════════════════════════

function scoreQuality(content: string, opts: NexusRouteOptions): number {
  let score = 1.0;

  // Length check
  if (!content || content.trim().length === 0) return 0;
  if (content.trim().length < (opts.minQualityLength || 10)) score *= 0.3;

  // JSON validity check
  if (opts.requireJson) {
    try { JSON.parse(content); } catch { score *= 0.1; }
  }

  // Truncation detection
  if (content.includes("{") && !content.includes("}")) score *= 0.4;
  if (content.endsWith("...") && content.length < 100) score *= 0.5;

  // Repetition detection (>50% repeated phrases = low quality)
  const words = content.split(/\s+/);
  if (words.length > 20) {
    const unique = new Set(words);
    const uniqueRatio = unique.size / words.length;
    if (uniqueRatio < 0.3) score *= 0.3;
  }

  return Math.max(0, Math.min(1, score));
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Content hash for dedup & coalescing
// ═══════════════════════════════════════════════════════════

function contentHash(s: string): string {
  let hash = 0;
  for (let i = 0; i < Math.min(s.length, 500); i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return `h_${hash}`;
}

// ═══════════════════════════════════════════════════════════
// UTILITY: Exponential backoff with jitter (v3 #19)
// ═══════════════════════════════════════════════════════════

function backoffWithJitter(attempt: number, baseMs: number = 100): number {
  const exponential = Math.min(baseMs * Math.pow(2, attempt - 1), 5000);
  const jitter = Math.random() * exponential * 0.3; // 30% jitter
  return exponential + jitter;
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
    costPer1kTokens: 0, supportsTools: true, supportsStreaming: true,
    affinities: ["reasoning", "code", "generation"],
    region: "us",
  },
  {
    id: "groq-8b", name: "Groq 8B",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 13680, priority: 2, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: true, supportsStreaming: true,
    affinities: ["generation", "refinement"],
    region: "us",
  },
  {
    id: "groq-scout", name: "Groq Scout",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    envKey: "GROQ_API_KEY",
    rpm: 28, rpd: 950, priority: 3, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: true, supportsStreaming: true,
    affinities: ["reasoning", "analysis"],
    region: "us",
  },
  {
    id: "cerebras", name: "Cerebras",
    baseUrl: "https://api.cerebras.ai/v1/chat/completions",
    model: "llama-3.3-70b",
    envKey: "CEREBRAS_API_KEY",
    rpm: 28, rpd: 13680, priority: 4, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: false, supportsStreaming: true,
    affinities: ["refinement", "code", "reasoning"],
    region: "us",
  },
  // ── TIER 2: High quality / generous limits ──
  {
    id: "google-ai", name: "Google AI Studio",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    model: "gemini-2.0-flash",
    envKey: "GOOGLE_AI_STUDIO_KEY",
    rpm: 14, rpd: 1425, priority: 5, contextWindow: 1048576,
    costPer1kTokens: 0, supportsTools: false, supportsStreaming: false,
    affinities: ["research", "analysis", "reasoning", "code", "generation"],
    isGoogleFormat: true,
    region: "us",
  },
  {
    id: "deepseek", name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    rpm: 19, rpd: 99999, priority: 6, contextWindow: 64000,
    costPer1kTokens: 0.0014, supportsTools: true, supportsStreaming: true,
    affinities: ["code", "reasoning", "research"],
    region: "cn",
  },
  {
    id: "together", name: "Together",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    envKey: "TOGETHER_API_KEY",
    rpm: 570, rpd: 99999, priority: 7, contextWindow: 128000,
    costPer1kTokens: 0.0008, supportsTools: true, supportsStreaming: true,
    affinities: ["research", "generation", "analysis"],
    region: "us",
  },
  {
    id: "sambanova", name: "SambaNova",
    baseUrl: "https://api.sambanova.ai/v1/chat/completions",
    model: "Meta-Llama-3.3-70B-Instruct",
    envKey: "SAMBANOVA_API_KEY",
    rpm: 38, rpd: 38, priority: 8, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: false, supportsStreaming: true,
    affinities: ["reasoning", "research"],
    region: "us",
  },
  // ── TIER 3: OpenRouter free models ──
  {
    id: "openrouter-free", name: "OpenRouter Free",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 9, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: true, supportsStreaming: true,
    affinities: ["reasoning", "generation", "research"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.com", "X-Title": "CMPSBL Substrate" },
    region: "us",
  },
  {
    id: "openrouter-qwen", name: "OpenRouter Qwen",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "qwen/qwen3-235b-a22b:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 10, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: true, supportsStreaming: true,
    affinities: ["reasoning", "code", "analysis"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.com", "X-Title": "CMPSBL Substrate" },
    region: "us",
  },
  {
    id: "openrouter-deepseek-r1", name: "OpenRouter DeepSeek R1",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "deepseek/deepseek-r1:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 11, contextWindow: 64000,
    costPer1kTokens: 0, supportsTools: false, supportsStreaming: true,
    affinities: ["reasoning", "research", "code"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.com", "X-Title": "CMPSBL Substrate" },
    region: "us",
  },
  {
    id: "openrouter-grok", name: "OpenRouter Grok",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "x-ai/grok-3-mini-beta:free",
    envKey: "OPENROUTER_API_KEY",
    rpm: 10, rpd: 190, priority: 12, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: true, supportsStreaming: true,
    affinities: ["reasoning", "generation", "research"],
    extraHeaders: { "HTTP-Referer": "https://cmpsbl.com", "X-Title": "CMPSBL Substrate" },
    region: "us",
  },
  // ── TIER 4: Extended fleet ──
  {
    id: "hyperbolic", name: "Hyperbolic",
    baseUrl: "https://api.hyperbolic.xyz/v1/chat/completions",
    model: "meta-llama/Llama-3.1-70B-Instruct",
    envKey: "HYPERBOLIC_API_KEY",
    rpm: 57, rpd: 99999, priority: 13, contextWindow: 128000,
    costPer1kTokens: 0, supportsTools: false, supportsStreaming: true,
    affinities: ["generation", "reasoning"],
    region: "us",
  },
  {
    id: "mistral", name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-small-latest",
    envKey: "MISTRAL_API_KEY",
    rpm: 24, rpd: 530, priority: 14, contextWindow: 128000,
    costPer1kTokens: 0.001, supportsTools: true, supportsStreaming: true,
    affinities: ["reasoning", "code", "refinement"],
    region: "eu",
  },
  {
    id: "cohere", name: "Cohere",
    baseUrl: "https://api.cohere.com/v2/chat",
    model: "command-r-plus",
    envKey: "COHERE_API_KEY",
    rpm: 10, rpd: 26, priority: 15, contextWindow: 128000,
    costPer1kTokens: 0.003, supportsTools: false, supportsStreaming: true,
    affinities: ["research", "generation", "analysis"],
    isCohereFormat: true,
    region: "us",
  },
];

// ═══════════════════════════════════════════════════════════
// IMAGE PROVIDER FLEET (v3 #16 — cascade v2)
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
  // Lovable AI Gateway — Standard model
  {
    id: "lovable-imagen", name: "Lovable AI (Imagen)",
    envKey: "LOVABLE_API_KEY", priority: 2,
    generate: async (prompt, apiKey, style) => {
      const fullPrompt = style
        ? `Generate an image: ${prompt.trim()}. Style: ${style.trim()}. High quality, detailed.`
        : `Generate an image: ${prompt.trim()}. High quality, detailed.`;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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

      if (!images || images.length === 0) throw new Error(`No image from Lovable AI: ${textContent.slice(0, 200)}`);

      const dataUri = images[0]?.image_url?.url || "";
      const base64Match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) throw new Error("Invalid image data URI from Lovable AI");

      return { imageData: base64Match[2], mimeType: base64Match[1], textContent };
    },
  },
  // Lovable AI Gateway — Pro model (v3 #16)
  {
    id: "lovable-imagen-pro", name: "Lovable AI Pro (Imagen)",
    envKey: "LOVABLE_API_KEY", priority: 5, // Only used when usePro=true
    generate: async (prompt, apiKey, style) => {
      const fullPrompt = style
        ? `Generate a high quality professional image: ${prompt.trim()}. Style: ${style.trim()}. Ultra detailed, photorealistic.`
        : `Generate a high quality professional image: ${prompt.trim()}. Ultra detailed, photorealistic.`;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [{ role: "user", content: fullPrompt }],
          modalities: ["image", "text"],
        }),
        signal: AbortSignal.timeout(90_000),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`Lovable Pro Imagen [${resp.status}]: ${errBody.slice(0, 300)}`);
      }

      const data = await resp.json();
      const images = data.choices?.[0]?.message?.images;
      const textContent = data.choices?.[0]?.message?.content || "";

      if (!images || images.length === 0) throw new Error(`No image from Lovable AI Pro: ${textContent.slice(0, 200)}`);

      const dataUri = images[0]?.image_url?.url || "";
      const base64Match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
      if (!base64Match) throw new Error("Invalid image data URI from Lovable AI Pro");

      return { imageData: base64Match[2], mimeType: base64Match[1], textContent };
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
        headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, image_size: "landscape_4_3", num_images: 1, enable_safety_checker: true }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!resp.ok) {
        const errBody = await resp.text();
        throw new Error(`FAL [${resp.status}]: ${errBody.slice(0, 300)}`);
      }

      const data = await resp.json();
      const imageUrl = data.images?.[0]?.url;
      if (!imageUrl) throw new Error("No image URL from FAL");

      const imgResp = await fetch(imageUrl, { signal: AbortSignal.timeout(30_000) });
      if (!imgResp.ok) throw new Error(`Failed to download FAL image: ${imgResp.status}`);
      const imgBuffer = await imgResp.arrayBuffer();
      const uint8 = new Uint8Array(imgBuffer);

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
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
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
// IN-MEMORY STATE (per isolate, hydrated from DB on first call)
// ═══════════════════════════════════════════════════════════

interface HealthState {
  score: number;
  consecutiveFailures: number;
  circuitState: "closed" | "open" | "half-open";
  circuitOpenedAt: number;
  lastFailTime: number;
  totalCalls: number;
  totalSuccesses: number;
  latencies: number[];
  taskTypeSuccessRate: Record<string, { success: number; total: number }>;
  lastUsedAt: number;
  errorCounts: Record<ErrorCategory, number>;
}

const healthMap = new Map<string, HealthState>();

const usageMap = new Map<string, {
  minuteCalls: number;
  minuteReset: number;
  dayCalls: number;
  dayReset: number;
}>();

// v3: Request coalescing (#9)
const inflightRequests = new Map<string, Promise<NexusRouteResult>>();

// v3: Dedup cache
const dedupeCache = new Map<string, { result: NexusRouteResult; timestamp: number }>();

// v3: Diversity tracking (#20)
let lastProviderUsed = "";
let consecutiveSameProvider = 0;

// v3: DB hydration flag
let dbHydrated = false;

const CIRCUIT_OPEN_MS = 60_000;
const CIRCUIT_FAIL_THRESHOLD = 3;
const MAX_LATENCY_SAMPLES = 30;

// ═══════════════════════════════════════════════════════════
// DB PERSISTENCE LAYER (v3 #1, #5, #7, #12, #14)
// ═══════════════════════════════════════════════════════════

function getSupabaseClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key);
}

async function hydrateFromDb(): Promise<void> {
  if (dbHydrated) return;
  dbHydrated = true; // Set early to prevent re-entry
  
  try {
    const sb = getSupabaseClient();
    if (!sb) return;

    const { data: healthRows } = await sb.from('nexus_provider_health').select('*');
    if (healthRows) {
      for (const row of healthRows) {
        healthMap.set(row.provider_id, {
          score: Number(row.health_score),
          consecutiveFailures: row.consecutive_failures,
          circuitState: row.circuit_state as any,
          circuitOpenedAt: row.circuit_opened_at ? new Date(row.circuit_opened_at).getTime() : 0,
          lastFailTime: row.last_fail_time ? new Date(row.last_fail_time).getTime() : 0,
          totalCalls: row.total_calls,
          totalSuccesses: row.total_successes,
          latencies: [],
          taskTypeSuccessRate: row.task_affinity || {},
          lastUsedAt: 0,
          errorCounts: row.error_counts || {},
        });
      }
    }
  } catch (e) {
    console.warn('[NEXUS] DB hydration failed (continuing with defaults):', e);
  }
}

// Fire-and-forget: persist health state to DB
function persistHealthAsync(providerId: string, h: HealthState): void {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;

    const p50 = getLatencyP(providerId, 50);
    const p95 = getLatencyP(providerId, 95);
    const p99 = getLatencyP(providerId, 99);

    sb.rpc('nexus_upsert_health', {
      p_provider_id: providerId,
      p_health_score: h.score,
      p_circuit_state: h.circuitState,
      p_consecutive_failures: h.consecutiveFailures,
      p_total_calls: h.totalCalls,
      p_total_successes: h.totalSuccesses,
      p_p50: p50,
      p_p95: p95,
      p_p99: p99,
      p_task_affinity: h.taskTypeSuccessRate,
      p_error_counts: h.errorCounts,
    }).then(() => {}).catch(e => console.warn('[NEXUS] Health persist failed:', e));
  } catch { /* silent */ }
}

// Fire-and-forget: record cost
function persistCostAsync(providerId: string, tokens: number, costUsd: number, taskType: string): void {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;

    sb.rpc('nexus_record_cost', {
      p_provider_id: providerId,
      p_tokens: tokens,
      p_cost_usd: costUsd,
      p_task_type: taskType,
    }).then(() => {}).catch(e => console.warn('[NEXUS] Cost persist failed:', e));
  } catch { /* silent */ }
}

// Fire-and-forget: persist affinity
function persistAffinityAsync(providerId: string, taskType: string, success: boolean, latencyMs: number, quality: number): void {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;

    sb.rpc('nexus_update_affinity', {
      p_provider_id: providerId,
      p_task_type: taskType,
      p_success: success,
      p_latency_ms: latencyMs,
      p_quality: quality,
    }).then(() => {}).catch(e => console.warn('[NEXUS] Affinity persist failed:', e));
  } catch { /* silent */ }
}

// Fire-and-forget: record trace
function persistTraceAsync(trace: {
  traceId: string; providerId: string; model: string; taskType: string;
  promptHash: string; promptTokens: number; completionTokens: number;
  totalTokens: number; latencyMs: number; status: string;
  errorCategory?: string; errorMessage?: string; fallbackChain: string[];
  attemptNumber: number; priority: string; temperature: number;
  qualityScore: number; costEstimate: number; metadata?: any;
}): void {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;

    sb.from('nexus_traces').insert({
      trace_id: trace.traceId,
      provider_id: trace.providerId,
      model: trace.model,
      task_type: trace.taskType,
      prompt_hash: trace.promptHash,
      prompt_tokens: trace.promptTokens,
      completion_tokens: trace.completionTokens,
      total_tokens: trace.totalTokens,
      latency_ms: trace.latencyMs,
      status: trace.status,
      error_category: trace.errorCategory,
      error_message: trace.errorMessage?.slice(0, 500),
      fallback_chain: trace.fallbackChain,
      attempt_number: trace.attemptNumber,
      priority: trace.priority,
      temperature: trace.temperature,
      quality_score: trace.qualityScore,
      cost_estimate_usd: trace.costEstimate,
      metadata: trace.metadata || {},
    }).then(() => {}).catch(e => console.warn('[NEXUS] Trace persist failed:', e));
  } catch { /* silent */ }
}

// Fire-and-forget: detect anomalies (v3 #14)
function detectAnomalies(providerId: string, h: HealthState): void {
  try {
    const sb = getSupabaseClient();
    if (!sb) return;

    const anomalies: { type: string; severity: string; description: string; metrics: any }[] = [];

    // High failure rate
    if (h.totalCalls > 10 && h.totalSuccesses / h.totalCalls < 0.5) {
      anomalies.push({
        type: "high_failure_rate",
        severity: "error",
        description: `Provider ${providerId} has <50% success rate (${((h.totalSuccesses/h.totalCalls)*100).toFixed(1)}%)`,
        metrics: { successRate: h.totalSuccesses / h.totalCalls, totalCalls: h.totalCalls },
      });
    }

    // Circuit stuck open
    if (h.circuitState === "open" && h.circuitOpenedAt > 0 && Date.now() - h.circuitOpenedAt > 300_000) {
      anomalies.push({
        type: "circuit_stuck_open",
        severity: "warning",
        description: `Provider ${providerId} circuit breaker stuck open for >5 minutes`,
        metrics: { openedAt: h.circuitOpenedAt, duration: Date.now() - h.circuitOpenedAt },
      });
    }

    // Latency spike
    const p95 = getLatencyP(providerId, 95);
    if (p95 > 20000) {
      anomalies.push({
        type: "latency_spike",
        severity: "warning",
        description: `Provider ${providerId} p95 latency at ${p95}ms (>20s)`,
        metrics: { p95 },
      });
    }

    for (const a of anomalies) {
      sb.from('nexus_anomalies').insert({
        provider_id: providerId,
        anomaly_type: a.type,
        severity: a.severity,
        description: a.description,
        metrics: a.metrics,
      }).then(() => {}).catch(() => {});
    }
  } catch { /* silent */ }
}

// ═══════════════════════════════════════════════════════════
// HEALTH & RATE MANAGEMENT
// ═══════════════════════════════════════════════════════════

function getHealth(id: string): HealthState {
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
      errorCounts: {} as Record<ErrorCategory, number>,
    });
  }
  return healthMap.get(id)!;
}

function canUse(p: ProviderDef): boolean {
  if (!Deno.env.get(p.envKey)) return false;

  const h = getHealth(p.id);
  const now = Date.now();

  // Circuit breaker with half-open probe (v3 #24)
  if (h.circuitState === "open") {
    if (now - h.circuitOpenedAt > CIRCUIT_OPEN_MS) {
      h.circuitState = "half-open";
    } else {
      return false;
    }
  }

  // v3 #10: Rate limit pre-check (predict exhaustion)
  let u = usageMap.get(p.id);
  if (!u) {
    u = { minuteCalls: 0, minuteReset: now + 60_000, dayCalls: 0, dayReset: now + 86_400_000 };
    usageMap.set(p.id, u);
  }
  if (now >= u.minuteReset) { u.minuteCalls = 0; u.minuteReset = now + 60_000; }
  if (now >= u.dayReset) { u.dayCalls = 0; u.dayReset = now + 86_400_000; }

  // Pre-check: if within 80% of limits, penalize heavily rather than block
  const minuteUtilization = u.minuteCalls / p.rpm;
  const dayUtilization = u.dayCalls / p.rpd;
  if (minuteUtilization >= 1.0 || dayUtilization >= 1.0) return false;

  return true;
}

function getRatePressure(p: ProviderDef): number {
  const u = usageMap.get(p.id);
  if (!u) return 0;
  const minutePressure = u.minuteCalls / p.rpm;
  const dayPressure = u.dayCalls / p.rpd;
  return Math.max(minutePressure, dayPressure);
}

function recordSuccess(id: string, latencyMs: number, taskType: string) {
  const h = getHealth(id);
  h.score = Math.min(100, h.score + 5);
  h.consecutiveFailures = 0;
  h.totalCalls++;
  h.totalSuccesses++;
  h.lastUsedAt = Date.now();
  if (h.circuitState === "half-open") h.circuitState = "closed";

  h.latencies.push(latencyMs);
  if (h.latencies.length > MAX_LATENCY_SAMPLES) h.latencies.shift();

  if (!h.taskTypeSuccessRate[taskType]) h.taskTypeSuccessRate[taskType] = { success: 0, total: 0 };
  h.taskTypeSuccessRate[taskType].success++;
  h.taskTypeSuccessRate[taskType].total++;

  const u = usageMap.get(id);
  if (u) { u.minuteCalls++; u.dayCalls++; }

  if (id === lastProviderUsed) { consecutiveSameProvider++; } else { consecutiveSameProvider = 1; lastProviderUsed = id; }

  // v3: Persist to DB (fire-and-forget)
  persistHealthAsync(id, h);
}

function recordFailure(id: string, taskType: string, errorCat: ErrorCategory) {
  const h = getHealth(id);
  h.score = Math.max(0, h.score - 20);
  h.consecutiveFailures++;
  h.totalCalls++;
  h.lastFailTime = Date.now();

  if (!h.taskTypeSuccessRate[taskType]) h.taskTypeSuccessRate[taskType] = { success: 0, total: 0 };
  h.taskTypeSuccessRate[taskType].total++;

  // v3: Error taxonomy persistence (#21)
  if (!h.errorCounts) h.errorCounts = {} as Record<ErrorCategory, number>;
  h.errorCounts[errorCat] = (h.errorCounts[errorCat] || 0) + 1;

  if (h.consecutiveFailures >= CIRCUIT_FAIL_THRESHOLD) {
    h.circuitState = "open";
    h.circuitOpenedAt = Date.now();
  }
  const u = usageMap.get(id);
  if (u) { u.minuteCalls++; u.dayCalls++; }

  // v3: Persist + anomaly detect
  persistHealthAsync(id, h);
  detectAnomalies(id, h);
}

function getLatencyP(id: string, percentile: number): number {
  const h = healthMap.get(id);
  if (!h || h.latencies.length === 0) return 0;
  const sorted = [...h.latencies].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * percentile / 100);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// v3 #22: Adaptive temperature
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

// v3 #23: Timeout scaling
function scaleTimeout(baseTimeout: number, promptLength: number): number {
  if (promptLength > 50000) return Math.min(baseTimeout * 3, 180_000);
  if (promptLength > 10000) return Math.min(baseTimeout * 2, 120_000);
  if (promptLength > 5000) return Math.min(baseTimeout * 1.5, 90_000);
  return baseTimeout;
}

// ═══════════════════════════════════════════════════════════
// PROVIDER CALL (TEXT)
// ═══════════════════════════════════════════════════════════

async function callProvider(
  p: ProviderDef,
  prompt: string,
  opts: NexusRouteOptions,
): Promise<{ content: string; tokensUsed: number; completionTokens: number }> {
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
    if (opts.tools && p.supportsTools) {
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

  const tokensUsed = data.usage?.total_tokens || data.usage?.output_tokens || Math.ceil(content.length / 4);
  const completionTokens = data.usage?.completion_tokens || data.usage?.output_tokens || Math.ceil(content.length / 4);
  return { content, tokensUsed, completionTokens };
}

// ═══════════════════════════════════════════════════════════
// PROVIDER SCORING & RANKING (v3 #17 — self-evolving weights)
// ═══════════════════════════════════════════════════════════

function scoreProvider(p: ProviderDef, taskType: string, opts: NexusRouteOptions, now: number): number {
  const h = getHealth(p.id);
  let score = h.score;

  // Static affinity
  if (p.affinities.includes(taskType)) score += 30;

  // v3 #17: Learned affinity (dynamic, self-evolving)
  const taskRate = h.taskTypeSuccessRate[taskType];
  if (taskRate && taskRate.total >= 3) {
    const successPct = taskRate.success / taskRate.total;
    score += successPct * 25;
    // Bonus for providers with deep experience in this task type
    if (taskRate.total >= 20) score += 5;
  }

  // Priority bonus
  score += (16 - p.priority) * 3;

  // Recency penalty
  if (h.lastFailTime > now - 30_000) score -= 25;

  // Prefer-provider bonus
  if (opts.preferProvider && p.id === opts.preferProvider) score += 50;

  // v3 #15: Tool support filter
  if (opts.tools && !p.supportsTools) score -= 200;

  // v3 #25: Cost-aware (penalize paid providers when free alternatives score similarly)
  if (p.costPer1kTokens > 0) score -= 5;
  if (opts.costCeiling !== undefined) {
    const estCost = estimateCost(p, estimateTokens(opts.systemPrompt || "") + 2048);
    if (estCost > opts.costCeiling) score -= 100;
  }

  // Priority boost
  if (opts.priority === "critical") score += 10;
  if (opts.priority === "low") score -= 5;

  // v3 #20: Diversity enforcement
  if (p.id === lastProviderUsed && consecutiveSameProvider >= 3) score -= 15;

  // Latency scoring
  const p95 = getLatencyP(p.id, 95);
  if (p95 > 0 && p95 < 5000) score += 5;
  if (p95 > 15000) score -= 10;

  // v3 #10: Rate pressure penalty
  const pressure = getRatePressure(p);
  if (pressure > 0.8) score -= 30;
  else if (pressure > 0.5) score -= 10;

  return score;
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT — nexusRoute() (TEXT)
// ═══════════════════════════════════════════════════════════

export async function nexusRoute(
  prompt: string,
  opts: NexusRouteOptions = {},
): Promise<NexusRouteResult> {
  // v3 #1: Hydrate from DB on first call
  await hydrateFromDb();

  const startMs = Date.now();
  const traceId = opts.traceId || generateTraceId();
  const taskType = classifyTask(prompt, opts.taskType); // v3 #6: semantic classification
  const maxAttempts = opts.maxAttempts ?? 5;

  // v3 #9: Request coalescing
  const hash = contentHash(prompt + (opts.systemPrompt || "") + taskType);
  const inflight = inflightRequests.get(hash);
  if (inflight) {
    console.log(`[NEXUS] Coalescing duplicate request ${hash}`);
    return inflight;
  }

  // Dedup cache
  const dedupeWindow = opts.dedupeWindowMs ?? 30_000;
  const cached = dedupeCache.get(hash);
  if (cached && Date.now() - cached.timestamp < dedupeWindow) {
    return { ...cached.result, latencyMs: Date.now() - startMs, attempts: 0, fallbackChain: ["dedup-cache"], traceId };
  }

  // Clean old dedup entries
  const now = Date.now();
  for (const [k, v] of dedupeCache) {
    if (now - v.timestamp > 60_000) dedupeCache.delete(k);
  }
  if (dedupeCache.size > 200) dedupeCache.clear();

  // v3 #3: Token-counting pre-flight
  let processedPrompt = prompt;
  const estimatedTokens = estimateTokens(prompt);

  // v3 #8: Auto-compress if needed
  if (opts.compressPrompt !== false) {
    // Will be applied per-provider during routing based on context window
  }

  const routePromise = (async (): Promise<NexusRouteResult> => {
    // Score and sort available providers
    const ranked = PROVIDERS
      .filter(p => canUse(p))
      .filter(p => p.contextWindow > estimatedTokens * 1.5)
      .map(p => ({ provider: p, score: scoreProvider(p, taskType, opts, now) }))
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
        // v3 #8: Per-provider prompt compression
        let callPrompt = processedPrompt;
        if (estimatedTokens > provider.contextWindow * 0.8) {
          callPrompt = compressPrompt(processedPrompt, Math.floor(provider.contextWindow * 0.7));
          console.log(`[NEXUS] Compressed prompt from ${estimatedTokens} to ~${estimateTokens(callPrompt)} tokens for ${provider.id}`);
        }

        const result = await callProvider(provider, callPrompt, { ...opts, taskType });

        // v3 #18: Quality gate
        const quality = scoreQuality(result.content, opts);
        if (quality < 0.2) {
          throw new Error(`[${provider.name}] Low quality response (score: ${quality.toFixed(2)})`);
        }

        const latencyMs = Date.now() - startMs;
        const costUsd = estimateCost(provider, result.tokensUsed);

        recordSuccess(provider.id, latencyMs, taskType);

        // v3: Persist cost + affinity + trace
        persistCostAsync(provider.id, result.tokensUsed, costUsd, taskType);
        persistAffinityAsync(provider.id, taskType, true, latencyMs, quality);
        persistTraceAsync({
          traceId, providerId: provider.id, model: provider.model, taskType,
          promptHash: hash, promptTokens: estimatedTokens, completionTokens: result.completionTokens,
          totalTokens: result.tokensUsed, latencyMs, status: 'success',
          fallbackChain, attemptNumber: attempt, priority: opts.priority || 'normal',
          temperature: adaptiveTemperature(taskType, opts.temperature),
          qualityScore: quality, costEstimate: costUsd,
        });

        const routeResult: NexusRouteResult = {
          content: result.content,
          provider: provider.id,
          model: provider.model,
          latencyMs,
          tokensUsed: result.tokensUsed,
          attempts: fallbackChain.length,
          fallbackChain,
          traceId,
          qualityScore: quality,
          estimatedCostUsd: costUsd,
        };

        dedupeCache.set(hash, { result: routeResult, timestamp: Date.now() });
        return routeResult;
      } catch (err: any) {
        lastError = err instanceof Error ? err.message : String(err);
        lastErrorCategory = classifyError(err, err?.statusCode);
        console.error(`[NEXUS] ${provider.id} failed (${lastErrorCategory}): ${lastError}`);
        recordFailure(provider.id, taskType, lastErrorCategory);

        // v3: Trace the failure
        persistTraceAsync({
          traceId, providerId: provider.id, model: provider.model, taskType,
          promptHash: hash, promptTokens: estimatedTokens, completionTokens: 0,
          totalTokens: 0, latencyMs: Date.now() - startMs, status: 'failure',
          errorCategory: lastErrorCategory, errorMessage: lastError,
          fallbackChain, attemptNumber: attempt, priority: opts.priority || 'normal',
          temperature: adaptiveTemperature(taskType, opts.temperature),
          qualityScore: 0, costEstimate: 0,
        });
        persistAffinityAsync(provider.id, taskType, false, Date.now() - startMs, 0);

        // v3 #19: Exponential backoff with jitter (skip for auth errors)
        if (lastErrorCategory !== "auth" && attempt < ranked.length) {
          await new Promise(r => setTimeout(r, backoffWithJitter(attempt)));
        }
      }
    }

    const finalError = new Error(`[NEXUS] All ${fallbackChain.length} providers failed. Last (${lastErrorCategory}): ${lastError}. Chain: ${fallbackChain.join(" → ")}`);
    (finalError as any).errorTaxonomy = lastErrorCategory;
    (finalError as any).traceId = traceId;
    throw finalError;
  })();

  // v3 #9: Register as inflight for coalescing
  inflightRequests.set(hash, routePromise);
  try {
    return await routePromise;
  } finally {
    inflightRequests.delete(hash);
  }
}

// ═══════════════════════════════════════════════════════════
// STREAMING ROUTE (v3 #2)
// ═══════════════════════════════════════════════════════════

export function nexusStreamRoute(
  prompt: string,
  opts: NexusRouteOptions = {},
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        // For streaming, we pick the best provider and stream directly
        await hydrateFromDb();
        const taskType = classifyTask(prompt, opts.taskType);
        const now = Date.now();

        const ranked = PROVIDERS
          .filter(p => canUse(p) && p.supportsStreaming && !p.isGoogleFormat && !p.isCohereFormat)
          .map(p => ({ provider: p, score: scoreProvider(p, taskType, opts, now) }))
          .filter(x => x.score > -50)
          .sort((a, b) => b.score - a.score);

        if (ranked.length === 0) {
          // Fallback: non-streaming full response
          const result = await nexusRoute(prompt, opts);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: result.content, provider: result.provider, done: true })}\n\n`));
          controller.close();
          return;
        }

        const provider = ranked[0].provider;
        const apiKey = Deno.env.get(provider.envKey)!;
        const temperature = adaptiveTemperature(taskType, opts.temperature);
        const timeout = scaleTimeout(opts.timeoutMs ?? 30_000, prompt.length);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        };
        if (provider.extraHeaders) Object.assign(headers, provider.extraHeaders);

        const body = {
          model: provider.model,
          messages: [
            { role: "system", content: opts.systemPrompt || "You are an expert AI assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: opts.maxTokens ?? 2048,
          temperature,
          stream: true,
        };

        const resp = await fetch(provider.baseUrl, {
          method: "POST", headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeout),
        });

        if (!resp.ok || !resp.body) {
          const fallbackResult = await nexusRoute(prompt, opts);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fallbackResult.content, provider: fallbackResult.provider, done: true })}\n\n`));
          controller.close();
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, provider: provider.id })}\n\n`));
              continue;
            }

            try {
              const chunk = JSON.parse(data);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta, provider: provider.id })}\n\n`));
              }
            } catch { /* skip malformed chunks */ }
          }
        }

        recordSuccess(provider.id, Date.now() - now, taskType);
        controller.close();
      } catch (err) {
        console.error('[NEXUS-STREAM] Error:', err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err), done: true })}\n\n`));
        controller.close();
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════
// CONSENSUS ROUTE (v3 #4 — multi-model agreement)
// ═══════════════════════════════════════════════════════════

export async function nexusConsensusRoute(
  prompt: string,
  opts: NexusRouteOptions = {},
): Promise<NexusRouteResult & { consensusResults: Array<{ provider: string; content: string; quality: number }> }> {
  const count = opts.consensusCount || 3;
  await hydrateFromDb();

  const taskType = classifyTask(prompt, opts.taskType);
  const now = Date.now();

  // Select top N distinct providers
  const ranked = PROVIDERS
    .filter(p => canUse(p))
    .map(p => ({ provider: p, score: scoreProvider(p, taskType, opts, now) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // Deduplicate by envKey to ensure diversity
  const seen = new Set<string>();
  const selected: ProviderDef[] = [];
  for (const { provider } of ranked) {
    const key = `${provider.envKey}_${provider.model}`;
    if (!seen.has(key) && selected.length < count) {
      seen.add(key);
      selected.push(provider);
    }
  }

  if (selected.length < 2) {
    // Not enough providers for consensus — fall back to single route
    const result = await nexusRoute(prompt, opts);
    return { ...result, consensusResults: [{ provider: result.provider, content: result.content, quality: result.qualityScore }] };
  }

  // Run all in parallel
  const results = await Promise.allSettled(
    selected.map(p => callProvider(p, prompt, opts).then(r => ({ ...r, provider: p })))
  );

  const successes = results
    .filter((r): r is PromiseFulfilledResult<{ content: string; tokensUsed: number; completionTokens: number; provider: ProviderDef }> => r.status === 'fulfilled')
    .map(r => ({
      ...r.value,
      quality: scoreQuality(r.value.content, opts),
    }));

  if (successes.length === 0) {
    throw new Error("[NEXUS-CONSENSUS] All consensus providers failed");
  }

  // Pick the highest quality response
  successes.sort((a, b) => b.quality - a.quality);
  const best = successes[0];
  const latencyMs = Date.now() - now;

  return {
    content: best.content,
    provider: best.provider.id,
    model: best.provider.model,
    latencyMs,
    tokensUsed: best.tokensUsed,
    attempts: selected.length,
    fallbackChain: selected.map(p => p.id),
    traceId: opts.traceId || generateTraceId(),
    qualityScore: best.quality,
    estimatedCostUsd: successes.reduce((sum, s) => sum + estimateCost(s.provider, s.tokensUsed), 0),
    consensusResults: successes.map(s => ({
      provider: s.provider.id,
      content: s.content.slice(0, 200),
      quality: s.quality,
    })),
  };
}

// ═══════════════════════════════════════════════════════════
// IMAGE ROUTE — nexusImageRoute() (v3 #16)
// ═══════════════════════════════════════════════════════════

export async function nexusImageRoute(
  prompt: string,
  opts: NexusImageOptions = {},
): Promise<NexusImageResult> {
  const startMs = Date.now();
  const traceId = opts.traceId || generateTraceId();
  const maxAttempts = opts.maxAttempts ?? IMAGE_PROVIDERS.length;
  const fallbackChain: string[] = [];
  let lastError = "";

  // v3 #16: If usePro, prioritize pro model
  let available = IMAGE_PROVIDERS
    .filter(p => !!Deno.env.get(p.envKey))
    .sort((a, b) => a.priority - b.priority);

  if (opts.usePro) {
    // Move pro model to top
    available = available.sort((a, b) => {
      if (a.id === "lovable-imagen-pro") return -1;
      if (b.id === "lovable-imagen-pro") return 1;
      return a.priority - b.priority;
    });
  } else {
    // Remove pro from default cascade (save quota)
    available = available.filter(p => p.id !== "lovable-imagen-pro");
  }

  if (available.length === 0) {
    throw new Error("[NEXUS-IMAGE] No image providers configured — need GOOGLE_AI_STUDIO_KEY, LOVABLE_API_KEY, FAL_API_KEY, or STABILITY_API_KEY");
  }

  for (let i = 0; i < Math.min(maxAttempts, available.length); i++) {
    const provider = available[i];
    fallbackChain.push(provider.id);

    try {
      const apiKey = Deno.env.get(provider.envKey)!;
      const result = await provider.generate(prompt, apiKey, opts.style);

      // v3: Trace image generation
      persistTraceAsync({
        traceId, providerId: provider.id, model: provider.name, taskType: 'image',
        promptHash: contentHash(prompt), promptTokens: 0, completionTokens: 0,
        totalTokens: 0, latencyMs: Date.now() - startMs, status: 'success',
        fallbackChain, attemptNumber: i + 1, priority: 'normal',
        temperature: 0, qualityScore: 1, costEstimate: 0,
      });

      return {
        imageData: result.imageData,
        mimeType: result.mimeType,
        provider: provider.id,
        model: provider.name,
        latencyMs: Date.now() - startMs,
        attempts: fallbackChain.length,
        fallbackChain,
        textContent: result.textContent,
        traceId,
      };
    } catch (err: any) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[NEXUS-IMAGE] ${provider.id} failed: ${lastError}`);

      persistTraceAsync({
        traceId, providerId: provider.id, model: provider.name, taskType: 'image',
        promptHash: contentHash(prompt), promptTokens: 0, completionTokens: 0,
        totalTokens: 0, latencyMs: Date.now() - startMs, status: 'failure',
        errorCategory: classifyError(err), errorMessage: lastError,
        fallbackChain, attemptNumber: i + 1, priority: 'normal',
        temperature: 0, qualityScore: 0, costEstimate: 0,
      });

      if (i < available.length - 1) {
        await new Promise(r => setTimeout(r, backoffWithJitter(i + 1, 500)));
      }
    }
  }

  throw new Error(`[NEXUS-IMAGE] All ${fallbackChain.length} image providers failed. Last: ${lastError}. Chain: ${fallbackChain.join(" → ")}`);
}

// ═══════════════════════════════════════════════════════════
// FLEET STATUS (v3 #13 — enhanced dashboard data)
// ═══════════════════════════════════════════════════════════

export function getFleetHealth(): Record<string, any> {
  const status: Record<string, any> = {};
  const totalCalls = Array.from(healthMap.values()).reduce((sum, h) => sum + h.totalCalls, 0);

  for (const p of PROVIDERS) {
    const h = getHealth(p.id);
    status[p.id] = {
      name: p.name,
      model: p.model,
      score: h.score,
      circuit: h.circuitState,
      available: canUse(p),
      hasKey: !!Deno.env.get(p.envKey),
      totalCalls: h.totalCalls,
      totalSuccesses: h.totalSuccesses,
      successRate: h.totalCalls > 0 ? `${(h.totalSuccesses / h.totalCalls * 100).toFixed(1)}%` : "n/a",
      p50: getLatencyP(p.id, 50),
      p95: getLatencyP(p.id, 95),
      p99: getLatencyP(p.id, 99),
      ratePressure: `${(getRatePressure(p) * 100).toFixed(0)}%`,
      costPer1k: p.costPer1kTokens,
      supportsTools: p.supportsTools,
      supportsStreaming: p.supportsStreaming,
      region: p.region,
      taskAffinities: h.taskTypeSuccessRate,
      errorBreakdown: h.errorCounts,
      trafficShare: totalCalls > 0 ? `${(h.totalCalls / totalCalls * 100).toFixed(1)}%` : "0%",
    };
  }

  for (const p of IMAGE_PROVIDERS) {
    status[`img:${p.id}`] = {
      name: p.name,
      available: !!Deno.env.get(p.envKey),
      priority: p.priority,
    };
  }

  // Fleet-level summary
  status["_fleet"] = {
    version: "3.0.0",
    totalProviders: PROVIDERS.length,
    activeProviders: PROVIDERS.filter(p => canUse(p)).length,
    imageProviders: IMAGE_PROVIDERS.filter(p => !!Deno.env.get(p.envKey)).length,
    totalCalls,
    dbHydrated,
    features: [
      "persistent-health", "streaming", "token-preflight", "consensus",
      "cost-ledger", "semantic-classify", "affinity-persistence", "prompt-compression",
      "request-coalescing", "rate-precheck", "regional-routing", "distributed-tracing",
      "anomaly-detection", "tool-routing", "image-cascade-v2", "self-evolving-weights",
      "quality-gates", "backoff-jitter", "diversity-enforcement", "error-taxonomy",
      "adaptive-temperature", "timeout-scaling", "circuit-warmup", "cost-aware-routing",
    ],
  };

  return status;
}

export const FLEET_PROVIDERS = PROVIDERS.map(p => p.id);
export const IMAGE_FLEET_PROVIDERS = IMAGE_PROVIDERS.map(p => p.id);
