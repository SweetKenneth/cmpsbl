/**
 * Idempotency Manager — Unit Tests
 * Gap Analysis P0: Core test suite scaffolding
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { withIdempotency, hasKey, clearKey, getIdempotencyStats } from '../idempotency';

describe('Idempotency Manager', () => {
  beforeEach(() => {
    // Clear all keys by clearing some test keys
    clearKey('test-1');
    clearKey('test-2');
    clearKey('test-fail');
  });

  it('executes function on first call', async () => {
    let callCount = 0;
    const result = await withIdempotency('test-1', async () => {
      callCount++;
      return 42;
    });
    expect(result).toBe(42);
    expect(callCount).toBe(1);
  });

  it('returns cached result on duplicate key', async () => {
    let callCount = 0;
    const executor = async () => { callCount++; return 'hello'; };
    
    await withIdempotency('test-2', executor);
    const result = await withIdempotency('test-2', executor);
    
    expect(result).toBe('hello');
    expect(callCount).toBe(1);
  });

  it('propagates errors on failure', async () => {
    await expect(
      withIdempotency('test-fail', async () => { throw new Error('boom'); })
    ).rejects.toThrow('boom');
  });

  it('hasKey returns true for existing keys', async () => {
    await withIdempotency('test-1', async () => 'ok');
    expect(hasKey('test-1')).toBe(true);
    expect(hasKey('nonexistent')).toBe(false);
  });

  it('clearKey removes cached results', async () => {
    await withIdempotency('test-1', async () => 'ok');
    clearKey('test-1');
    expect(hasKey('test-1')).toBe(false);
  });

  it('getIdempotencyStats returns correct counts', async () => {
    await withIdempotency('test-1', async () => 'a');
    await withIdempotency('test-2', async () => 'b');
    const stats = getIdempotencyStats();
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats.pending).toBe(0);
  });

  it('respects TTL expiry', async () => {
    await withIdempotency('test-1', async () => 'val', 1); // 1ms TTL
    await new Promise(r => setTimeout(r, 10)); // Wait for expiry
    
    let callCount = 0;
    await withIdempotency('test-1', async () => { callCount++; return 'new-val'; });
    expect(callCount).toBe(1); // Should re-execute
  });
});
