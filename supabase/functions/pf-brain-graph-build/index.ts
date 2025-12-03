import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GraphBuildSchema = z.object({
  rebuild: z.boolean().optional().default(false),
  maxEdges: z.number().int().min(1).max(10000).optional().default(1000)
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const validation = GraphBuildSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { rebuild, maxEdges } = validation.data;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🕸️ Starting knowledge graph construction', { rebuild, maxEdges });

    // Fetch all memories with context tags
    const { data: memories, error: memoriesError } = await supabaseClient
      .from('brain_memory_hot')
      .select('id, context_tags, related_ids');

    if (memoriesError) throw memoriesError;

    // Fetch all reflections
    const { data: reflections, error: reflectionsError } = await supabaseClient
      .from('brain_reflection_log')
      .select('id, topic');

    if (reflectionsError) throw reflectionsError;

    // Fetch curiosity logs
    const { data: curiosities, error: curiositiesError } = await supabaseClient
      .from('brain_curiosity_log')
      .select('id, topic, context_tags');

    if (curiositiesError) throw curiositiesError;

    const edges: Array<{
      source_id: string;
      target_id: string;
      relation: string;
      weight: number;
    }> = [];

    console.log(`Building graph from ${memories?.length || 0} memories, ${reflections?.length || 0} reflections, ${curiosities?.length || 0} curiosities`);

    // Link memories to reflections by topic overlap
    if (memories && reflections) {
      for (const memory of memories) {
        for (const reflection of reflections) {
          if (reflection.topic && memory.context_tags?.includes(reflection.topic)) {
            edges.push({
              source_id: memory.id,
              target_id: reflection.id,
              relation: 'reflects_on',
              weight: 1.0
            });
          }
        }
      }
    }

    // Link memories to curiosities by topic overlap
    if (memories && curiosities) {
      for (const memory of memories) {
        for (const curiosity of curiosities) {
          const hasOverlap = memory.context_tags?.some((tag: string) => 
            curiosity.context_tags?.includes(tag) || curiosity.topic === tag
          );
          if (hasOverlap) {
            edges.push({
              source_id: memory.id,
              target_id: curiosity.id,
              relation: 'explores',
              weight: 0.7
            });
          }
        }
      }
    }

    // Link memories by shared tags
    if (memories) {
      for (const memory of memories) {
        const tags = memory.context_tags || [];
        for (const tag of tags) {
          const linkedMemories = memories.filter(
            m => m.id !== memory.id && m.context_tags?.includes(tag)
          );
          for (const linked of linkedMemories) {
            // Avoid duplicate edges
            const exists = edges.some(
              e => e.source_id === memory.id && 
                   e.target_id === linked.id && 
                   e.relation === 'shares_topic'
            );
            if (!exists) {
              edges.push({
                source_id: memory.id,
                target_id: linked.id,
                relation: 'shares_topic',
                weight: 0.5
              });
            }
          }
        }
      }
    }

    // Link memories through explicit related_ids
    if (memories) {
      for (const memory of memories) {
        if (memory.related_ids && memory.related_ids.length > 0) {
          for (const relatedId of memory.related_ids) {
            edges.push({
              source_id: memory.id,
              target_id: relatedId,
              relation: 'related_to',
              weight: 0.8
            });
          }
        }
      }
    }

    console.log(`Generated ${edges.length} graph edges`);

    // Clear old edges and insert new ones (full rebuild)
    const { error: deleteError } = await supabaseClient
      .from('brain_graph_edges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) console.warn('Could not clear old edges:', deleteError);

    // Insert new edges in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < edges.length; i += batchSize) {
      const batch = edges.slice(i, i + batchSize);
      const { error: insertError } = await supabaseClient
        .from('brain_graph_edges')
        .insert(batch);

      if (insertError) {
        console.error('Batch insert error:', insertError);
      } else {
        insertedCount += batch.length;
      }
    }

    // Log to brain events
    await supabaseClient.from('brain_events').insert({
      module: 'graph',
      event_type: 'build_complete',
      data: {
        edges_created: insertedCount,
        memories_processed: memories?.length || 0,
        reflections_linked: reflections?.length || 0,
        curiosities_linked: curiosities?.length || 0
      },
      processed: true,
      outcome: 'success'
    });

    console.log(`✅ Graph build complete: ${insertedCount} edges created`);

    return new Response(
      JSON.stringify({
        success: true,
        edges: insertedCount,
        nodes: {
          memories: memories?.length || 0,
          reflections: reflections?.length || 0,
          curiosities: curiosities?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Graph build error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Graph build failed',
        code: 'GRAPH_BUILD_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
