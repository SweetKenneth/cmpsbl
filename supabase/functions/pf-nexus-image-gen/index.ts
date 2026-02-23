import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build enhanced prompt
    const fullPrompt = style
      ? `${prompt.trim()}. Style: ${style.trim()}. High quality, detailed.`
      : `${prompt.trim()}. High quality, detailed.`;

    // Generate image via Lovable AI gateway (Gemini Flash Image)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`AI gateway error [${response.status}]: ${errBody}`);
    }

    const aiData = await response.json();
    const choice = aiData.choices?.[0]?.message;
    const imageUrl = choice?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image returned from AI gateway");
    }

    // Extract base64 data (strip data:image/...;base64, prefix)
    const base64Match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    const mimeType = base64Match?.[1] || "image/png";
    const imageData = base64Match?.[2] || imageUrl;

    const latencyMs = Date.now() - startMs;

    // Log to ai_usage_log for tracking
    await supabase.from("ai_usage_log").insert({
      provider: "google",
      model: "gemini-2.5-flash-image",
      category: "image_generation",
      success: true,
      tokens_used: 0,
      cost: 0,
      response_time_ms: latencyMs,
      metadata: { prompt: prompt.slice(0, 200), style: style || null },
    });

    const remaining = DAILY_LIMIT - used - 1;

    return new Response(
      JSON.stringify({
        success: true,
        imageData,
        mimeType,
        remainingToday: remaining,
        latencyMs,
        provider: "google/gemini-2.5-flash-image",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startMs;

    // Log failure
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("ai_usage_log").insert({
        provider: "google",
        model: "gemini-2.5-flash-image",
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
