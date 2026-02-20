/**
 * Shadow Mesh — Analytics Aggregator (v2.0)
 * Queries immune_metrics and immune_escalations for admin dashboard.
 * Now includes repair intelligence stats and outcome tracking.
 */

import { supabase } from '@/integrations/supabase/client';
import { getRepairIntelligenceStats, getEscalationPatterns } from '@/immune/repair-intelligence';
import { getOutcomeStats, produceDreamDigest } from '@/immune/outcome-tracker';
import { getEscalationTelemetry, type EscalationTelemetrySnapshot } from '@/lib/substrate/encode-module/escalation-telemetry';

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
  repair_attempt_rate: number;
  repair_success_rate: number;
  retry_rate: number;
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
}

export async function getShadowMeshAnalytics(): Promise<ShadowMeshAnalyticsData> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data: rawMetrics } = await supabase
    .from('immune_metrics')
    .select('executor, total_runs, repair_successes, escalations, safe_failures, repair_attempted, repair_success, retry_attempted')
    .gte('run_at', sixHoursAgo);

  const byExecutor = new Map<string, MetricRow>();
  let totalRunsAll = 0;
  let totalRepairAttempts = 0;
  let totalRepairSuccesses = 0;
  let totalRetries = 0;

  for (const row of (rawMetrics ?? []) as any[]) {
    totalRunsAll += row.total_runs ?? 0;
    if (row.repair_attempted) totalRepairAttempts += row.total_runs ?? 0;
    if (row.repair_success) totalRepairSuccesses += row.total_runs ?? 0;
    if (row.retry_attempted) totalRetries += row.total_runs ?? 0;

    const existing = byExecutor.get(row.executor);
    if (existing) {
      existing.total_runs += row.total_runs;
      existing.repairs += row.repair_successes;
      existing.escalations += row.escalations;
      existing.safe_fails += row.safe_failures;
      existing.repair_attempts += row.repair_attempted ? (row.total_runs ?? 0) : 0;
      existing.repair_successes += row.repair_success ? (row.total_runs ?? 0) : 0;
      existing.retries += row.retry_attempted ? (row.total_runs ?? 0) : 0;
    } else {
      byExecutor.set(row.executor, {
        executor: row.executor,
        total_runs: row.total_runs,
        repairs: row.repair_successes,
        escalations: row.escalations,
        safe_fails: row.safe_failures,
        repair_attempts: row.repair_attempted ? (row.total_runs ?? 0) : 0,
        repair_successes: row.repair_success ? (row.total_runs ?? 0) : 0,
        retries: row.retry_attempted ? (row.total_runs ?? 0) : 0,
      });
    }
  }

  const { data: recentEscalations } = await supabase
    .from('immune_escalations')
    .select('executor, severity, scope, created_at, status')
    .order('created_at', { ascending: false })
    .limit(20);

  // HONEST repair rate: repairs / (repairs + escalations + safe_failures)
  // This prevents false 100% when most runs succeed without needing repair
  const totalRepairsAll = Array.from(byExecutor.values()).reduce((s, m) => s + m.repairs, 0);
  const totalEscalationsAll = Array.from(byExecutor.values()).reduce((s, m) => s + m.escalations, 0);
  const totalSafeFailsAll = Array.from(byExecutor.values()).reduce((s, m) => s + m.safe_fails, 0);
  const repairDenominator = totalRepairsAll + totalEscalationsAll + totalSafeFailsAll;

  const repairKPIs: RepairKPIs = {
    repair_attempt_rate: totalRunsAll > 0 ? totalRepairAttempts / totalRunsAll : 0,
    repair_success_rate: repairDenominator > 0 ? totalRepairsAll / repairDenominator : 0,
    retry_rate: totalRunsAll > 0 ? totalRetries / totalRunsAll : 0,
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
  };
}
