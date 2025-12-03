/**
 * PromptFluid Marketing Performance Insights
 * Real-time campaign performance analysis and optimization
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
    const { campaignId, performanceData, campaignDetails } = await req.json();
    
    console.log('Performance insights for campaign:', campaignId);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const insightsPrompt = `Analyze this campaign's real-time performance and provide actionable insights.

CAMPAIGN: ${campaignDetails?.headline || 'Untitled'}
PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

Generate insights in these categories:

1. OPTIMIZATION INSIGHTS (improve now):
   - Specific actions
   - Expected impact
   - Implementation ease
   - Priority level

2. WARNING INSIGHTS (potential problems):
   - What's going wrong
   - Why it matters
   - Immediate actions
   - Priority level

3. OPPORTUNITY INSIGHTS (untapped potential):
   - What's working well
   - How to double down
   - Expansion opportunities
   - Priority level

4. PREDICTION INSIGHTS (future forecasts):
   - Performance trajectory
   - Confidence level
   - Recommended adjustments
   - Priority level

For each insight provide:
- Title (concise, action-oriented)
- Description (what's happening)
- Recommendation (specific action)
- Data (supporting metrics)

Return structured JSON array sorted by priority.`;

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
            content: 'You are a performance analyst expert. Generate actionable insights from campaign data. Be specific and data-driven.'
          },
          {
            role: 'user',
            content: insightsPrompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const insights = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Performance insights error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
