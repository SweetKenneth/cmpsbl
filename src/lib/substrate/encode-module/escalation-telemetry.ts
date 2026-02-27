/**
 * ENCODE Escalation Resolution Telemetry
 * Tracks how well ENCODE resolves immune escalations
 * 
 * Metrics tracked:
 *  - Claim-to-resolve latency (ms)
 *  - Resolution success/failure rates
 *  - Learning loop effectiveness (rules promoted, rejected, rolled back)
 *  - Per-executor resolution breakdown
 *  - Escalation volume trend (inflow vs outflow)
 *  - Mean time to resolution (MTTR)
 */

import { log } from '@/lib/system/log';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ResolutionEvent {
  escalationId: string;
  executor: string;
  claimedAt: number;
  resolvedAt?: number;
  success: boolean;
  method: 'deterministic' | 'learning_rule' | 'legacy' | 'manual' | 'auto_retry';
  ruleId?: string;          // if resolved by a learning-loop rule
  note?: string;
}

export interface EscalationTelemetrySnapshot {
  /** Total escalations claimed by ENCODE */
  totalClaimed: number;
  /** Total successfully resolved */
  totalResolved: number;
  /** Total that failed resolution */
  totalFailed: number;
  /** Resolution rate (resolved / claimed) */
  resolutionRate: number;
  /** Mean time to resolution in ms */
  mttrMs: number;
  /** Median time to resolution in ms */
  medianTtrMs: number;
  /** Per-executor breakdown */
  byExecutor: Record<string, {
    claimed: number;
    resolved: number;
    failed: number;
    avgTtrMs: number;
  }>;
  /** Per-method breakdown */
  byMethod: Record<string, { count: number; successRate: number }>;
  /** Learning loop effectiveness */
  learningLoop: {
    rulesApplied: number;
    rulesSucceeded: number;
    rulesFailed: number;
    ruleEffectiveness: number;
  };
  /** Inflow vs outflow rate (escalations/min) */
  inflowRate: number;
  outflowRate: number;
  /** Net backlog trend: negative = clearing, positive = growing */
  backlogTrend: number;
  /** Timestamp window */
  windowStartMs: number;
  windowEndMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// State — in-memory ring buffer
// ═══════════════════════════════════════════════════════════════════════════

const MAX_EVENTS = 500;
const events: ResolutionEvent[] = [];

/** Record timestamps of new escalations (inflow) */
const inflowTimestamps: number[] = [];
const MAX_INFLOW = 200;

// ═══════════════════════════════════════════════════════════════════════════
// Recording API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Record that ENCODE claimed an escalation
 */
export function recordClaim(escalationId: string, executor: string): void {
  if (events.length >= MAX_EVENTS) events.shift();
  events.push({
    escalationId,
    executor,
    claimedAt: Date.now(),
    success: false,  // pending
    method: 'deterministic',
  });
}

/**
 * Record escalation inflow (new escalation created)
 */
export function recordEscalationInflow(): void {
  if (inflowTimestamps.length >= MAX_INFLOW) inflowTimestamps.shift();
  inflowTimestamps.push(Date.now());
}

/**
 * Record that ENCODE resolved (or failed) an escalation
 */
export function recordResolution(
  escalationId: string,
  success: boolean,
  method: ResolutionEvent['method'],
  ruleId?: string,
  note?: string,
): void {
  const existing = events.find(e => e.escalationId === escalationId && !e.resolvedAt);
  if (existing) {
    existing.resolvedAt = Date.now();
    existing.success = success;
    existing.method = method;
    existing.ruleId = ruleId;
    existing.note = note;
  } else {
    // Late recording — add full event
    if (events.length >= MAX_EVENTS) events.shift();
    events.push({
      escalationId,
      executor: 'unknown',
      claimedAt: Date.now() - 1000, // approximate
      resolvedAt: Date.now(),
      success,
      method,
      ruleId,
      note,
    });
  }

  log.info('encode', `Escalation ${escalationId.slice(0, 8)}… ${success ? 'resolved' : 'failed'} via ${method}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// Snapshot API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Produce a full telemetry snapshot for dashboard consumption
 */
export function getEscalationTelemetry(windowMs = 6 * 60 * 60 * 1000): EscalationTelemetrySnapshot {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Filter to window
  const windowed = events.filter(e => e.claimedAt >= windowStart);
  const resolved = windowed.filter(e => e.resolvedAt && e.success);
  const failed = windowed.filter(e => e.resolvedAt && !e.success);

  // TTR calculations
  const ttrValues = resolved
    .map(e => (e.resolvedAt! - e.claimedAt))
    .filter(v => v > 0)
    .sort((a, b) => a - b);

  const mttrMs = ttrValues.length > 0
    ? ttrValues.reduce((a, b) => a + b, 0) / ttrValues.length
    : 0;
  const medianTtrMs = ttrValues.length > 0
    ? ttrValues[Math.floor(ttrValues.length / 2)]
    : 0;

  // Per-executor
  const byExecutor: EscalationTelemetrySnapshot['byExecutor'] = {};
  for (const e of windowed) {
    if (!byExecutor[e.executor]) {
      byExecutor[e.executor] = { claimed: 0, resolved: 0, failed: 0, avgTtrMs: 0 };
    }
    const bucket = byExecutor[e.executor];
    bucket.claimed++;
    if (e.resolvedAt && e.success) {
      bucket.resolved++;
      bucket.avgTtrMs = (bucket.avgTtrMs * (bucket.resolved - 1) + (e.resolvedAt - e.claimedAt)) / bucket.resolved;
    } else if (e.resolvedAt && !e.success) {
      bucket.failed++;
    }
  }

  // Per-method
  const methodMap = new Map<string, { total: number; successes: number }>();
  for (const e of windowed.filter(ev => ev.resolvedAt)) {
    const m = methodMap.get(e.method) ?? { total: 0, successes: 0 };
    m.total++;
    if (e.success) m.successes++;
    methodMap.set(e.method, m);
  }
  const byMethod: EscalationTelemetrySnapshot['byMethod'] = {};
  for (const [k, v] of methodMap) {
    byMethod[k] = { count: v.total, successRate: v.total > 0 ? v.successes / v.total : 0 };
  }

  // Learning loop effectiveness
  const ruleEvents = windowed.filter(e => e.ruleId);
  const learningLoop = {
    rulesApplied: ruleEvents.length,
    rulesSucceeded: ruleEvents.filter(e => e.success).length,
    rulesFailed: ruleEvents.filter(e => !e.success).length,
    ruleEffectiveness: ruleEvents.length > 0
      ? ruleEvents.filter(e => e.success).length / ruleEvents.length
      : 0,
  };

  // Flow rates (per minute)
  const windowMinutes = windowMs / 60_000;
  const recentInflow = inflowTimestamps.filter(t => t >= windowStart).length;
  const inflowRate = windowMinutes > 0 ? recentInflow / windowMinutes : 0;
  const outflowRate = windowMinutes > 0 ? (resolved.length + failed.length) / windowMinutes : 0;

  return {
    totalClaimed: windowed.length,
    totalResolved: resolved.length,
    totalFailed: failed.length,
    resolutionRate: windowed.length > 0 ? resolved.length / windowed.length : 0,
    mttrMs,
    medianTtrMs,
    byExecutor,
    byMethod,
    learningLoop,
    inflowRate,
    outflowRate,
    backlogTrend: inflowRate - outflowRate,
    windowStartMs: windowStart,
    windowEndMs: now,
  };
}

/**
 * Format a human-readable summary for terminal / logs
 */
export function formatEscalationTelemetry(): string {
  const t = getEscalationTelemetry();
  const lines = [
    `── ENCODE Escalation Resolution Telemetry ──`,
    `  Claimed: ${t.totalClaimed}  Resolved: ${t.totalResolved}  Failed: ${t.totalFailed}`,
    `  Resolution Rate: ${(t.resolutionRate * 100).toFixed(1)}%`,
    `  MTTR: ${(t.mttrMs / 1000).toFixed(1)}s  Median TTR: ${(t.medianTtrMs / 1000).toFixed(1)}s`,
    `  Flow: ↑${t.inflowRate.toFixed(2)}/min  ↓${t.outflowRate.toFixed(2)}/min  Trend: ${t.backlogTrend > 0 ? '⚠ growing' : '✓ clearing'}`,
    `  Learning Rules: ${t.learningLoop.rulesApplied} applied (${(t.learningLoop.ruleEffectiveness * 100).toFixed(0)}% effective)`,
  ];

  const executors = Object.entries(t.byExecutor);
  if (executors.length > 0) {
    lines.push(`  ── Per Executor ──`);
    for (const [name, stats] of executors.slice(0, 8)) {
      const rate = stats.claimed > 0 ? ((stats.resolved / stats.claimed) * 100).toFixed(0) : '0';
      lines.push(`    ${name}: ${stats.resolved}/${stats.claimed} (${rate}%) avg ${(stats.avgTtrMs / 1000).toFixed(1)}s`);
    }
  }

  return lines.join('\n');
}

/**
 * Reset all telemetry state
 */
export function resetEscalationTelemetry(): void {
  events.length = 0;
  inflowTimestamps.length = 0;
  log.info('encode', 'Escalation resolution telemetry reset');
}
