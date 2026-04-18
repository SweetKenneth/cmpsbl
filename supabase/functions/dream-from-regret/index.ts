// dream-from-regret
// Negative-space synthesis: read undreamed regrets, generate counterfactual
// "what should have happened instead" dreams, embed them into brain_embeddings.
// Patentable wiring — turns failures into durable substrate wisdom.
//
// POST { limit?: number, dry_run?: boolean }

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

function synthesizeRegretDream(r: any): string {
  const counterfactuals = [
    `Pre-flight check: validate the precondition that caused failure before re-attempting`,
    `Add a guardrail upstream so this decision cannot be made under the same conditions`,
    `Promote the failure signature to DEFENSE/IMMUNITY as a known anti-pattern`,
    `Slow-path the decision: require a confirmation step instead of auto-execution`,
    `Capture the missing context that would have prevented this — feed into CLM`,
  ];
  const idx = Math.abs((r.id as string).charCodeAt(0) + (r.id as string).charCodeAt(8)) % counterfactuals.length;
  return [
    `# DREAM-REGRET :: NEGATIVE-SPACE SYNTHESIS`,
    `Source: ${r.source_module} / ${r.decision_type}`,
    `Decision: ${r.decision_summary}`,
    `Outcome: ${r.outcome_summary}`,
    `Severity: ${r.severity}/10`,
    ``,
    `## Counterfactual`,
    `What should have happened: ${counterfactuals[idx]}.`,
    ``,
    `## Substrate guidance`,
    `When a similar decision is proposed, recall this regret. If the conditions match within 2 dimensions (source_module + decision_type), require an explicit override or escalate to IMMUNITY for a shadow-mode evaluation before commit.`,
    ``,
    `Tags: ${(r.tags || []).join(", ") || "regret, counterfactual"}`,
  ].join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 50);
    const dryRun = body.dry_run === true;

    const { data: regrets, error } = await supabase
      .from("brain_regret_log")
      .select("*")
      .eq("dreamed", false)
      .order("severity", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    if (!regrets || regrets.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "no undreamed regrets", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: any[] = [];

    for (const r of regrets) {
      const content = synthesizeRegretDream(r);
      if (dryRun) { results.push({ regret_id: r.id, preview: content.slice(0, 220), dry_run: true }); continue; }

      const { data: dreamRow, error: drErr } = await supabase
        .from("dream_log")
        .insert({
          mode: "regret_counterfactual",
          seed: Math.abs(r.severity * 7919 + (r.id as string).length),
          content,
          metadata: {
            source: "dream-from-regret",
            regret_id: r.id,
            source_module: r.source_module,
            decision_type: r.decision_type,
            severity: r.severity,
          },
        })
        .select("id")
        .single();

      if (drErr) { console.error("[dream-from-regret] dream insert failed", drErr); continue; }

      const vec = await embed(content);
      if (vec) {
        await supabase.from("brain_embeddings").insert({
          artifact_id: dreamRow.id,
          artifact_type: "dream",
          artifact_content: content,
          embedding: vec as any,
          metadata: { source: "dream-from-regret", regret_id: r.id, kind: "counterfactual" },
        });
      }

      await supabase.from("brain_regret_log").update({
        dreamed: true,
        dreamed_at: new Date().toISOString(),
        dream_id: dreamRow.id,
      }).eq("id", r.id);

      results.push({ regret_id: r.id, dream_id: dreamRow.id, embedded: !!vec });
    }

    return new Response(
      JSON.stringify({ ok: true, processed: results.length, dry_run: dryRun, results, elapsed_ms: Date.now() - t0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[dream-from-regret] fatal", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
