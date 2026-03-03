/**
 * Hardening Utilities — Comprehensive Unit Tests
 * Covers: withTimeout, clampNumber, validateStringInput, safeParse,
 *         boundArray, safeExecute, deepFreeze, sanitizeText, fnv1aHash, debounce
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withTimeout,
  clampNumber,
  validateStringInput,
  safeParse,
  boundArray,
  safeExecute,
  deepFreeze,
  sanitizeText,
  fnv1aHash,
  debounce,
} from '../hardening';

// ── clampNumber ──────────────────────────────────────────
describe('clampNumber', () => {
  it('clamps value within range', () => {
    expect(clampNumber(50, 0, 100, 0)).toBe(50);
  });

  it('clamps below min', () => {
    expect(clampNumber(-10, 0, 100, 0)).toBe(0);
  });

  it('clamps above max', () => {
    expect(clampNumber(200, 0, 100, 0)).toBe(100);
  });

  it('returns default for NaN', () => {
    expect(clampNumber(NaN, 0, 100, 42)).toBe(42);
  });

  it('returns default for Infinity', () => {
    expect(clampNumber(Infinity, 0, 100, 42)).toBe(42);
  });

  it('returns default for non-number', () => {
    expect(clampNumber('hello', 0, 100, 42)).toBe(42);
    expect(clampNumber(null, 0, 100, 42)).toBe(42);
    expect(clampNumber(undefined, 0, 100, 42)).toBe(42);
  });

  it('handles edge case: min equals max', () => {
    expect(clampNumber(50, 10, 10, 0)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clampNumber(-5, -10, -1, 0)).toBe(-5);
  });

  it('handles boundary values', () => {
    expect(clampNumber(0, 0, 100, 50)).toBe(0);
    expect(clampNumber(100, 0, 100, 50)).toBe(100);
  });
});

// ── validateStringInput ──────────────────────────────────
describe('validateStringInput', () => {
  it('returns valid string', () => {
    expect(validateStringInput('hello')).toBe('hello');
  });

  it('returns null for non-string', () => {
    expect(validateStringInput(42)).toBeNull();
    expect(validateStringInput(null)).toBeNull();
    expect(validateStringInput(undefined)).toBeNull();
    expect(validateStringInput({})).toBeNull();
  });

  it('rejects strings exceeding maxLength', () => {
    expect(validateStringInput('abc', { maxLength: 2 })).toBeNull();
  });

  it('rejects strings below minLength', () => {
    expect(validateStringInput('a', { minLength: 2 })).toBeNull();
  });

  it('rejects strings not matching pattern', () => {
    expect(validateStringInput('abc123', { pattern: /^[a-z]+$/ })).toBeNull();
  });

  it('accepts strings matching pattern', () => {
    expect(validateStringInput('abc', { pattern: /^[a-z]+$/ })).toBe('abc');
  });

  it('handles empty string with default options', () => {
    expect(validateStringInput('')).toBe('');
  });

  it('rejects empty string with minLength', () => {
    expect(validateStringInput('', { minLength: 1 })).toBeNull();
  });
});

// ── safeParse ────────────────────────────────────────────
describe('safeParse', () => {
  it('parses valid JSON', () => {
    expect(safeParse('{"a":1}')).toEqual({ a: 1 });
  });

  it('returns null for invalid JSON', () => {
    expect(safeParse('not json')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(safeParse(42 as unknown as string)).toBeNull();
  });

  it('returns null for oversized input', () => {
    const huge = 'x'.repeat(1_000_001);
    expect(safeParse(huge)).toBeNull();
  });

  it('respects custom maxLength', () => {
    expect(safeParse('{"a":1}', 3)).toBeNull();
  });

  it('parses arrays', () => {
    expect(safeParse('[1,2,3]')).toEqual([1, 2, 3]);
  });

  it('parses primitives', () => {
    expect(safeParse('"hello"')).toBe('hello');
    expect(safeParse('42')).toBe(42);
    expect(safeParse('true')).toBe(true);
    expect(safeParse('null')).toBeNull();
  });
});

// ── boundArray ───────────────────────────────────────────
describe('boundArray', () => {
  it('returns array unchanged when under limit', () => {
    const arr = [1, 2, 3];
    expect(boundArray(arr, 5)).toBe(arr);
  });

  it('trims from front when over limit', () => {
    expect(boundArray([1, 2, 3, 4, 5], 3)).toEqual([3, 4, 5]);
  });

  it('returns exact size when at limit', () => {
    const arr = [1, 2, 3];
    expect(boundArray(arr, 3)).toBe(arr);
  });

  it('handles empty array', () => {
    expect(boundArray([], 5)).toEqual([]);
  });

  it('handles maxSize of 1', () => {
    expect(boundArray([1, 2, 3], 1)).toEqual([3]);
  });
});

// ── withTimeout ──────────────────────────────────────────
describe('withTimeout', () => {
  it('resolves when operation completes before timeout', async () => {
    const result = await withTimeout(() => Promise.resolve(42), 1000, 'test');
    expect(result).toBe(42);
  });

  it('rejects when operation exceeds timeout', async () => {
    await expect(
      withTimeout(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
        50,
        'slow-op'
      )
    ).rejects.toThrow('[TIMEOUT] slow-op exceeded 50ms');
  });

  it('throws for invalid timeout value', async () => {
    await expect(
      withTimeout(() => Promise.resolve(), 0, 'test')
    ).rejects.toThrow('[withTimeout] Invalid timeout');

    await expect(
      withTimeout(() => Promise.resolve(), -1, 'test')
    ).rejects.toThrow('[withTimeout] Invalid timeout');
  });

  it('propagates operation errors', async () => {
    await expect(
      withTimeout(
        () => Promise.reject(new Error('op failed')),
        1000,
        'test'
      )
    ).rejects.toThrow('op failed');
  });
});

// ── safeExecute ──────────────────────────────────────────
describe('safeExecute', () => {
  it('returns success with data', async () => {
    const result = await safeExecute(() => Promise.resolve(42));
    expect(result).toEqual({ success: true, data: 42 });
  });

  it('catches errors and returns failure', async () => {
    const result = await safeExecute(() => Promise.reject(new Error('fail')));
    expect(result.success).toBe(false);
    expect(result.error).toBe('fail');
    expect(result.data).toBeUndefined();
  });

  it('times out with custom timeout', async () => {
    const result = await safeExecute(
      () => new Promise((resolve) => setTimeout(resolve, 5000)),
      { timeoutMs: 50, label: 'slow' }
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('TIMEOUT');
  });

  it('handles non-Error throws', async () => {
    const result = await safeExecute(() => Promise.reject('string error'));
    expect(result.success).toBe(false);
    expect(result.error).toBe('string error');
  });
});

// ── deepFreeze ───────────────────────────────────────────
describe('deepFreeze', () => {
  it('freezes object at top level', () => {
    const obj = deepFreeze({ a: 1, b: 'hello' });
    expect(Object.isFrozen(obj)).toBe(true);
  });

  it('freezes nested objects recursively', () => {
    const obj = deepFreeze({ nested: { deep: { value: 42 } } });
    expect(Object.isFrozen(obj.nested)).toBe(true);
    expect(Object.isFrozen(obj.nested.deep)).toBe(true);
  });

  it('returns the same reference', () => {
    const original = { x: 1 };
    const frozen = deepFreeze(original);
    expect(frozen).toBe(original);
  });
});

// ── sanitizeText ─────────────────────────────────────────
describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
  });

  it('handles non-string input', () => {
    expect(sanitizeText(null as any)).toBe('');
    expect(sanitizeText(123 as any)).toBe('');
  });

  it('respects maxLength', () => {
    const long = 'a'.repeat(20000);
    expect(sanitizeText(long, 100).length).toBeLessThanOrEqual(100);
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});

// ── fnv1aHash ────────────────────────────────────────────
describe('fnv1aHash', () => {
  it('produces consistent hashes', () => {
    expect(fnv1aHash('hello')).toBe(fnv1aHash('hello'));
  });

  it('produces different hashes for different inputs', () => {
    expect(fnv1aHash('hello')).not.toBe(fnv1aHash('world'));
  });

  it('returns a number', () => {
    expect(typeof fnv1aHash('test')).toBe('number');
  });

  it('handles empty string', () => {
    expect(typeof fnv1aHash('')).toBe('number');
  });
});

// ── debounce ─────────────────────────────────────────────
describe('debounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('delays execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('supports leading edge', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100, true);
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
