/**
 * Integrity Scanner — Structural health check (pure diagnostic, no mutations)
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
    .select('escalation_rate')
    .order('recorded_at', { ascending: false })
    .limit(5) as any;

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

  // Persist findings
  const persistedFindings: IntegrityFinding[] = [];
  if (scanRun && findings.length > 0) {
    for (const f of findings) {
      const { data: pf } = await supabase.from('integrity_findings').insert({
        scan_id: scanRun.id,
        category: f.category,
        severity: f.severity,
        file_path: f.file_path ?? null,
        message: f.message,
        suggested_fix: f.suggested_fix ?? null,
      } as any).select().single() as any;
      if (pf) persistedFindings.push(pf);
    }
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
