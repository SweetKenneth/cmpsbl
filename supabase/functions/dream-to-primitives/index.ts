// dream-to-primitives
// DREAM → ASCENSION + DREAM → IMMUNITY fan-out.
// Reads recent dreams, classifies them, and fans them out:
//   - dreams suggesting novel primitive combinations → ascension_dream_proposals (audit log)
//   - dreams about "what could go wrong" → immune_intelligence_events (shadow-mode)
//
// POST { since_minutes?: number, limit?: number, dry_run?: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function classifyDream(content: string): "ascension" | "immunity" | "skip" {
  const c = content.toLowerCase();
  // immunity-bound: failure/regret/threat/wrong-path
  if (/regret|failure|wrong|breach|attack|threat|exploit|counterfactual|negative-space/.test(c)) return "immunity";
  // ascension-bound: novel combinations, primitive composition, capability discovery
  if (/primitive|combine|compose|capability|cross-domain|synthesis|novel|discover/.test(c)) return "ascension";
  return "skip";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const sinceMinutes = Math.min(Math.max(Number(body.since_minutes) || 1440, 60), 10080);
    const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 100);
    const dryRun = body.dry_run === true;
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

    const { data: dreams, error } = await supabase
      .from("dream_log")
      .select("id, mode, content, created_at, metadata")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!dreams || dreams.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, message: "no dreams in window", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const out: any[] = [];

    for (const d of dreams) {
      // Skip dreams already fanned-out
      const fannedKey = `dream:${d.id}`;
      const { data: alreadyDone } = await supabase
        .from("cortex_audit_log")
        .select("id")
        .eq("event_type", "dream_fanout")
        .eq("target_action", fannedKey)
        .limit(1)
        .maybeSingle();
      if (alreadyDone) { out.push({ dream_id: d.id, action: "already_fanned" }); continue; }

      const cls = classifyDream(String(d.content || ""));
      if (cls === "skip") { out.push({ dream_id: d.id, action: "skip" }); continue; }

      if (dryRun) { out.push({ dream_id: d.id, action: "would_fanout", target: cls, dry_run: true }); continue; }

      let target = cls as string;
      let success = false;

      if (cls === "ascension") {
        // Audit-log proposal that ASCENSION should consider this dream as a scan-priority hint
        const { error: e1 } = await supabase.from("cortex_audit_log").insert({
          event_type: "ascension_dream_hint",
          actor: "dream-to-primitives",
          target_module: "ascension",
          target_action: fannedKey,
          new_value: { dream_id: d.id, mode: d.mode, excerpt: String(d.content).slice(0, 400) },
          reason: "Dream classified as novel-combination candidate; surface to next Ascension scan as priority hint.",
          metadata: { auto: true, classification: "ascension" },
        });
        success = !e1;
      } else if (cls === "immunity") {
        // Insert as shadow-mode intelligence event
        const sigBase = String(d.content).slice(0, 200);
        const sigHash = btoa(unescape(encodeURIComponent(sigBase))).slice(0, 32);
        const { error: e2 } = await supabase.from("immune_intelligence_events").insert({
          executor_id: "dream-to-primitives",
          is_shadow_mesh: true,
          mode: "shadow",
          outcome: "candidate",
          repair_type: "dream_seeded",
          rule_id: `dream:${d.id}`,
          failure_signature_hash: sigHash,
          escalation_severity: "low",
          duration_ms: 0,
          meta: { dream_id: d.id, mode: d.mode, source: "dream-to-primitives", excerpt: sigBase },
        });
        success = !e2;
      }

      // Always log the fan-out so we don't double-process
      await supabase.from("cortex_audit_log").insert({
        event_type: "dream_fanout",
        actor: "dream-to-primitives",
        target_module: target,
        target_action: fannedKey,
        new_value: { classification: cls, success },
        reason: `Dream ${d.id} fanned out to ${target}.`,
        metadata: { dream_id: d.id },
      });

      out.push({ dream_id: d.id, action: "fanned", target, success });
    }

    return new Response(
      JSON.stringify({ ok: true, processed: out.length, dry_run: dryRun, results: out, elapsed_ms: Date.now() - t0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[dream-to-primitives] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
