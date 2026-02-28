/**
 * Scan Scheduled Recurrence — manage recurring scan schedules
 * Item #13: Weekly/monthly automated scans
 */

import { supabase } from '@/integrations/supabase/client';

export type ScanFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScanSchedule {
  id: string;
  domain: string;
  scan_mode: string;
  frequency: ScanFrequency;
  next_run_at: string;
  last_run_at: string | null;
  last_score: number | null;
  score_delta: number | null;
  notify_email: string | null;
  is_active: boolean;
}

function getNextRunDate(frequency: ScanFrequency): Date {
  const next = new Date();
  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
  }
  return next;
}

/**
 * Create a recurring scan schedule.
 */
export async function createScanSchedule(params: {
  domain: string;
  scanMode?: string;
  frequency?: ScanFrequency;
  notifyEmail?: string;
}): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const frequency = params.frequency ?? 'weekly';
  
  const { data, error } = await supabase
    .from('scan_schedules')
    .insert({
      user_id: userData.user.id,
      domain: params.domain,
      scan_mode: params.scanMode ?? 'quick',
      frequency,
      next_run_at: getNextRunDate(frequency).toISOString(),
      notify_email: params.notifyEmail,
    })
    .select('id')
    .single();

  if (error) return null;
  return data?.id ?? null;
}

/**
 * Get all scan schedules for the current user.
 */
export async function getUserSchedules(): Promise<ScanSchedule[]> {
  const { data, error } = await supabase
    .from('scan_schedules')
    .select('*')
    .order('next_run_at', { ascending: true });

  if (error) return [];
  return (data ?? []) as ScanSchedule[];
}

/**
 * Toggle a schedule on/off.
 */
export async function toggleSchedule(id: string, active: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('scan_schedules')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

/**
 * Delete a scan schedule.
 */
export async function deleteSchedule(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('scan_schedules')
    .delete()
    .eq('id', id);

  return !error;
}
