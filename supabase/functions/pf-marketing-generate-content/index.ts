/**
 * PromptFluid Marketing Content Generator
 * AI-powered SEO content creation with brand alignment
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
    const { 
      contentType, 
      topic, 
      keywords, 
      tone, 
      length,
      brandProfile 
    } = await req.json();
    
    console.log('Content generation request:', { contentType, topic, tone });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const brandContext = brandProfile ? `
BRAND CONTEXT:
- Company: ${brandProfile.name}
- Industry: ${brandProfile.industry}
- Voice: ${brandProfile.tone || tone}
- Target Audience: ${brandProfile.targetAudience}
` : '';

    const contentPrompts: Record<string, string> = {
      blog: `Write a comprehensive SEO-optimized blog post about: ${topic}

${brandContext}

TARGET KEYWORDS: ${keywords?.join(', ') || 'N/A'}
TONE: ${tone || 'professional'}
LENGTH: ${length || 'medium'} (800-1200 words)

REQUIREMENTS:
- Compelling headline with primary keyword
- Clear introduction with hook
- Well-structured sections with H2/H3 headings
- SEO-optimized content with natural keyword integration
- Actionable takeaways
- Strong call-to-action
- Meta description (150-160 characters)`,

      social: `Create engaging social media content about: ${topic}

${brandContext}

REQUIREMENTS:
- Platform-optimized posts (Facebook, Instagram, LinkedIn, Twitter)
- Attention-grabbing hooks
- Relevant hashtags
- Emoji usage (where appropriate)
- Clear call-to-action
- Multiple variations per platform`,

      email: `Write a conversion-focused email campaign about: ${topic}

${brandContext}

REQUIREMENTS:
- Compelling subject line (under 50 characters)
- Preview text optimization
- Personalized greeting
- Clear value proposition
- Benefit-driven body copy
- Strong call-to-action
- PS statement for urgency`,

      landing: `Create high-converting landing page copy for: ${topic}

${brandContext}

REQUIREMENTS:
- Benefit-driven headline
- Subheadline with value proposition
- Problem/solution framework
- Feature/benefit bullets
- Social proof elements
- Trust indicators
- Multiple CTA variations
- FAQ section`,

      ad: `Generate high-performing ad copy for: ${topic}

${brandContext}

REQUIREMENTS:
- Headlines (multiple variations, under 30 characters)
- Descriptions (90-120 characters)
- Call-to-action options
- Pain point focus
- Benefit emphasis
- Platform-specific variants (Google, Facebook, LinkedIn)`
    };

    const prompt = contentPrompts[contentType] || contentPrompts.blog;

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
            content: 'You are an expert content marketing specialist. Create high-quality, SEO-optimized content that drives engagement and conversions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      throw new Error(`Content generation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Store in Brain for learning
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('brain_memory').insert({
      source: 'content_generation',
      content: `Generated ${contentType} content for topic: ${topic}`,
      metadata: { contentType, keywords, tone, length }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        content,
        contentType,
        topic,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
