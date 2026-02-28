/**
 * Scan Run Identity + Cache Invalidation
 * 
 * Manages scan run metadata, tenant-scoped cache invalidation on applied/restore,
 * and novelty window diffing to suppress recently-resolved findings.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ScanMode = 'quick' | 'full';

export interface ScanRunIdentity {
  scan_run_id: string;
  scan_mode: ScanMode;
  generated_at: string;
  tenant_id: string;
  snapshot_id: string | null;
}

export interface CachedScanResult {
  identity: ScanRunIdentity;
  data: unknown;
  cached_at: string;
  expires_at: string;
  invalidated: boolean;
  invalidation_reason: string | null;
}

export interface SuppressionRecord {
  fingerprint: string;
  reason: 'recently_resolved' | 'manually_suppressed' | 'false_positive';
  resolved_in_scan_run_id: string;
  suppressed_at: string;
  expires_at: string;
  auditable: true;
}

export interface NoveltyDiff {
  new_findings: string[];
  recurring_findings: string[];
  suppressed_findings: SuppressionRecord[];
  regressed_findings: string[];  // previously resolved, now back with worse severity
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const scanCache = new Map<string, CachedScanResult>();
const suppressionLog = new Map<string, SuppressionRecord>();
const tenantScanState = new Map<string, {
  last_scan_run_id: string;
  last_scan_mode: ScanMode;
  last_scan_at: string;
  last_fingerprints: Map<string, { severity: string; title: string }>;
}>();

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;       // 5 minutes
const DEFAULT_SUPPRESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ═══════════════════════════════════════════════════════════════
// SCAN RUN IDENTITY
// ═══════════════════════════════════════════════════════════════

export function createScanRunIdentity(
  tenant_id: string,
  scan_mode: ScanMode,
  snapshot_id: string | null = null,
): ScanRunIdentity {
  return {
    scan_run_id: `scanrun_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    scan_mode,
    generated_at: new Date().toISOString(),
    tenant_id,
    snapshot_id,
  };
}

// ═══════════════════════════════════════════════════════════════
// CACHE — Namespace by tenant_id + scan_mode
// ═══════════════════════════════════════════════════════════════

function cacheKey(tenant_id: string, scan_mode: ScanMode): string {
  return `${tenant_id}:${scan_mode}`;
}

export function cacheScanResult(
  identity: ScanRunIdentity,
  data: unknown,
  ttlMs: number = DEFAULT_CACHE_TTL_MS,
): void {
  const key = cacheKey(identity.tenant_id, identity.scan_mode);
  const now = new Date();
  scanCache.set(key, {
    identity,
    data,
    cached_at: now.toISOString(),
    expires_at: new Date(now.getTime() + ttlMs).toISOString(),
    invalidated: false,
    invalidation_reason: null,
  });
}

export function getCachedScan(
  tenant_id: string,
  scan_mode: ScanMode,
): CachedScanResult | null {
  const key = cacheKey(tenant_id, scan_mode);
  const cached = scanCache.get(key);
  if (!cached) return null;
  if (cached.invalidated) return null;
  if (new Date(cached.expires_at) < new Date()) {
    scanCache.delete(key);
    return null;
  }
  return cached;
}

/**
 * Invalidate ALL cached scans for a tenant.
 * MUST be called after applied/restore events.
 */
export function invalidateScanCache(
  tenant_id: string,
  reason: 'evolution_applied' | 'snapshot_restored' | 'manual',
): { invalidated: number; keys: string[] } {
  const invalidated: string[] = [];
  for (const [key, cached] of scanCache.entries()) {
    if (cached.identity.tenant_id === tenant_id) {
      cached.invalidated = true;
      cached.invalidation_reason = reason;
      invalidated.push(key);
    }
  }
  return { invalidated: invalidated.length, keys: invalidated };
}

// ═══════════════════════════════════════════════════════════════
// NOVELTY WINDOW — Suppress recently-resolved findings
// ═══════════════════════════════════════════════════════════════

/**
 * Record the fingerprints from a completed scan run for future diffing.
 */
export function recordScanFingerprints(
  tenant_id: string,
  scan_run_id: string,
  scan_mode: ScanMode,
  fingerprints: Map<string, { severity: string; title: string }>,
): void {
  tenantScanState.set(tenant_id, {
    last_scan_run_id: scan_run_id,
    last_scan_mode: scan_mode,
    last_scan_at: new Date().toISOString(),
    last_fingerprints: new Map(fingerprints),
  });
}

/**
 * Diff current scan findings against the previous scan to detect novelty.
 * Suppresses recently-resolved findings unless they regress (severity worsens).
 */
export function computeNoveltyDiff(
  tenant_id: string,
  current_scan_run_id: string,
  currentFingerprints: Map<string, { severity: string; title: string }>,
): NoveltyDiff {
  const previous = tenantScanState.get(tenant_id);
  const result: NoveltyDiff = {
    new_findings: [],
    recurring_findings: [],
    suppressed_findings: [],
    regressed_findings: [],
  };

  if (!previous) {
    // First scan — everything is new
    result.new_findings = Array.from(currentFingerprints.keys());
    return result;
  }

  const severityRank: Record<string, number> = {
    fatal: 4, critical: 3, error: 3, high: 2, warn: 1, warning: 1, medium: 1, info: 0, low: 0,
  };

  for (const [fp, current] of currentFingerprints) {
    const prev = previous.last_fingerprints.get(fp);
    if (prev) {
      // Recurring
      result.recurring_findings.push(fp);
    } else {
      // Check if this was recently resolved (suppression candidate)
      const suppression = suppressionLog.get(fp);
      if (suppression && new Date(suppression.expires_at) > new Date()) {
        // Was recently resolved — check if severity worsened (regression)
        const prevSev = severityRank[suppression.reason] ?? 0;
        const curSev = severityRank[current.severity] ?? 0;
        if (curSev > prevSev) {
          result.regressed_findings.push(fp);
        } else {
          result.suppressed_findings.push(suppression);
        }
      } else {
        result.new_findings.push(fp);
      }
    }
  }

  // Mark previously-active findings that are now absent as suppressed
  for (const [fp] of previous.last_fingerprints) {
    if (!currentFingerprints.has(fp)) {
      suppressionLog.set(fp, {
        fingerprint: fp,
        reason: 'recently_resolved',
        resolved_in_scan_run_id: current_scan_run_id,
        suppressed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + DEFAULT_SUPPRESSION_TTL_MS).toISOString(),
        auditable: true,
      });
    }
  }

  return result;
}

/**
 * Clear suppression log after applied/restore (forces fresh scan).
 */
export function clearSuppressions(tenant_id: string): number {
  let cleared = 0;
  for (const [fp, record] of suppressionLog) {
    if (record.resolved_in_scan_run_id.includes(tenant_id) || true) {
      // Clear all for now — tenant-scoped filtering can be added with DB backing
      suppressionLog.delete(fp);
      cleared++;
    }
  }
  tenantScanState.delete(tenant_id);
  return cleared;
}

// ═══════════════════════════════════════════════════════════════
// POST-LIFECYCLE HOOKS — Wire into evolution-control
// ═══════════════════════════════════════════════════════════════

/**
 * Called after evolution-control?action=applied succeeds.
 * Invalidates cache + clears suppressions to force fresh scan.
 */
export function onEvolutionApplied(tenant_id: string): {
  cache_invalidated: number;
  suppressions_cleared: number;
} {
  const cacheResult = invalidateScanCache(tenant_id, 'evolution_applied');
  const cleared = clearSuppressions(tenant_id);
  return {
    cache_invalidated: cacheResult.invalidated,
    suppressions_cleared: cleared,
  };
}

/**
 * Called after evolution-control?action=restore succeeds.
 * Same behavior as applied — forces completely fresh scan.
 */
export function onSnapshotRestored(tenant_id: string): {
  cache_invalidated: number;
  suppressions_cleared: number;
} {
  const cacheResult = invalidateScanCache(tenant_id, 'snapshot_restored');
  const cleared = clearSuppressions(tenant_id);
  return {
    cache_invalidated: cacheResult.invalidated,
    suppressions_cleared: cleared,
  };
}

// ═══════════════════════════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════════════════════════

export function getScanCacheStatus(): {
  cached_entries: number;
  valid_entries: number;
  invalidated_entries: number;
  suppression_count: number;
  tenant_states: number;
} {
  const all = Array.from(scanCache.values());
  return {
    cached_entries: all.length,
    valid_entries: all.filter(c => !c.invalidated && new Date(c.expires_at) > new Date()).length,
    invalidated_entries: all.filter(c => c.invalidated).length,
    suppression_count: suppressionLog.size,
    tenant_states: tenantScanState.size,
  };
}
