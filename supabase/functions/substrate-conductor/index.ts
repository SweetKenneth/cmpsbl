// substrate-conductor — dynamic, signal-driven pipeline orchestrator
// Replaces N per-job crons with one heartbeat that picks what to run, when, based on:
//   1. signal pressure (e.g. unprocessed gaps > threshold)
//   2. cooldown (min_interval_seconds since last run)
//   3. adaptive ceiling (max_interval_seconds — always run at least this often)
//   4. backoff on consecutive empty runs (saves credits)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

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

    const decisions: Array<{ pipeline: string; action: string; reason: string }> = [];
    const dispatched: string[] = [];

    for (const p of (pipelines ?? []) as Pipeline[]) {
      const now = Date.now();
      const lastRunMs = p.last_run_at ? new Date(p.last_run_at).getTime() : 0;
      const elapsedSec = (now - lastRunMs) / 1000;

      // Hard floor — never violate cooldown
      if (lastRunMs > 0 && elapsedSec < p.min_interval_seconds) {
        decisions.push({ pipeline: p.name, action: 'skip', reason: `cooldown ${Math.round(p.min_interval_seconds - elapsedSec)}s remaining` });
        continue;
      }

      // Compute signal pressure
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
      const signalReady = pressure >= p.signal_threshold;

      // Adaptive backoff: if last 3 runs were empty, require 2x threshold
      const effectiveThreshold =
        p.consecutive_empty_runs >= 3 ? p.signal_threshold * 2 : p.signal_threshold;

      const shouldRun = ceilingExceeded || (pressure >= effectiveThreshold);

      if (!shouldRun) {
        decisions.push({ pipeline: p.name, action: 'skip', reason: `pressure ${pressure} < ${effectiveThreshold}` });
        continue;
      }

      decisions.push({
        pipeline: p.name,
        action: 'dispatch',
        reason: ceilingExceeded ? `ceiling (${Math.round(elapsedSec)}s ≥ ${p.max_interval_seconds}s)` : `signal pressure ${pressure}`,
      });

      // Fire-and-record
      const runId = crypto.randomUUID();
      const dispatchStart = Date.now();
      let outcome = 'success';
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
          // Convention: target functions return { processed: N } or { count: N }
          workUnits = Number(body?.processed ?? body?.count ?? body?.work_units ?? 0);
          if (workUnits === 0) outcome = 'empty';
        }
      } catch (e) {
        outcome = 'failed';
        errMsg = e instanceof Error ? e.message : String(e);
      }

      const durationMs = Date.now() - dispatchStart;

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
          total_runs: undefined, // managed via raw increment below
        })
        .eq('id', p.id);

      // Atomic increments for counters
      await supabase.rpc('conductor_increment_run', {
        p_id: p.id,
        p_work_units: workUnits,
      }).catch(() => {});

      dispatched.push(p.name);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        tick_ms: Date.now() - tickStart,
        evaluated: pipelines?.length ?? 0,
        dispatched: dispatched.length,
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
