/**
 * Burn Rate Tracker — Multi-window error budget burn rate
 */

import type { BurnRateWindow, BurnRateSpec } from './types';
import { BURN_RATE_WINDOWS_MINUTES } from './types';

interface ErrorEvent {
  timestamp: number;
  module: string;
}

const errorLog: ErrorEvent[] = [];
const MAX_ERROR_LOG = 10000;

/** Record an error event for burn rate tracking */
export function recordError(module: string): void {
  errorLog.push({ timestamp: Date.now(), module });
  if (errorLog.length > MAX_ERROR_LOG) errorLog.splice(0, errorLog.length - MAX_ERROR_LOG);
}

/** Compute burn rate for a module across all windows */
export function computeBurnRates(
  module: string,
  totalBudget: number,       // total allowed errors in the SLO window
  sloWindowHours: number      // e.g. 720 hours (30 days)
): BurnRateSpec {
  const now = Date.now();
  const windows: BurnRateWindow[] = [];

  for (const windowMin of BURN_RATE_WINDOWS_MINUTES) {
    const cutoff = now - windowMin * 60_000;
    const errorsInWindow = errorLog.filter(e => e.module === module && e.timestamp >= cutoff).length;

    // What fraction of the SLO window does this window represent?
    const windowFraction = (windowMin / 60) / sloWindowHours;
    const expectedBudgetInWindow = totalBudget * windowFraction;

    const burn_rate = expectedBudgetInWindow > 0 ? errorsInWindow / expectedBudgetInWindow : 0;
    const budget_remaining = Math.max(0, 1 - (errorsInWindow / Math.max(totalBudget, 1)));

    windows.push({ window_minutes: windowMin, burn_rate, budget_remaining });
  }

  return {
    module,
    windows,
    computed_at: new Date().toISOString(),
  };
}

/** Check if burn rate is elevated (>1x in any window means burning faster than budget allows) */
export function isBurnElevated(burnRates: BurnRateSpec): boolean {
  return burnRates.windows.some(w => w.burn_rate > 1.0);
}

/** Clear error log (for testing) */
export function clearErrors(): void {
  errorLog.length = 0;
}
