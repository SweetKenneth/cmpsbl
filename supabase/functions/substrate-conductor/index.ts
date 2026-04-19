// substrate-conductor — dynamic, signal-driven pipeline orchestrator (CONDUCTOR subsystem).
//
// Now manages 30+ cognitive pipelines off a single 2-minute heartbeat.
// Tuning improvements vs prior version:
//   • Pipelines evaluated in priority order (highest first) so under load the
//     critical work fires first and the lowest-priority pipelines are deferred
//     to the next tick.
//   • Dispatch is parallel with a concurrency cap (default 6) — a tick
//     containing 17 ready pipelines no longer serializes 17 HTTP calls.
//   • Per-tick wall-clock budget caps total time so the conductor itself
//     never blocks the next pg_cron heartbeat.
//   • is_fallback pipelines run at the lowest effective priority.
//
// Decision order per pipeline (unchanged):
//   1. cooldown (min_interval_seconds since last_run_at) → skip if violated
//   2. signal pressure ≥ effective_threshold → dispatch
//   3. ceiling (max_interval_seconds elapsed) → dispatch
//   4. otherwise → skip
// Adaptive backoff: 3 consecutive empty runs doubles the threshold.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const CONCURRENCY = 6;            // Max parallel dispatches per tick
const TICK_BUDGET_MS = 90_000;    // Hard wall-clock budget per tick (well under the 120s heartbeat)

interface Pipeline {
  id: string;
  name: string;
  target_function: string;
  target_payload: Record<string, unknown>;
  min_interval_seconds: number;
  max_interval_seconds: number;
  signal_query: string | null;
  signal_threshold: number;
  cost_estimate_cents: number;
  enabled: boolean;
  last_run_at: string | null;
  consecutive_empty_runs: number;
  priority: number;
  is_fallback: boolean;
}

interface Decision {
  pipeline: string;
  action: 'dispatch' | 'skip' | 'deferred';
  reason: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const tickStart = Date.now();

  try {
    const { data: pipelines, error } = await supabase
      .from('conductor_pipelines')
      .select('*')
      .eq('enabled', true);

    if (error) throw error;

    // Sort: highest priority first; fallback pipelines run last within their priority bucket
    const ordered = ((pipelines ?? []) as Pipeline[]).sort((a, b) => {
      if (a.is_fallback !== b.is_fallback) return a.is_fallback ? 1 : -1;
      return (b.priority ?? 50) - (a.priority ?? 50);
    });

    const decisions: Decision[] = [];
    const dispatchQueue: Pipeline[] = [];

    // Phase 1: evaluate every pipeline (cheap — one RPC each at most), build dispatch queue
    for (const p of ordered) {
      const now = Date.now();
      const lastRunMs = p.last_run_at ? new Date(p.last_run_at).getTime() : 0;
      const elapsedSec = lastRunMs > 0 ? (now - lastRunMs) / 1000 : Number.POSITIVE_INFINITY;

      if (lastRunMs > 0 && elapsedSec < p.min_interval_seconds) {
        decisions.push({ pipeline: p.name, action: 'skip', reason: `cooldown ${Math.round(p.min_interval_seconds - elapsedSec)}s remaining` });
        continue;
      }

      let pressure = 0;
      if (p.signal_query) {
        try {
          const { data: sigResult } = await supabase.rpc('conductor_eval_signal', { q: p.signal_query });
          pressure = Number(sigResult ?? 0);
        } catch {
          pressure = 0;
        }
      }

      const ceilingExceeded = lastRunMs === 0 || elapsedSec >= p.max_interval_seconds;
      const effectiveThreshold = p.consecutive_empty_runs >= 3 ? p.signal_threshold * 2 : p.signal_threshold;
      const signalReady = p.signal_query !== null && pressure >= effectiveThreshold;

      if (!ceilingExceeded && !signalReady) {
        decisions.push({ pipeline: p.name, action: 'skip', reason: p.signal_query ? `pressure ${pressure} < ${effectiveThreshold}` : 'no signal, ceiling not reached' });
        continue;
      }

      decisions.push({
        pipeline: p.name,
        action: 'dispatch',
        reason: signalReady ? `signal pressure ${pressure}` : `ceiling (${Math.round(elapsedSec)}s ≥ ${p.max_interval_seconds}s)`,
      });
      // Cache the pressure on the pipeline for the run record
      (p as Pipeline & { _pressure?: number })._pressure = pressure;
      dispatchQueue.push(p);
    }

    // Phase 2: parallel dispatch with concurrency cap and tick budget
    const dispatched: string[] = [];
    let cursor = 0;

    const runOne = async (p: Pipeline) => {
      if (Date.now() - tickStart > TICK_BUDGET_MS) {
        decisions.push({ pipeline: p.name, action: 'deferred', reason: 'tick budget exceeded' });
        return;
      }

      const pressure = (p as Pipeline & { _pressure?: number })._pressure ?? 0;
      const runId = crypto.randomUUID();
      const dispatchStart = Date.now();
      let outcome: 'success' | 'empty' | 'failed' = 'success';
      let workUnits = 0;
      let response: unknown = null;
      let errMsg: string | null = null;

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/${p.target_function}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ ...p.target_payload, _conductor_run_id: runId }),
        });
        const body = await res.json().catch(() => ({}));
        response = body;
        if (!res.ok) {
          outcome = 'failed';
          errMsg = `HTTP ${res.status}`;
        } else {
          workUnits = Number(body?.processed ?? body?.count ?? body?.work_units ?? 0);
          if (workUnits === 0) outcome = 'empty';
        }
      } catch (e) {
        outcome = 'failed';
        errMsg = e instanceof Error ? e.message : String(e);
      }

      const durationMs = Date.now() - dispatchStart;

      try {
        await supabase.from('conductor_runs').insert({
          id: runId,
          pipeline_id: p.id,
          pipeline_name: p.name,
          duration_ms: durationMs,
          outcome,
          signal_pressure_at_dispatch: pressure,
          work_units: workUnits,
          response,
          error: errMsg,
        });

        await supabase
          .from('conductor_pipelines')
          .update({
            last_run_at: new Date().toISOString(),
            last_signal_pressure: pressure,
            consecutive_empty_runs: outcome === 'empty' ? p.consecutive_empty_runs + 1 : 0,
          })
          .eq('id', p.id);

        await supabase.rpc('conductor_increment_run', { p_id: p.id, p_work_units: workUnits });
      } catch { /* persistence non-fatal */ }

      dispatched.push(p.name);
    };

    // Worker pool — CONCURRENCY parallel workers pulling from the queue
    const workers: Promise<void>[] = [];
    for (let w = 0; w < CONCURRENCY; w++) {
      workers.push((async () => {
        while (cursor < dispatchQueue.length) {
          const idx = cursor++;
          const p = dispatchQueue[idx];
          if (!p) break;
          await runOne(p);
        }
      })());
    }
    await Promise.all(workers);

    return new Response(
      JSON.stringify({
        ok: true,
        tick_ms: Date.now() - tickStart,
        evaluated: pipelines?.length ?? 0,
        queued: dispatchQueue.length,
        dispatched: dispatched.length,
        concurrency: CONCURRENCY,
        decisions,
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
