/**
 * Non-blocking intelligence event emitter
 * Batches events to avoid per-execution DB writes
 */

import { supabase } from '@/integrations/supabase/client';
import type { IntelligenceEvent } from './intelligenceTypes';
import { IMMUNITY_INTEL_METRICS } from './intelligenceTypes';

const EVENT_BUFFER: IntelligenceEvent[] = [];
const FLUSH_INTERVAL_MS = 10_000; // 10s
const MAX_BUFFER = 50;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/** Deterministic signature hash (same as wrapExecutor hashInput) */
export function hashSignature(executor: string, error: string): string {
  const str = `${executor}::${error}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export function emitIntelligenceEvent(event: IntelligenceEvent): void {
  if (!IMMUNITY_INTEL_METRICS) return;
  EVENT_BUFFER.push(event);
  if (EVENT_BUFFER.length >= MAX_BUFFER) {
    flushEvents();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, FLUSH_INTERVAL_MS);
  }
}

async function flushEvents(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (EVENT_BUFFER.length === 0) return;

  const batch = EVENT_BUFFER.splice(0, EVENT_BUFFER.length);
  try {
    await supabase
      .from('immune_intelligence_events')
      .insert(batch.map(e => ({
        executor_id: e.executor_id,
        is_shadow_mesh: e.is_shadow_mesh,
        mode: e.mode,
        outcome: e.outcome,
        repair_type: e.repair_type,
        rule_id: e.rule_id,
        failure_signature_hash: e.failure_signature_hash,
        escalation_severity: e.escalation_severity,
        duration_ms: e.duration_ms,
        meta: e.meta,
      })) as any);
  } catch {
    // Never crash runtime for telemetry
    console.warn('[intel-events] Flush failed, events dropped:', batch.length);
  }
}
