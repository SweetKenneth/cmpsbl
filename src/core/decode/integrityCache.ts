/**
 * DECODE Access Policy — Integrity Cache
 * Caches integrity check results with TTL to avoid redundant validation.
 */

import type { IntegrityReport } from '../../core/metrics/integrityValidator';

interface CachedIntegrity {
  report: IntegrityReport;
  cachedAt: number;
}

let cachedReport: CachedIntegrity | null = null;
const DEFAULT_TTL_MS = 30_000; // 30 seconds

/**
 * Get cached integrity report if still fresh.
 */
export function getCachedIntegrity(ttlMs = DEFAULT_TTL_MS): IntegrityReport | null {
  if (!cachedReport) return null;
  if (Date.now() - cachedReport.cachedAt > ttlMs) {
    cachedReport = null;
    return null;
  }
  return cachedReport.report;
}

/**
 * Cache an integrity report.
 */
export function cacheIntegrity(report: IntegrityReport): void {
  cachedReport = { report, cachedAt: Date.now() };
}

/**
 * Invalidate cached integrity.
 */
export function invalidateIntegrityCache(): void {
  cachedReport = null;
}
