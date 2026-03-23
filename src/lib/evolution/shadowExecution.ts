/**
 * Shadow Execution Engine — EVOLUTION v9.0.0
 * Dry-run mutations in shadow mode against state snapshots.
 */

// --- Types ---

export interface ShadowInput {
  proposalId: string;
  mutationFn: (state: Record<string, unknown>) => Record<string, unknown>;
  baselineState: Record<string, unknown>;
  label: string;
}

export interface ShadowResult {
  proposalId: string;
  label: string;
  baselineSnapshot: Record<string, unknown>;
  mutatedSnapshot: Record<string, unknown>;
  diffs: ShadowDiff[];
  regressions: string[];
  safe: boolean;
  durationMs: number;
  timestamp: number;
}

export interface ShadowDiff {
  path: string;
  before: unknown;
  after: unknown;
  type: 'added' | 'removed' | 'changed';
}

// --- Constants ---

const MAX_RESULTS = 200;
const SHADOW_TIMEOUT_MS = 5_000;

// --- State ---

const shadowResults: ShadowResult[] = [];

// --- Helpers ---

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function computeDiffs(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  prefix = ''
): ShadowDiff[] {
  const diffs: ShadowDiff[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const bVal = before[key];
    const aVal = after[key];

    if (!(key in before)) {
      diffs.push({ path, before: undefined, after: aVal, type: 'added' });
    } else if (!(key in after)) {
      diffs.push({ path, before: bVal, after: undefined, type: 'removed' });
    } else if (typeof bVal === 'object' && typeof aVal === 'object' && bVal !== null && aVal !== null) {
      diffs.push(...computeDiffs(
        bVal as Record<string, unknown>,
        aVal as Record<string, unknown>,
        path
      ));
    } else if (bVal !== aVal) {
      diffs.push({ path, before: bVal, after: aVal, type: 'changed' });
    }
  }

  return diffs;
}

function detectRegressions(diffs: ShadowDiff[]): string[] {
  const regressions: string[] = [];

  for (const diff of diffs) {
    if (diff.type === 'removed') {
      regressions.push(`Removed: ${diff.path}`);
    }
    // Numeric regression: value decreased when it shouldn't
    if (diff.type === 'changed' && typeof diff.before === 'number' && typeof diff.after === 'number') {
      if (diff.path.includes('health') || diff.path.includes('score') || diff.path.includes('coverage')) {
        if (diff.after < diff.before) {
          regressions.push(`Regression: ${diff.path} dropped from ${diff.before} to ${diff.after}`);
        }
      }
    }
  }

  return regressions;
}

// --- Core ---

export function executeShadow(input: ShadowInput): ShadowResult {
  const start = Date.now();
  const baselineSnapshot = deepClone(input.baselineState);
  let mutatedSnapshot: Record<string, unknown>;

  try {
    const cloned = deepClone(input.baselineState);
    mutatedSnapshot = input.mutationFn(cloned);
  } catch (err) {
    const result: ShadowResult = {
      proposalId: input.proposalId,
      label: input.label,
      baselineSnapshot,
      mutatedSnapshot: baselineSnapshot,
      diffs: [],
      regressions: [`Shadow execution error: ${err instanceof Error ? err.message : String(err)}`],
      safe: false,
      durationMs: Date.now() - start,
      timestamp: Date.now(),
    };
    shadowResults.push(result);
    return result;
  }

  const diffs = computeDiffs(baselineSnapshot, mutatedSnapshot);
  const regressions = detectRegressions(diffs);

  const result: ShadowResult = {
    proposalId: input.proposalId,
    label: input.label,
    baselineSnapshot,
    mutatedSnapshot,
    diffs,
    regressions,
    safe: regressions.length === 0,
    durationMs: Date.now() - start,
    timestamp: Date.now(),
  };

  shadowResults.push(result);
  if (shadowResults.length > MAX_RESULTS) shadowResults.splice(0, shadowResults.length - MAX_RESULTS);

  return result;
}

export function getShadowResults(count: number = 50): ShadowResult[] {
  return shadowResults.slice(-count);
}

export function getShadowResultForProposal(proposalId: string): ShadowResult | null {
  return [...shadowResults].reverse().find(r => r.proposalId === proposalId) ?? null;
}

export function clearShadowState(): void {
  shadowResults.length = 0;
}
