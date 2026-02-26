/**
 * lnchbl-neural-bootstrap — Neural Substrate Initialization for LNCHBL
 * 
 * Called once on first boot of a LNCHBL distribution node.
 * Sets up the neural substrate layer: seeds classifier models,
 * creates initial embedding indexes, and configures drift baselines.
 * 
 * @version 1.0.0
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BOOTSTRAP_VERSION = "1.0.0";

interface BootstrapResult {
  step: string;
  status: "ok" | "skipped" | "error";
  detail: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[lnchbl-neural-bootstrap] Starting v${BOOTSTRAP_VERSION}`);

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
    const results: BootstrapResult[] = [];

    // ─── Step 1: Check if already bootstrapped ─────────────────────
    const { data: existing } = await supabase
      .from("distribution_state")
      .select("state_value")
      .eq("distribution_id", "LNCHBL")
      .eq("state_key", "neural_bootstrap")
      .maybeSingle();

    if (existing?.state_value?.bootstrapped) {
      return new Response(
        JSON.stringify({
          status: "already_bootstrapped",
          bootstrapped_at: existing.state_value.bootstrapped_at,
          version: existing.state_value.version,
          elapsed_ms: Date.now() - startTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── Step 2: Seed default confidence classifier ────────────────
    try {
      const { error } = await supabase.from("brain_classifier_models").insert({
        model_type: "confidence",
        weights: {
          weights: new Array(384).fill(0).map(() => (Math.random() - 0.5) * 0.1),
          bias: 0.5,
        },
        accuracy: 0.5,
        training_samples: 0,
        is_active: true,
        metadata: { origin: "bootstrap", version: BOOTSTRAP_VERSION },
      });
      results.push({
        step: "seed_confidence_classifier",
        status: error ? "error" : "ok",
        detail: error ? error.message : "Default confidence classifier seeded",
      });
    } catch (e) {
      results.push({ step: "seed_confidence_classifier", status: "error", detail: String(e) });
    }

    // ─── Step 3: Seed drift autoencoder baseline ───────────────────
    try {
      const { error } = await supabase.from("brain_classifier_models").insert({
        model_type: "drift_autoencoder",
        weights: {
          encoder_weights: new Array(384).fill(0).map(() => (Math.random() - 0.5) * 0.05),
          decoder_weights: new Array(384).fill(0).map(() => (Math.random() - 0.5) * 0.05),
          threshold: 0.15,
        },
        accuracy: 0.5,
        training_samples: 0,
        is_active: true,
        metadata: { origin: "bootstrap", version: BOOTSTRAP_VERSION },
      });
      results.push({
        step: "seed_drift_autoencoder",
        status: error ? "error" : "ok",
        detail: error ? error.message : "Drift autoencoder baseline seeded",
      });
    } catch (e) {
      results.push({ step: "seed_drift_autoencoder", status: "error", detail: String(e) });
    }

    // ─── Step 4: Initialize maintenance schedule ───────────────────
    try {
      const { error } = await supabase.from("brain_maintenance_log").insert({
        task_type: "bootstrap",
        status: "completed",
        duration_ms: 0,
        items_processed: 0,
        metadata: {
          version: BOOTSTRAP_VERSION,
          tasks_registered: [
            "memory_tiering", "confidence_decay", "warm_compression",
            "contradiction_scan", "metacognitive_assessment",
            "orphan_cleanup", "embedding_backfill", "classifier_retrain",
            "drift_scan", "snapshot_persistence",
          ],
        },
      });
      results.push({
        step: "init_maintenance_schedule",
        status: error ? "error" : "ok",
        detail: error ? error.message : "10 maintenance tasks registered",
      });
    } catch (e) {
      results.push({ step: "init_maintenance_schedule", status: "error", detail: String(e) });
    }

    // ─── Step 5: Record bootstrap state ────────────────────────────
    const now = new Date().toISOString();
    await supabase.from("distribution_state").upsert({
      distribution_id: "LNCHBL",
      state_key: "neural_bootstrap",
      state_value: {
        bootstrapped: true,
        bootstrapped_at: now,
        version: BOOTSTRAP_VERSION,
        steps: results,
      },
      updated_at: now,
    }, { onConflict: "distribution_id,state_key" });

    const elapsed = Date.now() - startTime;
    console.log(`[lnchbl-neural-bootstrap] Complete in ${elapsed}ms — ${results.filter(r => r.status === "ok").length}/${results.length} steps OK`);

    return new Response(
      JSON.stringify({
        status: "bootstrapped",
        version: BOOTSTRAP_VERSION,
        steps: results,
        elapsed_ms: elapsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[lnchbl-neural-bootstrap] Fatal:", err);
    return new Response(
      JSON.stringify({ error: "Bootstrap failed", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
