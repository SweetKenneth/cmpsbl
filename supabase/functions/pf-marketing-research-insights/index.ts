/**
 * PromptFluid Marketing Research Insights
 * AI-powered market research and strategic recommendations
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
    const { goal, audience, context, industry } = await req.json();
    
    console.log('Research insights:', { goal, audience, industry });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const researchPrompt = `You are a marketing research analyst. Provide research-backed insights for a campaign.

CAMPAIGN DETAILS:
- Goal: ${goal}
- Target Audience: ${audience}
- Industry: ${industry || 'General'}
- Context: ${context || "General campaign"}

Provide strategic insights:

1. COMPETITIVE LANDSCAPE:
   - Top-performing ad patterns
   - Visual styles that work best
   - Copy hooks that get attention
   - CTAs that convert

2. AUDIENCE PSYCHOLOGY:
   - Primary pain points
   - Purchase motivations
   - Objections to overcome
   - Resonant language/tone

3. SEASONAL CONTEXT:
   - Current season considerations
   - Relevant events or holidays
   - Timing recommendations
   - Activity patterns

4. PLATFORM OPTIMIZATION:
   - Best platform for audience + goal
   - Optimal ad format
   - Ideal aspect ratio and caption length
   - Best posting times

5. MESSAGING STRATEGY:
   - Recommended emotional approach
   - Primary benefit to lead with
   - Secondary benefits
   - Social proof elements

6. VISUAL RECOMMENDATIONS:
   - Imagery that performs best
   - Color psychology
   - Text overlay best practices
   - Logo/branding placement

Return comprehensive JSON with all insights and specific recommendations.`;

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
            content: 'You are a marketing research expert. Provide actionable, research-backed insights in JSON format.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      throw new Error(`Research failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const insights = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Research insights error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Research failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
