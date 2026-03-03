/**
 * Audit Runner — Optimized
 * Orchestrates all audit checks with parallel execution and timing per check
 */

import type { AuditReport, AuditFinding } from './audit-types';
import { getMetric } from '@/stores/publicMetricsStore';
import { checkSystemManifest } from './checks/system-manifest';
import { checkRouteRegistry } from './checks/routes';
import { checkTerminalRegistry } from './checks/terminal';
import { isTerminalPresent } from '@/lib/terminal/detect';
import { checkModuleHealth } from './checks/modules';
import { checkSEO } from './checks/seo';
import { checkUIContracts } from './checks/ui-contracts';
import { checkHooksContracts } from './checks/hooks-contracts';
import { checkBrandingContracts } from './checks/branding-contracts';
import { checkProviderBranding } from './checks/provider-branding';
import { checkSupabaseContracts } from './checks/supabase-contracts';
import { checkMemoryBounds } from './checks/memory-bounds';

function uid(): string {
  return `audit_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

/** Run a sync check safely, returning findings + duration */
function runSyncCheck(name: string, fn: () => AuditFinding[]): AuditFinding[] {
  try {
    return fn();
  } catch (err: any) {
    return [{
      id: `audit_check_crash_${name}`,
      category: 'runtime',
      severity: 'error',
      title: `Audit check "${name}" crashed`,
      detail: err?.message || 'Unknown error during audit check execution',
      hint: 'This check threw an exception. Fix the underlying issue and re-run.',
    }];
  }
}

export async function runFullAudit(opts?: { version?: string }): Promise<AuditReport> {
  const start = performance.now();

  // Phase 1: Fire off the async backend check immediately (network-bound)
  // No artificial timeout — thoroughness over speed
  const supabasePromise = checkSupabaseContracts()
    .catch((err): AuditFinding[] => [{
      id: 'audit_check_crash_supabase',
      category: 'supabase',
      severity: 'warn',
      title: 'Backend connectivity check incomplete',
      detail: err?.message || 'Unknown error during backend check',
    }]);

  // Phase 2: Run sync checks — grouped by cost
  // Fast checks (no DOM queries or minimal) run first
  const fastChecks: AuditFinding[] = [
    ...runSyncCheck('system-manifest', checkSystemManifest),
    ...runSyncCheck('routes', checkRouteRegistry),
    ...runSyncCheck('modules', checkModuleHealth),
    ...runSyncCheck('hooks', checkHooksContracts),
    ...runSyncCheck('branding', checkBrandingContracts),
    ...runSyncCheck('provider-branding', checkProviderBranding),
    ...runSyncCheck('memory-bounds', checkMemoryBounds),
  ];

  // Terminal check only if detected
  if (isTerminalPresent()) {
    fastChecks.push(...runSyncCheck('terminal', checkTerminalRegistry));
  }

  // Yield to event loop before heavy DOM scans
  await new Promise(resolve => setTimeout(resolve, 0));

  // Heavy DOM checks (getComputedStyle, querySelectorAll)
  const domChecks: AuditFinding[] = [
    ...runSyncCheck('ui', checkUIContracts),
    ...runSyncCheck('seo', checkSEO),
  ];

  // Phase 3: Await backend results (should already be resolved by now)
  const supabaseFindings = await supabasePromise;

  const findings = [...fastChecks, ...domChecks, ...supabaseFindings];

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
