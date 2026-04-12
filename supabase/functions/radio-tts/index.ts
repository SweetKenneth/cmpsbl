/**
 * radio-tts — FreeTTS.org proxy for Clockless Radio
 * Converts DJ text to natural-sounding MP3 via Microsoft Neural voices.
 * Zero cost, no API key needed on the upstream side.
 * We proxy to avoid CORS and to keep the endpoint abstracted.
 *
 * FreeTTS flow: POST /tts → { file_id } → GET /download/{file_id} → MP3
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FREETTS_BASE = 'https://freetts.org/api';

const BodySchema = z.object({
  text: z.string().min(1).max(5000),
  segmentType: z.string().optional(),
});

// Voice presets for different DJ segment types
// rate: percentage offset string, pitch: Hz offset string
const VOICE_PRESETS: Record<string, { voice: string; rate: string; pitch: string }> = {
  station_id:      { voice: 'en-US-GuyNeural',    rate: '+5%',   pitch: '+2Hz' },
  system_shoutout: { voice: 'en-US-GuyNeural',    rate: '+0%',   pitch: '+0Hz' },
  dev_shoutout:    { voice: 'en-US-GuyNeural',    rate: '+0%',   pitch: '+1Hz' },
  fake_sponsor:    { voice: 'en-US-GuyNeural',    rate: '-5%',   pitch: '-2Hz' },
  philosophical:   { voice: 'en-US-GuyNeural',    rate: '-12%',  pitch: '-3Hz' },
  call_in_host:    { voice: 'en-US-GuyNeural',    rate: '+10%',  pitch: '+2Hz' },
  call_in_caller:  { voice: 'en-US-JennyNeural',  rate: '+15%',  pitch: '+3Hz' },
  rex_rant:        { voice: 'en-US-GuyNeural',    rate: '+12%',  pitch: '+1Hz' },
};

const DEFAULT_PRESET = { voice: 'en-US-GuyNeural', rate: '+0%', pitch: '+0Hz' };

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

    const { text, segmentType } = parsed.data;
    const preset = (segmentType ? VOICE_PRESETS[segmentType] : null) ?? DEFAULT_PRESET;

    // Step 1: Generate — returns { file_id }
    const genResponse = await fetch(`${FREETTS_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: preset.voice,
        rate: preset.rate,
        pitch: preset.pitch,
      }),
    });

    if (!genResponse.ok) {
      const errorText = await genResponse.text();
      console.error(`FreeTTS generate error [${genResponse.status}]:`, errorText);
      return new Response(
        JSON.stringify({ error: `TTS generation failed [${genResponse.status}]` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const genData = await genResponse.json();
    const fileId = genData.file_id;

    if (!fileId) {
      console.error('FreeTTS returned no file_id:', genData);
      return new Response(
        JSON.stringify({ error: 'No file_id in TTS response' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Download the MP3
    const dlResponse = await fetch(`${FREETTS_BASE}/audio/${fileId}`);
    if (!dlResponse.ok) {
      const dlError = await dlResponse.text();
      console.error(`FreeTTS download error [${dlResponse.status}]:`, dlError);
      return new Response(
        JSON.stringify({ error: `Audio download failed [${dlResponse.status}]` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await dlResponse.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: unknown) {
    console.error('radio-tts error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
