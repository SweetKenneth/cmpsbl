/**
 * INCLUSIVE — Drift Detector
 * @origin(ptchbl) — Migrated from PTCHBL hash-utils.ts
 * 
 * Content hashing and drift detection for accessibility regression tracking.
 * Detects when content changes may introduce accessibility regressions.
 */

// ════════════════════════════════════════
// Hashing Primitives
// ════════════════════════════════════════

/** Generate SHA-256 hash of a string (async, uses crypto.subtle) */
export async function generateHash(input: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Generate a fast sync hash for in-memory comparisons (djb2) */
export function fastHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return hash >>> 0;
}

// ════════════════════════════════════════
// Content Normalization
// ════════════════════════════════════════

/** Normalize HTML for consistent hashing (strip whitespace variance) */
export function normalizeHTML(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/** Generate hash of normalized HTML content */
export async function generateContentHash(html: string): Promise<string> {
  return generateHash(normalizeHTML(html));
}

/** Generate hash of an accessibility issue for deduplication */
export async function generateIssueHash(issue: {
  type: string;
  severity: string;
  wcag?: string;
  element?: string;
}): Promise<string> {
  const normalized = JSON.stringify({
    type: issue.type,
    severity: issue.severity,
    wcag: issue.wcag,
    element: issue.element?.substring(0, 100),
  });
  return generateHash(normalized);
}

/** Generate cache key for scan params */
export async function generateScanCacheKey(
  url: string,
  wcagLevel: string,
  scanDepth: string
): Promise<string> {
  return generateHash(`${url}:${wcagLevel}:${scanDepth}`);
}

// ════════════════════════════════════════
// Drift Detection Engine
// ════════════════════════════════════════

export interface DriftSnapshot {
  target: string;
  contentHash: number;
  issueCount: number;
  score: number;
  issueHashes: Set<number>;
  timestamp: string;
}

export interface DriftResult {
  target: string;
  drifted: boolean;
  contentChanged: boolean;
  scoreChange: number;
  issuesAdded: number;
  issuesRemoved: number;
  newIssueTypes: string[];
  resolvedIssueTypes: string[];
  severity: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  previousSnapshot: DriftSnapshot | null;
  currentSnapshot: DriftSnapshot;
}

// In-memory snapshot store
const snapshots: Map<string, DriftSnapshot[]> = new Map();
const MAX_SNAPSHOTS_PER_TARGET = 20;

/** Take a drift snapshot of a target */
export function takeSnapshot(
  target: string,
  html: string,
  issues: Array<{ type: string; severity: string; wcag_criterion?: string }>,
  score: number
): DriftSnapshot {
  const contentHash = fastHash(normalizeHTML(html));
  const issueHashes = new Set(
    issues.map(i => fastHash(`${i.type}:${i.severity}:${i.wcag_criterion || ''}`))
  );

  const snapshot: DriftSnapshot = {
    target,
    contentHash,
    issueCount: issues.length,
    score,
    issueHashes,
    timestamp: new Date().toISOString(),
  };

  // Store snapshot
  const history = snapshots.get(target) || [];
  history.push(snapshot);
  if (history.length > MAX_SNAPSHOTS_PER_TARGET) {
    history.shift();
  }
  snapshots.set(target, history);

  return snapshot;
}

/** Detect drift between current state and previous snapshot */
export function detectDrift(
  target: string,
  currentHtml: string,
  currentIssues: Array<{ type: string; severity: string; wcag_criterion?: string }>,
  currentScore: number
): DriftResult {
  const currentSnapshot = takeSnapshot(target, currentHtml, currentIssues, currentScore);

  const history = snapshots.get(target) || [];
  const previousSnapshot = history.length >= 2 ? history[history.length - 2] : null;

  if (!previousSnapshot) {
    return {
      target,
      drifted: false,
      contentChanged: false,
      scoreChange: 0,
      issuesAdded: 0,
      issuesRemoved: 0,
      newIssueTypes: [],
      resolvedIssueTypes: [],
      severity: 'none',
      previousSnapshot: null,
      currentSnapshot,
    };
  }

  const contentChanged = currentSnapshot.contentHash !== previousSnapshot.contentHash;
  const scoreChange = currentSnapshot.score - previousSnapshot.score;

  // Calculate issue diff
  const addedHashes = new Set([...currentSnapshot.issueHashes].filter(h => !previousSnapshot.issueHashes.has(h)));
  const removedHashes = new Set([...previousSnapshot.issueHashes].filter(h => !currentSnapshot.issueHashes.has(h)));

  const issuesAdded = addedHashes.size;
  const issuesRemoved = removedHashes.size;

  // Map hashes back to types (approximate)
  const currentIssueMap = new Map(
    currentIssues.map(i => [fastHash(`${i.type}:${i.severity}:${i.wcag_criterion || ''}`), i.type])
  );
  const newIssueTypes = [...addedHashes].map(h => currentIssueMap.get(h) || 'unknown').filter((v, i, a) => a.indexOf(v) === i);
  const resolvedIssueTypes: string[] = []; // Can't easily resolve without previous issues

  // Determine severity
  let severity: DriftResult['severity'] = 'none';
  if (!contentChanged && issuesAdded === 0) severity = 'none';
  else if (scoreChange <= -20) severity = 'critical';
  else if (scoreChange <= -10) severity = 'major';
  else if (scoreChange <= -5) severity = 'moderate';
  else if (issuesAdded > 0) severity = 'minor';

  const drifted = contentChanged || issuesAdded > 0 || scoreChange < -5;

  return {
    target,
    drifted,
    contentChanged,
    scoreChange,
    issuesAdded,
    issuesRemoved,
    newIssueTypes,
    resolvedIssueTypes,
    severity,
    previousSnapshot,
    currentSnapshot,
  };
}

/** Get drift history for a target */
export function getDriftHistory(target: string): DriftSnapshot[] {
  return snapshots.get(target) || [];
}

/** Get all targets with active drift monitoring */
export function getMonitoredTargets(): string[] {
  return Array.from(snapshots.keys());
}

/** Clear drift history for a target */
export function clearDriftHistory(target: string): void {
  snapshots.delete(target);
}

/** Get drift summary across all monitored targets */
export function getDriftSummary(): {
  totalTargets: number;
  targetsWithDrift: number;
  totalSnapshots: number;
  worstDrift: { target: string; scoreChange: number } | null;
} {
  let targetsWithDrift = 0;
  let totalSnapshots = 0;
  let worstDrift: { target: string; scoreChange: number } | null = null;

  for (const [target, history] of snapshots.entries()) {
    totalSnapshots += history.length;

    if (history.length >= 2) {
      const recent = history[history.length - 1];
      const previous = history[history.length - 2];
      const change = recent.score - previous.score;

      if (change < -5) {
        targetsWithDrift++;
        if (!worstDrift || change < worstDrift.scoreChange) {
          worstDrift = { target, scoreChange: change };
        }
      }
    }
  }

  return {
    totalTargets: snapshots.size,
    targetsWithDrift,
    totalSnapshots,
    worstDrift,
  };
}
