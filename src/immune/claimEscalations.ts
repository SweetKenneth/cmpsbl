/**
 * ENCODE Escalation Handoff — Placeholder
 * Reads open immune escalations and formats them as a work queue for ENCODE.
 * 
 * NO auto-apply in this patch. Just proves we can capture → persist → surface.
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/system/log';
import type { EscalationPayload } from './types';

export interface EncodeWorkItem {
  escalationId: string;
  module: string;
  executor: string;
  scope: string;
  errorSummary: string;
  suggestedFixHint: string;
  severity: string;
  createdAt: string;
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
    };
  });
}

/**
 * Claim an escalation (mark as "claimed" so no other process picks it up)
 */
export async function claimEscalation(escalationId: string, claimedBy = 'ENCODE'): Promise<boolean> {
  const { error } = await supabase
    .from('immune_escalations')
    .update({ status: 'claimed', claimed_by: claimedBy })
    .eq('id', escalationId)
    .eq('status', 'open');

  if (error) {
    log.error('encode', `Failed to claim escalation ${escalationId}: ${error.message}`);
    return false;
  }
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
    return false;
  }
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
