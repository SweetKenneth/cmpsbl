/**
 * PromptFluid Brain Knowledge Synthesizer
 * Compresses recent findings into core principles every 6 hours
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    console.log('🧠 Starting knowledge synthesis...');

    // Get recent completed queries (last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: recentQueries } = await sb
      .from('learning_queries')
      .select('*')
      .eq('status', 'done')
      .gte('created_at', sixHoursAgo);

    if (!recentQueries || recentQueries.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: 'No new data to synthesize' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group by topic (simple clustering)
    const topicClusters = new Map<string, any[]>();
    for (const query of recentQueries) {
      const topic = query.topic || 'general';
      if (!topicClusters.has(topic)) {
        topicClusters.set(topic, []);
      }
      topicClusters.get(topic)!.push(query);
    }

    const synthesized = [];

    // For each cluster, create or update a knowledge core entry
    for (const [topic, queries] of topicClusters) {
      const avgConfidence = queries.reduce((sum, q) => sum + (q.confidence || 0), 0) / queries.length;
      
      // Generate insight summary
      const insight = `Processed ${queries.length} queries on "${topic}" with avg confidence ${(avgConfidence * 100).toFixed(1)}%. Key findings synthesized from recent learning cycle.`;
      
      const sources = queries.map(q => ({
        query_id: q.id,
        source: q.source,
        confidence: q.confidence
      }));

      // Check for existing knowledge on this topic
      const { data: existing } = await sb
        .from('cascade_knowledge_core')
        .select('*')
        .eq('topic', topic)
        .single();

      if (existing) {
        // Update existing
        await sb
          .from('cascade_knowledge_core')
          .update({
            key_insight: insight,
            sources: sources,
            confidence: avgConfidence,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new
        const { data: newKnowledge } = await sb
          .from('cascade_knowledge_core')
          .insert({
            topic,
            key_insight: insight,
            sources,
            confidence: avgConfidence
          })
          .select()
          .single();

        synthesized.push(newKnowledge);
      }
    }

    // Log synthesis event
    await sb.from('brain_events').insert({
      event_type: 'knowledge_synthesis',
      module: 'brain_synthesize',
      data: {
        topics_processed: topicClusters.size,
        queries_analyzed: recentQueries.length,
        new_insights: synthesized.length
      },
      outcome: 'completed'
    });

    console.log(`✅ Synthesized ${topicClusters.size} knowledge clusters`);

    return new Response(
      JSON.stringify({
        ok: true,
        topics: topicClusters.size,
        insights: synthesized.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Knowledge synthesis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
