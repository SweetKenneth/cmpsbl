import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

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

    const result = await callFreeTierAI(
      `Generate descriptive alt text for this image URL: ${validatedUrl.href}. The alt text should be under 125 characters and help visually impaired users understand the image content.`,
      {
        systemPrompt: 'You are an accessibility expert. Generate concise, descriptive alt text for images (under 125 characters) that helps visually impaired users understand the image content. Return ONLY the alt text, no quotes or explanation.',
        temperature: 0.5
      }
    );

    const altText = result.content.trim().replace(/^["']|["']$/g, '');

    if (!altText) {
      throw new Error('No alt text generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        altText,
        imageUrl: validatedUrl.href,
        provider: result.provider
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
