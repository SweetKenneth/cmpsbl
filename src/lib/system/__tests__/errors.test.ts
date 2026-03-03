/**
 * Error System — Unit Tests
 * Covers: createAppError, fromError, isAppError, isRetryableError, formatErrorForUI
 */
import { describe, it, expect, vi } from 'vitest';

// Mock the dependencies before importing
vi.mock('@/lib/system/trace', () => ({
  generateTraceId: () => 'test-trace-123',
}));

vi.mock('@/lib/defense/redact', () => ({
  redactSecrets: (obj: Record<string, unknown>) => obj,
}));

import {
  createAppError,
  fromError,
  isAppError,
  isRetryableError,
  formatErrorForUI,
} from '../errors';

describe('createAppError', () => {
  it('creates well-formed error', () => {
    const err = createAppError('INTERNAL_ERROR', 'something broke');
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe('something broke');
    expect(err.safe_message).toBeTruthy();
    expect(err.trace_id).toBeTruthy();
    expect(err.timestamp).toBeTruthy();
    expect(err.retryable).toBe(false);
  });

  it('marks retryable codes correctly', () => {
    expect(createAppError('NETWORK_ERROR', 'fail').retryable).toBe(true);
    expect(createAppError('TIMEOUT_ERROR', 'fail').retryable).toBe(true);
    expect(createAppError('RATE_LIMITED', 'fail').retryable).toBe(true);
    expect(createAppError('AUTH_ERROR', 'fail').retryable).toBe(false);
    expect(createAppError('VALIDATION_ERROR', 'fail').retryable).toBe(false);
  });

  it('uses provided trace ID', () => {
    const err = createAppError('INTERNAL_ERROR', 'msg', {}, 'custom-trace');
    expect(err.trace_id).toBe('custom-trace');
  });

  it('redacts metadata', () => {
    const err = createAppError('INTERNAL_ERROR', 'msg', { secret: 'key123' });
    expect(err.meta_redacted).toBeDefined();
  });
});

describe('fromError', () => {
  it('wraps standard Error', () => {
    const err = fromError(new Error('boom'));
    expect(err.code).toBeTruthy();
    expect(err.message).toBe('boom');
  });

  it('returns existing AppError unchanged', () => {
    const original = createAppError('AUTH_ERROR', 'unauthorized');
    const wrapped = fromError(original);
    expect(wrapped).toBe(original);
  });

  it('wraps string errors', () => {
    const err = fromError('string error');
    expect(err.code).toBeTruthy();
    expect(err.message).toBe('string error');
  });

  it('infers error code from message', () => {
    expect(fromError(new Error('network failure')).code).toBe('NETWORK_ERROR');
    expect(fromError(new Error('request timed out')).code).toBe('TIMEOUT_ERROR');
    expect(fromError(new Error('401 unauthorized')).code).toBe('AUTH_ERROR');
    expect(fromError(new Error('404 not found')).code).toBe('NOT_FOUND');
    expect(fromError(new Error('429 rate limit exceeded')).code).toBe('RATE_LIMITED');
  });
});

describe('isAppError', () => {
  it('identifies valid AppError', () => {
    const err = createAppError('INTERNAL_ERROR', 'test');
    expect(isAppError(err)).toBe(true);
  });

  it('rejects non-AppError objects', () => {
    expect(isAppError(new Error('nope'))).toBe(false);
    expect(isAppError({ code: 'x' })).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError('string')).toBe(false);
  });
});

describe('isRetryableError', () => {
  it('returns true for retryable AppErrors', () => {
    expect(isRetryableError(createAppError('NETWORK_ERROR', 'fail'))).toBe(true);
    expect(isRetryableError(createAppError('TIMEOUT_ERROR', 'fail'))).toBe(true);
  });

  it('returns false for non-retryable AppErrors', () => {
    expect(isRetryableError(createAppError('AUTH_ERROR', 'fail'))).toBe(false);
  });

  it('infers retryability from standard Error', () => {
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('validation error'))).toBe(false);
  });
});

describe('formatErrorForUI', () => {
  it('produces UI-safe output', () => {
    const err = createAppError('INTERNAL_ERROR', 'sensitive details here');
    const ui = formatErrorForUI(err);
    expect(ui.title).toBe(err.safe_message);
    expect(ui.description).toContain(err.trace_id);
    expect(ui.traceId).toBe(err.trace_id);
    // Should NOT expose raw message
    expect(ui.title).not.toContain('sensitive details');
  });
});
