import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_MODEL = "gpt-4o-mini";
const HARD_MAX_TOKENS = 2200;
const COST_CEILING_USD = 0.05;

const MODEL_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
};

function estimateCostUsd(model: string, promptTokens: number, completionTokens: number) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return null;

  return Number(
    ((promptTokens / 1_000_000) * pricing.inputPerMillion +
      (completionTokens / 1_000_000) * pricing.outputPerMillion).toFixed(6)
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const {
      prompt,
      systemPrompt = "You are a careful senior software engineer.",
      model = DEFAULT_MODEL,
      temperature = 0.1,
      maxTokens = HARD_MAX_TOKENS,
      metadata = {},
    } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      throw new Error("prompt is required");
    }

    const enforcedModel = DEFAULT_MODEL;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: enforcedModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature,
        max_tokens: Math.min(Math.max(256, maxTokens), HARD_MAX_TOKENS),
      }),
      signal: AbortSignal.timeout(30000),
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`OpenAI API error [${response.status}]: ${rawText.slice(0, 300)}`);
    }

    const data = JSON.parse(rawText);
    const content = data.choices?.[0]?.message?.content ?? "";
    const promptTokens = data.usage?.prompt_tokens ?? 0;
    const completionTokens = data.usage?.completion_tokens ?? 0;
    const tokensUsed = data.usage?.total_tokens ?? (promptTokens + completionTokens);
    const estimatedCostUsd = estimateCostUsd(enforcedModel, promptTokens, completionTokens);

    try {
      await supabase.from("ai_usage_log").insert({
        provider: "openai",
        model: enforcedModel,
        category: metadata?.routeKey || "evolution_patch",
        response_time_ms: null,
        success: true,
        tokens_used: tokensUsed,
        cost: estimatedCostUsd ?? 0,
        metadata: {
          ...metadata,
          requested_model: model,
          enforced_model: enforcedModel,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          within_budget: estimatedCostUsd === null ? null : estimatedCostUsd <= COST_CEILING_USD,
        },
      });
    } catch {
      // non-blocking telemetry
    }

    return new Response(JSON.stringify({
      content,
      provider: "openai",
      model: enforcedModel,
      tokensUsed,
      promptTokens,
      completionTokens,
      estimatedCostUsd,
      withinBudget: estimatedCostUsd === null ? true : estimatedCostUsd <= COST_CEILING_USD,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});