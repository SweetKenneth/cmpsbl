/**
 * radio-tts — FreeTTS.org proxy for Clockless Radio
 * Converts DJ text to natural-sounding MP3 via Microsoft Neural voices.
 * Zero cost, no API key needed on the upstream side.
 * We proxy to avoid CORS and to keep the endpoint abstracted.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const FREETTS_API = 'https://freetts.org/api/tts';

const BodySchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().default('en-US-GuyNeural'),
  rate: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(-50).max(50).default(0),
});

// Voice presets for different DJ segment types
const VOICE_PRESETS: Record<string, { voice: string; rate: number; pitch: number }> = {
  station_id: { voice: 'en-US-GuyNeural', rate: 1.05, pitch: 2 },
  system_shoutout: { voice: 'en-US-GuyNeural', rate: 1.0, pitch: 0 },
  dev_shoutout: { voice: 'en-US-GuyNeural', rate: 1.0, pitch: 1 },
  fake_sponsor: { voice: 'en-US-GuyNeural', rate: 0.95, pitch: -2 },
  philosophical: { voice: 'en-US-GuyNeural', rate: 0.88, pitch: -3 },
  call_in_host: { voice: 'en-US-GuyNeural', rate: 1.1, pitch: 2 },
  call_in_caller: { voice: 'en-US-JennyNeural', rate: 1.15, pitch: 3 },
  rex_rant: { voice: 'en-US-GuyNeural', rate: 1.12, pitch: 1 },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, voice, rate, pitch } = parsed.data;

    // Allow segment type override for presets
    const preset = body.segmentType ? VOICE_PRESETS[body.segmentType] : null;
    const finalVoice = preset?.voice ?? voice;
    const finalRate = preset?.rate ?? rate;
    const finalPitch = preset?.pitch ?? pitch;

    // Call FreeTTS — no API key required
    const ttsResponse = await fetch(FREETTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: finalVoice,
        rate: finalRate,
        pitch: finalPitch,
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error(`FreeTTS API error [${ttsResponse.status}]:`, errorText);
      return new Response(
        JSON.stringify({ error: `TTS generation failed [${ttsResponse.status}]` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseData = await ttsResponse.json();

    // FreeTTS returns { audio_url, ... } — fetch the actual audio
    if (responseData.audio_url) {
      const audioResponse = await fetch(responseData.audio_url);
      if (!audioResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to download generated audio' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const audioBuffer = await audioResponse.arrayBuffer();

      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Fallback: if response contains raw audio data
    if (ttsResponse.headers.get('content-type')?.includes('audio')) {
      const audioBuffer = await ttsResponse.arrayBuffer();
      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Return whatever we got for debugging
    return new Response(
      JSON.stringify({ error: 'Unexpected TTS response format', data: responseData }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('radio-tts error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
