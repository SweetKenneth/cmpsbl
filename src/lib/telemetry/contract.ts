/**
 * Telemetry Contract — Single Source of Truth
 * Defines canonical event names, fields, enums, and schema validators
 * for all telemetry producers (engines) and consumers (dashboard, aggregators).
 *
 * RULE: Never change field names or enum values without updating all consumers.
 */

import { z } from 'zod';

// ═══ Canonical Enums ══════════════════════════════════════════════

export const TelemetryMode = z.enum(['normal', 'shadow_probe', 'adversarial', 'replay']);
export type TelemetryMode = z.infer<typeof TelemetryMode>;

export const TelemetryOutcome = z.enum(['success', 'safe_fail', 'retry', 'escalation', 'skipped']);
export type TelemetryOutcome = z.infer<typeof TelemetryOutcome>;

export const SeverityLevel = z.enum(['low', 'medium', 'high', 'critical']);
export type SeverityLevel = z.infer<typeof SeverityLevel>;

// ═══ Canonical Event Schema ═══════════════════════════════════════

export const TelemetryEventSchema = z.object({
  executorId: z.string(),
  runId: z.string().uuid().optional(),
  mode: TelemetryMode,
  isShadowMesh: z.boolean(),
  outcome: TelemetryOutcome,
  timestamp: z.string().datetime(),
  attemptCount: z.number().int().min(0).default(0),
  retryCount: z.number().int().min(0).default(0),
  escalationLevel: SeverityLevel.optional(),
  durationMs: z.number().min(0).optional(),
  repairType: z.string().nullable().optional(),
  repairConfidence: z.number().min(0).max(1).optional(),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

// ═══ Canonical DB Row Shape (immune_metrics) ═════════════════════

export const ImmuneMetricsRowSchema = z.object({
  executor: z.string(),
  total_runs: z.number().int().min(0),
  repair_successes: z.number().int().min(0),
  escalations: z.number().int().min(0),
  safe_failures: z.number().int().min(0),
  repair_attempted: z.boolean(),
  repair_success: z.boolean(),
  repair_type: z.string().nullable().optional(),
  retry_attempted: z.boolean(),
});

export type ImmuneMetricsRow = z.infer<typeof ImmuneMetricsRowSchema>;

// ═══ Canonical Aggregated Metrics ════════════════════════════════

export const AggregatedMetricsSchema = z.object({
  totalRuns: z.number().int().min(0),
  repairAttempts: z.number().int().min(0),
  repairSuccesses: z.number().int().min(0),
  escalations: z.number().int().min(0),
  safeFailures: z.number().int().min(0),
  retries: z.number().int().min(0),
  /** (repair_attempts / total_runs) * 100 — null when totalRuns=0 */
  repairAttemptRate: z.number().nullable(),
  /** (repair_successes / repair_attempts) * 100 — null when repairAttempts=0 */
  repairSuccessPct: z.number().nullable(),
  /** (retries / total_runs) * 100 — null when totalRuns=0 */
  retryRate: z.number().nullable(),
});

export type AggregatedMetrics = z.infer<typeof AggregatedMetricsSchema>;

// ═══ Per-Executor Health ═════════════════════════════════════════

export const ExecutorHealthSchema = z.object({
  executor: z.string(),
  totalRuns: z.number().int().min(0),
  repairAttempts: z.number().int().min(0),
  repairSuccesses: z.number().int().min(0),
  escalations: z.number().int().min(0),
  safeFailures: z.number().int().min(0),
  repairRate: z.number().nullable(),
});

export type ExecutorHealth = z.infer<typeof ExecutorHealthSchema>;

// ═══ Dashboard Display Shape ════════════════════════════════════

export interface TelemetryDashboardData {
  /** Baseline metrics (isShadowMesh=false / all real executor runs) */
  baseline: AggregatedMetrics;
  /** Shadow Mesh probe-only metrics */
  shadow: AggregatedMetrics;
  /** Per-executor health (baseline only) */
  executorHealth: ExecutorHealth[];
  /** Recent escalations */
  recentEscalations: Array<{
    executor: string;
    severity: string;
    scope: string;
    created_at: string;
    status: string;
  }>;
  /** Time window used for aggregation */
  windowHours: number;
}

// ═══ Validation Helpers ═════════════════════════════════════════

export function validateMetricsRow(row: unknown): ImmuneMetricsRow | null {
  const result = ImmuneMetricsRowSchema.safeParse(row);
  return result.success ? result.data : null;
}

export function validateTelemetryEvent(event: unknown): TelemetryEvent | null {
  const result = TelemetryEventSchema.safeParse(event);
  return result.success ? result.data : null;
}

// ═══ Display Helpers ════════════════════════════════════════════

/** Format a nullable rate for display: null → "—", number → "X.X%" */
export function formatRate(rate: number | null): string {
  if (rate === null || rate === undefined) return '—';
  return `${rate.toFixed(1)}%`;
}
