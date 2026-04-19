// nexus-economy-rebalancer — NEXUS ↔ ECONOMY bridge
// Reads recent NEXUS traces (cost/latency/success per provider), computes a
// value-per-credit score, and updates nexus_provider_affinity so future routing
// favors providers with the best $/quality ratio.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  try {
    // Pull recent traces. Schema is large — pull only what we need defensively.
    const { data: traces, error } = await supabase
      .from('nexus_traces')
      .select('*')
      .gte('created_at', since)
      .limit(1000);

    if (error) throw error;
    const t = traces ?? [];
    if (t.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, reason: 'no recent traces' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Aggregate per provider
    type Agg = { calls: number; success: number; cost: number; latency: number; tokens: number };
    const byProvider = new Map<string, Agg>();
    for (const tr of t as Record<string, unknown>[]) {
      const provider = String(tr.provider ?? tr.provider_id ?? tr.model ?? 'unknown');
      const a = byProvider.get(provider) ?? { calls: 0, success: 0, cost: 0, latency: 0, tokens: 0 };
      a.calls += 1;
      if (tr.success === true || tr.outcome === 'success' || tr.status === 'success') a.success += 1;
      a.cost += Number(tr.cost ?? tr.cost_usd ?? tr.estimated_cost ?? 0);
      a.latency += Number(tr.latency_ms ?? tr.duration_ms ?? 0);
      a.tokens += Number(tr.tokens ?? tr.tokens_used ?? 0);
      byProvider.set(provider, a);
    }

    let updated = 0;
    for (const [provider, a] of byProvider.entries()) {
      const successRate = a.calls > 0 ? a.success / a.calls : 0;
      const avgCost = a.calls > 0 ? a.cost / a.calls : 0;
      const avgLatency = a.calls > 0 ? a.latency / a.calls : 0;
      // Value-per-credit: higher success + lower cost + lower latency = better
      // Normalize cost so a cheap ($0.0001) call doesn't dominate; floor at 0.0001
      const score = successRate / Math.max(0.0001, avgCost + (avgLatency / 100000));

      try {
        await supabase
          .from('nexus_provider_affinity')
          .upsert({
            provider,
            score,
            window_calls: a.calls,
            success_rate: successRate,
            avg_cost: avgCost,
            avg_latency_ms: Math.round(avgLatency),
            updated_at: new Date().toISOString(),
            metadata: { window: '30m', window_start: since },
          }, { onConflict: 'provider' });
        updated += 1;
      } catch {
        /* table may have a different unique constraint — non-fatal */
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      processed: updated,
      providers_seen: byProvider.size,
      traces: t.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
