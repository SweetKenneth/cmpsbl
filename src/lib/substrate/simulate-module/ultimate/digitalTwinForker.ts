/**
 * SIMULATE Ultimate — System 3: Digital Twin Forker
 * 
 * Forks the substrate state into lightweight simulation contexts.
 * Applies mutations without affecting live state. Supports branching
 * exploration and comparison against baseline using diff analysis.
 * 
 * @module simulate/ultimate/digitalTwinForker
 */

// ── Types ────────────────────────────────────────────────────────

export interface TwinFork {
  id: string;
  parentId: string | null;
  label: string;
  baselineSnapshot: Record<string, unknown>;
  currentState: Record<string, unknown>;
  mutations: TwinMutation[];
  branches: string[];          // Child fork IDs
  diffs: TwinDiff[];
  createdAt: string;
  lastMutatedAt: string;
}

export interface TwinMutation {
  id: string;
  description: string;
  mutationFn: string;         // Serialized description
  appliedAt: string;
  success: boolean;
  stateBeforeHash: string;
  stateAfterHash: string;
}

export interface TwinDiff {
  path: string;
  before: unknown;
  after: unknown;
  type: 'added' | 'removed' | 'changed';
}

export interface ForkComparison {
  forkAId: string;
  forkBId: string;
  forkALabel: string;
  forkBLabel: string;
  sharedBaseline: boolean;
  uniqueToA: TwinDiff[];
  uniqueToB: TwinDiff[];
  conflicting: Array<{ path: string; valueA: unknown; valueB: unknown }>;
  divergenceScore: number;   // 0-1
  comparedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const forks: Map<string, TwinFork> = new Map();
const comparisons: ForkComparison[] = [];
const MAX_FORKS = 100;
const MAX_COMPARISONS = 200;

// ── Helpers ──────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function simpleHash(obj: unknown): string {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function computeDiffs(before: Record<string, unknown>, after: Record<string, unknown>, prefix = ''): TwinDiff[] {
  const diffs: TwinDiff[] = [];
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
      diffs.push(...computeDiffs(bVal as Record<string, unknown>, aVal as Record<string, unknown>, path));
    } else if (bVal !== aVal) {
      diffs.push({ path, before: bVal, after: aVal, type: 'changed' });
    }
  }
  return diffs;
}

// ── Core API ────────────────────────────────────────────────────

/** Create a fork from a state snapshot */
export function createFork(label: string, state: Record<string, unknown>, parentId: string | null = null): TwinFork {
  const fork: TwinFork = {
    id: crypto.randomUUID(),
    parentId,
    label,
    baselineSnapshot: deepClone(state),
    currentState: deepClone(state),
    mutations: [],
    branches: [],
    diffs: [],
    createdAt: new Date().toISOString(),
    lastMutatedAt: new Date().toISOString(),
  };

  // Register as branch of parent
  if (parentId) {
    const parent = forks.get(parentId);
    if (parent) parent.branches.push(fork.id);
  }

  forks.set(fork.id, fork);
  if (forks.size > MAX_FORKS) {
    const oldest = forks.keys().next().value;
    if (oldest) forks.delete(oldest);
  }

  return fork;
}

/** Apply a mutation to a fork */
export function applyMutation(
  forkId: string,
  description: string,
  mutationFn: (state: Record<string, unknown>) => Record<string, unknown>,
): TwinFork | null {
  const fork = forks.get(forkId);
  if (!fork) return null;

  const beforeHash = simpleHash(fork.currentState);
  let success = true;

  try {
    fork.currentState = mutationFn(deepClone(fork.currentState));
  } catch {
    success = false;
  }

  const afterHash = simpleHash(fork.currentState);

  fork.mutations.push({
    id: crypto.randomUUID(),
    description,
    mutationFn: description,
    appliedAt: new Date().toISOString(),
    success,
    stateBeforeHash: beforeHash,
    stateAfterHash: afterHash,
  });

  fork.diffs = computeDiffs(fork.baselineSnapshot, fork.currentState);
  fork.lastMutatedAt = new Date().toISOString();

  return fork;
}

/** Branch a fork — create a new fork from the current state of an existing one */
export function branchFork(forkId: string, branchLabel: string): TwinFork | null {
  const parent = forks.get(forkId);
  if (!parent) return null;
  return createFork(branchLabel, parent.currentState, forkId);
}

/** Compare two forks */
export function compareForks(forkAId: string, forkBId: string): ForkComparison | null {
  const forkA = forks.get(forkAId);
  const forkB = forks.get(forkBId);
  if (!forkA || !forkB) return null;

  const diffsA = computeDiffs(forkA.baselineSnapshot, forkA.currentState);
  const diffsB = computeDiffs(forkB.baselineSnapshot, forkB.currentState);

  const pathsA = new Set(diffsA.map(d => d.path));
  const pathsB = new Set(diffsB.map(d => d.path));

  const uniqueToA = diffsA.filter(d => !pathsB.has(d.path));
  const uniqueToB = diffsB.filter(d => !pathsA.has(d.path));
  const conflicting: ForkComparison['conflicting'] = [];

  for (const dA of diffsA) {
    if (pathsB.has(dA.path)) {
      const dB = diffsB.find(d => d.path === dA.path);
      if (dB && JSON.stringify(dA.after) !== JSON.stringify(dB.after)) {
        conflicting.push({ path: dA.path, valueA: dA.after, valueB: dB.after });
      }
    }
  }

  const totalChanges = new Set([...pathsA, ...pathsB]).size;
  const divergenceScore = totalChanges > 0
    ? Math.round(((uniqueToA.length + uniqueToB.length + conflicting.length) / totalChanges) * 1000) / 1000
    : 0;

  const comparison: ForkComparison = {
    forkAId, forkBId,
    forkALabel: forkA.label,
    forkBLabel: forkB.label,
    sharedBaseline: simpleHash(forkA.baselineSnapshot) === simpleHash(forkB.baselineSnapshot),
    uniqueToA, uniqueToB, conflicting,
    divergenceScore,
    comparedAt: new Date().toISOString(),
  };

  comparisons.push(comparison);
  if (comparisons.length > MAX_COMPARISONS) comparisons.splice(0, comparisons.length - MAX_COMPARISONS);

  return comparison;
}

/** Get fork */
export function getFork(forkId: string): TwinFork | undefined { return forks.get(forkId); }
export function getAllForks(): TwinFork[] { return Array.from(forks.values()); }

export function getForkerHealth() {
  const allForks = Array.from(forks.values());
  return {
    activeForks: forks.size,
    totalMutations: allForks.reduce((s, f) => s + f.mutations.length, 0),
    totalBranches: allForks.reduce((s, f) => s + f.branches.length, 0),
    totalComparisons: comparisons.length,
    avgDiffsPerFork: allForks.length > 0
      ? Math.round(allForks.reduce((s, f) => s + f.diffs.length, 0) / allForks.length * 10) / 10
      : 0,
  };
}

export function resetForker(): void {
  forks.clear();
  comparisons.length = 0;
}
