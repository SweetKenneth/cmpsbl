import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ResearchSchema = z.object({
  researchType: z.enum(['demand', 'audience', 'pricing', 'trends', 'competitor']),
  topic: z.string().min(1).max(500),
  brandProfile: z.object({
    name: z.string().max(200),
    industry: z.string().max(100).optional(),
    products: z.string().max(1000).optional(),
    targetAudience: z.string().max(500).optional()
  }).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = ResearchSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { researchType, topic, brandProfile } = validation.data;
    
    console.log('Market research request:', { researchType, topic });

    const brandContext = brandProfile ? `
COMPANY: ${brandProfile.name}
INDUSTRY: ${brandProfile.industry}
PRODUCTS: ${brandProfile.products}
TARGET AUDIENCE: ${brandProfile.targetAudience}
` : 'General market research';

    const researchPrompts: Record<string, string> = {
      demand: `**PRODUCT DEMAND ANALYSIS**
Analyze market demand for: ${topic}
${brandContext}

Provide:
1. Search Volume & Trends (growth indicators)
2. Market Size (TAM, target segments)
3. Customer Demand Signals (pain points, questions)
4. Buying Intent (purchase triggers, urgency)
5. Competitive Landscape
6. Market Opportunities`,

      audience: `**AUDIENCE INSIGHTS**
Analyze target audience for: ${topic}
${brandContext}

Provide:
1. Demographics (age, income, location, gender)
2. Psychographics (values, lifestyle, interests)
3. Pain Points & Frustrations
4. Goals & Desires
5. Online Behavior (platforms, content preferences)
6. Buying Patterns`,

      pricing: `**PRICING STRATEGY**
Analyze pricing for: ${topic}
${brandContext}

Provide:
1. Competitive Pricing (market ranges)
2. Price Sensitivity Analysis
3. Value Perception
4. Pricing Models (subscription, one-time, tiered)
5. Optimal Price Points
6. Bundle Opportunities`,

      competition: `**COMPETITIVE ANALYSIS**
Analyze competition for: ${topic}
${brandContext}

Provide:
1. Main Competitors (direct & indirect)
2. Competitive Advantages
3. Market Positioning
4. Pricing Comparison
5. Marketing Strategies
6. Market Gaps & Opportunities`,

      trends: `**MARKET TRENDS**
Analyze trends for: ${topic}
${brandContext}

Provide:
1. Current Market Trends
2. Emerging Technologies
3. Consumer Behavior Shifts
4. Industry Forecasts
5. Seasonal Patterns
6. Future Opportunities`
    };

    const prompt = researchPrompts[researchType] || researchPrompts.demand;

    const result = await callFreeTierAI(prompt, {
      systemPrompt: 'You are a market research analyst providing professional, data-driven insights. Format responses in clear markdown with actionable recommendations.',
      temperature: 0.7,
      maxTokens: 2500
    });

    return new Response(
      JSON.stringify({ 
        insights: result.content,
        researchType,
        topic,
        provider: result.provider,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Market research error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Research failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
