/**
 * Integrity Scanner — Structural health check (pure diagnostic, no mutations)
 * Checks: rule conflicts, oscillation, duplicates, escalation spikes, latency creep,
 *         dormant rules, rollback instability, executor registry mismatch.
 */

import { supabase } from '@/integrations/supabase/client';
import { PREFLIGHT } from './constants';
import type { ScanMode, IntegrityScanRun, IntegrityFinding, FindingSeverity } from './types';

interface Finding {
  category: string;
  severity: FindingSeverity;
  file_path?: string;
  message: string;
  suggested_fix?: string;
}

/** Run an integrity scan */
export async function runIntegrityScan(mode: ScanMode = 'quick'): Promise<{
  scan: IntegrityScanRun;
  findings: IntegrityFinding[];
}> {
  const start = Date.now();
  const findings: Finding[] = [];

  // 1. Rule conflicts check
  const { data: conflicts } = await supabase
    .from('immunity_rule_conflicts')
    .select('*')
    .eq('resolution', 'unresolved')
    .limit(50) as any;

  if (conflicts?.length > 0) {
    findings.push({
      category: 'rule_conflicts',
      severity: conflicts.length > 5 ? 'error' : 'warning',
      message: `${conflicts.length} unresolved rule conflict(s) detected`,
      suggested_fix: 'Review and resolve conflicts in the Rule Engine dashboard',
    });
  }

  // 2. Low success rate rules
  const { data: riskyRules } = await supabase
    .from('immunity_rules')
    .select('rule_key, success_rate, invocations_24h')
    .lt('success_rate', PREFLIGHT.MIN_SUCCESS_RATE)
    .gt('invocations_24h', 10)
    .limit(20) as any;

  if (riskyRules?.length > 0) {
    for (const r of riskyRules) {
      findings.push({
        category: 'rule_health',
        severity: (r.success_rate ?? 0) < 0.3 ? 'critical' : 'warning',
        message: `Rule "${r.rule_key}" has ${((r.success_rate ?? 0) * 100).toFixed(0)}% success rate with ${r.invocations_24h} invocations`,
        suggested_fix: 'Consider demoting or retiring this rule',
      });
    }
  }

  // 3. Escalation spike check
  const { data: recentMetrics } = await supabase
    .from('system_metrics_history')
    .select('escalation_rate, latency_p95, recorded_at')
    .order('recorded_at', { ascending: false })
    .limit(10) as any;

  if (recentMetrics?.length >= 2) {
    const latest = recentMetrics[0]?.escalation_rate ?? 0;
    const prev = recentMetrics[1]?.escalation_rate ?? 0;
    if (latest > prev + PREFLIGHT.MAX_ESCALATION_INCREASE) {
      findings.push({
        category: 'escalation_spike',
        severity: 'error',
        message: `Escalation rate spiked from ${(prev * 100).toFixed(1)}% to ${(latest * 100).toFixed(1)}%`,
        suggested_fix: 'Investigate recent rule changes or executor issues',
      });
    }

    // 3b. Latency creep check (compare latest vs 5th most recent)
    if (recentMetrics.length >= 5) {
      const latestLatency = recentMetrics[0]?.latency_p95 ?? 0;
      const olderLatency = recentMetrics[4]?.latency_p95 ?? 0;
      if (olderLatency > 0 && latestLatency > olderLatency * (1 + PREFLIGHT.MAX_LATENCY_DELTA)) {
        findings.push({
          category: 'latency_creep',
          severity: 'warning',
          message: `P95 latency increased from ${olderLatency.toFixed(0)}ms to ${latestLatency.toFixed(0)}ms over recent windows`,
          suggested_fix: 'Profile expensive rules and consider optimizing or retiring slow rules',
        });
      }
    }
  }

  // 4. Dormant promoted rules
  if (mode === 'deep' || mode === 'pre_promote') {
    const { data: dormant } = await supabase
      .from('immunity_rules')
      .select('rule_key')
      .eq('status', 'promoted')
      .eq('invocations_7d', 0)
      .limit(20) as any;

    if (dormant?.length > 0) {
      findings.push({
        category: 'dormant_rules',
        severity: 'info',
        message: `${dormant.length} promoted rule(s) with zero invocations in 7 days`,
        suggested_fix: 'Consider retiring dormant rules to reduce complexity',
      });
    }
  }

  // 5. Rollback stability
  const { data: recentPromotions } = await supabase
    .from('production_promotions')
    .select('status')
    .order('created_at', { ascending: false })
    .limit(10) as any;

  const rollbacks = (recentPromotions ?? []).filter((p: any) => p.status === 'rolled_back').length;
  if (rollbacks >= 3) {
    findings.push({
      category: 'rollback_instability',
      severity: 'error',
      message: `${rollbacks} out of last 10 promotions were rolled back`,
      suggested_fix: 'Review promotion criteria and shadow testing thoroughness',
    });
  }

  // 6. Oscillation detection (A promoted → demoted → promoted pattern)
  if (mode !== 'quick') {
    const { data: oscillatingRules } = await supabase
      .from('immunity_rule_conflicts')
      .select('rule_a_id, rule_b_id, conflict_type')
      .eq('conflict_type', 'oscillation')
      .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10) as any;

    if (oscillatingRules?.length > 0) {
      findings.push({
        category: 'oscillation',
        severity: 'error',
        message: `${oscillatingRules.length} oscillation event(s) detected in last 7 days`,
        suggested_fix: 'Block oscillating rules until root cause is resolved',
      });
    }
  }

  // 7. Duplicate rule signatures
  if (mode === 'deep' || mode === 'pre_promote') {
    const { data: allRules } = await supabase
      .from('immunity_rules')
      .select('rule_key, category, status')
      .in('status', ['learned', 'candidate', 'promoted'])
      .limit(500) as any;

    if (allRules) {
      const keyMap = new Map<string, number>();
      for (const r of allRules) {
        const key = `${r.category}::${r.rule_key}`;
        keyMap.set(key, (keyMap.get(key) ?? 0) + 1);
      }
      const duplicates = Array.from(keyMap.entries()).filter(([, count]) => count > 1);
      if (duplicates.length > 0) {
        findings.push({
          category: 'duplicate_rules',
          severity: 'warning',
          message: `${duplicates.length} duplicate rule signature(s) found across active statuses`,
          suggested_fix: 'Merge or retire duplicate rules to prevent conflicts',
        });
      }
    }
  }

  // 8. Executor registry mismatch (rules referencing executors that no longer exist)
  if (mode === 'deep') {
    const { data: propagations } = await supabase
      .from('immunity_rule_propagation')
      .select('to_executor')
      .limit(500) as any;

    if (propagations) {
      const uniqueExecutors = new Set((propagations ?? []).map((p: any) => p.to_executor));
      // Check if any propagation targets are orphaned (no recent invocations)
      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: activeExecutors } = await supabase
        .from('immunity_rule_invocations')
        .select('executor')
        .gte('created_at', since7d)
        .limit(1000) as any;

      const activeSet = new Set((activeExecutors ?? []).map((e: any) => e.executor));
      const orphaned = Array.from(uniqueExecutors).filter(e => !activeSet.has(e));
      if (orphaned.length > 0) {
        findings.push({
          category: 'executor_mismatch',
          severity: 'info',
          message: `${orphaned.length} executor(s) in propagation registry have no invocations in 7 days`,
          suggested_fix: 'Verify executor availability and clean up stale propagation entries',
        });
      }
    }
  }

  // Score calculation
  const criticals = findings.filter(f => f.severity === 'critical').length;
  const errors = findings.filter(f => f.severity === 'error').length;
  const warnings = findings.filter(f => f.severity === 'warning').length;
  const healthScore = Math.max(0, Math.min(100, 100 - (criticals * 25) - (errors * 10) - (warnings * 3)));

  const durationMs = Date.now() - start;

  // Persist scan run
  const { data: scanRun } = await supabase.from('integrity_scan_runs').insert({
    mode,
    errors_found: criticals + errors,
    warnings_found: warnings,
    health_score: healthScore,
    duration_ms: durationMs,
  } as any).select().single() as any;

  // Persist findings in batch
  const persistedFindings: IntegrityFinding[] = [];
  if (scanRun && findings.length > 0) {
    const rows = findings.map(f => ({
      scan_id: scanRun.id,
      category: f.category,
      severity: f.severity,
      file_path: f.file_path ?? null,
      message: f.message,
      suggested_fix: f.suggested_fix ?? null,
    }));
    const { data: inserted } = await supabase
      .from('integrity_findings')
      .insert(rows as any)
      .select() as any;
    if (inserted) persistedFindings.push(...inserted);
  }

  return { scan: scanRun, findings: persistedFindings };
}

/** Get latest integrity scan */
export async function getLatestScan(): Promise<IntegrityScanRun | null> {
  const { data } = await supabase
    .from('integrity_scan_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1) as any;
  return data?.[0] ?? null;
}

/** Get findings for a scan */
export async function getScanFindings(scanId: string): Promise<IntegrityFinding[]> {
  const { data } = await supabase
    .from('integrity_findings')
    .select('*')
    .eq('scan_id', scanId)
    .order('severity') as any;
  return data ?? [];
}
