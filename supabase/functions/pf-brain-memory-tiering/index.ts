/**
 * PromptFluid Brain - Memory Tiering Engine v3.0
 * AGGRESSIVE tiering to manage hot tier overflow
 * Protected memory types are never demoted/pruned
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Protected memory types that NEVER get demoted or pruned
const PROTECTED_MEMORY_TYPES = [
  'core_identity',
  'system_awareness', 
  'principles',
  'safety_laws',
  'doctrine_integrated'
];

interface TieringStats {
  demoted_to_warm: number;
  demoted_to_cold: number;
  promoted_to_hot: number;
  pruned: number;
  scored: number;
  protected_kept: number;
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
    const mode = body.mode || 'standard'; // standard | aggressive | deep
    
    const BATCH_SIZE = mode === 'deep' ? 1000 : mode === 'aggressive' ? 500 : 200;
    const LIMITS = { hot: 500, warm: 2000, cold: 10000 };
    const THRESHOLDS = {
      hot_min: mode === 'aggressive' ? 0.5 : 0.6,
      warm_min: mode === 'aggressive' ? 0.25 : 0.35,
      cold_prune: mode === 'aggressive' ? 0.1 : 0.05,
    };

    console.log(`🧠 Memory Tiering v3.0 [${mode}] - Batch: ${BATCH_SIZE}`);

    const stats: TieringStats = {
      demoted_to_warm: 0,
      demoted_to_cold: 0,
      promoted_to_hot: 0,
      pruned: 0,
      scored: 0,
      protected_kept: 0,
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

    console.log(`📊 Current: Hot=${counts.hot}, Warm=${counts.warm}, Cold=${counts.cold}`);

    // ============================================
    // STEP 1: Score unscored hot memories
    // ============================================
    const { data: unscoredMemories } = await supabase
      .from('brain_memory_hot')
      .select('id, access_count, importance_score, created_at, decay_rate, tags')
      .is('value_score', null)
      .limit(BATCH_SIZE);

    for (const memory of unscoredMemories || []) {
      const isProtected = PROTECTED_MEMORY_TYPES.some(type => 
        (memory.tags as any)?.type === type || (memory.tags as any)?.protected === true
      );
      
      if (isProtected) {
        await supabase.from('brain_memory_hot')
          .update({ value_score: 1.0, decay_rate: 0 })
          .eq('id', memory.id);
        stats.protected_kept++;
        continue;
      }

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

      await supabase.from('brain_memory_hot')
        .update({ value_score: valueScore })
        .eq('id', memory.id);
      stats.scored++;
    }

    // ============================================
    // STEP 2: AGGRESSIVE demotion from hot to warm
    // ============================================
    const targetHotDemotion = Math.max(0, counts.hot - LIMITS.hot);
    if (targetHotDemotion > 0 || mode !== 'standard') {
      const demoteLimit = mode === 'deep' ? Math.max(targetHotDemotion, BATCH_SIZE) : 
                          mode === 'aggressive' ? Math.max(targetHotDemotion, 300) : 
                          Math.min(targetHotDemotion + 100, 200);
      
      // Get low-value non-protected memories
      const { data: toDemote } = await supabase
        .from('brain_memory_hot')
        .select('*')
        .lt('value_score', THRESHOLDS.hot_min)
        .order('value_score', { ascending: true })
        .limit(demoteLimit);

      for (const memory of toDemote || []) {
        // Skip protected memories
        const isProtected = PROTECTED_MEMORY_TYPES.some(type => 
          (memory.tags as any)?.type === type || (memory.tags as any)?.protected === true
        );
        
        if (isProtected) {
          stats.protected_kept++;
          continue;
        }

        try {
          await supabase.from('brain_memory_warm').insert({
            content: memory.content,
            core_summary: (memory.content || '').substring(0, 200),
            embedding: memory.embedding,
            context: memory.context,
            goal_ref: memory.goal_ref,
            priority: memory.priority,
            value_score: memory.value_score || 0.4,
            access_count: memory.access_count || 0,
            decay_rate: 0.01,
            source_memory_id: memory.id,
            tags: memory.tags,
            metadata: { ...memory.metadata, demoted_from: 'hot' },
            demoted_at: new Date().toISOString(),
          });

          await supabase.from('brain_memory_hot').delete().eq('id', memory.id);
          stats.demoted_to_warm++;
        } catch (err) {
          console.error('Demote to warm error:', err);
          stats.errors++;
        }
      }
    }

    // ============================================
    // STEP 3: Demotion from warm to cold
    // ============================================
    const targetWarmDemotion = Math.max(0, (counts.warm + stats.demoted_to_warm) - LIMITS.warm);
    if (targetWarmDemotion > 0 || mode !== 'standard') {
      const demoteLimit = mode === 'deep' ? Math.max(targetWarmDemotion, 500) : 
                          mode === 'aggressive' ? Math.max(targetWarmDemotion, 200) : 
                          Math.min(targetWarmDemotion + 50, 100);
      
      const { data: warmToDemote } = await supabase
        .from('brain_memory_warm')
        .select('*')
        .lt('value_score', THRESHOLDS.warm_min)
        .order('value_score', { ascending: true })
        .limit(demoteLimit);

      for (const memory of warmToDemote || []) {
        try {
          await supabase.from('brain_memory_cold').insert({
            summary: memory.content,
            core_summary: memory.core_summary || (memory.content || '').substring(0, 100),
            embedding: memory.embedding,
            compression_level: 3,
            source_refs: [memory.id],
            tags: { ...(memory.tags || {}), context: memory.context },
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

    // ============================================
    // STEP 4: Prune from cold tier
    // ============================================
    if (mode !== 'standard') {
      const { data: toPrune } = await supabase
        .from('brain_memory_cold')
        .select('id, summary, tags, value_score')
        .lt('value_score', THRESHOLDS.cold_prune)
        .limit(mode === 'deep' ? 500 : 200);

      for (const memory of toPrune || []) {
        try {
          await supabase.from('brain_memory_pruned').insert({
            original_memory_id: memory.id,
            original_tier: 'cold',
            content_preview: (memory.summary || '').substring(0, 200),
            context: (memory.tags as any)?.context || 'unknown',
            value_score: memory.value_score,
            prune_reason: 'low_value_score',
          });

          await supabase.from('brain_memory_cold').delete().eq('id', memory.id);
          stats.pruned++;
        } catch (err) {
          stats.errors++;
        }
      }
    }

    // ============================================
    // STEP 5: Prune noise patterns from hot
    // ============================================
    const noisePatterns = [
      '%diagnostic%', '%test cycle%', '%heartbeat%', 
      '%status check%', '%ping%', '%health check%',
      '%token consumption%', '%quota%'
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
            content_preview: (memory.content || '').substring(0, 200),
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

    // ============================================
    // STEP 6: Promote high-value warm to hot (if room)
    // ============================================
    const newHotCount = counts.hot - stats.demoted_to_warm;
    const slotsAvailable = LIMITS.hot - newHotCount;
    
    if (slotsAvailable > 10) {
      const { data: toPromote } = await supabase
        .from('brain_memory_warm')
        .select('*')
        .gte('value_score', 0.75)
        .order('value_score', { ascending: false })
        .limit(Math.min(50, slotsAvailable));

      for (const memory of toPromote || []) {
        try {
          await supabase.from('brain_memory_hot').insert({
            content: memory.content,
            embedding: memory.embedding,
            context: memory.context,
            goal_ref: memory.goal_ref,
            priority: 'high',
            importance_score: memory.value_score,
            value_score: memory.value_score,
            access_count: memory.access_count,
            decay_rate: 0.02,
            tags: memory.tags,
            metadata: { ...memory.metadata, promoted_from: 'warm' },
            last_used: new Date().toISOString(),
          });

          await supabase.from('brain_memory_warm').delete().eq('id', memory.id);
          stats.promoted_to_hot++;
        } catch (err) {
          stats.errors++;
        }
      }
    }

    // Log event
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'memory_tiering_v3',
      data: {
        mode,
        stats,
        duration_ms: Date.now() - startTime,
        before: counts,
        after: {
          hot: counts.hot - stats.demoted_to_warm + stats.promoted_to_hot - stats.pruned,
          warm: counts.warm + stats.demoted_to_warm - stats.demoted_to_cold - stats.promoted_to_hot,
          cold: counts.cold + stats.demoted_to_cold - stats.pruned,
        },
      },
      outcome: stats.errors === 0 ? 'success' : 'partial',
    });

    console.log('✅ Memory tiering complete:', stats);

    return new Response(JSON.stringify({
      success: true,
      mode,
      stats,
      duration_ms: Date.now() - startTime,
      message: `Tiering complete: ${stats.demoted_to_warm} → warm, ${stats.demoted_to_cold} → cold, ${stats.pruned} pruned, ${stats.protected_kept} protected`
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
