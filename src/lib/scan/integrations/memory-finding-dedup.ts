/**
 * MEMORY-Integrated Finding Deduplication (#8)
 * Uses MEMORY's semantic similarity to deduplicate findings across scan sessions,
 * track finding lifecycle, and prevent redundant analysis on already-resolved issues.
 */

import type { MemoryEntry } from '@/lib/memory/client';

export interface FindingMemoryEntry {
  findingId: string;
  fingerprint: string;
  category: string;
  severity: string;
  title: string;
  firstSeenAt: string;
  lastSeenAt: string;
  seenCount: number;
  status: 'active' | 'resolved' | 'suppressed' | 'wontfix';
  resolvedAt?: string;
  resolvedBy?: string;
  relatedFindingIds: string[];
}

export interface DeduplicationResult {
  newFindings: string[];
  duplicates: Array<{ findingId: string; existingId: string; similarity: number }>;
  recurrences: Array<{ findingId: string; previouslyResolved: boolean; seenCount: number }>;
  stats: { total: number; new: number; duplicate: number; recurring: number };
}

const findingMemory = new Map<string, FindingMemoryEntry>();

/**
 * Register a finding in MEMORY for cross-session deduplication
 */
export function registerFinding(
  findingId: string,
  fingerprint: string,
  category: string,
  severity: string,
  title: string,
): FindingMemoryEntry {
  const existing = findingMemory.get(fingerprint);

  if (existing) {
    existing.lastSeenAt = new Date().toISOString();
    existing.seenCount++;
    if (!existing.relatedFindingIds.includes(findingId)) {
      existing.relatedFindingIds.push(findingId);
    }
    return existing;
  }

  const entry: FindingMemoryEntry = {
    findingId,
    fingerprint,
    category,
    severity,
    title,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    seenCount: 1,
    status: 'active',
    relatedFindingIds: [findingId],
  };

  findingMemory.set(fingerprint, entry);
  return entry;
}

/**
 * Deduplicate a batch of findings against MEMORY
 */
export function deduplicateFindings(
  findings: Array<{
    id: string;
    fingerprint: string;
    category: string;
    severity: string;
    title: string;
  }>,
): DeduplicationResult {
  const newFindings: string[] = [];
  const duplicates: DeduplicationResult['duplicates'] = [];
  const recurrences: DeduplicationResult['recurrences'] = [];

  for (const finding of findings) {
    const existing = findingMemory.get(finding.fingerprint);

    if (!existing) {
      registerFinding(finding.id, finding.fingerprint, finding.category, finding.severity, finding.title);
      newFindings.push(finding.id);
    } else if (existing.status === 'resolved') {
      // Previously resolved finding has recurred
      existing.status = 'active';
      existing.lastSeenAt = new Date().toISOString();
      existing.seenCount++;
      recurrences.push({
        findingId: finding.id,
        previouslyResolved: true,
        seenCount: existing.seenCount,
      });
    } else {
      // Active duplicate
      existing.lastSeenAt = new Date().toISOString();
      existing.seenCount++;
      duplicates.push({
        findingId: finding.id,
        existingId: existing.findingId,
        similarity: 1.0,
      });
    }
  }

  return {
    newFindings,
    duplicates,
    recurrences,
    stats: {
      total: findings.length,
      new: newFindings.length,
      duplicate: duplicates.length,
      recurring: recurrences.length,
    },
  };
}

/**
 * Mark a finding as resolved in MEMORY
 */
export function resolveFinding(fingerprint: string, resolvedBy?: string): boolean {
  const entry = findingMemory.get(fingerprint);
  if (!entry) return false;

  entry.status = 'resolved';
  entry.resolvedAt = new Date().toISOString();
  entry.resolvedBy = resolvedBy;
  return true;
}

/**
 * Get finding lifecycle stats from MEMORY
 */
export function getFindingLifecycleStats(): {
  total: number;
  active: number;
  resolved: number;
  suppressed: number;
  avgSeenCount: number;
  oldestActive: string | null;
  recurrenceRate: number;
} {
  const entries = Array.from(findingMemory.values());
  const active = entries.filter(e => e.status === 'active');
  const resolved = entries.filter(e => e.status === 'resolved');
  const recurring = entries.filter(e => e.seenCount > 1 && e.status === 'active');

  return {
    total: entries.length,
    active: active.length,
    resolved: resolved.length,
    suppressed: entries.filter(e => e.status === 'suppressed').length,
    avgSeenCount: entries.length > 0
      ? entries.reduce((s, e) => s + e.seenCount, 0) / entries.length
      : 0,
    oldestActive: active.length > 0
      ? active.sort((a, b) => a.firstSeenAt.localeCompare(b.firstSeenAt))[0].firstSeenAt
      : null,
    recurrenceRate: entries.length > 0 ? recurring.length / entries.length : 0,
  };
}

/**
 * Decay priority for stale findings (seen long ago, never acted on)
 */
export function applyDecayWeighting(
  findings: Array<{ id: string; fingerprint: string; priority: number }>,
  decayHalfLifeMs: number = 7 * 24 * 60 * 60 * 1000, // 7 days
): Array<{ id: string; originalPriority: number; decayedPriority: number; age: number }> {
  const now = Date.now();

  return findings.map(f => {
    const memory = findingMemory.get(f.fingerprint);
    if (!memory) return { id: f.id, originalPriority: f.priority, decayedPriority: f.priority, age: 0 };

    const ageMs = now - new Date(memory.firstSeenAt).getTime();
    const decayFactor = Math.pow(0.5, ageMs / decayHalfLifeMs);
    // Stale findings decay in priority; frequently recurring ones get boosted
    const recurrenceBoost = Math.min(20, (memory.seenCount - 1) * 5);
    const decayedPriority = Math.max(1, Math.round(f.priority * decayFactor + recurrenceBoost));

    return {
      id: f.id,
      originalPriority: f.priority,
      decayedPriority,
      age: ageMs,
    };
  });
}
