// governor-intent-capture
// Captures Governor strategic reasoning into governor_intent_stream and embeds it
// into brain_embeddings as artifact_type='governor_intent' so DECODE/CLM/DREAM can
// recall the founder's intent on every relevant cycle.
//
// POST { intent_text: string, scope?: string, priority?: number, tags?: string[], linked_refs?: string[] }

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function normalizeVec(vec: number[]): number[] {
  if (vec.length === 1536) return vec;
  if (vec.length > 1536) return vec.slice(0, 1536);
  return vec.concat(new Array(1536 - vec.length).fill(0));
}

async function embedViaOpenAI(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text.slice(0, 8000) }),
    });
    if (!res.ok) {
      console.error(`[governor-intent-capture] openai ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const data = await res.json();
    const vec: number[] = data?.data?.[0]?.embedding;
    return Array.isArray(vec) ? normalizeVec(vec) : null;
  } catch (e) {
    console.error("[governor-intent-capture] openai exception", e);
    return null;
  }
}

// Deterministic fallback so governor intent is never lost when providers are down.
function deterministicEmbed(text: string): number[] {
  const vec = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const idx = Math.abs((code * 2654435761) | 0) % 1536;
    vec[idx] += Math.sin(code * 0.017 + i * 0.013);
  }
  let mag = 0;
  for (const v of vec) mag += v * v;
  mag = Math.sqrt(mag) || 1;
  return vec.map((v) => v / mag);
}

async function embed(text: string): Promise<{ vec: number[]; provider: string }> {
  const v = await embedViaOpenAI(text);
  if (v) return { vec: v, provider: "openai" };
  console.warn("[governor-intent-capture] using deterministic embedding fallback");
  return { vec: deterministicEmbed(text), provider: "deterministic" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const intentText: string = String(body.intent_text || "").trim();
    if (!intentText || intentText.length < 12) {
      return new Response(JSON.stringify({ ok: false, error: "intent_text required (>=12 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const scope = String(body.scope || "substrate");
    const priority = Math.max(1, Math.min(10, Number(body.priority) || 7));
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const linked = Array.isArray(body.linked_refs) ? body.linked_refs : [];

    // Persist intent
    const { data: row, error: insErr } = await supabase
      .from("governor_intent_stream")
      .insert({
        intent_text: intentText,
        scope,
        priority,
        source: body.source || "governor-intent-capture",
        linked_refs: linked,
        tags,
        metadata: body.metadata || {},
      })
      .select("id").single();
    if (insErr) throw insErr;

    // Embed for recall (with deterministic fallback so signal is never lost)
    const formatted = `# GOVERNOR INTENT (priority ${priority}, scope ${scope})\n${intentText}`;
    const { vec, provider } = await embed(formatted);
    let embeddingId: string | null = null;
    let embedError: string | null = null;
    const { data: emb, error: eErr } = await supabase
      .from("brain_embeddings")
      .insert({
        artifact_id: row.id,
        artifact_type: "governor_intent",
        artifact_content: formatted,
        embedding: vec as any,
        metadata: { source: "governor-intent-capture", scope, priority, tags, provider },
      })
      .select("id").single();
    if (eErr) {
      embedError = eErr.message;
      console.error("[governor-intent-capture] brain_embeddings insert failed", eErr);
    } else if (emb) {
      embeddingId = emb.id;
      await supabase.from("governor_intent_stream").update({ embedded: true, embedding_id: emb.id }).eq("id", row.id);
    }

    return new Response(
      JSON.stringify({ ok: true, intent_id: row.id, embedded: !!embeddingId, embedding_id: embeddingId, embed_provider: provider, embed_error: embedError, elapsed_ms: Date.now() - t0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[governor-intent-capture] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
