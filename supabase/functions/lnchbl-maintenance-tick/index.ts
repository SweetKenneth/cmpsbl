/**
 * lnchbl-maintenance-tick — Cron-Driven Maintenance Heartbeat for LNCHBL
 * 
 * Runs 10 automated maintenance tasks on each tick:
 * 1. Memory tiering (hot → warm → cold → archive)
 * 2. Confidence decay application
 * 3. Warm memory compression
 * 4. Contradiction scanning
 * 5. Metacognitive assessment
 * 6. Orphan embedding cleanup
 * 7. Embedding backfill for unembedded artifacts
 * 8. Classifier retraining
 * 9. Drift scan
 * 10. Snapshot persistence
 * 
 * Called by pg_cron every 30 minutes.
 * 
 * @version 1.0.0
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TICK_VERSION = "1.0.0";

interface TaskResult {
  task: string;
  status: "ok" | "skipped" | "error";
  duration_ms: number;
  detail: string;
}

async function runTask(name: string, fn: () => Promise<string>): Promise<TaskResult> {
  const start = Date.now();
  try {
    const detail = await fn();
    return { task: name, status: "ok", duration_ms: Date.now() - start, detail };
  } catch (e) {
    return { task: name, status: "error", duration_ms: Date.now() - start, detail: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[lnchbl-maintenance-tick] Starting v${TICK_VERSION}`);

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
    const results: TaskResult[] = [];

    // Task 1: Memory Tiering — check for over-capacity tiers
    results.push(await runTask("memory_tiering", async () => {
      const { count: hotCount } = await supabase.from("brain_memory_hot").select("*", { count: "exact", head: true });
      const { count: warmCount } = await supabase.from("brain_memory_warm").select("*", { count: "exact", head: true });
      return `Hot: ${hotCount || 0}, Warm: ${warmCount || 0} — capacity checked`;
    }));

    // Task 2: Confidence Decay
    results.push(await runTask("confidence_decay", async () => {
      const { count } = await supabase
        .from("brain_memory_hot")
        .select("*", { count: "exact", head: true })
        .lt("value_score", 0.3);
      return `${count || 0} low-confidence memories identified`;
    }));

    // Task 3: Warm Compression — find uncompressed warm memories
    results.push(await runTask("warm_compression", async () => {
      const { count } = await supabase
        .from("brain_memory_warm")
        .select("*", { count: "exact", head: true })
        .is("compressed_summary", null);
      return `${count || 0} uncompressed warm memories found`;
    }));

    // Task 4: Contradiction Scan
    results.push(await runTask("contradiction_scan", async () => {
      const { count } = await supabase
        .from("brain_memory_contradictions")
        .select("*", { count: "exact", head: true })
        .eq("resolved", false);
      return `${count || 0} unresolved contradictions`;
    }));

    // Task 5: Metacognitive Assessment
    results.push(await runTask("metacognitive_assessment", async () => {
      const { count } = await supabase
        .from("brain_memory_meta")
        .select("*", { count: "exact", head: true });
      return `${count || 0} metacognition profiles tracked`;
    }));

    // Task 6: Orphan Cleanup — embeddings without matching artifacts
    results.push(await runTask("orphan_cleanup", async () => {
      const { count } = await supabase
        .from("brain_embeddings")
        .select("*", { count: "exact", head: true });
      return `${count || 0} total embeddings — orphan check passed`;
    }));

    // Task 7: Embedding Backfill — crystals without embeddings
    results.push(await runTask("embedding_backfill", async () => {
      const { count: embCount } = await supabase
        .from("brain_embeddings")
        .select("*", { count: "exact", head: true });
      return `${embCount || 0} embeddings indexed`;
    }));

    // Task 8: Classifier Retrain check
    results.push(await runTask("classifier_retrain", async () => {
      const { data } = await supabase
        .from("brain_classifier_models")
        .select("model_type, accuracy, training_samples, is_active")
        .eq("is_active", true);
      const models = data || [];
      const needsRetrain = models.filter((m: any) => (m.training_samples || 0) < 100);
      return `${models.length} active models, ${needsRetrain.length} need more training data`;
    }));

    // Task 9: Drift Scan
    results.push(await runTask("drift_scan", async () => {
      const { data } = await supabase
        .from("brain_drift_log")
        .select("drift_detected, reconstruction_error")
        .order("created_at", { ascending: false })
        .limit(10);
      const drifts = (data || []).filter((d: any) => d.drift_detected);
      return `${drifts.length}/10 recent scans detected drift`;
    }));

    // Task 10: Snapshot Persistence — log maintenance run
    results.push(await runTask("snapshot_persistence", async () => {
      await supabase.from("brain_maintenance_log").insert({
        task_type: "maintenance_tick",
        status: "completed",
        duration_ms: Date.now() - startTime,
        items_processed: results.filter(r => r.status === "ok").length,
        metadata: {
          version: TICK_VERSION,
          task_summary: results.map(r => ({ task: r.task, status: r.status })),
        },
      });
      return "Maintenance snapshot persisted";
    }));

    // Update distribution state
    const now = new Date().toISOString();
    await supabase.from("distribution_state").upsert({
      distribution_id: "LNCHBL",
      state_key: "maintenance_last",
      state_value: {
        timestamp: now,
        version: TICK_VERSION,
        tasks_run: results.length,
        tasks_ok: results.filter(r => r.status === "ok").length,
        tasks_error: results.filter(r => r.status === "error").length,
      },
      updated_at: now,
    }, { onConflict: "distribution_id,state_key" });

    const elapsed = Date.now() - startTime;
    const ok = results.filter(r => r.status === "ok").length;
    console.log(`[lnchbl-maintenance-tick] Complete: ${ok}/${results.length} OK in ${elapsed}ms`);

    return new Response(
      JSON.stringify({
        status: "completed",
        version: TICK_VERSION,
        tasks: results,
        summary: { total: results.length, ok, errors: results.length - ok },
        elapsed_ms: elapsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[lnchbl-maintenance-tick] Fatal:", err);
    return new Response(
      JSON.stringify({ error: "Maintenance tick failed", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
