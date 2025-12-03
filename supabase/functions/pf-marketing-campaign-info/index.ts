/**
 * PromptFluid Marketing Campaign Info Generator
 * AI-powered campaign details and copy generation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log('Campaign info generation:', { headline, brand, promoType });

    // Generate captions
    const captionsResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert marketing copywriter. Generate platform-optimized ad copy that drives conversions.

BRAND: ${brand || 'Unknown'}
TARGET AUDIENCE: ${audience || 'General consumers'}

Create compelling, benefit-driven copy that captures attention and motivates action.`
          },
          {
            role: "user",
            content: `Create 3 ad captions (short, medium, long) for this campaign:
            
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
}`
          }
        ],
        temperature: 0.8
      }),
    });

    if (!captionsResponse.ok) {
      throw new Error(`Caption generation failed: ${captionsResponse.status}`);
    }

    const captionsData = await captionsResponse.json();
    let captions = captionsData.choices[0].message.content;
    captions = captions.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const captionsObj = JSON.parse(captions);

    // Generate hashtags
    const hashtagsResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a social media marketing expert. Generate relevant, trending hashtags."
          },
          {
            role: "user",
            content: `Generate 15-20 relevant hashtags for: ${headline} - ${description}

Return ONLY valid JSON:
{
  "hashtags": ["#Hashtag1", "#Hashtag2", ...]
}`
          }
        ],
        temperature: 0.7
      }),
    });

    if (!hashtagsResponse.ok) {
      throw new Error(`Hashtag generation failed: ${hashtagsResponse.status}`);
    }

    const hashtagsData = await hashtagsResponse.json();
    let hashtags = hashtagsData.choices[0].message.content;
    hashtags = hashtags.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const hashtagsObj = JSON.parse(hashtags);

    return new Response(
      JSON.stringify({
        success: true,
        captions: captionsObj,
        hashtags: hashtagsObj.hashtags,
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
