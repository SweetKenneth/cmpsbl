/**
 * pf-brain-sync-dispatch — Brain & Learning Sync for LNCHBL
 * 
 * Since LNCHBL doesn't run CLM, this function packages the latest
 * brain learnings, memory insights, and module knowledge from CMPSBL
 * and writes them to the distribution_patches table for LNCHBL consumption.
 * 
 * Triggered by pg_cron or manual invocation. Runs every 30 minutes.
 * 
 * Flow:
 *   1. Query recent brain_memory_hot entries (last sync window)
 *   2. Query recent brain_events (learning completions)
 *   3. Package as a "brain_sync" patch payload
 *   4. Write to distribution_patches for LNCHBL pickup
 *   5. Update distribution_state with sync timestamp
 * 
 * @version 1.0.0
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYNC_VERSION = "1.0.0";
const SYNC_WINDOW_MINUTES = 30; // How far back to look for new learnings

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[brain-sync-dispatch] Starting v${SYNC_VERSION}`);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse optional body params
    let forceFullSync = false;
    let windowMinutes = SYNC_WINDOW_MINUTES;
    try {
      if (req.method === "POST") {
        const body = await req.json();
        forceFullSync = body.force_full_sync || false;
        windowMinutes = body.window_minutes || SYNC_WINDOW_MINUTES;
      }
    } catch { /* GET request, use defaults */ }

    // ─── Step 1: Get last sync timestamp ─────────────────────────────
    const { data: syncState } = await supabase
      .from("distribution_state")
      .select("*")
      .eq("distribution_id", "LNCHBL")
      .eq("state_key", "brain_sync_last")
      .maybeSingle();

    const lastSyncAt = forceFullSync
      ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24h ago for full sync
      : syncState?.state_value?.timestamp || new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    console.log(`[brain-sync-dispatch] Sync window: ${lastSyncAt} → now`);

    // ─── Step 2: Harvest recent brain memories ───────────────────────
    const [hotResult, warmResult, eventsResult] = await Promise.allSettled([
      supabase
        .from("brain_memory_hot")
        .select("id, content, category, priority, source_module, created_at, metadata")
        .gte("created_at", lastSyncAt)
        .order("priority", { ascending: false })
        .limit(100),
      supabase
        .from("brain_memory_warm")
        .select("id, content, category, priority, source_module, created_at")
        .gte("created_at", lastSyncAt)
        .order("priority", { ascending: false })
        .limit(50),
      supabase
        .from("brain_events")
        .select("id, event_type, module, summary, created_at, metadata")
        .gte("created_at", lastSyncAt)
        .in("event_type", ["learning_complete", "insight_generated", "knowledge_transfer", "consolidation_complete"])
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const hotMemories = hotResult.status === "fulfilled" ? (hotResult.value.data || []) : [];
    const warmMemories = warmResult.status === "fulfilled" ? (warmResult.value.data || []) : [];
    const brainEvents = eventsResult.status === "fulfilled" ? (eventsResult.value.data || []) : [];

    const totalItems = hotMemories.length + warmMemories.length + brainEvents.length;
    console.log(`[brain-sync-dispatch] Harvested: ${hotMemories.length} hot, ${warmMemories.length} warm, ${brainEvents.length} events`);

    if (totalItems === 0) {
      console.log("[brain-sync-dispatch] No new learnings to sync — skipping");
      return new Response(
        JSON.stringify({
          status: "skipped",
          reason: "no_new_learnings",
          sync_window: { from: lastSyncAt, to: new Date().toISOString() },
          elapsed_ms: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Step 3: Build knowledge digest ──────────────────────────────
    // Categorize learnings by module relevance
    const moduleKnowledge: Record<string, any[]> = {};
    for (const mem of [...hotMemories, ...warmMemories]) {
      const mod = mem.source_module || "general";
      if (!moduleKnowledge[mod]) moduleKnowledge[mod] = [];
      moduleKnowledge[mod].push({
        content: mem.content,
        category: mem.category,
        priority: mem.priority,
        tier: hotMemories.includes(mem) ? "hot" : "warm",
      });
    }

    // Extract learning insights from events
    const learningInsights = brainEvents
      .filter((e: any) => e.event_type === "insight_generated" || e.event_type === "learning_complete")
      .map((e: any) => ({
        module: e.module,
        summary: e.summary,
        type: e.event_type,
        metadata: e.metadata,
      }));

    // ─── Step 4: Package as distribution patch ───────────────────────
    const patchPayload = {
      target_distribution: "LNCHBL",
      patch_type: "brain_sync",
      version: `11.3.0-brain-${Date.now()}`,
      status: "published",
      changelog: `Brain sync: ${hotMemories.length} hot memories, ${warmMemories.length} warm memories, ${brainEvents.length} events`,
      payload: {
        sync_version: SYNC_VERSION,
        substrate_version: "11.3.0",
        sync_window: {
          from: lastSyncAt,
          to: new Date().toISOString(),
        },
        knowledge_digest: {
          module_knowledge: moduleKnowledge,
          learning_insights: learningInsights,
          total_memories: hotMemories.length + warmMemories.length,
          total_events: brainEvents.length,
        },
        // Pre-formatted for LNCHBL's brain tables
        injectable_memories: hotMemories.slice(0, 50).map((m: any) => ({
          content: m.content,
          category: m.category,
          priority: Math.min(m.priority || 5, 8), // Cap priority for distribution
          source: "cmpsbl_brain_sync",
          metadata: { origin: "CMPSBL", synced_at: new Date().toISOString() },
        })),
      },
      published_at: new Date().toISOString(),
    };

    const { error: patchError } = await supabase
      .from("distribution_patches")
      .insert(patchPayload);

    if (patchError) {
      console.error("[brain-sync-dispatch] Failed to write patch:", patchError);
      return new Response(
        JSON.stringify({ error: "Failed to write sync patch", details: patchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Step 5: Update sync state ───────────────────────────────────
    const syncTimestamp = new Date().toISOString();
    await supabase
      .from("distribution_state")
      .upsert({
        distribution_id: "LNCHBL",
        state_key: "brain_sync_last",
        state_value: {
          timestamp: syncTimestamp,
          items_synced: totalItems,
          hot_count: hotMemories.length,
          warm_count: warmMemories.length,
          events_count: brainEvents.length,
          version: "11.3.0",
        },
        updated_at: syncTimestamp,
      }, { onConflict: "distribution_id,state_key" });

    const elapsed = Date.now() - startTime;
    console.log(`[brain-sync-dispatch] Complete: ${totalItems} items synced in ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        status: "synced",
        version: "11.3.0",
        sync_summary: {
          hot_memories: hotMemories.length,
          warm_memories: warmMemories.length,
          brain_events: brainEvents.length,
          total_items: totalItems,
          modules_covered: Object.keys(moduleKnowledge).length,
          learning_insights: learningInsights.length,
        },
        sync_window: { from: lastSyncAt, to: syncTimestamp },
        elapsed_ms: elapsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[brain-sync-dispatch] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: "Internal sync error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
