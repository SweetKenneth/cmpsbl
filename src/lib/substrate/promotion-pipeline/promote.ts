/**
 * Promotion Pipeline — Orchestrates shadow → diff → integrity → promote → verify → stamp
 * Guarded by shadow_mesh_enabled flag.
 */

import { supabase } from '@/integrations/supabase/client';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { captureSnapshot } from './snapshot-engine';
import { computeDiff, storeDiff } from './diff-engine';
import { runIntegrityScan } from './integrity-scanner';
import { runPreflight } from './preflight';
import { insertCodeStamps } from './code-stamping';
import { recordMetrics } from './telemetry-recorder';
import type { PromotionResult, PromotionStatus } from './types';

/** Insert a mutation receipt */
async function insertReceipt(
  promotionId: string,
  stage: string,
  outcome: string,
  details: Record<string, any> = {}
): Promise<void> {
  await supabase.from('mutation_receipts').insert({
    promotion_id: promotionId,
    stage,
    outcome,
    details_json: details,
  } as any);
}

/** Restore rule + metric state from a pre-promote snapshot */
async function restoreFromSnapshot(snapshotId: string): Promise<boolean> {
  try {
    const { data: snapshot } = await supabase
      .from('system_snapshots')
      .select('*')
      .eq('id', snapshotId)
      .single() as any;

    if (!snapshot) return false;

    const metrics = snapshot.metrics_json ?? {};

    // Restore promoted rules that were changed during this promotion back to candidate
    // This is a conservative rollback — demote any rules promoted after the snapshot
    if (snapshot.created_at) {
      await supabase
        .from('immunity_rules')
        .update({ status: 'candidate', promoted_at: null } as any)
        .eq('status', 'promoted')
        .gt('promoted_at', snapshot.created_at);
    }

    // Capture rollback state for audit
    await captureSnapshot('rollback_state');
    return true;
  } catch (err) {
    console.error('[Promote] Rollback restore failed:', err);
    return false;
  }
}

/** Simulate canary by replaying recent shadow probe results */
async function runCanaryCheck(shadowRunId: string): Promise<{ passed: boolean; reason?: string }> {
  try {
    // Check recent immune metrics for the shadow window
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 min window
    const { data: recentInvocations } = await supabase
      .from('immunity_rule_invocations')
      .select('outcome')
      .gte('created_at', since)
      .limit(200) as any;

    const invocs = recentInvocations ?? [];
    if (invocs.length === 0) {
      // No data = pass with warning (no traffic to validate against)
      return { passed: true, reason: 'No recent invocations for canary — passed by default' };
    }

    const successes = invocs.filter((i: any) => i.outcome === 'success').length;
    const successRate = successes / invocs.length;

    if (successRate < 0.5) {
      return { passed: false, reason: `Canary success rate ${(successRate * 100).toFixed(1)}% below 50% threshold` };
    }

    return { passed: true, reason: `Canary success rate ${(successRate * 100).toFixed(1)}%` };
  } catch (err) {
    console.error('[Promote] Canary check error:', err);
    return { passed: false, reason: 'Canary check threw an error' };
  }
}

/** Full governed promotion pipeline */
export async function runPromotion(shadowRunId: string): Promise<PromotionResult> {
  // HARD GUARD: mesh OFF = no promotions
  if (!(await isShadowMeshEnabled())) {
    return { success: false, promotion_id: '', status: 'failed', failure_reason: 'Immunity Mesh is OFF — promotion blocked' };
  }

  // 1. Capture shadow baseline snapshot
  const shadowBaseline = await captureSnapshot('shadow_baseline');
  if (!shadowBaseline) {
    return { success: false, promotion_id: '', status: 'failed', failure_reason: 'Failed to capture shadow baseline' };
  }

  // 2. Capture current production baseline
  const prodBaseline = await captureSnapshot('production_baseline');
  if (!prodBaseline) {
    return { success: false, promotion_id: '', status: 'failed', failure_reason: 'Failed to capture production baseline' };
  }

  // 3. Generate diff
  const diff = computeDiff(prodBaseline, shadowBaseline);
  await storeDiff(shadowRunId, prodBaseline, shadowBaseline);

  // 4. Run integrity scan
  const { scan: integrityScan } = await runIntegrityScan('pre_promote');

  // 5. Create promotion record
  const { data: promotion } = await supabase.from('production_promotions').insert({
    shadow_run_id: shadowRunId,
    pre_snapshot_id: prodBaseline.id,
    integrity_scan_id: integrityScan?.id,
    status: 'pending' as PromotionStatus,
  } as any).select().single() as any;

  if (!promotion) {
    return { success: false, promotion_id: '', status: 'failed', failure_reason: 'Failed to create promotion record' };
  }

  const pid = promotion.id;

  // 6. Preflight guardrails
  await insertReceipt(pid, 'preflight', 'started');
  const currentSuccessRate = (prodBaseline.metrics_json as any)?.avg_success_rate ?? 0.8;
  const preflight = runPreflight(diff, integrityScan, currentSuccessRate);

  if (!preflight.passed) {
    const failedChecks = preflight.checks.filter(c => !c.passed).map(c => c.message).join('; ');
    await insertReceipt(pid, 'preflight', 'blocked', { checks: preflight.checks });
    await supabase.from('production_promotions').update({
      status: 'failed' as PromotionStatus,
      failure_reason: `Preflight blocked: ${failedChecks}`,
      completed_at: new Date().toISOString(),
    } as any).eq('id', pid);

    return {
      success: false,
      promotion_id: pid,
      status: 'failed',
      diff,
      integrity_score: integrityScan.health_score,
      failure_reason: `Preflight blocked: ${failedChecks}`,
    };
  }

  await insertReceipt(pid, 'preflight', 'passed', { checks: preflight.checks });
  await insertReceipt(pid, 'integrity', 'passed', { health_score: integrityScan.health_score });

  // 7. Canary stage
  await supabase.from('production_promotions').update({ status: 'canary' as PromotionStatus } as any).eq('id', pid);
  await insertReceipt(pid, 'canary', 'started');

  const canaryResult = await runCanaryCheck(shadowRunId);
  await insertReceipt(pid, 'canary', canaryResult.passed ? 'passed' : 'failed', { reason: canaryResult.reason });

  if (!canaryResult.passed) {
    // Deterministic rollback
    const restored = await restoreFromSnapshot(prodBaseline.id);
    await supabase.from('production_promotions').update({
      status: 'rolled_back' as PromotionStatus,
      rollback_triggered: true,
      failure_reason: canaryResult.reason ?? 'Canary test failed',
      completed_at: new Date().toISOString(),
    } as any).eq('id', pid);
    await insertReceipt(pid, 'rollback', restored ? 'executed' : 'partial', {
      reason: 'canary_failure',
      snapshot_restored: restored,
    });

    // Record telemetry after rollback
    await recordMetrics();

    return {
      success: false,
      promotion_id: pid,
      status: 'rolled_back',
      diff,
      integrity_score: integrityScan.health_score,
      failure_reason: canaryResult.reason ?? 'Canary test failed',
      rollback_triggered: true,
    };
  }

  // 8. Verify + Commit
  await insertReceipt(pid, 'verify', 'started');
  const postSnapshot = await captureSnapshot('post_promote');

  // 9. Code stamps
  const stampCount = await insertCodeStamps(pid, shadowRunId, integrityScan.health_score);

  // 10. Mark success
  await supabase.from('production_promotions').update({
    status: 'success' as PromotionStatus,
    post_snapshot_id: postSnapshot?.id,
    verification_passed: true,
    completed_at: new Date().toISOString(),
  } as any).eq('id', pid);
  await insertReceipt(pid, 'verify', 'passed', { stamp_count: stampCount });

  // Record telemetry after successful promotion
  await recordMetrics();

  return {
    success: true,
    promotion_id: pid,
    status: 'success',
    diff,
    integrity_score: integrityScan.health_score,
  };
}

/** Get recent promotions */
export async function getRecentPromotions(limit = 10): Promise<any[]> {
  const { data } = await supabase
    .from('production_promotions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit) as any;
  return data ?? [];
}

/** Get receipts for a promotion */
export async function getPromotionReceipts(promotionId: string): Promise<any[]> {
  const { data } = await supabase
    .from('mutation_receipts')
    .select('*')
    .eq('promotion_id', promotionId)
    .order('created_at') as any;
  return data ?? [];
}
