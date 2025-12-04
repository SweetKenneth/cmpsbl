import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SwotSchema = z.object({
  brandProfile: z.object({
    name: z.string().max(200),
    industry: z.string().max(100).optional(),
    targetAudience: z.string().max(500).optional()
  }).optional(),
  competitors: z.array(z.string().max(200)).max(10).optional(),
  recentMetrics: z.any().optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const validation = SwotSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { brandProfile, competitors, recentMetrics } = validation.data;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const period = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const swotPrompt = `You are a strategic business analyst conducting a SWOT analysis.

Business: ${brandProfile?.name || 'Company'}
Industry: ${brandProfile?.industry || 'General'}
Target Audience: ${brandProfile?.targetAudience || 'General consumers'}
${competitors && competitors.length > 0 ? `Competitors: ${competitors.join(', ')}` : ''}
${recentMetrics ? `Recent Performance: ${JSON.stringify(recentMetrics)}` : ''}

Conduct a comprehensive SWOT analysis:

**STRENGTHS** (Internal Positive):
- Competitive advantages
- Unique capabilities
- Market position
- Brand reputation

**WEAKNESSES** (Internal Negative):
- Limitations
- Resource gaps
- Market positioning challenges
- Areas for improvement

**OPPORTUNITIES** (External Positive):
- Market trends
- Emerging technologies
- Untapped segments
- Growth potential

**THREATS** (External Negative):
- Competition
- Market shifts
- Economic factors
- Industry challenges

**STRATEGIC RECOMMENDATIONS**:
- Priority actions
- Resource allocation
- Risk mitigation
- Growth strategies

Return as structured JSON:
{
  "period": "${period}",
  "strengths": ["point 1", "point 2", ...],
  "weaknesses": ["point 1", "point 2", ...],
  "opportunities": ["point 1", "point 2", ...],
  "threats": ["point 1", "point 2", ...],
  "recommendations": ["action 1", "action 2", ...],
  "strategicScore": 75
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a strategic business analyst.' },
          { role: 'user', content: swotPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`SWOT generation failed: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const swotAnalysis = JSON.parse(resultText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    return new Response(
      JSON.stringify(swotAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SWOT analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
