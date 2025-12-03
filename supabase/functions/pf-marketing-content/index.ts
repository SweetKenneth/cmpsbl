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
    const { content_type, topic, tone = 'professional', length = 'medium' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log(`✍️ Generating ${content_type} content about: ${topic}`);

    const prompts = {
      blog_post: `Write a comprehensive blog post about "${topic}". Tone: ${tone}. Length: ${length}. Include an engaging introduction, 3-4 main points, and a conclusion with CTA.`,
      social_media: `Create 5 engaging social media posts about "${topic}". Tone: ${tone}. Include emojis and hashtags where appropriate.`,
      email: `Write a compelling marketing email about "${topic}". Tone: ${tone}. Include subject line, preview text, and body with clear CTA.`,
      ad_copy: `Create 3 variations of ad copy for "${topic}". Tone: ${tone}. Each under 150 characters. Focus on benefits and urgency.`,
      landing_page: `Write landing page copy for "${topic}". Include headline, subheadline, 3 benefit bullets, and 2 CTAs. Tone: ${tone}.`,
    };

    const prompt = prompts[content_type as keyof typeof prompts] || `Create marketing content about "${topic}". Tone: ${tone}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, content, content_type, topic }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Content generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
