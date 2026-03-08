/**
 * IMMUNITY → ENCODE Escalation Handoff
 * Reads open immune escalations and formats them as a work queue for ENCODE.
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/system/log';
import type { EscalationPayload } from './types';
import { recordClaim, recordResolution } from '@/lib/substrate/encode-module/escalation-telemetry';

export interface EncodeWorkItem {
  escalationId: string;
  module: string;
  executor: string;
  scope: string;
  errorSummary: string;
  suggestedFixHint: string;
  severity: string;
  createdAt: string;
  /** Improvement #2: Include actual failing input for deterministic repair */
  failingInput?: Record<string, unknown>;
}

/**
 * Read open escalations and format as ENCODE work items
 */
export async function getEncodeWorkQueue(limit = 20): Promise<EncodeWorkItem[]> {
  const { data, error } = await supabase
    .from('immune_escalations')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    log.error('encode', `Failed to read escalation queue: ${error.message}`);
    return [];
  }

  return (data ?? []).map((row: any) => {
    const payload = row.payload as EscalationPayload;
    return {
      escalationId: row.id,
      module: row.module,
      executor: row.executor,
      scope: row.scope,
      errorSummary: payload?.errorSummary ?? 'unknown',
      suggestedFixHint: payload?.suggestedFixHint ?? '',
      severity: row.severity,
      createdAt: row.created_at,
      failingInput: (payload as any)?.failingInput ?? undefined,
    };
  });
}

/**
 * Claim an escalation (mark as "claimed" so no other process picks it up)
 */
export async function claimEscalation(escalationId: string, claimedBy = 'ENCODE'): Promise<boolean> {
  const { data, error } = await supabase
    .from('immune_escalations')
    .update({ status: 'claimed', claimed_by: claimedBy })
    .eq('id', escalationId)
    .eq('status', 'open')
    .select('id');

  if (error) {
    log.error('encode', `Failed to claim escalation ${escalationId}: ${error.message}`);
    return false;
  }
  // Verify the update actually affected a row
  if (!data || data.length === 0) {
    log.warn('encode', `Claim returned no rows for ${escalationId} — may be already claimed or RLS blocked`);
    return false;
  }
  // Telemetry: record claim
  recordClaim(escalationId, claimedBy);
  return true;
}

/**
 * Resolve an escalation with a note
 */
export async function resolveEscalation(escalationId: string, note: string): Promise<boolean> {
  const { error } = await supabase
    .from('immune_escalations')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_note: note,
    })
    .eq('id', escalationId);

  if (error) {
    log.error('encode', `Failed to resolve escalation ${escalationId}: ${error.message}`);
    recordResolution(escalationId, false, 'manual', undefined, error.message);
    return false;
  }
  // Telemetry: record successful resolution
  recordResolution(escalationId, true, 'manual', undefined, note);
  return true;
}

/**
 * Print the work queue (for terminal/dev use)
 */
export async function printEncodeWorkQueue(): Promise<string> {
  const items = await getEncodeWorkQueue();
  
  if (items.length === 0) {
    return '── ENCODE Work Queue: Empty (no open escalations) ──';
  }

  const lines = [
    `── ENCODE Work Queue: ${items.length} items ──`,
    ...items.map((item, i) => [
      `  ${i + 1}. [${item.severity.toUpperCase()}] ${item.executor}`,
      `     Error: ${item.errorSummary.slice(0, 100)}`,
      `     Hint:  ${item.suggestedFixHint}`,
      `     ID:    ${item.escalationId.slice(0, 8)}…`,
    ].join('\n')),
  ];

  return lines.join('\n');
}
