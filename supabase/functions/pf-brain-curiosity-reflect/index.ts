import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  force_reflection: z.boolean().optional().default(false),
  min_curiosity_score: z.number().min(0).max(1).optional().default(0),
}).optional();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = req.method === 'POST' ? await req.json() : {};
    const validated = RequestSchema.parse(body);
    const { force_reflection, min_curiosity_score } = validated || { force_reflection: false, min_curiosity_score: 0 };
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Starting curiosity reflection cycle');

    // Fetch curiosity entries (filtered by min score if specified)
    let query = supabaseClient
      .from('brain_curiosity_log')
      .select('*')
      .order('curiosity_score', { ascending: false });
    
    if (min_curiosity_score > 0) {
      query = query.gte('curiosity_score', min_curiosity_score);
    }
    
    const { data: curiosityData, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    if (!curiosityData || curiosityData.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No curiosity data to reflect on',
          reflected: 0,
          archived: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalEntries = curiosityData.length;
    const topPercentile = Math.max(5, Math.ceil(totalEntries * 0.2));
    const bottomPercentile = Math.max(5, Math.ceil(totalEntries * 0.2));

    const topTopics = curiosityData.slice(0, topPercentile);
    const bottomTopics = curiosityData.slice(-bottomPercentile);

    console.log(`📊 Analyzing ${totalEntries} entries: top ${topTopics.length}, bottom ${bottomTopics.length}`);

    // Archive low-curiosity topics to cold storage
    let archivedCount = 0;
    for (const lowTopic of bottomTopics) {
      if (lowTopic.related_memory_id) {
        const { data: hotMemory } = await supabaseClient
          .from('brain_memory_hot')
          .select('*')
          .eq('id', lowTopic.related_memory_id)
          .single();

        if (hotMemory) {
          await supabaseClient
            .from('brain_memory_cold')
            .insert({
              summary: `${lowTopic.topic}: ${hotMemory.content.substring(0, 200)}`,
              tags: { curiosity_archived: true, score: lowTopic.curiosity_score },
              source_refs: [lowTopic.related_memory_id]
            });
          
          archivedCount++;
        }
      }
    }

    // Queue high-curiosity topics for deeper research
    let queuedCount = 0;
    for (const highTopic of topTopics) {
      const { error: queueError } = await supabaseClient
        .from('learning_queries')
        .insert({
          query: highTopic.topic,
          priority: highTopic.curiosity_score > 0.7 ? 'critical' : 'high',
          status: 'pending',
          source: 'curiosity_engine',
          metadata: {
            tags: highTopic.context_tags,
            novelty: highTopic.novelty_score,
            usefulness: highTopic.usefulness_score
          }
        });

      if (!queueError) queuedCount++;
    }

    // Log reflection to brain events
    await supabaseClient
      .from('brain_events')
      .insert({
        module: 'curiosity',
        event_type: 'reflection_complete',
        data: {
          total_analyzed: totalEntries,
          high_curiosity_queued: queuedCount,
          low_curiosity_archived: archivedCount,
          avg_curiosity: curiosityData.reduce((s, e) => s + (e.curiosity_score || 0), 0) / totalEntries
        },
        processed: true,
        outcome: 'success'
      });

    console.log(`✅ Curiosity reflection complete: ${queuedCount} queued, ${archivedCount} archived`);

    return new Response(
      JSON.stringify({
        success: true,
        reflected: queuedCount,
        archived: archivedCount,
        total_analyzed: totalEntries
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Curiosity reflection error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Reflection failed',
        code: 'CURIOSITY_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
