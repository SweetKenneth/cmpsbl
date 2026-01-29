/**
 * Evolution Circuit Breaker — Hard Stop Protection
 * v0.7.6 — Prevents runaway evolution failures
 */

import { supabase } from '@/integrations/supabase/client';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type CircuitState = 'open' | 'closed';

export interface CircuitStatus {
  circuit_id: string;
  state: CircuitState;
  reason: string | null;
  last_trip_at: string | null;
  auto_reset_after: string | null;
  is_blocking: boolean;
}

export interface CircuitResult {
  success: boolean;
  state: CircuitState;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════

/**
 * Get current circuit status
 */
export async function getCircuitStatus(): Promise<CircuitStatus> {
  const { data, error } = await supabase
    .from('evolution_circuit')
    .select('*')
    .limit(1)
    .single();

  if (error || !data) {
    // Default to closed if no circuit record
    return {
      circuit_id: 'default',
      state: 'closed',
      reason: null,
      last_trip_at: null,
      auto_reset_after: null,
      is_blocking: false,
    };
  }

  const autoResetAfter = data.auto_reset_after as string | null;
  const lastTripAt = data.last_trip_at as string | null;

  // Check for auto-reset
  const shouldAutoReset = autoResetAfter && lastTripAt
    ? shouldResetCircuit(lastTripAt, autoResetAfter)
    : false;

  if (shouldAutoReset && data.state === 'open') {
    await resetCircuit('Auto-reset timer expired');
    return {
      circuit_id: data.circuit_id,
      state: 'closed',
      reason: data.reason as string | null,
      last_trip_at: lastTripAt,
      auto_reset_after: autoResetAfter,
      is_blocking: false,
    };
  }

  return {
    circuit_id: data.circuit_id,
    state: data.state as CircuitState,
    reason: data.reason as string | null,
    last_trip_at: lastTripAt,
    auto_reset_after: autoResetAfter,
    is_blocking: data.state === 'open',
  };
}

/**
 * Check if circuit should auto-reset
 */
function shouldResetCircuit(tripTime: string, resetAfter: string): boolean {
  const tripDate = new Date(tripTime);
  const resetMs = parseInterval(resetAfter);
  const now = Date.now();
  return now >= tripDate.getTime() + resetMs;
}

/**
 * Parse PostgreSQL interval to milliseconds
 */
function parseInterval(interval: string): number {
  const hourMatch = interval.match(/(\d+)\s*hours?/i);
  const minMatch = interval.match(/(\d+)\s*minutes?/i);
  
  let ms = 0;
  if (hourMatch) ms += parseInt(hourMatch[1]) * 60 * 60 * 1000;
  if (minMatch) ms += parseInt(minMatch[1]) * 60 * 1000;
  
  return ms || 3600000; // Default 1 hour
}

/**
 * Trip (open) the circuit breaker
 */
export async function tripCircuit(reason: string): Promise<CircuitResult> {
  const { error } = await supabase
    .from('evolution_circuit')
    .update({
      state: 'open',
      reason,
      last_trip_at: new Date().toISOString(),
      auto_reset_after: '1 hour', // Auto-reset after 1 hour
    })
    .neq('circuit_id', '00000000-0000-0000-0000-000000000000'); // Update all

  if (error) {
    console.error('[CircuitBreaker] Failed to trip:', error);
    return {
      success: false,
      state: 'closed',
      message: `Failed to trip circuit: ${error.message}`,
    };
  }

  emitEvolveEvent('circuit_tripped', { reason });

  return {
    success: true,
    state: 'open',
    message: `Circuit OPEN: ${reason}`,
  };
}

/**
 * Reset (close) the circuit breaker
 */
export async function resetCircuit(reason: string = 'Manual reset'): Promise<CircuitResult> {
  const { error } = await supabase
    .from('evolution_circuit')
    .update({
      state: 'closed',
      reason,
      last_trip_at: null,
    })
    .neq('circuit_id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('[CircuitBreaker] Failed to reset:', error);
    return {
      success: false,
      state: 'open',
      message: `Failed to reset circuit: ${error.message}`,
    };
  }

  emitEvolveEvent('circuit_reset', { reason });

  return {
    success: true,
    state: 'closed',
    message: `Circuit CLOSED: ${reason}`,
  };
}

/**
 * Open circuit manually (admin action)
 */
export async function openCircuit(reason: string): Promise<CircuitResult> {
  return tripCircuit(reason);
}

/**
 * Check if evolution is allowed
 */
export async function isEvolutionAllowed(): Promise<{ allowed: boolean; reason: string }> {
  const status = await getCircuitStatus();
  
  if (status.is_blocking) {
    return {
      allowed: false,
      reason: `Circuit breaker OPEN: ${status.reason || 'Unknown reason'}`,
    };
  }

  return {
    allowed: true,
    reason: 'Circuit closed - evolution allowed',
  };
}
