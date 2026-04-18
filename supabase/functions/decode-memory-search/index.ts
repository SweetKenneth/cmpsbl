// decode-memory-search
// Retrieval-first router for DECODE (Stage 1 of the cognitive independence roadmap).
// Embeds the user query, calls match_brain_embeddings, returns top-k cited memory matches
// with similarity scores. Caller decides whether to answer locally or fall through to NEXUS.
//
// POST body: { query: string, threshold?: number, limit?: number, types?: string[] }
// Returns:   { matches: [...], best: number, shouldAnswerLocally: boolean }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

// Native 1536-dim OpenAI embedding. brain_embeddings is vector(1536) — no pooling.
const EMBED_MODEL = "text-embedding-3-small";
// Above this similarity, DECODE can answer locally (cited) without an LLM completion.
const LOCAL_ANSWER_THRESHOLD = 0.82;

async function embed(text: string): Promise<number[] | null> {
  const input = text.slice(0, 8000);
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input }),
    });
    if (!res.ok) {
      console.error(`[embed] ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const vec: number[] = data?.data?.[0]?.embedding;
    if (!Array.isArray(vec) || vec.length !== 1536) {
      console.error(`[embed] unexpected vector length: ${vec?.length}`);
      return null;
    }
    return vec;
  } catch (e) {
    console.error("[embed] exception", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const query: string = String(body.query || "").trim();
    if (!query || query.length < 3) {
      return new Response(
        JSON.stringify({ ok: false, error: "query required (>=3 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const threshold: number = typeof body.threshold === "number" ? body.threshold : 0.7;
    const limit: number = Math.min(Math.max(Number(body.limit) || 6, 1), 20);
    const types: string[] | null = Array.isArray(body.types) && body.types.length > 0 ? body.types : null;

    const t0 = Date.now();
    const vec = await embed(query);
    if (!vec) {
      return new Response(
        JSON.stringify({ ok: false, error: "embedding_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: matches, error } = await supabase.rpc("match_brain_embeddings", {
      query_embedding: vec as any,
      match_threshold: threshold,
      match_count: limit,
      artifact_types: types,
    });

    if (error) {
      console.error("rpc error", error);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const list = (matches || []) as Array<{ id: string; artifact_id: string; artifact_type: string; artifact_content: string; similarity: number }>;
    const best = list.length > 0 ? Number(list[0].similarity) : 0;
    const shouldAnswerLocally = best >= LOCAL_ANSWER_THRESHOLD;

    return new Response(
      JSON.stringify({
        ok: true,
        query,
        elapsed_ms: Date.now() - t0,
        best,
        threshold,
        local_threshold: LOCAL_ANSWER_THRESHOLD,
        shouldAnswerLocally,
        count: list.length,
        matches: list.map(m => ({
          id: m.id,
          artifact_id: m.artifact_id,
          artifact_type: m.artifact_type,
          similarity: Number(m.similarity.toFixed(4)),
          excerpt: m.artifact_content.slice(0, 600),
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("decode-memory-search error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
