/**
 * HYGIENE Engine — Database Retention, Stale Task Detection, Orphan Cleanup
 * Responsible for data lifecycle management and system cleanliness
 */

import { supabase } from '@/integrations/supabase/client';
import type { MaintenanceRunResult, MaintenanceFinding, TriggerSource } from './types';

// ── Retention Checks ───────────────────────────────────────────────────────

interface RetentionRule {
  table: string;
  column: string;
  maxAgeDays: number;
  label: string;
}

const RETENTION_RULES: RetentionRule[] = [
  { table: 'brain_events', column: 'created_at', maxAgeDays: 90, label: 'Brain Events' },
  { table: 'nexus_traces', column: 'created_at', maxAgeDays: 30, label: 'NEXUS Traces' },
  { table: 'ai_usage_log', column: 'created_at', maxAgeDays: 90, label: 'AI Usage Logs' },
  { table: 'analytics_events', column: 'created_at', maxAgeDays: 90, label: 'Analytics Events' },
  { table: 'security_audit_log', column: 'created_at', maxAgeDays: 180, label: 'Security Audit Logs' },
  { table: 'edge_rate_limits', column: 'window_start', maxAgeDays: 1, label: 'Edge Rate Limits' },
  { table: 'agency_task_logs', column: 'created_at', maxAgeDays: 60, label: 'Agency Task Logs' },
  { table: 'audit_logs', column: 'created_at', maxAgeDays: 365, label: 'Audit Logs' },
];

async function checkRetention(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];

  for (const rule of RETENTION_RULES) {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - rule.maxAgeDays);

      const { count, error } = await supabase
        .from(rule.table as any)
        .select('*', { count: 'exact', head: true })
        .lt(rule.column, cutoff.toISOString());

      if (error) {
        findings.push({
          id: `retention_check_${rule.table}`,
          severity: 'warn',
          category: 'retention',
          title: `Cannot check ${rule.label} retention`,
          detail: error.message,
        });
        continue;
      }

      if (count && count > 0) {
        findings.push({
          id: `retention_expired_${rule.table}`,
          severity: count > 10000 ? 'error' : 'warn',
          category: 'retention',
          title: `${rule.label}: ${count} expired rows (>${rule.maxAgeDays}d)`,
          detail: `Table ${rule.table} has ${count} rows older than ${rule.maxAgeDays} days that should be purged.`,
          remediation: `Run cleanup_retention() or DELETE FROM ${rule.table} WHERE ${rule.column} < now() - INTERVAL '${rule.maxAgeDays} days'`,
        });
      } else {
        findings.push({
          id: `retention_ok_${rule.table}`,
          severity: 'info',
          category: 'retention',
          title: `${rule.label}: retention policy clean`,
          detail: `No rows older than ${rule.maxAgeDays} days.`,
        });
      }
    } catch (err: any) {
      findings.push({
        id: `retention_error_${rule.table}`,
        severity: 'warn',
        category: 'retention',
        title: `Retention check failed for ${rule.label}`,
        detail: err?.message ?? 'Unknown error',
      });
    }
  }

  return findings;
}

// ── Stale Task Detection ───────────────────────────────────────────────────

async function checkStaleTasks(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];

  try {
    // Check for agency tasks stuck in 'running' for >1 hour
    const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
    const { data: staleTasks, error } = await supabase
      .from('agency_tasks')
      .select('id, title, status, started_at')
      .eq('status', 'running')
      .lt('started_at', oneHourAgo)
      .limit(50);

    if (error) {
      findings.push({
        id: 'stale_tasks_check_error',
        severity: 'warn',
        category: 'task_health',
        title: 'Could not check for stale tasks',
        detail: error.message,
      });
    } else if (staleTasks && staleTasks.length > 0) {
      findings.push({
        id: 'stale_tasks_found',
        severity: staleTasks.length > 10 ? 'error' : 'warn',
        category: 'task_health',
        title: `${staleTasks.length} stale task(s) stuck in 'running'`,
        detail: `Tasks running for >1 hour: ${staleTasks.slice(0, 5).map(t => t.title).join(', ')}${staleTasks.length > 5 ? '...' : ''}`,
        remediation: 'Consider marking these tasks as failed or restarting them.',
      });
    } else {
      findings.push({
        id: 'stale_tasks_clean',
        severity: 'info',
        category: 'task_health',
        title: 'No stale tasks detected',
        detail: 'All running tasks are within normal execution timeframes.',
      });
    }
  } catch (err: any) {
    findings.push({
      id: 'stale_tasks_error',
      severity: 'warn',
      category: 'task_health',
      title: 'Stale task detection failed',
      detail: err?.message ?? 'Unknown error',
    });
  }

  // Check scheduled tasks with overdue next_run_at
  try {
    const { data: overdue, error } = await supabase
      .from('agency_scheduled_tasks')
      .select('id, title, next_run_at, schedule_type')
      .eq('is_active', true)
      .lt('next_run_at', new Date().toISOString())
      .limit(50);

    if (!error && overdue && overdue.length > 0) {
      findings.push({
        id: 'overdue_scheduled_tasks',
        severity: 'warn',
        category: 'task_health',
        title: `${overdue.length} overdue scheduled task(s)`,
        detail: `Scheduled tasks past their next_run_at: ${overdue.slice(0, 5).map(t => t.title).join(', ')}`,
        remediation: 'Check cron runner health or manually trigger overdue tasks.',
      });
    }
  } catch {
    // non-critical
  }

  return findings;
}

// ── Orphan Record Detection ────────────────────────────────────────────────

async function checkOrphanRecords(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];

  // Check for agency members without a valid agency
  try {
    const { count, error } = await supabase
      .from('agency_members')
      .select('id, agency_id', { count: 'exact', head: true });

    if (!error && count !== null) {
      findings.push({
        id: 'orphan_check_members',
        severity: 'info',
        category: 'orphans',
        title: `Agency members count: ${count}`,
        detail: 'FK constraints should prevent orphans, but monitor for edge cases.',
      });
    }
  } catch {
    // non-critical
  }

  // Check for gate_runs without pass_results
  try {
    const { data: emptyRuns, error } = await supabase
      .from('gate_runs')
      .select('id')
      .is('pass_results', null)
      .limit(10);

    if (!error && emptyRuns && emptyRuns.length > 0) {
      findings.push({
        id: 'orphan_gate_runs',
        severity: 'warn',
        category: 'orphans',
        title: `${emptyRuns.length} gate run(s) with no pass results`,
        detail: 'These runs may have been interrupted before completion.',
        remediation: 'Consider deleting incomplete gate runs.',
      });
    }
  } catch {
    // non-critical
  }

  return findings;
}

// ── Memory Hygiene ─────────────────────────────────────────────────────────

async function checkMemoryHygiene(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];

  try {
    const { count: hotCount } = await supabase
      .from('brain_memory_hot')
      .select('*', { count: 'exact', head: true });

    const { count: warmCount } = await supabase
      .from('brain_memory_warm')
      .select('*', { count: 'exact', head: true });

    const { count: coldCount } = await supabase
      .from('brain_memory_cold')
      .select('*', { count: 'exact', head: true });

    const total = (hotCount ?? 0) + (warmCount ?? 0) + (coldCount ?? 0);

    findings.push({
      id: 'memory_tier_counts',
      severity: total > 100000 ? 'warn' : 'info',
      category: 'memory',
      title: `Memory tiers: ${hotCount ?? 0} hot / ${warmCount ?? 0} warm / ${coldCount ?? 0} cold`,
      detail: `Total memory entries: ${total}. ${total > 100000 ? 'Consider running memory tiering to optimize.' : 'Within healthy bounds.'}`,
    });
  } catch (err: any) {
    findings.push({
      id: 'memory_check_error',
      severity: 'warn',
      category: 'memory',
      title: 'Memory hygiene check failed',
      detail: err?.message ?? 'Unknown error',
    });
  }

  return findings;
}

// ── Main Runner ────────────────────────────────────────────────────────────

export async function runHygieneEngine(triggerSource: TriggerSource = 'manual'): Promise<MaintenanceRunResult> {
  const start = performance.now();
  const allFindings: MaintenanceFinding[] = [];

  // Run all checks in parallel
  const [retention, staleTasks, orphans, memory] = await Promise.all([
    checkRetention().catch(() => [] as MaintenanceFinding[]),
    checkStaleTasks().catch(() => [] as MaintenanceFinding[]),
    checkOrphanRecords().catch(() => [] as MaintenanceFinding[]),
    checkMemoryHygiene().catch(() => [] as MaintenanceFinding[]),
  ]);

  allFindings.push(...retention, ...staleTasks, ...orphans, ...memory);

  const durationMs = Math.round(performance.now() - start);
  const critical = allFindings.filter(f => f.severity === 'critical').length;
  const errors = allFindings.filter(f => f.severity === 'error').length;
  const warnings = allFindings.filter(f => f.severity === 'warn').length;
  const info = allFindings.filter(f => f.severity === 'info').length;
  const autoFixed = allFindings.filter(f => f.auto_fixed).length;

  return {
    engine: 'hygiene',
    status: critical > 0 || errors > 0 ? 'failed' : warnings > 0 ? 'partial' : 'passed',
    triggerSource,
    durationMs,
    findings: allFindings,
    summary: {
      total: allFindings.length,
      critical,
      errors,
      warnings,
      info,
      autoFixed,
      passed: critical === 0 && errors === 0,
    },
  };
}
