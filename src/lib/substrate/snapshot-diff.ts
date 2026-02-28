/**
 * Snapshot Diff — Compare two substrate snapshots and produce a delta
 * Used by evolution pipeline to measure impact of changes
 */

type SnapshotData = Record<string, number | string | boolean | null>;

export interface DiffEntry {
  key: string;
  before: number | string | boolean | null;
  after: number | string | boolean | null;
  delta?: number;
  percentChange?: number;
  direction: 'improved' | 'degraded' | 'unchanged' | 'new' | 'removed';
}

export interface DiffReport {
  timestamp: number;
  totalKeys: number;
  changed: number;
  improved: number;
  degraded: number;
  entries: DiffEntry[];
  netScore: number; // positive = improvement
}

export function diffSnapshots(before: SnapshotData, after: SnapshotData): DiffReport {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const entries: DiffEntry[] = [];
  let improved = 0;
  let degraded = 0;
  let netScore = 0;

  for (const key of allKeys) {
    const bVal = before[key] ?? null;
    const aVal = after[key] ?? null;

    if (bVal === null && aVal !== null) {
      entries.push({ key, before: null, after: aVal, direction: 'new' });
      continue;
    }
    if (bVal !== null && aVal === null) {
      entries.push({ key, before: bVal, after: null, direction: 'removed' });
      continue;
    }

    if (typeof bVal === 'number' && typeof aVal === 'number') {
      const delta = aVal - bVal;
      const pct = bVal !== 0 ? (delta / Math.abs(bVal)) * 100 : 0;
      const isScore = key.includes('score') || key.includes('health') || key.includes('availability');
      const isError = key.includes('error') || key.includes('failure') || key.includes('latency');

      let direction: DiffEntry['direction'] = 'unchanged';
      if (Math.abs(delta) > 0.001) {
        if (isScore) direction = delta > 0 ? 'improved' : 'degraded';
        else if (isError) direction = delta < 0 ? 'improved' : 'degraded';
        else direction = delta > 0 ? 'improved' : 'degraded';
      }

      if (direction === 'improved') { improved++; netScore += Math.abs(pct); }
      if (direction === 'degraded') { degraded++; netScore -= Math.abs(pct); }

      entries.push({ key, before: bVal, after: aVal, delta, percentChange: Math.round(pct * 100) / 100, direction });
    } else if (bVal !== aVal) {
      entries.push({ key, before: bVal, after: aVal, direction: 'unchanged' });
    }
  }

  return {
    timestamp: Date.now(),
    totalKeys: allKeys.size,
    changed: entries.filter(e => e.direction !== 'unchanged').length,
    improved,
    degraded,
    entries,
    netScore: Math.round(netScore * 100) / 100,
  };
}

/** Quick summary for logging */
export function summarizeDiff(report: DiffReport): string {
  return `Δ ${report.changed}/${report.totalKeys} keys | +${report.improved} improved | -${report.degraded} degraded | net=${report.netScore > 0 ? '+' : ''}${report.netScore}`;
}
