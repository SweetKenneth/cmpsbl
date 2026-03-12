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
 *   7. REPORT     — Log maintenance report + update meta
 */

import {
  corsHeaders,
  createAdminClient,
} from "../_shared/edge-middleware.ts";

// ── Time budget ──
const TIME_BUDGET_MS = 140_000;

// ── Tier capacity limits ──
const HOT_LIMIT   = 500;
const WARM_LIMIT  = 10_000;
const COLD_LIMIT  = 10_000;
const PRUNED_MAX  = 2_000;

// ── Retention windows ──
const EVENTS_RETAIN_DAYS          = 7;
const REFLECTION_LOG_RETAIN_DAYS  = 30;
const LEARNING_LOG_RETAIN_DAYS    = 30;

// ── Batch sizes ──
const DELETE_BATCH     = 1000;
const MAX_EVENT_PASSES = 50;
const MAX_LOG_PASSES   = 10;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabase  = createAdminClient();

  const report: Record<string, unknown> = {
    started_at: new Date().toISOString(),
    phases: {},
  };

  const elapsed  = () => Date.now() - startTime;
  const timeLeft = () => elapsed() < TIME_BUDGET_MS;

  try {
    // ═══════════════════════════════════════════════════
    // PHASE 1: AUDIT — Snapshot current state
    // ═══════════════════════════════════════════════════
    const countOf = (r: { count: number | null }) => r.count ?? 0;

    const [hotR, warmR, coldR, archR, prunedR, eventsR, crystalsR, gNodesR, gEdgesR] =
      await Promise.all([
        supabase.from("brain_memory_hot").select("*",    { count: "exact", head: true }),
        supabase.from("brain_memory_warm").select("*",   { count: "exact", head: true }),
        supabase.from("brain_memory_cold").select("*",   { count: "exact", head: true }),
        supabase.from("brain_memory_archive").select("*",{ count: "exact", head: true }),
        supabase.from("brain_memory_pruned").select("*", { count: "exact", head: true }),
        supabase.from("brain_events").select("*",        { count: "exact", head: true }),
        supabase.from("brain_knowledge_crystals").select("*", { count: "exact", head: true }),
        supabase.from("brain_graph_nodes").select("*",   { count: "exact", head: true }),
        supabase.from("brain_graph_edges").select("*",   { count: "exact", head: true }),
      ]);

    const audit = {
      hot:         countOf(hotR),
      warm:        countOf(warmR),
      cold:        countOf(coldR),
      archive:     countOf(archR),
      pruned:      countOf(prunedR),
      events:      countOf(eventsR),
      crystals:    countOf(crystalsR),
      graph_nodes: countOf(gNodesR),
      graph_edges: countOf(gEdgesR),
    };
    (report.phases as any).audit = audit;
    console.log(
      `[DeepMaint] AUDIT: HOT=${audit.hot} WARM=${audit.warm} COLD=${audit.cold} ` +
      `ARCHIVE=${audit.archive} EVENTS=${audit.events} CRYSTALS=${audit.crystals} ` +
      `GRAPH_N=${audit.graph_nodes} GRAPH_E=${audit.graph_edges}`,
    );

    // ═══════════════════════════════════════════════════
    // PHASE 2: PRUNE — Aggressive event / log hygiene
    // ═══════════════════════════════════════════════════
    let eventsPruned       = 0;
    let reflectionsPruned  = 0;
    let learningLogsPruned = 0;
    let prunedTableCleaned = 0;

    // Helper: batch-delete rows older than cutoff
    async function batchPrune(
      table: string,
      cutoff: string,
      maxPasses: number,
    ): Promise<number> {
      let pruned = 0;
      let pass   = 0;
      while (timeLeft() && pass < maxPasses) {
        const { data } = await supabase
          .from(table)
          .select("id")
          .lt("created_at", cutoff)
          .limit(DELETE_BATCH);

        if (!data?.length) break;
        const ids = data.map((r: any) => r.id);
        await supabase.from(table).delete().in("id", ids);
        pruned += ids.length;
        pass++;
      }
      return pruned;
    }

    if (timeLeft()) {
      const eventCutoff = new Date(Date.now() - EVENTS_RETAIN_DAYS * 86_400_000).toISOString();
      eventsPruned = await batchPrune("brain_events", eventCutoff, MAX_EVENT_PASSES);
    }

    if (timeLeft()) {
      const reflCutoff = new Date(Date.now() - REFLECTION_LOG_RETAIN_DAYS * 86_400_000).toISOString();
      reflectionsPruned = await batchPrune("brain_reflection_log", reflCutoff, MAX_LOG_PASSES);
    }

    if (timeLeft()) {
      const learnCutoff = new Date(Date.now() - LEARNING_LOG_RETAIN_DAYS * 86_400_000).toISOString();
      learningLogsPruned = await batchPrune("learning_logs", learnCutoff, MAX_LOG_PASSES);
    }

    // Cap pruned table at PRUNED_MAX
    if (timeLeft() && audit.pruned > PRUNED_MAX) {
      const excess = audit.pruned - PRUNED_MAX;
      const { data: oldPruned } = await supabase
        .from("brain_memory_pruned")
        .select("id")
        .order("created_at", { ascending: true })    // oldest first (no pruned_at col)
        .limit(Math.min(excess, 2000));

      if (oldPruned?.length) {
        for (let i = 0; i < oldPruned.length; i += 500) {
          const chunk = oldPruned.slice(i, i + 500).map((r: any) => r.id);
          await supabase.from("brain_memory_pruned").delete().in("id", chunk);
        }
        prunedTableCleaned = oldPruned.length;
      }
    }

    (report.phases as any).prune = { eventsPruned, reflectionsPruned, learningLogsPruned, prunedTableCleaned };
    console.log(
      `[DeepMaint] PRUNE: events=${eventsPruned} reflections=${reflectionsPruned} ` +
      `learning_logs=${learningLogsPruned} pruned_table=${prunedTableCleaned}`,
    );

    // ═══════════════════════════════════════════════════
    // PHASE 3: TIER — Aggressive HOT → WARM → COLD
    // ═══════════════════════════════════════════════════
    let hotDemoted   = 0;
    let warmDemoted  = 0;
    let coldArchived = 0;

    // HOT → WARM
    if (timeLeft() && audit.hot > HOT_LIMIT) {
      const target = Math.min(
        audit.hot - HOT_LIMIT + Math.floor((audit.hot - HOT_LIMIT) * 0.2), // +20% buffer
        2000,
      );
      const { data: hotToDemote } = await supabase
        .from("brain_memory_hot")
        .select("id, content, context, priority, access_count, value_score, importance_score, source_module, category, memory_type, tags, metadata")
        .order("value_score", { ascending: true })
        .order("access_count", { ascending: true })
        .limit(target);

      for (const mem of hotToDemote || []) {
        if (!timeLeft()) break;
        try {
          await supabase.from("brain_memory_warm").insert({
            content:       mem.content,
            context:       mem.context,
            priority:      mem.priority,
            access_count:  mem.access_count ?? 0,
            value_score:   Math.max(0.1, (mem.value_score ?? 0.5) * 0.9),
            source_module: mem.source_module,
            category:      mem.category,
            memory_type:   mem.memory_type,
            tags:          mem.tags,
            demoted_at:    new Date().toISOString(),
            metadata:      { ...(mem.metadata || {}), demoted_from: "hot" },
          });
          await supabase.from("brain_memory_hot").delete().eq("id", mem.id);
          hotDemoted++;
        } catch { /* skip dupes */ }
      }
    }

    // WARM → COLD  (cold table uses 'summary' not 'content')
    if (timeLeft() && (audit.warm + hotDemoted) > WARM_LIMIT) {
      const excess = (audit.warm + hotDemoted) - WARM_LIMIT;
      const target = Math.min(excess + Math.floor(excess * 0.1), 2000);

      const { data: warmToDemote } = await supabase
        .from("brain_memory_warm")
        .select("id, content, value_score, access_count, source_module, category, memory_type, tags, metadata")
        .order("value_score", { ascending: true })
        .order("access_count", { ascending: true })
        .limit(target);

      for (const mem of warmToDemote || []) {
        if (!timeLeft()) break;
        try {
          const summary = (mem.content || "").substring(0, 500);
          const coreSummary = (mem.content || "").substring(0, 200);
          await supabase.from("brain_memory_cold").insert({
            summary,
            core_summary:  coreSummary,
            value_score:   Math.max(0.05, (mem.value_score ?? 0.3) * 0.8),
            access_count:  mem.access_count ?? 0,
            source_module: mem.source_module,
            category:      mem.category,
            memory_type:   mem.memory_type,
            tags:          mem.tags,
            archived_at:   new Date().toISOString(),
          });
          await supabase.from("brain_memory_warm").delete().eq("id", mem.id);
          warmDemoted++;
        } catch { /* skip */ }
      }
    }

    // COLD → PRUNED (pruned table uses 'content_preview', 'prune_reason')
    if (timeLeft() && audit.cold > COLD_LIMIT) {
      const excess = audit.cold - COLD_LIMIT;
      const target = Math.min(excess + 500, 2000);

      const { data: coldToPrune } = await supabase
        .from("brain_memory_cold")
        .select("id, summary, value_score")
        .order("value_score", { ascending: true })
        .limit(target);

      for (const mem of coldToPrune || []) {
        if (!timeLeft()) break;
        try {
          await supabase.from("brain_memory_pruned").insert({
            original_memory_id: mem.id,
            original_tier:      "cold",
            content_preview:    (mem.summary || "").substring(0, 200),
            value_score:        mem.value_score ?? 0,
            prune_reason:       "auto_deep_maintenance",
            can_restore:        true,
            restore_until:      new Date(Date.now() + 30 * 86_400_000).toISOString(),
          });
          await supabase.from("brain_memory_cold").delete().eq("id", mem.id);
          coldArchived++;
        } catch { /* skip */ }
      }
    }

    (report.phases as any).tier = { hotDemoted, warmDemoted, coldArchived };
    console.log(`[DeepMaint] TIER: hot→warm=${hotDemoted} warm→cold=${warmDemoted} cold→pruned=${coldArchived}`);

    // ═══════════════════════════════════════════════════
    // PHASE 4: CRYSTALLIZE — Form knowledge crystals
    // ═══════════════════════════════════════════════════
    let crystalsFormed = 0;

    if (timeLeft()) {
      const MODULES = [
        "CORE","BRAIN","MEMORY","NERVE","DECODE","ENCODE","CORTEX",
        "DEFENSE","ORACLE","CONSCIENCE","PHANTOM","HARVEST","EVOLUTION",
        "SHADOW","IMMUNITY","INTENT","GOVERNANCE","ATLAS","FORGE",
        "LINGUA","ECHO","SOVEREIGN","REFLEX","TREATY","ENGINEER",
        "COMPASS","OBSERVER","NEXUS","RELAY","VISION","DREAM",
        "SPINE","RIPPLE","INCLUSIVE","INTEGRATION","ACCESS","RADIO",
        "CODELAB","PIONEER","SENTINEL",
      ];

      const recentCutoff = new Date(Date.now() - 24 * 3_600_000).toISOString();

      for (const mod of MODULES) {
        if (!timeLeft()) break;

        // Find high-value HOT memories for this module
        const { data: highMems } = await supabase
          .from("brain_memory_hot")
          .select("id, content, value_score, context, category")
          .eq("source_module", mod)
          .gte("value_score", 0.6)
          .order("value_score", { ascending: false })
          .limit(10);

        if (!highMems?.length || highMems.length < 2) continue;

        // Skip if module already has recent crystals
        const { count: recentCount } = await supabase
          .from("brain_knowledge_crystals")
          .select("*", { count: "exact", head: true })
          .eq("source_module", mod)
          .gte("created_at", recentCutoff);

        if ((recentCount ?? 0) >= 2) continue;

        // Distill memories into a crystal
        const snippets  = highMems.map((m: any) => m.content?.substring(0, 150)).filter(Boolean);
        const distilled = `[${mod}] Consolidated from ${highMems.length} high-value memories: ${snippets.join(" | ")}`;
        const avgScore  = highMems.reduce((s: number, m: any) => s + (m.value_score ?? 0), 0) / highMems.length;

        try {
          await supabase.from("brain_knowledge_crystals").insert({
            crystal_type:     "auto_distillation",
            title:            `${mod} Knowledge Crystal — Deep Maintenance`,
            distilled_content: distilled.substring(0, 2000),
            source_memory_ids: highMems.map((m: any) => m.id),
            source_tier:       "hot",
            source_module:     mod,
            source_count:      highMems.length,
            compression_ratio: Math.round((highMems.length * 150) / Math.max(1, distilled.length) * 10) / 10,
            confidence:        Math.round(avgScore * 100) / 100,
            domain:            mod.toLowerCase(),
            tags:              [mod.toLowerCase(), "auto-maintenance", "distilled"],
          });
          crystalsFormed++;
        } catch { /* skip dupes */ }
      }
    }

    (report.phases as any).crystallize = { crystalsFormed };
    console.log(`[DeepMaint] CRYSTALLIZE: formed=${crystalsFormed}`);

    // ═══════════════════════════════════════════════════
    // PHASE 5: GRAPH — Populate knowledge graph
    // ═══════════════════════════════════════════════════
    let graphNodesCreated = 0;
    let graphEdgesCreated = 0;

    if (timeLeft()) {
      // Get crystals that don't have graph nodes yet
      const { data: crystals } = await supabase
        .from("brain_knowledge_crystals")
        .select("id, title, source_module, domain, confidence, crystal_type, distilled_content")
        .order("created_at", { ascending: false })
        .limit(100);

      // Collect existing source_ids to avoid dupes
      const existingSources = new Set<string>();
      if (crystals?.length) {
        const { data: existing } = await supabase
          .from("brain_graph_nodes")
          .select("source_id")
          .in("source_id", crystals.map((c: any) => c.id));

        for (const n of existing || []) existingSources.add(n.source_id);
      }

      // Create missing graph nodes
      const newNodeIds: { id: string; cluster: string; weight: number }[] = [];
      for (const crystal of crystals || []) {
        if (!timeLeft()) break;
        if (existingSources.has(crystal.id)) continue;

        try {
          const { data: newNode } = await supabase.from("brain_graph_nodes").insert({
            node_type:        "crystal",
            label:            crystal.title?.substring(0, 100),
            description:      crystal.distilled_content?.substring(0, 300),
            memory_tier:      "crystal",
            source_id:        crystal.id,
            weight:           crystal.confidence ?? 0.5,
            centrality_score: 0,
            cluster_id:       crystal.source_module || crystal.domain || "general",
            attributes:       { crystal_type: crystal.crystal_type, domain: crystal.domain, module: crystal.source_module },
          }).select("id, cluster_id, weight").single();

          if (newNode) {
            graphNodesCreated++;
            newNodeIds.push({ id: newNode.id, cluster: newNode.cluster_id, weight: newNode.weight });
          }
        } catch { /* skip */ }
      }

      // Create edges between nodes in same cluster
      // (brain_graph_edges schema: source_id, target_id, relation, weight, confidence)
      if (timeLeft() && graphNodesCreated > 0) {
        const { data: allNodes } = await supabase
          .from("brain_graph_nodes")
          .select("id, cluster_id, weight")
          .order("created_at", { ascending: false })
          .limit(200);

        const byCluster: Record<string, { id: string; weight: number }[]> = {};
        for (const node of allNodes || []) {
          const c = node.cluster_id || "general";
          (byCluster[c] ??= []).push({ id: node.id, weight: node.weight ?? 0.5 });
        }

        for (const [, nodes] of Object.entries(byCluster)) {
          if (!timeLeft() || nodes.length < 2) continue;

          const cap = Math.min(nodes.length, 6);
          for (let i = 0; i < cap - 1; i++) {
            for (let j = i + 1; j < cap; j++) {
              if (!timeLeft()) break;
              try {
                const { count } = await supabase
                  .from("brain_graph_edges")
                  .select("*", { count: "exact", head: true })
                  .eq("source_id", nodes[i].id)
                  .eq("target_id", nodes[j].id);

                if ((count ?? 0) === 0) {
                  await supabase.from("brain_graph_edges").insert({
                    source_id:     nodes[i].id,
                    target_id:     nodes[j].id,
                    relation:      "domain_affinity",
                    relation_type: "auto_generated",
                    weight:        Math.min(nodes[i].weight, nodes[j].weight),
                    confidence:    Math.min(nodes[i].weight, nodes[j].weight),
                    metadata:      { auto_generated: true, source: "deep_maintenance" },
                  });
                  graphEdgesCreated++;
                }
              } catch { /* skip */ }
            }
          }
        }
      }
    }

    (report.phases as any).graph = { graphNodesCreated, graphEdgesCreated };
    console.log(`[DeepMaint] GRAPH: nodes=${graphNodesCreated} edges=${graphEdgesCreated}`);

    // ═══════════════════════════════════════════════════
    // PHASE 6: DREAM — Cross-insights between active modules
    // ═══════════════════════════════════════════════════
    let crossInsightsGenerated = 0;

    if (timeLeft()) {
      // Count HOT memories per module efficiently via grouped query
      const { data: hotModuleData } = await supabase
        .from("brain_memory_hot")
        .select("source_module")
        .not("source_module", "is", null)
        .limit(1000);  // cap scan

      const moduleCounts: Record<string, number> = {};
      for (const m of hotModuleData || []) {
        moduleCounts[m.source_module] = (moduleCounts[m.source_module] || 0) + 1;
      }

      const topModules = Object.entries(moduleCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([m]) => m);

      const recentCutoff24h = new Date(Date.now() - 24 * 3_600_000).toISOString();

      // Generate cross-insights between top module pairs
      // (brain_cross_insights schema: insight_text, domains, confidence, metadata)
      for (let i = 0; i < topModules.length - 1 && timeLeft(); i++) {
        for (let j = i + 1; j < Math.min(topModules.length, i + 3) && timeLeft(); j++) {
          const modA = topModules[i];
          const modB = topModules[j];

          // Check for recent duplicate
          const { count: existing } = await supabase
            .from("brain_cross_insights")
            .select("*", { count: "exact", head: true })
            .contains("domains", [modA, modB])
            .gte("created_at", recentCutoff24h);

          if ((existing ?? 0) > 0) continue;

          try {
            await supabase.from("brain_cross_insights").insert({
              insight_text: `Cross-domain pattern: ${modA} (${moduleCounts[modA]} hot) ↔ ${modB} (${moduleCounts[modB]} hot). High activity correlation suggests knowledge transfer opportunity between these nodes.`,
              domains:      [modA, modB],
              confidence:   Math.min(0.85, (moduleCounts[modA] + moduleCounts[modB]) / 200),
              metadata:     {
                auto_generated: true,
                source: "deep_maintenance",
                hot_counts: { [modA]: moduleCounts[modA], [modB]: moduleCounts[modB] },
              },
            });
            crossInsightsGenerated++;
          } catch { /* skip */ }
        }
      }
    }

    (report.phases as any).dream = { crossInsightsGenerated };
    console.log(`[DeepMaint] DREAM: cross_insights=${crossInsightsGenerated}`);

    // ═══════════════════════════════════════════════════
    // PHASE 7: STORAGE RECLAMATION — Clean auxiliary tables
    // ═══════════════════════════════════════════════════
    let auxTablesCleaned = 0;
    let auxRowsRemoved = 0;
    let dupsRemoved = 0;
    let orphanEdgesRemoved = 0;

    // ── Retention-based pruning schedule ──
    // Each entry: [table, retentionDays, maxPasses, timestampCol]
    const RETENTION_RULES: [string, number, number, string][] = [
      // Already existed
      ["analytics_events",       14,  10, "created_at"],
      ["ai_usage_log",           14,  10, "created_at"],
      ["ai_learning_data",       30,   5, "created_at"],
      // NEW: Large tables without pruning
      ["owner_reports",          30,   5, "created_at"],
      ["defense_events",         30,  10, "created_at"],
      ["vault_promotions",       60,  10, "created_at"],
      ["brain_metrics",          30,  10, "created_at"],
      ["site_page_views",        30,  10, "created_at"],
      ["pf_brain_anomalies",     30,  10, "created_at"],
      ["cascade_dreams",         60,   5, "created_at"],
      ["discovery_runs",         60,  10, "created_at"],
      ["nexus_logs",             14,  10, "created_at"],
      ["nexus_hourly_snapshots", 14,  10, "created_at"],
      ["learning_queries",       30,  10, "created_at"],
      ["brain_cross_insights",   30,  10, "created_at"],
      ["client_error_log",       14,  10, "created_at"],
      ["execution_traces",       14,  10, "created_at"],
      ["decode_search_results",  14,  10, "created_at"],
      ["cascade_conversations",  60,  10, "created_at"],
      ["foundry_mine_events",    30,   5, "created_at"],
      ["foundry_discovery_metrics", 60, 5, "created_at"],
      ["brain_distillation_runs", 60,  5, "created_at"],
      ["maintenance_reports",    60,   5, "created_at"],
    ];

    for (const [table, days, maxPasses, tsCol] of RETENTION_RULES) {
      if (!timeLeft()) break;
      const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
      const removed = await batchPrune(table, cutoff, maxPasses);
      if (removed > 0) {
        auxTablesCleaned++;
        auxRowsRemoved += removed;
        console.log(`[DeepMaint] Pruned ${removed} rows from ${table} (>${days}d)`);
      }
    }

    if (timeLeft()) {
      // 7b. Cap analytics_snapshots at 500
      const { count: snapCount } = await supabase
        .from("analytics_snapshots")
        .select("*", { count: "exact", head: true });
      if ((snapCount ?? 0) > 500) {
        const snapExcess = (snapCount ?? 0) - 500;
        const { data: oldSnaps } = await supabase
          .from("analytics_snapshots")
          .select("id")
          .order("created_at", { ascending: true })
          .limit(Math.min(snapExcess, 1000));
        if (oldSnaps?.length) {
          for (let i = 0; i < oldSnaps.length; i += 500) {
            const chunk = oldSnaps.slice(i, i + 500).map((r: any) => r.id);
            await supabase.from("analytics_snapshots").delete().in("id", chunk);
          }
          auxRowsRemoved += oldSnaps.length;
          auxTablesCleaned++;
        }
      }
    }

    // 7c. Deduplicate HOT tier — same content+module within batch
    if (timeLeft()) {
      const { data: hotMems } = await supabase
        .from("brain_memory_hot")
        .select("id, content, source_module")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (hotMems && hotMems.length > 1) {
        const seen = new Map<string, string>();
        const toDelete: string[] = [];
        for (const mem of hotMems) {
          const key = `${mem.source_module}:${(mem.content || "").substring(0, 80)}`;
          if (seen.has(key)) toDelete.push(mem.id);
          else seen.set(key, mem.id);
        }
        if (toDelete.length > 0) {
          for (let i = 0; i < toDelete.length; i += 500) {
            await supabase.from("brain_memory_hot").delete().in("id", toDelete.slice(i, i + 500));
          }
          dupsRemoved += toDelete.length;
        }
      }
    }

    // 7d. Remove orphaned graph edges
    if (timeLeft()) {
      const { data: edges } = await supabase
        .from("brain_graph_edges")
        .select("id, source_id, target_id")
        .limit(500);

      if (edges?.length) {
        const nodeIds = new Set<string>();
        for (const e of edges) { nodeIds.add(e.source_id); nodeIds.add(e.target_id); }

        const { data: existingNodes } = await supabase
          .from("brain_graph_nodes")
          .select("id")
          .in("id", Array.from(nodeIds));

        const existingSet = new Set((existingNodes ?? []).map((n: any) => n.id));
        const orphans = edges.filter((e: any) => !existingSet.has(e.source_id) || !existingSet.has(e.target_id));

        if (orphans.length > 0) {
          await supabase.from("brain_graph_edges").delete().in("id", orphans.map((e: any) => e.id));
          orphanEdgesRemoved += orphans.length;
        }
      }
    }

    (report.phases as any).storage = { auxTablesCleaned, auxRowsRemoved, dupsRemoved, orphanEdgesRemoved };
    console.log(
      `[DeepMaint] STORAGE: tables=${auxTablesCleaned} rows=${auxRowsRemoved} dups=${dupsRemoved} orphanEdges=${orphanEdgesRemoved}`,
    );

    // ═══════════════════════════════════════════════════
    // PHASE 8: UPDATE META + FINAL REPORT
    // ═══════════════════════════════════════════════════
    const [fHot, fWarm, fCold] = await Promise.all([
      supabase.from("brain_memory_hot").select("*",  { count: "exact", head: true }),
      supabase.from("brain_memory_warm").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_cold").select("*", { count: "exact", head: true }),
    ]);

    const finalCounts = {
      hot:  countOf(fHot),
      warm: countOf(fWarm),
      cold: countOf(fCold),
    };

    // Update ALL brain_memory_meta rows for substrate agent
    await supabase.from("brain_memory_meta")
      .update({
        hot_count:         finalCounts.hot,
        warm_count:        finalCounts.warm,
        cold_count:        finalCounts.cold,
        last_tiering_run:  new Date().toISOString(),
        updated_at:        new Date().toISOString(),
      })
      .eq("agent_id", "substrate")
      .not("id", "is", null);

    report.duration_ms   = elapsed();
    report.completed_at  = new Date().toISOString();
    report.final_counts  = finalCounts;
    report.deltas        = {
      hot:  finalCounts.hot  - audit.hot,
      warm: finalCounts.warm - audit.warm,
      cold: finalCounts.cold - audit.cold,
    };

    // Persist maintenance log
    await supabase.from("brain_maintenance_log").insert({
      task_type:    "deep_maintenance",
      status:       "completed",
      started_at:   new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms:  elapsed(),
      details:      report,
    });

    // Record as brain event
    await supabase.from("brain_events").insert({
      event_type: "deep_maintenance_complete",
      module:     "brain",
      outcome:    "success",
      data: {
        events_pruned:       eventsPruned,
        reflections_pruned:  reflectionsPruned,
        learning_logs_pruned: learningLogsPruned,
        hot_demoted:         hotDemoted,
        warm_demoted:        warmDemoted,
        cold_archived:       coldArchived,
        crystals_formed:     crystalsFormed,
        graph_nodes:         graphNodesCreated,
        graph_edges:         graphEdgesCreated,
        cross_insights:      crossInsightsGenerated,
        storage_reclaimed:   { auxTablesCleaned, auxRowsRemoved, dupsRemoved, orphanEdgesRemoved },
        final_counts:        finalCounts,
        duration_ms:         elapsed(),
      },
    });

    console.log(
      `[DeepMaint] COMPLETE in ${elapsed()}ms — ` +
      `HOT: ${audit.hot}→${finalCounts.hot} | WARM: ${audit.warm}→${finalCounts.warm} | COLD: ${audit.cold}→${finalCounts.cold} | ` +
      `STORAGE: ${auxRowsRemoved} aux rows + ${dupsRemoved} dups + ${orphanEdgesRemoved} orphans freed`,
    );

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[DeepMaint] Fatal:", err);

    // Attempt to log failure
    try {
      await supabase.from("brain_maintenance_log").insert({
        task_type:     "deep_maintenance",
        status:        "failed",
        started_at:    new Date(startTime).toISOString(),
        completed_at:  new Date().toISOString(),
        duration_ms:   elapsed(),
        error_message: String(err),
        details:       report,
      });
    } catch { /* non-fatal */ }

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
