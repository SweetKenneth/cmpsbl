/**
 * S-Tier 060 — Temporal Regression Sandbox
 * CJPI: 93 | Node: ECHO | ID: S-ECH02
 *
 * Allows replaying historical state snapshots to identify
 * when a regression was introduced. Binary-search through time.
 */

export interface StateSnapshot {
  id: string;
  timestamp: number;
  state: Record<string, unknown>;
  label?: string;
}

export interface RegressionResult {
  found: boolean;
  introducedAt: StateSnapshot | null;
  lastGood: StateSnapshot | null;
  stepsChecked: number;
  totalSnapshots: number;
}

export function binarySearchRegression(
  snapshots: StateSnapshot[],
  testFn: (state: Record<string, unknown>) => boolean // returns true if "good"
): RegressionResult {
  const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
  if (sorted.length === 0) {
    return { found: false, introducedAt: null, lastGood: null, stepsChecked: 0, totalSnapshots: 0 };
  }

  let lo = 0;
  let hi = sorted.length - 1;
  let steps = 0;
  let lastGoodIdx = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps++;
    if (testFn(sorted[mid].state)) {
      lastGoodIdx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const introducedIdx = lastGoodIdx + 1;
  return {
    found: introducedIdx < sorted.length && lastGoodIdx >= 0,
    introducedAt: introducedIdx < sorted.length ? sorted[introducedIdx] : null,
    lastGood: lastGoodIdx >= 0 ? sorted[lastGoodIdx] : null,
    stepsChecked: steps,
    totalSnapshots: sorted.length,
  };
}
