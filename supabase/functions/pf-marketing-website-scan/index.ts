/**
 * PromptFluid Marketing Website Scanner
 * AI-powered website analysis for marketing optimization
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Website scan requested:', url);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Fetch website content
    let websiteContent = '';
    try {
      const siteResponse = await fetch(url, {
        headers: {
          'User-Agent': 'PromptFluid-Bot/1.0 (Marketing Analysis)'
        }
      });
      
      if (siteResponse.ok) {
        websiteContent = await siteResponse.text();
        // Extract first 5000 characters for analysis
        websiteContent = websiteContent.slice(0, 5000);
      }
    } catch (fetchError) {
      console.error('Website fetch error:', fetchError);
      websiteContent = 'Unable to fetch website content';
    }

    // Analyze website with AI
    const analysisPrompt = `Conduct a comprehensive marketing analysis of this website:

URL: ${url}

WEBSITE CONTENT PREVIEW:
${websiteContent}

**ANALYSIS REQUIRED:**

1. **MESSAGING & POSITIONING**
   - Value proposition clarity
   - Target audience alignment
   - Brand differentiation
   - Tone and voice consistency

2. **CONVERSION OPTIMIZATION**
   - Call-to-action effectiveness
   - Trust indicators present
   - Social proof usage
   - Friction points

3. **SEO & CONTENT**
   - Keyword optimization
   - Content quality
   - Meta information
   - Header structure

4. **USER EXPERIENCE**
   - Navigation clarity
   - Page load considerations
   - Mobile optimization signals
   - Visual hierarchy

5. **COMPETITIVE INSIGHTS**
   - Market positioning
   - Unique selling points
   - Competitive advantages
   - Improvement opportunities

6. **ACTIONABLE RECOMMENDATIONS**
   - Quick wins (immediate impact)
   - Strategic improvements (long-term)
   - Priority ranking
   - Expected impact

Return detailed analysis with specific examples and actionable recommendations.`;

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
            content: 'You are a marketing and conversion optimization expert. Provide detailed, actionable website analysis.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Store in Brain for learning
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('brain_memory').insert({
      source: 'website_scan',
      content: `Analyzed website: ${url}`,
      metadata: { url, scanType: 'marketing_analysis' }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        url,
        analysis,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Website scan error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Scan failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
