/**
 * Audit Check: Module Health Surface
 * Validates module health reporting consistency
 */

import type { AuditFinding } from '../audit-types';
import { SYSTEM_MODULES } from '@/lib/codeagent/encoded/system-manifest';

export function checkModuleHealth(): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const moduleCount = Object.keys(SYSTEM_MODULES).length;

  // Check dependency graph consistency
  for (const [key, mod] of Object.entries(SYSTEM_MODULES)) {
    for (const dep of mod.dependencies) {
      if (!SYSTEM_MODULES[dep]) {
        findings.push({
          id: `module_dep_missing_${key}_${dep}`,
          category: 'modules',
          severity: 'error',
          title: `Module "${key}" depends on unknown "${dep}"`,
          detail: `${mod.name} lists "${dep}" as a dependency but it doesn't exist in SYSTEM_MODULES.`,
          file: 'src/lib/codeagent/encoded/system-manifest.ts',
        });
      }
    }
  }

  // Check for orphaned modules (no dependents and no dependencies)
  const isolated = Object.entries(SYSTEM_MODULES).filter(
    ([_, mod]) => mod.dependencies.length === 0 && mod.dependents.length === 0
  );
  if (isolated.length > 0) {
    findings.push({
      id: 'module_isolated',
      category: 'modules',
      severity: 'warn',
      title: `${isolated.length} isolated module(s)`,
      detail: `Modules with no dependencies or dependents: ${isolated.map(([k]) => k).join(', ')}.`,
      hint: 'These may be intentionally standalone or missing wiring.',
    });
  }

  findings.push({
    id: 'module_health_surface',
    category: 'modules',
    severity: 'info',
    title: `Module health: ${moduleCount}/16`,
    detail: `${moduleCount} modules registered. Dependency graph validated.`,
  });

  return findings;
}
