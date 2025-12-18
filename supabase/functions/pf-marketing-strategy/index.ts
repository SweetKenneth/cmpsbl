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
    const { business_description, target_audience, budget, goals } = await req.json();

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

    const result = await callFreeTierAI(prompt, {
      systemPrompt: 'You are a strategic marketing consultant. Provide actionable, data-driven marketing strategies.',
      temperature: 0.7,
      maxTokens: 2000
    });

    return new Response(
      JSON.stringify({ success: true, strategy: result.content, provider: result.provider }),
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
