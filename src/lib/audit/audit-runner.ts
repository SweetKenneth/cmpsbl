/**
 * Audit Runner
 * Orchestrates all audit checks and produces a unified report
 */

import type { AuditReport, AuditFinding } from './audit-types';
import { getMetric } from '@/stores/publicMetricsStore';
import { checkSystemManifest } from './checks/system-manifest';
import { checkRouteRegistry } from './checks/routes';
import { checkTerminalRegistry } from './checks/terminal';
import { checkModuleHealth } from './checks/modules';
import { checkSEO } from './checks/seo';
import { checkUIContracts } from './checks/ui-contracts';
import { checkHooksContracts } from './checks/hooks-contracts';
import { checkBrandingContracts } from './checks/branding-contracts';
import { checkSupabaseContracts } from './checks/supabase-contracts';

function uid(): string {
  return `audit_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export async function runFullAudit(opts?: { version?: string }): Promise<AuditReport> {
  const start = performance.now();
  const findings: AuditFinding[] = [];

  // Synchronous checks — wrapped in try/catch to prevent single check from crashing audit
  const syncChecks = [
    { name: 'system-manifest', fn: checkSystemManifest },
    { name: 'routes', fn: checkRouteRegistry },
    { name: 'terminal', fn: checkTerminalRegistry },
    { name: 'modules', fn: checkModuleHealth },
    { name: 'hooks', fn: checkHooksContracts },
    { name: 'ui', fn: checkUIContracts },
    { name: 'seo', fn: checkSEO },
    { name: 'branding', fn: checkBrandingContracts },
  ];

  for (const check of syncChecks) {
    try {
      findings.push(...check.fn());
    } catch (err: any) {
      findings.push({
        id: `audit_check_crash_${check.name}`,
        category: 'runtime',
        severity: 'error',
        title: `Audit check "${check.name}" crashed`,
        detail: err?.message || 'Unknown error during audit check execution',
        hint: 'This check threw an exception. Fix the underlying issue and re-run.',
      });
    }
  }

  // Async checks
  try {
    findings.push(...await checkSupabaseContracts());
  } catch (err: any) {
    findings.push({
      id: 'audit_check_crash_supabase',
      category: 'supabase',
      severity: 'error',
      title: 'Backend connectivity check crashed',
      detail: err?.message || 'Unknown error during backend check',
    });
  }

  const duration_ms = Math.round(performance.now() - start);

  const fatal = findings.filter(f => f.severity === 'fatal').length;
  const error = findings.filter(f => f.severity === 'error').length;
  const warn = findings.filter(f => f.severity === 'warn').length;
  const info = findings.filter(f => f.severity === 'info').length;

  return {
    run_id: uid(),
    version: opts?.version ?? getMetric('epoch'),
    created_at: new Date().toISOString(),
    duration_ms,
    summary: {
      fatal,
      error,
      warn,
      info,
      total: findings.length,
      passed: fatal === 0 && error === 0,
    },
    findings,
  };
}
