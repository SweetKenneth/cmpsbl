/**
 * Evolve Telemetry — Event Emission for Observability
 * Structured events for evolve lifecycle with receipts
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════

export type EvolveEventType =
  // Evolution run lifecycle
  | 'evolution_run_created'
  | 'evolution_phase_changed'
  | 'evolution_run_aborted'
  | 'evolution_run_failed'
  | 'evolution_verified'
  | 'evolution_receipt_created'
  // Shadow execution
  | 'shadow_execute_started'
  | 'shadow_execute_idempotent'
  | 'shadow_execute_completed'
  | 'shadow_execute_failed'
  // Production execution
  | 'production_execute_started'
  | 'production_backup_created'
  | 'production_execute_completed'
  | 'production_execute_failed'
  // Decode fallback
  | 'decode_fallback_detected'
  // Diagnostics
  | 'diagnostics_completed'
  // Circuit breaker
  | 'circuit_tripped'
  | 'circuit_reset'
  // Autonomy
  | 'autonomy_mode_changed'
  | 'autonomy_check_completed'
  // Self-repair
  | 'self_repair_started'
  | 'self_repair_completed'
  // Legacy lifecycle events
  | 'evolve_shadow_started'
  | 'evolve_shadow_written'
  | 'evolve_shadow_verified'
  | 'evolve_apply_started'
  | 'evolve_apply_completed'
  | 'evolve_apply_blocked'
  | 'artifact_applied'
  // CodeAgent events
  | 'codeagent_started'
  | 'codeagent_forced_write'
  | 'codeagent_loop_detected'
  | 'codeagent_ts_verified'
  | 'codeagent_ts_fixed'
  | 'codeagent_ts_failed'
  | 'codeagent_finalized'
  | 'codeagent_failed'
  // Dual-executor events (v1.2.0)
  | 'dual_executor_started'
  | 'dual_executor_writer_complete'
  | 'dual_executor_validator_complete'
  | 'dual_executor_disagreement'
  | 'dual_executor_dual_signed'
  | 'codeagent_failed'
  // Scan events (v0.7.7)
  | 'scan_started'
  | 'scan_completed'
  | 'scan_failed'
  // Normalization events (v0.7.8)
  | 'proposals_normalized'
  | 'plan_created'
  | 'plan_blocked'
  // Error events
  | 'evolve_error'
  // Snapshot & entropy events (measurable evolution)
  | 'snapshot_created'
  | 'snapshot_restored'
  | 'entropy_ledger_recorded';

export interface EvolveEvent {
  type: EvolveEventType;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// EVENT STORE
// ═══════════════════════════════════════════════════════════════

const eventBuffer: EvolveEvent[] = [];
const MAX_BUFFER_SIZE = 100;

// ═══════════════════════════════════════════════════════════════
// EVENT EMISSION
// ═══════════════════════════════════════════════════════════════

/**
 * Emit an evolve event
 */
// Hardening 6: PII scrubbing keys that should never appear in telemetry
const PII_KEYS = new Set(['password', 'secret', 'token', 'api_key', 'authorization', 'cookie', 'session']);

function scrubPII(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (PII_KEYS.has(key.toLowerCase())) {
      cleaned[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = scrubPII(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// ═══════════════════════════════════════════════════════════════
// EMISSION THROTTLE — deduplicate by event type within a time window
// Critical/rare events always persist; high-frequency events are sampled
// ═══════════════════════════════════════════════════════════════

const ALWAYS_PERSIST: Set<string> = new Set([
  'evolution_run_created', 'evolution_run_aborted', 'evolution_run_failed',
  'evolution_verified', 'evolution_receipt_created',
  'production_execute_started', 'production_execute_completed', 'production_execute_failed',
  'self_repair_started', 'self_repair_completed',
  'circuit_tripped', 'circuit_reset',
  'evolve_error',
]);

const DEDUPE_WINDOW_MS = 30_000; // 30s dedup window for non-critical events
const lastEmitByType = new Map<string, number>();

export function emitEvolveEvent(type: EvolveEventType, data: Record<string, unknown>): void {
  // Hardening 7: Scrub PII from telemetry data
  const cleanData = scrubPII(data);
  
  const event: EvolveEvent = {
    type,
    timestamp: new Date(),
    data: cleanData,
  };

  // Buffer locally (always — this is in-memory only)
  eventBuffer.push(event);
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift();
  }

  // Log to console (production: suppress verbose logging)
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    console.log(`[Evolve:${type}]`, cleanData);
  }

  // Throttle DB persistence: critical events always persist, others deduped
  const now = Date.now();
  if (!ALWAYS_PERSIST.has(type)) {
    const lastEmit = lastEmitByType.get(type);
    if (lastEmit && now - lastEmit < DEDUPE_WINDOW_MS) {
      return; // Skip DB write — same event type emitted recently
    }
  }
  lastEmitByType.set(type, now);

  // Persist to database (non-blocking)
  persistEvent(event).catch(() => { /* silent */ });
}

/**
 * Persist event to database
 */
async function persistEvent(event: EvolveEvent): Promise<void> {
  try {
    await supabase.from('brain_events').insert([{
      module: 'evolve',
      event_type: event.type,
      data: JSON.parse(JSON.stringify(event.data)),
      outcome: 'logged',
    }]);
  } catch (e) {
    // Silent fail - telemetry should not block operations
  }
}

/**
 * Get recent events
 */
export function getRecentEvents(count: number = 20): EvolveEvent[] {
  return eventBuffer.slice(-count);
}

/**
 * Get events for a specific evolution
 */
export function getEventsForEvolution(evolution_id: string): EvolveEvent[] {
  return eventBuffer.filter(e => e.data.evolution_id === evolution_id);
}

/**
 * Clear event buffer (for testing)
 */
export function clearEvents(): void {
  eventBuffer.length = 0;
}

/**
 * Get event statistics
 */
export function getEventStats(): {
  total: number;
  by_type: Record<string, number>;
  recent_errors: number;
} {
  const by_type: Record<string, number> = {};
  let recent_errors = 0;

  for (const event of eventBuffer) {
    by_type[event.type] = (by_type[event.type] || 0) + 1;
    
    if (event.type.includes('error') || event.type.includes('failed')) {
      const age = Date.now() - event.timestamp.getTime();
      if (age < 3600000) { // Last hour
        recent_errors++;
      }
    }
  }

  return {
    total: eventBuffer.length,
    by_type,
    recent_errors,
  };
}
