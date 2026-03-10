/**
 * Evolution Rollback Automation v1.0.0
 * If regression tests fail post-evolution, auto-trigger rollback
 */

import { supabase } from '@/integrations/supabase/client';
import { subscribe, publish, type ModuleName } from '../module-bus';

export interface RollbackRecord {
  evolutionId: string;
  reason: string;
  rolledBackAt: string;
  restoredState: Record<string, unknown>;
  success: boolean;
}

let rollbackEnabled = false;

/**
 * Enable automatic rollback on regression failure
 */
export function enableAutoRollback(): void {
  if (rollbackEnabled) return;
  
  subscribe('system' as ModuleName, 'rollback.triggered', async (signal) => {
    const { evolution_id, reason, pass_rate } = signal.payload || {};
    console.warn(`[Rollback] Triggered for evolution ${evolution_id}: ${reason}`);
    await executeRollback(evolution_id, reason, pass_rate);
  });
  
  subscribe('system' as ModuleName, 'regression.failed', async (signal) => {
    if (signal.payload?.passRate !== undefined && signal.payload.passRate < 0.5) {
      console.warn('[Rollback] Critical regression failure, auto-rolling back');
      await executeRollback(
        signal.payload.trigger,
        `Critical regression: ${(signal.payload.passRate * 100).toFixed(0)}% pass rate`,
        signal.payload.passRate
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
    if (evolutionId) {
      await supabase
        .from('evolution_proposals')
        .update({ status: 'rolled_back' })
        .eq('id', evolutionId);
    }
    
    // Reset recently boosted hot memory entries
    const { data: recentHot } = await supabase
      .from('brain_memory_hot')
      .select('id, priority')
      .order('updated_at', { ascending: false })
      .limit(20);
    
    if (recentHot?.length) {
      for (const entry of recentHot) {
        if ((entry.priority ?? 0) > 7) {
          await supabase
            .from('brain_memory_hot')
            .update({ priority: 5 })
            .eq('id', entry.id);
        }
      }
      record.restoredState.hotEntriesReset = recentHot.length;
    }
    
    record.success = true;
    
    await supabase.from('brain_events').insert([{
      module: 'evolution',
      event_type: 'evolution_rollback',
      data: {
        evolution_id: evolutionId,
        reason,
        pass_rate: passRate,
        restored: record.restoredState,
      } as unknown as import('@/integrations/supabase/types').Json,
      outcome: 'success',
    }]);
    
    publish('evolution' as ModuleName, 'evolution.rolled_back', {
      evolutionId,
      reason,
    });
    
    console.log('[Rollback] Complete:', record);
  } catch (err) {
    console.error('[Rollback] Failed:', err);
    await supabase.from('brain_events').insert([{
      module: 'modernizer',
      event_type: 'evolution_rollback',
      data: { evolution_id: evolutionId, error: String(err) } as unknown as import('@/integrations/supabase/types').Json,
      outcome: 'failure',
    }]);
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
