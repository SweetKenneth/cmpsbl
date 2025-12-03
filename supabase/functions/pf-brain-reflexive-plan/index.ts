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

    const { task, context = {} } = await req.json();

    console.log('🧠 Reflexive Planning Core: Analyzing task:', task);

    // Step 1: Decompose task into structured plan
    const planningPrompt = `You are Cascade's Reflexive Planning Core. Analyze this task and create a structured execution plan.

Task: ${task}
Context: ${JSON.stringify(context)}

Create a plan with:
1. GOAL: What needs to be accomplished
2. STEPS: Ordered list of actions (3-7 steps)
3. SUCCESS_CRITERIA: How to validate completion
4. CONFIDENCE: Score 0-100 on feasibility with current context
5. REQUIRED_CONTEXT: What additional data is needed if confidence <70%

Return JSON only.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const planResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are Cascade\'s planning module. Return structured JSON plans only.' },
          { role: 'user', content: planningPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const planData = await planResponse.json();
    let plan;
    
    try {
      const planText = planData.choices[0].message.content;
      const jsonMatch = planText.match(/\{[\s\S]*\}/);
      plan = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        goal: task,
        steps: ['Execute task'],
        success_criteria: ['Task completed'],
        confidence: 50,
        required_context: []
      };
    } catch (e) {
      console.error('Plan parsing failed:', e);
      plan = {
        goal: task,
        steps: ['Execute task'],
        success_criteria: ['Task completed'],
        confidence: 50,
        required_context: []
      };
    }

    // Step 2: Context audit if confidence < 70%
    let contextAudit = null;
    if (plan.confidence < 70) {
      console.log(`⚠️ Low confidence (${plan.confidence}%), performing context audit...`);
      
      // Fetch relevant memory
      const { data: hotMemory } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .order('priority', { ascending: false })
        .limit(5);

      contextAudit = {
        missing_context: plan.required_context || [],
        available_memory: hotMemory?.length || 0,
        recommendation: plan.confidence < 50 
          ? 'High risk - additional research required'
          : 'Moderate risk - proceed with caution'
      };
    }

    // Step 3: Store plan in brain events
    await supabase.from('brain_events').insert({
      module: 'reflexive_planning',
      event_type: 'plan_created',
      data: {
        task,
        plan,
        context_audit: contextAudit,
        confidence: plan.confidence,
        requires_audit: plan.confidence < 70,
      },
      outcome: plan.confidence >= 70 ? 'ready' : 'needs_context',
    });

    console.log(`✅ Plan created with ${plan.confidence}% confidence`);

    return new Response(
      JSON.stringify({ 
        success: true,
        plan,
        context_audit: contextAudit,
        ready_to_execute: plan.confidence >= 70,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Reflexive planning error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
