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

    const { problem, domain_1, domain_2 } = await req.json();

    console.log(`🔀 Pattern Fusion: Merging ${domain_1} + ${domain_2} patterns...`);

    const fusionPrompt = `You are Cascade's Pattern Fusion Engine. Merge insights from unrelated domains to solve this problem.

Problem: ${problem}
Domain 1: ${domain_1}
Domain 2: ${domain_2}

Process:
1. DOMAIN_1_PATTERNS: Extract 3-5 core patterns/principles from domain 1
2. DOMAIN_2_PATTERNS: Extract 3-5 core patterns/principles from domain 2
3. FUSION_CONCEPTS: Identify 2-4 hybrid concepts merging both domains
4. NOVEL_SOLUTIONS: Propose 3 innovative solutions using fused patterns
5. ORIGINALITY_SCORE: Rate each solution's uniqueness (0-100)

Return JSON: { domain_1_patterns: [], domain_2_patterns: [], fusion_concepts: [], novel_solutions: [], best_solution: { solution: "", originality_score: 0, implementation: "" } }`;

    const result = await callFreeTierAI(fusionPrompt, {
      systemPrompt: 'You are a pattern fusion specialist. Combine insights from different fields to create innovative solutions.',
      temperature: 0.7
    });

    let fusion;
    
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      fusion = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        domain_1_patterns: [],
        domain_2_patterns: [],
        fusion_concepts: [],
        novel_solutions: [],
        best_solution: { solution: 'Unable to parse fusion', originality_score: 0, implementation: '' }
      };
    } catch (e) {
      console.error('Pattern fusion parsing failed:', e);
      fusion = {
        domain_1_patterns: [],
        domain_2_patterns: [],
        fusion_concepts: [],
        novel_solutions: [],
        best_solution: { solution: 'Parsing error', originality_score: 0, implementation: '' }
      };
    }

    await supabase.from('brain_events').insert({
      module: 'pattern_fusion',
      event_type: 'domains_merged',
      data: { problem, domain_1, domain_2, fusion, provider: result.provider },
      outcome: 'fused',
    });

    console.log(`✅ Pattern fusion complete: ${fusion.best_solution.originality_score}% originality`);

    return new Response(
      JSON.stringify({ success: true, fusion, provider: result.provider }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Pattern fusion error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
