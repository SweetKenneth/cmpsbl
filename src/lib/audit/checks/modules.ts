/**
 * Audit Check: Matrix Node Health
 * Validates Matrix Node health reporting & weighted integrity
 */

import type { AuditFinding } from '../audit-types';
import { SYSTEM_MODULES } from '@/lib/codeagent/encoded/system-manifest';
import { getNodeDefinitions, getTotalWeight, buildMatrixNodes, calculateIntegrity } from '@/lib/core/matrixNodeRegistry';

export function checkModuleHealth(): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Legacy dependency graph check (still uses SYSTEM_MODULES internally)
  for (const [key, mod] of Object.entries(SYSTEM_MODULES)) {
    for (const dep of mod.dependencies) {
      if (!SYSTEM_MODULES[dep]) {
        findings.push({
          id: `node_dep_missing_${key}_${dep}`,
          category: 'matrix',
          severity: 'error',
          title: `Matrix Node "${key}" depends on unknown "${dep}"`,
          detail: `${mod.name} lists "${dep}" as a dependency but it doesn't exist in the registry.`,
          file: 'src/lib/codeagent/encoded/system-manifest.ts',
        });
      }
    }
  }

  // Matrix Node weight validation
  const totalWeight = getTotalWeight();
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    findings.push({
      id: 'matrix_weight_invalid',
      category: 'matrix',
      severity: 'fatal',
      title: `Matrix Node weight sum invalid: ${totalWeight}`,
      detail: `Σ(node.weight) = ${totalWeight}, expected 1.0. Integrity calculations will be incorrect.`,
      hint: 'Adjust weights in matrixNodeRegistry.ts to sum to 1.0.',
    });
  } else {
    findings.push({
      id: 'matrix_weight_ok',
      category: 'matrix',
      severity: 'info',
      title: `Matrix Node weight sum valid: ${totalWeight}`,
      detail: `Σ(node.weight) = ${totalWeight} — integrity equation calibrated.`,
    });
  }

  // Matrix Node count
  const nodeDefs = getNodeDefinitions();
  const sectorCounts = new Map<string, number>();
  for (const n of nodeDefs) {
    sectorCounts.set(n.sector, (sectorCounts.get(n.sector) || 0) + 1);
  }
  const sectorBreakdown = Array.from(sectorCounts.entries())
    .map(([s, c]) => `${s.toUpperCase()}(${c})`)
    .join(' + ');
  findings.push({
    id: 'matrix_node_count',
    category: 'matrix',
    severity: 'info',
    title: `${nodeDefs.length} Matrix Nodes registered`,
    detail: `${sectorCounts.size} sectors × ${nodeDefs.length} nodes: ${sectorBreakdown}.`,
  });

  // Integrity snapshot
  const healthData: Record<string, number> = {};
  nodeDefs.forEach(n => { healthData[n.id] = 100; }); // baseline
  const nodes = buildMatrixNodes(healthData);
  const report = calculateIntegrity(nodes);

  if (report.isCritical) {
    findings.push({
      id: 'matrix_critical',
      category: 'matrix',
      severity: 'fatal',
      title: 'Matrix integrity CRITICAL',
      detail: `Operational: ${report.operational}%, Structural: ${report.structural}%. Status: ${report.status}.`,
    });
  }

  return findings;
}
