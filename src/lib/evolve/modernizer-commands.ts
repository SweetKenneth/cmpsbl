/**
 * Modernizer Commands — Terminal & API Command Interface
 * v0.7.5 — Unified command layer for evolution operations
 */

import { evolutionRuns, type EvolutionRun, type CreateRunOptions } from './evolution-runs';
import { evolutionReceipts, type EvolutionReceipt } from './evolution-receipts';
import { shadowExecutor } from './shadow-executor';
import { productionExecutor } from './production-executor';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  formatted?: string;
}

export interface JobsResult {
  active: EvolutionRun | null;
  recent: EvolutionRun[];
  total_count: number;
}

// ═══════════════════════════════════════════════════════════════
// MODERNIZER COMMANDS
// ═══════════════════════════════════════════════════════════════

export const modernizerCommands = {
  /**
   * modernizer.status — Get current evolution status
   */
  async status(): Promise<CommandResult> {
    const activeRun = await evolutionRuns.getActiveRun();
    
    if (!activeRun) {
      return {
        success: true,
        data: { status: 'idle', message: 'No active evolution' },
        formatted: '✅ Modernizer idle — no active evolution',
      };
    }

    return {
      success: true,
      data: {
        status: 'active',
        run_id: activeRun.run_id,
        phase: activeRun.phase,
        plan_id: activeRun.plan_id,
        created_at: activeRun.created_at,
      },
      formatted: `🔄 Active evolution: ${activeRun.run_id.substring(0, 8)}... (phase: ${activeRun.phase})`,
    };
  },

  /**
   * modernizer.jobs — List all evolution runs
   */
  async jobs(limit = 10): Promise<CommandResult> {
    const activeRun = await evolutionRuns.getActiveRun();
    const allRuns = await evolutionRuns.getAllRuns(limit);

    const result: JobsResult = {
      active: activeRun,
      recent: allRuns,
      total_count: allRuns.length,
    };

    const lines = ['╔══════════════════════════════════════════════════════════════╗'];
    lines.push('║  EVOLUTION JOBS                                              ║');
    lines.push('╠══════════════════════════════════════════════════════════════╣');
    
    if (activeRun) {
      lines.push(`║  🔄 ACTIVE: ${activeRun.run_id.substring(0, 8)}... | ${activeRun.phase.padEnd(20)} ║`);
      lines.push('╠══════════════════════════════════════════════════════════════╣');
    }

    for (const run of allRuns.slice(0, 5)) {
      const status = run.phase === 'verified' ? '✅' : run.phase === 'failed' ? '❌' : '⏳';
      lines.push(`║  ${status} ${run.run_id.substring(0, 8)}... | ${run.phase.padEnd(20)} | ${new Date(run.created_at).toLocaleDateString()} ║`);
    }

    lines.push('╚══════════════════════════════════════════════════════════════╝');

    return {
      success: true,
      data: result,
      formatted: lines.join('\n'),
    };
  },

  /**
   * modernizer.evolve shadow — Execute shadow apply
   */
  async evolveShadow(plan_id?: string): Promise<CommandResult> {
    // Check for active run or create new one
    let run = await evolutionRuns.getActiveRun();
    
    if (!run) {
      if (!plan_id) {
        return {
          success: false,
          error: 'No active evolution and no plan_id provided',
          formatted: '❌ No active evolution. Provide a plan_id to start one.',
        };
      }

      const createResult = await evolutionRuns.createRun({ plan_id });
      if (!createResult.success || !createResult.run) {
        return {
          success: false,
          error: createResult.error,
          formatted: `❌ Failed to create evolution run: ${createResult.error}`,
        };
      }
      run = createResult.run;
    }

    // Execute shadow
    const result = await shadowExecutor.execute({
      run_id: run.run_id,
      changes: [], // Would come from CodeAgent
    });

    if (result.idempotent_hit) {
      return {
        success: true,
        data: result,
        formatted: `✅ Shadow already applied for run ${result.run_id.substring(0, 8)}... (idempotent)`,
      };
    }

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        formatted: `❌ Shadow apply failed: ${result.error}`,
      };
    }

    return {
      success: true,
      data: result,
      formatted: `✅ Shadow applied: ${result.changes_applied} changes | Receipt: ${result.receipt_id?.substring(0, 8)}...`,
    };
  },

  /**
   * modernizer.evolve production — Execute production apply
   */
  async evolveProduction(): Promise<CommandResult> {
    const run = await evolutionRuns.getActiveRun();
    
    if (!run) {
      return {
        success: false,
        error: 'No active evolution run',
        formatted: '❌ No active evolution. Run shadow first.',
      };
    }

    if (run.phase !== 'shadow_applied') {
      return {
        success: false,
        error: `Cannot apply to production: run must be in shadow_applied phase (current: ${run.phase})`,
        formatted: `❌ Cannot apply to production: current phase is ${run.phase}. Shadow must be applied first.`,
      };
    }

    const result = await productionExecutor.execute({ run_id: run.run_id });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        formatted: `❌ Production apply failed: ${result.error}`,
      };
    }

    return {
      success: true,
      data: result,
      formatted: `✅ Production applied: ${result.changes_applied} changes | Backup: ${result.backup_id?.substring(0, 8)}... | Receipt: ${result.receipt_id?.substring(0, 8)}...`,
    };
  },

  /**
   * modernizer.evolve verify — Verify and complete evolution
   */
  async evolveVerify(): Promise<CommandResult> {
    const run = await evolutionRuns.getActiveRun();
    
    if (!run) {
      return {
        success: false,
        error: 'No active evolution run',
        formatted: '❌ No active evolution to verify.',
      };
    }

    const result = await productionExecutor.verify(run.run_id);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        formatted: `❌ Verification failed: ${result.error}`,
      };
    }

    return {
      success: true,
      data: { run_id: run.run_id, phase: 'verified' },
      formatted: `✅ Evolution verified and complete: ${run.run_id.substring(0, 8)}...`,
    };
  },

  /**
   * modernizer.evolve abort — Abort active evolution
   */
  async evolveAbort(reason?: string): Promise<CommandResult> {
    const run = await evolutionRuns.getActiveRun();
    
    if (!run) {
      return {
        success: false,
        error: 'No active evolution to abort',
        formatted: '❌ No active evolution to abort.',
      };
    }

    const result = await evolutionRuns.abortRun(run.run_id, reason);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        formatted: `❌ Abort failed: ${result.error}`,
      };
    }

    return {
      success: true,
      data: { run_id: run.run_id, phase: 'aborted' },
      formatted: `✅ Evolution aborted: ${run.run_id.substring(0, 8)}...${reason ? ` (reason: ${reason})` : ''}`,
    };
  },

  /**
   * modernizer.receipts — List recent receipts
   */
  async receipts(limit = 10): Promise<CommandResult> {
    const recentReceipts = await evolutionReceipts.getRecentReceipts(limit);

    const lines = ['╔══════════════════════════════════════════════════════════════╗'];
    lines.push('║  EVOLUTION RECEIPTS 🔥                                       ║');
    lines.push('╠══════════════════════════════════════════════════════════════╣');

    if (recentReceipts.length === 0) {
      lines.push('║  No receipts found                                           ║');
    } else {
      for (const receipt of recentReceipts) {
        lines.push(`║  📜 ${receipt.receipt_id.substring(0, 8)}... | ${receipt.phase.padEnd(18)} | ${receipt.changes_applied.length} changes ║`);
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════╝');

    return {
      success: true,
      data: recentReceipts,
      formatted: lines.join('\n'),
    };
  },

  /**
   * modernizer.receipt <run_id> — Get receipt for specific run
   */
  async receipt(run_id: string): Promise<CommandResult> {
    const receipt = await evolutionReceipts.getReceiptByRunId(run_id);

    if (!receipt) {
      return {
        success: false,
        error: 'Receipt not found',
        formatted: `❌ No receipt found for run ${run_id.substring(0, 8)}...`,
      };
    }

    return {
      success: true,
      data: receipt,
      formatted: evolutionReceipts.formatReceipt(receipt),
    };
  },
};

export default modernizerCommands;
