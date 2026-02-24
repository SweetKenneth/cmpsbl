/**
 * Audit Check: System Manifest Integrity
 * Validates ENCODE system manifest has all execution surfaces registered
 */

import type { AuditFinding } from '../audit-types';
import { SYSTEM_MODULES, SYSTEM_ROUTES } from '@/lib/codeagent/encoded/system-manifest';

const EXPECTED_MODULE_COUNT = 15;

export function checkSystemManifest(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check modules count
  const moduleKeys = Object.keys(SYSTEM_MODULES);
  if (moduleKeys.length < EXPECTED_MODULE_COUNT) {
    findings.push({
      id: 'manifest_modules_count',
      category: 'modules',
      severity: 'error',
      title: 'Module registry incomplete',
      detail: `Expected ${EXPECTED_MODULE_COUNT} modules; found ${moduleKeys.length}. Missing: ${EXPECTED_MODULE_COUNT - moduleKeys.length}.`,
      file: 'src/lib/codeagent/encoded/system-manifest.ts',
      hint: 'Add missing module entries to SYSTEM_MODULES.',
    });
  } else {
    findings.push({
      id: 'manifest_modules_ok',
      category: 'modules',
      severity: 'info',
      title: `All ${moduleKeys.length} modules registered`,
      detail: `Module registry complete: ${moduleKeys.join(', ')}.`,
    });
  }

  // Check each module has required fields
  for (const [key, mod] of Object.entries(SYSTEM_MODULES)) {
    if (!mod.corePath) {
      findings.push({
        id: `manifest_no_corepath_${key}`,
        category: 'modules',
        severity: 'warn',
        title: `Module "${key}" missing corePath`,
        detail: `Module ${mod.name} has no corePath defined.`,
        file: 'src/lib/codeagent/encoded/system-manifest.ts',
      });
    }
  }

  // Check routes
  if (!SYSTEM_ROUTES || Object.keys(SYSTEM_ROUTES).length === 0) {
    findings.push({
      id: 'manifest_routes_empty',
      category: 'routes',
      severity: 'warn',
      title: 'System routes registry empty',
      detail: 'SYSTEM_ROUTES is empty or undefined in the manifest.',
    });
  } else {
    findings.push({
      id: 'manifest_routes_ok',
      category: 'routes',
      severity: 'info',
      title: `${Object.keys(SYSTEM_ROUTES).length} routes registered`,
      detail: 'Route registry is populated.',
    });
  }

  return findings;
}
