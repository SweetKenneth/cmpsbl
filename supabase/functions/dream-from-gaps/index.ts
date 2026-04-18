// dream-from-gaps
// DECODE → DREAM gap-driven synthesis cycle.
// Pulls highest-priority unaddressed DECODE gaps (lowest similarity, most attempts),
// runs deterministic DREAM synthesis seeded by the gap query, embeds the result into
// brain_embeddings as artifact_type='dream', and marks the gap addressed.
//
// Trigger: cron / manual / governor button. POST { limit?: number, dry_run?: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const EMBED_MODEL = "text-embedding-3-small";

async function embed(text: string): Promise<number[] | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 8000) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const vec: number[] = data?.data?.[0]?.embedding;
    return Array.isArray(vec) && vec.length === 1536 ? vec : null;
  } catch {
    return null;
  }
}

// Deterministic DREAM synthesis — sub-threshold algorithmic, no LLM.
// Combines gap query with related substrate context to produce a candidate insight.
function synthesizeDreamFromGap(query: string, relatedExcerpts: string[], seed: number): string {
  const norm = query.replace(/\s+/g, " ").trim();
  const ctx = relatedExcerpts.slice(0, 3).map((e, i) => `[ref-${i + 1}] ${e.slice(0, 240)}`).join("\n");
  const angles = [
    "PROCEDURAL", "RATIONALE", "FAILURE-MODE", "CROSS-DOMAIN", "TEMPORAL", "CONSTRAINT",
  ];
  const angle = angles[Math.abs(seed) % angles.length];
  return [
    `# DREAM-GAP-FILL :: ${angle}`,
    `Seed query: ${norm}`,
    `Synthesis angle: ${angle}`,
    ctx ? `Related substrate context:\n${ctx}` : `No prior context — pure novelty seed.`,
    `Hypothesis: This gap likely persists because the substrate has captured outcomes but not the ${angle.toLowerCase()} dimension of "${norm}". A targeted CLM cycle on this angle should close the gap within 2-3 iterations.`,
    `Status: provisional; promote on next DECODE recall match.`,
  ].join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 50);
    const dryRun = body.dry_run === true;

    // Pull worst-similarity, most-attempted unaddressed gaps first.
    const { data: gaps, error: gapErr } = await supabase
      .from("decode_gap_log")
      .select("id, query, best_similarity, attempts, artifact_types")
      .eq("addressed", false)
      .order("attempts", { ascending: false })
      .order("best_similarity", { ascending: true })
      .limit(limit);

    if (gapErr) throw gapErr;
    if (!gaps || gaps.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "no unaddressed gaps", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const results: any[] = [];

    for (const gap of gaps) {
      // Pull whatever weak signals we DO have for context.
      const seedVec = await embed(gap.query);
      let relatedExcerpts: string[] = [];
      if (seedVec) {
        const { data: matches } = await supabase.rpc("match_brain_embeddings", {
          query_embedding: seedVec as any,
          match_threshold: 0.1,
          match_count: 3,
          artifact_types: null,
        });
        relatedExcerpts = (matches || []).map((m: any) => String(m.artifact_content || ""));
      }

      const seed = (gap.id as string).split("-").reduce((a, b) => a + parseInt(b.slice(0, 4), 16) || 0, 0);
      const dreamContent = synthesizeDreamFromGap(gap.query, relatedExcerpts, seed);

      if (dryRun) {
        results.push({ gap_id: gap.id, query: gap.query, preview: dreamContent.slice(0, 200), dry_run: true });
        continue;
      }

      // Persist to dream_log
      const { data: dreamRow, error: dreamErr } = await supabase
        .from("dream_log")
        .insert({
          mode: "gap_fill",
          seed,
          content: dreamContent,
          metadata: {
            source: "decode_gap_log",
            gap_id: gap.id,
            original_query: gap.query,
            best_similarity: gap.best_similarity,
            attempts: gap.attempts,
            related_count: relatedExcerpts.length,
          },
        })
        .select("id")
        .single();

      if (dreamErr) {
        console.error("[dream-from-gaps] dream_log insert failed", dreamErr);
        continue;
      }

      // Embed the dream so DECODE recalls it next time.
      const dreamVec = seedVec ? await embed(dreamContent) : null;
      if (dreamVec) {
        await supabase.from("brain_embeddings").insert({
          artifact_id: dreamRow.id,
          artifact_type: "dream",
          artifact_content: dreamContent,
          embedding: dreamVec as any,
          metadata: { source: "dream-from-gaps", gap_id: gap.id, original_query: gap.query },
        });
      }

      // Mark gap addressed
      await supabase
        .from("decode_gap_log")
        .update({
          addressed: true,
          addressed_at: new Date().toISOString(),
          dream_id: dreamRow.id,
        })
        .eq("id", gap.id);

      results.push({
        gap_id: gap.id,
        dream_id: dreamRow.id,
        query: gap.query,
        embedded: !!dreamVec,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed: results.length,
        dry_run: dryRun,
        results,
        elapsed_ms: Date.now() - t0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[dream-from-gaps] fatal", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
