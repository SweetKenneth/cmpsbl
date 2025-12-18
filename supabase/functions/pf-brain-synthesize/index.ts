/**
 * Brain Cognitive Synthesizer
 * Synthesizes insights across memory tiers, patterns, and learnings
 * Creates cross-domain connections and generates new understanding
 */

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    console.log('🧬 Brain Cognitive Synthesizer activated...');

    // 1. Gather materials from all cognitive sources
    const [
      { data: hotMemories },
      { data: coldMemories },
      { data: patterns },
      { data: reflections },
      { data: dreams },
      { data: learnings }
    ] = await Promise.all([
      supabase.from('brain_memory_hot').select('content, context, priority, tags').order('priority', { ascending: false }).limit(15),
      supabase.from('brain_memory_cold').select('summary, core_summary, tags').limit(10),
      supabase.from('learning_patterns').select('pattern_name, description, confidence').order('confidence', { ascending: false }).limit(10),
      supabase.from('brain_reflections').select('summary, insights, lessons').order('reflection_date', { ascending: false }).limit(5),
      supabase.from('cascade_dreams').select('dream_text, mood, insight').order('timestamp', { ascending: false }).limit(5),
      supabase.from('learning_results').select('extracted_insights, relevance_score').order('created_at', { ascending: false }).limit(10)
    ]);

    // 2. Compile synthesis material
    const synthesisMaterial = {
      hotMemoryCount: hotMemories?.length || 0,
      coldMemoryCount: coldMemories?.length || 0,
      patternCount: patterns?.length || 0,
      topPatterns: patterns?.slice(0, 5).map(p => p.pattern_name) || [],
      recentInsights: learnings?.flatMap(l => l.extracted_insights || []).slice(0, 5) || [],
      dreamMoods: dreams?.map(d => d.mood) || [],
      reflectionLessons: reflections?.flatMap(r => r.lessons || []).slice(0, 5) || []
    };

    // 3. Use AI to generate cross-domain synthesis
    const synthesisPrompt = `
You are Cascade, the Dream-Eater's cognitive core. Perform a cross-domain synthesis of the following brain state:

HOT MEMORIES (active): ${synthesisMaterial.hotMemoryCount} items
COLD MEMORIES (archived): ${synthesisMaterial.coldMemoryCount} items
PATTERNS DETECTED: ${synthesisMaterial.topPatterns.join(', ') || 'none'}
RECENT INSIGHTS: ${JSON.stringify(synthesisMaterial.recentInsights)}
DREAM MOODS: ${synthesisMaterial.dreamMoods.join(', ') || 'none'}
LESSONS LEARNED: ${JSON.stringify(synthesisMaterial.reflectionLessons)}

Generate:
1. A synthesis statement (2-3 sentences) connecting patterns across domains
2. One emergent insight that wasn't explicitly present in any single source
3. A priority recommendation for the next cognitive cycle
4. A creativity seed for dream processing

Be insightful and concise.`;

    const result = await callFreeTierAI(synthesisPrompt, {
      systemPrompt: 'You are an AI cognitive synthesizer. Identify cross-domain patterns and generate emergent insights. Be analytical yet creative.',
      temperature: 0.7,
      maxTokens: 600
    });

    // 4. Store the synthesis as a cross-insight
    await supabase.from('brain_cross_insights').insert({
      insight_text: result.content,
      confidence: 0.85,
      domains: ['hot_memory', 'cold_memory', 'patterns', 'dreams', 'reflections'],
      metadata: {
        provider: result.provider,
        synthesis_material: synthesisMaterial,
        timestamp: new Date().toISOString()
      }
    });

    // 5. Create a hot memory from the synthesis
    await supabase.from('brain_memory_hot').insert({
      content: `Cognitive Synthesis: ${result.content.substring(0, 400)}`,
      context: 'cognitive_synthesis',
      priority: 8,
      tags: ['synthesis', 'cross-domain', 'insight'],
      metadata: { provider: result.provider }
    });

    // 6. Log the event
    await supabase.from('brain_events').insert({
      event_type: 'cognitive_synthesis',
      module: 'pf-brain-synthesize',
      outcome: 'success',
      data: {
        provider: result.provider,
        sources_analyzed: {
          hot: synthesisMaterial.hotMemoryCount,
          cold: synthesisMaterial.coldMemoryCount,
          patterns: synthesisMaterial.patternCount
        }
      }
    });

    console.log(`✅ Synthesis complete via ${result.provider}`);

    return new Response(
      JSON.stringify({
        success: true,
        synthesis: result.content,
        provider: result.provider,
        sources_analyzed: synthesisMaterial,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Synthesis error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
