import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AltTextSchema = z.object({
  imageUrl: z.string().url().max(2048),
  scanId: z.string().uuid().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = AltTextSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error?.errors || [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl, scanId } = validation.data;
    
    const validatedUrl = new URL(imageUrl);
    if (!['http:', 'https:'].includes(validatedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols allowed');
    }

    console.log(`Generating alt text for: ${validatedUrl.href}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert. Generate concise, descriptive alt text for images (under 125 characters) that helps visually impaired users understand the image content.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Generate descriptive alt text for this image:' },
              { type: 'image_url', image_url: { url: validatedUrl.href } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits.');
      }
      throw new Error(`Failed to generate alt text: ${response.statusText}`);
    }

    const data = await response.json();
    const altText = data.choices?.[0]?.message?.content;

    if (!altText) {
      throw new Error('No alt text generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        altText: altText.trim(),
        imageUrl: validatedUrl.href
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Alt text generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate alt text' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
