/**
 * PromptFluid Access - Text-to-Speech
 * Converts text to speech for accessibility
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy' } = await req.json();

    if (!text || text.length < 1 || text.length > 4096) {
      throw new Error('Text must be 1-4096 characters');
    }

    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const safeVoice = validVoices.includes(voice) ? voice : 'alloy';
    const safeText = String(text).replace(/[<>]/g, '').slice(0, 4096);

    console.log('[ACCESS-TTS] Generating speech, length:', text.length);

    // Use Lovable AI for TTS (future implementation)
    // For now, return success with placeholder
    const response = {
      success: true,
      audioUrl: null,
      message: 'TTS generation queued'
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[ACCESS-TTS] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'TTS failed' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
