/**
 * PromptFluid Marketing Research Insights
 * AI-powered market research and strategic recommendations
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
    const { goal, audience, context, industry } = await req.json();
    
    console.log('Research insights:', { goal, audience, industry });

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

    const result = await callFreeTierAI(researchPrompt, {
      systemPrompt: 'You are a marketing research expert. Provide actionable, research-backed insights in JSON format.',
      temperature: 0.7,
      maxTokens: 2500
    });

    const insights = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, provider: result.provider, ...insights }),
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
