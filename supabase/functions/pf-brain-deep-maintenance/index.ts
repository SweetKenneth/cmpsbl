/**
 * pf-brain-deep-maintenance — Autonomous Brain/Memory Optimization
 * ─────────────────────────────────────────────────────────────────
 * Performs aggressive tiering, pruning, crystal formation, graph
 * population, and event hygiene across all brain subsystems.
 * 
 * Designed to run on a 6-hour cron cycle for hands-off optimization.
 * 
 * Phases:
 *   1. AUDIT      — Snapshot all tier counts + bloat metrics
 *   2. PRUNE      — Remove stale brain_events, old pruned entries
 *   3. TIER       — Aggressively demote HOT → WARM → COLD → ARCHIVE
 *   4. CRYSTALLIZE — Form knowledge crystals from high-value clusters
 *   5. GRAPH      — Populate brain_graph_nodes + edges from crystals
 *   6. DREAM      — Trigger reflection + cross-insight generation
 *   7. REPORT     — Log maintenance report
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  corsHeaders,
  createAdminClient,
} from "../_shared/edge-middleware.ts";

const TIME_BUDGET_MS = 140_000;

// ── Tier capacity limits ──
const HOT_LIMIT = 500;
const WARM_LIMIT = 10_000;
const COLD_LIMIT = 10_000;
const PRUNED_MAX = 2_000;
const EVENTS_RETAIN_DAYS = 7;
const REFLECTION_LOG_RETAIN_DAYS = 30;
const LEARNING_LOG_RETAIN_DAYS = 30;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase = createAdminClient();
  const report: Record<string, unknown> = { started_at: new Date().toISOString(), phases: {} };

  function elapsed() { return Date.now() - startTime; }
  function timeLeft() { return elapsed() < TIME_BUDGET_MS; }

  try {
    // ═══════════════════════════════════════════════════
    // PHASE 1: AUDIT — Snapshot current state
    // ═══════════════════════════════════════════════════
    const [hotRes, warmRes, coldRes, archiveRes, prunedRes, eventsRes, crystalsRes, graphNodesRes, graphEdgesRes] = await Promise.all([
      supabase.from("brain_memory_hot").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_warm").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_cold").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_archive").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_pruned").select("*", { count: "exact", head: true }),
      supabase.from("brain_events").select("*", { count: "exact", head: true }),
      supabase.from("brain_knowledge_crystals").select("*", { count: "exact", head: true }),
      supabase.from("brain_graph_nodes").select("*", { count: "exact", head: true }),
      supabase.from("brain_graph_edges").select("*", { count: "exact", head: true }),
    ]);

    const audit = {
      hot: hotRes.count || 0,
      warm: warmRes.count || 0,
      cold: coldRes.count || 0,
      archive: archiveRes.count || 0,
      pruned: prunedRes.count || 0,
      events: eventsRes.count || 0,
      crystals: crystalsRes.count || 0,
      graph_nodes: graphNodesRes.count || 0,
      graph_edges: graphEdgesRes.count || 0,
    };
    report.phases = { audit };
    console.log(`[DeepMaint] AUDIT: HOT=${audit.hot} WARM=${audit.warm} COLD=${audit.cold} ARCHIVE=${audit.archive} EVENTS=${audit.events} CRYSTALS=${audit.crystals}`);

    // ═══════════════════════════════════════════════════
    // PHASE 2: PRUNE — Aggressive event/log hygiene
    // ═══════════════════════════════════════════════════
    let eventsPruned = 0;
    let reflectionsPruned = 0;
    let learningLogsPruned = 0;
    let prunedTableCleaned = 0;

    if (timeLeft()) {
      const eventCutoff = new Date(Date.now() - EVENTS_RETAIN_DAYS * 86400_000).toISOString();
      
      // Delete old brain_events in batches to avoid memory spikes
      let batchCount = 0;
      while (timeLeft() && batchCount < 50) {
        const { data: oldEvents } = await supabase
          .from("brain_events")
          .select("id")
          .lt("created_at", eventCutoff)
          .limit(1000);

        if (!oldEvents?.length) break;
        const ids = oldEvents.map((e: any) => e.id);
        await supabase.from("brain_events").delete().in("id", ids);
        eventsPruned += ids.length;
        batchCount++;
      }

      // Prune old reflection_log
      if (timeLeft()) {
        const reflCutoff = new Date(Date.now() - REFLECTION_LOG_RETAIN_DAYS * 86400_000).toISOString();
        let rBatch = 0;
        while (timeLeft() && rBatch < 10) {
          const { data: oldRefl } = await supabase
            .from("brain_reflection_log")
            .select("id")
            .lt("created_at", reflCutoff)
            .limit(1000);

          if (!oldRefl?.length) break;
          await supabase.from("brain_reflection_log").delete().in("id", oldRefl.map((r: any) => r.id));
          reflectionsPruned += oldRefl.length;
          rBatch++;
        }
      }

      // Prune old learning_logs
      if (timeLeft()) {
        const learnCutoff = new Date(Date.now() - LEARNING_LOG_RETAIN_DAYS * 86400_000).toISOString();
        let lBatch = 0;
        while (timeLeft() && lBatch < 10) {
          const { data: oldLogs } = await supabase
            .from("learning_logs")
            .select("id")
            .lt("created_at", learnCutoff)
            .limit(1000);

          if (!oldLogs?.length) break;
          await supabase.from("learning_logs").delete().in("id", oldLogs.map((l: any) => l.id));
          learningLogsPruned += oldLogs.length;
          lBatch++;
        }
      }

      // Cap pruned table
      if (timeLeft() && audit.pruned > PRUNED_MAX) {
        const excess = audit.pruned - PRUNED_MAX;
        const { data: oldPruned } = await supabase
          .from("brain_memory_pruned")
          .select("id")
          .order("pruned_at", { ascending: true })
          .limit(Math.min(excess, 2000));
        
        if (oldPruned?.length) {
          for (let i = 0; i < oldPruned.length; i += 500) {
            await supabase.from("brain_memory_pruned").delete().in("id", oldPruned.slice(i, i + 500).map((r: any) => r.id));
          }
          prunedTableCleaned = oldPruned.length;
        }
      }

      (report.phases as any).prune = { eventsPruned, reflectionsPruned, learningLogsPruned, prunedTableCleaned };
      console.log(`[DeepMaint] PRUNE: events=${eventsPruned} reflections=${reflectionsPruned} learning_logs=${learningLogsPruned} pruned_table=${prunedTableCleaned}`);
    }

    // ═══════════════════════════════════════════════════
    // PHASE 3: TIER — Aggressive HOT → WARM → COLD demotion
    // ═══════════════════════════════════════════════════
    let hotDemoted = 0;
    let warmDemoted = 0;
    let coldArchived = 0;

    if (timeLeft() && audit.hot > HOT_LIMIT) {
      const excess = audit.hot - HOT_LIMIT;
      // Demote lowest-value HOT entries to WARM
      const { data: hotToDemote } = await supabase
        .from("brain_memory_hot")
        .select("*")
        .order("value_score", { ascending: true })
        .order("access_count", { ascending: true })
        .limit(Math.min(excess + Math.floor(excess * 0.2), 2000));  // demote extra 20%

      for (const mem of hotToDemote || []) {
        if (!timeLeft()) break;
        try {
          await supabase.from("brain_memory_warm").insert({
            content: mem.content,
            context: mem.context,
            priority: mem.priority,
            access_count: mem.access_count || 0,
            value_score: Math.max(0.1, (mem.value_score || 0.5) * 0.9),
            importance_score: mem.importance_score,
            source_module: mem.source_module,
            category: mem.category,
            memory_type: mem.memory_type,
            tags: mem.tags,
            metadata: { ...(mem.metadata || {}), demoted_from: "hot", demoted_at: new Date().toISOString() },
          });
          await supabase.from("brain_memory_hot").delete().eq("id", mem.id);
          hotDemoted++;
        } catch { /* skip dupes */ }
      }
    }

    if (timeLeft() && (audit.warm + hotDemoted) > WARM_LIMIT) {
      const warmTotal = audit.warm + hotDemoted;
      const excess = warmTotal - WARM_LIMIT;
      
      const { data: warmToDemote } = await supabase
        .from("brain_memory_warm")
        .select("*")
        .order("value_score", { ascending: true })
        .order("access_count", { ascending: true })
        .limit(Math.min(excess + Math.floor(excess * 0.1), 2000));

      for (const mem of warmToDemote || []) {
        if (!timeLeft()) break;
        try {
          await supabase.from("brain_memory_cold").insert({
            content: mem.content,
            context: mem.context,
            priority: mem.priority,
            access_count: mem.access_count || 0,
            value_score: Math.max(0.05, (mem.value_score || 0.3) * 0.8),
            importance_score: mem.importance_score,
            source_module: mem.source_module,
            category: mem.category,
            memory_type: mem.memory_type,
            tags: mem.tags,
            metadata: { ...(mem.metadata || {}), demoted_from: "warm", demoted_at: new Date().toISOString() },
          });
          await supabase.from("brain_memory_warm").delete().eq("id", mem.id);
          warmDemoted++;
        } catch { /* skip */ }
      }
    }

    // Archive lowest-value COLD if over capacity
    if (timeLeft() && audit.cold > COLD_LIMIT) {
      const excess = audit.cold - COLD_LIMIT;
      const { data: coldToArchive } = await supabase
        .from("brain_memory_cold")
        .select("id, content, value_score, source_module, category")
        .order("value_score", { ascending: true })
        .limit(Math.min(excess + 500, 2000));

      for (const mem of coldToArchive || []) {
        if (!timeLeft()) break;
        try {
          await supabase.from("brain_memory_pruned").insert({
            original_memory_id: mem.id,
            original_tier: "cold",
            content_summary: (mem.content || "").substring(0, 200),
            pruned_at: new Date().toISOString(),
            prune_reason: "auto_deep_maintenance",
          });
          await supabase.from("brain_memory_cold").delete().eq("id", mem.id);
          coldArchived++;
        } catch { /* skip */ }
      }
    }

    (report.phases as any).tier = { hotDemoted, warmDemoted, coldArchived };
    console.log(`[DeepMaint] TIER: hot_demoted=${hotDemoted} warm_demoted=${warmDemoted} cold_archived=${coldArchived}`);

    // ═══════════════════════════════════════════════════
    // PHASE 4: CRYSTALLIZE — Form knowledge crystals from high-value memories
    // ═══════════════════════════════════════════════════
    let crystalsFormed = 0;

    if (timeLeft()) {
      // Get the 40 substrate modules for crystal formation
      const modules = [
        "CORE", "BRAIN", "MEMORY", "NERVE", "DECODE", "ENCODE", "CORTEX",
        "DEFENSE", "ORACLE", "CONSCIENCE", "PHANTOM", "HARVEST", "EVOLUTION",
        "SHADOW", "IMMUNITY", "INTENT", "GOVERNANCE", "ATLAS", "FORGE",
        "LINGUA", "ECHO", "SOVEREIGN", "REFLEX", "TREATY", "ENGINEER",
        "COMPASS", "OBSERVER", "NEXUS", "RELAY", "VISION", "DREAM",
        "SPINE", "RIPPLE", "INCLUSIVE", "INTEGRATION", "ACCESS", "RADIO",
        "CODELAB", "PIONEER", "SENTINEL"
      ];

      for (const mod of modules) {
        if (!timeLeft()) break;
        
        // Find high-value memories per module that aren't already crystallized
        const { data: highValueMems } = await supabase
          .from("brain_memory_hot")
          .select("id, content, value_score, context, category")
          .eq("source_module", mod)
          .gte("value_score", 0.6)
          .order("value_score", { ascending: false })
          .limit(10);

        if (!highValueMems?.length || highValueMems.length < 2) continue;

        // Check if crystal already exists for this module recently
        const recentCutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
        const { count: recentCrystals } = await supabase
          .from("brain_knowledge_crystals")
          .select("*", { count: "exact", head: true })
          .eq("source_module", mod)
          .gte("created_at", recentCutoff);

        if ((recentCrystals || 0) >= 2) continue;

        // Distill into a crystal
        const contentSnippets = highValueMems.map((m: any) => m.content?.substring(0, 150)).filter(Boolean);
        const distilled = `[${mod}] Consolidated knowledge from ${highValueMems.length} high-value memories: ${contentSnippets.join(" | ")}`;
        const avgScore = highValueMems.reduce((s: number, m: any) => s + (m.value_score || 0), 0) / highValueMems.length;

        try {
          await supabase.from("brain_knowledge_crystals").insert({
            crystal_type: "auto_distillation",
            title: `${mod} Knowledge Crystal — Auto Maintenance`,
            distilled_content: distilled.substring(0, 2000),
            source_memory_ids: highValueMems.map((m: any) => m.id),
            source_tier: "hot",
            source_module: mod,
            source_count: highValueMems.length,
            compression_ratio: Math.round(highValueMems.length * 150 / distilled.length * 10) / 10,
            confidence: Math.round(avgScore * 100) / 100,
            domain: mod.toLowerCase(),
            tags: [mod.toLowerCase(), "auto-maintenance", "distilled"],
          });
          crystalsFormed++;
        } catch { /* skip dupes */ }
      }

      (report.phases as any).crystallize = { crystalsFormed };
      console.log(`[DeepMaint] CRYSTALLIZE: formed=${crystalsFormed}`);
    }

    // ═══════════════════════════════════════════════════
    // PHASE 5: GRAPH — Populate knowledge graph nodes + edges
    // ═══════════════════════════════════════════════════
    let graphNodesCreated = 0;
    let graphEdgesCreated = 0;

    if (timeLeft()) {
      // Create graph nodes from crystals that don't have nodes yet
      const { data: ungraphedCrystals } = await supabase
        .from("brain_knowledge_crystals")
        .select("id, title, source_module, domain, confidence, crystal_type, distilled_content")
        .order("created_at", { ascending: false })
        .limit(100);

      const existingNodeSourceIds = new Set<string>();
      if (ungraphedCrystals?.length) {
        const { data: existingNodes } = await supabase
          .from("brain_graph_nodes")
          .select("source_id")
          .in("source_id", ungraphedCrystals.map((c: any) => c.id));
        
        for (const n of existingNodes || []) {
          existingNodeSourceIds.add(n.source_id);
        }
      }

      for (const crystal of ungraphedCrystals || []) {
        if (!timeLeft()) break;
        if (existingNodeSourceIds.has(crystal.id)) continue;

        try {
          const { data: newNode } = await supabase.from("brain_graph_nodes").insert({
            node_type: "crystal",
            label: crystal.title?.substring(0, 100),
            description: crystal.distilled_content?.substring(0, 300),
            memory_tier: "crystal",
            source_id: crystal.id,
            weight: crystal.confidence || 0.5,
            centrality_score: 0,
            cluster_id: crystal.source_module || crystal.domain || "general",
            attributes: {
              crystal_type: crystal.crystal_type,
              domain: crystal.domain,
              module: crystal.source_module,
            },
          }).select("id").single();

          if (newNode) graphNodesCreated++;
        } catch { /* skip */ }
      }

      // Create edges between crystals in same module (domain clustering)
      if (timeLeft() && graphNodesCreated > 0) {
        const { data: allNodes } = await supabase
          .from("brain_graph_nodes")
          .select("id, cluster_id, weight")
          .order("created_at", { ascending: false })
          .limit(200);

        const byCluster: Record<string, any[]> = {};
        for (const node of allNodes || []) {
          const cluster = node.cluster_id || "general";
          (byCluster[cluster] ??= []).push(node);
        }

        for (const [_cluster, nodes] of Object.entries(byCluster)) {
          if (!timeLeft()) break;
          if (nodes.length < 2) continue;

          // Create edges between top nodes in each cluster
          for (let i = 0; i < Math.min(nodes.length - 1, 5); i++) {
            for (let j = i + 1; j < Math.min(nodes.length, 6); j++) {
              try {
                // Check if edge exists
                const { count } = await supabase
                  .from("brain_graph_edges")
                  .select("*", { count: "exact", head: true })
                  .eq("source_node_id", nodes[i].id)
                  .eq("target_node_id", nodes[j].id);

                if ((count || 0) === 0) {
                  await supabase.from("brain_graph_edges").insert({
                    source_node_id: nodes[i].id,
                    target_node_id: nodes[j].id,
                    edge_type: "domain_affinity",
                    weight: Math.min(nodes[i].weight, nodes[j].weight),
                    metadata: { auto_generated: true },
                  });
                  graphEdgesCreated++;
                }
              } catch { /* skip */ }
            }
          }
        }
      }

      (report.phases as any).graph = { graphNodesCreated, graphEdgesCreated };
      console.log(`[DeepMaint] GRAPH: nodes=${graphNodesCreated} edges=${graphEdgesCreated}`);
    }

    // ═══════════════════════════════════════════════════
    // PHASE 6: DREAM — Generate cross-insights + reflections
    // ═══════════════════════════════════════════════════
    let crossInsightsGenerated = 0;

    if (timeLeft()) {
      // Find modules with lots of HOT memories and generate cross-insights
      const { data: hotByModule } = await supabase
        .from("brain_memory_hot")
        .select("source_module")
        .not("source_module", "is", null);

      const moduleCounts: Record<string, number> = {};
      for (const m of hotByModule || []) {
        moduleCounts[m.source_module] = (moduleCounts[m.source_module] || 0) + 1;
      }

      const topModules = Object.entries(moduleCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([m]) => m);

      // Generate cross-insights between top modules
      for (let i = 0; i < topModules.length - 1 && timeLeft(); i++) {
        for (let j = i + 1; j < Math.min(topModules.length, i + 3) && timeLeft(); j++) {
          const modA = topModules[i];
          const modB = topModules[j];

          // Check if recent cross-insight exists
          const { count: existingInsight } = await supabase
            .from("brain_cross_insights")
            .select("*", { count: "exact", head: true })
            .contains("modules", [modA, modB])
            .gte("created_at", new Date(Date.now() - 24 * 3600_000).toISOString());

          if ((existingInsight || 0) > 0) continue;

          try {
            await supabase.from("brain_cross_insights").insert({
              modules: [modA, modB],
              insight_type: "auto_correlation",
              content: `Cross-domain pattern detected between ${modA} (${moduleCounts[modA]} hot memories) and ${modB} (${moduleCounts[modB]} hot memories). High activity correlation suggests knowledge transfer opportunity.`,
              confidence: Math.min(0.85, (moduleCounts[modA] + moduleCounts[modB]) / 200),
              metadata: { 
                auto_generated: true, 
                hot_counts: { [modA]: moduleCounts[modA], [modB]: moduleCounts[modB] }
              },
            });
            crossInsightsGenerated++;
          } catch { /* skip */ }
        }
      }

      (report.phases as any).dream = { crossInsightsGenerated };
      console.log(`[DeepMaint] DREAM: cross_insights=${crossInsightsGenerated}`);
    }

    // ═══════════════════════════════════════════════════
    // PHASE 7: UPDATE META + REPORT
    // ═══════════════════════════════════════════════════

    // Update brain_memory_meta with accurate counts
    const [finalHot, finalWarm, finalCold] = await Promise.all([
      supabase.from("brain_memory_hot").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_warm").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_cold").select("*", { count: "exact", head: true }),
    ]);

    // Update meta record
    await supabase.from("brain_memory_meta")
      .update({
        hot_count: finalHot.count || 0,
        warm_count: finalWarm.count || 0,
        cold_count: finalCold.count || 0,
        last_tiering_run: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("agent_id", "substrate")
      .not("id", "is", null);

    report.duration_ms = elapsed();
    report.completed_at = new Date().toISOString();
    report.final_counts = {
      hot: finalHot.count || 0,
      warm: finalWarm.count || 0,
      cold: finalCold.count || 0,
    };

    // Log maintenance run
    await supabase.from("brain_maintenance_log").insert({
      task_type: "deep_maintenance",
      status: "completed",
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: elapsed(),
      details: report,
    });

    // Log as brain event
    await supabase.from("brain_events").insert({
      event_type: "deep_maintenance_complete",
      module: "brain",
      outcome: "success",
      details: {
        events_pruned: eventsPruned,
        hot_demoted: hotDemoted,
        warm_demoted: warmDemoted,
        cold_archived: coldArchived,
        crystals_formed: crystalsFormed,
        graph_nodes: graphNodesCreated,
        graph_edges: graphEdgesCreated,
        cross_insights: crossInsightsGenerated,
        duration_ms: elapsed(),
      },
    });

    console.log(`[DeepMaint] COMPLETE in ${elapsed()}ms`);

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[DeepMaint] Fatal:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
