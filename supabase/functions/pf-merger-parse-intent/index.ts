import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { raw_input, user_id } = await req.json();

    if (!raw_input) {
      return new Response(
        JSON.stringify({ error: 'raw_input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing intent for user ${user_id || 'anonymous'}`);

    // Use AI to parse and normalize the intent
    const parsePrompt = `Analyze this user input and extract:
1. Intent (clear, concise goal)
2. Target type (web_app, mobile_app, api, landing_page, dashboard, etc)
3. Tone (professional, casual, technical, creative, modern, minimal)
4. Complexity (simple, medium, complex)
5. Output format (full_mvp, prototype, wireframe)
6. Project category (ecommerce, saas, portfolio, blog, tool, game, etc)

User input: ${raw_input}

Return ONLY valid JSON in this exact format:
{
  "intent": "clear description of what they want",
  "target_type": "web_app",
  "tone": "professional",
  "complexity": "medium",
  "output_format": "full_mvp",
  "project_category": "saas",
  "parsed_schema": {
    "features": [],
    "target_audience": "",
    "key_requirements": [],
    "technical_stack": []
  }
}`;

    const result = await callFreeTierAI(parsePrompt, {
      systemPrompt: 'You are an expert intent parser for PromptFluid Merger. Parse user input into structured format. Return ONLY valid JSON.',
      temperature: 0.4
    });

    const parsedData = JSON.parse(result.content.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

    // Store in database
    const { data: intent, error: insertError } = await supabase
      .from('pf_merger_intents')
      .insert({
        user_id: user_id || null,
        raw_input,
        intent: parsedData.intent,
        target_type: parsedData.target_type,
        tone: parsedData.tone,
        complexity: parsedData.complexity,
        output_format: parsedData.output_format,
        project_category: parsedData.project_category,
        parsed_schema: parsedData.parsed_schema || {},
        model_detected: result.provider
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to store intent: ${insertError.message}`);
    }

    console.log(`✓ Intent parsed and stored: ${intent.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        intent_id: intent.id,
        parsed: parsedData,
        provider: result.provider,
        message: 'Intent successfully parsed and normalized'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-intent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
