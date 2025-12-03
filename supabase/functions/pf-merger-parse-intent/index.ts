import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { raw_input, user_id } = await req.json();

    if (!raw_input) {
      return new Response(
        JSON.stringify({ error: 'raw_input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing intent for user ${user_id || 'anonymous'}`);

    // Use AI to parse and normalize the intent
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are an expert intent parser for PromptFluid Merger. 
            
Analyze user input and extract:
1. Intent (clear, concise goal)
2. Target type (web_app, mobile_app, api, landing_page, dashboard, etc)
3. Tone (professional, casual, technical, creative, modern, minimal)
4. Complexity (simple, medium, complex)
5. Output format (full_mvp, prototype, wireframe)
6. Project category (ecommerce, saas, portfolio, blog, tool, game, etc)

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
}`
          },
          {
            role: 'user',
            content: raw_input
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_intent",
              description: "Parse user intent into structured format",
              parameters: {
                type: "object",
                properties: {
                  intent: { type: "string" },
                  target_type: { 
                    type: "string",
                    enum: ["web_app", "mobile_app", "api", "landing_page", "dashboard", "portfolio", "blog"]
                  },
                  tone: {
                    type: "string",
                    enum: ["professional", "casual", "technical", "creative", "modern", "minimal"]
                  },
                  complexity: {
                    type: "string",
                    enum: ["simple", "medium", "complex"]
                  },
                  output_format: {
                    type: "string",
                    enum: ["full_mvp", "prototype", "wireframe"]
                  },
                  project_category: { type: "string" },
                  parsed_schema: {
                    type: "object",
                    properties: {
                      features: { type: "array", items: { type: "string" } },
                      target_audience: { type: "string" },
                      key_requirements: { type: "array", items: { type: "string" } },
                      technical_stack: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                required: ["intent", "target_type", "tone", "complexity", "output_format", "project_category"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "parse_intent" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI parsing error:', aiResponse.status, errorText);
      throw new Error(`AI parsing failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call returned from AI');
    }

    const parsedData = JSON.parse(toolCall.function.arguments);

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
        model_detected: 'google/gemini-2.5-flash'
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
