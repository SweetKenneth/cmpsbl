import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 8 segment keys required in script JSON
const SEGMENT_KEYS = [
  "opening", "system_health", "clm_update", "substrate_update",
  "engine_spotlight", "capability_drop", "promo", "closing",
] as const;

// Rotating analyst voice bench — ElevenLabs voice IDs
const VOICE_BENCH = {
  station_host: ["onwK4e9ZLuTAKqWW03F9", "TX3LPaxmHKxFdv7VOQHJ", "JBFqnCBsd6RMkjVDRZzb"], // Daniel, Liam, George
  immune_analyst: ["cjVigY5qzO86Huf0OWal", "nPczCjzI2devNBz1zQrb"], // Eric, Brian
  salience_analyst: ["iP95p4xoKVk53GoZ742B", "bIHbv24MWmeRgasZH58o"], // Chris, Will
  governor_analyst: ["CwhRBWXzGAHq8TQ4Fs17", "N2lVS1w4EtoT3dr4eOWO"], // Roger, Callum
  temporal_specialist: ["SAz9YHcvj6GT2YYXdXww", "IKne3meq5aSn9XLyUdCD"], // River, Charlie
  infrastructure: ["Xb7hH8MSUJpSbSDYk0k2", "FGY2WhTYpPnrIDTdsKH5"], // Alice, Laura
};

const SEGMENT_VOICE_MAP: Record<string, keyof typeof VOICE_BENCH> = {
  opening: "station_host",
  system_health: "immune_analyst",
  clm_update: "salience_analyst",
  substrate_update: "governor_analyst",
  engine_spotlight: "temporal_specialist",
  capability_drop: "infrastructure",
  promo: "station_host",
  closing: "temporal_specialist",
};

function pickVoice(role: keyof typeof VOICE_BENCH, dayOfYear: number, segmentIdx: number): string {
  const pool = VOICE_BENCH[role];
  return pool[(dayOfYear + segmentIdx) % pool.length];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function validateScript(script: Record<string, string>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const key of SEGMENT_KEYS) {
    if (!script[key]) { errors.push(`Missing segment: ${key}`); continue; }
    const wc = wordCount(script[key]);
    if (wc > 150) errors.push(`${key} has ${wc} words (max 150)`);
  }
  return { valid: errors.length === 0, errors };
}

// Nexus provider fleet — health-weighted fallback chain
const NEXUS_PROVIDERS = [
  { name: "groq", url: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile", keyEnv: "GROQ_API_KEY" },
  { name: "cerebras", url: "https://api.cerebras.ai/v1/chat/completions", model: "llama-3.3-70b", keyEnv: "CEREBRAS_API_KEY" },
  { name: "sambanova", url: "https://api.sambanova.ai/v1/chat/completions", model: "Meta-Llama-3.3-70B-Instruct", keyEnv: "SAMBANOVA_API_KEY" },
  { name: "together", url: "https://api.together.xyz/v1/chat/completions", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", keyEnv: "TOGETHER_API_KEY" },
  { name: "deepseek", url: "https://api.deepseek.com/v1/chat/completions", model: "deepseek-chat", keyEnv: "DEEPSEEK_API_KEY" },
  { name: "openrouter", url: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.3-70b-instruct", keyEnv: "OPENROUTER_API_KEY" },
];

const RADIO_SYSTEM_PROMPT = `You are CMPSBL Radio's script generator. Output ONLY valid JSON with exactly these 8 keys: opening, system_health, clm_update, substrate_update, engine_spotlight, capability_drop, promo, closing.

Rules:
- Each segment: 40-120 words. Max 150.
- Tone: calm, intelligent, futuristic. No hype, no humor, no speculation.
- No invented metrics — only reference data provided in the user message.
- "promo" segment: max 1 subtle upgrade reference. No direct sales language. Position higher tiers as capability layers.
- "closing" segment: sign off with "This has been CMPSBL Radio."
- Output raw JSON only. No markdown, no code fences.`;

async function callNexusProvider(provider: typeof NEXUS_PROVIDERS[0], messages: Array<{role: string; content: string}>): Promise<string> {
  const apiKey = Deno.env.get(provider.keyEnv);
  if (!apiKey) throw new Error(`${provider.name}: key not configured`);

  const resp = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: 2000,
      temperature: 0.4,
    }),
  });

  if (!resp.ok) throw new Error(`${provider.name}: ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function generateScript(metricsContext: string): Promise<{ script: Record<string, string>; provider: string }> {
  const messages = [
    { role: "system", content: RADIO_SYSTEM_PROMPT },
    { role: "user", content: `Generate today's CMPSBL Radio broadcast script using these system metrics:\n\n${metricsContext}\n\nOutput the 8-segment JSON now.` },
  ];

  for (const provider of NEXUS_PROVIDERS) {
    try {
      console.log(`Nexus: trying ${provider.name}...`);
      const raw = await callNexusProvider(provider, messages);
      const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      const parsed = JSON.parse(cleaned);
      console.log(`Nexus: ${provider.name} succeeded`);
      return { script: parsed, provider: provider.name };
    } catch (e) {
      console.warn(`Nexus: ${provider.name} failed:`, e instanceof Error ? e.message : e);
    }
  }
  throw new Error("All Nexus providers failed");
}

async function generateTTS(text: string, voiceId: string, elevenLabsKey: string): Promise<ArrayBuffer> {
  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.65,
          similarity_boost: 0.75,
          style: 0.15,
          use_speaker_boost: true,
          speed: 0.95,
        },
      }),
    }
  );
  if (!resp.ok) throw new Error(`TTS failed for voice ${voiceId}: ${resp.status} ${await resp.text()}`);
  return resp.arrayBuffer();
}

function concatAudioBuffers(buffers: ArrayBuffer[]): Uint8Array {
  const totalLen = buffers.reduce((s, b) => s + b.byteLength, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result;
}

async function fetchMetricsContext(supabase: ReturnType<typeof createClient>): Promise<string> {
  // Pull real system metrics
  const lines: string[] = [`Broadcast date: ${new Date().toISOString().split("T")[0]}`];

  // Module health from substrate_modules
  const { data: modules } = await supabase
    .from("substrate_modules")
    .select("name, status, health_score, boot_time_ms")
    .limit(25);
  if (modules?.length) {
    const healthy = modules.filter((m: any) => m.status === "active").length;
    lines.push(`Active modules: ${healthy}/${modules.length}`);
    const avgHealth = modules.reduce((s: number, m: any) => s + (m.health_score ?? 0), 0) / modules.length;
    lines.push(`Avg module health: ${avgHealth.toFixed(1)}%`);
  }

  // Recent agency tasks
  const { data: tasks } = await supabase
    .from("agency_tasks")
    .select("status")
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());
  if (tasks?.length) {
    const completed = tasks.filter((t: any) => t.status === "completed").length;
    lines.push(`Tasks (24h): ${completed} completed / ${tasks.length} total`);
  }

  // CLM patches
  const { data: patches } = await supabase
    .from("clm_patch_log")
    .select("id, status")
    .gte("created_at", new Date(Date.now() - 86400000).toISOString())
    .limit(50);
  if (patches?.length) {
    const applied = patches.filter((p: any) => p.status === "applied").length;
    lines.push(`CLM patches (24h): ${applied} applied / ${patches.length} total`);
  }

  // AI usage
  const { data: usage } = await supabase
    .from("ai_usage_log")
    .select("tokens_used, cost")
    .gte("created_at", new Date(Date.now() - 86400000).toISOString())
    .limit(100);
  if (usage?.length) {
    const totalTokens = usage.reduce((s: number, u: any) => s + (u.tokens_used ?? 0), 0);
    lines.push(`AI tokens used (24h): ${totalTokens.toLocaleString()}`);
  }

  // Defense scans
  const { data: scans } = await supabase
    .from("access_scans")
    .select("score")
    .order("created_at", { ascending: false })
    .limit(1);
  if (scans?.[0]) {
    lines.push(`Latest security scan score: ${scans[0].score}`);
  }

  if (lines.length <= 1) {
    lines.push("System operating normally. No anomalies detected.");
    lines.push("All modules responsive. Defense perimeter clear.");
  }

  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();
  
  try {
    const ELEVEN_LABS_API_KEY = Deno.env.get("ELEVEN_LABS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ELEVEN_LABS_API_KEY) throw new Error("ELEVEN_LABS_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check feature flag
    const { data: flag } = await supabase
      .from("system_flags")
      .select("enabled")
      .eq("key", "substrate_radio_enabled")
      .maybeSingle();
    if (!flag?.enabled) {
      return new Response(JSON.stringify({ ok: false, reason: "Radio disabled via feature flag" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already generated today
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("radio_broadcasts")
      .select("id, status")
      .eq("broadcast_date", today)
      .maybeSingle();
    
    if (existing?.status === "complete") {
      return new Response(JSON.stringify({ ok: true, message: "Broadcast already generated today", id: existing.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Clean up any failed/stale records for today
    if (existing) {
      await supabase.from("radio_broadcasts").delete().eq("id", existing.id);
    }

    // Create broadcast record
    const { data: broadcast, error: insertErr } = await supabase
      .from("radio_broadcasts")
      .insert({ broadcast_date: today, script_json: {}, status: "generating" })
      .select("id")
      .single();
    if (insertErr) throw new Error(`Failed to create broadcast record: ${insertErr.message}`);
    const broadcastId = broadcast.id;

    // Fetch metrics
    const metricsContext = await fetchMetricsContext(supabase);

    // Generate script (with 1 retry on validation failure)
    let script: Record<string, string> | null = null;
    let attempts = 0;
    let usedProvider = "unknown";
    for (let i = 0; i < 2; i++) {
      attempts++;
      try {
        const result = await generateScript(metricsContext);
        const validation = validateScript(result.script);
        if (validation.valid) { script = result.script; usedProvider = result.provider; break; }
        console.warn(`Validation failed (attempt ${i + 1}):`, validation.errors);
      } catch (e) {
        console.error(`Script generation attempt ${i + 1} failed:`, e);
      }
    }

    if (!script) {
      await supabase.from("radio_broadcasts").update({
        status: "failed",
        error_message: "Script validation failed after 2 attempts",
        regeneration_attempts: attempts,
      }).eq("id", broadcastId);
      return new Response(JSON.stringify({ ok: false, error: "Script generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine voice mapping for today
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const voiceMapping: Record<string, string> = {};
    
    // Generate TTS per segment
    const audioBuffers: ArrayBuffer[] = [];
    const ttsStart = Date.now();

    for (let i = 0; i < SEGMENT_KEYS.length; i++) {
      const seg = SEGMENT_KEYS[i];
      const role = SEGMENT_VOICE_MAP[seg];
      const voiceId = pickVoice(role, dayOfYear, i);
      voiceMapping[seg] = voiceId;
      
      console.log(`Generating TTS for ${seg} with voice ${voiceId} (${wordCount(script[seg])} words)`);
      const audio = await generateTTS(script[seg], voiceId, ELEVEN_LABS_API_KEY);
      audioBuffers.push(audio);
    }

    const ttsDuration = Date.now() - ttsStart;

    // Concatenate all segments into single MP3
    const finalAudio = concatAudioBuffers(audioBuffers);

    // Upload to storage
    const storagePath = `latest.mp3`;
    const { error: uploadErr } = await supabase.storage
      .from("radio")
      .upload(storagePath, finalAudio.buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });
    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

    const { data: publicUrl } = supabase.storage
      .from("radio")
      .getPublicUrl(storagePath);

    // Also save dated copy
    const datedPath = `archive/${today}.mp3`;
    await supabase.storage
      .from("radio")
      .upload(datedPath, finalAudio.buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    // Update broadcast record
    const totalDuration = Date.now() - startTime;
    // Rough cost estimate: ~$0.01 per 1000 chars ElevenLabs, ~$0.001 per LLM call
    const totalChars = Object.values(script).join("").length;
    const costEstimate = (totalChars / 1000) * 0.01 + 0.002;

    await supabase.from("radio_broadcasts").update({
      script_json: script,
      audio_url: publicUrl.publicUrl,
      status: "complete",
      tts_duration_ms: ttsDuration,
      regeneration_attempts: attempts,
      generation_cost_estimate: costEstimate,
      voice_mapping: voiceMapping,
    }).eq("id", broadcastId);

    console.log(`Broadcast generated via Nexus/${usedProvider} in ${totalDuration}ms, TTS: ${ttsDuration}ms, cost: ~$${costEstimate.toFixed(4)}`);

    return new Response(JSON.stringify({
      ok: true,
      broadcast_id: broadcastId,
      audio_url: publicUrl.publicUrl,
      duration_ms: totalDuration,
      tts_duration_ms: ttsDuration,
      cost_estimate: costEstimate,
      segments: SEGMENT_KEYS.length,
      nexus_provider: usedProvider,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Radio broadcast error:", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
