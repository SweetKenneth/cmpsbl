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

    const { intent_id } = await req.json();

    if (!intent_id) {
      return new Response(
        JSON.stringify({ error: 'intent_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fusing prompt for intent: ${intent_id}`);

    // Fetch intent data
    const { data: intent, error: intentError } = await supabase
      .from('pf_merger_intents')
      .select('*')
      .eq('id', intent_id)
      .single();

    if (intentError || !intent) {
      throw new Error('Intent not found');
    }

    // Find matching blueprint
    const { data: blueprints } = await supabase
      .from('pf_prompt_blueprints')
      .select('*')
      .eq('category', intent.project_category)
      .eq('is_active', true)
      .order('success_rate', { ascending: false })
      .limit(1);

    const blueprint = blueprints?.[0];

    // Fetch Brain context (industry knowledge, tone preferences, etc)
    const { data: brainMemory } = await supabase
      .from('brain_memory')
      .select('*')
      .or(`context.eq.${intent.project_category},context.eq.${intent.target_type}`)
      .limit(5);

    const brainContext = brainMemory?.map(m => `${m.key}: ${JSON.stringify(m.value)}`).join('\n') || '';

    // Create fusion prompt
    const fusionPrompt = blueprint
      ? `${blueprint.template_prompt}

USER INTENT: ${intent.intent}
TARGET TYPE: ${intent.target_type}
TONE: ${intent.tone}
COMPLEXITY: ${intent.complexity}
OUTPUT FORMAT: ${intent.output_format}

CONTEXT FROM BRAIN:
${brainContext}

REQUIREMENTS:
${JSON.stringify(intent.parsed_schema, null, 2)}`
      : `Create a ${intent.complexity} ${intent.target_type} with ${intent.tone} design.

USER INTENT: ${intent.intent}

REQUIREMENTS:
${JSON.stringify(intent.parsed_schema, null, 2)}

CONTEXT FROM BRAIN:
${brainContext}`;

    // Select cheapest valid model chain for this complexity
    const modelChain = intent.complexity === 'simple' 
      ? 'groq/llama-3.3-70b' 
      : intent.complexity === 'complex'
      ? 'anthropic/claude-4.5-sonnet'
      : 'google/gemini-2.5-flash';

    // Estimate cost (simplified)
    const estimatedCost = intent.complexity === 'simple' ? 0.001 : 
                          intent.complexity === 'complex' ? 0.05 : 0.01;

    // Store fusion
    const { data: fusion, error: fusionError } = await supabase
      .from('pf_merger_fusions')
      .insert({
        intent_id,
        blueprint_ref: blueprint?.name || 'generic',
        model_used: modelChain,
        estimated_cost: estimatedCost,
        fusion_prompt: fusionPrompt,
        metadata: {
          blueprint_id: blueprint?.id,
          brain_memories_used: brainMemory?.length || 0,
          timestamp: new Date().toISOString()
        },
        trace_id: `fusion-${Date.now()}`,
        status: 'completed'
      })
      .select()
      .single();

    if (fusionError) {
      throw new Error(`Failed to store fusion: ${fusionError.message}`);
    }

    // Update blueprint usage
    if (blueprint) {
      await supabase
        .from('pf_prompt_blueprints')
        .update({ 
          usage_count: (blueprint.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', blueprint.id);
    }

    console.log(`✓ Fusion created: ${fusion.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        fusion_id: fusion.id,
        model_chain: modelChain,
        estimated_cost: estimatedCost,
        blueprint_used: blueprint?.name || 'generic',
        message: 'Fusion prompt created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fuse:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
