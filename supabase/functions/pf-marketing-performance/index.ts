/**
 * PromptFluid Marketing Performance Analyzer
 * AI-powered performance insights and optimization recommendations
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
    const { performanceData, campaignDetails, analysisType } = await req.json();

    console.log('📈 Analyzing campaign performance');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
            content: 'You are an expert at analyzing marketing data and generating actionable insights.'
          },
          {
            role: 'user',
            content: insightsPrompt
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
    const analysis = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...analysis }),
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
