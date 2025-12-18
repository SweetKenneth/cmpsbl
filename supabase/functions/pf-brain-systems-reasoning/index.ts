import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

    const { system, issue } = await req.json();

    console.log('🔍 Systems Reasoning: Analyzing dependencies for:', system);

    const reasoningPrompt = `You are Cascade's Systems Reasoning module. Analyze this system issue with multi-layer dependency mapping.

System: ${system}
Issue: ${issue}

Trace:
1. ROOT CAUSES: Identify all potential root causes (technical, process, human)
2. DEPENDENCIES: Map upstream and downstream dependencies affected
3. BOTTLENECKS: Locate performance or logical bottlenecks in the system
4. CASCADING EFFECTS: Predict what breaks if issue persists
5. FIX PRIORITIES: Rank solutions by impact and implementation complexity

Return structured JSON with: { root_causes: [], dependencies: { upstream: [], downstream: [] }, bottlenecks: [], cascading_effects: [], fix_priorities: [] }`;

    const result = await callFreeTierAI(reasoningPrompt, {
      systemPrompt: 'You are a systems architect analyzing complex dependencies. Return detailed JSON analysis.',
      temperature: 0.5
    });

    let analysis;
    
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        root_causes: ['Unable to parse analysis'],
        dependencies: { upstream: [], downstream: [] },
        bottlenecks: [],
        cascading_effects: [],
        fix_priorities: []
      };
    } catch (e) {
      console.error('Systems analysis parsing failed:', e);
      analysis = {
        root_causes: ['Analysis parsing error'],
        dependencies: { upstream: [], downstream: [] },
        bottlenecks: [],
        cascading_effects: [],
        fix_priorities: []
      };
    }

    await supabase.from('brain_events').insert({
      module: 'systems_reasoning',
      event_type: 'dependency_mapped',
      data: { system, issue, analysis, provider: result.provider },
      outcome: 'analyzed',
    });

    console.log('✅ Systems reasoning complete');

    return new Response(
      JSON.stringify({ success: true, analysis, provider: result.provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Systems reasoning error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
