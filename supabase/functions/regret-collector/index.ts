// regret-collector
// Sweeps the substrate for "decisions that turned out wrong" and writes them to
// brain_regret_log. Sources: failed Ascensions, rejected Lex rules, abandoned
// product compilations, retired primitives. Idempotent via decision_ref dedupe.
//
// POST { since_minutes?: number, dry_run?: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Regret = {
  source_module: string;
  decision_type: string;
  decision_ref: string;
  decision_summary: string;
  outcome_summary: string;
  severity: number;
  tags: string[];
  metadata: Record<string, unknown>;
};

async function safeQuery<T = any>(supabase: any, table: string, select: string, sinceIso: string, filters: Record<string, any> = {}, sinceCol = "created_at"): Promise<T[]> {
  try {
    let q = supabase.from(table).select(select).gte(sinceCol, sinceIso).limit(200);
    for (const [k, v] of Object.entries(filters)) {
      if (Array.isArray(v)) q = q.in(k, v);
      else q = q.eq(k, v);
    }
    const { data, error } = await q;
    if (error) {
      console.warn(`[regret-collector] ${table} skipped:`, error.message);
      return [];
    }
    return (data as T[]) || [];
  } catch (e) {
    console.warn(`[regret-collector] ${table} exception:`, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const sinceMinutes = Math.min(Math.max(Number(body.since_minutes) || 1440, 60), 43200);
    const dryRun = body.dry_run === true;
    const sinceIso = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

    const candidates: Regret[] = [];

    // 1. Failed Ascensions
    const failedAsc = await safeQuery(supabase, "ascension_runs", "id, status, error_message, created_at, score", sinceIso, { status: ["failed", "error", "aborted"] });
    for (const a of failedAsc) {
      candidates.push({
        source_module: "ascension",
        decision_type: "failed_run",
        decision_ref: `ascension:${a.id}`,
        decision_summary: `Ascension run attempted scoring/refurbishment`,
        outcome_summary: a.error_message || "Run failed without explicit error",
        severity: 6,
        tags: ["ascension", "failure"],
        metadata: { run_id: a.id, score: a.score },
      });
    }

    // 2. Rejected Lex rules
    const rejectedLex = await safeQuery(supabase, "lex_rules", "id, name, status, rejection_reason, updated_at", sinceIso, { status: ["rejected", "deprecated"] }, "updated_at");
    for (const r of rejectedLex) {
      candidates.push({
        source_module: "cortex.lex",
        decision_type: "rejected_rule",
        decision_ref: `lex:${r.id}`,
        decision_summary: `Lex rule "${r.name}" was proposed`,
        outcome_summary: r.rejection_reason || `Rule rejected/deprecated (status=${r.status})`,
        severity: 5,
        tags: ["lex", "governance", "rejected"],
        metadata: { rule_id: r.id, name: r.name },
      });
    }

    // 3. Abandoned/failed autoblog drafts (proxy for failed product compilations)
    const failedQueue = await safeQuery(supabase, "autoblog_queue", "id, topic, status, error, created_at", sinceIso, { status: ["failed", "error", "skipped"] });
    for (const q of failedQueue) {
      candidates.push({
        source_module: "autoblog",
        decision_type: "failed_compilation",
        decision_ref: `autoblog:${q.id}`,
        decision_summary: `Autoblog topic queued: "${q.topic || "untitled"}"`,
        outcome_summary: q.error || `Compilation failed (status=${q.status})`,
        severity: 3,
        tags: ["autoblog", "compilation", "failure"],
        metadata: { queue_id: q.id, topic: q.topic },
      });
    }

    // 4. Immune escalations that resolved as false-positive / mis-fired
    const escalations = await safeQuery(supabase, "immune_escalations", "id, escalation_type, resolution, created_at", sinceIso);
    for (const e of escalations.filter((x: any) => /false[_\-\s]?positive|misfire|reverted/i.test(String(x.resolution || "")))) {
      candidates.push({
        source_module: "immunity",
        decision_type: "false_positive",
        decision_ref: `immune:${e.id}`,
        decision_summary: `Immunity escalation type: ${e.escalation_type}`,
        outcome_summary: `Resolved as false-positive: ${e.resolution}`,
        severity: 7,
        tags: ["immunity", "false_positive"],
        metadata: { escalation_id: e.id },
      });
    }

    if (dryRun) {
      return new Response(
        JSON.stringify({ ok: true, dry_run: true, candidates: candidates.length, sample: candidates.slice(0, 5), elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let inserted = 0;
    let skipped = 0;
    for (const c of candidates) {
      const { data: exists } = await supabase
        .from("brain_regret_log")
        .select("id")
        .eq("decision_ref", c.decision_ref)
        .limit(1)
        .maybeSingle();
      if (exists) { skipped++; continue; }
      const { error: insErr } = await supabase.from("brain_regret_log").insert(c);
      if (insErr) {
        console.error("[regret-collector] insert failed", insErr, c.decision_ref);
        continue;
      }
      inserted++;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        scanned: candidates.length,
        inserted,
        skipped,
        elapsed_ms: Date.now() - t0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[regret-collector] fatal", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
