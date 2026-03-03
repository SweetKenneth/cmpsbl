/**
 * Cache System — Unit Tests
 * Covers: CacheManager, CacheTTL, withCache
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cacheManager, CacheTTL, withCache } from '../cache';

describe('CacheManager', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
  });

  it('stores and retrieves values', () => {
    cacheManager.set('key1', { data: 42 }, 10000);
    expect(cacheManager.get('key1')).toEqual({ data: 42 });
  });

  it('returns null for missing keys', () => {
    expect(cacheManager.get('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    cacheManager.set('temp', 'value', 100);
    expect(cacheManager.get('temp')).toBe('value');
    vi.advanceTimersByTime(150);
    expect(cacheManager.get('temp')).toBeNull();
    vi.useRealTimers();
  });

  it('invalidates by key', () => {
    cacheManager.set('a', 1, 10000);
    cacheManager.set('b', 2, 10000);
    cacheManager.invalidate('a');
    expect(cacheManager.get('a')).toBeNull();
    expect(cacheManager.get('b')).toBe(2);
  });

  it('invalidates by prefix', () => {
    cacheManager.set('module:a', 1, 10000);
    cacheManager.set('module:b', 2, 10000);
    cacheManager.set('other:c', 3, 10000);
    cacheManager.invalidatePrefix('module:');
    expect(cacheManager.get('module:a')).toBeNull();
    expect(cacheManager.get('module:b')).toBeNull();
    expect(cacheManager.get('other:c')).toBe(3);
  });

  it('invalidates all', () => {
    cacheManager.set('x', 1, 10000);
    cacheManager.set('y', 2, 10000);
    cacheManager.invalidateAll();
    expect(cacheManager.get('x')).toBeNull();
    expect(cacheManager.get('y')).toBeNull();
  });

  it('reports stats', () => {
    cacheManager.set('s1', 'v1', 10000);
    cacheManager.set('s2', 'v2', 10000);
    const stats = cacheManager.getStats();
    expect(stats.size).toBe(2);
    expect(stats.keys).toContain('s1');
    expect(stats.keys).toContain('s2');
  });
});

describe('CacheTTL', () => {
  it('has expected preset values', () => {
    expect(CacheTTL.SHORT).toBe(5000);
    expect(CacheTTL.MEDIUM).toBe(30000);
    expect(CacheTTL.LONG).toBe(120000);
    expect(CacheTTL.EXTENDED).toBe(300000);
  });
});

describe('withCache', () => {
  beforeEach(() => {
    cacheManager.invalidateAll();
  });

  it('caches function results', async () => {
    let callCount = 0;
    const fn = async (x: number) => { callCount++; return x * 2; };
    const cached = withCache(fn, (x) => `double:${x}`, 10000);

    expect(await cached(5)).toBe(10);
    expect(await cached(5)).toBe(10);
    expect(callCount).toBe(1); // Only called once, second hit cache
  });

  it('uses different keys for different args', async () => {
    let callCount = 0;
    const fn = async (x: number) => { callCount++; return x * 2; };
    const cached = withCache(fn, (x) => `double:${x}`, 10000);

    expect(await cached(5)).toBe(10);
    expect(await cached(10)).toBe(20);
    expect(callCount).toBe(2);
  });
});
