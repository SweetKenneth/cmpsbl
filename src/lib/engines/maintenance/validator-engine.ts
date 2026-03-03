/**
 * VALIDATOR Engine — Test Suites, GATE Runs, Health Checks
 * Responsible for system integrity validation and structural health
 */

import { supabase } from '@/integrations/supabase/client';
import { runGateEngine, type GateRunResult } from '@/lib/gate/engine';
import type { MaintenanceRunResult, MaintenanceFinding, PassResult, TriggerSource } from './types';

// ── GATE Integration ───────────────────────────────────────────────────────

async function runGatePass(): Promise<{ findings: MaintenanceFinding[]; passResults: PassResult[]; gateResult: GateRunResult }> {
  const findings: MaintenanceFinding[] = [];

  try {
    const gateResult = await runGateEngine();

    const passResults: PassResult[] = gateResult.passResults.map(p => ({
      name: p.name,
      status: p.status,
      durationMs: p.durationMs,
      notes: p.notes,
    }));

    // Convert gate results to findings
    for (const p of gateResult.passResults) {
      if (p.status === 'FAIL') {
        findings.push({
          id: `gate_fail_${p.pass}`,
          severity: p.required ? 'error' : 'warn',
          category: 'gate',
          title: `GATE Pass ${p.pass} (${p.name}) failed`,
          detail: p.notes.filter(n => n.startsWith('✗')).join('; ') || 'No details',
          remediation: `Review ${p.name} implementation for regressions.`,
        });
      }
    }

    if (gateResult.status === 'passed') {
      findings.push({
        id: 'gate_overall_pass',
        severity: 'info',
        category: 'gate',
        title: `GATE passed: ${gateResult.passedCount}/${gateResult.totalPasses} in ${gateResult.durationMs}ms`,
        detail: 'All required gate passes succeeded.',
      });
    }

    return { findings, passResults, gateResult };
  } catch (err: any) {
    findings.push({
      id: 'gate_crash',
      severity: 'critical',
      category: 'gate',
      title: 'GATE engine crashed',
      detail: err?.message ?? 'Unknown error during gate execution',
      remediation: 'Check gate engine imports and dependencies.',
    });
    return { findings, passResults: [], gateResult: { status: 'failed', totalPasses: 0, passedCount: 0, failedCount: 0, skippedCount: 0, durationMs: 0, passResults: [] } };
  }
}

// ── Substrate Health Check ─────────────────────────────────────────────────

async function runSubstrateHealthPass(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];

  try {
    const { runSubstrateHealthCheck } = await import('@/lib/audit/substrate-health-check');
    const report = runSubstrateHealthCheck();

    findings.push({
      id: 'substrate_health',
      severity: report.overall_verdict === 'PASS' ? 'info' : 'error',
      category: 'substrate',
      title: `Substrate health: ${report.overall_verdict} (${report.structural_issues} issues)`,
      detail: `${report.layers.filter(l => l.verdict === 'PASS').length}/${report.layers.length} layers passed. Duration: ${report.duration_ms}ms`,
    });

    // Report failed layers
    for (const layer of report.layers) {
      if (layer.verdict === 'FAIL') {
        const failedChecks = layer.checks.filter(c => !c.pass);
        findings.push({
          id: `substrate_layer_${layer.layer}`,
          severity: 'warn',
          category: 'substrate',
          title: `Layer ${layer.layer} degraded`,
          detail: failedChecks.map(c => `${c.id}: ${c.detail ?? c.message}`).join('; '),
        });
      }
    }
  } catch (err: any) {
    findings.push({
      id: 'substrate_health_error',
      severity: 'warn',
      category: 'substrate',
      title: 'Substrate health check failed',
      detail: err?.message ?? 'Could not import or run substrate health check',
    });
  }

  return findings;
}

// ── Audit Engine Check ─────────────────────────────────────────────────────

async function runAuditPass(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];

  try {
    const { runFullAudit } = await import('@/lib/audit/audit-runner');
    const audit = await runFullAudit();

    findings.push({
      id: 'audit_summary',
      severity: audit.summary.passed ? 'info' : audit.summary.fatal > 0 ? 'critical' : 'error',
      category: 'audit',
      title: `Audit: ${audit.summary.passed ? 'PASSED' : 'FAILED'} — ${audit.summary.total} findings`,
      detail: `Fatal: ${audit.summary.fatal}, Error: ${audit.summary.error}, Warn: ${audit.summary.warn}, Info: ${audit.summary.info}. Duration: ${audit.duration_ms}ms`,
    });

    // Surface fatal/error findings
    for (const f of audit.findings.filter(f => f.severity === 'fatal' || f.severity === 'error')) {
      findings.push({
        id: `audit_${f.id}`,
        severity: f.severity === 'fatal' ? 'critical' : 'error',
        category: 'audit',
        title: f.title,
        detail: f.detail,
        remediation: f.hint,
      });
    }
  } catch (err: any) {
    findings.push({
      id: 'audit_error',
      severity: 'warn',
      category: 'audit',
      title: 'Full audit failed to run',
      detail: err?.message ?? 'Unknown error',
    });
  }

  return findings;
}

// ── Backend Connectivity Check ─────────────────────────────────────────────

async function runConnectivityPass(): Promise<MaintenanceFinding[]> {
  const findings: MaintenanceFinding[] = [];
  const start = performance.now();

  try {
    const { data, error } = await supabase.from('gate_runs').select('id').limit(1);
    const latency = Math.round(performance.now() - start);

    if (error) {
      findings.push({
        id: 'connectivity_error',
        severity: 'error',
        category: 'connectivity',
        title: 'Backend connectivity failed',
        detail: error.message,
      });
    } else {
      findings.push({
        id: 'connectivity_ok',
        severity: latency > 2000 ? 'warn' : 'info',
        category: 'connectivity',
        title: `Backend responsive (${latency}ms)`,
        detail: latency > 2000 ? 'High latency detected — investigate network or DB load.' : 'Within normal range.',
      });
    }
  } catch (err: any) {
    findings.push({
      id: 'connectivity_crash',
      severity: 'critical',
      category: 'connectivity',
      title: 'Backend unreachable',
      detail: err?.message ?? 'Connection failed',
    });
  }

  return findings;
}

// ── Main Runner ────────────────────────────────────────────────────────────

export async function runValidatorEngine(triggerSource: TriggerSource = 'manual'): Promise<MaintenanceRunResult> {
  const start = performance.now();
  const allFindings: MaintenanceFinding[] = [];
  let passResults: PassResult[] = [];

  // Run connectivity first (fast), then parallel the rest
  const connectivityFindings = await runConnectivityPass();
  allFindings.push(...connectivityFindings);

  // Run gate, substrate, and audit in parallel
  const [gateOutput, substrateFindings, auditFindings] = await Promise.all([
    runGatePass(),
    runSubstrateHealthPass(),
    runAuditPass(),
  ]);

  allFindings.push(...gateOutput.findings, ...substrateFindings, ...auditFindings);
  passResults = gateOutput.passResults;

  const durationMs = Math.round(performance.now() - start);
  const critical = allFindings.filter(f => f.severity === 'critical').length;
  const errors = allFindings.filter(f => f.severity === 'error').length;
  const warnings = allFindings.filter(f => f.severity === 'warn').length;
  const info = allFindings.filter(f => f.severity === 'info').length;

  return {
    engine: 'validator',
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
      autoFixed: 0,
      passed: critical === 0 && errors === 0,
    },
    passResults,
  };
}
