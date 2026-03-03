/**
 * Rate Limiting — Unit Tests
 * Covers: RateLimiter, RateLimitPresets, enforceRateLimit
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter, RateLimitPresets, enforceRateLimit } from '../rateLimit';

describe('RateLimiter', () => {
  beforeEach(() => {
    rateLimiter.reset('test-key');
  });

  it('allows requests within limit', () => {
    const config = { maxRequests: 3, windowMs: 60000 };
    expect(rateLimiter.check('test-key', config).allowed).toBe(true);
    expect(rateLimiter.check('test-key', config).allowed).toBe(true);
    expect(rateLimiter.check('test-key', config).allowed).toBe(true);
  });

  it('blocks requests over limit', () => {
    const config = { maxRequests: 2, windowMs: 60000 };
    rateLimiter.check('test-key', config);
    rateLimiter.check('test-key', config);
    const result = rateLimiter.check('test-key', config);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('isolates different keys', () => {
    const config = { maxRequests: 1, windowMs: 60000 };
    rateLimiter.check('key-a', config);
    expect(rateLimiter.check('key-a', config).allowed).toBe(false);
    expect(rateLimiter.check('key-b', config).allowed).toBe(true);
    rateLimiter.reset('key-a');
    rateLimiter.reset('key-b');
  });

  it('resets key', () => {
    const config = { maxRequests: 1, windowMs: 60000 };
    rateLimiter.check('test-key', config);
    expect(rateLimiter.check('test-key', config).allowed).toBe(false);
    rateLimiter.reset('test-key');
    expect(rateLimiter.check('test-key', config).allowed).toBe(true);
  });

  it('returns stats', () => {
    const config = { maxRequests: 10, windowMs: 60000 };
    rateLimiter.check('test-key', config);
    rateLimiter.check('test-key', config);
    const stats = rateLimiter.getStats('test-key');
    expect(stats).toBeDefined();
    expect(stats!.requestsInWindow).toBe(2);
    expect(stats!.blocked).toBe(false);
  });

  it('returns null stats for unknown key', () => {
    expect(rateLimiter.getStats('unknown')).toBeNull();
  });
});

describe('RateLimitPresets', () => {
  it('defines expected presets', () => {
    expect(RateLimitPresets.GOVERNOR.maxRequests).toBe(10);
    expect(RateLimitPresets.SENSITIVE.maxRequests).toBe(3);
    expect(RateLimitPresets.API.maxRequests).toBe(60);
    expect(RateLimitPresets.TERMINAL.maxRequests).toBe(30);
  });
});

describe('enforceRateLimit', () => {
  beforeEach(() => {
    rateLimiter.reset('enforce-test');
  });

  it('allows within limit', () => {
    expect(() => enforceRateLimit('enforce-test', { maxRequests: 5, windowMs: 60000 })).not.toThrow();
  });

  it('throws when rate limited', () => {
    const config = { maxRequests: 1, windowMs: 60000 };
    enforceRateLimit('enforce-test', config);
    expect(() => enforceRateLimit('enforce-test', config)).toThrow('Rate limited');
  });
});
