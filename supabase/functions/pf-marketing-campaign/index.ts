import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

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
    const captionsPrompt = `Create 3 ad captions (short, medium, long) for this campaign:
            
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
}`;

    const captionsResult = await callFreeTierAI(captionsPrompt, {
      systemPrompt: `You are a marketing copywriter creating compelling ad copy.
${brandContext}

Generate engaging, conversion-focused copy that matches the brand voice.`,
      temperature: 0.8,
      maxTokens: 1000
    });

    const captions = JSON.parse(captionsResult.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    // Generate hashtags
    const hashtagsPrompt = `Generate 15 relevant hashtags for this campaign: ${headline}. Industry: ${brandProfile?.industry || 'general'}. Mix popular and niche tags. Return as JSON array: {"hashtags": ["tag1", "tag2", ...]}`;

    const hashtagsResult = await callFreeTierAI(hashtagsPrompt, {
      temperature: 0.7,
      maxTokens: 500
    });

    const hashtags = JSON.parse(hashtagsResult.content.replace(/```json\n?/g, '').replace(/```\n?/g, '')).hashtags;

    return new Response(
      JSON.stringify({
        captions,
        hashtags,
        success: true,
        provider: captionsResult.provider
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
