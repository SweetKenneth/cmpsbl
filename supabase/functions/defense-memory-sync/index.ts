// defense-memory-sync
// DEFENSE → MEMORY learning loop.
// Pulls recent block/challenge events from defense_events, deduplicates by
// fingerprint_family + reason, and promotes them into brain_memory_warm so the
// substrate's recall surfaces (DECODE, ASCENSION, IMMUNITY) can use historical
// attack patterns at request-time.
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

function buildLessonContent(rows: any[]): { summary: string; full: string; tags: string[] } {
  const family = rows[0].fingerprint_family || "unknown";
  const reason = rows[0].reason || "blocked";
  const action = rows[0].action || "block";
  const endpoints = Array.from(new Set(rows.map(r => r.endpoint).filter(Boolean))).slice(0, 5);
  const countries = Array.from(new Set(rows.map(r => r.country).filter(Boolean))).slice(0, 5);
  const asns = Array.from(new Set(rows.map(r => r.asn).filter(Boolean))).slice(0, 5);
  const avgRisk = Math.round(rows.reduce((a, r) => a + (r.risk_score || 0), 0) / rows.length);

  const summary = `DEFENSE: ${rows.length}× ${action} for ${family} (${reason}) avg-risk=${avgRisk}`;
  const full = [
    `# Defense Pattern Lesson`,
    `Fingerprint family: ${family}`,
    `Reason: ${reason}`,
    `Action taken: ${action}`,
    `Occurrences (sampled): ${rows.length}`,
    `Average risk score: ${avgRisk}`,
    endpoints.length ? `Targeted endpoints: ${endpoints.join(", ")}` : "",
    countries.length ? `Source countries: ${countries.join(", ")}` : "",
    asns.length ? `Source ASNs: ${asns.join(", ")}` : "",
    ``,
    `Substrate guidance: when a request matches this fingerprint family + endpoint pattern, treat as known-hostile and short-circuit to ${action}. Surface this lesson to ASCENSION (when scanning code that exposes the same endpoints) and to IMMUNITY (as a candidate for permanent rule promotion).`,
  ].filter(Boolean).join("\n");

  return {
    summary,
    full,
    tags: ["defense", "attack_pattern", family, reason, action].filter(Boolean),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const sinceMinutes = Math.min(Math.max(Number(body.since_minutes) || 60, 5), 1440);
    const limit = Math.min(Math.max(Number(body.limit) || 200, 10), 1000);
    const dryRun = body.dry_run === true;

    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

    // Pull recent defense events that resulted in a hostile action.
    const { data: events, error } = await supabase
      .from("defense_events")
      .select("id, fingerprint_family, reason, action, endpoint, country, asn, risk_score, detected_at")
      .gte("detected_at", since)
      .in("action", ["block", "challenge", "rate_limit", "deny"])
      .limit(limit);

    if (error) throw error;
    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "no defense events in window", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Group by fingerprint_family + reason + action — that's the durable lesson key.
    const groups = new Map<string, any[]>();
    for (const e of events) {
      const key = `${e.fingerprint_family || "x"}|${e.reason || "x"}|${e.action || "x"}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }

    const promoted: any[] = [];

    for (const [key, rows] of groups.entries()) {
      const { summary, full, tags } = buildLessonContent(rows);
      const goalRef = `defense:${key}`;

      // Dedupe: if a warm memory with this goal_ref already exists, bump access_count instead.
      const { data: existing } = await supabase
        .from("brain_memory_warm")
        .select("id, access_count, value_score")
        .eq("goal_ref", goalRef)
        .limit(1)
        .maybeSingle();

      if (dryRun) {
        promoted.push({ key, occurrences: rows.length, dry_run: true, existing: !!existing });
        continue;
      }

      if (existing) {
        await supabase
          .from("brain_memory_warm")
          .update({
            access_count: (existing.access_count || 0) + rows.length,
            value_score: Math.min(1, (Number(existing.value_score) || 0.5) + 0.05),
            last_accessed: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        promoted.push({ key, occurrences: rows.length, action: "reinforced", id: existing.id });
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("brain_memory_warm")
          .insert({
            content: full,
            core_summary: summary,
            context: "defense.attack_pattern",
            goal_ref: goalRef,
            priority: 7,
            value_score: 0.6,
            access_count: rows.length,
            last_accessed: new Date().toISOString(),
            tags,
            memory_type: "procedural",
            source_module: "defense",
            category: "security",
            metadata: {
              source: "defense-memory-sync",
              fingerprint_family: rows[0].fingerprint_family,
              reason: rows[0].reason,
              action: rows[0].action,
              sample_event_ids: rows.slice(0, 10).map(r => r.id),
            },
          })
          .select("id")
          .single();
        if (insErr) {
          console.error("[defense-memory-sync] insert failed", insErr, key);
          continue;
        }
        promoted.push({ key, occurrences: rows.length, action: "promoted", id: inserted.id });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        events_scanned: events.length,
        groups: groups.size,
        promoted: promoted.length,
        dry_run: dryRun,
        results: promoted,
        elapsed_ms: Date.now() - t0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[defense-memory-sync] fatal", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
