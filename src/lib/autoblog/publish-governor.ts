/**
 * AutoBlog Publish Governor v1.0
 * Self-selected publish frequency via adaptive token bucket + readiness signals.
 */

import { supabase } from '@/integrations/supabase/client';
import { isEnabled, createFlag, getFlag } from '@/lib/substrate/feature-flags';

// Register autoblog governor flags (idempotent)
if (!getFlag('autoblog_publish_governor_enabled')) createFlag('autoblog_publish_governor_enabled', 'AutoBlog Publish Governor', true, 100);
if (!getFlag('autoblog_publish_freeze')) createFlag('autoblog_publish_freeze', 'AutoBlog Publish Freeze', false, 0);

export type GovernorDecision = 'publish' | 'defer' | 'cooldown';

export interface GovernorSignals {
  confidenceScore: number;
  skepticScore: number;
  driftScore: number;
  recentSuccessRate: number;
  breakerHealth: number;    // 0–1: circuit breaker health
  backlogPressure: number;  // 0–1: how many items waiting in queue
}

export interface GovernorResult {
  decision: GovernorDecision;
  reason: string;
  readinessScore: number;
  tokensBefore: number;
  tokensAfter: number;
  cooldownUntil: string | null;
}

const MAX_TOKENS = 3.0;
const MIN_READINESS = 0.55;
const BASE_REFILL_RATE = 0.15; // tokens per evaluation

/**
 * Check if publish governor is enabled.
 */
function isGovernorEnabled(): boolean {
  return isEnabled('autoblog_publish_governor_enabled');
}

/**
 * Check if publish freeze is active.
 */
function isFreezeActive(): boolean {
  return isEnabled('autoblog_publish_freeze');
}

/**
 * Get current governor state.
 */
async function getState(): Promise<{
  id: string;
  tokens: number;
  publishStreak: number;
  cooldownUntil: string | null;
  lastPublishAt: string | null;
}> {
  const { data } = await supabase
    .from('autoblog_publish_governor_state' as any)
    .select('*')
    .limit(1)
    .maybeSingle();

  if (!data) {
    return { id: '', tokens: 1.0, publishStreak: 0, cooldownUntil: null, lastPublishAt: null };
  }

  const d = data as any;
  return {
    id: d.id,
    tokens: d.tokens ?? 1.0,
    publishStreak: d.publish_streak ?? 0,
    cooldownUntil: d.cooldown_until,
    lastPublishAt: d.last_publish_at,
  };
}

/**
 * Compute readiness score from signals.
 */
function computeReadiness(signals: GovernorSignals): number {
  return (
    signals.confidenceScore * 0.35 +
    signals.skepticScore * 0.35 +
    signals.recentSuccessRate * 0.15 +
    (1 - signals.driftScore) * 0.15
  );
}

/**
 * Compute dynamic token refill rate based on signals.
 */
function computeRefillRate(signals: GovernorSignals): number {
  let rate = BASE_REFILL_RATE;

  // High confidence boosts refill
  if (signals.confidenceScore > 0.7) rate += 0.05;
  // Good skeptic score
  if (signals.skepticScore > 0.6) rate += 0.03;
  // Success streak
  if (signals.recentSuccessRate > 0.8) rate += 0.05;
  // Backlog pressure increases refill
  if (signals.backlogPressure > 0.5) rate += 0.03;
  // Drift reduces refill
  if (signals.driftScore > 0.5) rate -= 0.05;
  // Breaker issues reduce refill
  if (signals.breakerHealth < 0.5) rate -= 0.1;

  return Math.max(0.02, Math.min(0.3, rate));
}

/**
 * Check if cooldown conditions are met.
 */
async function shouldEnterCooldown(
  signals: GovernorSignals,
  state: Awaited<ReturnType<typeof getState>>,
): Promise<{ cooldown: boolean; reason: string; durationMinutes: number }> {
  // Breaker critical
  if (signals.breakerHealth < 0.2) {
    return { cooldown: true, reason: 'Circuit breaker critical', durationMinutes: 60 };
  }

  // Check recent failures
  const { data: recentRuns } = await supabase
    .from('autoblog_runs')
    .select('outcome')
    .order('created_at', { ascending: false })
    .limit(6);

  const runs = recentRuns || [];
  const recentFailures = runs.filter((r: any) => r.outcome === 'failed').length;
  const recentBlocks = runs.filter((r: any) => r.outcome === 'blocked').length;

  if (recentFailures >= 3) {
    return { cooldown: true, reason: '3+ recent failures', durationMinutes: 45 };
  }

  if (recentBlocks >= 2) {
    return { cooldown: true, reason: '2+ blocks in last 6 attempts', durationMinutes: 30 };
  }

  return { cooldown: false, reason: '', durationMinutes: 0 };
}

/**
 * Get the governor's publish decision.
 */
export async function getGovernorDecision(
  signals: GovernorSignals,
  queueId?: string,
): Promise<GovernorResult> {
  // Feature flags
  if (!isGovernorEnabled()) {
    return {
      decision: 'publish',
      reason: 'Governor disabled via feature flag',
      readinessScore: 1,
      tokensBefore: MAX_TOKENS,
      tokensAfter: MAX_TOKENS,
      cooldownUntil: null,
    };
  }

  if (isFreezeActive()) {
    const result: GovernorResult = {
      decision: 'defer',
      reason: 'Publish freeze active',
      readinessScore: 0,
      tokensBefore: 0,
      tokensAfter: 0,
      cooldownUntil: null,
    };
    await logDecision(result, signals, queueId);
    return result;
  }

  const state = await getState();
  const tokensBefore = state.tokens;

  // Check cooldown
  if (state.cooldownUntil && new Date(state.cooldownUntil) > new Date()) {
    const result: GovernorResult = {
      decision: 'cooldown',
      reason: `In cooldown until ${state.cooldownUntil}`,
      readinessScore: computeReadiness(signals),
      tokensBefore,
      tokensAfter: tokensBefore,
      cooldownUntil: state.cooldownUntil,
    };
    await logDecision(result, signals, queueId);
    return result;
  }

  // Refill tokens
  const refillRate = computeRefillRate(signals);
  const newTokens = Math.min(MAX_TOKENS, tokensBefore + refillRate);

  // Check for cooldown triggers
  const cooldownCheck = await shouldEnterCooldown(signals, state);
  if (cooldownCheck.cooldown) {
    const cooldownUntil = new Date(Date.now() + cooldownCheck.durationMinutes * 60_000).toISOString();
    await updateState(state.id, { tokens: newTokens, cooldownUntil });

    const result: GovernorResult = {
      decision: 'cooldown',
      reason: cooldownCheck.reason,
      readinessScore: computeReadiness(signals),
      tokensBefore,
      tokensAfter: newTokens,
      cooldownUntil,
    };
    await logDecision(result, signals, queueId);
    return result;
  }

  // Compute readiness
  const readinessScore = computeReadiness(signals);

  // Decision: need tokens AND readiness
  if (newTokens >= 1.0 && readinessScore >= MIN_READINESS) {
    const result: GovernorResult = {
      decision: 'publish',
      reason: `Readiness ${readinessScore.toFixed(2)} >= ${MIN_READINESS}, tokens ${newTokens.toFixed(2)} >= 1.0`,
      readinessScore,
      tokensBefore,
      tokensAfter: newTokens,
      cooldownUntil: null,
    };
    // Don't decrement here; decrement after successful publish
    await updateState(state.id, { tokens: newTokens });
    await logDecision(result, signals, queueId);
    return result;
  }

  // Defer
  await updateState(state.id, { tokens: newTokens });
  const result: GovernorResult = {
    decision: 'defer',
    reason: newTokens < 1.0
      ? `Insufficient tokens (${newTokens.toFixed(2)} < 1.0)`
      : `Readiness too low (${readinessScore.toFixed(2)} < ${MIN_READINESS})`,
    readinessScore,
    tokensBefore,
    tokensAfter: newTokens,
    cooldownUntil: null,
  };
  await logDecision(result, signals, queueId);
  return result;
}

/**
 * Consume a token after successful publish.
 */
export async function consumeToken(): Promise<void> {
  const state = await getState();
  await updateState(state.id, {
    tokens: Math.max(0, state.tokens - 1.0),
    lastPublishAt: new Date().toISOString(),
    publishStreak: state.publishStreak + 1,
  });
}

/**
 * Reset streak (e.g., after failure).
 */
export async function resetStreak(): Promise<void> {
  const state = await getState();
  await updateState(state.id, { publishStreak: 0 });
}

async function updateState(
  id: string,
  updates: Record<string, unknown>,
): Promise<void> {
  if (!id) return;
  await supabase
    .from('autoblog_publish_governor_state' as any)
    .update({ ...updates, last_decision_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id);
}

async function logDecision(
  result: GovernorResult,
  signals: GovernorSignals,
  queueId?: string,
): Promise<void> {
  await supabase
    .from('autoblog_publish_governor_logs' as any)
    .insert({
      decision: result.decision,
      reason: { text: result.reason },
      signals,
      tokens_before: result.tokensBefore,
      tokens_after: result.tokensAfter,
      cooldown_until: result.cooldownUntil,
      queue_id: queueId || null,
    });
}
