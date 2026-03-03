/**
 * Engine Bus — Dead Letter Queue (DLQ)
 * Captures failed dispatches for later replay or debugging.
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

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours TTL

const deadLetters: DeadLetter[] = [];
const MAX_DLQ_SIZE = 200;

/** Evict entries older than MAX_AGE_MS */
function evictStale(): void {
  const cutoff = Date.now() - MAX_AGE_MS;
  let i = 0;
  while (i < deadLetters.length && new Date(deadLetters[i].timestamp).getTime() < cutoff) {
    i++;
  }
  if (i > 0) deadLetters.splice(0, i);
}

/**
 * Add a failed dispatch to the DLQ.
 */
export function addDeadLetter(letter: Omit<DeadLetter, 'id' | 'timestamp'>): DeadLetter {
  evictStale();

  const entry: DeadLetter = {
    ...letter,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  deadLetters.push(entry);

  // Evict oldest if over max
  while (deadLetters.length > MAX_DLQ_SIZE) {
    deadLetters.shift();
  }

  return entry;
}

/**
 * Get all dead letters, optionally filtered by engine.
 */
export function getDeadLetters(engine?: string, limit = 50): DeadLetter[] {
  let result = [...deadLetters];
  if (engine) {
    result = result.filter(d => d.engine === engine);
  }
  return result.reverse().slice(0, limit);
}

/**
 * Get DLQ stats.
 */
export function getDLQStats(): {
  total: number;
  byEngine: Record<string, number>;
  oldestTimestamp: string | null;
} {
  const byEngine: Record<string, number> = {};
  for (const d of deadLetters) {
    byEngine[d.engine] = (byEngine[d.engine] || 0) + 1;
  }
  return {
    total: deadLetters.length,
    byEngine,
    oldestTimestamp: deadLetters.length > 0 ? deadLetters[0].timestamp : null,
  };
}

/**
 * Replay a dead letter by ID. Returns the letter for re-dispatch.
 */
export function replayDeadLetter(id: string): DeadLetter | null {
  const idx = deadLetters.findIndex(d => d.id === id);
  if (idx === -1) return null;
  const [letter] = deadLetters.splice(idx, 1);
  return letter;
}

/**
 * Purge all dead letters.
 */
export function purgeDLQ(): number {
  const count = deadLetters.length;
  deadLetters.length = 0;
  return count;
}
