// substrate-conductor — hardened, signal-driven pipeline orchestrator (CONDUCTOR subsystem).
//
// Reliability primitives (v3 — Hardened):
//   • Tick lease (DB-backed): only one tick runs at a time; stale leases auto-stolen after TTL.
//   • Per-pipeline circuit breakers: closed → open (after 5 consecutive failures) → half_open
//     (after exponential-backoff recovery window) → closed (on probe success).
//   • Auto-quarantine: pipeline that trips ≥4 times is auto-disabled with a reason.
//   • Per-call dispatch timeout via AbortController (default 25s, per-pipeline override).
//   • In-tick retry with exponential backoff + jitter on transient failures.
//   • Graceful degradation tiers based on substrate health:
//        healthy   (≥70)  → run all pipelines
//        degraded  (40–69) → only priority ≥40, skip cost > 1
//        critical  (<40)   → only priority ≥80, skip cost > 0
//   • Cascade detection: ≥3 open breakers forces 'degraded'; ≥6 forces 'critical'.
//   • Tick budget (90s) enforced; remaining work deferred to next tick.
//   • Health snapshot per tick recorded to conductor_tick_health.
//   • All persistence is best-effort (try/catch) so a transient DB blip doesn't kill the tick.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const CONCURRENCY = 6;
const TICK_BUDGET_MS = 90_000;
const TICK_LEASE_TTL_S = 110;
const DEFAULT_DISPATCH_TIMEOUT_MS = 25_000;

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
  consecutive_failures: number;
  breaker_state: 'closed' | 'open' | 'half_open';
  breaker_opened_at: string | null;
  breaker_recovery_seconds: number;
  dispatch_timeout_ms: number;
  max_retries: number;
  quarantined_at: string | null;
}

interface Decision {
  pipeline: string;
  action: 'dispatch' | 'skip' | 'deferred' | 'shed';
  reason: string;
}

type Tier = 'healthy' | 'degraded' | 'critical';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const tickStart = Date.now();
  const tickId = crypto.randomUUID();

  // 1. Acquire tick lease — bail out fast if another tick is mid-flight
  let leaseOk = false;
  try {
    const { data } = await supabase.rpc('conductor_acquire_tick_lease', {
      p_holder: tickId,
      p_ttl_seconds: TICK_LEASE_TTL_S,
    });
    leaseOk = Boolean(data);
  } catch {
    leaseOk = false;
  }
  if (!leaseOk) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: 'another tick holds the lease' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 2. Self-heal: promote any open breakers whose recovery window expired → half_open
    let promoted = 0;
    try {
      const { data } = await supabase.rpc('conductor_promote_half_open');
      promoted = Number(data ?? 0);
    } catch { /* non-fatal */ }

    // 3. Load pipelines
    const { data: pipelines, error } = await supabase
      .from('conductor_pipelines')
      .select('*')
      .eq('enabled', true);
    if (error) throw error;

    const all = (pipelines ?? []) as Pipeline[];

    // 4. Compute substrate health → degradation tier
    const openBreakers = all.filter((p) => p.breaker_state === 'open').length;
    const halfOpenBreakers = all.filter((p) => p.breaker_state === 'half_open').length;
    const failingShare = all.length === 0 ? 0 : openBreakers / all.length;
    let healthScore = Math.round(100 - failingShare * 100);
    // Cascade boost: many open breakers signals systemic problem
    if (openBreakers >= 6) healthScore = Math.min(healthScore, 30);
    else if (openBreakers >= 3) healthScore = Math.min(healthScore, 55);

    const tier: Tier = healthScore >= 70 ? 'healthy' : healthScore >= 40 ? 'degraded' : 'critical';

    // 5. Order: highest priority first; fallback pipelines last within bucket
    const ordered = all.sort((a, b) => {
      if (a.is_fallback !== b.is_fallback) return a.is_fallback ? 1 : -1;
      return (b.priority ?? 50) - (a.priority ?? 50);
    });

    const decisions: Decision[] = [];
    const dispatchQueue: Pipeline[] = [];

    // 6. Phase 1 — evaluate every pipeline
    for (const p of ordered) {
      // 6a. Graceful degradation shedding
      if (tier === 'degraded' && (p.priority < 40 || (p.cost_estimate_cents ?? 0) > 1)) {
        decisions.push({ pipeline: p.name, action: 'shed', reason: `degraded tier — sheds prio<40 or cost>1` });
        continue;
      }
      if (tier === 'critical' && (p.priority < 80 || (p.cost_estimate_cents ?? 0) > 0)) {
        decisions.push({ pipeline: p.name, action: 'shed', reason: `critical tier — sheds prio<80 or any cost` });
        continue;
      }

      // 6b. Breaker is open → skip until recovery window elapses (promotion happens at top of next tick)
      if (p.breaker_state === 'open') {
        decisions.push({ pipeline: p.name, action: 'skip', reason: `breaker open (recovery ${p.breaker_recovery_seconds}s)` });
        continue;
      }

      // 6c. Cooldown
      const now = Date.now();
      const lastRunMs = p.last_run_at ? new Date(p.last_run_at).getTime() : 0;
      const elapsedSec = lastRunMs > 0 ? (now - lastRunMs) / 1000 : Number.POSITIVE_INFINITY;
      if (lastRunMs > 0 && elapsedSec < p.min_interval_seconds) {
        decisions.push({ pipeline: p.name, action: 'skip', reason: `cooldown ${Math.round(p.min_interval_seconds - elapsedSec)}s remaining` });
        continue;
      }

      // 6d. Half-open ALWAYS dispatches as a probe (regardless of signal pressure)
      if (p.breaker_state === 'half_open') {
        decisions.push({ pipeline: p.name, action: 'dispatch', reason: 'half-open recovery probe' });
        (p as Pipeline & { _pressure?: number; _isProbe?: boolean })._pressure = 0;
        (p as Pipeline & { _pressure?: number; _isProbe?: boolean })._isProbe = true;
        dispatchQueue.push(p);
        continue;
      }

      // 6e. Signal pressure
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
      (p as Pipeline & { _pressure?: number })._pressure = pressure;
      dispatchQueue.push(p);
    }

    // 7. Phase 2 — parallel dispatch with concurrency cap, per-call timeout, retry, breaker accounting
    const dispatched: string[] = [];
    const failed: string[] = [];
    let cursor = 0;

    const dispatchOnce = async (p: Pipeline, attempt: number): Promise<{ ok: boolean; status?: number; body?: unknown; err?: string; ms: number }> => {
      const timeoutMs = p.dispatch_timeout_ms ?? DEFAULT_DISPATCH_TIMEOUT_MS;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const start = Date.now();
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/${p.target_function}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ ...p.target_payload, _conductor_run_id: tickId, _attempt: attempt }),
          signal: controller.signal,
        });
        const body = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, body, ms: Date.now() - start };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, err: controller.signal.aborted ? `timeout after ${timeoutMs}ms` : msg, ms: Date.now() - start };
      } finally {
        clearTimeout(timer);
      }
    };

    const runOne = async (p: Pipeline) => {
      if (Date.now() - tickStart > TICK_BUDGET_MS) {
        decisions.push({ pipeline: p.name, action: 'deferred', reason: 'tick budget exceeded' });
        return;
      }

      const isProbe = (p as Pipeline & { _isProbe?: boolean })._isProbe === true;
      const pressure = (p as Pipeline & { _pressure?: number })._pressure ?? 0;
      const runId = crypto.randomUUID();
      const dispatchStart = Date.now();
      const maxAttempts = Math.max(1, (p.max_retries ?? 1) + 1);

      let outcome: 'success' | 'empty' | 'failed' = 'failed';
      let workUnits = 0;
      let response: unknown = null;
      let errMsg: string | null = null;
      let lastStatus: number | undefined;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (Date.now() - tickStart > TICK_BUDGET_MS) {
          errMsg = 'tick budget exceeded mid-retry';
          break;
        }
        const result = await dispatchOnce(p, attempt);
        lastStatus = result.status;
        response = result.body ?? null;
        if (result.ok) {
          const body = (result.body ?? {}) as Record<string, unknown>;
          workUnits = Number(body?.processed ?? body?.count ?? body?.work_units ?? 0);
          outcome = workUnits === 0 ? 'empty' : 'success';
          errMsg = null;
          break;
        }
        // failure path
        outcome = 'failed';
        errMsg = result.err ?? `HTTP ${result.status}`;
        // Don't retry 4xx (client errors) — likely permanent
        if (result.status && result.status >= 400 && result.status < 500) break;
        if (attempt < maxAttempts) {
          const backoff = Math.min(5_000, 250 * 2 ** (attempt - 1));
          const jitter = Math.random() * backoff * 0.3;
          await sleep(backoff + jitter);
        }
      }

      const durationMs = Date.now() - dispatchStart;
      if (outcome === 'failed') failed.push(p.name); else dispatched.push(p.name);

      // Best-effort persistence
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
          error: errMsg ? `${errMsg}${isProbe ? ' [half-open probe]' : ''}${lastStatus ? ` (status ${lastStatus})` : ''}` : null,
        });

        // Breaker state machine — atomic in DB
        await supabase.rpc('conductor_record_breaker_outcome', {
          p_id: p.id,
          p_outcome: outcome === 'failed' ? 'failure' : 'success',
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
    };

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

    // 8. Record health snapshot
    const tickMs = Date.now() - tickStart;
    try {
      await supabase.from('conductor_tick_health').insert({
        tick_id: tickId,
        health_score: healthScore,
        degradation_tier: tier,
        open_breakers: openBreakers,
        half_open_breakers: halfOpenBreakers,
        quarantined: 0, // quarantined pipelines are filtered (enabled=false)
        dispatched: dispatched.length,
        failed: failed.length,
        tick_duration_ms: tickMs,
      });
    } catch { /* non-fatal */ }

    return new Response(
      JSON.stringify({
        ok: true,
        tick_id: tickId,
        tick_ms: tickMs,
        health_score: healthScore,
        degradation_tier: tier,
        promoted_to_half_open: promoted,
        open_breakers: openBreakers,
        half_open_breakers: halfOpenBreakers,
        evaluated: all.length,
        queued: dispatchQueue.length,
        dispatched: dispatched.length,
        failed: failed.length,
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
  } finally {
    // 9. Always release the tick lease — even on error
    try {
      await supabase.rpc('conductor_release_tick_lease', { p_holder: tickId });
    } catch { /* non-fatal */ }
  }
});
