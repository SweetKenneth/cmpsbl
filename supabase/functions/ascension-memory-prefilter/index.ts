// ascension-memory-prefilter
// MEMORY → ASCENSION dedupe. Given a candidate Ascension target (file digest,
// capability hints, or query), search brain_knowledge_crystals + brain_embeddings
// for prior coverage. Returns whether the substrate has already explored this
// territory and the highest similarity matches.
//
// POST { target_summary: string, capability_hints?: string[], threshold?: number }
// Returns: { already_known: boolean, top_matches: [...], skip_recommended: boolean }

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const target: string = String(body.target_summary || "").trim();
    if (!target || target.length < 8) {
      return new Response(JSON.stringify({ ok: false, error: "target_summary required (>=8 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const hints: string[] = Array.isArray(body.capability_hints) ? body.capability_hints : [];
    const threshold = typeof body.threshold === "number" ? body.threshold : 0.55;
    const skipThreshold = typeof body.skip_threshold === "number" ? body.skip_threshold : 0.78;

    const composite = [target, ...hints].join("\n").slice(0, 8000);
    const vec = await embed(composite);
    if (!vec) {
      return new Response(JSON.stringify({ ok: false, error: "embedding_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Search distilled crystals first (most authoritative)
    const { data: crystalMatches } = await supabase.rpc("match_brain_embeddings", {
      query_embedding: vec as any,
      match_threshold: threshold,
      match_count: 5,
      artifact_types: ["crystal", "knowledge_crystal"],
    }).catch(() => ({ data: [] }));

    // Also search general embeddings (broader coverage)
    const { data: anyMatches } = await supabase.rpc("match_brain_embeddings", {
      query_embedding: vec as any,
      match_threshold: threshold,
      match_count: 8,
      artifact_types: null,
    }).catch(() => ({ data: [] }));

    const top = (anyMatches || []) as any[];
    const best = top.length > 0 ? Number(top[0].similarity) : 0;
    const alreadyKnown = best >= threshold;
    const skipRecommended = best >= skipThreshold;

    return new Response(
      JSON.stringify({
        ok: true,
        target_summary: target,
        already_known: alreadyKnown,
        skip_recommended: skipRecommended,
        best_similarity: best,
        threshold,
        skip_threshold: skipThreshold,
        crystal_match_count: (crystalMatches || []).length,
        top_matches: top.slice(0, 5).map((m: any) => ({
          artifact_id: m.artifact_id,
          artifact_type: m.artifact_type,
          similarity: Number(Number(m.similarity).toFixed(4)),
          excerpt: String(m.artifact_content || "").slice(0, 400),
        })),
        elapsed_ms: Date.now() - t0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[ascension-memory-prefilter] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
