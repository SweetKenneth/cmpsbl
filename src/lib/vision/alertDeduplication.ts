/**
 * CMPSBL® VISION — Intelligent Alert Deduplication & Storm Suppression
 * Prevents alert fatigue through fingerprinting, coalescing, and storm detection.
 */

export interface DeduplicatedAlert {
  fingerprint: string;
  title: string;
  severity: string;
  source: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  suppressed: boolean;
  stormDetected: boolean;
  representativePayload: Record<string, unknown>;
}

export interface StormState {
  active: boolean;
  startedAt: string | null;
  alertRate: number; // alerts per minute
  suppressedCount: number;
  threshold: number; // alerts per minute to trigger storm mode
}

// Configuration
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minute dedup window
const STORM_THRESHOLD = 20; // alerts per minute
const STORM_COOLDOWN_MS = 2 * 60 * 1000; // 2 min cooldown after storm
const MAX_DEDUP_ENTRIES = 500;

// State
const dedupIndex = new Map<string, DeduplicatedAlert>();
const alertTimestamps: number[] = [];
let stormState: StormState = {
  active: false,
  startedAt: null,
  alertRate: 0,
  suppressedCount: 0,
  threshold: STORM_THRESHOLD,
};

/**
 * Generate deduplication fingerprint
 */
function generateAlertFingerprint(
  source: string,
  severity: string,
  category: string,
  labels: Record<string, string> = {}
): string {
  const sorted = Object.entries(labels).sort((a, b) => a[0].localeCompare(b[0]));
  const raw = `${source}:${severity}:${category}:${sorted.map(([k, v]) => `${k}=${v}`).join(',')}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return `dup-${hash.toString(16)}`;
}

/**
 * Check and update storm detection
 */
function updateStormDetection(): void {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  // Trim old timestamps
  while (alertTimestamps.length > 0 && alertTimestamps[0] < oneMinuteAgo) {
    alertTimestamps.shift();
  }

  stormState.alertRate = alertTimestamps.length;

  if (!stormState.active && stormState.alertRate >= STORM_THRESHOLD) {
    stormState.active = true;
    stormState.startedAt = new Date().toISOString();
  } else if (stormState.active && stormState.alertRate < STORM_THRESHOLD / 2) {
    // End storm after rate drops below half threshold
    stormState.active = false;
    stormState.startedAt = null;
  }
}

/**
 * Process an incoming alert through deduplication
 * Returns the deduplicated alert and whether it should be surfaced
 */
export function processAlert(alert: {
  title: string;
  severity: string;
  source: string;
  category: string;
  labels?: Record<string, string>;
  payload?: Record<string, unknown>;
}): { alert: DeduplicatedAlert; shouldSurface: boolean; reason: string } {
  const now = Date.now();
  alertTimestamps.push(now);
  updateStormDetection();

  const fingerprint = generateAlertFingerprint(
    alert.source,
    alert.severity,
    alert.category,
    alert.labels
  );

  const existing = dedupIndex.get(fingerprint);

  if (existing) {
    const timeSinceFirst = now - new Date(existing.firstSeen).getTime();

    existing.occurrences++;
    existing.lastSeen = new Date().toISOString();
    existing.stormDetected = stormState.active;

    if (timeSinceFirst < DEDUP_WINDOW_MS) {
      existing.suppressed = true;
      stormState.suppressedCount++;
      return {
        alert: existing,
        shouldSurface: false,
        reason: `Deduplicated (${existing.occurrences} occurrences in ${Math.round(timeSinceFirst / 1000)}s)`,
      };
    }

    // Outside dedup window — surface as repeat
    existing.firstSeen = new Date().toISOString();
    existing.occurrences = 1;
    existing.suppressed = false;

    return {
      alert: existing,
      shouldSurface: !stormState.active,
      reason: stormState.active ? 'Suppressed during alert storm' : 'Resurfaced after dedup window',
    };
  }

  // New alert
  const dedupAlert: DeduplicatedAlert = {
    fingerprint,
    title: alert.title,
    severity: alert.severity,
    source: alert.source,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    occurrences: 1,
    suppressed: stormState.active,
    stormDetected: stormState.active,
    representativePayload: alert.payload || {},
  };

  if (dedupIndex.size >= MAX_DEDUP_ENTRIES) {
    // Evict oldest
    const oldest = dedupIndex.keys().next().value;
    if (oldest) dedupIndex.delete(oldest);
  }
  dedupIndex.set(fingerprint, dedupAlert);

  if (stormState.active) {
    stormState.suppressedCount++;
    return {
      alert: dedupAlert,
      shouldSurface: alert.severity === 'critical', // Always surface critical even during storms
      reason: 'Storm active — only critical alerts surfaced',
    };
  }

  return {
    alert: dedupAlert,
    shouldSurface: true,
    reason: 'New alert',
  };
}

/**
 * Get current storm state
 */
export function getStormState(): StormState {
  updateStormDetection();
  return { ...stormState };
}

/**
 * Get deduplication stats
 */
export function getDedupStats(): {
  trackedFingerprints: number;
  totalSuppressed: number;
  stormActive: boolean;
  alertRate: number;
} {
  updateStormDetection();
  const totalSuppressed = Array.from(dedupIndex.values())
    .reduce((sum, a) => sum + Math.max(0, a.occurrences - 1), 0);

  return {
    trackedFingerprints: dedupIndex.size,
    totalSuppressed,
    stormActive: stormState.active,
    alertRate: stormState.alertRate,
  };
}
