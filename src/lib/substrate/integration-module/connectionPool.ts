/**
 * INTEGRATION Module — Connection Pool Optimizer
 * v11.0.0 "Conduit"
 *
 * Dynamic pool sizing based on load signals, health, and concurrency.
 * Prevents pool exhaustion and stale connections.
 */

import { boundArray, clampNumber } from '@/lib/system/hardening';

// ── Types ────────────────────────────────────────────────────────

export interface PoolSlot {
  id: string;
  adapterId: string;
  status: 'idle' | 'active' | 'draining' | 'failed';
  acquiredAt: string | null;
  lastUsedAt: string;
  requestCount: number;
  errorCount: number;
  avgResponseMs: number;
}

export interface PoolConfig {
  adapterId: string;
  minSlots: number;
  maxSlots: number;
  idleTimeoutMs: number;
  maxLifetimeMs: number;
  acquireTimeoutMs: number;
  healthCheckIntervalMs: number;
}

export interface PoolMetrics {
  adapterId: string;
  totalSlots: number;
  activeSlots: number;
  idleSlots: number;
  failedSlots: number;
  waitingRequests: number;
  avgWaitMs: number;
  avgResponseMs: number;
  utilizationPct: number;
  evictions: number;
  creations: number;
}

export interface PoolScaleEvent {
  adapterId: string;
  timestamp: string;
  action: 'scale_up' | 'scale_down' | 'evict_stale' | 'replace_failed';
  fromSize: number;
  toSize: number;
  reason: string;
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_POOL_CONFIG: Omit<PoolConfig, 'adapterId'> = {
  minSlots: 2,
  maxSlots: 20,
  idleTimeoutMs: 300_000, // 5 min
  maxLifetimeMs: 3_600_000, // 1 hour
  acquireTimeoutMs: 10_000,
  healthCheckIntervalMs: 60_000,
};

const MAX_SCALE_EVENTS = 200;
const SCALE_UP_THRESHOLD = 0.8; // 80% utilization
const SCALE_DOWN_THRESHOLD = 0.3; // 30% utilization
const SCALE_COOLDOWN_MS = 30_000;

// ── In-Memory State ──────────────────────────────────────────────

const pools = new Map<string, PoolSlot[]>();
const configs = new Map<string, PoolConfig>();
const metrics = new Map<string, PoolMetrics>();
const scaleEvents: PoolScaleEvent[] = [];
const lastScaleTime = new Map<string, number>();
const waitQueues = new Map<string, number>();

// ── Pool Lifecycle ───────────────────────────────────────────────

export function createPool(
  adapterId: string,
  overrides: Partial<Omit<PoolConfig, 'adapterId'>> = {}
): { success: boolean; config: PoolConfig; error?: string } {
  if (pools.has(adapterId)) {
    return { success: false, config: configs.get(adapterId)!, error: 'Pool already exists' };
  }

  const config: PoolConfig = {
    adapterId,
    ...DEFAULT_POOL_CONFIG,
    ...overrides,
    minSlots: clampNumber(overrides.minSlots, 1, 50, DEFAULT_POOL_CONFIG.minSlots),
    maxSlots: clampNumber(overrides.maxSlots, 1, 100, DEFAULT_POOL_CONFIG.maxSlots),
  };
  configs.set(adapterId, config);

  // Create initial slots
  const slots: PoolSlot[] = [];
  for (let i = 0; i < config.minSlots; i++) {
    slots.push(createSlot(adapterId, i));
  }
  pools.set(adapterId, slots);
  waitQueues.set(adapterId, 0);
  updateMetrics(adapterId);

  return { success: true, config };
}

export function destroyPool(adapterId: string): { success: boolean; error?: string } {
  if (!pools.has(adapterId)) return { success: false, error: 'Pool not found' };
  pools.delete(adapterId);
  configs.delete(adapterId);
  metrics.delete(adapterId);
  waitQueues.delete(adapterId);
  return { success: true };
}

// ── Slot Management ──────────────────────────────────────────────

function createSlot(adapterId: string, index: number): PoolSlot {
  return {
    id: `${adapterId}_slot_${index}_${Date.now()}`,
    adapterId,
    status: 'idle',
    acquiredAt: null,
    lastUsedAt: new Date().toISOString(),
    requestCount: 0,
    errorCount: 0,
    avgResponseMs: 0,
  };
}

export function acquireSlot(adapterId: string): { slot: PoolSlot | null; waitPosition?: number } {
  const slots = pools.get(adapterId);
  if (!slots) return { slot: null };

  const idle = slots.find(s => s.status === 'idle');
  if (idle) {
    idle.status = 'active';
    idle.acquiredAt = new Date().toISOString();
    updateMetrics(adapterId);
    return { slot: idle };
  }

  // No idle slots — check if we can scale up
  const config = configs.get(adapterId)!;
  if (slots.length < config.maxSlots) {
    const newSlot = createSlot(adapterId, slots.length);
    newSlot.status = 'active';
    newSlot.acquiredAt = new Date().toISOString();
    slots.push(newSlot);
    recordScaleEvent(adapterId, 'scale_up', slots.length - 1, slots.length, 'No idle slots available');
    updateMetrics(adapterId);
    return { slot: newSlot };
  }

  // Pool exhausted
  const waiting = (waitQueues.get(adapterId) ?? 0) + 1;
  waitQueues.set(adapterId, waiting);
  updateMetrics(adapterId);
  return { slot: null, waitPosition: waiting };
}

export function releaseSlot(adapterId: string, slotId: string, responseMs: number, hadError = false): void {
  const slots = pools.get(adapterId);
  if (!slots) return;

  const slot = slots.find(s => s.id === slotId);
  if (!slot) return;

  slot.status = 'idle';
  slot.acquiredAt = null;
  slot.lastUsedAt = new Date().toISOString();
  slot.requestCount++;
  if (hadError) slot.errorCount++;
  slot.avgResponseMs = slot.avgResponseMs === 0
    ? responseMs
    : slot.avgResponseMs * 0.8 + responseMs * 0.2;

  // Decrement wait queue
  const waiting = waitQueues.get(adapterId) ?? 0;
  if (waiting > 0) waitQueues.set(adapterId, waiting - 1);

  updateMetrics(adapterId);
}

// ── Auto-Scaling ─────────────────────────────────────────────────

export function evaluatePoolScaling(adapterId: string): PoolScaleEvent | null {
  const slots = pools.get(adapterId);
  const config = configs.get(adapterId);
  if (!slots || !config) return null;

  const now = Date.now();
  const lastScale = lastScaleTime.get(adapterId) ?? 0;
  if (now - lastScale < SCALE_COOLDOWN_MS) return null;

  const active = slots.filter(s => s.status === 'active').length;
  const utilization = slots.length > 0 ? active / slots.length : 0;

  // Scale up
  if (utilization >= SCALE_UP_THRESHOLD && slots.length < config.maxSlots) {
    const newSize = Math.min(slots.length + Math.ceil(slots.length * 0.25), config.maxSlots);
    const toAdd = newSize - slots.length;
    for (let i = 0; i < toAdd; i++) {
      slots.push(createSlot(adapterId, slots.length));
    }
    const event = recordScaleEvent(adapterId, 'scale_up', slots.length - toAdd, slots.length,
      `Utilization ${(utilization * 100).toFixed(0)}% ≥ ${SCALE_UP_THRESHOLD * 100}%`);
    lastScaleTime.set(adapterId, now);
    updateMetrics(adapterId);
    return event;
  }

  // Scale down
  if (utilization <= SCALE_DOWN_THRESHOLD && slots.length > config.minSlots) {
    const idleSlots = slots.filter(s => s.status === 'idle');
    const toRemove = Math.min(
      idleSlots.length,
      slots.length - config.minSlots,
      Math.ceil(slots.length * 0.25)
    );
    if (toRemove > 0) {
      const oldSize = slots.length;
      for (let i = 0; i < toRemove; i++) {
        const idx = slots.findIndex(s => s.status === 'idle');
        if (idx >= 0) slots.splice(idx, 1);
      }
      const event = recordScaleEvent(adapterId, 'scale_down', oldSize, slots.length,
        `Utilization ${(utilization * 100).toFixed(0)}% ≤ ${SCALE_DOWN_THRESHOLD * 100}%`);
      lastScaleTime.set(adapterId, now);
      updateMetrics(adapterId);
      return event;
    }
  }

  // Evict stale
  const staleThreshold = now - config.idleTimeoutMs;
  const stale = slots.filter(s =>
    s.status === 'idle' &&
    new Date(s.lastUsedAt).getTime() < staleThreshold &&
    slots.length > config.minSlots
  );
  if (stale.length > 0) {
    const oldSize = slots.length;
    for (const s of stale) {
      const idx = slots.indexOf(s);
      if (idx >= 0 && slots.length > config.minSlots) slots.splice(idx, 1);
    }
    if (slots.length !== oldSize) {
      const event = recordScaleEvent(adapterId, 'evict_stale', oldSize, slots.length,
        `${oldSize - slots.length} stale slots evicted`);
      updateMetrics(adapterId);
      return event;
    }
  }

  return null;
}

// ── Metrics ──────────────────────────────────────────────────────

function updateMetrics(adapterId: string): void {
  const slots = pools.get(adapterId);
  if (!slots) return;

  const active = slots.filter(s => s.status === 'active');
  const idle = slots.filter(s => s.status === 'idle');
  const failed = slots.filter(s => s.status === 'failed');
  const allAvg = slots.length > 0
    ? slots.reduce((sum, s) => sum + s.avgResponseMs, 0) / slots.length
    : 0;

  const existing = metrics.get(adapterId);
  metrics.set(adapterId, {
    adapterId,
    totalSlots: slots.length,
    activeSlots: active.length,
    idleSlots: idle.length,
    failedSlots: failed.length,
    waitingRequests: waitQueues.get(adapterId) ?? 0,
    avgWaitMs: existing?.avgWaitMs ?? 0,
    avgResponseMs: Math.round(allAvg),
    utilizationPct: slots.length > 0 ? Math.round((active.length / slots.length) * 100) : 0,
    evictions: existing?.evictions ?? 0,
    creations: existing?.creations ?? 0,
  });
}

export function getPoolMetrics(adapterId: string): PoolMetrics | null {
  return metrics.get(adapterId) ?? null;
}

export function getAllPoolMetrics(): PoolMetrics[] {
  return Array.from(metrics.values());
}

// ── Scale Event Log ──────────────────────────────────────────────

function recordScaleEvent(
  adapterId: string,
  action: PoolScaleEvent['action'],
  fromSize: number,
  toSize: number,
  reason: string
): PoolScaleEvent {
  const event: PoolScaleEvent = {
    adapterId,
    timestamp: new Date().toISOString(),
    action,
    fromSize,
    toSize,
    reason,
  };
  scaleEvents.push(event);
  if (scaleEvents.length > MAX_SCALE_EVENTS) {
    scaleEvents.splice(0, scaleEvents.length - MAX_SCALE_EVENTS);
  }
  return event;
}

export function getScaleEvents(adapterId?: string): PoolScaleEvent[] {
  if (adapterId) return scaleEvents.filter(e => e.adapterId === adapterId);
  return [...scaleEvents];
}

// ── Reset (testing) ──────────────────────────────────────────────

export function _resetPools(): void {
  pools.clear();
  configs.clear();
  metrics.clear();
  scaleEvents.length = 0;
  lastScaleTime.clear();
  waitQueues.clear();
}
