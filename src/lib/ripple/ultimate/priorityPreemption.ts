/**
 * RIPPLE Priority Preemption Engine — v9.0.0 "Tsunami"
 * 
 * Critical signals immediately preempt lower-priority batch processing.
 * 4-tier priority queue with real-time reordering and sub-millisecond
 * delivery for circuit breaker trips and governance overrides.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SignalPriority = 'critical' | 'high' | 'normal' | 'low';

export interface PrioritizedSignal {
  id: string;
  type: string;
  source: string;
  payload: Record<string, unknown>;
  priority: SignalPriority;
  ttlMs: number;
  enqueuedAt: number;
  expiresAt: number;
  preempted: boolean;
}

export interface PreemptionStats {
  totalEnqueued: number;
  totalPreemptions: number;
  totalExpired: number;
  queueDepth: Record<SignalPriority, number>;
  avgDeliveryMs: Record<SignalPriority, number>;
  lastPreemptionAt: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PRIORITY_WEIGHT: Record<SignalPriority, number> = {
  critical: 1000,
  high: 100,
  normal: 10,
  low: 1,
};

const DEFAULT_TTL: Record<SignalPriority, number> = {
  critical: 5 * 60 * 1000,    // 5 min
  high: 15 * 60 * 1000,       // 15 min
  normal: 60 * 60 * 1000,     // 1 hour
  low: 4 * 60 * 60 * 1000,    // 4 hours
};

const MAX_QUEUE_SIZE = 10000;

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const queues: Record<SignalPriority, PrioritizedSignal[]> = {
  critical: [],
  high: [],
  normal: [],
  low: [],
};

let processingBatch = false;
let currentBatchPriority: SignalPriority | null = null;
let preemptionFlag = false;

const stats: PreemptionStats = {
  totalEnqueued: 0,
  totalPreemptions: 0,
  totalExpired: 0,
  queueDepth: { critical: 0, high: 0, normal: 0, low: 0 },
  avgDeliveryMs: { critical: 0, high: 0, normal: 0, low: 0 },
  lastPreemptionAt: null,
};

// EMA delivery time tracking
const deliveryEMA: Record<SignalPriority, { avg: number; count: number }> = {
  critical: { avg: 0, count: 0 },
  high: { avg: 0, count: 0 },
  normal: { avg: 0, count: 0 },
  low: { avg: 0, count: 0 },
};
const EMA_ALPHA = 0.2;

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Enqueue a signal with priority. Returns true if it triggered a preemption. */
export function enqueueSignal(
  id: string,
  type: string,
  source: string,
  payload: Record<string, unknown>,
  priority: SignalPriority = 'normal'
): boolean {
  const now = Date.now();
  const ttl = DEFAULT_TTL[priority];

  const signal: PrioritizedSignal = {
    id,
    type,
    source,
    payload,
    priority,
    ttlMs: ttl,
    enqueuedAt: now,
    expiresAt: now + ttl,
    preempted: false,
  };

  const queue = queues[priority];
  queue.push(signal);

  // Enforce max queue size per priority
  if (queue.length > MAX_QUEUE_SIZE / 4) {
    queue.shift(); // Drop oldest
  }

  stats.totalEnqueued++;
  updateQueueDepths();

  // Check if preemption needed
  const didPreempt = checkPreemption(priority);
  return didPreempt;
}

/** Dequeue the next highest-priority signal. */
export function dequeueNext(): PrioritizedSignal | null {
  const now = Date.now();

  // Process in priority order: critical → high → normal → low
  for (const p of ['critical', 'high', 'normal', 'low'] as SignalPriority[]) {
    const queue = queues[p];

    // Remove expired
    while (queue.length > 0 && queue[0].expiresAt < now) {
      queue.shift();
      stats.totalExpired++;
    }

    if (queue.length > 0) {
      const signal = queue.shift()!;
      updateQueueDepths();
      return signal;
    }
  }

  return null;
}

/** Dequeue all signals of a given priority. */
export function dequeueBatch(priority: SignalPriority, limit: number = 50): PrioritizedSignal[] {
  const now = Date.now();
  const queue = queues[priority];
  const batch: PrioritizedSignal[] = [];

  while (batch.length < limit && queue.length > 0) {
    const signal = queue.shift()!;
    if (signal.expiresAt >= now) {
      batch.push(signal);
    } else {
      stats.totalExpired++;
    }
  }

  updateQueueDepths();
  return batch;
}

/** Record delivery time for EMA tracking. */
export function recordDeliveryTime(priority: SignalPriority, durationMs: number): void {
  const ema = deliveryEMA[priority];
  if (ema.count === 0) {
    ema.avg = durationMs;
  } else {
    ema.avg = EMA_ALPHA * durationMs + (1 - EMA_ALPHA) * ema.avg;
  }
  ema.count++;
  stats.avgDeliveryMs[priority] = Math.round(ema.avg * 100) / 100;
}

/** Check if currently processing and should preempt. */
function checkPreemption(incomingPriority: SignalPriority): boolean {
  if (!processingBatch || !currentBatchPriority) return false;

  const incomingWeight = PRIORITY_WEIGHT[incomingPriority];
  const currentWeight = PRIORITY_WEIGHT[currentBatchPriority];

  if (incomingWeight > currentWeight) {
    preemptionFlag = true;
    stats.totalPreemptions++;
    stats.lastPreemptionAt = new Date().toISOString();
    return true;
  }

  return false;
}

/** Signal that batch processing has started. */
export function startBatchProcessing(priority: SignalPriority): void {
  processingBatch = true;
  currentBatchPriority = priority;
  preemptionFlag = false;
}

/** Signal that batch processing has ended. */
export function endBatchProcessing(): void {
  processingBatch = false;
  currentBatchPriority = null;
  preemptionFlag = false;
}

/** Check if a preemption has been requested. */
export function shouldPreempt(): boolean {
  return preemptionFlag;
}

/** Get the current priority being processed. */
export function getCurrentBatchPriority(): SignalPriority | null {
  return currentBatchPriority;
}

/** Get total queue depth across all priorities. */
export function getTotalQueueDepth(): number {
  return Object.values(queues).reduce((sum, q) => sum + q.length, 0);
}

/** Peek at next signal without removing. */
export function peekNext(): PrioritizedSignal | null {
  for (const p of ['critical', 'high', 'normal', 'low'] as SignalPriority[]) {
    if (queues[p].length > 0) return queues[p][0];
  }
  return null;
}

/** Purge expired signals from all queues. */
export function purgeExpired(): number {
  const now = Date.now();
  let purged = 0;

  for (const p of ['critical', 'high', 'normal', 'low'] as SignalPriority[]) {
    const before = queues[p].length;
    queues[p] = queues[p].filter(s => s.expiresAt >= now);
    purged += before - queues[p].length;
  }

  stats.totalExpired += purged;
  updateQueueDepths();
  return purged;
}

function updateQueueDepths(): void {
  for (const p of ['critical', 'high', 'normal', 'low'] as SignalPriority[]) {
    stats.queueDepth[p] = queues[p].length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════

export function getPreemptionStats(): PreemptionStats {
  updateQueueDepths();
  return { ...stats, queueDepth: { ...stats.queueDepth }, avgDeliveryMs: { ...stats.avgDeliveryMs } };
}

export function resetPreemptionState(): void {
  for (const p of ['critical', 'high', 'normal', 'low'] as SignalPriority[]) {
    queues[p].length = 0;
    deliveryEMA[p] = { avg: 0, count: 0 };
  }
  stats.totalEnqueued = 0;
  stats.totalPreemptions = 0;
  stats.totalExpired = 0;
  stats.lastPreemptionAt = null;
  updateQueueDepths();
  Object.assign(stats.avgDeliveryMs, { critical: 0, high: 0, normal: 0, low: 0 });
}
