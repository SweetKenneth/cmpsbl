/**
 * Shadow Mesh — Analytics Aggregator (v3.0)
 * Queries immune_metrics and immune_escalations for admin dashboard.
 * Now includes repair intelligence stats, outcome tracking, and shared rule registry.
 */

import { supabase } from '@/integrations/supabase/client';
import { getRepairIntelligenceStats, getEscalationPatterns } from '@/immune/repair-intelligence';
import { getOutcomeStats, produceDreamDigest } from '@/immune/outcome-tracker';
import { getEscalationTelemetry, type EscalationTelemetrySnapshot } from '@/lib/substrate/encode-module/escalation-telemetry';
import { getLearningStats } from '@/immune/escalation-learning';
import { getSharedRuleStats, type SharedRuleRegistryStats } from '@/immune/shared-rule-registry';

export interface MetricRow {
  executor: string;
  total_runs: number;
  repairs: number;
  escalations: number;
  safe_fails: number;
  repair_attempts: number;
  repair_successes: number;
  retries: number;
}

export interface EscalationRow {
  executor: string;
  severity: string;
  scope: string;
  created_at: string;
  status: string;
}

export interface RepairKPIs {
  /** (repair_attempts / total_runs) — null when no runs */
  repair_attempt_rate: number | null;
  /** (repair_successes / repair_attempts) — null when no attempts */
  repair_success_rate: number | null;
  /** (retries / total_runs) — null when no runs */
  retry_rate: number | null;
}

export interface ShadowMeshAnalyticsData {
  metrics: MetricRow[];
  recentEscalations: EscalationRow[];
  repairKPIs: RepairKPIs;
  /** v2.0: Repair intelligence stats */
  intelligenceStats: Record<string, Record<string, { attempts: number; successes: number }>>;
  /** v2.0: Escalation pattern mining results */
  escalationPatterns: Array<{ executor: string; errorSignature: string; count: number; lastSeen: number }>;
  /** v2.0: Outcome tracking stats */
  outcomeStats: Record<string, any>;
  /** v2.0: Dream cycle digest */
  dreamDigest: {
    lowConfidencePatterns: Array<{ executor: string; archetype: string; avgConfidence: number; count: number }>;
    highFailureRepairs: Array<{ repairType: string; executor: string; failRate: number; count: number }>;
    suggestions: string[];
  };
  /** v3.0: ENCODE escalation resolution telemetry */
  escalationResolution: EscalationTelemetrySnapshot;
  /** v3.0: Escalation learning loop stats */
  learningStats: ReturnType<typeof getLearningStats>;
  /** v3.0: Central shared rule registry stats */
  sharedRuleRegistry: SharedRuleRegistryStats;
}

export async function getShadowMeshAnalytics(): Promise<ShadowMeshAnalyticsData> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data: rawMetrics } = await supabase
    .from('immune_metrics')
    .select('executor, total_runs, repair_successes, escalations, safe_failures, repair_attempted, repair_success, retry_attempted')
    .gte('run_at', sixHoursAgo);

  const byExecutor = new Map<string, MetricRow>();
  let totalRunsAll = 0;
  let totalRepairSuccessesAll = 0;
  let totalEscalationsAll = 0;
  let totalSafeFailsAll = 0;

  interface RawMetricRow { executor: string; total_runs?: number; repair_successes?: number; escalations?: number; safe_failures?: number; repair_attempted?: boolean; repair_success?: boolean; retry_attempted?: boolean }
  for (const row of (rawMetrics ?? []) as RawMetricRow[]) {
    const runs = row.total_runs ?? 0;
    const repairSuccesses = row.repair_successes ?? 0;
    const escalations = row.escalations ?? 0;
    const safeFailures = row.safe_failures ?? 0;

    totalRunsAll += runs;
    totalRepairSuccessesAll += repairSuccesses;
    totalEscalationsAll += escalations;
    totalSafeFailsAll += safeFailures;

    // CRITICAL: safe_failures are NOT repair attempts — they are correctly rejected garbage inputs.
    // Repair attempts = repair_successes + escalations ONLY.
    const rowRepairAttempts = repairSuccesses + escalations;

    const existing = byExecutor.get(row.executor);
    if (existing) {
      existing.total_runs += runs;
      existing.repairs += repairSuccesses;
      existing.escalations += escalations;
      existing.safe_fails += safeFailures;
      existing.repair_attempts += rowRepairAttempts;
      existing.repair_successes += repairSuccesses;
      existing.retries += repairSuccesses;
    } else {
      byExecutor.set(row.executor, {
        executor: row.executor,
        total_runs: runs,
        repairs: repairSuccesses,
        escalations,
        safe_fails: safeFailures,
        repair_attempts: rowRepairAttempts,
        repair_successes: repairSuccesses,
        retries: repairSuccesses,
      });
    }
  }

  const { data: recentEscalations } = await supabase
    .from('immune_escalations')
    .select('executor, severity, scope, created_at, status')
    .order('created_at', { ascending: false })
    .limit(20);

  // HONEST repair KPIs — LOCKED formulas (see src/lib/telemetry/contract.ts):
  // repair_attempt_rate = (repairs + escalations) / total_runs
  // repair_success_rate = repairs / (repairs + escalations)  (NOT / total_runs)
  // retry_rate = repairs / total_runs
  const totalRepairAttempts = totalRepairSuccessesAll + totalEscalationsAll;
  const repairKPIs: RepairKPIs = {
    repair_attempt_rate: totalRunsAll > 0 ? totalRepairAttempts / totalRunsAll : null,
    repair_success_rate: totalRepairAttempts > 0 ? totalRepairSuccessesAll / totalRepairAttempts : null,
    retry_rate: totalRunsAll > 0 ? totalRepairSuccessesAll / totalRunsAll : null,
  };

  return {
    metrics: Array.from(byExecutor.values()),
    recentEscalations: (recentEscalations ?? []) as EscalationRow[],
    repairKPIs,
    intelligenceStats: getRepairIntelligenceStats(),
    escalationPatterns: getEscalationPatterns(),
    outcomeStats: getOutcomeStats(),
    dreamDigest: produceDreamDigest(),
    escalationResolution: getEscalationTelemetry(),
    learningStats: getLearningStats(),
    sharedRuleRegistry: getSharedRuleStats(),
  };
}
