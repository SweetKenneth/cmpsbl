/**
 * WITNESS — Audit-Chain Witness Agent
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Pairs 1:1 with ARBITRIUM, the Governed Execution Pipeline.
 *
 * Watches every governed run, scores its audit chain for anomalies
 * (blocked/override/failed patterns, layer-time skew, retry pressure),
 * and feeds heuristics back into agent_competency so the substrate
 * learns from execution outcomes — not just AI calls.
 *
 * Pure deterministic — no external AI. Sub-primitive of the AUDIT Agent.
 * Layer 2 emits a thin polyglot witness wrapper for the host runtime;
 * this substrate version persists to Supabase.
 *
 * Topology balance:
 *   ARBITRIUM (Governed Pipeline) → CORTEX Engine sub-primitive
 *   WITNESS   (Audit-Chain)       → AUDIT  Agent  sub-primitive
 *
 * Matrix stays 12·12·8·8 = 40. See docs/libraries/staff/02-architecture-and-primitives.md §7.
 *
 * U.S. Patent App. No. 64/029,678 · © CMPSBL® · PromptFluid™
 */

import { supabase } from '@/integrations/supabase/client';
import type { GovernedExecutionContext } from './governedPipeline';

export type WitnessVerdict = 'healthy' | 'degraded' | 'anomalous' | 'failed';

export interface WitnessReading {
  agentId: string;
  verdict: WitnessVerdict;
  competencyDelta: number;
  anomalyScore: number;
  signals: {
    blocked: boolean;
    overridden: boolean;
    failed: boolean;
    retries: number;
    layersExecuted: number;
    layersFailed: number;
    durationMs: number;
    originalExecuted: boolean;
  };
  reasons: string[];
  observedAt: string;
}

/** Score a single ARBITRIUM audit chain. Pure — no I/O. */
export function witnessAuditChain<I, O>(
  agentId: string,
  ctx: GovernedExecutionContext<I, O>,
): WitnessReading {
  const failed = ctx.audit.filter(a => a.result === 'failed');
  const blocked = ctx.audit.some(a => a.result === 'blocked');
  const overridden = ctx.audit.some(a => a.result === 'override');
  const retries = ctx.runtime.retries;
  const layersExecuted = ctx.audit.length;
  const layersFailed = failed.length;
  const durationMs = ctx.runtime.durationMs;

  const reasons: string[] = [];
  let anomalyScore = 0;
  let competencyDelta = 0;
  let verdict: WitnessVerdict = 'healthy';

  if (ctx.error) {
    anomalyScore += 0.5;
    reasons.push(`execution error: ${ctx.error.message}`);
  }
  if (blocked) {
    anomalyScore += 0.3;
    competencyDelta -= 0.05;
    reasons.push('pipeline blocked by pre-layer');
  }
  if (layersFailed > 0) {
    anomalyScore += Math.min(0.4, layersFailed * 0.1);
    competencyDelta -= layersFailed * 0.02;
    reasons.push(`${layersFailed} layer failure${layersFailed === 1 ? '' : 's'}`);
  }
  if (retries > 0) {
    anomalyScore += Math.min(0.2, retries * 0.05);
    reasons.push(`${retries} DEFENSE retry${retries === 1 ? '' : 'ies'}`);
  }
  if (durationMs > 5000) {
    anomalyScore += 0.15;
    reasons.push(`slow run (${durationMs}ms)`);
  }
  if (ctx.runtime.originalExecuted && !ctx.error && !blocked) {
    competencyDelta += 0.03;
    reasons.push('clean execution');
  }
  if (overridden) {
    reasons.push('output overridden by pre-layer');
  }

  anomalyScore = Math.min(1, anomalyScore);
  competencyDelta = Math.max(-0.2, Math.min(0.1, competencyDelta));

  if (ctx.error || layersFailed >= 2) verdict = 'failed';
  else if (anomalyScore >= 0.5) verdict = 'anomalous';
  else if (anomalyScore >= 0.2) verdict = 'degraded';

  return {
    agentId,
    verdict,
    competencyDelta,
    anomalyScore,
    signals: {
      blocked,
      overridden,
      failed: !!ctx.error,
      retries,
      layersExecuted,
      layersFailed,
      durationMs,
      originalExecuted: ctx.runtime.originalExecuted,
    },
    reasons,
    observedAt: new Date().toISOString(),
  };
}

/**
 * Persist a witness reading to agent_competency. EMA-smoothed (α=0.1).
 * No-op if the agent is not registered (WITNESS does not create agents).
 */
export async function persistWitnessReading(reading: WitnessReading): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: existing, error: readErr } = await supabase
      .from('agent_competency')
      .select('competency_score, total_attempts, successful_attempts, failed_attempts, partial_attempts, success_rate, heuristics')
      .eq('agent_id', reading.agentId)
      .maybeSingle();

    if (readErr) return { ok: false, error: readErr.message };
    if (!existing) return { ok: false, error: 'agent not registered' };

    const totalAttempts = (existing.total_attempts ?? 0) + 1;
    const successful = (existing.successful_attempts ?? 0) + (reading.verdict === 'healthy' ? 1 : 0);
    const failedCount = (existing.failed_attempts ?? 0) + (reading.verdict === 'failed' ? 1 : 0);
    const partial = (existing.partial_attempts ?? 0) + (reading.verdict === 'degraded' || reading.verdict === 'anomalous' ? 1 : 0);
    const successRate = totalAttempts > 0 ? successful / totalAttempts : 0;

    const prior = existing.competency_score ?? 0.5;
    const target = Math.max(0, Math.min(1, prior + reading.competencyDelta));
    const next = prior * 0.9 + target * 0.1;

    const heuristics = (existing.heuristics as Record<string, unknown> | null) ?? {};
    const recentRaw = (heuristics as { recent?: unknown }).recent;
    const recent = Array.isArray(recentRaw) ? recentRaw : [];
    const updatedHeuristics = {
      ...heuristics,
      lastVerdict: reading.verdict,
      lastAnomalyScore: reading.anomalyScore,
      recent: [...recent.slice(-19), { verdict: reading.verdict, score: reading.anomalyScore, at: reading.observedAt }],
    } as unknown as Record<string, unknown>;

    const { error: writeErr } = await supabase
      .from('agent_competency')
      .update({
        competency_score: next,
        total_attempts: totalAttempts,
        successful_attempts: successful,
        failed_attempts: failedCount,
        partial_attempts: partial,
        success_rate: successRate,
        last_execution_at: reading.observedAt,
        heuristics: JSON.parse(JSON.stringify(updatedHeuristics)),
      })
      .eq('agent_id', reading.agentId);

    if (writeErr) return { ok: false, error: writeErr.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Convenience: witness + persist in one call. */
export async function witnessObserve<I, O>(
  agentId: string,
  ctx: GovernedExecutionContext<I, O>,
): Promise<{ reading: WitnessReading; persisted: boolean; error?: string }> {
  const reading = witnessAuditChain(agentId, ctx);
  const result = await persistWitnessReading(reading);
  return { reading, persisted: result.ok, error: result.error };
}
