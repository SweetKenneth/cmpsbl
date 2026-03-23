/**
 * NERVE Ultimate — Dead Letter Queue (DLQ)
 * Captures failed/dropped signals for retry and forensic analysis.
 * Categorizes failures and supports manual or automatic retry.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type DLQReason =
  | 'circuit_open'
  | 'backpressure_critical'
  | 'ttl_expired'
  | 'delivery_error'
  | 'validation_failed'
  | 'flood_blocked'
  | 'node_dead';

export interface DeadLetter {
  id: string;
  signalId: string;
  from: string;
  to: string;
  type: string;
  priority: string;
  payload: Record<string, unknown>;
  reason: DLQReason;
  errorDetail?: string;
  enqueuedAt: number;
  retryCount: number;
  maxRetries: number;
  lastRetryAt: number | null;
  status: 'pending' | 'retrying' | 'exhausted' | 'resolved';
  idempotencyKey?: string;
}

export interface DLQStats {
  totalLetters: number;
  pending: number;
  retrying: number;
  exhausted: number;
  resolved: number;
  byReason: Record<string, number>;
  oldestPendingAge: number | null;
}

export type RetryHandler = (letter: DeadLetter) => Promise<boolean>;

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const MAX_DLQ_SIZE = 2_000;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_BACKOFF_BASE_MS = 1_000;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const queue: DeadLetter[] = [];
let dlqCounter = 0;
let retryHandler: RetryHandler | null = null;

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Enqueue a failed signal into the dead letter queue */
export function enqueue(
  signalId: string,
  from: string,
  to: string,
  type: string,
  priority: string,
  payload: Record<string, unknown>,
  reason: DLQReason,
  errorDetail?: string,
  idempotencyKey?: string,
): DeadLetter {
  const letter: DeadLetter = {
    id: `dlq-${++dlqCounter}-${Date.now()}`,
    signalId,
    from,
    to,
    type,
    priority,
    payload: { ...payload },
    reason,
    errorDetail,
    enqueuedAt: Date.now(),
    retryCount: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
    lastRetryAt: null,
    status: 'pending',
    idempotencyKey,
  };

  queue.push(letter);

  // Enforce size cap — remove oldest resolved/exhausted first
  if (queue.length > MAX_DLQ_SIZE) {
    const removableIdx = queue.findIndex(l => l.status === 'resolved' || l.status === 'exhausted');
    if (removableIdx >= 0) {
      queue.splice(removableIdx, 1);
    } else {
      queue.splice(0, 1);
    }
  }

  return letter;
}

/** Attempt to retry a specific dead letter */
export async function retryLetter(letterId: string): Promise<boolean> {
  const letter = queue.find(l => l.id === letterId);
  if (!letter || letter.status === 'exhausted' || letter.status === 'resolved') return false;
  if (!retryHandler) return false;

  letter.status = 'retrying';
  letter.retryCount++;
  letter.lastRetryAt = Date.now();

  try {
    const success = await retryHandler(letter);
    letter.status = success ? 'resolved' : (letter.retryCount >= letter.maxRetries ? 'exhausted' : 'pending');
    return success;
  } catch {
    letter.status = letter.retryCount >= letter.maxRetries ? 'exhausted' : 'pending';
    return false;
  }
}

/** Retry all pending letters with exponential backoff eligibility */
export async function retryAllEligible(): Promise<{ attempted: number; succeeded: number }> {
  const now = Date.now();
  let attempted = 0;
  let succeeded = 0;

  for (const letter of queue) {
    if (letter.status !== 'pending') continue;

    // Exponential backoff check
    const backoffMs = RETRY_BACKOFF_BASE_MS * Math.pow(2, letter.retryCount);
    const lastAttempt = letter.lastRetryAt ?? letter.enqueuedAt;
    if ((now - lastAttempt) < backoffMs) continue;

    attempted++;
    const success = await retryLetter(letter.id);
    if (success) succeeded++;
  }

  return { attempted, succeeded };
}

/** Register the retry handler function */
export function setRetryHandler(handler: RetryHandler): void {
  retryHandler = handler;
}

/** Mark a letter as resolved (manually) */
export function resolveLetter(letterId: string): boolean {
  const letter = queue.find(l => l.id === letterId);
  if (!letter) return false;
  letter.status = 'resolved';
  return true;
}

/** Get a specific dead letter */
export function getLetter(letterId: string): DeadLetter | null {
  return queue.find(l => l.id === letterId) ?? null;
}

/** Get all dead letters with optional status filter */
export function getLetters(status?: DeadLetter['status'], limit: number = 50): DeadLetter[] {
  let results = status ? queue.filter(l => l.status === status) : queue.slice();
  return results.slice(-limit);
}

/** Get DLQ statistics */
export function getDLQStats(): DLQStats {
  const byReason: Record<string, number> = {};
  let pending = 0, retrying = 0, exhausted = 0, resolved = 0;
  let oldestPendingAge: number | null = null;
  const now = Date.now();

  for (const letter of queue) {
    byReason[letter.reason] = (byReason[letter.reason] ?? 0) + 1;
    if (letter.status === 'pending') {
      pending++;
      const age = now - letter.enqueuedAt;
      if (oldestPendingAge === null || age > oldestPendingAge) oldestPendingAge = age;
    } else if (letter.status === 'retrying') retrying++;
    else if (letter.status === 'exhausted') exhausted++;
    else if (letter.status === 'resolved') resolved++;
  }

  return { totalLetters: queue.length, pending, retrying, exhausted, resolved, byReason, oldestPendingAge };
}

/** Purge resolved and exhausted letters */
export function purge(): number {
  const before = queue.length;
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].status === 'resolved' || queue[i].status === 'exhausted') {
      queue.splice(i, 1);
    }
  }
  return before - queue.length;
}
