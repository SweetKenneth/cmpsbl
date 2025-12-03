/**
 * PromptFluid Marketing Retargeting Planner
 * AI-powered retargeting campaigns and sequences
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
    const { segmentType, campaignData, businessGoal, brandProfile } = await req.json();
    
    console.log('Retargeting planner:', { segmentType, businessGoal });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const brandContext = brandProfile ? `
BRAND: ${brandProfile.name}
Industry: ${brandProfile.industry}
` : '';

    const userPrompt = `Create a retargeting campaign plan:

${brandContext}

Segment Type: ${segmentType}
Business Goal: ${businessGoal}
${campaignData ? `Campaign Context: ${JSON.stringify(campaignData)}` : ''}

Create a multi-step retargeting sequence with:
1. Segment definition (who to target)
2. Multi-step sequence (3-5 steps over 7-14 days)
3. Messaging strategy for each step
4. Offer progression (escalating incentives)
5. Success metrics and KPIs

Return JSON:
{
  "segment": {
    "name": "string",
    "description": "string",
    "rules": {"condition": "string", "value": "string"},
    "estimatedSize": number,
    "potential": "string"
  },
  "sequence": [
    {
      "step": number,
      "timing": "string",
      "subject": "string",
      "message": "string",
      "offerType": "string",
      "offerValue": "string",
      "goal": "string",
      "expectedResponse": "string"
    }
  ],
  "strategy": {
    "approach": "string",
    "psychologyTactics": ["string"],
    "urgencyBuilders": ["string"]
  },
  "metrics": {
    "targetConversionRate": "string",
    "expectedROAS": "string",
    "benchmarkTobeat": "string"
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
            content: 'You are a retargeting expert. Create intelligent multi-step sequences that convert abandoned visitors. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Retargeting plan failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const plan = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...plan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Retargeting planner error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Planning failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
