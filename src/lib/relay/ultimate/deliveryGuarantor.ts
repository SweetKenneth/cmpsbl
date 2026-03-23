/**
 * RELAY Ultimate — Delivery Guarantor
 * At-least-once delivery with idempotency key dedup (5,000-entry LRU).
 * Exponential backoff retry. Dead-letter queue with forensic metadata.
 */

export interface GuaranteedDelivery {
  id: string;
  destination: string;
  payload: unknown;
  idempotencyKey: string;
  status: 'pending' | 'delivered' | 'retrying' | 'dead_letter';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: number;
  createdAt: number;
  deliveredAt?: number;
  lastError?: string;
}

export interface DLQEntry {
  delivery: GuaranteedDelivery;
  exhaustedAt: number;
  forensicData: { totalAttempts: number; firstAttempt: number; lastError: string; retryHistory: number[] };
}

export interface DeliveryGuarantorStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  deliveredCount: number;
  dlqSize: number;
  deduplicated: number;
  avgAttempts: number;
}

const MAX_DELIVERIES = 1000;
const MAX_DLQ = 300;
const DEDUP_CACHE_SIZE = 5000;
const BASE_DELAY = 1000;
const MAX_DELAY = 60000;
const MAX_ATTEMPTS = 5;

const deliveries = new Map<string, GuaranteedDelivery>();
const dlq: DLQEntry[] = [];
const dedupCache = new Map<string, number>(); // key → timestamp
let dedupCount = 0;

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function guaranteedDispatch(
  destination: string, payload: unknown, idempotencyKey?: string
): GuaranteedDelivery | null {
  const key = idempotencyKey ?? fnvHash(`${destination}:${JSON.stringify(payload)}`);

  // Dedup check
  if (dedupCache.has(key)) {
    dedupCount++;
    return null; // Already processed
  }

  // LRU eviction
  if (dedupCache.size >= DEDUP_CACHE_SIZE) {
    const oldest = [...dedupCache.entries()].sort((a, b) => a[1] - b[1])[0];
    if (oldest) dedupCache.delete(oldest[0]);
  }
  dedupCache.set(key, Date.now());

  const delivery: GuaranteedDelivery = {
    id: `gd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    destination, payload, idempotencyKey: key,
    status: 'pending', attempts: 0, maxAttempts: MAX_ATTEMPTS,
    createdAt: Date.now(),
  };

  if (deliveries.size >= MAX_DELIVERIES) {
    const oldest = [...deliveries.values()]
      .filter(d => d.status === 'delivered')
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) deliveries.delete(oldest.id);
  }
  deliveries.set(delivery.id, delivery);
  return delivery;
}

export function markDelivered(deliveryId: string): boolean {
  const d = deliveries.get(deliveryId);
  if (!d || d.status === 'delivered') return false;
  d.status = 'delivered';
  d.deliveredAt = Date.now();
  d.attempts++;
  return true;
}

export function retryDelivery(deliveryId: string, error: string): GuaranteedDelivery | null {
  const d = deliveries.get(deliveryId);
  if (!d || d.status === 'delivered' || d.status === 'dead_letter') return null;

  d.attempts++;
  d.lastError = error;

  if (d.attempts >= d.maxAttempts) {
    d.status = 'dead_letter';
    const entry: DLQEntry = {
      delivery: { ...d },
      exhaustedAt: Date.now(),
      forensicData: {
        totalAttempts: d.attempts,
        firstAttempt: d.createdAt,
        lastError: error,
        retryHistory: [],
      },
    };
    if (dlq.length >= MAX_DLQ) dlq.shift();
    dlq.push(entry);
    return d;
  }

  const delay = Math.min(BASE_DELAY * Math.pow(2, d.attempts), MAX_DELAY);
  const jitter = delay * 0.25 * Math.random();
  d.status = 'retrying';
  d.nextRetryAt = Date.now() + delay + jitter;
  return d;
}

export function getDLQ(): DLQEntry[] { return [...dlq]; }

export function replayFromDLQ(deliveryId: string): GuaranteedDelivery | null {
  const idx = dlq.findIndex(e => e.delivery.id === deliveryId);
  if (idx === -1) return null;
  const entry = dlq.splice(idx, 1)[0];
  const newDelivery: GuaranteedDelivery = {
    ...entry.delivery,
    id: `gd-replay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'pending', attempts: 0, createdAt: Date.now(),
    lastError: undefined, deliveredAt: undefined, nextRetryAt: undefined,
  };
  deliveries.set(newDelivery.id, newDelivery);
  return newDelivery;
}

export function getDeliveryGuarantorStats(): DeliveryGuarantorStats {
  const all = [...deliveries.values()];
  const delivered = all.filter(d => d.status === 'delivered');
  return {
    totalDeliveries: all.length,
    pendingDeliveries: all.filter(d => d.status === 'pending' || d.status === 'retrying').length,
    deliveredCount: delivered.length,
    dlqSize: dlq.length,
    deduplicated: dedupCount,
    avgAttempts: delivered.length > 0 ? delivered.reduce((s, d) => s + d.attempts, 0) / delivered.length : 0,
  };
}

export function resetDeliveryGuarantorState(): void { deliveries.clear(); dlq.length = 0; dedupCache.clear(); dedupCount = 0; }
