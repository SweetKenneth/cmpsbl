/**
 * GOAL — Integrity Validator
 * Cross-module consistency checks. Blocks DECODE from reporting inconsistent data.
 * vX.STRUCTURE.2
 */

import { getAllLiveMetrics, validateAll } from './metricsRegistry';
import { getLatestSnapshot } from './snapshotEngine';
import type { ModuleLiveMetrics } from './metricsSchema';

// ═══ Types ════════════════════════════════════════════════════════

export interface IntegrityReport {
  timestamp: string;
  valid: boolean;
  discrepancies: IntegrityDiscrepancy[];
  modulesChecked: number;
  crossChecksPassed: number;
  crossChecksFailed: number;
}

export interface IntegrityDiscrepancy {
  type: 'cross_module_mismatch' | 'snapshot_drift' | 'invalid_range' | 'stale_data';
  moduleA?: string;
  moduleB?: string;
  metricA?: string;
  metricB?: string;
  valueA?: number;
  valueB?: number;
  message: string;
}

// ═══ Validation ═══════════════════════════════════════════════════

const STALENESS_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Full integrity check across all registered modules.
 * Returns a report with any discrepancies found.
 */
export async function runIntegrityCheck(): Promise<IntegrityReport> {
  const discrepancies: IntegrityDiscrepancy[] = [];
  let crossChecksPassed = 0;
  let crossChecksFailed = 0;

  // 1. Validate all adapters
  const adapterIssues = await validateAll();
  for (const issue of adapterIssues) {
    discrepancies.push({
      type: 'invalid_range',
      moduleA: issue.moduleId,
      message: issue.issue,
    });
    crossChecksFailed++;
  }

  // 2. Pull live metrics
  const liveMetrics = await getAllLiveMetrics();
  const modulesChecked = liveMetrics.size;

  // 3. Check staleness
  const now = Date.now();
  for (const [moduleId, metrics] of liveMetrics) {
    const updated = Date.parse(metrics.lastUpdated);
    if (isNaN(updated) || now - updated > STALENESS_THRESHOLD_MS) {
      discrepancies.push({
        type: 'stale_data',
        moduleA: moduleId,
        message: `Module "${moduleId}" has stale data (last updated: ${metrics.lastUpdated})`,
      });
      crossChecksFailed++;
    } else {
      crossChecksPassed++;
    }
  }

  // 4. Snapshot drift check
  const latestSnapshot = getLatestSnapshot();
  if (latestSnapshot) {
    for (const [moduleId, liveM] of liveMetrics) {
      const snapM = latestSnapshot.modules[moduleId];
      if (!snapM) continue;

      const healthDrift = Math.abs(liveM.healthScore - snapM.healthScore);
      if (healthDrift > 20) {
        discrepancies.push({
          type: 'snapshot_drift',
          moduleA: moduleId,
          valueA: liveM.healthScore,
          valueB: snapM.healthScore,
          message: `Health score drift of ${healthDrift} detected for "${moduleId}" (live: ${liveM.healthScore}, snapshot: ${snapM.healthScore})`,
        });
        crossChecksFailed++;
      } else {
        crossChecksPassed++;
      }
    }
  }

  // 5. Negative counter detection
  for (const [moduleId, metrics] of liveMetrics) {
    for (const [key, val] of Object.entries(metrics.counters)) {
      if (val < 0) {
        discrepancies.push({
          type: 'invalid_range',
          moduleA: moduleId,
          metricA: key,
          valueA: val,
          message: `Counter "${key}" in "${moduleId}" has negative value: ${val}`,
        });
        crossChecksFailed++;
      }
    }
  }

  // 6. Cross-module consistency (same-named counters should not differ by > 10x)
  const moduleEntries = Array.from(liveMetrics.entries());
  for (let i = 0; i < moduleEntries.length; i++) {
    for (let j = i + 1; j < moduleEntries.length; j++) {
      const [idA, mA] = moduleEntries[i];
      const [idB, mB] = moduleEntries[j];

      const sharedKeys = Object.keys(mA.counters).filter(k => k in mB.counters);
      for (const key of sharedKeys) {
        const valA = mA.counters[key];
        const valB = mB.counters[key];
        if (valA > 0 && valB > 0) {
          const ratio = Math.max(valA, valB) / Math.min(valA, valB);
          if (ratio > 10) {
            discrepancies.push({
              type: 'cross_module_mismatch',
              moduleA: idA,
              moduleB: idB,
              metricA: key,
              metricB: key,
              valueA: valA,
              valueB: valB,
              message: `Counter "${key}" diverges ${ratio.toFixed(1)}x between "${idA}" (${valA}) and "${idB}" (${valB})`,
            });
            crossChecksFailed++;
          } else {
            crossChecksPassed++;
          }
        }
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    valid: discrepancies.length === 0,
    discrepancies,
    modulesChecked,
    crossChecksPassed,
    crossChecksFailed,
  };
}

/**
 * Check if DECODE should be blocked from reporting a specific module's data.
 * Uses cached integrity when available to avoid running a full check on every call.
 */
export async function shouldBlockDecodeForModule(moduleId: string): Promise<{
  blocked: boolean;
  reason?: string;
}> {
  // Attempt to use cached report first (imported lazily to avoid circular deps)
  let report: IntegrityReport;
  try {
    const { getCachedIntegrity } = await import('../../core/decode/integrityCache');
    const cached = getCachedIntegrity();
    report = cached ?? await runIntegrityCheck();
  } catch {
    report = await runIntegrityCheck();
  }

  const moduleIssues = report.discrepancies.filter(
    d => d.moduleA === moduleId || d.moduleB === moduleId
  );

  if (moduleIssues.length > 0) {
    return {
      blocked: true,
      reason: moduleIssues.map(d => d.message).join('; '),
    };
  }

  return { blocked: false };
}
