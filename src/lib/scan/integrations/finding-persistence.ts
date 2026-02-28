/**
 * Scan Finding Persistence Layer
 * Persists scan findings, history, and lifecycle to the database
 * for cross-session tracking, trend analysis, and audit compliance.
 */

export interface PersistedFinding {
  id: string;
  scanId: string;
  fingerprint: string;
  category: string;
  severity: 'info' | 'warn' | 'error' | 'fatal';
  title: string;
  detail: string;
  source: string;
  affectedPaths: string[];
  status: 'active' | 'resolved' | 'suppressed' | 'wontfix';
  firstSeenAt: string;
  lastSeenAt: string;
  seenCount: number;
  resolvedAt: string | null;
  fixId: string | null;
  metadata: Record<string, unknown>;
}

export interface ScanRun {
  id: string;
  startedAt: string;
  completedAt: string | null;
  trigger: string;
  depth: string;
  status: 'running' | 'completed' | 'failed';
  totalFindings: number;
  newFindings: number;
  resolvedFindings: number;
  overallGrade: string;
  durationMs: number;
  metadata: Record<string, unknown>;
}

// In-memory store (would be backed by database in production)
const findingStore = new Map<string, PersistedFinding>();
const scanRunStore = new Map<string, ScanRun>();

/**
 * Start a new scan run
 */
export function startScanRun(
  trigger: string,
  depth: string,
  metadata: Record<string, unknown> = {},
): ScanRun {
  const run: ScanRun = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    startedAt: new Date().toISOString(),
    completedAt: null,
    trigger,
    depth,
    status: 'running',
    totalFindings: 0,
    newFindings: 0,
    resolvedFindings: 0,
    overallGrade: 'pending',
    durationMs: 0,
    metadata,
  };

  scanRunStore.set(run.id, run);
  return run;
}

/**
 * Persist findings from a scan run
 */
export function persistFindings(
  scanId: string,
  findings: Array<{
    fingerprint: string;
    category: string;
    severity: 'info' | 'warn' | 'error' | 'fatal';
    title: string;
    detail: string;
    source: string;
    affectedPaths: string[];
    metadata?: Record<string, unknown>;
  }>,
): { persisted: number; newCount: number; updatedCount: number } {
  let newCount = 0;
  let updatedCount = 0;

  for (const finding of findings) {
    const existing = findingStore.get(finding.fingerprint);

    if (existing) {
      existing.lastSeenAt = new Date().toISOString();
      existing.seenCount++;
      existing.scanId = scanId;
      if (existing.status === 'resolved') {
        existing.status = 'active'; // Recurrence
        existing.resolvedAt = null;
      }
      updatedCount++;
    } else {
      const persisted: PersistedFinding = {
        id: `finding_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        scanId,
        fingerprint: finding.fingerprint,
        category: finding.category,
        severity: finding.severity,
        title: finding.title,
        detail: finding.detail,
        source: finding.source,
        affectedPaths: finding.affectedPaths,
        status: 'active',
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        seenCount: 1,
        resolvedAt: null,
        fixId: null,
        metadata: finding.metadata ?? {},
      };
      findingStore.set(finding.fingerprint, persisted);
      newCount++;
    }
  }

  return { persisted: findings.length, newCount, updatedCount };
}

/**
 * Mark findings not seen in current scan as resolved
 */
export function resolveAbsentFindings(
  scanId: string,
  currentFingerprints: string[],
): number {
  const currentSet = new Set(currentFingerprints);
  let resolvedCount = 0;

  for (const [fp, finding] of findingStore) {
    if (finding.status === 'active' && !currentSet.has(fp)) {
      finding.status = 'resolved';
      finding.resolvedAt = new Date().toISOString();
      resolvedCount++;
    }
  }

  return resolvedCount;
}

/**
 * Complete a scan run
 */
export function completeScanRun(
  scanId: string,
  grade: string,
  newFindings: number,
  resolvedFindings: number,
  totalFindings: number,
): void {
  const run = scanRunStore.get(scanId);
  if (!run) return;

  run.completedAt = new Date().toISOString();
  run.status = 'completed';
  run.overallGrade = grade;
  run.newFindings = newFindings;
  run.resolvedFindings = resolvedFindings;
  run.totalFindings = totalFindings;
  run.durationMs = new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime();
}

/**
 * Get trend data across scan runs
 */
export function getScanTrends(limit: number = 20): {
  runs: Array<{
    id: string;
    date: string;
    totalFindings: number;
    grade: string;
    durationMs: number;
  }>;
  trendDirection: 'improving' | 'stable' | 'declining';
  avgFindingsPerScan: number;
} {
  const runs = Array.from(scanRunStore.values())
    .filter(r => r.status === 'completed')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, limit)
    .map(r => ({
      id: r.id,
      date: r.startedAt,
      totalFindings: r.totalFindings,
      grade: r.overallGrade,
      durationMs: r.durationMs,
    }));

  const avgFindings = runs.length > 0
    ? runs.reduce((s, r) => s + r.totalFindings, 0) / runs.length
    : 0;

  let trendDirection: 'improving' | 'stable' | 'declining' = 'stable';
  if (runs.length >= 3) {
    const recent = runs.slice(0, 3).reduce((s, r) => s + r.totalFindings, 0) / 3;
    const older = runs.slice(-3).reduce((s, r) => s + r.totalFindings, 0) / 3;
    if (recent < older * 0.9) trendDirection = 'improving';
    else if (recent > older * 1.1) trendDirection = 'declining';
  }

  return { runs, trendDirection, avgFindingsPerScan: avgFindings };
}

/**
 * Get all active findings
 */
export function getActiveFindings(): PersistedFinding[] {
  return Array.from(findingStore.values())
    .filter(f => f.status === 'active')
    .sort((a, b) => {
      const sevRank: Record<string, number> = { fatal: 4, error: 3, warn: 2, info: 1 };
      return (sevRank[b.severity] ?? 0) - (sevRank[a.severity] ?? 0);
    });
}

/**
 * Get finding lifecycle analytics
 */
export function getFindingAnalytics(): {
  total: number;
  active: number;
  resolved: number;
  avgTimeToResolveMs: number;
  recurrenceRate: number;
  topCategories: Array<{ category: string; count: number }>;
} {
  const all = Array.from(findingStore.values());
  const active = all.filter(f => f.status === 'active');
  const resolved = all.filter(f => f.status === 'resolved');

  const resolveTimes = resolved
    .filter(f => f.resolvedAt && f.firstSeenAt)
    .map(f => new Date(f.resolvedAt!).getTime() - new Date(f.firstSeenAt).getTime());

  const avgTimeToResolve = resolveTimes.length > 0
    ? resolveTimes.reduce((s, t) => s + t, 0) / resolveTimes.length
    : 0;

  const recurring = all.filter(f => f.seenCount > 1);

  const categoryMap: Record<string, number> = {};
  for (const f of active) {
    categoryMap[f.category] = (categoryMap[f.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: all.length,
    active: active.length,
    resolved: resolved.length,
    avgTimeToResolveMs: avgTimeToResolve,
    recurrenceRate: all.length > 0 ? recurring.length / all.length : 0,
    topCategories,
  };
}
