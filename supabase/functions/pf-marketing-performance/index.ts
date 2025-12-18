/**
 * PromptFluid Marketing Performance Analyzer
 * AI-powered performance insights and optimization recommendations
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
    const { performanceData, campaignDetails, analysisType } = await req.json();

    console.log('📈 Analyzing campaign performance');

    const insightsPrompt = `You are a marketing performance analyst. Analyze campaign performance and provide actionable insights.

CAMPAIGN: ${campaignDetails?.name || 'Unnamed Campaign'}
PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

Analysis Type: ${analysisType || 'comprehensive'}

Provide insights in these categories:

1. **OPTIMIZATION INSIGHTS** (immediate improvements):
   - Specific actions to take
   - Expected impact
   - Implementation difficulty
   - Priority level

2. **WARNING INSIGHTS** (potential problems):
   - What's going wrong
   - Why it matters
   - Immediate actions needed
   - Risk level

3. **OPPORTUNITY INSIGHTS** (untapped potential):
   - What's working well
   - How to scale it
   - Expansion opportunities
   - Revenue potential

4. **PREDICTIVE INSIGHTS** (forecasts):
   - Performance trajectory
   - Confidence level
   - Recommended adjustments
   - Expected outcomes

Return as structured JSON array of insights:
{
  "insights": [
    {
      "category": "optimization|warning|opportunity|prediction",
      "priority": "critical|high|medium|low",
      "title": "string",
      "description": "string",
      "recommendation": "string",
      "metrics": {
        "current": "string",
        "potential": "string",
        "impact": "string"
      },
      "actions": ["string"]
    }
  ],
  "summary": {
    "overallHealth": "excellent|good|fair|poor",
    "topPriority": "string",
    "quickWins": ["string"]
  }
}`;

    const result = await callFreeTierAI(insightsPrompt, {
      systemPrompt: 'You are an expert at analyzing marketing data and generating actionable insights.',
      temperature: 0.6,
      maxTokens: 2000
    });

    const analysis = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, provider: result.provider, ...analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Performance analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
