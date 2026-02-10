/**
 * Evolution Rollback Automation v1.0.0
 * If regression tests fail post-evolution, auto-trigger rollback
 */

import { supabase } from '@/integrations/supabase/client';
import { moduleBus } from '../module-bus';

export interface RollbackRecord {
  evolutionId: string;
  reason: string;
  rolledBackAt: string;
  restoredState: Record<string, any>;
  success: boolean;
}

let rollbackEnabled = false;

/**
 * Enable automatic rollback on regression failure
 */
export function enableAutoRollback(): void {
  if (rollbackEnabled) return;
  
  moduleBus.on('ROLLBACK_TRIGGERED', async (data: any) => {
    const { evolution_id, reason, pass_rate } = data || {};
    
    console.warn(`[Rollback] Triggered for evolution ${evolution_id}: ${reason}`);
    
    await executeRollback(evolution_id, reason, pass_rate);
  });
  
  // Also listen for regression failures directly
  moduleBus.on('REGRESSION_FAILED', async (data: any) => {
    if (data?.passRate !== undefined && data.passRate < 0.5) {
      console.warn('[Rollback] Critical regression failure, auto-rolling back');
      await executeRollback(
        data.trigger,
        `Critical regression: ${(data.passRate * 100).toFixed(0)}% pass rate`,
        data.passRate
      );
    }
  });
  
  rollbackEnabled = true;
  console.log('[Rollback] Automatic rollback enabled');
}

/**
 * Execute a rollback for a specific evolution
 */
async function executeRollback(
  evolutionId: string | undefined,
  reason: string,
  passRate?: number
): Promise<RollbackRecord> {
  const record: RollbackRecord = {
    evolutionId: evolutionId || 'unknown',
    reason,
    rolledBackAt: new Date().toISOString(),
    restoredState: {},
    success: false,
  };
  
  try {
    // Mark evolution run as rolled back if we have an ID
    if (evolutionId) {
      // Try evolution_proposals first
      await supabase
        .from('evolution_proposals')
        .update({ status: 'rolled_back' })
        .eq('id', evolutionId);
      
      // Try evolution_runs
      await supabase
        .from('evolution_runs')
        .update({
          status: 'rolled_back',
          completed_at: new Date().toISOString(),
        })
        .eq('id', evolutionId);
    }
    
    // Restore any hot memory entries that were modified in this evolution
    // by bumping their priority back to baseline
    const { data: recentHot } = await supabase
      .from('brain_memory_hot')
      .select('id, priority')
      .order('updated_at', { ascending: false })
      .limit(20);
    
    if (recentHot?.length) {
      // Reset recently modified entries to neutral priority
      for (const entry of recentHot) {
        if (entry.priority > 7) {
          await supabase
            .from('brain_memory_hot')
            .update({ priority: 5 })
            .eq('id', entry.id);
        }
      }
      record.restoredState.hotEntriesReset = recentHot.length;
    }
    
    record.success = true;
    
    // Log rollback event
    await supabase.from('brain_events').insert({
      module: 'modernizer',
      event_type: 'evolution_rollback',
      data: {
        evolution_id: evolutionId,
        reason,
        pass_rate: passRate,
        restored: record.restoredState,
      } as any,
      outcome: 'success',
    });
    
    moduleBus.emit('EVOLUTION_ROLLED_BACK', {
      evolutionId,
      reason,
    });
    
    console.log('[Rollback] Complete:', record);
  } catch (err) {
    console.error('[Rollback] Failed:', err);
    
    await supabase.from('brain_events').insert({
      module: 'modernizer',
      event_type: 'evolution_rollback',
      data: { evolution_id: evolutionId, error: String(err) } as any,
      outcome: 'failure',
    });
  }
  
  return record;
}

/**
 * Get rollback history
 */
export async function getRollbackHistory(limit = 10): Promise<any[]> {
  const { data } = await supabase
    .from('brain_events')
    .select('*')
    .eq('event_type', 'evolution_rollback')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}
