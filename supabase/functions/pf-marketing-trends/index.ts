/**
 * PromptFluid Marketing Trends Analyzer
 * Real-time market trends and opportunity detection
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
    const { industry, keywords, timeframe = 'monthly', trendTypes = ['search_volume', 'social_trend', 'seasonal'] } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const trendsPrompt = `You are a market intelligence analyst specializing in ${industry}. 
Analyze current market trends and provide actionable insights:

Industry: ${industry}
Keywords/Topics: ${keywords.join(', ')}
Timeframe: ${timeframe}
Focus Areas: ${trendTypes.join(', ')}

Provide comprehensive analysis covering:

1. **Search Volume Trends**:
   - Current search interest (0-100 scale)
   - Growth rate (percentage change)
   - Seasonal patterns
   - Related rising queries

2. **Social Media Trends**:
   - Platform-specific content trends
   - Viral content patterns
   - Engagement metrics
   - Hashtag performance

3. **Seasonal Forecasting**:
   - Upcoming seasonal opportunities
   - Historical patterns
   - Peak demand periods
   - Campaign timing recommendations

4. **Platform Shifts**:
   - Emerging platforms gaining traction
   - Declining platforms
   - Audience migration patterns
   - Platform-specific opportunities

5. **Influencer Landscape**:
   - Key influencers in the space
   - Micro-influencer opportunities
   - Content collaboration ideas
   - Estimated reach and engagement

Return structured JSON with trends array, opportunities, and actionable recommendations.`;

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
            content: 'You are a market trends expert. Provide data-driven insights with specific metrics and actionable recommendations.'
          },
          {
            role: 'user',
            content: trendsPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      throw new Error(`Trends analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const trends = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...trends }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Trends analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
