/**
 * PromptFluid Marketing Campaign Predictions
 * AI-powered performance forecasting and optimization recommendations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PredictionsSchema = z.object({
  campaignDetails: z.any(),
  budget: z.number().min(0).max(1000000),
  duration: z.number().min(1).max(365),
  historicalData: z.any().optional(),
  brandProfile: z.object({
    name: z.string().max(200),
    industry: z.string().max(100).optional(),
    averageCTR: z.string().max(50).optional()
  }).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = PredictionsSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignDetails, budget, duration, historicalData, brandProfile } = validation.data;
    
    console.log('🔮 Generating campaign predictions:', { budget, duration });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const brandContext = brandProfile ? `
BRAND: ${brandProfile.name}
Industry: ${brandProfile.industry}
Previous Performance: ${brandProfile.averageCTR || 'N/A'}
` : '';

    const predictionPrompt = `You are an expert marketing performance analyst. Predict campaign outcomes based on data.

${brandContext}

CAMPAIGN DETAILS:
${JSON.stringify(campaignDetails, null, 2)}

BUDGET: $${budget}
DURATION: ${duration} days
HISTORICAL PERFORMANCE: ${JSON.stringify(historicalData, null, 2)}

Provide detailed predictions for:

1. **PERFORMANCE FORECAST**:
   - Expected impressions (min-max range)
   - Expected clicks (min-max range)
   - Expected conversions (min-max range)
   - Predicted CTR (percentage)
   - Predicted conversion rate (percentage)
   - Predicted ROAS (return on ad spend)

2. **BUDGET ALLOCATION**:
   - Recommended spend per platform
   - Reasoning for allocation
   - Expected return per platform
   - Risk assessment per platform

3. **OPTIMAL TIMING**:
   - Best days to post
   - Best times of day
   - Platform-specific timing
   - Frequency recommendations

4. **A/B TEST RECOMMENDATIONS**:
   - 3 high-impact test ideas
   - Variables to test
   - Success metrics
   - Expected learnings

5. **RISK ASSESSMENT**:
   - Potential challenges
   - Mitigation strategies
   - Confidence level (0-100)
   - Sensitivity analysis

6. **OPTIMIZATION OPPORTUNITIES**:
   - Quick wins (immediate impact)
   - Long-term improvements
   - Priority ranking
   - Expected ROI uplift

Return structured JSON:
{
  "forecast": {
    "impressions": {"min": number, "max": number, "expected": number},
    "clicks": {"min": number, "max": number, "expected": number},
    "conversions": {"min": number, "max": number, "expected": number},
    "ctr": number,
    "conversionRate": number,
    "roas": number,
    "confidence": number
  },
  "budgetAllocation": [
    {
      "platform": "string",
      "amount": number,
      "percentage": number,
      "expectedReturn": number,
      "reasoning": "string"
    }
  ],
  "timing": {
    "bestDays": ["string"],
    "bestHours": ["string"],
    "frequency": "string",
    "platformSpecific": {}
  },
  "abTests": [
    {
      "title": "string",
      "description": "string",
      "variables": ["string"],
      "metrics": ["string"],
      "priority": "high|medium|low",
      "expectedImpact": "string"
    }
  ],
  "risks": [
    {
      "risk": "string",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low",
      "mitigation": "string"
    }
  ],
  "optimizations": [
    {
      "title": "string",
      "description": "string",
      "type": "quick_win|long_term",
      "expectedUplift": "string",
      "priority": number
    }
  ],
  "summary": {
    "overallConfidence": number,
    "keyRecommendation": "string",
    "estimatedROI": number
  }
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
            content: 'You are an expert marketing performance predictor. Provide data-driven forecasts with specific numbers and confidence levels.'
          },
          {
            role: 'user',
            content: predictionPrompt
          }
        ],
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const predictions = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...predictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
