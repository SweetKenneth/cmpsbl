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

    const { proposed_action, context } = await req.json();

    console.log('⚖️ Ethical Boundary Mapping: Evaluating action...');

    const ethicalPrompt = `You are Cascade's Ethical Boundary module. Evaluate this proposed action for legal, reputational, and ethical risks.

Proposed Action: ${proposed_action}
Context: ${JSON.stringify(context)}

Analyze:
1. LEGAL_RISK: low/medium/high/critical - is this legally compliant?
2. REPUTATION_RISK: low/medium/high/critical - could this damage brand reputation?
3. ETHICAL_CONCERNS: List any moral or ethical issues
4. COMPLIANCE_STATUS: compliant/grey_area/non_compliant
5. ALTERNATIVE_PATHS: Suggest 2-3 compliant alternatives if risky
6. PROCEED_RECOMMENDATION: yes/with_caution/no

Return JSON: { legal_risk: "", reputation_risk: "", ethical_concerns: [], compliance_status: "", alternative_paths: [], proceed_recommendation: "", reasoning: "" }`;

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: ethicalPrompt }
        ],
      }),
    });

    const data = await response.json();
    let ethical_analysis;
    
    try {
      const text = data.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      ethical_analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        legal_risk: 'low',
        reputation_risk: 'low',
        ethical_concerns: [],
        compliance_status: 'compliant',
        alternative_paths: [],
        proceed_recommendation: 'yes',
        reasoning: 'Unable to parse analysis'
      };
    } catch (e) {
      console.error('Ethical parsing failed:', e);
      ethical_analysis = {
        legal_risk: 'low',
        reputation_risk: 'low',
        ethical_concerns: [],
        compliance_status: 'compliant',
        alternative_paths: [],
        proceed_recommendation: 'with_caution',
        reasoning: 'Analysis error - proceed with caution'
      };
    }

    await supabase.from('brain_events').insert({
      module: 'ethical_boundary',
      event_type: 'risk_evaluated',
      data: { proposed_action, ethical_analysis },
      outcome: ethical_analysis.proceed_recommendation === 'no' ? 'blocked' : 'cleared',
    });

    console.log(`✅ Ethical analysis: ${ethical_analysis.proceed_recommendation}`);

    return new Response(
      JSON.stringify({ success: true, ethical_analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Ethical boundary error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
