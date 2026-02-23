/**
 * NEXUS Image Generation — Direct Google AI Studio API
 * NO Lovable AI gateway — calls Gemini directly via GOOGLE_AI_STUDIO_KEY
 * Daily limit: 25 images/day (tracked in ai_usage_log)
 */

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
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const GOOGLE_KEY = Deno.env.get("GOOGLE_AI_STUDIO_KEY");
    if (!GOOGLE_KEY) {
      throw new Error("GOOGLE_AI_STUDIO_KEY not configured");
    }

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

    // Build enhanced prompt
    const fullPrompt = style
      ? `Generate an image: ${prompt.trim()}. Style: ${style.trim()}. High quality, detailed.`
      : `Generate an image: ${prompt.trim()}. High quality, detailed.`;

    // Call Google AI Studio (Gemini) directly for image generation
    const model = "gemini-2.0-flash-exp-image-generation";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Google AI Studio error [${response.status}]: ${errBody.slice(0, 500)}`);
    }

    const aiData = await response.json();
    
    // Extract image from response parts
    const parts = aiData.candidates?.[0]?.content?.parts || [];
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

    if (!imageData) {
      throw new Error("No image returned from Google AI Studio. Response: " + textContent.slice(0, 200));
    }

    const latencyMs = Date.now() - startMs;

    // Log to ai_usage_log
    await supabase.from("ai_usage_log").insert({
      provider: "google-aistudio",
      model: model,
      category: "image_generation",
      success: true,
      tokens_used: 0,
      cost: 0,
      response_time_ms: latencyMs,
      metadata: { prompt: prompt.slice(0, 200), style: style || null },
    });

    return new Response(
      JSON.stringify({
        success: true,
        imageData,
        mimeType,
        remainingToday: DAILY_LIMIT - used - 1,
        latencyMs,
        provider: "google-aistudio/" + model,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    const latencyMs = Date.now() - startMs;

    // Log failure
    try {
      await supabase.from("ai_usage_log").insert({
        provider: "google-aistudio",
        model: "gemini-2.0-flash-exp-image-generation",
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
