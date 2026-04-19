// dream-from-intent
// DREAM Engine — algorithmic synthesis from sub-threshold governor intents.
// No LLM. Deterministic scoring over (tag overlap × vector resonance × priority × recency).
// Writes patentable lineage records into dream_intent_syntheses.
//
// POST {} or scheduled via cron.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── Tunables (the moat — kept simple here, can be elevated to a weights table later) ──
const RECENT_INTENT_LIMIT = 50;        // pull last N intents for the cycle
const MIN_CLUSTER_SIZE = 2;            // need ≥N intents to call it a resonance
const MAX_CLUSTERS = 8;                // cap output per cycle
const PROMOTION_FLOOR = 0.40;          // total score must clear this
const W_TAG = 0.40;
const W_VECTOR = 0.30;
const W_PRIORITY = 0.20;
const W_RECENCY = 0.10;

type IntentRow = {
  id: string;
  intent_text: string;
  scope: string;
  priority: number;
  tags: string[] | null;
  embedded: boolean;
  embedding_id: string | null;
  created_at: string;
};

type EmbRow = { id: string; artifact_id: string; embedding: number[] | null };

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0;
  const A = new Set(a.map((x) => x.toLowerCase()));
  const B = new Set(b.map((x) => x.toLowerCase()));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function recencyScore(iso: string, nowMs: number): number {
  const ageH = Math.max(0, (nowMs - new Date(iso).getTime()) / 3_600_000);
  // Decay: full credit <6h, half by 48h, near zero by 7d
  return Math.exp(-ageH / 36);
}

function priorityScore(p: number): number {
  // priority in 1..10, normalize
  return Math.max(0, Math.min(1, (p - 1) / 9));
}

// Greedy cluster: seed with highest-priority intent, attach others by combined sim≥threshold
function clusterIntents(
  intents: IntentRow[],
  vecMap: Map<string, number[]>,
  nowMs: number,
): Array<{ seed: IntentRow; members: IntentRow[]; score: number; breakdown: any }> {
  const remaining = [...intents].sort((a, b) =>
    (b.priority - a.priority) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );
  const clusters: Array<{ seed: IntentRow; members: IntentRow[]; score: number; breakdown: any }> = [];

  while (remaining.length && clusters.length < MAX_CLUSTERS) {
    const seed = remaining.shift()!;
    const seedVec = seed.embedding_id ? vecMap.get(seed.embedding_id) : undefined;
    const seedTags = seed.tags || [];
    const members: IntentRow[] = [seed];
    const used: number[] = [];

    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      const candVec = cand.embedding_id ? vecMap.get(cand.embedding_id) : undefined;
      const tagSim = jaccard(seedTags, cand.tags || []);
      const vecSim = (seedVec && candVec) ? Math.max(0, cosine(seedVec, candVec)) : 0;
      const combined = W_TAG * tagSim + W_VECTOR * vecSim;
      // Attach if either signal is meaningful or both are at least nonzero
      if (combined >= 0.18 || (tagSim >= 0.25) || (vecSim >= 0.55)) {
        members.push(cand);
        used.push(i);
      }
    }
    // Remove used members
    for (let k = used.length - 1; k >= 0; k--) remaining.splice(used[k], 1);

    if (members.length < MIN_CLUSTER_SIZE) continue;

    // Score the cluster
    const tagOverlapAvg = members.length > 1
      ? members.slice(1).reduce((s, m) => s + jaccard(seedTags, m.tags || []), 0) / (members.length - 1)
      : 0;
    let vecResAvg = 0;
    if (seedVec) {
      let n = 0, sum = 0;
      for (let i = 1; i < members.length; i++) {
        const v = members[i].embedding_id ? vecMap.get(members[i].embedding_id!) : undefined;
        if (v) { sum += Math.max(0, cosine(seedVec, v)); n++; }
      }
      vecResAvg = n ? sum / n : 0;
    }
    const priAvg = members.reduce((s, m) => s + priorityScore(m.priority), 0) / members.length;
    const recAvg = members.reduce((s, m) => s + recencyScore(m.created_at, nowMs), 0) / members.length;
    const total =
      W_TAG * tagOverlapAvg +
      W_VECTOR * vecResAvg +
      W_PRIORITY * priAvg +
      W_RECENCY * recAvg;

    clusters.push({
      seed,
      members,
      score: total,
      breakdown: {
        tag_overlap: +tagOverlapAvg.toFixed(4),
        vector_resonance: +vecResAvg.toFixed(4),
        priority_weight: +priAvg.toFixed(4),
        recency_weight: +recAvg.toFixed(4),
        total: +total.toFixed(4),
        weights: { W_TAG, W_VECTOR, W_PRIORITY, W_RECENCY },
        promotion_floor: PROMOTION_FLOOR,
      },
    });
  }
  return clusters;
}

function summarizeCluster(seed: IntentRow, members: IntentRow[]): { insight: string; kind: string; tags: string[] } {
  const allTags = Array.from(new Set(members.flatMap((m) => m.tags || []))).slice(0, 8);
  const scopes = Array.from(new Set(members.map((m) => m.scope)));
  const headlines = members.slice(0, 3).map((m) => {
    const t = m.intent_text.replace(/\s+/g, " ").trim();
    return t.length > 140 ? t.slice(0, 137) + "…" : t;
  });
  const kind = scopes.length > 1 ? "convergence" : "resonance";
  const insight =
    `Sub-threshold ${kind} across ${members.length} intents` +
    (allTags.length ? ` (tags: ${allTags.join(", ")})` : "") +
    `. Anchor: "${headlines[0]}". ` +
    (headlines.length > 1 ? `Reinforced by: ${headlines.slice(1).map((h) => `"${h}"`).join("; ")}.` : "") +
    ` Scope${scopes.length > 1 ? "s" : ""}: ${scopes.join(", ")}.`;
  return { insight, kind, tags: allTags };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const t0 = Date.now();
  const cycleId = `dii_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    // 1. Pull recent intents
    const { data: intents, error: iErr } = await supabase
      .from("governor_intent_stream")
      .select("id, intent_text, scope, priority, tags, embedded, embedding_id, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_INTENT_LIMIT);
    if (iErr) throw iErr;

    if (!intents || intents.length < MIN_CLUSTER_SIZE) {
      return new Response(JSON.stringify({ ok: true, cycle_id: cycleId, reason: "insufficient_intents", count: intents?.length || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 2. Pull embeddings for embedded intents
    const embIds = (intents as IntentRow[]).map((i) => i.embedding_id).filter(Boolean) as string[];
    const vecMap = new Map<string, number[]>();
    if (embIds.length) {
      const { data: embs } = await supabase
        .from("brain_embeddings")
        .select("id, embedding")
        .in("id", embIds);
      for (const e of (embs as EmbRow[]) || []) {
        if (e.embedding) vecMap.set(e.id, e.embedding as unknown as number[]);
      }
    }

    // 3. Cluster + score
    const clusters = clusterIntents(intents as IntentRow[], vecMap, Date.now());

    // 4. Promote those clearing the floor → write syntheses
    const promoted = clusters.filter((c) => c.score >= PROMOTION_FLOOR);
    const written: any[] = [];
    for (const c of promoted) {
      const { insight, kind, tags } = summarizeCluster(c.seed, c.members);
      const sourceIds = c.members.map((m) => m.id);
      const fragmentIds = c.members.map((m) => m.embedding_id).filter(Boolean) as string[];
      const { data: row, error: insErr } = await supabase
        .from("dream_intent_syntheses")
        .insert({
          cycle_id: cycleId,
          insight_text: insight,
          synthesis_kind: kind,
          source_intent_ids: sourceIds,
          matched_fragment_ids: fragmentIds,
          scoring: c.breakdown,
          confidence: c.score,
          tags,
          status: "active",
          metadata: {
            seed_intent_id: c.seed.id,
            member_count: c.members.length,
            engine: "dream-from-intent",
            engine_version: "1.0.0",
          },
        })
        .select("id, insight_text, confidence, created_at")
        .single();
      if (!insErr && row) written.push(row);
    }

    return new Response(JSON.stringify({
      ok: true,
      cycle_id: cycleId,
      intents_scanned: intents.length,
      clusters_found: clusters.length,
      promoted: written.length,
      below_floor: clusters.length - written.length,
      syntheses: written,
      elapsed_ms: Date.now() - t0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[dream-from-intent] fatal", e);
    return new Response(JSON.stringify({ ok: false, cycle_id: cycleId, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
