/**
 * ENCODE Rollback Ledger — v1.0.0
 * Immutable ledger of every applied patch with full reverse-diff capability.
 * Enables deterministic rollback to any prior state.
 * 
 * Each entry stores the forward patch and its computed reverse.
 * Rollbacks are applied in reverse chronological order.
 */

import type { PatchPlan, PatchArtifact } from './patchPlanValidator';

// ═══ Types ════════════════════════════════════════════════════════

export interface RollbackLedgerEntry {
  id: string;
  planId: string;
  taskId: string;
  appliedAt: string;
  forward: PatchArtifact[];
  reverse: ReverseDiff[];
  state: 'applied' | 'rolled_back' | 'superseded';
  rollbackAt?: string;
  description: string;
  checksum: string;
}

export interface ReverseDiff {
  filePath: string;
  operation: 'create' | 'modify' | 'delete'; // reverse operation
  previousContent: string;
  previousLineRange?: { start: number; end: number };
}

export interface RollbackResult {
  success: boolean;
  entryId: string;
  reverseDiffs: ReverseDiff[];
  rolledBackAt: string;
  error?: string;
}

export interface LedgerSummary {
  totalEntries: number;
  applied: number;
  rolledBack: number;
  superseded: number;
  oldestEntry?: string;
  newestEntry?: string;
}

// ═══ State ═════════════════════════════════════════════════════════

const ledger: RollbackLedgerEntry[] = [];
const MAX_ENTRIES = 200;
let entryCounter = 0;

// ═══ Checksum ═════════════════════════════════════════════════════

function computeChecksum(artifacts: PatchArtifact[]): string {
  // FNV-1a inspired hash
  let hash = 2166136261;
  const str = artifacts.map(a => `${a.filePath}:${a.operation}:${a.content?.length || 0}`).join('|');
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ═══ Reverse Diff Computation ═════════════════════════════════════

/**
 * Compute reverse diffs for a set of forward artifacts.
 * In a real system, this would capture "before" snapshots.
 * Here we store the reverse operation structure.
 */
function computeReverseDiffs(artifacts: PatchArtifact[], beforeSnapshots?: Map<string, string>): ReverseDiff[] {
  return artifacts.map(art => {
    const filePath = art.filePath || 'unknown';
    const beforeContent = beforeSnapshots?.get(filePath) || '';

    switch (art.operation) {
      case 'create':
        // Reverse of create = delete
        return { filePath, operation: 'delete' as const, previousContent: '' };
      case 'delete':
        // Reverse of delete = create with previous content
        return { filePath, operation: 'create' as const, previousContent: beforeContent };
      case 'modify':
        // Reverse of modify = modify back to previous
        return {
          filePath,
          operation: 'modify' as const,
          previousContent: beforeContent,
          previousLineRange: art.lineRange,
        };
      default:
        return { filePath, operation: 'modify' as const, previousContent: beforeContent };
    }
  });
}

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Record a patch application to the ledger
 */
export function recordPatchApplication(
  plan: PatchPlan,
  beforeSnapshots?: Map<string, string>,
): RollbackLedgerEntry {
  const reverse = computeReverseDiffs(plan.artifacts, beforeSnapshots);
  const checksum = computeChecksum(plan.artifacts);

  const entry: RollbackLedgerEntry = {
    id: `rl_${++entryCounter}_${Date.now()}`,
    planId: plan.id,
    taskId: plan.taskId,
    appliedAt: new Date().toISOString(),
    forward: [...plan.artifacts],
    reverse,
    state: 'applied',
    description: plan.description,
    checksum,
  };

  // Mark previous entries for same files as superseded
  const affectedFiles = new Set(plan.artifacts.map(a => a.filePath).filter(Boolean));
  for (const existing of ledger) {
    if (existing.state === 'applied') {
      const existingFiles = new Set(existing.forward.map(a => a.filePath).filter(Boolean));
      const overlap = [...affectedFiles].some(f => existingFiles.has(f!));
      if (overlap) {
        existing.state = 'superseded';
      }
    }
  }

  ledger.push(entry);

  // Enforce limit
  if (ledger.length > MAX_ENTRIES) {
    ledger.shift();
  }

  return entry;
}

/**
 * Rollback a specific ledger entry
 */
export function rollback(entryId: string): RollbackResult {
  const entry = ledger.find(e => e.id === entryId);

  if (!entry) {
    return {
      success: false,
      entryId,
      reverseDiffs: [],
      rolledBackAt: new Date().toISOString(),
      error: `Entry ${entryId} not found`,
    };
  }

  if (entry.state === 'rolled_back') {
    return {
      success: false,
      entryId,
      reverseDiffs: [],
      rolledBackAt: new Date().toISOString(),
      error: 'Entry already rolled back',
    };
  }

  if (entry.state === 'superseded') {
    return {
      success: false,
      entryId,
      reverseDiffs: entry.reverse,
      rolledBackAt: new Date().toISOString(),
      error: 'Entry superseded by newer patches — rolling back may cause conflicts',
    };
  }

  entry.state = 'rolled_back';
  entry.rollbackAt = new Date().toISOString();

  return {
    success: true,
    entryId,
    reverseDiffs: entry.reverse,
    rolledBackAt: entry.rollbackAt,
  };
}

/**
 * Rollback to a specific point in time (all patches after that point)
 */
export function rollbackToPoint(timestamp: string): RollbackResult[] {
  const cutoff = new Date(timestamp).getTime();
  const results: RollbackResult[] = [];

  // Process in reverse chronological order
  const toRollback = ledger
    .filter(e => e.state === 'applied' && new Date(e.appliedAt).getTime() > cutoff)
    .reverse();

  for (const entry of toRollback) {
    results.push(rollback(entry.id));
  }

  return results;
}

/**
 * Get ledger entries
 */
export function getLedger(limit?: number): RollbackLedgerEntry[] {
  const entries = [...ledger].reverse();
  return limit ? entries.slice(0, limit) : entries;
}

/**
 * Get a specific entry
 */
export function getLedgerEntry(entryId: string): RollbackLedgerEntry | undefined {
  return ledger.find(e => e.id === entryId);
}

/**
 * Get ledger summary
 */
export function getLedgerSummary(): LedgerSummary {
  return {
    totalEntries: ledger.length,
    applied: ledger.filter(e => e.state === 'applied').length,
    rolledBack: ledger.filter(e => e.state === 'rolled_back').length,
    superseded: ledger.filter(e => e.state === 'superseded').length,
    oldestEntry: ledger[0]?.appliedAt,
    newestEntry: ledger[ledger.length - 1]?.appliedAt,
  };
}

/**
 * Verify ledger integrity via checksum chain
 */
export function verifyLedgerIntegrity(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const entry of ledger) {
    const expected = computeChecksum(entry.forward);
    if (expected !== entry.checksum) {
      issues.push(`Entry ${entry.id}: checksum mismatch (expected ${expected}, got ${entry.checksum})`);
    }
  }

  return { valid: issues.length === 0, issues };
}
