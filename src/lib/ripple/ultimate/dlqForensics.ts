/**
 * RIPPLE DLQ Forensics Engine — v9.0.0 "Tsunami"
 * 
 * Pattern analysis on dead-letter events to detect recurring failure
 * signatures, auto-create bypass routes, and provide one-click replay
 * with payload mutation for debugging.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DLQEntry {
  id: string;
  eventType: string;
  source: string;
  payload: Record<string, unknown>;
  error: string;
  retryCount: number;
  firstFailedAt: string;
  lastFailedAt: string;
  subscriberId: string;
  fingerprint: string; // Error signature hash
}

export interface FailurePattern {
  fingerprint: string;
  errorSignature: string;
  eventTypes: string[];
  sources: string[];
  subscribers: string[];
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  frequency: number; // per hour
  bypassActive: boolean;
}

export interface BypassRoute {
  id: string;
  fingerprint: string;
  originalSubscriber: string;
  action: 'skip' | 'reroute' | 'transform';
  reroutableTo?: string;
  transformFn?: string;
  createdAt: string;
  activatedCount: number;
}

export interface ForensicsReport {
  totalDLQEntries: number;
  uniquePatterns: number;
  topPatterns: FailurePattern[];
  activeBypassRoutes: number;
  replayableCount: number;
  oldestEntry: string | null;
  newestEntry: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_DLQ_ENTRIES = 2000;
const MAX_PATTERNS = 500;
const AUTO_BYPASS_THRESHOLD = 10; // Create bypass after N occurrences of same fingerprint
const PATTERN_WINDOW_MS = 60 * 60 * 1000; // 1 hour for frequency calc

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const dlqEntries: DLQEntry[] = [];
const patterns = new Map<string, FailurePattern>();
const bypassRoutes = new Map<string, BypassRoute>();

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Generate a fingerprint from an error + event type. */
function generateFingerprint(eventType: string, error: string, subscriberId: string): string {
  // Normalize error: strip numbers, paths, UUIDs
  const normalized = error
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    .replace(/\d+/g, '<N>')
    .replace(/\/[\w/.-]+/g, '<PATH>')
    .trim()
    .slice(0, 200);

  // Simple hash
  let hash = 0;
  const str = `${eventType}|${normalized}|${subscriberId}`;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `dlq-${Math.abs(hash).toString(36)}`;
}

/** Record a dead-letter event for forensic analysis. */
export function recordDLQEvent(
  id: string,
  eventType: string,
  source: string,
  payload: Record<string, unknown>,
  error: string,
  retryCount: number,
  subscriberId: string
): DLQEntry {
  const now = new Date().toISOString();
  const fingerprint = generateFingerprint(eventType, error, subscriberId);

  const entry: DLQEntry = {
    id,
    eventType,
    source,
    payload,
    error,
    retryCount,
    firstFailedAt: now,
    lastFailedAt: now,
    subscriberId,
    fingerprint,
  };

  dlqEntries.push(entry);
  if (dlqEntries.length > MAX_DLQ_ENTRIES) {
    dlqEntries.splice(0, dlqEntries.length - MAX_DLQ_ENTRIES);
  }

  // Update pattern
  updatePattern(fingerprint, eventType, source, subscriberId, error, now);

  return entry;
}

function updatePattern(
  fingerprint: string,
  eventType: string,
  source: string,
  subscriberId: string,
  error: string,
  timestamp: string
): void {
  const existing = patterns.get(fingerprint);

  if (existing) {
    existing.occurrences++;
    existing.lastSeen = timestamp;
    if (!existing.eventTypes.includes(eventType)) existing.eventTypes.push(eventType);
    if (!existing.sources.includes(source)) existing.sources.push(source);
    if (!existing.subscribers.includes(subscriberId)) existing.subscribers.push(subscriberId);

    // Calculate frequency
    const elapsed = new Date(timestamp).getTime() - new Date(existing.firstSeen).getTime();
    existing.frequency = elapsed > 0
      ? (existing.occurrences / elapsed) * PATTERN_WINDOW_MS
      : existing.occurrences;

    // Auto-bypass if threshold reached
    if (existing.occurrences >= AUTO_BYPASS_THRESHOLD && !existing.bypassActive) {
      createAutoBypass(fingerprint, subscriberId);
      existing.bypassActive = true;
    }
  } else {
    if (patterns.size >= MAX_PATTERNS) {
      // Evict oldest
      const oldest = Array.from(patterns.entries())
        .sort(([, a], [, b]) => new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime())[0];
      if (oldest) patterns.delete(oldest[0]);
    }

    patterns.set(fingerprint, {
      fingerprint,
      errorSignature: error.slice(0, 200),
      eventTypes: [eventType],
      sources: [source],
      subscribers: [subscriberId],
      occurrences: 1,
      firstSeen: timestamp,
      lastSeen: timestamp,
      frequency: 0,
      bypassActive: false,
    });
  }
}

function createAutoBypass(fingerprint: string, subscriberId: string): void {
  const route: BypassRoute = {
    id: crypto.randomUUID(),
    fingerprint,
    originalSubscriber: subscriberId,
    action: 'skip',
    createdAt: new Date().toISOString(),
    activatedCount: 0,
  };
  bypassRoutes.set(fingerprint, route);
}

/** Check if a bypass route exists for this event+subscriber combo. */
export function checkBypass(eventType: string, error: string, subscriberId: string): BypassRoute | null {
  const fingerprint = generateFingerprint(eventType, error, subscriberId);
  const route = bypassRoutes.get(fingerprint);
  if (route) {
    route.activatedCount++;
    return route;
  }
  return null;
}

/** Prepare a DLQ entry for replay with optional payload mutation. */
export function prepareReplay(
  entryId: string,
  mutations?: Record<string, unknown>
): { event: DLQEntry; mutatedPayload: Record<string, unknown> } | null {
  const entry = dlqEntries.find(e => e.id === entryId);
  if (!entry) return null;

  const mutatedPayload = { ...entry.payload, ...(mutations ?? {}), _replayedFrom: entryId, _replayedAt: new Date().toISOString() };

  return { event: entry, mutatedPayload };
}

/** Remove an entry from the DLQ after successful replay. */
export function removeDLQEntry(entryId: string): boolean {
  const idx = dlqEntries.findIndex(e => e.id === entryId);
  if (idx === -1) return false;
  dlqEntries.splice(idx, 1);
  return true;
}

/** Manually create a bypass route. */
export function createBypassRoute(
  fingerprint: string,
  subscriberId: string,
  action: BypassRoute['action'],
  reroutableTo?: string
): BypassRoute {
  const route: BypassRoute = {
    id: crypto.randomUUID(),
    fingerprint,
    originalSubscriber: subscriberId,
    action,
    reroutableTo,
    createdAt: new Date().toISOString(),
    activatedCount: 0,
  };
  bypassRoutes.set(fingerprint, route);
  return route;
}

/** Remove a bypass route. */
export function removeBypassRoute(fingerprint: string): boolean {
  const deleted = bypassRoutes.delete(fingerprint);
  const pattern = patterns.get(fingerprint);
  if (pattern) pattern.bypassActive = false;
  return deleted;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all DLQ entries. */
export function getDLQEntries(limit: number = 50): DLQEntry[] {
  return dlqEntries.slice(-limit);
}

/** Get all detected failure patterns. */
export function getFailurePatterns(): FailurePattern[] {
  return Array.from(patterns.values()).sort((a, b) => b.occurrences - a.occurrences);
}

/** Get active bypass routes. */
export function getBypassRoutes(): BypassRoute[] {
  return Array.from(bypassRoutes.values());
}

/** Generate a full forensics report. */
export function getForensicsReport(): ForensicsReport {
  const sorted = [...dlqEntries].sort((a, b) =>
    new Date(a.firstFailedAt).getTime() - new Date(b.firstFailedAt).getTime()
  );
  const topPatterns = Array.from(patterns.values())
    .sort((a, b) => b.occurrences - a.occurrences)
    .slice(0, 10);

  return {
    totalDLQEntries: dlqEntries.length,
    uniquePatterns: patterns.size,
    topPatterns,
    activeBypassRoutes: bypassRoutes.size,
    replayableCount: dlqEntries.length,
    oldestEntry: sorted[0]?.firstFailedAt ?? null,
    newestEntry: sorted[sorted.length - 1]?.lastFailedAt ?? null,
  };
}

/** Reset all forensics state. */
export function resetForensicsState(): void {
  dlqEntries.length = 0;
  patterns.clear();
  bypassRoutes.clear();
}
