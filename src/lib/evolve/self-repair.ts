/**
 * Evolution Self-Repair — Safe Mode Recovery
 * Diagnostic-only repair cycle (NO code mutation)
 */

import { supabase } from '@/integrations/supabase/client';
import { tripCircuit, resetCircuit } from './circuit-breaker';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type RepairOutcome = 'success' | 'partial' | 'failed';

export interface RepairAction {
  action: string;
  module: string;
  result: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

export interface RepairLog {
  repair_id: string;
  run_id: string | null;
  trigger_reason: string;
  actions_taken: RepairAction[];
  outcome: RepairOutcome | null;
  started_at: string;
  completed_at: string | null;
}

export interface RepairResult {
  success: boolean;
  outcome: RepairOutcome;
  actions: RepairAction[];
  can_resume_evolution: boolean;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// ALLOWED REPAIR ACTIONS (SAFE MODE)
// ═══════════════════════════════════════════════════════════════

const ALLOWED_REPAIR_ACTIONS = [
  'system.heal',
  'brain.optimize',
  'vision.resilience',
  'decode.explain',
] as const;

// ═══════════════════════════════════════════════════════════════
// REPAIR CYCLE
// ═══════════════════════════════════════════════════════════════

/**
 * Execute self-repair cycle after evolution failure
 * SAFE MODE: No code mutation allowed
 */
export async function executeSelfRepair(
  runId: string | null,
  triggerReason: string
): Promise<RepairResult> {
  const actions: RepairAction[] = [];

  emitEvolveEvent('self_repair_started', { run_id: runId, reason: triggerReason });

  // Create repair log entry
  const { data: repairLog, error: logError } = await supabase
    .from('evolution_repair_log')
    .insert({
      run_id: runId,
      trigger_reason: triggerReason,
      actions_taken: [] as unknown as any,
    })
    .select()
    .single();

  if (logError) {
    console.error('[SelfRepair] Failed to create log:', logError);
  }

  // Execute allowed repair actions
  for (const action of ALLOWED_REPAIR_ACTIONS) {
    const result = await executeRepairAction(action);
    actions.push(result);
  }

  // Determine outcome
  const successCount = actions.filter(a => a.result === 'success').length;
  const failedCount = actions.filter(a => a.result === 'failed').length;

  let outcome: RepairOutcome;
  if (failedCount === 0) {
    outcome = 'success';
  } else if (successCount > failedCount) {
    outcome = 'partial';
  } else {
    outcome = 'failed';
  }

  // Update repair log
  if (repairLog) {
    await supabase
      .from('evolution_repair_log')
      .update({
        actions_taken: actions as unknown as any,
        outcome,
        completed_at: new Date().toISOString(),
      })
      .eq('repair_id', repairLog.repair_id);
  }

  // Determine if evolution can resume
  const canResume = outcome === 'success';

  // If successful, close circuit; if failed, keep open
  if (canResume) {
    await resetCircuit('Self-repair successful');
  }

  emitEvolveEvent('self_repair_completed', {
    run_id: runId,
    outcome,
    actions_count: actions.length,
    can_resume: canResume,
  });

  return {
    success: outcome !== 'failed',
    outcome,
    actions,
    can_resume_evolution: canResume,
    message: `Self-repair ${outcome}: ${successCount}/${actions.length} actions successful`,
  };
}

/**
 * Execute a single repair action
 */
async function executeRepairAction(action: string): Promise<RepairAction> {
  const [module] = action.split('.');
  const timestamp = new Date().toISOString();

  try {
    switch (action) {
      case 'system.heal':
        // Diagnostic health check
        const healthResult = await runSystemHeal();
        return {
          action,
          module,
          result: healthResult.success ? 'success' : 'failed',
          message: healthResult.message,
          timestamp,
        };

      case 'brain.optimize':
        // Memory optimization (read-only)
        const optimizeResult = await runBrainOptimize();
        return {
          action,
          module,
          result: optimizeResult.success ? 'success' : 'failed',
          message: optimizeResult.message,
          timestamp,
        };

      case 'vision.resilience':
        // Resilience check
        const resilienceResult = await runVisionResilience();
        return {
          action,
          module,
          result: resilienceResult.success ? 'success' : 'failed',
          message: resilienceResult.message,
          timestamp,
        };

      case 'decode.explain':
        // Read-only analysis
        const explainResult = await runDecodeExplain();
        return {
          action,
          module,
          result: explainResult.success ? 'success' : 'failed',
          message: explainResult.message,
          timestamp,
        };

      default:
        return {
          action,
          module,
          result: 'skipped',
          message: `Unknown action: ${action}`,
          timestamp,
        };
    }
  } catch (error) {
    return {
      action,
      module,
      result: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// REPAIR ACTION IMPLEMENTATIONS (DIAGNOSTIC ONLY)
// ═══════════════════════════════════════════════════════════════

async function runSystemHeal(): Promise<{ success: boolean; message: string }> {
  // Check system health metrics
  const { data: health } = await supabase
    .from('brain_events')
    .select('event_type, outcome')
    .order('created_at', { ascending: false })
    .limit(20);

  const errorCount = health?.filter(h => h.outcome === 'error').length || 0;
  const healthScore = 100 - (errorCount * 5);

  return {
    success: healthScore >= 70,
    message: `System health score: ${healthScore}% (${errorCount} recent errors)`,
  };
}

async function runBrainOptimize(): Promise<{ success: boolean; message: string }> {
  // Check memory utilization (read-only) using brain_events as proxy
  const { count: memoryCount } = await supabase
    .from('brain_events')
    .select('*', { count: 'exact', head: true });

  return {
    success: true,
    message: `Brain events indexed: ${memoryCount || 0} entries`,
  };
}

async function runVisionResilience(): Promise<{ success: boolean; message: string }> {
  // Check recent evolution operations as proxy for vision
  const { count: evolutionCount } = await supabase
    .from('evolution_runs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  return {
    success: true,
    message: `Evolution runs in last hour: ${evolutionCount || 0}`,
  };
}

async function runDecodeExplain(): Promise<{ success: boolean; message: string }> {
  // Check evolution receipts as proxy for decode decisions
  const { data: recentReceipts } = await supabase
    .from('evolution_receipts')
    .select('phase')
    .order('timestamp', { ascending: false })
    .limit(10);

  const successRate = recentReceipts?.length 
    ? (recentReceipts.filter(d => d.phase === 'verified' || d.phase === 'production_applied').length / recentReceipts.length) * 100
    : 100;

  return {
    success: successRate >= 50,
    message: `Evolution success rate: ${successRate.toFixed(0)}%`,
  };
}

/**
 * Get recent repair logs
 */
export async function getRepairLogs(limit: number = 10): Promise<RepairLog[]> {
  const { data } = await supabase
    .from('evolution_repair_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  return (data || []).map(d => ({
    repair_id: d.repair_id,
    run_id: d.run_id,
    trigger_reason: d.trigger_reason,
    actions_taken: (d.actions_taken as unknown as RepairAction[]) || [],
    outcome: d.outcome as RepairOutcome | null,
    started_at: d.started_at,
    completed_at: d.completed_at,
  }));
}

/**
 * Trigger repair cycle on evolution failure
 */
export async function onEvolutionFailure(runId: string, failureReason: string): Promise<void> {
  // Trip circuit breaker
  await tripCircuit(failureReason);

  // Execute self-repair
  await executeSelfRepair(runId, failureReason);
}
