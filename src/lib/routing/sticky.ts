/**
 * Sticky Routing — Pin provider choices to prevent oscillation
 */

export interface StickyEntry {
  provider_id: string;
  task_type: string;
  session_key: string;
  pinned_at: number;
  ttl_ms: number;
  change_count: number;
}

const stickyMap = new Map<string, StickyEntry>();

const DEFAULT_TTL_MS = 5 * 60 * 1000;       // 5 minutes
const ANTI_OSCILLATION_THRESHOLD = 3;         // force sticky after N changes in window
const ANTI_OSCILLATION_WINDOW_MS = 60_000;    // 1 minute window

// Track route changes for anti-oscillation
const changeLog = new Map<string, number[]>();

function routeKey(taskType: string, sessionKey: string): string {
  return `${taskType}::${sessionKey}`;
}

/** Check if a sticky route exists and is valid */
export function getStickyProvider(taskType: string, sessionKey: string): string | null {
  const key = routeKey(taskType, sessionKey);
  const entry = stickyMap.get(key);
  if (!entry) return null;

  if (Date.now() - entry.pinned_at > entry.ttl_ms) {
    stickyMap.delete(key);
    return null;
  }

  return entry.provider_id;
}

/** Pin a provider for a task type + session */
export function pinProvider(
  providerId: string,
  taskType: string,
  sessionKey: string,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const key = routeKey(taskType, sessionKey);
  const existing = stickyMap.get(key);

  // Track change for anti-oscillation
  if (existing && existing.provider_id !== providerId) {
    const changes = changeLog.get(key) ?? [];
    changes.push(Date.now());
    // Prune old entries
    const cutoff = Date.now() - ANTI_OSCILLATION_WINDOW_MS;
    const recent = changes.filter(t => t > cutoff);
    changeLog.set(key, recent);

    // If too many changes, extend TTL to force stickiness
    if (recent.length >= ANTI_OSCILLATION_THRESHOLD) {
      ttlMs = ttlMs * 3; // triple TTL to stabilize
    }
  }

  stickyMap.set(key, {
    provider_id: providerId,
    task_type: taskType,
    session_key: sessionKey,
    pinned_at: Date.now(),
    ttl_ms: ttlMs,
    change_count: (existing?.change_count ?? 0) + 1,
  });
}

/** Clear sticky route */
export function clearSticky(taskType: string, sessionKey: string): void {
  stickyMap.delete(routeKey(taskType, sessionKey));
}

/** Get all sticky entries (for diagnostics) */
export function getAllSticky(): StickyEntry[] {
  return Array.from(stickyMap.values());
}
