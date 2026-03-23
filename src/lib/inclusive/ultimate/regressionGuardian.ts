/**
 * INCLUSIVE Ultimate — System 6: Accessibility Regression Guardian
 * 
 * Continuous drift detection via content hashing. Compares scan-over-scan,
 * identifies specific changes that caused regression, triggers EVOLUTION proposals.
 * 
 * @module inclusive/ultimate/regressionGuardian
 */

// ── Types ────────────────────────────────────────────────────────

export interface ScanSnapshot {
  id: string;
  target: string;
  score: number;
  issueCount: number;
  contentHash: string;
  criteriaResults: Record<string, 'pass' | 'fail'>;
  capturedAt: string;
}

export interface RegressionEvent {
  id: string;
  target: string;
  previousScore: number;
  currentScore: number;
  scoreDelta: number;
  newIssues: string[];
  resolvedIssues: string[];
  contentChanged: boolean;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  proposalGenerated: boolean;
  detectedAt: string;
}

export interface RegressionTrend {
  target: string;
  dataPoints: Array<{ score: number; timestamp: string }>;
  direction: 'improving' | 'stable' | 'degrading';
  avgScoreChange: number;
}

// ── State ────────────────────────────────────────────────────────

const snapshots: Map<string, ScanSnapshot[]> = new Map(); // target → snapshots
const regressions: RegressionEvent[] = [];
const MAX_SNAPSHOTS_PER_TARGET = 50;
const MAX_REGRESSIONS = 300;
const REGRESSION_THRESHOLD = 5; // Score drop ≥ 5 points = regression

// ── Hashing ──────────────────────────────────────────────────────

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ── Core API ────────────────────────────────────────────────────

/** Capture a scan snapshot and check for regression */
export function captureSnapshot(
  target: string,
  score: number,
  issueCount: number,
  criteriaResults: Record<string, 'pass' | 'fail'>,
  contentRepresentation: string,
): { snapshot: ScanSnapshot; regression: RegressionEvent | null } {
  const contentHash = simpleHash(contentRepresentation);

  const snapshot: ScanSnapshot = {
    id: crypto.randomUUID(),
    target,
    score,
    issueCount,
    contentHash,
    criteriaResults,
    capturedAt: new Date().toISOString(),
  };

  // Get previous snapshots for this target
  if (!snapshots.has(target)) snapshots.set(target, []);
  const targetSnapshots = snapshots.get(target)!;
  const previous = targetSnapshots[targetSnapshots.length - 1];

  targetSnapshots.push(snapshot);
  if (targetSnapshots.length > MAX_SNAPSHOTS_PER_TARGET) {
    targetSnapshots.splice(0, targetSnapshots.length - MAX_SNAPSHOTS_PER_TARGET);
  }

  // Check for regression
  let regression: RegressionEvent | null = null;

  if (previous) {
    const scoreDelta = score - previous.score;
    
    if (scoreDelta <= -REGRESSION_THRESHOLD) {
      // Identify new failures and resolved issues
      const newIssues: string[] = [];
      const resolvedIssues: string[] = [];

      for (const [criterion, status] of Object.entries(criteriaResults)) {
        const prevStatus = previous.criteriaResults[criterion];
        if (status === 'fail' && prevStatus === 'pass') newIssues.push(criterion);
        if (status === 'pass' && prevStatus === 'fail') resolvedIssues.push(criterion);
      }

      const severity: RegressionEvent['severity'] =
        scoreDelta <= -20 ? 'critical' :
        scoreDelta <= -10 ? 'serious' :
        scoreDelta <= -5 ? 'moderate' : 'minor';

      regression = {
        id: crypto.randomUUID(),
        target,
        previousScore: previous.score,
        currentScore: score,
        scoreDelta,
        newIssues,
        resolvedIssues,
        contentChanged: contentHash !== previous.contentHash,
        severity,
        proposalGenerated: severity === 'critical' || severity === 'serious',
        detectedAt: new Date().toISOString(),
      };

      regressions.push(regression);
      if (regressions.length > MAX_REGRESSIONS) regressions.splice(0, regressions.length - MAX_REGRESSIONS);
    }
  }

  return { snapshot, regression };
}

/** Get regression trend for a target */
export function getTrend(target: string): RegressionTrend | null {
  const targetSnapshots = snapshots.get(target);
  if (!targetSnapshots || targetSnapshots.length < 2) return null;

  const dataPoints = targetSnapshots.map(s => ({ score: s.score, timestamp: s.capturedAt }));

  // Calculate average score change
  let totalChange = 0;
  for (let i = 1; i < dataPoints.length; i++) {
    totalChange += dataPoints[i].score - dataPoints[i - 1].score;
  }
  const avgChange = totalChange / (dataPoints.length - 1);

  const direction: RegressionTrend['direction'] =
    avgChange > 1 ? 'improving' :
    avgChange < -1 ? 'degrading' : 'stable';

  return {
    target,
    dataPoints,
    direction,
    avgScoreChange: Math.round(avgChange * 100) / 100,
  };
}

/** Get all regressions */
export function getRegressions(hours?: number): RegressionEvent[] {
  if (!hours) return [...regressions];
  const since = Date.now() - hours * 3_600_000;
  return regressions.filter(r => new Date(r.detectedAt).getTime() > since);
}

/** Get guardian health */
export function getGuardianHealth() {
  const recentRegressions = getRegressions(24);
  return {
    trackedTargets: snapshots.size,
    totalSnapshots: Array.from(snapshots.values()).reduce((s, arr) => s + arr.length, 0),
    regressionsLast24h: recentRegressions.length,
    criticalRegressions: recentRegressions.filter(r => r.severity === 'critical').length,
    totalRegressions: regressions.length,
  };
}

/** Reset */
export function resetGuardian(): void {
  snapshots.clear();
  regressions.length = 0;
}
