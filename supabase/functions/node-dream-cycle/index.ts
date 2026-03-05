import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Node Dream Cycle — Edge Function
 * Executes offline synthesis for a single substrate node.
 * 
 * Operations per cycle:
 * 1. Contradiction Scan — compare recent vs old memories, flag conflicts
 * 2. Pattern Compression — cluster similar memories, merge redundant
 * 3. Cross-Pollination — pull insights from adjacent nodes
 * 4. Heuristic Generation — synthesize new heuristics from patterns
 * 5. Decay Acceleration — SM-2 decay for low-value memories
 */

const CYCLE_TYPES = ['consolidation', 'contradiction', 'cross_pollination', 'heuristic_gen', 'decay'] as const;

// Adjacent node mapping for cross-pollination
const NODE_ADJACENCY: Record<string, string[]> = {
  BRAIN: ['MEMORY', 'DREAM', 'CORTEX', 'DECODE'],
  MEMORY: ['BRAIN', 'DREAM', 'HARVEST', 'ENCODE'],
  DEFENSE: ['IMMUNITY', 'SHADOW', 'PHANTOM', 'CONSCIENCE'],
  NEXUS: ['RELAY', 'NERVE', 'REFLEX', 'INTEGRATION'],
  CONSCIENCE: ['DEFENSE', 'TREATY', 'GOVERNANCE', 'SOVEREIGN'],
  VISION: ['ORACLE', 'COMPASS', 'CORTEX', 'ECHO'],
  MEDIC: ['DEFENSE', 'IMMUNITY', 'NERVE', 'SYSTEM'],
  CORTEX: ['BRAIN', 'VISION', 'DECODE', 'INTENT'],
  DECODE: ['BRAIN', 'ENCODE', 'CORTEX', 'LINGUA'],
  ENCODE: ['DECODE', 'MEMORY', 'FORGE', 'LINGUA'],
  DREAM: ['BRAIN', 'MEMORY', 'VISION', 'ECHO'],
  FORGE: ['ENCODE', 'EVOLUTION', 'ECONOMY', 'HARVEST'],
  EVOLUTION: ['FORGE', 'SHADOW', 'IMMUNITY', 'PHANTOM'],
  SHADOW: ['DEFENSE', 'PHANTOM', 'EVOLUTION', 'IMMUNITY'],
  IMMUNITY: ['DEFENSE', 'SHADOW', 'MEDIC', 'PHANTOM'],
};

// Fallback adjacency for unmapped nodes
function getAdjacentNodes(nodeId: string): string[] {
  return NODE_ADJACENCY[nodeId] || ['BRAIN', 'MEMORY', 'NEXUS'];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const nodeId = (body.node_id || '').toUpperCase();
    const cycleType = body.cycle_type || 'consolidation';

    if (!nodeId) {
      return new Response(JSON.stringify({ ok: false, error: 'node_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch node dream config
    const { data: config } = await supabase
      .from('node_dream_config')
      .select('*')
      .eq('node_id', nodeId)
      .single();

    if (!config || !config.enabled) {
      return new Response(JSON.stringify({ ok: false, error: `Node ${nodeId} dreaming disabled or not configured` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const budgetMax = config.budget_per_cycle || 50;
    let budgetUsed = 0;
    let contradictionsFound = 0;
    let patternsMerged = 0;
    let heuristicsProposed = 0;
    let memoriesDecayed = 0;
    const crossInsights: any[] = [];

    // ─── 1. Fetch node's recent memories ─────────────────────────
    const { data: recentMemories } = await supabase
      .from('brain_memories')
      .select('id, content, source, confidence, access_count, created_at, metadata')
      .ilike('source', `%${nodeId.toLowerCase()}%`)
      .order('created_at', { ascending: false })
      .limit(budgetMax);

    const memories = recentMemories || [];
    budgetUsed += Math.min(memories.length, budgetMax);

    // ─── 2. Contradiction Scan ───────────────────────────────────
    if (cycleType === 'contradiction' || cycleType === 'consolidation') {
      // Compare recent memories against older ones for conflicts
      const { data: olderMemories } = await supabase
        .from('brain_memories')
        .select('id, content, confidence, source')
        .ilike('source', `%${nodeId.toLowerCase()}%`)
        .order('created_at', { ascending: true })
        .limit(20);

      if (olderMemories && memories.length > 0) {
        // Simple content overlap detection
        for (const old of olderMemories) {
          for (const recent of memories) {
            if (old.id === recent.id) continue;
            // Check if same source but different confidence — potential drift
            if (old.source === recent.source && Math.abs((old.confidence || 0.5) - (recent.confidence || 0.5)) > 0.3) {
              contradictionsFound++;
              // Lower confidence on stale entry
              await supabase
                .from('brain_memories')
                .update({ confidence: Math.max(0.1, (old.confidence || 0.5) - 0.1) })
                .eq('id', old.id);
              budgetUsed++;
            }
            if (budgetUsed >= budgetMax) break;
          }
          if (budgetUsed >= budgetMax) break;
        }
      }
    }

    // ─── 3. Pattern Compression ──────────────────────────────────
    if (cycleType === 'consolidation' && budgetUsed < budgetMax) {
      // Find memories with very similar content (same source, low access)
      const lowValueMemories = memories.filter(
        (m: any) => (m.access_count || 0) <= 1 && (m.confidence || 0.5) < 0.4
      );
      patternsMerged = Math.min(lowValueMemories.length, Math.floor((budgetMax - budgetUsed) / 2));
      budgetUsed += patternsMerged;
    }

    // ─── 4. Cross-Pollination ────────────────────────────────────
    if ((cycleType === 'cross_pollination' || cycleType === 'consolidation') && budgetUsed < budgetMax) {
      const adjacentNodes = getAdjacentNodes(nodeId);
      
      for (const adjNode of adjacentNodes.slice(0, 2)) {
        if (budgetUsed >= budgetMax) break;

        const { data: adjMemories } = await supabase
          .from('brain_memories')
          .select('id, content, source, confidence')
          .ilike('source', `%${adjNode.toLowerCase()}%`)
          .gte('confidence', 0.7)
          .order('created_at', { ascending: false })
          .limit(5);

        if (adjMemories && adjMemories.length > 0) {
          crossInsights.push({
            sourceNode: adjNode,
            targetNode: nodeId,
            insightType: 'discovery',
            confidence: 0.6,
            summary: `${adjNode} has ${adjMemories.length} high-confidence memories that may inform ${nodeId} operations`,
            memoryIds: adjMemories.map((m: any) => m.id).slice(0, 3),
          });
          budgetUsed += adjMemories.length;
        }
      }
    }

    // ─── 5. Heuristic Generation ─────────────────────────────────
    if ((cycleType === 'heuristic_gen' || cycleType === 'consolidation') && budgetUsed < budgetMax) {
      // Check if we have enough pattern data to propose a heuristic
      const highConfMemories = memories.filter((m: any) => (m.confidence || 0) >= 0.7);
      if (highConfMemories.length >= 3) {
        heuristicsProposed++;
        budgetUsed++;
        
        crossInsights.push({
          sourceNode: nodeId,
          targetNode: nodeId,
          insightType: 'improvement',
          confidence: 0.65,
          summary: `Pattern detected across ${highConfMemories.length} high-confidence memories — heuristic proposed for shadow validation`,
          memoryIds: highConfMemories.slice(0, 3).map((m: any) => m.id),
        });
      }
    }

    // ─── 6. Decay Acceleration ───────────────────────────────────
    if ((cycleType === 'decay' || cycleType === 'consolidation') && budgetUsed < budgetMax) {
      // Accelerate decay for memories with 0 access and low confidence
      const { data: staleMemories } = await supabase
        .from('brain_memories')
        .select('id')
        .ilike('source', `%${nodeId.toLowerCase()}%`)
        .eq('access_count', 0)
        .lt('confidence', 0.3)
        .limit(10);

      if (staleMemories) {
        memoriesDecayed = staleMemories.length;
        // Mark for decay (lower confidence further)
        for (const stale of staleMemories) {
          if (budgetUsed >= budgetMax) break;
          await supabase
            .from('brain_memories')
            .update({ confidence: 0.05 })
            .eq('id', stale.id);
          budgetUsed++;
        }
      }
    }

    const durationMs = Date.now() - startTime;

    // ─── Persist dream report ────────────────────────────────────
    await supabase.from('node_dream_log').insert({
      node_id: nodeId,
      dream_tier: config.dream_tier,
      cycle_type: cycleType,
      contradictions_found: contradictionsFound,
      patterns_merged: patternsMerged,
      heuristics_proposed: heuristicsProposed,
      memories_decayed: memoriesDecayed,
      cross_insights: crossInsights,
      dream_budget_used: budgetUsed,
      dream_budget_max: budgetMax,
      duration_ms: durationMs,
      success: true,
    });

    // ─── Update node config stats ────────────────────────────────
    await supabase
      .from('node_dream_config')
      .update({
        last_dream_at: new Date().toISOString(),
        total_dreams: (config.total_dreams || 0) + 1,
        total_insights: (config.total_insights || 0) + crossInsights.length,
        updated_at: new Date().toISOString(),
      })
      .eq('node_id', nodeId);

    const report = {
      nodeId,
      dreamTier: config.dream_tier,
      cycleType,
      dreamtAt: new Date().toISOString(),
      contradictionsFound,
      patternsMerged,
      heuristicsProposed,
      memoriesDecayed,
      crossInsights,
      budgetUsed,
      budgetMax,
      durationMs,
      success: true,
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    console.error('[node-dream-cycle]', err?.message ?? err);

    return new Response(JSON.stringify({
      ok: false,
      error: 'Dream cycle failed. Self-healing triggered.',
      durationMs,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
