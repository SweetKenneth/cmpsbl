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
 * Check current circuit state — auto-transitions through closed → open →
 * half-open → closed without operator intervention. Backoff grows
 * exponentially on repeat trips and decays on successful recovery.
 */
export async function checkAutoblogCircuit(): Promise<CircuitCheckResult> {
  const settings = await getAutoblogSettings();

  if (!settings) {
    return { state: 'open', reason: 'Settings unavailable', canProceed: false };
  }

  // Compute adaptive cooldown — grows with consecutive trips, capped at 1h
  const baseCooldownMs = 5 * 60 * 1000;
  const maxCooldownMs = 60 * 60 * 1000;
  const consecutiveTrips = (settings as { consecutive_trips?: number }).consecutive_trips ?? 0;
  const backoffMs = Math.min(
    maxCooldownMs,
    baseCooldownMs * Math.pow(2, Math.max(0, consecutiveTrips - 1))
  );
  const jitter = backoffMs * 0.2 * (Math.random() * 2 - 1);
  const cooldownMs = Math.max(baseCooldownMs, Math.round(backoffMs + jitter));

  // If circuit is open, check if enough time has passed to try half-open
  if (settings.circuit_state === 'open' && settings.circuit_opened_at) {
    const openedAt = new Date(settings.circuit_opened_at).getTime();

    if (Date.now() - openedAt > cooldownMs) {
      // Auto-transition to half-open for self-healing probe
      await updateAutoblogSettings({ circuit_state: 'half_open' });
      return { state: 'half_open', reason: 'Cooldown elapsed, auto-probing recovery', canProceed: true };
    }

    return { state: 'open', reason: `Circuit open, auto-recovery in ${Math.round((cooldownMs - (Date.now() - openedAt)) / 1000)}s`, canProceed: false };
  }

  // If half-open, allow one request through as a recovery probe
  if (settings.circuit_state === 'half_open') {
    return { state: 'half_open', reason: 'Self-healing probe in progress', canProceed: true };
  }

  // Circuit is closed, check if we should open it
  const recentFailures = await countRecentFailures();

  if (recentFailures >= settings.max_failures_per_hour) {
    await tripAutoblogCircuit(`Exceeded ${settings.max_failures_per_hour} failures per hour`);
    return { state: 'open', reason: 'Too many recent failures — auto-recovery scheduled', canProceed: false };
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
