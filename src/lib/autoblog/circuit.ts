/**
 * AutoBlog Circuit Breaker
 * Protects against cascading failures
 */

import { getAutoblogSettings, updateAutoblogSettings, countRecentFailures, recordRun } from './store';
import type { CircuitState } from './types';

export interface CircuitCheckResult {
  state: CircuitState;
  reason: string | null;
  canProceed: boolean;
}

/**
 * Check current circuit state
 */
export async function checkAutoblogCircuit(): Promise<CircuitCheckResult> {
  const settings = await getAutoblogSettings();
  
  if (!settings) {
    return { state: 'open', reason: 'Settings unavailable', canProceed: false };
  }

  // If circuit is open, check if enough time has passed to try half-open
  if (settings.circuit_state === 'open' && settings.circuit_opened_at) {
    const openedAt = new Date(settings.circuit_opened_at).getTime();
    const cooldownMs = 5 * 60 * 1000; // 5 minute cooldown
    
    if (Date.now() - openedAt > cooldownMs) {
      // Transition to half-open for retry
      await updateAutoblogSettings({ circuit_state: 'half_open' });
      return { state: 'half_open', reason: 'Cooldown elapsed, attempting recovery', canProceed: true };
    }
    
    return { state: 'open', reason: 'Circuit open, cooling down', canProceed: false };
  }

  // If half-open, allow one request through
  if (settings.circuit_state === 'half_open') {
    return { state: 'half_open', reason: 'Testing recovery', canProceed: true };
  }

  // Circuit is closed, check if we should open it
  const recentFailures = await countRecentFailures();
  
  if (recentFailures >= settings.max_failures_per_hour) {
    await tripAutoblogCircuit(`Exceeded ${settings.max_failures_per_hour} failures per hour`);
    return { state: 'open', reason: 'Too many recent failures', canProceed: false };
  }

  return { state: 'closed', reason: null, canProceed: true };
}

/**
 * Trip the circuit breaker (open it)
 */
export async function tripAutoblogCircuit(reason: string): Promise<void> {
  await updateAutoblogSettings({
    circuit_state: 'open',
    circuit_opened_at: new Date().toISOString()
  });

  await recordRun({
    phase: 'heal',
    outcome: 'blocked',
    reason: `Circuit opened: ${reason}`,
    circuitState: 'open'
  });

  console.warn('[AutoBlog] Circuit tripped:', reason);
}

/**
 * Reset circuit to closed state
 */
export async function resetAutoblogCircuit(): Promise<void> {
  await updateAutoblogSettings({
    circuit_state: 'closed',
    circuit_opened_at: null
  });

  await recordRun({
    phase: 'heal',
    outcome: 'success',
    reason: 'Circuit reset to closed',
    circuitState: 'closed'
  });

  console.info('[AutoBlog] Circuit reset to closed');
}

/**
 * Report success (close circuit if half-open)
 */
export async function reportSuccess(): Promise<void> {
  const settings = await getAutoblogSettings();
  
  if (settings?.circuit_state === 'half_open') {
    await resetAutoblogCircuit();
  }
}

/**
 * Report failure (may trip circuit)
 */
export async function reportFailure(error: string): Promise<void> {
  const settings = await getAutoblogSettings();
  
  if (settings?.circuit_state === 'half_open') {
    await tripAutoblogCircuit(`Failed during half-open test: ${error}`);
  } else {
    // Check if we need to trip
    await checkAutoblogCircuit();
  }
}
