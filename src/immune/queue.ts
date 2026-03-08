/**
 * IMMUNITY — Escalation Queue
 * Persists escalations to DB for ENCODE to claim later
 */

import type { EscalationPayload } from './types';
import { supabase } from '@/integrations/supabase/client';
import { redactContext } from './logger';
import { log } from '@/lib/system/log';
import { recordEscalationInflow } from '@/lib/substrate/encode-module/escalation-telemetry';

/**
 * Enqueue an escalation to the immune_escalations table
 */
export async function enqueueEscalation(payload: EscalationPayload): Promise<void> {
  // Redact secrets from the payload before persisting
  const safePayload = {
    ...payload,
    failingInput: redactContext(payload.failingInput),
    context: redactContext(payload.context),
  };

  try {
    const { error } = await supabase
      .from('immune_escalations')
      .insert({
        module: payload.module,
        executor: payload.executor,
        scope: payload.scope,
        severity: 'high',
        payload: safePayload as any,
        status: 'open',
      });

    if (error) {
      log.error('immune', `Failed to enqueue escalation: ${error.message}`, { payload: safePayload });
      // Fallback: log to console so nothing is lost
      console.error('[IMMUNE:ESCALATION]', JSON.stringify(safePayload));
    } else {
      log.info('immune', `Escalation enqueued for ${payload.executor}`, { eventId: payload.eventId });
      recordEscalationInflow();
    }
  } catch (err) {
    log.error('immune', `Escalation queue error: ${err instanceof Error ? err.message : 'unknown'}`, { payload: safePayload });
    console.error('[IMMUNE:ESCALATION:FALLBACK]', JSON.stringify(safePayload));
  }
}

/**
 * Read open escalations (for ENCODE or dashboard)
 */
export async function getOpenEscalations(limit = 50): Promise<EscalationPayload[]> {
  const { data, error } = await supabase
    .from('immune_escalations')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    log.error('immune', `Failed to read escalations: ${error.message}`);
    return [];
  }

  return (data ?? []).map((row: any) => row.payload as EscalationPayload);
}
