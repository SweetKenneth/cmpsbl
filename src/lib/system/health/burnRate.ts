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

/** Compute burn rate for a module across all windows (single-pass) */
export function computeBurnRates(
  module: string,
  totalBudget: number,       // total allowed errors in the SLO window
  sloWindowHours: number      // e.g. 720 hours (30 days)
): BurnRateSpec {
  const now = Date.now();
  const sortedWindows = [...BURN_RATE_WINDOWS_MINUTES].sort((a, b) => a - b);
  const cutoffs = sortedWindows.map(w => now - w * 60_000);
  const counts = new Array(sortedWindows.length).fill(0);

  // Single pass: for each event, increment all windows it falls within
  for (let i = errorLog.length - 1; i >= 0; i--) {
    const e = errorLog[i];
    if (e.module !== module) continue;
    if (e.timestamp < cutoffs[cutoffs.length - 1]) break; // older than largest window
    for (let w = 0; w < cutoffs.length; w++) {
      if (e.timestamp >= cutoffs[w]) { counts[w]++; break; }
    }
  }
  // Accumulate: each larger window includes all smaller windows
  for (let w = 1; w < counts.length; w++) counts[w] += counts[w - 1];

  const windows: BurnRateWindow[] = [];
  for (let w = 0; w < sortedWindows.length; w++) {
    const windowMin = sortedWindows[w];
    const errorsInWindow = counts[w];

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
