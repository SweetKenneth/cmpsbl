// telemetry-to-dream
// Reads recent system health telemetry (latency, errors, costs) and converts
// significant patterns (spikes, sustained anomalies) into deterministic dreams
// for substrate self-awareness.
//
// POST { since_minutes?: number, dry_run?: boolean }

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
    const sinceMinutes = Math.min(Math.max(Number(body.since_minutes) || 240, 30), 4320);
    const dryRun = body.dry_run === true;
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000).toISOString();

    // Pull recent AI usage (latency + cost trends)
    const { data: usage } = await supabase
      .from("ai_usage_log")
      .select("provider, model, response_time_ms, cost, success, created_at")
      .gte("created_at", since)
      .limit(2000);

    if (!usage || usage.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, message: "no telemetry in window", elapsed_ms: Date.now() - t0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Group by provider, compute aggregates
    const byProvider = new Map<string, { count: number; errors: number; latSum: number; costSum: number }>();
    for (const u of usage) {
      const p = u.provider || "unknown";
      const g = byProvider.get(p) || { count: 0, errors: 0, latSum: 0, costSum: 0 };
      g.count++;
      if (u.success === false) g.errors++;
      g.latSum += Number(u.response_time_ms || 0);
      g.costSum += Number(u.cost || 0);
      byProvider.set(p, g);
    }

    const dreams: any[] = [];
    for (const [provider, agg] of byProvider.entries()) {
      const avgLat = Math.round(agg.latSum / Math.max(agg.count, 1));
      const errorRate = agg.errors / Math.max(agg.count, 1);
      const isAnomalous = errorRate > 0.1 || avgLat > 8000;
      if (!isAnomalous) continue;

      const content = [
        `# DREAM-TELEMETRY :: PROVIDER PATTERN`,
        `Provider: ${provider}`,
        `Window: last ${sinceMinutes}min — ${agg.count} calls`,
        `Avg latency: ${avgLat}ms`,
        `Error rate: ${(errorRate * 100).toFixed(1)}%`,
        `Total cost: $${agg.costSum.toFixed(4)}`,
        ``,
        `## Substrate guidance`,
        errorRate > 0.1
          ? `Provider ${provider} is degraded (${(errorRate*100).toFixed(1)}% errors). NEXUS should de-prioritize this lane until error rate falls below 5% sustained for 2 windows.`
          : `Provider ${provider} latency is elevated (${avgLat}ms). NEXUS should reserve it for non-interactive workloads only.`,
      ].join("\n");

      if (dryRun) { dreams.push({ provider, avg_latency: avgLat, error_rate: errorRate, dry_run: true }); continue; }

      const { data: dr, error: drErr } = await supabase
        .from("dream_log")
        .insert({
          mode: "telemetry_anomaly",
          seed: provider.charCodeAt(0) * 13 + agg.count,
          content,
          metadata: { source: "telemetry-to-dream", provider, avg_latency: avgLat, error_rate: errorRate },
        })
        .select("id").single();
      if (drErr) continue;

      const vec = await embed(content);
      if (vec) {
        await supabase.from("brain_embeddings").insert({
          artifact_id: dr.id,
          artifact_type: "dream",
          artifact_content: content,
          embedding: vec as any,
          metadata: { source: "telemetry-to-dream", provider, kind: "anomaly" },
        });
      }
      dreams.push({ provider, dream_id: dr.id, embedded: !!vec });
    }

    return new Response(
      JSON.stringify({ ok: true, providers_scanned: byProvider.size, anomalies_dreamed: dreams.length, dry_run: dryRun, results: dreams, elapsed_ms: Date.now() - t0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[telemetry-to-dream] fatal", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
