/**
 * Shadow Executor — Idempotent Shadow Phase Execution
 * Handles shadow_apply with proper state management
 */

import { evolutionRuns, type EvolutionRun } from './evolution-runs';
import { evolutionReceipts, type ChangeRecord, type HealthSnapshot } from './evolution-receipts';
import { shadowStore } from './shadow-store';
import { emitEvolveEvent } from './telemetry';
import { enforceExecutionBarrier, isExternalAIMode } from './execution-mode';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ShadowExecuteResult {
  success: boolean;
  run_id: string;
  phase: string;
  changes_applied: number;
  receipt_id?: string;
  error?: string;
  idempotent_hit?: boolean;
}

export interface ShadowExecuteOptions {
  run_id: string;
  changes: ChangeRecord[];
  health_before?: HealthSnapshot;
}

// ═══════════════════════════════════════════════════════════════
// SHADOW EXECUTOR
// ═══════════════════════════════════════════════════════════════

class ShadowExecutor {
  /**
   * Execute shadow apply with idempotency
   */
  async execute(options: ShadowExecuteOptions): Promise<ShadowExecuteResult> {
    const { run_id, changes, health_before } = options;

    // GOVERNANCE BARRIER: Block executor when in external-ai mode
    if (isExternalAIMode()) {
      enforceExecutionBarrier('shadow_executor.execute');
      return {
        success: false,
        run_id,
        phase: 'blocked',
        changes_applied: 0,
        error: 'Shadow executor blocked by external-ai execution mode.',
      };
    }

    emitEvolveEvent('shadow_execute_started', { run_id });

    // Get current run
    const run = await evolutionRuns.getRun(run_id);
    if (!run) {
      return {
        success: false,
        run_id,
        phase: 'unknown',
        changes_applied: 0,
        error: 'Evolution run not found',
      };
    }

    // IDEMPOTENCY: If already shadow_applied, return success
    if (run.phase === 'shadow_applied') {
      emitEvolveEvent('shadow_execute_idempotent', { run_id });
      return {
        success: true,
        run_id,
        phase: 'shadow_applied',
        changes_applied: 0,
        receipt_id: run.receipt_id || undefined,
        idempotent_hit: true,
      };
    }

    // BLOCK: If phase > shadow_applied, cannot re-apply
    if (run.phase === 'production_applied' || run.phase === 'verified') {
      return {
        success: false,
        run_id,
        phase: run.phase,
        changes_applied: 0,
        error: `Cannot shadow-apply: run already at phase ${run.phase}`,
      };
    }

    // BLOCK: If in terminal state
    if (run.phase === 'aborted' || run.phase === 'failed') {
      return {
        success: false,
        run_id,
        phase: run.phase,
        changes_applied: 0,
        error: `Cannot shadow-apply: run is ${run.phase}`,
      };
    }

    try {
      // Write changes to shadow store
      for (const change of changes) {
        // Map 'update' to 'modify' for shadow store compatibility
        const operation = change.operation === 'update' ? 'modify' : change.operation;
        
        const writeResult = await shadowStore.writeArtifact(
          run_id,
          change.file_path,
          '', // Content would come from CodeAgent
          { operation }
        );
        
        if (!writeResult.success) {
          throw new Error(`Shadow write failed for ${change.file_path}: ${writeResult.error}`);
        }
      }

      // Get health after
      const health_after: HealthSnapshot = {
        overall_score: 0.95, // Would be calculated
        module_health: {},
        error_count: 0,
        warning_count: 0,
      };

      // Create receipt
      const receiptResult = await evolutionReceipts.createReceipt({
        run_id,
        plan_id: run.plan_id,
        phase: 'shadow_applied',
        changes_applied: changes,
        tests_run: 0,
        tests_passed: 0,
        health_before,
        health_after,
      });

      if (!receiptResult.success || !receiptResult.receipt) {
        throw new Error('Failed to create shadow receipt');
      }

      // Transition phase
      const transitionResult = await evolutionRuns.transitionPhase(run_id, 'shadow_applied');
      if (!transitionResult.success) {
        throw new Error(`Phase transition failed: ${transitionResult.error}`);
      }

      // Link receipt to run
      await evolutionRuns.linkReceipt(run_id, receiptResult.receipt.receipt_id);

      emitEvolveEvent('shadow_execute_completed', {
        run_id,
        receipt_id: receiptResult.receipt.receipt_id,
        changes_count: changes.length,
      });

      return {
        success: true,
        run_id,
        phase: 'shadow_applied',
        changes_applied: changes.length,
        receipt_id: receiptResult.receipt.receipt_id,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Shadow execution failed';
      
      // Mark run as failed
      await evolutionRuns.failRun(run_id, errorMessage);

      emitEvolveEvent('shadow_execute_failed', { run_id, error: errorMessage });

      return {
        success: false,
        run_id,
        phase: 'failed',
        changes_applied: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Verify shadow artifacts exist and are valid
   */
  async verifyShadow(run_id: string): Promise<{ valid: boolean; error?: string }> {
    const artifacts = shadowStore.getArtifacts(run_id);
    
    if (artifacts.length === 0) {
      return { valid: false, error: 'No shadow artifacts found' };
    }

    // Check all artifacts have content
    for (const artifact of artifacts) {
      if (!artifact.content && artifact.operation !== 'delete') {
        return { valid: false, error: `Artifact missing content: ${artifact.file_path}` };
      }
    }

    return { valid: true };
  }

  /**
   * Get applied changes count for reporting
   */
  getChangesCount(run_id: string): number {
    return shadowStore.getArtifacts(run_id).length;
  }

  /**
   * Get shadow artifacts for a run
   */
  getArtifacts(run_id: string) {
    return shadowStore.getArtifacts(run_id);
  }
}

export const shadowExecutor = new ShadowExecutor();
