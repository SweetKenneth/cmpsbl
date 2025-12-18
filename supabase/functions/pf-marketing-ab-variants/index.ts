/**
 * PromptFluid Marketing A/B Variants Generator
 * AI-powered A/B testing variants with psychological triggers
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VARIATION_APPROACHES = {
  fomo: {
    name: "FOMO",
    description: "Fear of Missing Out - Limited Time Urgency",
    triggers: ["scarcity", "limited time", "don't miss out", "act now"],
    bestFor: "impulse buyers, time-sensitive offers"
  },
  socialProof: {
    name: "Social Proof",
    description: "Authority & Trust - Join Thousands",
    triggers: ["testimonials", "proven results", "trusted by", "join community"],
    bestFor: "risk-averse buyers, relationship builders"
  },
  educational: {
    name: "Educational",
    description: "How-To Value - Learn & Master",
    triggers: ["teach", "learn", "master", "discover how"],
    bestFor: "information seekers, DIY enthusiasts"
  },
  aspirational: {
    name: "Aspirational",
    description: "Dream Outcome - Transform Your Life",
    triggers: ["imagine", "achieve", "transform", "become"],
    bestFor: "lifestyle buyers, dream chasers"
  },
  practical: {
    name: "Practical ROI",
    description: "Value & Efficiency - Save Time & Money",
    triggers: ["save", "efficient", "ROI", "practical"],
    bestFor: "logical buyers, professionals"
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategy, content, variationCount = 2 } = await req.json();
    
    console.log('Generating variants:', variationCount);

    const variationPrompt = `Create ${variationCount} alternative ad approaches with different psychological triggers.

ORIGINAL STRATEGY:
${JSON.stringify(strategy, null, 2)}

ORIGINAL CONTENT:
${JSON.stringify(content, null, 2)}

APPROACHES:
${JSON.stringify(VARIATION_APPROACHES, null, 2)}

Create ${variationCount} DISTINCT variations, each using a DIFFERENT approach. Each variant should:

1. Choose a DIFFERENT psychological trigger
2. Rewrite messaging to match that trigger
3. Adjust visuals, colors, and CTAs accordingly
4. Maintain brand consistency
5. Target same audience with different angle

Return JSON:
{
  "variants": [
    {
      "id": "variant_A",
      "approach": "fomo",
      "messaging": {
        "headline": "string",
        "subheadline": "string",
        "bodyCopy": "string",
        "ctaText": "string"
      },
      "psychologyTriggers": ["string"],
      "visualRecommendations": {
        "style": "string",
        "colors": ["string"],
        "imagery": "string"
      },
      "reasoning": "string (why this approach works)",
      "expectedImpact": "string"
    }
  ],
  "testingRecommendations": {
    "trafficSplit": "string",
    "duration": "string",
    "successMetrics": ["string"],
    "winnerCriteria": "string"
  }
}`;

    const result = await callFreeTierAI(variationPrompt, {
      systemPrompt: 'You are an A/B testing expert. Create psychologically-driven variants that test different motivations. Return ONLY valid JSON.',
      temperature: 0.8,
      maxTokens: 2000
    });

    const variants = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, provider: result.provider, ...variants }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Variant generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
