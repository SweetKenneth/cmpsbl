/**
 * Promotion Service — Governed shadow→production pipeline
 * NO side effects on import. Only invoked via user action.
 * 
 * Flow:
 *   1. Validate shadow run exists & passed (phase = shadow_applied, TSAC pass)
 *   2. Check integrity scan health
 *   3. Create pre-promote snapshot
 *   4. Advance evolution_run phase → production_applied
 *   5. Record promotion in production_promotions
 *   6. Create post-promote snapshot
 */

import { supabase } from '@/integrations/supabase/client';
import { snapshotService } from './snapshot-service';

export interface PromotionCandidate {
  run_id: string;
  plan_id: string;
  phase: string;
  confidence_score: number | null;
  risk_level: string | null;
  tsac_shadow_score: number | null;
  tsac_shadow_verdict: string | null;
  created_at: string;
  plan_title?: string;
}

/** Fetch shadow runs eligible for production promotion */
async function getPromotionCandidates(): Promise<PromotionCandidate[]> {
  try {
    const { data: runs } = await supabase
      .from('evolution_runs')
      .select('run_id, plan_id, phase, confidence_score, risk_level, tsac_shadow_score, tsac_shadow_verdict, created_at')
      .eq('phase', 'shadow_applied')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!runs?.length) return [];

    // Enrich with plan titles
    const planIds = [...new Set(runs.map(r => r.plan_id))];
    const { data: plans } = await supabase
      .from('substrate_upgrade_plans')
      .select('id, title')
      .in('id', planIds);

    const titleMap = new Map((plans ?? []).map(p => [p.id, p.title]));

    return runs.map(r => ({
      ...r,
      plan_title: titleMap.get(r.plan_id) ?? r.plan_id.slice(0, 12),
    }));
  } catch {
    return [];
  }
}

/** Run safety gates and promote a shadow run to production */
async function promoteToProduction(runId: string) {
  try {
    // Gate 0: Auth
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    // Gate 1: Validate the run exists and is in shadow_applied phase
    const { data: run, error: runErr } = await supabase
      .from('evolution_runs')
      .select('run_id, plan_id, phase, confidence_score, tsac_shadow_verdict')
      .eq('run_id', runId)
      .single();

    if (runErr || !run) return { success: false, error: 'Shadow run not found' };
    if (run.phase !== 'shadow_applied') {
      return { success: false, error: `Run is in '${run.phase}' phase, expected 'shadow_applied'` };
    }

    // Gate 2: TSAC shadow verdict must be pass (warn allowed with confirmation)
    if (run.tsac_shadow_verdict === 'fail') {
      return { success: false, error: 'TSAC shadow verdict is FAIL — cannot promote' };
    }

    // Gate 3: Integrity scan health
    const { data: latestScan } = await supabase
      .from('integrity_scan_runs')
      .select('health_score, errors_found')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestScan) {
      return { success: false, error: 'No integrity scan found. Run a scan first.' };
    }

    if ((latestScan.health_score ?? 0) < 60) {
      return { success: false, error: `Integrity health too low: ${latestScan.health_score}%. Minimum 60% required.` };
    }

    // Gate 4: Pre-promote snapshot
    const preSnapshot = await snapshotService.createSnapshot('pre_promote', {
      metrics: { runId, planId: run.plan_id },
    });
    if (!preSnapshot.success) {
      return { success: false, error: 'Failed to create pre-promote snapshot' };
    }

    // Gate 5: Advance the evolution run phase to production_applied
    const { error: advanceError } = await supabase
      .from('evolution_runs')
      .update({ phase: 'production_applied', updated_at: new Date().toISOString() } as never)
      .eq('run_id', runId);

    if (advanceError) {
      return { success: false, error: `Phase advance failed: ${advanceError.message}` };
    }

    // Gate 6: Record promotion
    const { data: promotion, error: promError } = await supabase
      .from('production_promotions')
      .insert({
        shadow_run_id: runId,
        status: 'completed',
        pre_snapshot_id: (preSnapshot.data as any)?.id,
        verification_passed: run.tsac_shadow_verdict === 'pass',
        completed_at: new Date().toISOString(),
      } as never)
      .select()
      .single();

    if (promError) {
      // Rollback phase
      await supabase
        .from('evolution_runs')
        .update({ phase: 'shadow_applied' } as never)
        .eq('run_id', runId);
      return { success: false, error: `Promotion record failed: ${promError.message}` };
    }

    // Gate 7: Post-promote snapshot
    const postSnapshot = await snapshotService.createSnapshot('post_promote', {
      metrics: { runId, planId: run.plan_id, promotionId: (promotion as any)?.id },
    });

    if (postSnapshot.success) {
      await supabase
        .from('production_promotions')
        .update({ post_snapshot_id: (postSnapshot.data as any)?.id } as never)
        .eq('id', (promotion as any).id);
    }

    return {
      success: true,
      promotionId: (promotion as any).id,
      runId,
      planId: run.plan_id,
      healthScore: latestScan.health_score,
    };
  } catch (err: any) {
    console.warn('[EvolutionMesh:Promote] Error:', err);
    return { success: false, error: err.message || 'Promotion failed unexpectedly' };
  }
}

/** Rollback a promotion by reverting the evolution run phase */
async function rollbackPromotion(promotionId: string) {
  try {
    const { data: promo } = await supabase
      .from('production_promotions')
      .select('shadow_run_id')
      .eq('id', promotionId)
      .single();

    if (!promo?.shadow_run_id) return { success: false, error: 'Promotion not found' };

    // Revert evolution run to shadow_applied
    await supabase
      .from('evolution_runs')
      .update({ phase: 'shadow_applied', updated_at: new Date().toISOString() } as never)
      .eq('run_id', promo.shadow_run_id);

    // Mark promotion as rolled back
    await supabase
      .from('production_promotions')
      .update({ status: 'rolled_back', rollback_triggered: true } as never)
      .eq('id', promotionId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function listPromotions(limit = 20) {
  try {
    const { data } = await supabase
      .from('production_promotions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export const promotionService = {
  getPromotionCandidates,
  promoteToProduction,
  rollbackPromotion,
  listPromotions,
};
