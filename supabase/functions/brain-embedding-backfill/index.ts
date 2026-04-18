// brain-embedding-backfill
// Populates the unified brain_embeddings table (vector(1536), OpenAI text-embedding-3-small) for:
//   - brain_knowledge_crystals (artifact_type='crystal')
//   - brain_reasoning_traces   (artifact_type='trace')
//   - brain_memory_warm        (artifact_type='memory_warm')
//   - brain_memory_cold        (artifact_type='memory_cold')
//   - brain_transfer_heuristics (artifact_type='heuristic')
//
// Embeddings are produced by OpenAI directly (text-embedding-3-small, native 1536-d).
// Lovable AI gateway no longer supports embedding models — calling OpenAI satisfies the
// "no Lovable AI for substrate" rule.
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
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

// Native 1536-dim. brain_embeddings is now vector(1536) — no pooling needed.
const EMBED_MODEL = "text-embedding-3-small";

type SourceConfig = {
  table: string;
  artifact_type: string;
  contentCol: string;
  idCol: string;
};

const SOURCES: Record<string, SourceConfig> = {
  crystals:    { table: "brain_knowledge_crystals", artifact_type: "crystal",     contentCol: "distilled_content",  idCol: "id" },
  traces:      { table: "brain_reasoning_traces",   artifact_type: "trace",       contentCol: "distilled_pattern",  idCol: "id" },
  memory_warm: { table: "brain_memory_warm",        artifact_type: "memory_warm", contentCol: "content",            idCol: "id" },
  memory_cold: { table: "brain_memory_cold",        artifact_type: "memory_cold", contentCol: "summary",            idCol: "id" },
  heuristics:  { table: "brain_transfer_heuristics",artifact_type: "heuristic",   contentCol: "heuristic_content",  idCol: "id" },
  // DREAM sources — autonomous cognition feedback loop
  dreams:      { table: "dream_log",                artifact_type: "dream",       contentCol: "content",            idCol: "id" },
  node_dreams: { table: "node_dream_log",           artifact_type: "dream",       contentCol: "summary",            idCol: "id" },
};

async function embed(text: string): Promise<number[] | null> {
  // OpenAI text-embedding-3-small handles up to ~8K tokens; truncate generously.
  const input = text.slice(0, 8000);
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
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
      model_version: "openai-text-embedding-3-small-1536",
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
      JSON.stringify({ ok: true, results, model: EMBED_MODEL, dim: 1536 }),
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
