/**
 * PromptFluid Marketing Campaign Info Generator
 * AI-powered campaign details and copy generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headline, offer, brand, promoType, cta, description, audience } = await req.json();

    console.log('Campaign info generation:', { headline, brand, promoType });

    // Generate captions
    const captionsPrompt = `Create 3 ad captions (short, medium, long) for this campaign:
            
Headline: ${headline}
Offer: ${offer}
Promotion Type: ${promoType}
CTA: ${cta}
Description: ${description}

Return ONLY valid JSON:
{
  "short": "30-50 word caption with emoji",
  "medium": "75-100 word caption with emoji",
  "long": "150-200 word caption with emoji and bullet points"
}`;

    const captionsResult = await callFreeTierAI(captionsPrompt, {
      systemPrompt: `You are an expert marketing copywriter. Generate platform-optimized ad copy that drives conversions.

BRAND: ${brand || 'Unknown'}
TARGET AUDIENCE: ${audience || 'General consumers'}

Create compelling, benefit-driven copy that captures attention and motivates action.`,
      temperature: 0.8,
      maxTokens: 1000
    });

    let captions = captionsResult.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const captionsObj = JSON.parse(captions);

    // Generate hashtags
    const hashtagsPrompt = `Generate 15-20 relevant hashtags for: ${headline} - ${description}

Return ONLY valid JSON:
{
  "hashtags": ["#Hashtag1", "#Hashtag2", ...]
}`;

    const hashtagsResult = await callFreeTierAI(hashtagsPrompt, {
      systemPrompt: "You are a social media marketing expert. Generate relevant, trending hashtags.",
      temperature: 0.7,
      maxTokens: 500
    });

    let hashtags = hashtagsResult.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const hashtagsObj = JSON.parse(hashtags);

    return new Response(
      JSON.stringify({
        success: true,
        captions: captionsObj,
        hashtags: hashtagsObj.hashtags,
        provider: captionsResult.provider,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Campaign info generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
