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
    const { business_description, target_audience, budget, goals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log('📈 Generating marketing strategy');

    const prompt = `Create a comprehensive marketing strategy for:
Business: ${business_description}
Target Audience: ${target_audience}
Budget: ${budget}
Goals: ${goals}

Provide:
1. Key marketing channels (with rationale)
2. Content strategy
3. Budget allocation
4. Timeline (90-day plan)
5. KPIs to track
6. Quick wins (actions to take immediately)`;

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
            content: 'You are a strategic marketing consultant. Provide actionable, data-driven marketing strategies.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();
    const strategy = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, strategy }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Strategy generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
