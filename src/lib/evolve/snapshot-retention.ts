/**
 * Snapshot Retention & Cleanup Policy Engine
 * Manages lifecycle of evolution snapshots per tenant.
 * Prevents unbounded storage growth while preserving critical restore points.
 */

export interface RetentionPolicy {
  tenantId: string;
  maxSnapshotsPerTenant: number;
  maxAgeDays: number;
  keepMinRestorable: number;
  keepTagged: boolean; // never delete tagged snapshots
}

export interface ManagedSnapshot {
  snapshotId: string;
  tenantId: string;
  proposalId: string;
  createdAt: number;
  restorable: boolean;
  tags: string[];
  sizeBytes: number;
  isProtected: boolean;
}

export interface CleanupResult {
  tenantId: string;
  reviewed: number;
  deleted: string[];
  retained: number;
  freedBytes: number;
  reason: string[];
}

const policies = new Map<string, RetentionPolicy>();

const DEFAULT_POLICY: Omit<RetentionPolicy, 'tenantId'> = {
  maxSnapshotsPerTenant: 50,
  maxAgeDays: 90,
  keepMinRestorable: 5,
  keepTagged: true,
};

export function setRetentionPolicy(tenantId: string, policy: Partial<RetentionPolicy>): RetentionPolicy {
  const full: RetentionPolicy = {
    tenantId,
    ...DEFAULT_POLICY,
    ...policy,
  };
  policies.set(tenantId, full);
  return full;
}

export function getRetentionPolicy(tenantId: string): RetentionPolicy {
  return policies.get(tenantId) ?? { tenantId, ...DEFAULT_POLICY };
}

export function evaluateRetention(
  snapshots: ManagedSnapshot[],
  tenantId: string,
): CleanupResult {
  const policy = getRetentionPolicy(tenantId);
  const tenantSnaps = snapshots
    .filter(s => s.tenantId === tenantId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const toDelete: string[] = [];
  const reasons: string[] = [];
  let freedBytes = 0;
  const now = Date.now();
  const maxAgeMs = policy.maxAgeDays * 86_400_000;

  // Track how many restorable we've kept
  let restorableKept = 0;

  for (let i = 0; i < tenantSnaps.length; i++) {
    const snap = tenantSnaps[i];
    let keep = false;

    // Protected snapshots are never deleted
    if (snap.isProtected) { keep = true; }

    // Tagged snapshots kept if policy says so
    if (policy.keepTagged && snap.tags.length > 0) { keep = true; }

    // Keep minimum restorable count
    if (snap.restorable && restorableKept < policy.keepMinRestorable) {
      keep = true;
      restorableKept++;
    }

    // Within retention window
    if (!keep && (now - snap.createdAt) < maxAgeMs && i < policy.maxSnapshotsPerTenant) {
      keep = true;
      if (snap.restorable) restorableKept++;
    }

    if (!keep) {
      toDelete.push(snap.snapshotId);
      freedBytes += snap.sizeBytes;
      if ((now - snap.createdAt) >= maxAgeMs) {
        reasons.push(`${snap.snapshotId}: exceeded ${policy.maxAgeDays}-day retention`);
      } else {
        reasons.push(`${snap.snapshotId}: exceeded max ${policy.maxSnapshotsPerTenant} snapshots`);
      }
    }
  }

  return {
    tenantId,
    reviewed: tenantSnaps.length,
    deleted: toDelete,
    retained: tenantSnaps.length - toDelete.length,
    freedBytes,
    reason: reasons,
  };
}

export function estimateStorageCost(snapshots: ManagedSnapshot[]): {
  totalBytes: number;
  byTenant: Record<string, { count: number; bytes: number }>;
} {
  const byTenant: Record<string, { count: number; bytes: number }> = {};
  let totalBytes = 0;

  for (const snap of snapshots) {
    totalBytes += snap.sizeBytes;
    if (!byTenant[snap.tenantId]) byTenant[snap.tenantId] = { count: 0, bytes: 0 };
    byTenant[snap.tenantId].count++;
    byTenant[snap.tenantId].bytes += snap.sizeBytes;
  }

  return { totalBytes, byTenant };
}
