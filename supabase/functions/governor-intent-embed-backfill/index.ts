// governor-intent-embed-backfill
// One-shot: embed any governor_intent_stream rows that are not yet embedded.
// Uses OpenAI text-embedding-3-small with deterministic fallback so signal is never lost.
//
// POST { limit?: number }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function normalizeVec(v: number[]): number[] {
  if (v.length === 1536) return v;
  if (v.length > 1536) return v.slice(0, 1536);
  return v.concat(new Array(1536 - v.length).fill(0));
}

async function embedOpenAI(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const v: number[] = data?.data?.[0]?.embedding;
    return Array.isArray(v) ? normalizeVec(v) : null;
  } catch { return null; }
}

function deterministicEmbed(text: string): number[] {
  const v = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const idx = Math.abs((c * 2654435761) | 0) % 1536;
    v[idx] += Math.sin(c * 0.017 + i * 0.013);
  }
  let m = 0;
  for (const x of v) m += x * x;
  m = Math.sqrt(m) || 1;
  return v.map((x) => x / m);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(200, Math.max(1, Number(body.limit) || 100));

    const { data: rows, error: selErr } = await supabase
      .from("governor_intent_stream")
      .select("id, intent_text, scope, priority, tags")
      .eq("embedded", false)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (selErr) throw selErr;

    let embedded = 0;
    let openaiCount = 0;
    let detCount = 0;
    const failures: Array<{ id: string; reason: string }> = [];

    for (const r of rows || []) {
      const formatted = `# GOVERNOR INTENT (priority ${r.priority}, scope ${r.scope})\n${r.intent_text}`;
      let vec = await embedOpenAI(formatted);
      let provider = "openai";
      if (!vec) {
        vec = deterministicEmbed(formatted);
        provider = "deterministic";
      }
      provider === "openai" ? openaiCount++ : detCount++;

      const { data: emb, error: eErr } = await supabase
        .from("brain_embeddings")
        .insert({
          artifact_id: r.id,
          artifact_type: "governor_intent",
          artifact_content: formatted,
          embedding: vec as any,
          metadata: { source: "embed-backfill", scope: r.scope, priority: r.priority, tags: r.tags, provider },
        })
        .select("id").single();
      if (eErr || !emb) {
        failures.push({ id: r.id, reason: eErr?.message || "no embedding row returned" });
        continue;
      }
      await supabase
        .from("governor_intent_stream")
        .update({ embedded: true, embedding_id: emb.id })
        .eq("id", r.id);
      embedded++;
    }

    return new Response(
      JSON.stringify({ ok: true, scanned: rows?.length || 0, embedded, openai: openaiCount, deterministic: detCount, failures, elapsed_ms: Date.now() - t0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[governor-intent-embed-backfill] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
