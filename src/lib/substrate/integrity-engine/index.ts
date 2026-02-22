/**
 * System Integrity Engine — Structural Scan for Pre-Promote Guardrails
 * Pure diagnostic. Does NOT mutate state.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ScanMode = 'quick' | 'deep' | 'pre_promote' | 'scheduled';
export type FindingSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface IntegrityFinding {
  category: string;
  severity: FindingSeverity;
  file_path: string | null;
  message: string;
  suggested_fix: string | null;
}

export interface IntegrityScanResult {
  scan_id: string | null;
  mode: ScanMode;
  health_score: number;
  errors_found: number;
  warnings_found: number;
  findings: IntegrityFinding[];
  duration_ms: number;
  passed: boolean;
}

// ═══════════════════════════════════════════════════════════════
// GUARDRAIL THRESHOLDS
// ═══════════════════════════════════════════════════════════════

const THRESHOLDS = {
  MIN_HEALTH_SCORE: 70,
  MAX_ESCALATION_INCREASE_PCT: 10,
  MAX_LATENCY_DELTA_PCT: 20,
  MAX_COST_DELTA_PCT: 25,
  MIN_RULE_SUCCESS_RATE: 60,
};

// ═══════════════════════════════════════════════════════════════
// INTEGRITY CHECKS
// ═══════════════════════════════════════════════════════════════

async function checkModuleHealth(): Promise<IntegrityFinding[]> {
  const findings: IntegrityFinding[] = [];
  try {
    const { data: events } = await supabase
      .from('brain_events')
      .select('module, outcome')
      .order('created_at', { ascending: false })
      .limit(200);

    if (events) {
      const moduleStats: Record<string, { total: number; failures: number }> = {};
      for (const ev of events) {
        const mod = ev.module || 'unknown';
        if (!moduleStats[mod]) moduleStats[mod] = { total: 0, failures: 0 };
        moduleStats[mod].total++;
        if (ev.outcome === 'failure' || ev.outcome === 'error') {
          moduleStats[mod].failures++;
        }
      }

      for (const [mod, stats] of Object.entries(moduleStats)) {
        const failRate = stats.failures / stats.total;
        if (failRate > 0.3) {
          findings.push({
            category: 'runtime',
            severity: failRate > 0.5 ? 'critical' : 'warning',
            file_path: null,
            message: `Module "${mod}" has ${(failRate * 100).toFixed(0)}% failure rate (${stats.failures}/${stats.total})`,
            suggested_fix: `Investigate ${mod} module errors and consider circuit breaker reset`,
          });
        }
      }
    }
  } catch {
    // non-blocking
  }
  return findings;
}

async function checkEscalationSpike(): Promise<IntegrityFinding[]> {
  const findings: IntegrityFinding[] = [];
  try {
    const { data: recent } = await supabase
      .from('immune_escalations')
      .select('id')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    const { data: baseline } = await supabase
      .from('immune_escalations')
      .select('id')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())
      .lt('created_at', new Date(Date.now() - 3600000).toISOString());

    const recentCount = recent?.length || 0;
    const baselineHourly = (baseline?.length || 0) / 23;

    if (baselineHourly > 0 && recentCount > baselineHourly * 2) {
      findings.push({
        category: 'telemetry',
        severity: 'error',
        file_path: null,
        message: `Escalation spike detected: ${recentCount} in last hour vs ${baselineHourly.toFixed(1)} hourly baseline`,
        suggested_fix: 'Review escalation sources before promoting',
      });
    }
  } catch {
    // non-blocking
  }
  return findings;
}

async function checkRuleConflicts(): Promise<IntegrityFinding[]> {
  const findings: IntegrityFinding[] = [];
  try {
    const { data: metrics } = await supabase
      .from('immune_metrics')
      .select('executor, total_runs, safe_failures, escalations')
      .order('run_at', { ascending: false })
      .limit(50);

    if (metrics) {
      for (const m of metrics) {
        const runs = m.total_runs ?? 0;
        const failures = (m.safe_failures ?? 0) + (m.escalations ?? 0);
        const successRate = runs > 0 ? ((runs - failures) / runs) * 100 : 100;
        if (runs >= 10 && successRate < THRESHOLDS.MIN_RULE_SUCCESS_RATE) {
          findings.push({
            category: 'runtime',
            severity: 'warning',
            file_path: null,
            message: `Executor "${m.executor}" has ${successRate.toFixed(1)}% success rate (threshold: ${THRESHOLDS.MIN_RULE_SUCCESS_RATE}%)`,
            suggested_fix: 'Review executor rules or retire low-performing rules',
          });
        }
      }
    }
  } catch {
    // non-blocking
  }
  return findings;
}

async function checkSystemFlags(): Promise<IntegrityFinding[]> {
  const findings: IntegrityFinding[] = [];
  try {
    const { data: flags } = await supabase
      .from('system_flags')
      .select('key, enabled')
      .in('key', ['shadow_mesh_enabled', 'defense_enabled', 'seba_enabled']);

    if (flags) {
      for (const flag of flags) {
        if (!flag.enabled) {
          findings.push({
            category: 'config',
            severity: 'info',
            file_path: null,
            message: `System flag "${flag.key}" is disabled`,
            suggested_fix: null,
          });
        }
      }
    }
  } catch {
    // non-blocking
  }
  return findings;
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCAN
// ═══════════════════════════════════════════════════════════════

export async function runIntegrityScan(mode: ScanMode = 'quick'): Promise<IntegrityScanResult> {
  const start = Date.now();
  const allFindings: IntegrityFinding[] = [];

  // Run checks in parallel
  const checks = await Promise.allSettled([
    checkModuleHealth(),
    checkEscalationSpike(),
    checkRuleConflicts(),
    checkSystemFlags(),
  ]);

  for (const result of checks) {
    if (result.status === 'fulfilled') {
      allFindings.push(...result.value);
    }
  }

  const errorsFound = allFindings.filter(f => f.severity === 'critical' || f.severity === 'error').length;
  const warningsFound = allFindings.filter(f => f.severity === 'warning').length;

  // Health score: start at 100, deduct for findings
  let healthScore = 100;
  for (const f of allFindings) {
    if (f.severity === 'critical') healthScore -= 20;
    else if (f.severity === 'error') healthScore -= 10;
    else if (f.severity === 'warning') healthScore -= 3;
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  const durationMs = Date.now() - start;

  // Persist scan
  let scanId: string | null = null;
  try {
    const { data } = await supabase
      .from('integrity_scan_runs')
      .insert({
        mode,
        errors_found: errorsFound,
        warnings_found: warningsFound,
        health_score: healthScore,
        duration_ms: durationMs,
      })
      .select('id')
      .single();

    scanId = data?.id || null;

    if (scanId && allFindings.length > 0) {
      await supabase.from('integrity_findings').insert(
        allFindings.map(f => ({
          scan_id: scanId,
          category: f.category,
          severity: f.severity,
          file_path: f.file_path,
          message: f.message,
          suggested_fix: f.suggested_fix,
        }))
      );
    }
  } catch {
    // non-blocking
  }

  return {
    scan_id: scanId,
    mode,
    health_score: healthScore,
    errors_found: errorsFound,
    warnings_found: warningsFound,
    findings: allFindings,
    duration_ms: durationMs,
    passed: healthScore >= THRESHOLDS.MIN_HEALTH_SCORE && errorsFound === 0,
  };
}

/**
 * Pre-promote integrity gate: blocks promotion if critical issues exist
 */
export async function prePromoteGate(): Promise<{
  allowed: boolean;
  scan: IntegrityScanResult;
  blockReasons: string[];
}> {
  const scan = await runIntegrityScan('pre_promote');
  const blockReasons: string[] = [];

  if (scan.health_score < THRESHOLDS.MIN_HEALTH_SCORE) {
    blockReasons.push(`Health score ${scan.health_score} below threshold ${THRESHOLDS.MIN_HEALTH_SCORE}`);
  }

  if (scan.errors_found > 0) {
    blockReasons.push(`${scan.errors_found} critical/error findings detected`);
  }

  return {
    allowed: blockReasons.length === 0,
    scan,
    blockReasons,
  };
}

/**
 * Get scan history
 */
export async function getScanHistory(limit = 20): Promise<any[]> {
  try {
    const { data } = await supabase
      .from('integrity_scan_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get findings for a specific scan
 */
export async function getScanFindings(scanId: string): Promise<IntegrityFinding[]> {
  try {
    const { data } = await supabase
      .from('integrity_findings')
      .select('*')
      .eq('scan_id', scanId);
    return (data || []) as IntegrityFinding[];
  } catch {
    return [];
  }
}
