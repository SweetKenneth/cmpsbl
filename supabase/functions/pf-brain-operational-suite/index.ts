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

    const { 
      task,
      enable_systems_reasoning = false,
      enable_emotional_modeling = true,
      enable_ethical_check = true,
      enable_hypothesis_test = false,
      enable_pattern_fusion = false,
      user_message = '',
      conversation_history = []
    } = await req.json();

    console.log('🧠 Operational Intelligence Suite v5.0: Activating enhanced capabilities...');
    const suiteStart = Date.now();
    
    const results: any = {
      success: true,
      task,
      capabilities_activated: [],
    };

    // CAPABILITY 1: Emotional Modeling (if user message provided)
    if (enable_emotional_modeling && user_message) {
      console.log('\n💙 Running Emotional Modeling...');
      const { data: emotionalData } = await supabase.functions.invoke('pf-brain-emotional-model', {
        body: { user_message, conversation_history },
      });
      results.emotional_model = emotionalData?.emotional_model;
      results.capabilities_activated.push('emotional_modeling');
    }

    // CAPABILITY 2: Ethical Boundary Check
    if (enable_ethical_check) {
      console.log('\n⚖️ Running Ethical Boundary Check...');
      const { data: ethicalData } = await supabase.functions.invoke('pf-brain-ethical-boundary', {
        body: { proposed_action: task, context: {} },
      });
      results.ethical_analysis = ethicalData?.ethical_analysis;
      results.capabilities_activated.push('ethical_boundary');
      
      // Block if ethical analysis says no
      if (ethicalData?.ethical_analysis?.proceed_recommendation === 'no') {
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Ethical boundary violation detected',
            ethical_analysis: ethicalData.ethical_analysis,
            alternative_paths: ethicalData.ethical_analysis.alternative_paths,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // CAPABILITY 3: Systems Reasoning
    if (enable_systems_reasoning) {
      console.log('\n🔍 Running Systems Reasoning...');
      const { data: systemsData } = await supabase.functions.invoke('pf-brain-systems-reasoning', {
        body: { system: 'PromptFluid', issue: task },
      });
      results.systems_analysis = systemsData?.analysis;
      results.capabilities_activated.push('systems_reasoning');
    }

    // CAPABILITY 4: Hypothesis Testing
    if (enable_hypothesis_test) {
      console.log('\n🧪 Running Hypothesis Testing...');
      const { data: hypothesisData } = await supabase.functions.invoke('pf-brain-hypothesis-test', {
        body: { claim: task, context: {} },
      });
      results.hypothesis_test = hypothesisData?.hypothesis_test;
      results.capabilities_activated.push('hypothesis_testing');
    }

    // CAPABILITY 5: Pattern Fusion (if applicable)
    if (enable_pattern_fusion) {
      console.log('\n🔀 Running Pattern Fusion...');
      const { data: fusionData } = await supabase.functions.invoke('pf-brain-pattern-fusion', {
        body: { 
          problem: task,
          domain_1: 'technology',
          domain_2: 'psychology'
        },
      });
      results.pattern_fusion = fusionData?.fusion;
      results.capabilities_activated.push('pattern_fusion');
    }

    // CAPABILITY 6: Execute with Cognitive Cycle v4.0
    console.log('\n🚀 Executing with Cognitive Cycle v4.0...');
    const { data: cycleData } = await supabase.functions.invoke('pf-brain-cognitive-cycle', {
      body: { task, mode: 'full' },
    });
    results.cognitive_output = cycleData;

    // CAPABILITY 7: Compress Session into Lesson Cards
    console.log('\n🗜️ Compressing session into lesson cards...');
    const { data: compressionData } = await supabase.functions.invoke('pf-brain-lesson-compress', {
      body: { 
        session_data: [
          { module: 'operational_suite', data: results }
        ],
        timeframe: 'current_session'
      },
    });
    results.lesson_cards = compressionData?.compression?.lesson_cards;
    results.capabilities_activated.push('self_compression');

    // Calculate performance metrics
    const suiteTime = Date.now() - suiteStart;
    const overhead = ((suiteTime / 1000) - 1) * 100; // Assuming baseline is 1s

    results.performance = {
      total_time_ms: suiteTime,
      overhead_percentage: Math.max(0, overhead),
      capabilities_count: results.capabilities_activated.length,
    };

    // Log to brain events
    await supabase.from('brain_events').insert({
      module: 'operational_suite_v5',
      event_type: 'suite_executed',
      data: {
        task,
        capabilities: results.capabilities_activated,
        performance: results.performance,
        quality_score: cycleData?.quality_score || 0,
      },
      outcome: 'complete',
    });

    console.log(`\n✅ Operational Intelligence Suite v5.0 complete in ${suiteTime}ms`);
    console.log(`Overhead: ${results.performance.overhead_percentage.toFixed(1)}%`);
    console.log(`Capabilities: ${results.capabilities_activated.join(', ')}`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Operational suite error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
