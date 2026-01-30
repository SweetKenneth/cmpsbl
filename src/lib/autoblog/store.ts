/**
 * AutoBlog Store - Database operations
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  AutoblogSettings, 
  AutoblogQueueItem, 
  AutoblogDraft, 
  AutoblogRun,
  AutoblogChannel,
  AutoblogQueueStatus,
  AutoblogPhase,
  AutoblogOutcome,
  CircuitState
} from './types';

/**
 * Get current AutoBlog settings (singleton)
 */
export async function getAutoblogSettings(): Promise<AutoblogSettings | null> {
  const { data, error } = await supabase
    .from('autoblog_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('[AutoBlog] Failed to fetch settings:', error.message);
    return null;
  }

  return data as AutoblogSettings;
}

/**
 * Update AutoBlog settings
 */
export async function updateAutoblogSettings(
  updates: Partial<Omit<AutoblogSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ ok: boolean; error?: string }> {
  const settings = await getAutoblogSettings();
  if (!settings) {
    return { ok: false, error: 'Settings not found' };
  }

  const { error } = await supabase
    .from('autoblog_settings')
    .update(updates)
    .eq('id', settings.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Get AutoBlog queue items
 */
export async function getAutoblogQueue(
  status?: AutoblogQueueStatus,
  limit = 20
): Promise<AutoblogQueueItem[]> {
  let query = supabase
    .from('autoblog_queue')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[AutoBlog] Failed to fetch queue:', error.message);
    return [];
  }

  return (data || []) as AutoblogQueueItem[];
}

/**
 * Queue a new draft
 */
export async function queueDraft(input: {
  channel: AutoblogChannel;
  topic?: string;
  dedupeKey: string;
  plannedAt?: string;
}): Promise<AutoblogQueueItem | null> {
  // Check for duplicate
  const { data: existing } = await supabase
    .from('autoblog_queue')
    .select('id')
    .eq('dedupe_key', input.dedupeKey)
    .not('status', 'in', '("aborted","failed")')
    .limit(1);

  if (existing && existing.length > 0) {
    console.warn('[AutoBlog] Duplicate detected, skipping queue');
    return null;
  }

  const { data, error } = await supabase
    .from('autoblog_queue')
    .insert({
      channel: input.channel,
      topic: input.topic || null,
      dedupe_key: input.dedupeKey,
      planned_at: input.plannedAt || new Date().toISOString(),
      status: 'queued'
    })
    .select()
    .single();

  if (error) {
    console.error('[AutoBlog] Failed to queue draft:', error.message);
    return null;
  }

  return data as AutoblogQueueItem;
}

/**
 * Update queue item status
 */
export async function updateQueueStatus(
  queueId: string,
  status: AutoblogQueueStatus,
  additionalFields?: Partial<AutoblogQueueItem>
): Promise<boolean> {
  const updates: Record<string, unknown> = { status, ...additionalFields };
  
  if (status === 'drafting') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'published' || status === 'aborted' || status === 'failed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('autoblog_queue')
    .update(updates)
    .eq('id', queueId);

  return !error;
}

/**
 * Save draft content
 */
export async function saveDraft(
  queueId: string,
  draft: { title: string; body: string; format?: string }
): Promise<AutoblogDraft | null> {
  const { data, error } = await supabase
    .from('autoblog_drafts')
    .insert({
      queue_id: queueId,
      title: draft.title,
      body: draft.body,
      format: draft.format || 'markdown'
    })
    .select()
    .single();

  if (error) {
    console.error('[AutoBlog] Failed to save draft:', error.message);
    return null;
  }

  return data as AutoblogDraft;
}

/**
 * Get draft by queue ID
 */
export async function getDraft(queueId: string): Promise<AutoblogDraft | null> {
  const { data, error } = await supabase
    .from('autoblog_drafts')
    .select('*')
    .eq('queue_id', queueId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data as AutoblogDraft;
}

/**
 * Record a run for audit trail
 */
export async function recordRun(input: {
  queueId?: string;
  phase: AutoblogPhase;
  outcome: AutoblogOutcome;
  reason?: string;
  circuitState?: CircuitState;
  failures?: number;
  healAttempted?: boolean;
}): Promise<AutoblogRun | null> {
  const { data, error } = await supabase
    .from('autoblog_runs')
    .insert({
      queue_id: input.queueId || null,
      phase: input.phase,
      outcome: input.outcome,
      reason: input.reason || null,
      circuit_state: input.circuitState || 'closed',
      failures: input.failures || 0,
      heal_attempted: input.healAttempted || false
    })
    .select()
    .single();

  if (error) {
    console.error('[AutoBlog] Failed to record run:', error.message);
    return null;
  }

  return data as AutoblogRun;
}

/**
 * Get recent runs
 */
export async function getAutoblogRuns(limit = 50): Promise<AutoblogRun[]> {
  const { data, error } = await supabase
    .from('autoblog_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[AutoBlog] Failed to fetch runs:', error.message);
    return [];
  }

  return (data || []) as AutoblogRun[];
}

/**
 * Count failures in the last hour
 */
export async function countRecentFailures(): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { count, error } = await supabase
    .from('autoblog_runs')
    .select('*', { count: 'exact', head: true })
    .eq('outcome', 'failed')
    .gte('created_at', oneHourAgo);

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Count posts today
 */
export async function countPostsToday(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  
  const { count, error } = await supabase
    .from('autoblog_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .gte('completed_at', `${today}T00:00:00Z`);

  if (error) {
    return 0;
  }

  return count || 0;
}
