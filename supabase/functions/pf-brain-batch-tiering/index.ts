/**
 * PromptFluid Brain - Batch Memory Tiering v2.1
 * High-performance batch processing for large memory volumes
 * Uses direct SQL batch operations for speed
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

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json().catch(() => ({}));
    const operation = body.operation || 'full';
    const batchSize = body.batch_size || 1000;

    console.log(`🧠 Batch Tiering: ${operation} (batch: ${batchSize})`);

    const stats = {
      scored: 0,
      pruned_noise: 0,
      demoted_to_warm: 0,
      demoted_to_cold: 0,
      promoted_to_hot: 0,
      errors: 0,
    };

    // Get current counts
    const [hotResult, warmResult, coldResult] = await Promise.all([
      supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    ]);

    const counts = {
      hot: hotResult.count || 0,
      warm: warmResult.count || 0,
      cold: coldResult.count || 0,
    };

    console.log(`Initial counts - Hot: ${counts.hot}, Warm: ${counts.warm}, Cold: ${counts.cold}`);

    // ==================================
    // STEP 1: Prune noise content first (fastest operation)
    // ==================================
    if (operation === 'full' || operation === 'prune') {
      const noisePatterns = [
        'diagnostic', 'heartbeat', 'test cycle', 
        'status check', 'ping', 'health check'
      ];

      for (const pattern of noisePatterns) {
        // Find noise memories
        const { data: noiseMemories } = await supabase
          .from('brain_memory_hot')
          .select('id, content, context, value_score')
          .ilike('content', `%${pattern}%`)
          .limit(200);

        if (noiseMemories && noiseMemories.length > 0) {
          // Archive to pruned table in batch
          const pruneRecords = noiseMemories.map(m => ({
            original_memory_id: m.id,
            original_tier: 'hot',
            content_preview: m.content?.substring(0, 200) || '',
            context: m.context || 'unknown',
            value_score: m.value_score || 0.1,
            prune_reason: 'noise_pattern',
          }));

          await supabase.from('brain_memory_pruned').insert(pruneRecords);
          
          // Delete from hot
          const ids = noiseMemories.map(m => m.id);
          await supabase.from('brain_memory_hot').delete().in('id', ids);
          
          stats.pruned_noise += noiseMemories.length;
          console.log(`Pruned ${noiseMemories.length} noise memories (${pattern})`);
        }
      }
    }

    // ==================================
    // STEP 2: Batch score calculation via SQL
    // ==================================
    if (operation === 'full' || operation === 'score') {
      // Process in batches
      let offset = 0;
      let processed = 0;

      while (processed < 5000) {
        const { data: batch } = await supabase
          .from('brain_memory_hot')
          .select('id, access_count, importance_score, created_at, decay_rate')
          .is('value_score', null)
          .order('created_at', { ascending: true })
          .range(offset, offset + batchSize - 1);

        if (!batch || batch.length === 0) break;

        // Calculate scores and update in batch
        const updates = batch.map(memory => {
          const ageDays = Math.floor(
            (Date.now() - new Date(memory.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          const accessCount = memory.access_count || 0;
          const importance = memory.importance_score || 0.5;
          const decayRate = memory.decay_rate || 0.02;
          
          const recencyFactor = Math.exp(-decayRate * ageDays);
          const accessFactor = Math.min(1.0, 0.3 + 0.1 * Math.log(Math.max(1, accessCount)));
          const valueScore = Math.min(1.0, Math.max(0, 
            (importance * 0.4) + (recencyFactor * 0.35) + (accessFactor * 0.25)
          ));

          return { id: memory.id, value_score: valueScore };
        });

        // Batch update using parallel promises
        await Promise.all(updates.map(u => 
          supabase.from('brain_memory_hot').update({ value_score: u.value_score }).eq('id', u.id)
        ));

        processed += batch.length;
        stats.scored += batch.length;
        console.log(`Scored batch: ${processed} memories`);
      }
    }

    // ==================================
    // STEP 3: Batch demote to warm
    // ==================================
    if (operation === 'full' || operation === 'demote') {
      // Find low-value memories (below hot threshold)
      const { data: toDemote } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .lt('value_score', 0.55)
        .order('value_score', { ascending: true })
        .limit(batchSize);

      if (toDemote && toDemote.length > 0) {
        // Prepare warm records
        const warmRecords = toDemote.map(m => ({
          content: m.content,
          core_summary: m.content?.substring(0, 200) || '',
          embedding: m.embedding,
          context: m.context,
          goal_ref: m.goal_ref,
          priority: m.priority,
          value_score: m.value_score || 0.4,
          access_count: m.access_count || 0,
          decay_rate: 0.01,
          source_memory_id: m.id,
          tags: m.tags,
          metadata: m.metadata,
          demoted_at: new Date().toISOString(),
        }));

        // Insert batch
        const { error: insertError } = await supabase
          .from('brain_memory_warm')
          .insert(warmRecords);

        if (!insertError) {
          // Delete from hot
          const ids = toDemote.map(m => m.id);
          await supabase.from('brain_memory_hot').delete().in('id', ids);
          stats.demoted_to_warm += toDemote.length;
          console.log(`Demoted ${toDemote.length} memories to warm`);
        } else {
          console.error('Warm insert error:', insertError);
          stats.errors++;
        }
      }
    }

    // ==================================
    // STEP 4: Batch demote warm to cold
    // ==================================
    if (operation === 'full' || operation === 'demote') {
      const { data: warmToDemote } = await supabase
        .from('brain_memory_warm')
        .select('*')
        .lt('value_score', 0.3)
        .order('value_score', { ascending: true })
        .limit(500);

      if (warmToDemote && warmToDemote.length > 0) {
        const coldRecords = warmToDemote.map(m => ({
          summary: m.content,
          core_summary: m.core_summary || m.content?.substring(0, 100),
          embedding: m.embedding,
          compression_level: 3,
          source_refs: [m.id],
          tags: m.tags,
          value_score: m.value_score,
          archived_at: new Date().toISOString(),
        }));

        const { error: coldError } = await supabase
          .from('brain_memory_cold')
          .insert(coldRecords);

        if (!coldError) {
          const ids = warmToDemote.map(m => m.id);
          await supabase.from('brain_memory_warm').delete().in('id', ids);
          stats.demoted_to_cold += warmToDemote.length;
          console.log(`Demoted ${warmToDemote.length} memories to cold`);
        } else {
          stats.errors++;
        }
      }
    }

    // Get final counts
    const [hotFinal, warmFinal, coldFinal] = await Promise.all([
      supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    ]);

    const finalCounts = {
      hot: hotFinal.count || 0,
      warm: warmFinal.count || 0,
      cold: coldFinal.count || 0,
    };

    // Log event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'batch_memory_tiering',
      data: {
        operation,
        batch_size: batchSize,
        stats,
        initial_counts: counts,
        final_counts: finalCounts,
        duration_ms: Date.now() - startTime,
      },
      outcome: stats.errors === 0 ? 'success' : 'partial',
    });

    console.log('✅ Batch tiering complete:', stats);
    console.log(`Final counts - Hot: ${finalCounts.hot}, Warm: ${finalCounts.warm}, Cold: ${finalCounts.cold}`);

    return new Response(JSON.stringify({
      success: true,
      operation,
      stats,
      initial_counts: counts,
      final_counts: finalCounts,
      duration_ms: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Batch tiering error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
