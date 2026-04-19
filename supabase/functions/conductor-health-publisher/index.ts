// conductor-health-publisher — periodic substrate self-awareness pipeline.
// Computes conductor health, writes a snapshot, and auto-throttles expensive
// pipelines if the substrate is degrading. Wired as a pipeline INTO the conductor
// (the conductor manages itself — recursive, deterministic, no external monitor).

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
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  try {
    // 1. Compute conductor health from last hour of runs
    const { data: runs } = await supabase
      .from('conductor_runs')
      .select('outcome, duration_ms, pipeline_name, cost_estimate_cents:work_units')
      .gte('dispatched_at', oneHourAgo);

    const r = runs ?? [];
    const failed = r.filter(x => x.outcome === 'failed').length;
    const empty = r.filter(x => x.outcome === 'empty').length;
    const success = r.filter(x => x.outcome === 'success').length;
    const total = r.length || 1;
    const avgDuration = Math.round(r.reduce((s, x) => s + (x.duration_ms ?? 0), 0) / total);

    // Health score: failures are -10, very long avg duration is -10, baseline 100
    let health = 100;
    health -= Math.min(50, failed * 10);
    if (avgDuration > 5000) health -= 10;
    if (avgDuration > 10000) health -= 20;
    health = Math.max(0, health);

    // 2. Self-throttle: if degraded, disable expensive pipelines (cost > 1)
    const { data: pipelines } = await supabase
      .from('conductor_pipelines')
      .select('id, name, cost_estimate_cents, enabled');

    const throttled: string[] = [];
    if (health < 60 && pipelines) {
      for (const p of pipelines) {
        if (p.enabled && (p.cost_estimate_cents ?? 0) > 1) {
          await supabase.from('conductor_pipelines').update({ enabled: false }).eq('id', p.id);
          throttled.push(p.name);
        }
      }
    } else if (health >= 80 && pipelines) {
      // Recovery: re-enable any pipeline marked metadata.auto_throttled
      const { data: throttledList } = await supabase
        .from('conductor_pipelines')
        .select('id, name')
        .eq('enabled', false)
        .filter('metadata->>auto_throttled', 'eq', 'true');
      for (const p of throttledList ?? []) {
        await supabase.from('conductor_pipelines').update({ enabled: true }).eq('id', p.id);
      }
    }

    // 3. Mark throttled pipelines so we know to re-enable later
    for (const name of throttled) {
      await supabase
        .from('conductor_pipelines')
        .update({ metadata: { auto_throttled: 'true', throttled_at: new Date().toISOString() } })
        .eq('name', name);
    }

    // 4. Write snapshot
    await supabase.from('conductor_health_snapshots').insert({
      active_pipelines: pipelines?.filter(p => p.enabled).length ?? 0,
      failed_runs_1h: failed,
      empty_runs_1h: empty,
      successful_runs_1h: success,
      avg_duration_ms: avgDuration,
      throttled_pipelines: throttled,
      health_score: health,
      metadata: { window: '1h', total_runs: r.length },
    });

    // 5. Mirror to system_metrics_history (substrate-wide health view)
    await supabase.from('system_metrics_history').insert({
      success_rate: total > 0 ? success / total : null,
      escalation_rate: total > 0 ? failed / total : null,
      avg_executor_health: health,
      latency_p95: avgDuration,
      integrity_health_score: health,
    });

    // The conductor counts work_units to throttle empty pipelines.
    // Treat health snapshots as 1 unit of work always so we never get throttled.
    return new Response(
      JSON.stringify({
        ok: true,
        processed: 1,
        health_score: health,
        runs_1h: r.length,
        failed,
        empty,
        success,
        throttled,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
