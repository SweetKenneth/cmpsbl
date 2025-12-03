/**
 * PromptFluid Marketing Audience Intelligence
 * AI-powered buyer persona generation and audience insights
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AudienceSchema = z.object({
  campaignData: z.any().optional(),
  performanceHistory: z.any().optional(),
  industry: z.string().min(1).max(200),
  brandProfile: z.object({
    name: z.string().max(200),
    industry: z.string().max(100).optional(),
    targetAudience: z.string().max(500).optional()
  }).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = AudienceSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { campaignData, performanceHistory, industry, brandProfile } = validation.data;
    
    console.log('🎯 Generating audience intelligence for:', industry);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const brandContext = brandProfile ? `
BRAND CONTEXT:
- Company: ${brandProfile.name}
- Industry: ${brandProfile.industry}
- Target Market: ${brandProfile.targetAudience}
` : '';

    const intelligencePrompt = `You are an expert audience intelligence analyst. Create detailed buyer personas.

${brandContext}

INDUSTRY: ${industry || 'General'}
CAMPAIGN DATA: ${JSON.stringify(campaignData, null, 2)}
PERFORMANCE HISTORY: ${JSON.stringify(performanceHistory, null, 2)}

Generate 3-4 detailed buyer personas with:

1. **DEMOGRAPHICS**:
   - Age range
   - Gender distribution
   - Income level
   - Location type (urban/suburban/rural)
   - Education level

2. **PSYCHOGRAPHICS**:
   - Lifestyle characteristics
   - Values and priorities
   - Shopping behaviors
   - Technology adoption
   - Social media usage patterns

3. **PAIN POINTS**:
   - Top 5 problems they face
   - Current inadequate solutions
   - Emotional impact of problems
   - Urgency level

4. **GOALS & ASPIRATIONS**:
   - What they want to achieve
   - Success criteria
   - Timeline expectations
   - Barriers to success

5. **PLATFORM PREFERENCES**:
   - Best social media platforms
   - Optimal posting times
   - Content format preferences
   - Engagement patterns

6. **MESSAGING STRATEGY**:
   - Key value propositions
   - Tone and voice recommendations
   - Emotional triggers
   - Objection handling

7. **MARKET SIZING**:
   - Estimated audience size
   - Addressable market
   - Competition level
   - Growth potential

Return structured JSON:
{
  "personas": [
    {
      "name": "Persona Name",
      "tagline": "One-liner description",
      "demographics": {
        "ageRange": "string",
        "income": "string",
        "location": "string",
        "education": "string"
      },
      "psychographics": {
        "lifestyle": ["string"],
        "values": ["string"],
        "behaviors": ["string"]
      },
      "painPoints": ["string"],
      "goals": ["string"],
      "platforms": [
        {
          "name": "string",
          "usage": "high|medium|low",
          "bestTimes": ["string"]
        }
      ],
      "messaging": {
        "tone": "string",
        "valueProps": ["string"],
        "triggers": ["string"]
      },
      "marketSize": {
        "estimated": "string",
        "competition": "high|medium|low"
      }
    }
  ],
  "overallInsights": {
    "primaryAudience": "string",
    "platformPriority": ["string"],
    "keyOpportunities": ["string"]
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
            content: 'You are an expert audience intelligence analyst. Create detailed, actionable buyer personas in JSON format.'
          },
          {
            role: 'user',
            content: intelligencePrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const intelligence = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify({ success: true, ...intelligence }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Audience intelligence error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
