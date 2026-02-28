/**
 * Scan Result Persistence — DB-backed scan cache
 * Item #11: Store completed scan results with TTL for returning users
 */

import { supabase } from '@/integrations/supabase/client';

export interface PersistedScanResult {
  id: string;
  domain: string;
  scan_mode: string;
  score: number | null;
  findings_count: number;
  result_data: unknown;
  created_at: string;
  expires_at: string;
}

/**
 * Fetch a cached scan result for a domain + mode, if not expired.
 */
export async function getCachedScanResult(
  domain: string,
  scanMode: string = 'quick',
): Promise<PersistedScanResult | null> {
  const { data, error } = await supabase
    .from('scan_results_cache')
    .select('*')
    .eq('domain', domain)
    .eq('scan_mode', scanMode)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as PersistedScanResult;
}

/**
 * Persist a scan result to the database.
 */
export async function persistScanResult(params: {
  domain: string;
  scanMode: string;
  score: number | null;
  findingsCount: number;
  resultData: unknown;
  ttlDays?: number;
}): Promise<string | null> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (params.ttlDays ?? 7));

  const { data, error } = await supabase
    .from('scan_results_cache')
    .insert([{
      domain: params.domain,
      scan_mode: params.scanMode,
      score: params.score,
      findings_count: params.findingsCount,
      result_data: params.resultData as any,
      expires_at: expiresAt.toISOString(),
    }])
    .select('id')
    .single();

  if (error) {
    console.error('[scan-persistence] Failed to persist:', error.message);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Record finding trends for a domain after a scan.
 */
export async function recordFindingTrend(params: {
  domain: string;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  score: number | null;
  categoryBreakdown?: Record<string, number>;
}): Promise<void> {
  const { error } = await supabase
    .from('scan_finding_trends')
    .upsert([{
      domain: params.domain,
      scan_date: new Date().toISOString().split('T')[0],
      total_findings: params.totalFindings,
      critical_count: params.criticalCount,
      high_count: params.highCount,
      medium_count: params.mediumCount,
      low_count: params.lowCount,
      score: params.score,
      category_breakdown: params.categoryBreakdown ?? {},
    }], { onConflict: 'domain,scan_date' });

  if (error) {
    console.error('[scan-trends] Failed to record:', error.message);
  }
}

/**
 * Get trend data for a domain over time.
 */
export async function getFindingTrends(
  domain: string,
  days: number = 30,
): Promise<Array<{ scan_date: string; total_findings: number; score: number | null }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('scan_finding_trends')
    .select('scan_date, total_findings, score, critical_count, high_count, medium_count, low_count')
    .eq('domain', domain)
    .gte('scan_date', since.toISOString().split('T')[0])
    .order('scan_date', { ascending: true });

  if (error) return [];
  return data ?? [];
}
