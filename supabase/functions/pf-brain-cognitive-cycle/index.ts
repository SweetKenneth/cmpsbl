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

    const { task, mode = 'full' } = await req.json();

    console.log('🚀 Cognitive Cycle v4.0: Starting enhanced reasoning flow...');
    console.log(`Task: ${task}`);
    console.log(`Mode: ${mode}`);

    const cycleStart = Date.now();
    let result: any = { success: true };

    // PHASE 1: REFLEXIVE PLANNING
    console.log('\n1️⃣ REFLEXIVE PLANNING PHASE');
    const { data: planData, error: planError } = await supabase.functions.invoke('pf-brain-reflexive-plan', {
      body: { task },
    });

    if (planError) throw new Error(`Planning failed: ${planError.message}`);
    
    result.planning = planData;
    console.log(`Plan confidence: ${planData.plan.confidence}%`);
    console.log(`Ready to execute: ${planData.ready_to_execute}`);

    // If confidence too low, stop here and request more context
    if (!planData.ready_to_execute && mode === 'strict') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Insufficient context for execution',
          plan: planData.plan,
          context_audit: planData.context_audit,
          recommendation: 'Provide additional context or run research first',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PHASE 2: TEMPORAL-WEIGHTED REASONING
    console.log('\n2️⃣ TEMPORAL AWARENESS PHASE');
    const { data: temporalData, error: temporalError } = await supabase.functions.invoke('pf-brain-temporal-score', {
      body: { query: task },
    });

    if (temporalError) throw new Error(`Temporal scoring failed: ${temporalError.message}`);
    
    result.temporal_analysis = temporalData;
    console.log(`Time-weighted memories retrieved: ${temporalData.ranked_memories.length}`);
    console.log(`High priority (fresh): ${temporalData.temporal_stats.high_priority}`);

    // PHASE 3: EXECUTE WITH CONTEXT
    console.log('\n3️⃣ EXECUTION PHASE');
    
    // Build enhanced context from temporal data
    const contextualMemories = temporalData.ranked_memories.slice(0, 5);
    const executionPrompt = `Task: ${task}

Plan: ${JSON.stringify(planData.plan.steps)}

Time-weighted relevant context (prioritized by recency and relevance):
${contextualMemories.map((m: any, i: number) => 
  `${i + 1}. [${m.temporal_priority.toUpperCase()} - ${m.age_months}mo old] ${m.content}`
).join('\n')}

Execute the task following the plan, using the most recent and relevant data preferentially.`;

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');
    
    const executionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Cascade, executing with reflexive planning and temporal awareness. Prioritize recent data and follow the structured plan.' },
          { role: 'user', content: executionPrompt }
        ],
        temperature: 0.8,
      }),
    });

    const executionData = await executionResponse.json();
    const rawOutput = executionData.choices[0].message.content;
    
    result.raw_output = rawOutput;
    console.log(`Execution complete, output length: ${rawOutput.length} chars`);

    // PHASE 4: SELF-CRITIQUE & REVISION
    console.log('\n4️⃣ SELF-CRITIQUE PHASE');
    const { data: critiqueData, error: critiqueError } = await supabase.functions.invoke('pf-brain-self-critique', {
      body: { 
        output: rawOutput,
        task_context: { task, plan: planData.plan }
      },
    });

    if (critiqueError) throw new Error(`Self-critique failed: ${critiqueError.message}`);
    
    result.critique = critiqueData;
    result.final_output = critiqueData.final_output;
    result.quality_score = critiqueData.critique.overall;
    
    console.log(`Quality score: ${critiqueData.critique.overall}/100`);
    console.log(`Revision needed: ${critiqueData.needs_revision}`);
    console.log(`Final approved: ${critiqueData.quality_passed}`);

    // FINALIZE
    const cycleTime = Date.now() - cycleStart;
    
    await supabase.from('brain_events').insert({
      module: 'cognitive_cycle_v4',
      event_type: 'cycle_complete',
      data: {
        task,
        mode,
        plan_confidence: planData.plan.confidence,
        temporal_memories_used: temporalData.ranked_memories.length,
        quality_score: critiqueData.critique.overall,
        cycle_time_ms: cycleTime,
        phases_completed: ['planning', 'temporal', 'execution', 'critique'],
      },
      outcome: critiqueData.quality_passed ? 'success' : 'revised',
    });

    console.log(`\n✅ Cognitive Cycle v4.0 complete in ${cycleTime}ms`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Cognitive cycle error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
