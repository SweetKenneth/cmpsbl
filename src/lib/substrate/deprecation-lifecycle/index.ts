/**
 * Capability Deprecation Lifecycle
 * Managed sunset process for capabilities and engines
 * 
 * Tracks deprecation phases: announced → warned → deprecated → removed
 * with grace periods, migration guidance, and usage monitoring.
 */

export type DeprecationPhase = 'active' | 'announced' | 'warned' | 'deprecated' | 'removed';

export interface DeprecationEntry {
  capabilityId: string;
  phase: DeprecationPhase;
  announcedAt: number;
  deprecatedAt: number | null;
  removeAt: number | null;
  replacementId: string | null;
  migrationGuide: string | null;
  reason: string;
  usageCount: number;
  lastUsedAt: number | null;
}

export interface DeprecationPolicy {
  announcementPeriodDays: number;
  warningPeriodDays: number;
  gracePeriodDays: number;
  blockOnRemoved: boolean;
}

const DEFAULT_POLICY: DeprecationPolicy = {
  announcementPeriodDays: 30,
  warningPeriodDays: 14,
  gracePeriodDays: 7,
  blockOnRemoved: true,
};

const entries = new Map<string, DeprecationEntry>();
let policy = { ...DEFAULT_POLICY };

/**
 * Announce deprecation of a capability
 */
export function announceDeprecation(
  capabilityId: string,
  reason: string,
  replacementId?: string,
  migrationGuide?: string
): DeprecationEntry {
  const now = Date.now();
  const totalDays = policy.announcementPeriodDays + policy.warningPeriodDays + policy.gracePeriodDays;

  const entry: DeprecationEntry = {
    capabilityId,
    phase: 'announced',
    announcedAt: now,
    deprecatedAt: null,
    removeAt: now + totalDays * 86_400_000,
    replacementId: replacementId ?? null,
    migrationGuide: migrationGuide ?? null,
    reason,
    usageCount: 0,
    lastUsedAt: null,
  };

  entries.set(capabilityId, entry);
  return entry;
}

/**
 * Advance deprecation phase
 */
export function advancePhase(capabilityId: string): DeprecationEntry | null {
  const entry = entries.get(capabilityId);
  if (!entry) return null;

  const transitions: Record<DeprecationPhase, DeprecationPhase | null> = {
    active: 'announced',
    announced: 'warned',
    warned: 'deprecated',
    deprecated: 'removed',
    removed: null,
  };

  const next = transitions[entry.phase];
  if (!next) return null;

  entry.phase = next;
  if (next === 'deprecated') entry.deprecatedAt = Date.now();
  return entry;
}

/**
 * Check if a capability is usable (not removed)
 */
export function isUsable(capabilityId: string): { usable: boolean; warning: string | null } {
  const entry = entries.get(capabilityId);
  if (!entry) return { usable: true, warning: null };

  if (entry.phase === 'removed' && policy.blockOnRemoved) {
    return {
      usable: false,
      warning: `${capabilityId} has been removed. ${entry.replacementId ? `Use ${entry.replacementId} instead.` : ''}`,
    };
  }

  if (entry.phase === 'deprecated' || entry.phase === 'warned') {
    return {
      usable: true,
      warning: `${capabilityId} is ${entry.phase}. ${entry.replacementId ? `Migrate to ${entry.replacementId}.` : ''} Removal: ${entry.removeAt ? new Date(entry.removeAt).toISOString() : 'TBD'}`,
    };
  }

  return { usable: true, warning: null };
}

/**
 * Record usage of a deprecated capability
 */
export function recordUsage(capabilityId: string): void {
  const entry = entries.get(capabilityId);
  if (entry) {
    entry.usageCount++;
    entry.lastUsedAt = Date.now();
  }
}

/** Get all deprecation entries */
export function getDeprecations(): DeprecationEntry[] {
  return Array.from(entries.values());
}

/** Get entries by phase */
export function getByPhase(phase: DeprecationPhase): DeprecationEntry[] {
  return Array.from(entries.values()).filter(e => e.phase === phase);
}

/** Configure deprecation policy */
export function configurePolicy(updates: Partial<DeprecationPolicy>) {
  policy = { ...policy, ...updates };
}
