/**
 * radio-dj-tts — Generates spoken DJ audio for Composable Radio
 * Rex Binary (Howard Stern-style DJ) gets a bold, commanding voice
 * Callers get diverse, contrasting voices for differentiation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rex Binary's voice — bold, commanding, slightly unhinged radio host energy
const REX_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },    // Deep, authoritative — main Rex voice
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },      // Smooth backup
];

// Caller voices — distinctly different from Rex (varied genders, tones, energies)
const CALLER_VOICES = [
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris" },      // Energetic, youthful
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel" },     // Warm, conversational
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },      // Female, clear
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },      // Female, warm
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica" },    // Female, casual
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily" },       // Female, bright
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum" },     // Male, different register
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric" },       // Male, distinct
];

// Voice settings per content type — Rex is energetic, callers are varied
const VOICE_PROFILES: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  station_id:      { stability: 0.35, similarity_boost: 0.85, style: 0.8, speed: 1.05 },  // Rex hype mode
  system_shoutout: { stability: 0.3,  similarity_boost: 0.8,  style: 0.7, speed: 1.0 },   // Rex excited
  dev_shoutout:    { stability: 0.25, similarity_boost: 0.75, style: 0.8, speed: 1.05 },  // Rex encouraging/wild
  fake_sponsor:    { stability: 0.4,  similarity_boost: 0.85, style: 0.9, speed: 1.0 },   // Rex doing ad reads like a madman
  philosophical:   { stability: 0.5,  similarity_boost: 0.8,  style: 0.4, speed: 0.9 },   // Rex being deep (rare)
  rex_rant:        { stability: 0.2,  similarity_boost: 0.7,  style: 0.9, speed: 1.1 },   // Rex fully unhinged
  call_in_rex:     { stability: 0.35, similarity_boost: 0.8,  style: 0.7, speed: 1.0 },   // Rex as host for call-ins
  call_in_caller:  { stability: 0.4,  similarity_boost: 0.6,  style: 0.5, speed: 1.0 },   // Caller — varied, natural
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, contentType, caller, callerVoice } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVEN_LABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVEN_LABS_API_KEY not configured");
    }

    // Rex always uses his signature voice
    const rexVoice = REX_VOICES[0]; // George — the Rex Binary voice
    let profile = { ...(VOICE_PROFILES[contentType] || VOICE_PROFILES.station_id) };
    let voiceId = rexVoice.id;
    let spokenText = text;

    if (contentType === "call_in" && caller) {
      // For call-ins, Rex does the intro, then the caller speaks
      // We pick a random caller voice that's distinctly different from Rex
      const callerVoiceObj = CALLER_VOICES[Math.floor(Math.random() * CALLER_VOICES.length)];
      voiceId = callerVoiceObj.id;
      profile = { ...VOICE_PROFILES.call_in_caller };

      // Build the full segment: Rex intro + caller message
      spokenText = `We've got a call coming in! ${caller} is on the line... ${text}`;
    } else if (contentType === "rex_rant") {
      // Rex rants get maximum energy — slightly faster, more expressive
      profile = { ...VOICE_PROFILES.rex_rant };
    }

    console.log(`[radio-dj-tts] Rex Binary segment: ${contentType} | voice: ${voiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: spokenText,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: profile.stability,
            similarity_boost: profile.similarity_boost,
            style: profile.style,
            use_speaker_boost: true,
            speed: profile.speed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[radio-dj-tts] ElevenLabs error: ${response.status} ${errorText}`);
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`[radio-dj-tts] Generated ${audioBuffer.byteLength} bytes for Rex Binary`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[radio-dj-tts] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
