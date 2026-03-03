/**
 * NEXUS Circuit Breaker — Unit Tests
 * Validates provider-level failure isolation and recovery
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isProviderAvailable,
  recordSuccess,
  recordFailure,
  resetCircuit,
  getCircuitStatus,
  updateCircuitConfig,
} from '../circuitBreaker';

describe('NEXUS Circuit Breaker', () => {
  beforeEach(() => {
    resetCircuit('test-provider');
    updateCircuitConfig({
      failure_threshold: 3,
      success_threshold: 2,
      cooldown_ms: 100,
      half_open_requests: 1,
    });
  });

  it('starts closed and available', () => {
    expect(isProviderAvailable('test-provider')).toBe(true);
    const state = getCircuitStatus('test-provider');
    expect(state.state).toBe('closed');
  });

  it('opens after failure threshold', () => {
    for (let i = 0; i < 3; i++) {
      recordFailure('test-provider');
    }
    expect(isProviderAvailable('test-provider')).toBe(false);
    const state = getCircuitStatus('test-provider');
    expect(state.state).toBe('open');
  });

  it('does not open below threshold', () => {
    recordFailure('test-provider');
    recordFailure('test-provider');
    expect(isProviderAvailable('test-provider')).toBe(true);
  });

  it('recovers to half-open after cooldown', async () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    expect(isProviderAvailable('test-provider')).toBe(false);

    // Wait for cooldown
    await new Promise(r => setTimeout(r, 150));
    expect(isProviderAvailable('test-provider')).toBe(true);
    const state = getCircuitStatus('test-provider');
    expect(state.state).toBe('half-open');
  });

  it('closes from half-open after success threshold', async () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    await new Promise(r => setTimeout(r, 150));
    isProviderAvailable('test-provider'); // trigger half-open

    recordSuccess('test-provider');
    recordSuccess('test-provider');
    const state = getCircuitStatus('test-provider');
    expect(state.state).toBe('closed');
  });

  it('reopens from half-open on failure', async () => {
    for (let i = 0; i < 3; i++) recordFailure('test-provider');
    await new Promise(r => setTimeout(r, 150));
    isProviderAvailable('test-provider'); // trigger half-open

    recordFailure('test-provider');
    const state = getCircuitStatus('test-provider');
    expect(state.state).toBe('open');
  });

  it('isolates separate providers independently', () => {
    for (let i = 0; i < 3; i++) recordFailure('provider-a');
    expect(isProviderAvailable('provider-a')).toBe(false);
    expect(isProviderAvailable('provider-b')).toBe(true);
    resetCircuit('provider-a');
    resetCircuit('provider-b');
  });
});
