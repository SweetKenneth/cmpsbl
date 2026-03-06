/**
 * Module Bus + Event Stream — E2E Unit Tests
 * Validates pub/sub delivery, ring buffer, filtering, circuit breaker,
 * health scoring, healing, and stream lifecycle.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase before imports
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => {
      const chain: any = {
        select: () => chain,
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => chain,
        delete: () => chain,
        upsert: () => chain,
        eq: () => chain,
        order: () => chain,
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      };
      return chain;
    },
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
  },
}));

// Mock control-plane adapters (used by eventStream persistence)
vi.mock('@/lib/substrate/control-plane/adapters/queueStateAdapter', () => ({
  cpPut: vi.fn().mockResolvedValue(undefined),
  cpDelete: vi.fn().mockResolvedValue(undefined),
  cpGet: vi.fn().mockResolvedValue(null),
  recheckHealth: vi.fn().mockResolvedValue({ ok: true }),
  getStorageMode: vi.fn().mockReturnValue('memory'),
}));

import {
  publish,
  subscribe,
  unsubscribe,
  acknowledge,
  getRecentSignals,
  getBusStats,
  cleanupExpired,
  type ModuleSignal,
} from '@/lib/substrate/module-bus/index';

import {
  initEventStream,
  resetEventStream,
  getRecentStreamEvents,
  getStreamByType,
  getStreamByModule,
  getStreamStats,
  clearStream,
  setStreamPersistence,
  isStreamPersistent,
  getStreamHealth,
  getStreamBreakerState,
  healStream,
} from '@/lib/substrate/module-bus/eventStream';


// ═══════════════════════════════════════════════════════════════
// MODULE BUS CORE
// ═══════════════════════════════════════════════════════════════

describe('Module Bus — Core', () => {
  it('should publish and deliver to wildcard subscriber', async () => {
    const received: ModuleSignal[] = [];
    const subId = subscribe('system', '*', (sig) => { received.push(sig); });

    await publish('brain', 'test.ping', { value: 42 });

    expect(received.length).toBe(1);
    expect(received[0].from).toBe('brain');
    expect(received[0].payload.value).toBe(42);

    unsubscribe(subId);
  });

  it('should deliver to type-specific subscriber', async () => {
    const received: ModuleSignal[] = [];
    const subId = subscribe('defense', 'threat.detected', (sig) => { received.push(sig); });

    await publish('brain', 'threat.detected', { level: 'high' });
    await publish('brain', 'other.event', { level: 'low' });

    expect(received.length).toBe(1);
    expect(received[0].type).toBe('threat.detected');

    unsubscribe(subId);
  });

  it('should acknowledge signals', async () => {
    const received: ModuleSignal[] = [];
    const subId = subscribe('system', '*', (sig) => { received.push(sig); });

    const sig = await publish('nexus', 'test.ack', {});
    expect(sig.acknowledged).toBe(false);

    acknowledge(sig.id);

    const recent = getRecentSignals({ type: 'test.ack' });
    const found = recent.find(s => s.id === sig.id);
    expect(found?.acknowledged).toBe(true);

    unsubscribe(subId);
  });

  it('should unsubscribe correctly', async () => {
    const received: ModuleSignal[] = [];
    const subId = subscribe('system', '*', (sig) => { received.push(sig); });

    await publish('brain', 'before.unsub', {});
    expect(received.length).toBeGreaterThanOrEqual(1);

    const countBefore = received.length;
    unsubscribe(subId);

    await publish('brain', 'after.unsub', {});
    expect(received.length).toBe(countBefore);
  });

  it('should report bus stats', async () => {
    const stats = getBusStats();
    expect(stats).toHaveProperty('total_signals');
    expect(stats).toHaveProperty('active_subscriptions');
    expect(stats).toHaveProperty('signals_by_type');
    expect(stats).toHaveProperty('unacknowledged');
  });

  it('should cleanup expired signals', async () => {
    await publish('brain', 'expire.test', {}, { ttl_ms: 1 });
    await new Promise(r => setTimeout(r, 5));

    const cleaned = cleanupExpired();
    expect(cleaned).toBeGreaterThanOrEqual(1);
  });
});


// ═══════════════════════════════════════════════════════════════
// EVENT STREAM
// ═══════════════════════════════════════════════════════════════

describe('Event Stream', () => {
  beforeEach(() => {
    resetEventStream();
  });

  it('should initialize idempotently', () => {
    initEventStream();
    initEventStream(); // second call should be no-op
    const stats = getStreamStats();
    expect(stats.initialized).toBe(true);
  });

  it('should capture published signals into the stream', async () => {
    initEventStream();

    await publish('brain', 'stream.test', { data: 'hello' });

    const events = getRecentStreamEvents(10);
    expect(events.length).toBeGreaterThanOrEqual(1);

    const last = events[events.length - 1];
    expect(last.signal.from).toBe('brain');
    expect(last.signal.type).toBe('stream.test');
    expect(last.captured_at).toBeTruthy();
  });

  it('should filter by signal type', async () => {
    initEventStream();

    await publish('brain', 'type.a', {});
    await publish('nexus', 'type.b', {});
    await publish('vision', 'type.a', {});

    const typeA = getStreamByType('type.a');
    expect(typeA.every(e => e.signal.type === 'type.a')).toBe(true);
  });

  it('should filter by module', async () => {
    initEventStream();

    await publish('brain', 'mod.test', {});
    await publish('nexus', 'mod.test', {});

    const brainOnly = getStreamByModule('brain');
    expect(brainOnly.every(e => e.signal.from === 'brain')).toBe(true);
  });

  it('should clear the stream', async () => {
    initEventStream();

    await publish('brain', 'clear.test', {});
    expect(getStreamStats().buffer_size).toBeGreaterThan(0);

    const cleared = clearStream();
    expect(cleared).toBeGreaterThan(0);
    expect(getStreamStats().buffer_size).toBe(0);
  });

  it('should toggle persistence', () => {
    expect(isStreamPersistent()).toBe(false);
    setStreamPersistence(true);
    expect(isStreamPersistent()).toBe(true);
    setStreamPersistence(false);
    expect(isStreamPersistent()).toBe(false);
  });

  it('should report accurate stats with health and breaker', async () => {
    initEventStream();

    await publish('brain', 'stats.test', {});

    const stats = getStreamStats();
    expect(stats.initialized).toBe(true);
    expect(stats.total_captured).toBeGreaterThan(0);
    expect(stats.buffer_size).toBeGreaterThan(0);
    expect(stats.max_size).toBe(500);
    expect(stats.newest_entry).toBeTruthy();
    // New: health and breaker in stats
    expect(stats.health).toBeDefined();
    expect(stats.health.score).toBeGreaterThanOrEqual(0);
    expect(stats.health.status).toBeTruthy();
    expect(stats.breaker).toBeDefined();
    expect(stats.breaker.state).toBe('closed');
  });
});


// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER & HEALTH
// ═══════════════════════════════════════════════════════════════

describe('Event Stream — Circuit Breaker & Health', () => {
  beforeEach(() => {
    resetEventStream();
  });

  it('should start with healthy state', () => {
    const health = getStreamHealth();
    expect(health.score).toBe(100);
    expect(health.status).toBe('healthy');
    expect(health.droppedSignals).toBe(0);
    expect(health.lastError).toBeNull();
  });

  it('should start with closed breaker', () => {
    const breaker = getStreamBreakerState();
    expect(breaker.state).toBe('closed');
    expect(breaker.failures).toBe(0);
    expect(breaker.totalFailures).toBe(0);
  });

  it('should heal and restore health', () => {
    const result = healStream(false);
    expect(result.ok).toBe(true);
    expect(result.newScore).toBeGreaterThanOrEqual(80);
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('should force-heal to 100', () => {
    const result = healStream(true);
    expect(result.ok).toBe(true);
    expect(result.newScore).toBe(100);
    expect(result.actions).toContain('Health score force-restored to 100');
  });

  it('should reinit stream if not initialized during heal', () => {
    // Don't init first
    const result = healStream(false);
    expect(result.actions.some(a => a.includes('re-initialized'))).toBe(true);
    // Should now be initialized
    const stats = getStreamStats();
    expect(stats.initialized).toBe(true);
  });

  it('should reset breaker on force heal', () => {
    const result = healStream(true);
    expect(result.breakerReset).toBe(true);
    const breaker = getStreamBreakerState();
    expect(breaker.state).toBe('closed');
  });

  it('should include health and breaker in full reset', () => {
    resetEventStream();
    const health = getStreamHealth();
    const breaker = getStreamBreakerState();
    expect(health.score).toBe(100);
    expect(health.droppedSignals).toBe(0);
    expect(breaker.state).toBe('closed');
    expect(breaker.totalFailures).toBe(0);
    expect(breaker.totalSuccesses).toBe(0);
  });
});
