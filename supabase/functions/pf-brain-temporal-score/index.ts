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

    const { query, context_type = 'general' } = await req.json();

    console.log('⏰ Temporal Awareness Engine: Scoring data freshness for:', query);

    // Step 1: Retrieve memory with timestamps
    const { data: hotMemory } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: coldMemory } = await supabase
      .from('brain_memory_cold')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Step 2: Calculate freshness scores
    const now = new Date();
    const scoredMemories = [...(hotMemory || []), ...(coldMemory || [])].map(memory => {
      const createdAt = new Date(memory.created_at);
      const ageMonths = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      let freshnessScore;
      let priority;
      
      if (ageMonths <= 3) {
        freshnessScore = 1.0;
        priority = 'high';
      } else if (ageMonths <= 18) {
        freshnessScore = 0.6 - (ageMonths - 3) * 0.03; // Linear decay from 0.6 to 0.15
        priority = 'medium';
      } else {
        freshnessScore = Math.max(0.1, 0.15 - (ageMonths - 18) * 0.01); // Further decay to 0.1 minimum
        priority = 'contextual';
      }

      return {
        ...memory,
        age_months: Math.round(ageMonths * 10) / 10,
        freshness_score: Math.round(freshnessScore * 100) / 100,
        temporal_priority: priority,
      };
    });

    // Step 3: Sort by combined relevance + freshness
    const rankedMemories = scoredMemories
      .sort((a, b) => {
        const aScore = (a.priority || 0.5) * 0.5 + a.freshness_score * 0.5;
        const bScore = (b.priority || 0.5) * 0.5 + b.freshness_score * 0.5;
        return bScore - aScore;
      })
      .slice(0, 10);

    // Step 4: Log temporal analysis
    await supabase.from('brain_events').insert({
      module: 'temporal_awareness',
      event_type: 'freshness_scored',
      data: {
        query,
        context_type,
        total_memories_scored: scoredMemories.length,
        high_priority_count: scoredMemories.filter(m => m.temporal_priority === 'high').length,
        medium_priority_count: scoredMemories.filter(m => m.temporal_priority === 'medium').length,
        contextual_count: scoredMemories.filter(m => m.temporal_priority === 'contextual').length,
        avg_freshness: scoredMemories.reduce((sum, m) => sum + m.freshness_score, 0) / scoredMemories.length,
      },
      outcome: 'scored',
    });

    console.log(`✅ Scored ${scoredMemories.length} memories with temporal awareness`);

    return new Response(
      JSON.stringify({ 
        success: true,
        ranked_memories: rankedMemories,
        temporal_stats: {
          high_priority: rankedMemories.filter(m => m.temporal_priority === 'high').length,
          medium_priority: rankedMemories.filter(m => m.temporal_priority === 'medium').length,
          contextual: rankedMemories.filter(m => m.temporal_priority === 'contextual').length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Temporal scoring error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
