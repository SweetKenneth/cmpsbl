/**
 * Public Receipts — Read-Only Evolution Audit Trail
 * Exposes evolution facts without internals
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PublicReceipt {
  run_id: string;
  phase: string;
  confidence_score: number;
  risk_level: string;
  tests_run: number;
  tests_passed: number;
  health_before: number | null;
  health_after: number | null;
  timestamp: string;
  initiated_by: string;
}

export interface PublicReceiptsResponse {
  success: boolean;
  receipts: PublicReceipt[];
  total: number;
  page: number;
  page_size: number;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC RECEIPTS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get public receipts (sanitized, no internals)
 * Safe for public consumption
 */
export async function getPublicReceipts(
  page: number = 1,
  pageSize: number = 20
): Promise<PublicReceiptsResponse> {
  const offset = (page - 1) * pageSize;

  // Get total count
  const { count } = await supabase
    .from('evolution_receipts')
    .select('*', { count: 'exact', head: true });

  // Get receipts with runs data
  const { data: receipts, error } = await supabase
    .from('evolution_receipts')
    .select(`
      receipt_id,
      run_id,
      phase,
      tests_run,
      tests_passed,
      health_before,
      health_after,
      timestamp,
      evolution_runs!inner (
        confidence_score,
        risk_level,
        initiated_by
      )
    `)
    .order('timestamp', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('[PublicReceipts] Error fetching:', error);
    return {
      success: false,
      receipts: [],
      total: 0,
      page,
      page_size: pageSize,
    };
  }

  // Sanitize and transform
  const publicReceipts: PublicReceipt[] = (receipts || []).map((r: any) => ({
    run_id: r.run_id,
    phase: r.phase,
    confidence_score: r.evolution_runs?.confidence_score || 0,
    risk_level: r.evolution_runs?.risk_level || 'unknown',
    tests_run: r.tests_run || 0,
    tests_passed: r.tests_passed || 0,
    health_before: extractHealthScore(r.health_before),
    health_after: extractHealthScore(r.health_after),
    timestamp: r.timestamp,
    initiated_by: r.evolution_runs?.initiated_by || 'unknown',
  }));

  return {
    success: true,
    receipts: publicReceipts,
    total: count || 0,
    page,
    page_size: pageSize,
  };
}

/**
 * Get a single public receipt by run_id
 */
export async function getPublicReceipt(runId: string): Promise<PublicReceipt | null> {
  const { data, error } = await supabase
    .from('evolution_receipts')
    .select(`
      receipt_id,
      run_id,
      phase,
      tests_run,
      tests_passed,
      health_before,
      health_after,
      timestamp,
      evolution_runs!inner (
        confidence_score,
        risk_level,
        initiated_by
      )
    `)
    .eq('run_id', runId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  const r = data as any;
  return {
    run_id: r.run_id,
    phase: r.phase,
    confidence_score: r.evolution_runs?.confidence_score || 0,
    risk_level: r.evolution_runs?.risk_level || 'unknown',
    tests_run: r.tests_run || 0,
    tests_passed: r.tests_passed || 0,
    health_before: extractHealthScore(r.health_before),
    health_after: extractHealthScore(r.health_after),
    timestamp: r.timestamp,
    initiated_by: r.evolution_runs?.initiated_by || 'unknown',
  };
}

/**
 * Extract health score from JSON safely
 */
function extractHealthScore(health: any): number | null {
  if (!health) return null;
  if (typeof health === 'number') return health;
  if (typeof health === 'object' && 'score' in health) {
    return Number(health.score) || null;
  }
  return null;
}

/**
 * Get receipt statistics (public)
 */
export async function getReceiptStats(): Promise<{
  total_receipts: number;
  successful_evolutions: number;
  avg_confidence: number;
  avg_test_pass_rate: number;
}> {
  const { data } = await supabase
    .from('evolution_receipts')
    .select(`
      phase,
      tests_run,
      tests_passed,
      evolution_runs!inner (
        confidence_score,
        phase
      )
    `);

  if (!data || data.length === 0) {
    return {
      total_receipts: 0,
      successful_evolutions: 0,
      avg_confidence: 0,
      avg_test_pass_rate: 0,
    };
  }

  const verified = data.filter((r: any) => 
    r.evolution_runs?.phase === 'verified'
  ).length;

  const confidences = data
    .map((r: any) => r.evolution_runs?.confidence_score)
    .filter((c: any) => typeof c === 'number');

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
    : 0;

  const testPassRates = data
    .filter((r: any) => r.tests_run > 0)
    .map((r: any) => r.tests_passed / r.tests_run);

  const avgTestPassRate = testPassRates.length > 0
    ? testPassRates.reduce((a, b) => a + b, 0) / testPassRates.length
    : 0;

  return {
    total_receipts: data.length,
    successful_evolutions: verified,
    avg_confidence: avgConfidence,
    avg_test_pass_rate: avgTestPassRate,
  };
}
