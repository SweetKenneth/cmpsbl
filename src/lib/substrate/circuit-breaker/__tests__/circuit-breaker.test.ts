/**
 * Circuit Breaker — Unit Tests
 * Validates state machine transitions, failure tracking, and recovery
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getBreaker,
  recordSuccess,
  recordFailure,
  canExecute,
  resetBreaker,
  configureBreaker,
  withCircuitBreaker,
  getAllBreakerStates,
  getCircuitBreakerSummary,
} from '../index';

// Reset breaker state between tests
beforeEach(() => {
  // Reset by re-initializing the test module
  resetBreaker('test-module');
});

describe('Circuit Breaker State Machine', () => {
  it('initializes in closed state', () => {
    const b = getBreaker('fresh-module');
    expect(b.state).toBe('closed');
    expect(b.failures).toBe(0);
    expect(b.totalTrips).toBe(0);
  });

  it('allows execution when closed', () => {
    expect(canExecute('test-module')).toBe(true);
  });

  it('opens after reaching failure threshold', () => {
    configureBreaker('test-open', { failureThreshold: 3, recoveryTimeout: 60000 });
    recordFailure('test-open');
    recordFailure('test-open');
    expect(getBreaker('test-open').state).toBe('closed');
    
    recordFailure('test-open');
    expect(getBreaker('test-open').state).toBe('open');
    expect(getBreaker('test-open').totalTrips).toBe(1);
  });

  it('rejects execution when open', () => {
    configureBreaker('test-reject', { failureThreshold: 1, recoveryTimeout: 60000 });
    recordFailure('test-reject');
    expect(canExecute('test-reject')).toBe(false);
  });

  it('transitions to half-open after recovery timeout', () => {
    configureBreaker('test-halfopen', { failureThreshold: 1, recoveryTimeout: 0 });
    recordFailure('test-halfopen');
    expect(getBreaker('test-halfopen').state).toBe('open');
    
    // With 0ms recovery, should transition on next check
    expect(canExecute('test-halfopen')).toBe(true);
    expect(getBreaker('test-halfopen').state).toBe('half_open');
  });

  it('closes from half-open after sufficient successes', () => {
    configureBreaker('test-close', { failureThreshold: 1, recoveryTimeout: 0, halfOpenMaxAttempts: 2 });
    recordFailure('test-close');
    canExecute('test-close'); // triggers half-open
    
    recordSuccess('test-close');
    expect(getBreaker('test-close').state).toBe('half_open');
    
    recordSuccess('test-close');
    expect(getBreaker('test-close').state).toBe('closed');
  });

  it('reopens from half-open on failure', () => {
    configureBreaker('test-reopen', { failureThreshold: 1, recoveryTimeout: 0 });
    recordFailure('test-reopen');
    canExecute('test-reopen'); // triggers half-open
    
    recordFailure('test-reopen');
    expect(getBreaker('test-reopen').state).toBe('open');
    expect(getBreaker('test-reopen').totalTrips).toBe(2);
  });

  it('resets breaker to closed', () => {
    configureBreaker('test-reset', { failureThreshold: 1 });
    recordFailure('test-reset');
    expect(getBreaker('test-reset').state).toBe('open');
    
    resetBreaker('test-reset');
    expect(getBreaker('test-reset').state).toBe('closed');
    expect(getBreaker('test-reset').failures).toBe(0);
  });
});

describe('withCircuitBreaker', () => {
  it('executes function and records success', async () => {
    const result = await withCircuitBreaker('cb-exec', () => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('records failure on error', async () => {
    await expect(
      withCircuitBreaker('cb-fail', () => Promise.reject(new Error('boom')))
    ).rejects.toThrow('boom');
    
    expect(getBreaker('cb-fail').failures).toBe(1);
  });

  it('rejects when circuit is open', async () => {
    configureBreaker('cb-open', { failureThreshold: 1, recoveryTimeout: 60000 });
    recordFailure('cb-open');
    
    await expect(
      withCircuitBreaker('cb-open', () => Promise.resolve())
    ).rejects.toThrow('circuit is OPEN');
  });

  it('times out long operations', async () => {
    await expect(
      withCircuitBreaker(
        'cb-timeout',
        () => new Promise(resolve => setTimeout(resolve, 5000)),
        50
      )
    ).rejects.toThrow('timed out');
    
    expect(getBreaker('cb-timeout').failures).toBe(1);
  });
});

describe('getCircuitBreakerSummary', () => {
  it('returns aggregate summary', () => {
    resetBreaker('sum-a');
    resetBreaker('sum-b');
    configureBreaker('sum-c', { failureThreshold: 1, recoveryTimeout: 60000 });
    recordFailure('sum-c');
    
    const summary = getCircuitBreakerSummary();
    expect(summary.total).toBeGreaterThanOrEqual(3);
    expect(summary.unhealthy).toContain('sum-c');
    expect(summary.open).toBeGreaterThanOrEqual(1);
  });
});
