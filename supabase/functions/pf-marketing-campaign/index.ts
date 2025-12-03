import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CampaignSchema = z.object({
  headline: z.string().min(1).max(200),
  offer: z.string().max(500).optional(),
  promoType: z.string().min(1).max(100),
  cta: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  brandProfile: z.object({
    name: z.string().max(200),
    industry: z.string().max(100).optional(),
    brandVoice: z.string().max(200).optional(),
    targetAudience: z.string().max(500).optional(),
    uniqueValue: z.string().max(500).optional()
  }).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = CampaignSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { headline, offer, promoType, cta, description, brandProfile } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Generating campaign content for:', { headline, brand: brandProfile?.name });

    const brandContext = brandProfile ? `
BRAND CONTEXT:
- Company: ${brandProfile.name}
- Industry: ${brandProfile.industry}
- Voice: ${brandProfile.brandVoice}
- Audience: ${brandProfile.targetAudience}
- Value Proposition: ${brandProfile.uniqueValue}
` : '';

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
            content: `You are a marketing copywriter creating compelling ad copy.
${brandContext}

Generate engaging, conversion-focused copy that matches the brand voice.`
          },
          {
            role: "user",
            content: `Create 3 ad captions (short, medium, long) for this campaign:
            
Headline: ${headline}
Offer: ${offer || 'None'}
Promotion Type: ${promoType}
CTA: ${cta}
Description: ${description}

Return ONLY a JSON object:
{
  "short": "30-50 word caption with emoji",
  "medium": "75-100 word caption with emoji",
  "long": "150-200 word caption with emoji and structure"
}`
          }
        ],
      }),
    });

    if (!captionsResponse.ok) {
      throw new Error(`Caption generation failed: ${captionsResponse.status}`);
    }

    const captionsData = await captionsResponse.json();
    const captionsText = captionsData.choices[0].message.content;
    const captions = JSON.parse(captionsText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

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
            role: "user",
            content: `Generate 15 relevant hashtags for this campaign: ${headline}. Industry: ${brandProfile?.industry || 'general'}. Mix popular and niche tags. Return as JSON array: {"hashtags": ["tag1", "tag2", ...]}`
          }
        ],
      }),
    });

    const hashtagsData = await hashtagsResponse.json();
    const hashtagsText = hashtagsData.choices[0].message.content;
    const hashtags = JSON.parse(hashtagsText.replace(/```json\n?/g, '').replace(/```\n?/g, '')).hashtags;

    return new Response(
      JSON.stringify({
        captions,
        hashtags,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Campaign generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Generation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
