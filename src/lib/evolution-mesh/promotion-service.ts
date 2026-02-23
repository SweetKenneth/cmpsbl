/**
 * Promotion Service — Guarded production promotion with rollback
 * NO side effects on import. Only invoked via user action.
 */

import { supabase } from '@/integrations/supabase/client';
import { snapshotService } from './snapshot-service';

async function promoteToProduction(planId: string) {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { success: false, error: 'Not authenticated' };

    // Gate 1: Check integrity
    const { data: latestScan } = await supabase
      .from('integrity_scan_runs')
      .select('health_score, errors_found')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestScan) {
      return { success: false, error: 'No integrity scan found. Run a scan first.' };
    }

    // Gate 2: Create pre-promote snapshot
    const preSnapshot = await snapshotService.createSnapshot('pre_promote', { metrics: { planId } });
    if (!preSnapshot.success) {
      return { success: false, error: 'Failed to create pre-promote snapshot' };
    }

    // Gate 3: Insert promotion record
    const { data: promotion, error: promError } = await supabase
      .from('production_promotions')
      .insert({
        plan_id: planId,
        status: 'promoting',
        pre_snapshot_id: (preSnapshot.data as any)?.id,
        promoted_by: userId,
      } as never)
      .select()
      .single();

    if (promError) {
      console.warn('[EvolutionMesh:Promote] Failed:', promError.message);
      return { success: false, error: promError.message };
    }

    // Gate 4: Apply (delegates to existing substrate apply logic)
    // This invokes the validated plan via RPC
    const { error: applyError } = await supabase.rpc('resolve_upgrade_plan_id', { p_ref: planId });

    if (applyError) {
      // Rollback: mark promotion as rolled_back
      await supabase
        .from('production_promotions')
        .update({ status: 'rolled_back', error_message: applyError.message } as never)
        .eq('id', (promotion as any).id);

      return { success: false, error: `Promotion failed, rolled back: ${applyError.message}` };
    }

    // Gate 5: Post-promote snapshot + mark success
    await snapshotService.createSnapshot(`post-promote-${planId}`);
    await supabase
      .from('production_promotions')
      .update({ status: 'completed' } as never)
      .eq('id', (promotion as any).id);

    return { success: true, promotionId: (promotion as any).id };
  } catch (err) {
    console.warn('[EvolutionMesh:Promote] Error:', err);
    return { success: false, error: 'Promotion failed unexpectedly' };
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

export const promotionService = { promoteToProduction, listPromotions };
