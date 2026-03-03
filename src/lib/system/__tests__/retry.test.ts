/**
 * Retry System — Unit Tests
 * Covers: withRetry, calculateDelay, createRetryableOperation, RetryPresets, sleep
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/system/trace', () => ({
  generateTraceId: () => 'test-trace',
}));

vi.mock('@/lib/defense/redact', () => ({
  redactSecrets: (obj: Record<string, unknown>) => obj,
}));

vi.mock('@/lib/system/log', () => ({
  log: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { withRetry, calculateDelay, createRetryableOperation, RetryPresets, sleep } from '../retry';

describe('calculateDelay', () => {
  it('increases exponentially', () => {
    const config = { maxAttempts: 5, baseDelayMs: 1000, maxDelayMs: 30000, jitterFactor: 0 };
    const d0 = calculateDelay(0, config);
    const d1 = calculateDelay(1, config);
    const d2 = calculateDelay(2, config);
    expect(d0).toBe(1000);
    expect(d1).toBe(2000);
    expect(d2).toBe(4000);
  });

  it('caps at maxDelay', () => {
    const config = { maxAttempts: 10, baseDelayMs: 1000, maxDelayMs: 5000, jitterFactor: 0 };
    expect(calculateDelay(10, config)).toBe(5000);
  });

  it('adds jitter within bounds', () => {
    const config = { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 30000, jitterFactor: 0.5 };
    const delays = Array.from({ length: 20 }, () => calculateDelay(0, config));
    // With jitter factor 0.5, delay should be 1000 ± 500
    for (const d of delays) {
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1500);
    }
  });
});

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const result = await withRetry(async () => 42, { maxAttempts: 3 });
    expect(result).toBe(42);
  });

  it('retries on transient failure then succeeds', async () => {
    let attempt = 0;
    const result = await withRetry(async () => {
      attempt++;
      if (attempt < 2) throw new Error('network failure');
      return 'ok';
    }, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, jitterFactor: 0 });
    expect(result).toBe('ok');
    expect(attempt).toBe(2);
  });

  it('throws after exhausting retries', async () => {
    await expect(
      withRetry(
        async () => { throw new Error('network failure'); },
        { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 50, jitterFactor: 0 }
      )
    ).rejects.toThrow();
  });

  it('does not retry non-retryable errors', async () => {
    let attempt = 0;
    await expect(
      withRetry(
        async () => { attempt++; throw new Error('validation error'); },
        { maxAttempts: 3, baseDelayMs: 10 }
      )
    ).rejects.toThrow();
    expect(attempt).toBe(1);
  });

  it('calls onRetry callback', async () => {
    const onRetry = vi.fn();
    let attempt = 0;
    await withRetry(
      async () => { attempt++; if (attempt < 2) throw new Error('network failure'); return 1; },
      { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, jitterFactor: 0, onRetry }
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('createRetryableOperation', () => {
  it('wraps a function with retry behavior', async () => {
    let calls = 0;
    const op = createRetryableOperation(
      async (x: number) => { calls++; if (calls < 2) throw new Error('network failure'); return x * 2; },
      { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 50, jitterFactor: 0 }
    );
    expect(await op(5)).toBe(10);
    expect(calls).toBe(2);
  });
});

describe('sleep', () => {
  it('resolves after delay', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });
});

describe('RetryPresets', () => {
  it('has expected presets', () => {
    expect(RetryPresets.fast.maxAttempts).toBe(2);
    expect(RetryPresets.standard.maxAttempts).toBe(3);
    expect(RetryPresets.patient.maxAttempts).toBe(5);
    expect(RetryPresets.critical.maxAttempts).toBe(10);
  });
});
