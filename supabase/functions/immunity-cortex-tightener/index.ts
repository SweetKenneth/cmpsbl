// immunity-cortex-tightener
// IMMUNITY → CORTEX wiring. Reads recent immunity rule invocations + intelligence
// events that show repeated threat signatures, and proposes new entries to
// brain_policy (CORTEX governance store). Proposals are written as 'proposed'
// status — Governor must approve before activation.
//
// POST { since_minutes?: number, min_occurrences?: number, dry_run?: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const sinceMinutes = Math.min(Math.max(Number(body.since_minutes) || 1440, 60), 10080);
    const minOccurrences = Math.max(Number(body.min_occurrences) || 3, 2);
    const dryRun = body.dry_run === true;
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

    // Pull immunity intelligence events (recent threat patterns)
    const { data: events, error } = await supabase
      .from("immune_intelligence_events")
      .select("rule_id, mode, outcome, repair_type, failure_signature_hash, escalation_severity, meta, created_at")
      .gte("created_at", since)
      .limit(1000);

    if (error) throw error;
    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ ok: true, proposed: 0, message: "no immunity events in window", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Group by failure_signature_hash + repair_type — recurring signatures = candidate policies
    const groups = new Map<string, any[]>();
    for (const e of events) {
      if (!e.failure_signature_hash) continue;
      const key = `${e.failure_signature_hash}|${e.repair_type || "x"}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }

    const proposals: any[] = [];

    for (const [key, rows] of groups.entries()) {
      if (rows.length < minOccurrences) continue;
      const sig = rows[0].failure_signature_hash;
      const repair = rows[0].repair_type || "general";
      const severities = Array.from(new Set(rows.map(r => r.escalation_severity).filter(Boolean)));
      const policyKey = `immunity.auto.${sig.slice(0, 16)}.${repair}`;

      // Check if a brain_policy entry already exists
      const { data: existing } = await supabase
        .from("brain_policy")
        .select("id")
        .eq("policy_key", policyKey)
        .limit(1)
        .maybeSingle()
        .catch(() => ({ data: null }));

      if (existing) {
        proposals.push({ key: policyKey, occurrences: rows.length, action: "exists" });
        continue;
      }

      const proposal = {
        policy_key: policyKey,
        policy_type: "immunity_promoted",
        status: "proposed",
        priority: 7,
        rule_definition: {
          source: "immunity-cortex-tightener",
          failure_signature: sig,
          repair_type: repair,
          severities,
          occurrences: rows.length,
          recommended_action: "tighten",
          rationale: `Signature observed ${rows.length}× in last ${sinceMinutes}min — auto-proposed for CORTEX policy promotion.`,
          sample_event_count: rows.length,
        },
        metadata: { auto_proposed: true, requires_governor_approval: true },
      };

      if (dryRun) {
        proposals.push({ key: policyKey, occurrences: rows.length, action: "would_propose", dry_run: true });
        continue;
      }

      const { data: ins, error: insErr } = await supabase
        .from("brain_policy")
        .insert(proposal)
        .select("id")
        .single()
        .catch((err) => ({ data: null, error: err }));

      if (insErr) {
        console.warn("[immunity-cortex-tightener] insert failed (table may not exist or schema mismatch)", insErr);
        proposals.push({ key: policyKey, occurrences: rows.length, action: "skipped", error: String(insErr) });
        continue;
      }
      proposals.push({ key: policyKey, occurrences: rows.length, action: "proposed", id: ins?.id });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        events_scanned: events.length,
        groups: groups.size,
        proposals: proposals.length,
        dry_run: dryRun,
        results: proposals,
        elapsed_ms: Date.now() - t0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[immunity-cortex-tightener] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
