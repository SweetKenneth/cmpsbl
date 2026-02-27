/**
 * radio-dj-tts — Generates spoken DJ audio for Composable Radio
 * Takes DJ content text and returns MP3 audio via ElevenLabs TTS
 * Uses distinct voices for DJ vs callers for differentiation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Main DJ voices — deep, authoritative radio hosts
const DJ_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },    // Deep, authoritative
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian" },      // Classic radio
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },      // Smooth
];

// Caller voices — distinctly different from DJ (younger, varied, contrasting)
const CALLER_VOICES = [
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris" },      // Energetic, youthful
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel" },     // Warm, conversational
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },      // Female voice for variety
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },      // Female, different tone
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica" },    // Female, casual
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily" },       // Female, bright
];

// Voice settings per content type for distinct personality
const VOICE_PROFILES: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  station_id: { stability: 0.7, similarity_boost: 0.85, style: 0.6, speed: 1.0 },
  system_shoutout: { stability: 0.5, similarity_boost: 0.75, style: 0.4, speed: 0.95 },
  dev_shoutout: { stability: 0.45, similarity_boost: 0.7, style: 0.5, speed: 1.0 },
  fake_sponsor: { stability: 0.65, similarity_boost: 0.8, style: 0.7, speed: 1.05 },
  philosophical: { stability: 0.3, similarity_boost: 0.7, style: 0.3, speed: 0.88 },
  call_in_dj: { stability: 0.5, similarity_boost: 0.8, style: 0.5, speed: 1.0 },
  call_in_caller: { stability: 0.35, similarity_boost: 0.6, style: 0.6, speed: 1.05 },
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

    // Pick the main DJ voice for this segment
    const djVoice = DJ_VOICES[Math.floor(Math.random() * DJ_VOICES.length)];
    const profile = VOICE_PROFILES[contentType] || VOICE_PROFILES.station_id;

    let voiceId = djVoice.id;
    let spokenText = text;

    if (contentType === "call_in" && caller) {
      // For call-ins, use a distinctly different caller voice
      const callerVoiceObj = CALLER_VOICES[Math.floor(Math.random() * CALLER_VOICES.length)];
      voiceId = callerVoiceObj.id;
      // DJ intro + caller message as one TTS pass with the caller's voice
      spokenText = `And we've got a call coming in from ${caller}... ${text}`;
      // Use the caller voice profile
      const callerProfile = VOICE_PROFILES.call_in_caller;
      Object.assign(profile, callerProfile);
    } else if (contentType === "fake_sponsor") {
      // Sponsors get a polished ad-read delivery
      spokenText = text;
    }

    console.log(`[radio-dj-tts] Generating: ${contentType} with voice ${voiceId}`);

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
    console.log(`[radio-dj-tts] Generated ${audioBuffer.byteLength} bytes of audio`);

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
