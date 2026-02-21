/**
 * radio-dj-tts — Generates spoken DJ audio for Clockless Radio
 * Takes DJ content text and returns MP3 audio via ElevenLabs TTS
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rotating DJ voices for variety
const DJ_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },    // Deep, authoritative
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel" },     // Warm, conversational
  { id: "iP95p4xoKVk53GoZ742B", name: "Chris" },      // Energetic
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },      // Smooth
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian" },      // Classic radio
];

// Different voice settings per content type for more personality
const VOICE_PROFILES: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  station_id: { stability: 0.7, similarity_boost: 0.8, style: 0.6, speed: 1.0 },
  system_shoutout: { stability: 0.5, similarity_boost: 0.75, style: 0.4, speed: 0.95 },
  dev_shoutout: { stability: 0.4, similarity_boost: 0.7, style: 0.5, speed: 1.0 },
  fake_sponsor: { stability: 0.6, similarity_boost: 0.8, style: 0.7, speed: 1.05 },
  philosophical: { stability: 0.3, similarity_boost: 0.7, style: 0.3, speed: 0.9 },
  call_in: { stability: 0.35, similarity_boost: 0.65, style: 0.5, speed: 1.0 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, contentType, caller } = await req.json();

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

    // Pick a random DJ voice
    const voice = DJ_VOICES[Math.floor(Math.random() * DJ_VOICES.length)];
    const profile = VOICE_PROFILES[contentType] || VOICE_PROFILES.station_id;

    // For call-ins, use a different voice than the main DJ
    let voiceId = voice.id;
    if (contentType === "call_in") {
      // Use a contrasting voice for callers
      const callerVoices = DJ_VOICES.filter((v) => v.id !== voice.id);
      voiceId = callerVoices[Math.floor(Math.random() * callerVoices.length)].id;
    }

    // Build the spoken text with radio-style framing
    let spokenText = text;
    if (contentType === "call_in" && caller) {
      spokenText = `We've got a call from ${caller}... "${text}"`;
    } else if (contentType === "fake_sponsor") {
      spokenText = `... ${text}`;
    }

    console.log(`[radio-dj-tts] Generating: ${contentType} with voice ${voice.name} (${voiceId})`);

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
