/**
 * NEXUS Image Generation v2.0 — Multi-provider cascading image gen
 * Routes through: Google AI Studio → Lovable AI → FAL.ai → Stability AI
 * Daily limit: 25 images/day (tracked in ai_usage_log)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { nexusImageRoute } from "../_shared/nexus-route.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 25;

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
    const { prompt, style } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    // Check daily usage
    const today = new Date().toISOString().split("T")[0];
    const { count: usedToday } = await supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("category", "image_generation")
      .gte("created_at", `${today}T00:00:00Z`);

    const used = usedToday || 0;
    if (used >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Daily image limit reached (${DAILY_LIMIT}/day). Resets at midnight UTC.`,
          remainingToday: 0,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Route through NEXUS image fleet — cascades through all available image providers
    console.log(`🎨 NEXUS Image: routing "${prompt.slice(0, 80)}..." through image fleet`);
    
    const result = await nexusImageRoute(prompt, { style });

    const latencyMs = Date.now() - startMs;
    console.log(`✅ NEXUS Image: ${result.provider} delivered in ${latencyMs}ms (chain: ${result.fallbackChain.join(" → ")})`);

    // Log to ai_usage_log
    await supabase.from("ai_usage_log").insert({
      provider: result.provider,
      model: result.model,
      category: "image_generation",
      success: true,
      tokens_used: 0,
      cost: 0,
      response_time_ms: latencyMs,
      metadata: {
        prompt: prompt.slice(0, 200),
        style: style || null,
        fallback_chain: result.fallbackChain,
        attempts: result.attempts,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType,
        remainingToday: DAILY_LIMIT - used - 1,
        latencyMs,
        provider: `${result.provider}/${result.model}`,
        fallbackChain: result.fallbackChain,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startMs;

    // Log failure
    try {
      await supabase.from("ai_usage_log").insert({
        provider: "nexus-image-fleet",
        model: "multi-provider",
        category: "image_generation",
        success: false,
        tokens_used: 0,
        cost: 0,
        response_time_ms: latencyMs,
        metadata: { error: error.message },
      });
    } catch { /* silent */ }

    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
