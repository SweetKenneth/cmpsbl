/**
 * Audit Check: System Manifest Integrity
 * Validates ENCODE system manifest has all Matrix Nodes registered
 */

import type { AuditFinding } from '../audit-types';
import { SYSTEM_MODULES, SYSTEM_ROUTES } from '@/lib/codeagent/encoded/system-manifest';
import { getNodeDefinitions } from '@/lib/core/matrixNodeRegistry';

const EXPECTED_NODE_COUNT = 37;

export function checkSystemManifest(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Check manifest entries
  const moduleKeys = Object.keys(SYSTEM_MODULES);
  const nodeCount = getNodeDefinitions().length;

  if (moduleKeys.length < 15) {
    findings.push({
      id: 'manifest_entries_count',
      category: 'matrix',
      severity: 'error',
      title: 'Manifest registry incomplete',
      detail: `Expected ≥15 manifest entries; found ${moduleKeys.length}.`,
      file: 'src/lib/codeagent/encoded/system-manifest.ts',
      hint: 'Add missing entries to SYSTEM_MODULES.',
    });
  } else {
    findings.push({
      id: 'manifest_entries_ok',
      category: 'matrix',
      severity: 'info',
      title: `${moduleKeys.length} manifest entries, ${nodeCount} Matrix Nodes`,
      detail: `Manifest registry complete: ${moduleKeys.join(', ')}.`,
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

  // Validate Matrix Node count against expected
  if (nodeCount !== EXPECTED_NODE_COUNT) {
    findings.push({
      id: 'manifest_node_count_mismatch',
      category: 'matrix',
      severity: nodeCount < EXPECTED_NODE_COUNT ? 'error' : 'warn',
      title: `Matrix Node count mismatch: ${nodeCount} vs expected ${EXPECTED_NODE_COUNT}`,
      detail: `Registry has ${nodeCount} nodes but expected ${EXPECTED_NODE_COUNT}. ${nodeCount < EXPECTED_NODE_COUNT ? 'Missing nodes.' : 'Extra nodes detected.'}`,
      hint: 'Update EXPECTED_NODE_COUNT or add missing node definitions.',
    });
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
