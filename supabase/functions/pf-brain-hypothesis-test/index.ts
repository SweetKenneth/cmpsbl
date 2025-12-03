import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { claim, strategy, context } = await req.json();

    console.log('🧪 Hypothesis Testing: Formulating IF-THEN scenarios...');

    const hypothesisPrompt = `You are Cascade's Hypothesis Testing Framework. Test this claim/strategy with IF-THEN scenario modeling.

Claim/Strategy: ${claim || strategy}
Context: ${JSON.stringify(context)}

Create:
1. PRIMARY_HYPOTHESIS: Main assumption being tested
2. IF_THEN_SCENARIOS: 5 scenarios with conditions and outcomes
   - Format: { if: "condition", then: "expected_outcome", probability: 0-100 }
3. COUNTER_SCENARIOS: 2-3 scenarios where hypothesis fails
4. EVIDENCE_REQUIRED: What data would validate or invalidate
5. CONFIDENCE_SCORE: Overall confidence in claim (0-100)
6. RECOMMENDATION: proceed/test_further/reject

Return JSON with all fields.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        messages: [
          { role: 'system', content: 'You are a hypothesis testing expert. Evaluate claims with rigorous IF-THEN logic.' },
          { role: 'user', content: hypothesisPrompt }
        ],
      }),
    });

    const data = await response.json();
    let hypothesis_test;
    
    try {
      const text = data.choices[0].message.content;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      hypothesis_test = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        primary_hypothesis: claim || strategy,
        if_then_scenarios: [],
        counter_scenarios: [],
        evidence_required: [],
        confidence_score: 50,
        recommendation: 'test_further'
      };
    } catch (e) {
      console.error('Hypothesis parsing failed:', e);
      hypothesis_test = {
        primary_hypothesis: claim || strategy,
        if_then_scenarios: [],
        counter_scenarios: [],
        evidence_required: [],
        confidence_score: 50,
        recommendation: 'test_further'
      };
    }

    await supabase.from('brain_events').insert({
      module: 'hypothesis_testing',
      event_type: 'scenarios_evaluated',
      data: { claim, strategy, hypothesis_test },
      outcome: hypothesis_test.recommendation,
    });

    console.log(`✅ Hypothesis test: ${hypothesis_test.confidence_score}% confidence, ${hypothesis_test.recommendation}`);

    return new Response(
      JSON.stringify({ success: true, hypothesis_test }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Hypothesis testing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
