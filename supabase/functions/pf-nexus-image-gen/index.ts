/**
 * pf-nexus-image-gen — Free image generation via Google AI Studio
 * Uses Gemini 2.0 Flash native image generation (~25 images/day free)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Track daily usage (resets on function cold start, but good for rate limiting)
let imageGenerationToday = 0;
let imageGenerationDayStart = Date.now();
const IMAGE_DAILY_LIMIT = 25;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { prompt, style, aspectRatio, negativePrompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
    
    if (!apiKey) {
      console.error('❌ GOOGLE_AI_STUDIO_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google AI Studio API key not configured',
          remainingToday: IMAGE_DAILY_LIMIT 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset daily counter if new day
    const now = Date.now();
    if (now - imageGenerationDayStart >= 86400000) {
      imageGenerationToday = 0;
      imageGenerationDayStart = now;
    }

    // Check daily limit
    if (imageGenerationToday >= IMAGE_DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Daily image limit reached (${IMAGE_DAILY_LIMIT}/day). Resets at midnight UTC.`,
          remainingToday: 0 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build enhanced prompt
    let enhancedPrompt = prompt;
    if (style) {
      enhancedPrompt = `${prompt}, in ${style} style`;
    }
    if (aspectRatio) {
      enhancedPrompt += `. Aspect ratio: ${aspectRatio}`;
    }
    if (negativePrompt) {
      enhancedPrompt += `. Avoid: ${negativePrompt}`;
    }

    console.log(`🎨 Generating image: "${enhancedPrompt.substring(0, 100)}..."`);

    // Use Gemini 2.0 Flash with native image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate an image: ${enhancedPrompt}`
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            responseMimeType: 'text/plain'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error ${response.status}:`, errorText.substring(0, 500));
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Gemini API error: ${response.status}`,
          details: errorText.substring(0, 200),
          remainingToday: IMAGE_DAILY_LIMIT - imageGenerationToday
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts || [];
    let imageData: string | undefined;
    let mimeType = 'image/png';
    let textResponse = '';

    for (const part of parts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
      }
      if (part.text) {
        textResponse = part.text;
      }
    }

    if (!imageData) {
      console.error('❌ No image data in Gemini response');
      console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500));
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No image returned from Gemini API',
          textResponse: textResponse || 'No response text',
          remainingToday: IMAGE_DAILY_LIMIT - imageGenerationToday
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment usage counter
    imageGenerationToday++;
    const latency = Date.now() - startTime;

    console.log(`✅ Image generated in ${latency}ms (${imageGenerationToday}/${IMAGE_DAILY_LIMIT} today)`);

    // Log to Supabase for tracking
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('nexus_logs').insert({
        provider: 'googleai-image',
        latency_ms: latency,
        token_count: prompt.length,
        cost_usd_est: 0,
        status: 'success',
        route_key: 'image-generation'
      });
    } catch (logError) {
      console.warn('Failed to log image generation:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageData,
        mimeType,
        prompt: enhancedPrompt,
        provider: 'googleai',
        model: 'gemini-2.0-flash-exp-image-generation',
        latencyMs: latency,
        remainingToday: IMAGE_DAILY_LIMIT - imageGenerationToday,
        textResponse: textResponse || undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Image generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        remainingToday: IMAGE_DAILY_LIMIT - imageGenerationToday
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
