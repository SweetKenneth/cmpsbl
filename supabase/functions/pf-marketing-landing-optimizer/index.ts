/**
 * PromptFluid Marketing Landing Page Optimizer
 * AI-powered A/B testing and conversion optimization
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
    const { campaignType, targetAudience, currentHeadline, optimizationGoal, brandProfile } = await req.json();
    
    console.log('Landing page optimizer:', { campaignType, optimizationGoal });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const brandContext = brandProfile ? `
BRAND: ${brandProfile.name}
Industry: ${brandProfile.industry}
Voice: ${brandProfile.tone || 'professional'}
` : '';

    const userPrompt = `Create landing page optimization variants:

${brandContext}

Campaign Type: ${campaignType}
Target Audience: ${targetAudience}
${currentHeadline ? `Current Headline: ${currentHeadline}` : ''}
Optimization Goal: ${optimizationGoal}

Generate 3 landing page variants (A, B, C) with different psychological approaches:
- Variant A: Fear/problem-focused (highlight pain points)
- Variant B: Aspiration-focused (highlight benefits/outcomes)
- Variant C: Social proof-focused (highlight testimonials/trust)

Return JSON:
{
  "variants": [
    {
      "name": "string",
      "approach": "string",
      "headline": "string (compelling, 6-10 words)",
      "subheadline": "string (benefit-focused, 10-15 words)",
      "bodyCopy": "string (3-4 paragraphs)",
      "ctaText": "string (action-oriented, 2-4 words)",
      "ctaColor": "string (hex color)",
      "bulletPoints": ["string (3-5 benefits)"],
      "heroImageSuggestion": "string",
      "psychologyTactics": ["string"],
      "expectedConversionLift": "string"
    }
  ],
  "testingStrategy": {
    "primaryMetric": "string",
    "secondaryMetrics": ["string"],
    "recommendedTrafficSplit": "string",
    "minimumSampleSize": number,
    "confidenceLevel": "string"
  },
  "optimizationTips": ["string (5-7 actionable tips)"]
}`;

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
            content: 'You are a conversion rate optimization expert. Create high-converting landing page variants using psychology and copywriting best practices. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Optimization failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const optimization = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...optimization }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Landing page optimization error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Optimization failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
