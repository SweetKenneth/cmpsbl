/**
 * PromptFluid Brain - Memory Tiering Engine v2.0
 * Manages three-tier memory: Hot → Warm → Cold
 * With value-based promotion, demotion, and pruning
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TieringConfig {
  tier_name: string;
  max_entries: number;
  min_value_score: number;
  max_age_days: number;
  prune_threshold: number;
}

interface TieringStats {
  promoted_to_hot: number;
  demoted_to_warm: number;
  demoted_to_cold: number;
  pruned: number;
  rebalanced: number;
  errors: number;
}

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
    const operation = body.operation || 'rebalance';

    console.log(`🧠 Memory Tiering: ${operation}`);

    // Fetch tiering configuration
    const { data: configs } = await supabase
      .from('brain_tiering_config')
      .select('*');

    const tierConfig: Record<string, TieringConfig> = {};
    for (const c of configs || []) {
      tierConfig[c.tier_name] = c;
    }

    const stats: TieringStats = {
      promoted_to_hot: 0,
      demoted_to_warm: 0,
      demoted_to_cold: 0,
      pruned: 0,
      rebalanced: 0,
      errors: 0,
    };

    // Get current tier counts
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

    console.log(`Current counts - Hot: ${counts.hot}, Warm: ${counts.warm}, Cold: ${counts.cold}`);

    // ==================================
    // STEP 1: Calculate value scores for all hot memories
    // ==================================
    if (operation === 'rebalance' || operation === 'score') {
      const { data: hotMemories } = await supabase
        .from('brain_memory_hot')
        .select('id, access_count, importance_score, created_at, decay_rate')
        .order('created_at', { ascending: true })
        .limit(5000);

      for (const memory of hotMemories || []) {
        const ageDays = Math.floor(
          (Date.now() - new Date(memory.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const accessCount = memory.access_count || 0;
        const importance = memory.importance_score || 0.5;
        const decayRate = memory.decay_rate || 0.02;
        
        // Recency factor: exponential decay
        const recencyFactor = Math.exp(-decayRate * ageDays);
        // Access factor: logarithmic boost
        const accessFactor = Math.min(1.0, 0.3 + 0.1 * Math.log(Math.max(1, accessCount)));
        // Combined score
        const valueScore = Math.min(1.0, Math.max(0, 
          (importance * 0.4) + (recencyFactor * 0.35) + (accessFactor * 0.25)
        ));

        await supabase
          .from('brain_memory_hot')
          .update({ value_score: valueScore })
          .eq('id', memory.id);
        
        stats.rebalanced++;
      }
    }

    // ==================================
    // STEP 2: Demote low-value hot memories to warm
    // ==================================
    if (operation === 'rebalance' || operation === 'demote') {
      const hotConfig = tierConfig['hot'] || { max_entries: 500, min_value_score: 0.6 };
      
      // Find memories below threshold or exceeding capacity
      const { data: toDemote } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .or(`value_score.lt.${hotConfig.min_value_score}`)
        .order('value_score', { ascending: true })
        .limit(Math.max(0, counts.hot - hotConfig.max_entries));

      for (const memory of toDemote || []) {
        try {
          // Insert into warm
          await supabase.from('brain_memory_warm').insert({
            content: memory.content,
            core_summary: memory.content.substring(0, 200),
            embedding: memory.embedding,
            context: memory.context,
            goal_ref: memory.goal_ref,
            priority: memory.priority,
            value_score: memory.value_score || 0.4,
            access_count: memory.access_count || 0,
            decay_rate: 0.01,
            source_memory_id: memory.id,
            tags: memory.tags,
            metadata: memory.metadata,
            demoted_at: new Date().toISOString(),
          });

          // Delete from hot
          await supabase.from('brain_memory_hot').delete().eq('id', memory.id);
          stats.demoted_to_warm++;
        } catch (err) {
          console.error('Demote to warm error:', err);
          stats.errors++;
        }
      }
    }

    // ==================================
    // STEP 3: Demote low-value warm memories to cold
    // ==================================
    if (operation === 'rebalance' || operation === 'demote') {
      const warmConfig = tierConfig['warm'] || { max_entries: 2000, min_value_score: 0.35 };
      
      const { data: warmToDemote } = await supabase
        .from('brain_memory_warm')
        .select('*')
        .lt('value_score', warmConfig.min_value_score)
        .order('value_score', { ascending: true })
        .limit(500);

      for (const memory of warmToDemote || []) {
        try {
          await supabase.from('brain_memory_cold').insert({
            summary: memory.content,
            core_summary: memory.core_summary || memory.content.substring(0, 100),
            embedding: memory.embedding,
            compression_level: 3,
            source_refs: [memory.id],
            tags: { ...memory.tags, context: memory.context },
            value_score: memory.value_score,
            archived_at: new Date().toISOString(),
          });

          await supabase.from('brain_memory_warm').delete().eq('id', memory.id);
          stats.demoted_to_cold++;
        } catch (err) {
          console.error('Demote to cold error:', err);
          stats.errors++;
        }
      }
    }

    // ==================================
    // STEP 4: Promote high-value warm memories to hot
    // ==================================
    if (operation === 'rebalance' || operation === 'promote') {
      const hotConfig = tierConfig['hot'] || { max_entries: 500, min_value_score: 0.6 };
      const slotsAvailable = hotConfig.max_entries - (counts.hot - stats.demoted_to_warm);

      if (slotsAvailable > 0) {
        const { data: toPromote } = await supabase
          .from('brain_memory_warm')
          .select('*')
          .gte('value_score', hotConfig.min_value_score + 0.1) // Higher threshold for promotion
          .order('value_score', { ascending: false })
          .limit(Math.min(50, slotsAvailable));

        for (const memory of toPromote || []) {
          try {
            await supabase.from('brain_memory_hot').insert({
              content: memory.content,
              embedding: memory.embedding,
              context: memory.context,
              goal_ref: memory.goal_ref,
              priority: memory.priority,
              value_score: memory.value_score,
              access_count: memory.access_count,
              importance_score: memory.value_score,
              decay_rate: 0.02,
              tags: memory.tags,
              metadata: { ...memory.metadata, promoted_from: 'warm' },
              last_used: new Date().toISOString(),
            });

            await supabase.from('brain_memory_warm').delete().eq('id', memory.id);
            stats.promoted_to_hot++;
          } catch (err) {
            console.error('Promote to hot error:', err);
            stats.errors++;
          }
        }
      }
    }

    // ==================================
    // STEP 5: Prune worthless memories
    // ==================================
    if (operation === 'rebalance' || operation === 'prune') {
      // Prune from cold tier
      const coldConfig = tierConfig['cold'] || { prune_threshold: 0.05 };
      
      const { data: toPrune } = await supabase
        .from('brain_memory_cold')
        .select('id, summary, tags, value_score')
        .lt('value_score', coldConfig.prune_threshold)
        .limit(200);

      for (const memory of toPrune || []) {
        try {
          // Archive to pruned table
          await supabase.from('brain_memory_pruned').insert({
            original_memory_id: memory.id,
            original_tier: 'cold',
            content_preview: memory.summary?.substring(0, 200),
            context: (memory.tags as any)?.context || 'unknown',
            value_score: memory.value_score,
            prune_reason: 'low_value_score',
          });

          await supabase.from('brain_memory_cold').delete().eq('id', memory.id);
          stats.pruned++;
        } catch (err) {
          console.error('Prune error:', err);
          stats.errors++;
        }
      }

      // Also prune diagnostic/noise content from hot tier
      const noisePatterns = [
        '%diagnostic%', '%test cycle%', '%heartbeat%', 
        '%status check%', '%ping%', '%health check%'
      ];
      
      for (const pattern of noisePatterns) {
        const { data: noiseMemories } = await supabase
          .from('brain_memory_hot')
          .select('id, content, context, value_score')
          .ilike('content', pattern)
          .limit(50);

        for (const memory of noiseMemories || []) {
          try {
            await supabase.from('brain_memory_pruned').insert({
              original_memory_id: memory.id,
              original_tier: 'hot',
              content_preview: memory.content?.substring(0, 200),
              context: memory.context,
              value_score: memory.value_score || 0.1,
              prune_reason: 'noise_pattern',
            });

            await supabase.from('brain_memory_hot').delete().eq('id', memory.id);
            stats.pruned++;
          } catch (err) {
            stats.errors++;
          }
        }
      }
    }

    // ==================================
    // STEP 6: Clean up expired pruned records
    // ==================================
    await supabase
      .from('brain_memory_pruned')
      .delete()
      .lt('restore_until', new Date().toISOString())
      .eq('can_restore', true);

    // Log event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'memory_tiering',
      data: {
        operation,
        stats,
        duration_ms: Date.now() - startTime,
        final_counts: {
          hot: counts.hot - stats.demoted_to_warm + stats.promoted_to_hot,
          warm: counts.warm + stats.demoted_to_warm - stats.demoted_to_cold - stats.promoted_to_hot,
          cold: counts.cold + stats.demoted_to_cold - stats.pruned,
        },
      },
      outcome: stats.errors === 0 ? 'success' : 'partial',
    });

    console.log('✅ Memory tiering complete:', stats);

    return new Response(JSON.stringify({
      success: true,
      operation,
      stats,
      duration_ms: Date.now() - startTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Memory tiering error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
