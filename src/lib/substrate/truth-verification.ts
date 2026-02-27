/**
 * Truth Verification — Automated Parity Checks
 * Terminal Audit Pass
 *
 * Ensures Terminal, Dashboard, and Central Health Registry are in sync.
 * Detects and reports integrity violations.
 */

import {
  getAllRegistryEntries,
  checkRegistryIntegrity,
  type HealthRegistryEntry,
} from './health-registry';
import { getAllSubsystemHealth, type SubsystemHealthEntry } from './subsystem-health';
import { emit } from './events';

// ═══ Types ═══════════════════════════════════════════════════════

export interface ParityCheckResult {
  timestamp: string;
  passed: boolean;
  totalChecks: number;
  failedChecks: number;
  mismatches: ParityMismatch[];
  warnings: string[];
}

export interface ParityMismatch {
  source: 'dashboard' | 'terminal' | 'subsystem';
  moduleId: string;
  registryScore: number;
  reportedScore: number;
  delta: number;
  severity: 'low' | 'medium' | 'high';
}

// ═══ Parity Check Engine ═════════════════════════════════════════

/**
 * Run full parity check between CHR, dashboard scores, and subsystem health
 */
export function runParityCheck(
  dashboardScores: Record<string, number>
): ParityCheckResult {
  const mismatches: ParityMismatch[] = [];
  const warnings: string[] = [];

  // 1. Check dashboard vs CHR
  const registryMismatches = checkRegistryIntegrity(dashboardScores);
  for (const m of registryMismatches) {
    const delta = Math.abs(m.registry_score - m.dashboard_score);
    mismatches.push({
      source: 'dashboard',
      moduleId: m.module_id,
      registryScore: m.registry_score,
      reportedScore: m.dashboard_score,
      delta,
      severity: delta > 20 ? 'high' : delta > 10 ? 'medium' : 'low',
    });
  }

  // 2. Check subsystem health vs CHR
  const subsystems = getAllSubsystemHealth();
  const registryEntries = getAllRegistryEntries();
  const registryMap = new Map(registryEntries.map(e => [e.module_id, e]));

  for (const sub of subsystems) {
    const chrEntry = registryMap.get(`subsys:${sub.id}`);
    if (chrEntry) {
      const delta = Math.abs(chrEntry.score - sub.score);
      if (delta > 5) {
        mismatches.push({
          source: 'subsystem',
          moduleId: `subsys:${sub.id}`,
          registryScore: chrEntry.score,
          reportedScore: sub.score,
          delta,
          severity: delta > 20 ? 'high' : delta > 10 ? 'medium' : 'low',
        });
      }
    }
  }

  // 3. Structural warnings
  const allEntries = getAllRegistryEntries();
  const staleThreshold = 10 * 60 * 1000; // 10 minutes
  const now = Date.now();
  for (const entry of allEntries) {
    const age = now - new Date(entry.timestamp).getTime();
    if (age > staleThreshold && entry.status !== 'healthy') {
      warnings.push(`${entry.module_id}: degraded state stale for ${Math.round(age / 60000)}m — may need manual review`);
    }
  }

  // 4. Check for unregistered modules showing in dashboard
  for (const moduleId of Object.keys(dashboardScores)) {
    if (!registryMap.has(moduleId)) {
      warnings.push(`${moduleId}: present in dashboard but not registered in CHR`);
    }
  }

  const passed = mismatches.length === 0;
  const result: ParityCheckResult = {
    timestamp: new Date().toISOString(),
    passed,
    totalChecks: Object.keys(dashboardScores).length + subsystems.length,
    failedChecks: mismatches.length,
    mismatches,
    warnings,
  };

  // Emit integrity event
  emit({
    module: 'system',
    event_type: 'parity_check',
    outcome: passed ? 'succeeded' : 'failed',
    data: {
      totalChecks: result.totalChecks,
      failedChecks: result.failedChecks,
      highSeverity: mismatches.filter(m => m.severity === 'high').length,
      warnings: warnings.length,
    },
  });

  return result;
}

/**
 * Quick health-only parity check (no dashboard scores needed)
 */
export function quickParityCheck(): {
  registryEntryCount: number;
  subsystemCount: number;
  unhealthyModules: string[];
  staleEntries: string[];
} {
  const entries = getAllRegistryEntries();
  const subsystems = getAllSubsystemHealth();
  const now = Date.now();
  const staleThreshold = 10 * 60 * 1000;

  return {
    registryEntryCount: entries.length,
    subsystemCount: subsystems.length,
    unhealthyModules: entries
      .filter(e => e.status !== 'healthy' && e.status !== 'shadow_event')
      .map(e => e.module_id),
    staleEntries: entries
      .filter(e => now - new Date(e.timestamp).getTime() > staleThreshold)
      .map(e => e.module_id),
  };
}
