// dream-embedding-sync
// Embeds new entries from dream_log, node_dream_log, and cascade_dreams into
// brain_embeddings (artifact_type='dream') so DREAM-generated thoughts flow
// into DECODE's recall context — the autonomous-cognition feedback loop.
//
// Resumable: skips rows already embedded for the same artifact_id+type.
// POST body: { source?: 'dream_log'|'node_dream_log'|'cascade_dreams'|'all', limit?: number }

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

type DreamSource = {
  table: string;
  contentCol: string;
  idCol: string;
  metaCol?: string;
};

const SOURCES: Record<string, DreamSource> = {
  dream_log:       { table: "dream_log",       contentCol: "content", idCol: "id", metaCol: "metadata" },
  node_dream_log:  { table: "node_dream_log",  contentCol: "summary", idCol: "id" },
  cascade_dreams:  { table: "cascade_dreams",  contentCol: "narrative", idCol: "id" },
};

async function embed(text: string): Promise<number[] | null> {
  const input = text.slice(0, 8000);
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input }),
    });
    if (!res.ok) {
      console.error(`[dream-embed] ${res.status}: ${await res.text()}`);
      return null;
    }
    const data = await res.json();
    const vec: number[] = data?.data?.[0]?.embedding;
    if (!Array.isArray(vec) || vec.length !== 1536) return null;
    return vec;
  } catch (e) {
    console.error("[dream-embed] exception", e);
    return null;
  }
}

async function syncSource(
  supabase: ReturnType<typeof createClient>,
  sourceKey: string,
  limit: number,
) {
  const cfg = SOURCES[sourceKey];
  if (!cfg) return { source: sourceKey, processed: 0, inserted: 0, skipped: 0, errors: 0, error: "unknown source" };

  // Fetch already-embedded ids for this source
  const { data: existing } = await supabase
    .from("brain_embeddings")
    .select("artifact_id")
    .eq("artifact_type", "dream")
    .eq("source_table", cfg.table)
    .limit(50000);
  const existingIds = new Set((existing || []).map((r: any) => r.artifact_id));

  // Pull candidate rows
  const cols = cfg.metaCol
    ? `${cfg.idCol}, ${cfg.contentCol}, ${cfg.metaCol}, created_at`
    : `${cfg.idCol}, ${cfg.contentCol}, created_at`;
  const { data: rows, error } = await supabase
    .from(cfg.table)
    .select(cols)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { source: sourceKey, processed: 0, inserted: 0, skipped: 0, errors: 1, error: error.message };

  let inserted = 0, skipped = 0, errors = 0;
  for (const row of (rows || []) as any[]) {
    const id = row[cfg.idCol];
    const content = row[cfg.contentCol];
    if (existingIds.has(id)) { skipped++; continue; }
    if (!content || typeof content !== "string" || content.trim().length < 10) { skipped++; continue; }

    const vec = await embed(content);
    if (!vec) { errors++; continue; }

    const { error: insErr } = await supabase.from("brain_embeddings").insert({
      artifact_id: id,
      artifact_type: "dream",
      source_table: cfg.table,
      content: content.slice(0, 2000),
      embedding: vec,
      metadata: cfg.metaCol ? (row[cfg.metaCol] || {}) : {},
    });
    if (insErr) { console.error(`[dream-embed] insert ${id}`, insErr.message); errors++; }
    else inserted++;
  }

  return { source: sourceKey, processed: (rows || []).length, inserted, skipped, errors };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const source = (body.source || "all") as string;
    const limit = Math.min(Math.max(parseInt(body.limit || "100", 10), 1), 500);

    const sources = source === "all" ? Object.keys(SOURCES) : [source];
    const results: any[] = [];
    for (const s of sources) results.push(await syncSource(supabase, s, limit));

    const totals = results.reduce(
      (acc, r) => ({
        processed: acc.processed + (r.processed || 0),
        inserted: acc.inserted + (r.inserted || 0),
        skipped: acc.skipped + (r.skipped || 0),
        errors: acc.errors + (r.errors || 0),
      }),
      { processed: 0, inserted: 0, skipped: 0, errors: 0 }
    );

    return new Response(
      JSON.stringify({ ok: true, model: EMBED_MODEL, dim: 1536, totals, sources: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[dream-embedding-sync] fatal", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
