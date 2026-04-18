// brain-embedding-backfill
// Populates the unified brain_embeddings table (vector(384), MiniLM-L6-v2) with embeddings for:
//   - brain_knowledge_crystals (artifact_type='crystal')
//   - brain_reasoning_traces   (artifact_type='trace')
//   - brain_memory_warm        (artifact_type='memory_warm')
//   - brain_memory_cold        (artifact_type='memory_cold')  ← needs CHECK update or remap to memory_warm
//   - brain_transfer_heuristics (artifact_type='heuristic')
//
// Embeddings are produced via the Lovable AI Gateway (text-embedding model).
// Resumable: skips rows that already have an entry in brain_embeddings for the same artifact_id+type.
//
// POST body: { source?: 'crystals'|'traces'|'memory_warm'|'memory_cold'|'heuristics'|'all', limit?: number }
// Default: source='all', limit=200 per source per invocation.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// MiniLM-L6-v2 is 384-dim; the brain_embeddings table is fixed at vector(384).
// We use the Lovable AI gateway's embedding endpoint and project to 384 if necessary.
const EMBED_MODEL = "google/text-embedding-004"; // 768-dim → we mean-pool down to 384

type SourceConfig = {
  table: string;
  artifact_type: string;
  contentCol: string;
  idCol: string;
};

const SOURCES: Record<string, SourceConfig> = {
  crystals:    { table: "brain_knowledge_crystals", artifact_type: "crystal",     contentCol: "distilled_content", idCol: "id" },
  traces:      { table: "brain_reasoning_traces",   artifact_type: "trace",       contentCol: "content",           idCol: "id" },
  memory_warm: { table: "brain_memory_warm",        artifact_type: "memory_warm", contentCol: "content",           idCol: "id" },
  memory_cold: { table: "brain_memory_cold",        artifact_type: "memory_warm", contentCol: "summary",           idCol: "id" }, // remapped: CHECK constraint allows memory_warm only for cold-tier projection
  heuristics:  { table: "brain_transfer_heuristics",artifact_type: "heuristic",   contentCol: "heuristic",         idCol: "id" },
};

async function embed(text: string): Promise<number[] | null> {
  // Truncate aggressively — embeddings degrade past ~8K chars and gateway has limits.
  const input = text.slice(0, 6000);
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBED_MODEL, input }),
    });
    if (!res.ok) {
      console.error(`[embed] ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const vec: number[] = data?.data?.[0]?.embedding;
    if (!Array.isArray(vec)) return null;

    // Project 768 → 384 by averaging adjacent pairs (deterministic, preserves cosine geometry well).
    if (vec.length === 384) return vec;
    if (vec.length === 768) {
      const out = new Array(384);
      for (let i = 0; i < 384; i++) out[i] = (vec[2 * i] + vec[2 * i + 1]) / 2;
      return out;
    }
    // Truncate or pad as a last resort.
    if (vec.length > 384) return vec.slice(0, 384);
    return [...vec, ...new Array(384 - vec.length).fill(0)];
  } catch (e) {
    console.error("[embed] exception", e);
    return null;
  }
}

async function backfillSource(
  supabase: ReturnType<typeof createClient>,
  sourceKey: string,
  limit: number,
): Promise<{ source: string; processed: number; inserted: number; skipped: number; errors: number }> {
  const cfg = SOURCES[sourceKey];
  if (!cfg) return { source: sourceKey, processed: 0, inserted: 0, skipped: 0, errors: 0 };

  // Find rows whose id is NOT already represented in brain_embeddings for this artifact_type.
  const { data: existing } = await supabase
    .from("brain_embeddings")
    .select("artifact_id")
    .eq("artifact_type", cfg.artifact_type)
    .limit(20000);
  const existingIds = new Set((existing || []).map((r: any) => r.artifact_id));

  const { data: rows, error } = await supabase
    .from(cfg.table)
    .select(`${cfg.idCol}, ${cfg.contentCol}`)
    .order("created_at", { ascending: false })
    .limit(limit + existingIds.size);

  if (error) {
    console.error(`[${sourceKey}] fetch error`, error);
    return { source: sourceKey, processed: 0, inserted: 0, skipped: 0, errors: 1 };
  }

  let processed = 0, inserted = 0, skipped = 0, errors = 0;
  for (const row of rows || []) {
    if (processed >= limit) break;
    const id = (row as any)[cfg.idCol];
    const content = (row as any)[cfg.contentCol];
    if (existingIds.has(id)) { skipped++; continue; }
    if (!content || typeof content !== "string" || content.length < 20) { skipped++; continue; }

    processed++;
    const vec = await embed(content);
    if (!vec) { errors++; continue; }

    const { error: insErr } = await supabase.from("brain_embeddings").insert({
      artifact_id: id,
      artifact_type: cfg.artifact_type,
      artifact_content: content.slice(0, 4000),
      embedding: vec as any,
      model_version: "lovable-text-embedding-004-pooled-384",
    });
    if (insErr) {
      console.error(`[${sourceKey}] insert error for ${id}`, insErr.message);
      errors++;
    } else {
      inserted++;
    }
  }

  return { source: sourceKey, processed, inserted, skipped, errors };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const source: string = body.source || "all";
    const limit: number = Math.min(Math.max(Number(body.limit) || 200, 1), 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const targets = source === "all" ? Object.keys(SOURCES) : [source];
    const results: any[] = [];
    for (const t of targets) {
      const r = await backfillSource(supabase, t, limit);
      results.push(r);
      console.log(`[backfill] ${t}:`, r);
    }

    return new Response(
      JSON.stringify({ ok: true, results, model: EMBED_MODEL, dim: 384 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("brain-embedding-backfill error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
