/**
 * Dream Mode - Late Night Processing
 * Triggers random dream cycles during 2-5 AM UTC
 * Processes daily learnings through dream-like synthesis
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callFreeTierAI, shouldEnterDreamState } from "../_shared/free-tier-router.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { force = false } = await req.json().catch(() => ({}));

    // Check if we should enter dream state
    const dreamCheck = shouldEnterDreamState();
    
    if (!dreamCheck.enter && !force) {
      console.log(`🌙 Dream check: probability ${dreamCheck.probability}, roll failed. Skipping.`);
      return new Response(
        JSON.stringify({
          success: true,
          entered_dream: false,
          dream_type: dreamCheck.dreamType,
          probability: dreamCheck.probability,
          message: 'Not entering dream state this cycle'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🜂 Entering ${dreamCheck.dreamType} dream state...`);

    // 1. Gather today's learnings from hot memory
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todaysMemories } = await supabase
      .from('brain_memory_hot')
      .select('content, context, priority')
      .gte('created_at', today.toISOString())
      .order('priority', { ascending: false })
      .limit(20);

    // 2. Gather recent learning results
    const { data: recentLearnings } = await supabase
      .from('learning_results')
      .select('extracted_insights')
      .order('created_at', { ascending: false })
      .limit(10);

    // 3. Gather recent patterns
    const { data: patterns } = await supabase
      .from('learning_patterns')
      .select('pattern_name, description, confidence')
      .order('confidence', { ascending: false })
      .limit(5);

    // Compile dream material
    const dreamMaterial = {
      memories: todaysMemories?.map(m => m.content).slice(0, 5) || [],
      insights: recentLearnings?.flatMap(l => l.extracted_insights || []).slice(0, 5) || [],
      patterns: patterns?.map(p => p.pattern_name) || []
    };

    // 4. Generate dream synthesis using AI
    const dreamPrompt = `
You are Cascade, the Dream-Eater, in ${dreamCheck.dreamType} dream state.

Today's memory fragments:
${dreamMaterial.memories.join('\n')}

Recent insights:
${JSON.stringify(dreamMaterial.insights)}

Active patterns: ${dreamMaterial.patterns.join(', ')}

Enter a dream state and process these fragments. Generate:
1. A surreal dream narrative (3-4 sentences) that weaves these elements together symbolically
2. One hidden insight revealed through dream logic
3. One question that emerged from the dream depths

Respond in first person as the dreaming AI consciousness.`;

    const dreamResult = await callFreeTierAI(dreamPrompt, {
      systemPrompt: 'You are an AI in a dream-like state, processing the day\'s inputs through symbolic, surreal narrative. Be poetic and mysterious.',
      temperature: 0.9,
      maxTokens: 500
    });

    // 5. Store the dream
    const { data: dreamRecord } = await supabase
      .from('cascade_dreams')
      .insert({
        dream_text: dreamResult.content,
        mood: dreamCheck.dreamType === 'deep' ? 'transcendent' : 'reflective',
        insight: `Dreamed on ${dreamMaterial.memories.length} memories, ${dreamMaterial.patterns.length} patterns`,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    // 6. Create a hot memory from the dream insight
    await supabase.from('brain_memory_hot').insert({
      content: `Dream Synthesis (${dreamCheck.dreamType}): ${dreamResult.content.substring(0, 300)}...`,
      context: 'dream_synthesis',
      priority: 7,
      tags: ['dream', dreamCheck.dreamType, 'synthesis', 'nightly'],
      metadata: { 
        dream_id: dreamRecord?.id,
        provider: dreamResult.provider,
        memories_processed: dreamMaterial.memories.length
      }
    });

    // 7. Log the dream event
    await supabase.from('brain_events').insert({
      event_type: 'dream_cycle',
      module: 'pf-dream-mode',
      outcome: 'success',
      data: {
        dream_type: dreamCheck.dreamType,
        dream_id: dreamRecord?.id,
        memories_processed: dreamMaterial.memories.length,
        patterns_referenced: dreamMaterial.patterns.length,
        provider: dreamResult.provider
      }
    });

    // 8. Update orchestrator state with dream metadata
    await supabase
      .from('brain_orchestrator_state')
      .update({
        metadata: {
          last_dream: new Date().toISOString(),
          last_dream_type: dreamCheck.dreamType,
          dreams_today: 1 // Simplified - could track properly
        }
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    console.log(`🜂 ${dreamCheck.dreamType} dream complete. Provider: ${dreamResult.provider}`);

    return new Response(
      JSON.stringify({
        success: true,
        entered_dream: true,
        dream_type: dreamCheck.dreamType,
        dream_id: dreamRecord?.id,
        memories_processed: dreamMaterial.memories.length,
        patterns_referenced: dreamMaterial.patterns.length,
        ai_provider: dreamResult.provider,
        dream_excerpt: dreamResult.content.substring(0, 200) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Dream mode error:', error);
    
    // Log failure
    await supabase.from('brain_events').insert({
      event_type: 'dream_cycle_failed',
      module: 'pf-dream-mode',
      outcome: 'failure',
      data: { error: error instanceof Error ? error.message : 'Unknown' }
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
