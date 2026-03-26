/**
 * Engine Bus — Dead Letter Queue (DLQ)
 * Captures failed dispatches for later replay or debugging.
 *
 * Optimizations:
 * - Ring buffer replaces array + shift() + rebuildIndex() for O(1) operations
 * - O(1) ID lookup via Map index (points into ring buffer)
 */

export interface DeadLetter {
  id: string;
  engine: string;
  command: string;
  payload: unknown;
  error: string;
  errorCode?: string;
  timestamp: string;
  retryCount: number;
  correlationId?: string;
}

const MAX_DLQ_SIZE = 200;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours TTL

/** Ring buffer storage */
const ring = new Array<DeadLetter | null>(MAX_DLQ_SIZE).fill(null);
let head = 0; // next write position
let count = 0;
/** O(1) ID → ring index lookup */
const idIndex = new Map<string, number>();

/** Count active (non-null, non-stale) entries */
function activeCount(): number {
  return count;
}

/**
 * Add a failed dispatch to the DLQ — O(1).
 */
export function addDeadLetter(letter: Omit<DeadLetter, 'id' | 'timestamp'>): DeadLetter {
  const entry: DeadLetter = {
    ...letter,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  // Evict the entry being overwritten
  if (count >= MAX_DLQ_SIZE) {
    const evicted = ring[head];
    if (evicted) idIndex.delete(evicted.id);
  }

  ring[head] = entry;
  idIndex.set(entry.id, head);
  head = (head + 1) % MAX_DLQ_SIZE;
  if (count < MAX_DLQ_SIZE) count++;

  return entry;
}

/**
 * Get dead letters, optionally filtered by engine — newest first.
 */
export function getDeadLetters(engine?: string, limit = 50): DeadLetter[] {
  const result: DeadLetter[] = [];
  for (let i = 0; i < count && result.length < limit; i++) {
    const idx = (head - 1 - i + MAX_DLQ_SIZE) % MAX_DLQ_SIZE;
    const entry = ring[idx];
    if (!entry) continue;
    if (!engine || entry.engine === engine) {
      result.push(entry);
    }
  }
  return result;
}

/**
 * Get DLQ stats — single-pass aggregation.
 */
export function getDLQStats(): {
  total: number;
  byEngine: Record<string, number>;
  oldestTimestamp: string | null;
} {
  const byEngine: Record<string, number> = {};
  let oldest: string | null = null;

  for (let i = 0; i < count; i++) {
    const idx = (head - count + i + MAX_DLQ_SIZE) % MAX_DLQ_SIZE;
    const entry = ring[idx];
    if (!entry) continue;
    byEngine[entry.engine] = (byEngine[entry.engine] || 0) + 1;
    if (!oldest || entry.timestamp < oldest) oldest = entry.timestamp;
  }

  return { total: count, byEngine, oldestTimestamp: oldest };
}

/**
 * Replay a dead letter by ID — O(1) lookup, O(1) removal.
 */
export function replayDeadLetter(id: string): DeadLetter | null {
  const idx = idIndex.get(id);
  if (idx === undefined) return null;
  const letter = ring[idx];
  if (!letter) return null;

  // Null out the slot and remove from index
  ring[idx] = null;
  idIndex.delete(id);
  count = Math.max(0, count - 1);

  return letter;
}

/**
 * Purge all dead letters.
 */
export function purgeDLQ(): number {
  const purged = count;
  ring.fill(null);
  head = 0;
  count = 0;
  idIndex.clear();
  return purged;
}
