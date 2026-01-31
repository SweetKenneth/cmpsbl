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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'standard'; // 'standard' | 'aggressive' | 'deep'

    console.log(`⚡ Running brain optimization (mode: ${mode})...`);

    const startTime = Date.now();
    const stats = {
      demoted_to_warm: 0,
      demoted_to_cold: 0,
      pruned: 0,
      decayed: 0,
      scored: 0,
      errors: 0,
    };

    // Get current tier counts
    const [hotResult, warmResult, coldResult] = await Promise.all([
      supabaseClient.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabaseClient.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
      supabaseClient.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    ]);

    const counts = {
      hot: { before: hotResult.count || 0, after: 0 },
      warm: { before: warmResult.count || 0, after: 0 },
      cold: { before: coldResult.count || 0, after: 0 },
    };

    const limits = { hot: 500, warm: 2000, cold: 10000 };
    
    console.log(`📊 Current: Hot=${counts.hot.before}, Warm=${counts.warm.before}, Cold=${counts.cold.before}`);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 1: Prune diagnostic/noise from hot tier (always run)
    // ════════════════════════════════════════════════════════════════════════
    const noisePatterns = [
      '%diagnostic%', '%test cycle%', '%heartbeat%', 
      '%status check%', '%ping%', '%health check%',
      '%status_check%', '%brain_status%'
    ];

    for (const pattern of noisePatterns) {
      const { data: noiseMemories } = await supabaseClient
        .from('brain_memory_hot')
        .select('id, content, context, value_score')
        .ilike('content', pattern)
        .limit(100);

      for (const memory of noiseMemories || []) {
        try {
          await supabaseClient.from('brain_memory_pruned').insert({
            original_memory_id: memory.id,
            original_tier: 'hot',
            content_preview: memory.content?.substring(0, 200),
            context: memory.context,
            value_score: memory.value_score || 0.1,
            prune_reason: 'noise_pattern',
          });
          await supabaseClient.from('brain_memory_hot').delete().eq('id', memory.id);
          stats.pruned++;
        } catch {
          stats.errors++;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2: Demote excess hot tier to warm (critical rebalancing)
    // ════════════════════════════════════════════════════════════════════════
    const hotOverflow = (counts.hot.before - stats.pruned) - limits.hot;
    
    if (hotOverflow > 0) {
      const batchSize = mode === 'aggressive' ? 500 : mode === 'deep' ? 1000 : 200;
      const toDemoteCount = Math.min(hotOverflow + 100, batchSize); // Extra buffer
      
      console.log(`🔄 Demoting ${toDemoteCount} hot memories to warm...`);

      // Get oldest/lowest value memories to demote
      const { data: toDemote } = await supabaseClient
        .from('brain_memory_hot')
        .select('*')
        .order('value_score', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(toDemoteCount);

      for (const memory of toDemote || []) {
        try {
          await supabaseClient.from('brain_memory_warm').insert({
            content: memory.content,
            core_summary: memory.content?.substring(0, 200),
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
          await supabaseClient.from('brain_memory_hot').delete().eq('id', memory.id);
          stats.demoted_to_warm++;
        } catch (err) {
          console.error('Demote to warm error:', err);
          stats.errors++;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 3: Demote excess warm tier to cold
    // ════════════════════════════════════════════════════════════════════════
    const warmAfterStep2 = counts.warm.before + stats.demoted_to_warm;
    const warmOverflow = warmAfterStep2 - limits.warm;

    if (warmOverflow > 0) {
      const batchSize = mode === 'aggressive' ? 300 : mode === 'deep' ? 500 : 100;
      const toDemoteCount = Math.min(warmOverflow + 50, batchSize);
      
      console.log(`🔄 Demoting ${toDemoteCount} warm memories to cold...`);

      const { data: warmToDemote } = await supabaseClient
        .from('brain_memory_warm')
        .select('*')
        .order('value_score', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })
        .limit(toDemoteCount);

      for (const memory of warmToDemote || []) {
        try {
          await supabaseClient.from('brain_memory_cold').insert({
            summary: memory.content,
            core_summary: memory.core_summary || memory.content?.substring(0, 100),
            embedding: memory.embedding,
            compression_level: 3,
            source_refs: [memory.id],
            tags: { ...(memory.tags as object || {}), context: memory.context },
            value_score: memory.value_score,
            archived_at: new Date().toISOString(),
          });
          await supabaseClient.from('brain_memory_warm').delete().eq('id', memory.id);
          stats.demoted_to_cold++;
        } catch (err) {
          console.error('Demote to cold error:', err);
          stats.errors++;
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 4: Decay old unused memories (reduce confidence)
    // ════════════════════════════════════════════════════════════════════════
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: stale } = await supabaseClient
      .from('brain_memory_hot')
      .select('id, value_score')
      .lt('last_used', oneWeekAgo.toISOString())
      .gt('value_score', 0.1)
      .limit(100);

    for (const memory of stale || []) {
      try {
        const newScore = Math.max(0.1, (memory.value_score || 0.5) - 0.1);
        await supabaseClient
          .from('brain_memory_hot')
          .update({ value_score: newScore })
          .eq('id', memory.id);
        stats.decayed++;
      } catch {
        stats.errors++;
      }
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 5: Score unscored memories
    // ════════════════════════════════════════════════════════════════════════
    const { data: unscored } = await supabaseClient
      .from('brain_memory_hot')
      .select('id, access_count, importance_score, created_at, decay_rate')
      .is('value_score', null)
      .limit(200);

    for (const memory of unscored || []) {
      try {
        const ageDays = Math.floor((Date.now() - new Date(memory.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const accessCount = memory.access_count || 0;
        const importance = memory.importance_score || 0.5;
        const decayRate = memory.decay_rate || 0.02;
        
        const recencyFactor = Math.exp(-decayRate * ageDays);
        const accessFactor = Math.min(1.0, 0.3 + 0.1 * Math.log(Math.max(1, accessCount)));
        const valueScore = Math.min(1.0, Math.max(0.1, 
          (importance * 0.4) + (recencyFactor * 0.35) + (accessFactor * 0.25)
        ));

        await supabaseClient
          .from('brain_memory_hot')
          .update({ value_score: valueScore })
          .eq('id', memory.id);
        stats.scored++;
      } catch {
        stats.errors++;
      }
    }

    // Get final counts
    const [hotFinal, warmFinal, coldFinal] = await Promise.all([
      supabaseClient.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabaseClient.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
      supabaseClient.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    ]);

    counts.hot.after = hotFinal.count || 0;
    counts.warm.after = warmFinal.count || 0;
    counts.cold.after = coldFinal.count || 0;

    // Log event
    await supabaseClient.from('brain_events').insert({
      event_type: 'brain_optimization',
      module: 'brain',
      data: {
        mode,
        stats,
        before: { hot: counts.hot.before, warm: counts.warm.before, cold: counts.cold.before },
        after: { hot: counts.hot.after, warm: counts.warm.after, cold: counts.cold.after },
        duration_ms: Date.now() - startTime,
      },
      outcome: stats.errors === 0 ? 'success' : 'partial',
    });

    console.log(`✅ Optimization complete in ${Date.now() - startTime}ms:`, stats);
    console.log(`📊 After: Hot=${counts.hot.after}, Warm=${counts.warm.after}, Cold=${counts.cold.after}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode,
        stats,
        tiers: {
          hot: { before: counts.hot.before, after: counts.hot.after, limit: limits.hot },
          warm: { before: counts.warm.before, after: counts.warm.after, limit: limits.warm },
          cold: { before: counts.cold.before, after: counts.cold.after, limit: limits.cold },
        },
        duration_ms: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error optimizing brain:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
