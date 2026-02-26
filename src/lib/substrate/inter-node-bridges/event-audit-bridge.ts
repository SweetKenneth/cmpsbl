/**
 * Event → Audit Persistence Bridge
 * 
 * Critical substrate events (governance changes, security incidents,
 * capability failures) automatically get persisted to the immutable
 * audit trail. Without this, the event bus is fire-and-forget and
 * the audit trail only captures explicit recordAudit() calls.
 *
 * EVENT BUS (RIPPLE) → [THIS BRIDGE] → AUDIT TRAIL + audit_logs DB table
 */

import { supabase } from '@/integrations/supabase/client';
import { recordAudit } from '@/lib/substrate/audit-trail';
import { log } from '@/lib/system/log';
import type { SubstrateEvent } from '@/lib/substrate/events';
import type { Json } from '@/integrations/supabase/types';

/** Event types that MUST be persisted to the audit trail */
const AUDITABLE_EVENT_PATTERNS = [
  /^governance\./i,
  /^security\./i,
  /^capability\..*failed$/i,
  /^mode\./i,
  /^veto\./i,
  /^lockdown\./i,
  /^evolution\..*applied$/i,
  /^auth\./i,
  /^rls\./i,
  /^defense\./i,
];

/** Check if an event should be persisted to audit */
function isAuditable(event: SubstrateEvent): boolean {
  // All failed events with critical context are auditable
  if (event.outcome === 'failed') return true;
  
  // Check against auditable patterns
  return AUDITABLE_EVENT_PATTERNS.some(pattern => pattern.test(event.event_type));
}

/** In-memory dedup window to prevent audit spam */
const recentAudits = new Map<string, number>();
const DEDUP_WINDOW_MS = 5_000;

function isDuplicate(key: string): boolean {
  const last = recentAudits.get(key);
  if (last && Date.now() - last < DEDUP_WINDOW_MS) return true;
  recentAudits.set(key, Date.now());
  // Prune old entries
  if (recentAudits.size > 200) {
    const cutoff = Date.now() - DEDUP_WINDOW_MS;
    for (const [k, v] of recentAudits) {
      if (v < cutoff) recentAudits.delete(k);
    }
  }
  return false;
}

/**
 * Process an event through the audit bridge.
 * Call this from the event emission pipeline.
 */
export function bridgeEventToAudit(event: SubstrateEvent): boolean {
  if (!isAuditable(event)) return false;

  const dedupKey = `${event.module}:${event.event_type}:${event.outcome}`;
  if (isDuplicate(dedupKey)) return false;

  // Write to in-memory audit chain
  recordAudit(
    event.module,
    event.event_type,
    'substrate_event',
    event.trace_id,
    null,
    event.data ?? null,
    {
      outcome: event.outcome,
      message: event.message ?? '',
    }
  );

  // Also persist critical events to the DB audit_logs table
  if (event.outcome === 'failed' || /^(governance|security|lockdown|veto)\./i.test(event.event_type)) {
    persistToDb(event).catch(err => {
      log.error('audit-bridge', 'Failed to persist audit event to DB', { error: String(err) });
    });
  }

  return true;
}

/** Persist critical audit events to the database */
async function persistToDb(event: SubstrateEvent): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // Can't write without auth

  const { error } = await supabase.from('audit_logs').insert({
    action: event.event_type,
    entity_type: 'substrate_event',
    entity_id: event.trace_id,
    performed_by: session.user.id,
    details: {
      module: event.module,
      outcome: event.outcome,
      message: event.message,
      data: event.data,
    } as unknown as Json,
  });

  if (error) {
    log.error('audit-bridge', 'DB audit insert failed', { error: error.message });
  }
}

/**
 * Batch process multiple events through the audit bridge.
 */
export function bridgeEventsToAudit(events: SubstrateEvent[]): number {
  let persisted = 0;
  for (const event of events) {
    if (bridgeEventToAudit(event)) persisted++;
  }
  return persisted;
}
