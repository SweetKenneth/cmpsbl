/**
 * Audit Runner — v11.1 SPARTA Epoch
 * Orchestrates all audit checks and produces a unified report
 */

import type { AuditReport, AuditFinding } from './audit-types';
import { checkSystemManifest } from './checks/system-manifest';
import { checkRouteRegistry } from './checks/routes';
import { checkTerminalRegistry } from './checks/terminal';
import { checkModuleHealth } from './checks/modules';
import { checkSEO } from './checks/seo';
import { checkUIContracts } from './checks/ui-contracts';
import { checkHooksContracts } from './checks/hooks-contracts';
import { checkSupabaseContracts } from './checks/supabase-contracts';

function uid(): string {
  return `audit_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export async function runFullAudit(opts?: { version?: string }): Promise<AuditReport> {
  const start = performance.now();
  const findings: AuditFinding[] = [];

  // Synchronous checks
  findings.push(...checkSystemManifest());
  findings.push(...checkRouteRegistry());
  findings.push(...checkTerminalRegistry());
  findings.push(...checkModuleHealth());
  findings.push(...checkHooksContracts());
  findings.push(...checkUIContracts());
  findings.push(...checkSEO());

  // Async checks
  findings.push(...await checkSupabaseContracts());

  const duration_ms = Math.round(performance.now() - start);

  const fatal = findings.filter(f => f.severity === 'fatal').length;
  const error = findings.filter(f => f.severity === 'error').length;
  const warn = findings.filter(f => f.severity === 'warn').length;
  const info = findings.filter(f => f.severity === 'info').length;

  return {
    run_id: uid(),
    version: opts?.version ?? '11.1.0',
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
