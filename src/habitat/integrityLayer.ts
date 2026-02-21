/**
 * Clockless Habitat — Integrity Layer
 * vX.UI.ULTIMATE
 *
 * Wraps GOAL integrity checks for habitat consumption.
 * Provides visual integrity indicator state.
 */

import { runIntegrityCheck, type IntegrityReport } from '@/core/metrics/integrityValidator';

// ═══ Types ═════════════════════════════════════════════════════════

export type IntegrityState = 'VALID' | 'MISMATCH' | 'UNKNOWN';

export interface HabitatIntegrity {
  state: IntegrityState;
  modulesChecked: number;
  discrepancyCount: number;
  lastCheck: string | null;
  driftPercent: number;
  report: IntegrityReport | null;
}

// ═══ State ═════════════════════════════════════════════════════════

let lastReport: IntegrityReport | null = null;
let lastCheckTime: string | null = null;

// ═══ Public API ════════════════════════════════════════════════════

export async function checkHabitatIntegrity(): Promise<HabitatIntegrity> {
  try {
    const report = await runIntegrityCheck();
    lastReport = report;
    lastCheckTime = new Date().toISOString();

    // Compute drift % from snapshot_drift discrepancies
    const driftDiscrepancies = report.discrepancies.filter(d => d.type === 'snapshot_drift');
    let driftPercent = 0;
    if (driftDiscrepancies.length > 0) {
      const drifts = driftDiscrepancies.map(d => {
        if (d.valueA != null && d.valueB != null && d.valueB !== 0) {
          return Math.abs((d.valueA - d.valueB) / d.valueB) * 100;
        }
        return 0;
      });
      driftPercent = Math.round(drifts.reduce((a, b) => a + b, 0) / drifts.length * 10) / 10;
    }

    return {
      state: report.valid ? 'VALID' : 'MISMATCH',
      modulesChecked: report.modulesChecked,
      discrepancyCount: report.discrepancies.length,
      lastCheck: lastCheckTime,
      driftPercent,
      report,
    };
  } catch {
    return {
      state: 'UNKNOWN',
      modulesChecked: 0,
      discrepancyCount: 0,
      lastCheck: lastCheckTime,
      driftPercent: 0,
      report: null,
    };
  }
}

export function getLastIntegrity(): HabitatIntegrity {
  if (!lastReport) {
    return {
      state: 'UNKNOWN',
      modulesChecked: 0,
      discrepancyCount: 0,
      lastCheck: null,
      driftPercent: 0,
      report: null,
    };
  }
  return {
    state: lastReport.valid ? 'VALID' : 'MISMATCH',
    modulesChecked: lastReport.modulesChecked,
    discrepancyCount: lastReport.discrepancies.length,
    lastCheck: lastCheckTime,
    driftPercent: 0,
    report: lastReport,
  };
}
