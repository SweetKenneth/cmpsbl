/**
 * Unified Telemetry Aggregation Layer
 * SPARTA Epoch — Feeds CHR from ai_usage_log, access_usage, brain_events
 *
 * Aggregates honest substrate data into a single observable interface
 * consumed by the OS Dashboard, Terminal, and Health Attribution Engine.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══ Types ═══════════════════════════════════════════════════════

export interface ImmuneTelemetry {
  totalRuns: number;
  repairSuccesses: number;
  escalations: number;
  safeFailures: number;
  honestRepairRate: number; // repairs / (repairs + escalations + safe_failures)
  topExecutor: string | null;
}

export interface EncodeTelemetry {
  escalationsClaimed: number;
  escalationsResolved: number;
  escalationsFailed: number;
  resolutionRate: number;
}

export interface TelemetrySnapshot {
  timestamp: string;
  ai: AiTelemetry;
  access: AccessTelemetry;
  brain: BrainTelemetry;
  immune: ImmuneTelemetry;
  encode: EncodeTelemetry;
  overall: OverallTelemetry;
}

export interface AiTelemetry {
  totalCalls: number;
  totalTokens: number;
  successRate: number;
  topProvider: string | null;
  avgResponseTime: number;
}

export interface AccessTelemetry {
  totalRequests: number;
  uniqueKeys: number;
  topModule: string | null;
  totalCostMillicents: number;
}

export interface BrainTelemetry {
  totalEvents: number;
  recentEvents: number;   // last 24h
  topModule: string | null;
  successRate: number;
}

export interface OverallTelemetry {
  healthScore: number;    // 0-100 derived from all sources
  activeModules: number;
  errorRate: number;
  lastActivity: string | null;
}

// ═══ Aggregation Queries ═════════════════════════════════════════

export async function aggregateTelemetry(): Promise<TelemetrySnapshot> {
  const [ai, access, brain, immune, encode] = await Promise.allSettled([
    aggregateAiUsage(),
    aggregateAccessUsage(),
    aggregateBrainEvents(),
    aggregateImmuneMetrics(),
    aggregateEncodeEscalations(),
  ]);

  const aiData = ai.status === 'fulfilled' ? ai.value : defaultAi();
  const accessData = access.status === 'fulfilled' ? access.value : defaultAccess();
  const brainData = brain.status === 'fulfilled' ? brain.value : defaultBrain();
  const immuneData = immune.status === 'fulfilled' ? immune.value : defaultImmune();
  const encodeData = encode.status === 'fulfilled' ? encode.value : defaultEncode();

  // Derive overall health from component metrics including immune
  const errorRate = aiData.totalCalls > 0
    ? Math.round((1 - aiData.successRate) * 100) / 100
    : 0;

  const immunePenalty = immuneData.escalations > 5 ? 10 : immuneData.escalations > 0 ? 5 : 0;

  const healthScore = Math.min(100, Math.max(0, Math.round(
    (aiData.successRate * 35) +
    (brainData.successRate * 25) +
    ((accessData.totalRequests > 0 ? 1 : 0.5) * 20) +
    (immuneData.honestRepairRate * 20) -
    immunePenalty
  )));

  return {
    timestamp: new Date().toISOString(),
    ai: aiData,
    access: accessData,
    brain: brainData,
    immune: immuneData,
    encode: encodeData,
    overall: {
      healthScore,
      activeModules: 21,
      errorRate,
      lastActivity: brainData.totalEvents > 0 ? new Date().toISOString() : null,
    },
  };
}

async function aggregateAiUsage(): Promise<AiTelemetry> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('ai_usage_log')
    .select('provider, tokens_used, success, response_time_ms')
    .gte('created_at', since)
    .limit(500);

  if (error || !data) return defaultAi();

  const totalCalls = data.length;
  const successCount = data.filter(d => d.success).length;
  const totalTokens = data.reduce((s, d) => s + (d.tokens_used || 0), 0);
  const avgResponseTime = totalCalls > 0
    ? Math.round(data.reduce((s, d) => s + (d.response_time_ms || 0), 0) / totalCalls)
    : 0;

  // Top provider by call count
  const providerCounts: Record<string, number> = {};
  data.forEach(d => { providerCounts[d.provider] = (providerCounts[d.provider] || 0) + 1; });
  const topProvider = Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalCalls,
    totalTokens,
    successRate: totalCalls > 0 ? successCount / totalCalls : 1,
    topProvider,
    avgResponseTime,
  };
}

async function aggregateAccessUsage(): Promise<AccessTelemetry> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('access_usage')
    .select('module, api_key_id, cost_millicents')
    .gte('created_at', since)
    .limit(500);

  if (error || !data) return defaultAccess();

  const uniqueKeys = new Set(data.map(d => d.api_key_id).filter(Boolean)).size;
  const totalCost = data.reduce((s, d) => s + (d.cost_millicents || 0), 0);

  const moduleCounts: Record<string, number> = {};
  data.forEach(d => { moduleCounts[d.module] = (moduleCounts[d.module] || 0) + 1; });
  const topModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalRequests: data.length,
    uniqueKeys,
    topModule,
    totalCostMillicents: totalCost,
  };
}

async function aggregateBrainEvents(): Promise<BrainTelemetry> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('brain_events')
    .select('module, outcome')
    .gte('created_at', since)
    .limit(500);

  if (error || !data) return defaultBrain();

  const successCount = data.filter(d => d.outcome === 'succeeded').length;
  const moduleCounts: Record<string, number> = {};
  data.forEach(d => { moduleCounts[d.module] = (moduleCounts[d.module] || 0) + 1; });
  const topModule = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalEvents: data.length,
    recentEvents: data.length,
    topModule,
    successRate: data.length > 0 ? successCount / data.length : 1,
  };
}

// ═══ Immune Metrics ═════════════════════════════════════════════

async function aggregateImmuneMetrics(): Promise<ImmuneTelemetry> {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('immune_metrics')
    .select('executor, total_runs, repair_successes, escalations, safe_failures')
    .gte('run_at', since);

  if (error || !data) return defaultImmune();

  let totalRuns = 0, repairSuccesses = 0, escalations = 0, safeFailures = 0;
  const executorCounts: Record<string, number> = {};

  for (const row of data as any[]) {
    totalRuns += row.total_runs ?? 0;
    repairSuccesses += row.repair_successes ?? 0;
    escalations += row.escalations ?? 0;
    safeFailures += row.safe_failures ?? 0;
    executorCounts[row.executor] = (executorCounts[row.executor] || 0) + (row.total_runs ?? 0);
  }

  // LOCKED formula: repair attempts = successes + escalations (NOT safe_failures)
  const repairAttempts = repairSuccesses + escalations;
  const topExecutor = Object.entries(executorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalRuns,
    repairSuccesses,
    escalations,
    safeFailures,
    honestRepairRate: repairAttempts > 0 ? repairSuccesses / repairAttempts : 0,
    topExecutor,
  };
}

// ═══ ENCODE Escalation Resolution ═══════════════════════════════

async function aggregateEncodeEscalations(): Promise<EncodeTelemetry> {
  const { data, error } = await supabase
    .from('immune_escalations')
    .select('status, claimed_by, resolved_at')
    .limit(500);

  if (error || !data) return defaultEncode();

  const claimed = (data as any[]).filter(d => d.claimed_by === 'ENCODE').length;
  const resolved = (data as any[]).filter(d => d.claimed_by === 'ENCODE' && d.status === 'resolved').length;
  const failed = (data as any[]).filter(d => d.claimed_by === 'ENCODE' && d.status !== 'resolved' && d.status !== 'open').length;

  return {
    escalationsClaimed: claimed,
    escalationsResolved: resolved,
    escalationsFailed: failed,
    resolutionRate: claimed > 0 ? resolved / claimed : 0,
  };
}

// ═══ Defaults ════════════════════════════════════════════════════

function defaultAi(): AiTelemetry {
  return { totalCalls: 0, totalTokens: 0, successRate: 1, topProvider: null, avgResponseTime: 0 };
}

function defaultAccess(): AccessTelemetry {
  return { totalRequests: 0, uniqueKeys: 0, topModule: null, totalCostMillicents: 0 };
}

function defaultBrain(): BrainTelemetry {
  return { totalEvents: 0, recentEvents: 0, topModule: null, successRate: 1 };
}

function defaultImmune(): ImmuneTelemetry {
  return { totalRuns: 0, repairSuccesses: 0, escalations: 0, safeFailures: 0, honestRepairRate: 0, topExecutor: null };
}

function defaultEncode(): EncodeTelemetry {
  return { escalationsClaimed: 0, escalationsResolved: 0, escalationsFailed: 0, resolutionRate: 0 };
}
