// dream-from-harvest
// HARVEST → DREAM seeding. Reads recent external threat-feed signals from
// pf_global_threat_feed (the substrate's harvested external intelligence) and
// converts them into deterministic dreams: cross-pollinated insights about how
// external patterns might apply to internal substrate primitives.
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
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

async function embed(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const vec: number[] = data?.data?.[0]?.embedding;
    return Array.isArray(vec) && vec.length === 1536 ? vec : null;
  } catch { return null; }
}

const PRIMITIVE_BRIDGES = [
  "DEFENSE may need a new perimeter rule",
  "IMMUNITY should consider this as a shadow-mode candidate",
  "CORTEX should evaluate whether existing Lex rules cover this",
  "VISION should fold this into next-cycle foresight prioritization",
  "ASCENSION should flag exposed code matching this pattern",
];

function synthesizeHarvestDream(t: any, idx: number): string {
  const bridge = PRIMITIVE_BRIDGES[idx % PRIMITIVE_BRIDGES.length];
  return [
    `# DREAM-HARVEST :: CROSS-POLLINATION`,
    `External signal: ${t.threat_type || "unknown"} / ${t.threat_category || "uncategorized"}`,
    `Severity: ${t.severity || "n/a"}`,
    `Description: ${(t.description || "").slice(0, 600)}`,
    ``,
    `## Substrate bridge`,
    bridge + ".",
    ``,
    `## Counter-pattern`,
    `If a request, attached file, or live event matches this signature within the next 7 days, raise the substrate's response tier by one and require an audit-chain entry. Promote to a permanent Lex rule once 3 independent confirmations occur.`,
  ].join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const sinceMinutes = Math.min(Math.max(Number(body.since_minutes) || 720, 60), 10080);
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 50);
    const dryRun = body.dry_run === true;

    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();
    const { data: threats, error } = await supabase
      .from("pf_global_threat_feed")
      .select("id, threat_type, threat_category, severity, description, detected_at, metadata")
      .gte("detected_at", since)
      .order("detected_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!threats || threats.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, message: "no harvest signals in window", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    for (let i = 0; i < threats.length; i++) {
      const t = threats[i];
      const content = synthesizeHarvestDream(t, i);
      if (dryRun) { results.push({ threat_id: t.id, preview: content.slice(0, 200), dry_run: true }); continue; }

      const { data: dr, error: drErr } = await supabase
        .from("dream_log")
        .insert({
          mode: "harvest_cross_pollination",
          seed: i + 11, // deterministic
          content,
          metadata: { source: "dream-from-harvest", threat_id: t.id, threat_type: t.threat_type },
        })
        .select("id").single();
      if (drErr) { console.error("[dream-from-harvest] dream insert failed", drErr); continue; }

      const vec = await embed(content);
      if (vec) {
        await supabase.from("brain_embeddings").insert({
          artifact_id: dr.id,
          artifact_type: "dream",
          artifact_content: content,
          embedding: vec as any,
          metadata: { source: "dream-from-harvest", threat_id: t.id, kind: "cross_pollination" },
        });
      }
      results.push({ threat_id: t.id, dream_id: dr.id, embedded: !!vec });
    }

    return new Response(
      JSON.stringify({ ok: true, processed: results.length, dry_run: dryRun, results, elapsed_ms: Date.now() - t0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[dream-from-harvest] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
