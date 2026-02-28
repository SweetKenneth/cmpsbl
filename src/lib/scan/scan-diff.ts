/**
 * Scan Diffing Engine
 * Compares two scan results to surface new, resolved, and persistent findings.
 * Essential for subscribers to track improvement over time.
 */

export interface DiffableFinding {
  id: string;
  category: string;
  severity: string;
  title: string;
  detail: string;
}

export interface ScanDiff {
  newFindings: DiffableFinding[];
  resolvedFindings: DiffableFinding[];
  persistentFindings: DiffableFinding[];
  regressions: DiffableFinding[]; // severity worsened
  improvements: DiffableFinding[]; // severity improved
  summary: {
    added: number;
    resolved: number;
    persistent: number;
    regressions: number;
    improvements: number;
    netChange: number;
  };
}

const SEVERITY_RANK: Record<string, number> = {
  info: 0,
  warn: 1,
  error: 2,
  fatal: 3,
};

function findingKey(f: DiffableFinding): string {
  return `${f.category}:${f.title}`;
}

export function diffScans(
  previous: DiffableFinding[],
  current: DiffableFinding[],
): ScanDiff {
  const prevMap = new Map<string, DiffableFinding>();
  const currMap = new Map<string, DiffableFinding>();

  for (const f of previous) prevMap.set(findingKey(f), f);
  for (const f of current) currMap.set(findingKey(f), f);

  const newFindings: DiffableFinding[] = [];
  const resolvedFindings: DiffableFinding[] = [];
  const persistentFindings: DiffableFinding[] = [];
  const regressions: DiffableFinding[] = [];
  const improvements: DiffableFinding[] = [];

  // Current findings: new or persistent
  for (const [key, curr] of currMap) {
    const prev = prevMap.get(key);
    if (!prev) {
      newFindings.push(curr);
    } else {
      persistentFindings.push(curr);
      const prevRank = SEVERITY_RANK[prev.severity] ?? 0;
      const currRank = SEVERITY_RANK[curr.severity] ?? 0;
      if (currRank > prevRank) {
        regressions.push(curr);
      } else if (currRank < prevRank) {
        improvements.push(curr);
      }
    }
  }

  // Previous findings not in current = resolved
  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) {
      resolvedFindings.push(prev);
    }
  }

  return {
    newFindings,
    resolvedFindings,
    persistentFindings,
    regressions,
    improvements,
    summary: {
      added: newFindings.length,
      resolved: resolvedFindings.length,
      persistent: persistentFindings.length,
      regressions: regressions.length,
      improvements: improvements.length,
      netChange: newFindings.length - resolvedFindings.length,
    },
  };
}
