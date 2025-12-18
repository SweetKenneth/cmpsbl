/**
 * PromptFluid Marketing Competitor Analysis
 * AI-powered competitive intelligence and strategy recommendations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { callFreeTierAI } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CompetitorSchema = z.object({
  competitors: z.array(z.string().min(1).max(200)).min(1).max(10),
  brandProfile: z.object({
    name: z.string().max(200),
    industry: z.string().max(100).optional(),
    products: z.string().max(1000).optional(),
    uniqueValue: z.string().max(500).optional()
  }).optional(),
  analysisType: z.string().max(50).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = CompetitorSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { competitors, brandProfile, analysisType } = validation.data;

    console.log('🔍 Analyzing competitors:', competitors);

    const brandContext = brandProfile ? `
YOUR COMPANY: ${brandProfile.name}
Industry: ${brandProfile.industry}
Products: ${brandProfile.products}
Unique Value: ${brandProfile.uniqueValue}
` : '';

    const competitorPrompt = `You are a competitive intelligence analyst. Analyze competitors and provide strategic insights.

${brandContext}

COMPETITORS TO ANALYZE: ${competitors.join(', ')}
Analysis Type: ${analysisType || 'full'}

Provide comprehensive competitive analysis:

1. **Competitor Overview** (for each):
   - Estimated market presence
   - Primary platforms (social, ads, etc.)
   - Main messaging themes
   - Target audience
   - Pricing strategy

2. **Strengths & Weaknesses**:
   - What they're doing well
   - Where they're vulnerable
   - Market positioning gaps

3. **Strategic Opportunities**:
   - Underserved market segments
   - Messaging angles to exploit
   - Platform opportunities
   - Pricing strategies

4. **Counter-Strategy Recommendations**:
   - Specific campaign ideas
   - Differentiation tactics
   - Competitive advantages to leverage
   - Platform prioritization

Return as structured JSON:
{
  "competitors": [
    {
      "name": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "messagingThemes": ["string"],
      "platforms": ["string"],
      "pricing": "premium|competitive|value"
    }
  ],
  "opportunities": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "expectedImpact": "string"
    }
  ],
  "recommendations": [
    {
      "strategy": "string",
      "tactic": "string",
      "platform": "string",
      "investment": "high|medium|low"
    }
  ],
  "marketGaps": ["string"]
}`;

    const result = await callFreeTierAI(competitorPrompt, {
      systemPrompt: 'You are a competitive intelligence expert providing strategic market analysis.',
      temperature: 0.7
    });

    const analysis = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...analysis, provider: result.provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Competitor analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
