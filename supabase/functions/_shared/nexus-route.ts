/**
 * NEXUS Shared Route — Thin wrapper for edge functions to call pf-nexus-router
 * 
 * Exports:
 * - nexusRoute()      — Standard text completion via NEXUS fleet
 * - nexusStreamRoute() — SSE streaming via NEXUS fleet  
 * - nexusImageRoute()  — Image generation via provider cascade
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ═══════════════════════════════════════════════════════════════════
// nexusRoute — Standard text completion
// ═══════════════════════════════════════════════════════════════════

interface NexusRouteOptions {
  systemPrompt?: string;
  taskType?: string;
  maxTokens?: number;
  temperature?: number;
  provider?: string;
  routeKey?: string;
  priority?: string;
}

interface NexusRouteResult {
  content: string;
  provider: string;
  model: string;
  latencyMs: number;
  tokensUsed: number;
}

export async function nexusRoute(
  prompt: string,
  options: NexusRouteOptions = {},
): Promise<NexusRouteResult> {
  const {
    systemPrompt = "You are an expert AI assistant. Be concise and accurate.",
    taskType = "reasoning",
    maxTokens = 1500,
    temperature = 0.7,
    provider,
    routeKey,
  } = options;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/pf-nexus-router`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      systemPrompt,
      temperature,
      maxTokens,
      provider,
      metadata: { taskType, routeKey: routeKey || "nexus_route" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NEXUS route failed [${response.status}]: ${errText.slice(0, 300)}`);
  }

  return await response.json();
}

// ═══════════════════════════════════════════════════════════════════
// nexusStreamRoute — SSE streaming (returns ReadableStream)
// ═══════════════════════════════════════════════════════════════════

interface NexusStreamOptions {
  messages?: Array<{ role: string; content: string }>;
  taskType?: string;
  maxTokens?: number;
  temperature?: number;
  openaiCompat?: boolean;
  priority?: string;
}

export function nexusStreamRoute(
  _prompt: string,
  options: NexusStreamOptions = {},
): ReadableStream {
  const {
    messages = [],
    taskType = "chat",
    maxTokens = 4096,
    temperature = 0.7,
  } = options;

  // Extract system prompt from messages array
  const systemMsg = messages.find(m => m.role === "system");
  const userMessages = messages.filter(m => m.role !== "system");
  const lastUserMsg = userMessages[userMessages.length - 1]?.content || _prompt;

  return new ReadableStream({
    async start(controller) {
      try {
        const result = await nexusRoute(lastUserMsg, {
          systemPrompt: systemMsg?.content || "You are an expert AI assistant.",
          taskType,
          maxTokens,
          temperature,
        });

        // Emit as SSE chunks for OpenAI-compatible streaming
        const words = result.content.split(/(\s+)/);
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join("");
          const sseData = JSON.stringify({
            choices: [{
              delta: { content: chunk },
              index: 0,
            }],
            model: result.model,
          });
          controller.enqueue(new TextEncoder().encode(`data: ${sseData}\n\n`));
        }

        // Send done signal
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Stream failed";
        const sseError = JSON.stringify({ error: errorMsg });
        controller.enqueue(new TextEncoder().encode(`data: ${sseError}\n\n`));
        controller.close();
      }
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// nexusImageRoute — Image generation via provider cascade
// ═══════════════════════════════════════════════════════════════════

interface NexusImageOptions {
  style?: string;
  size?: string;
}

interface NexusImageResult {
  imageUrl: string;
  provider: string;
  model: string;
  fallbackChain: string[];
}

const IMAGE_PROVIDERS = [
  {
    id: "google-imagen",
    name: "Google AI Studio",
    envKey: "GOOGLE_AI_STUDIO_KEY",
    model: "gemini-2.0-flash",
  },
  {
    id: "fal-ai",
    name: "FAL.ai",
    envKey: "FAL_API_KEY",
    model: "fal-ai/flux",
  },
];

export async function nexusImageRoute(
  prompt: string,
  options: NexusImageOptions = {},
): Promise<NexusImageResult> {
  const { style } = options;
  const fullPrompt = style ? `${prompt}, style: ${style}` : prompt;
  const fallbackChain: string[] = [];

  for (const provider of IMAGE_PROVIDERS) {
    const apiKey = Deno.env.get(provider.envKey);
    if (!apiKey) continue;

    fallbackChain.push(provider.id);

    try {
      if (provider.id === "google-imagen") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Generate an image: ${fullPrompt}` }] }],
            generationConfig: { maxOutputTokens: 256 },
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (res.ok) {
          const data = await res.json();
          const textDesc = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          return {
            imageUrl: textDesc,
            provider: provider.id,
            model: provider.model,
            fallbackChain,
          };
        }
        await res.text(); // consume body
      }

      if (provider.id === "fal-ai") {
        const res = await fetch("https://fal.run/fal-ai/flux/dev", {
          method: "POST",
          headers: {
            "Authorization": `Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: fullPrompt }),
          signal: AbortSignal.timeout(60000),
        });

        if (res.ok) {
          const data = await res.json();
          return {
            imageUrl: data.images?.[0]?.url || "",
            provider: provider.id,
            model: provider.model,
            fallbackChain,
          };
        }
        await res.text();
      }
    } catch (err) {
      console.error(`NEXUS Image: ${provider.id} failed:`, err);
    }
  }

  throw new Error(`All image providers failed. Chain: ${fallbackChain.join(" → ")}`);
}