/**
 * Evolution Commands — Terminal & API Command Interface
 * Unified command layer for evolution operations
 */

import { evolutionRuns, type EvolutionRun, type CreateRunOptions } from './evolution-runs';
import { evolutionReceipts, type EvolutionReceipt } from './evolution-receipts';
import { shadowExecutor } from './shadow-executor';
import { productionExecutor } from './production-executor';
import { emitEvolveEvent } from './telemetry';
import { evolutionScan, formatScanResult, type ScanOptions } from './scan';

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
// EVOLUTION COMMANDS
// ═══════════════════════════════════════════════════════════════

export const evolutionCommands = {
  /**
   * evolution.status — Get current evolution status
   */
  async status(): Promise<CommandResult> {
    const activeRun = await evolutionRuns.getActiveRun();
    
    if (!activeRun) {
      return {
        success: true,
        data: { status: 'idle', message: 'No active evolution' },
        formatted: '✅ EVOLUTION idle — no active evolution',
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
      formatted: `🔄 Active evolution: ${activeRun.run_id} (phase: ${activeRun.phase})`,
    };
  },

  /**
   * evolution.jobs — List all evolution runs
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
      lines.push(`║  🔄 ACTIVE: ${activeRun.run_id}`);
      lines.push(`║     Phase: ${activeRun.phase}`);
      lines.push('╠══════════════════════════════════════════════════════════════╣');
    }

    for (const run of allRuns.slice(0, 5)) {
      const status = run.phase === 'verified' ? '✅' : run.phase === 'failed' ? '❌' : '⏳';
      lines.push(`║  ${status} ${run.run_id}`);
      lines.push(`║     Phase: ${run.phase} | ${new Date(run.created_at).toLocaleDateString()}`);
    }

    lines.push('╚══════════════════════════════════════════════════════════════╝');

    return {
      success: true,
      data: result,
      formatted: lines.join('\n'),
    };
  },

  /**
   * evolution.evolve shadow — Execute shadow apply
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

    // Extract changes from run metadata (populated by scan)
    const metadata = run.metadata || {};
    const scanId = metadata.scan_id as string;
    const totalActions = (metadata.total_actions as number) || 0;
    
    // Build changes array from metadata
    const changes: Array<{ file_path: string; operation: 'create' | 'update' | 'delete'; diff_summary?: string }> = [];
    
    // If we have proposal data in metadata, extract it
    if (metadata.proposals && Array.isArray(metadata.proposals)) {
      for (const proposal of metadata.proposals as Array<Record<string, unknown>>) {
        changes.push({
          file_path: (proposal.target_file as string) || (proposal.title as string) || 'unknown',
          operation: ((proposal.action_type as string) || 'update') as 'create' | 'update' | 'delete',
          diff_summary: (proposal.description as string) || (proposal.title as string),
        });
      }
    }
    
    // If no proposals but we have total_actions, create placeholder entries
    if (changes.length === 0 && totalActions > 0) {
      for (let i = 0; i < totalActions; i++) {
        changes.push({
          file_path: `evolution-action-${i + 1}`,
          operation: 'update',
          diff_summary: `Evolution action ${i + 1} from scan ${scanId || 'unknown'}`,
        });
      }
    }

    // Execute shadow
    const result = await shadowExecutor.execute({
      run_id: run.run_id,
      changes,
      health_before: {
        overall_score: 0.95,
        module_health: { evolution: 100, system: 100 },
        error_count: 0,
        warning_count: 0,
      },
    });

    if (result.idempotent_hit) {
      return {
        success: true,
        data: result,
        formatted: `✅ Shadow already applied for run ${run.run_id} (idempotent)`,
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
      formatted: `✅ Shadow applied: ${result.changes_applied} changes\n   Run: ${run.run_id}\n   Receipt: ${result.receipt_id}`,
    };
  },

  /**
   * evolution.evolve production — Execute production apply
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
      formatted: `✅ Production applied: ${result.changes_applied} changes\n   Backup: ${result.backup_id}\n   Receipt: ${result.receipt_id}`,
    };
  },

  /**
   * evolution.evolve verify — Verify and complete evolution
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
      formatted: `✅ Evolution verified and complete\n   Run: ${run.run_id}`,
    };
  },

  /**
   * evolution.evolve abort — Abort active evolution
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
      formatted: `✅ Evolution aborted\n   Run: ${run.run_id}${reason ? `\n   Reason: ${reason}` : ''}`,
    };
  },

  /**
   * evolution.receipts — List recent receipts
   */
  async receipts(limit = 10): Promise<CommandResult> {
    const recentReceipts = await evolutionReceipts.getRecentReceipts(limit);
    
    // Also get recent evolution runs to show receipt info even if receipts table is empty
    const recentRuns = await evolutionRuns.getAllRuns(limit);

    const lines = ['╔══════════════════════════════════════════════════════════════════════════╗'];
    lines.push('║  EVOLUTION RECEIPTS 🔥                                                   ║');
    lines.push('╠══════════════════════════════════════════════════════════════════════════╣');

    if (recentReceipts.length === 0 && recentRuns.length === 0) {
      lines.push('║  No receipts or evolution runs found                                     ║');
    } else if (recentReceipts.length > 0) {
      for (const receipt of recentReceipts) {
        const testStatus = receipt.tests_run > 0 
          ? `${receipt.tests_passed}/${receipt.tests_run} tests` 
          : 'no tests';
        lines.push(`║  📜 Receipt: ${receipt.receipt_id}`);
        lines.push(`║     Run ID:  ${receipt.run_id}`);
        lines.push(`║     Phase:   ${receipt.phase} | Changes: ${receipt.changes_applied.length} | ${testStatus}`);
        if (receipt.health_before && receipt.health_after) {
          const healthDelta = (receipt.health_after.overall_score - receipt.health_before.overall_score).toFixed(2);
          const arrow = parseFloat(healthDelta) >= 0 ? '↑' : '↓';
          lines.push(`║     Health:  ${receipt.health_before.overall_score.toFixed(2)} → ${receipt.health_after.overall_score.toFixed(2)} (${arrow}${healthDelta})`);
        }
        if (receipt.backup_id) {
          lines.push(`║     Backup:  ${receipt.backup_id}`);
        }
        lines.push(`║     Time:    ${new Date(receipt.timestamp).toLocaleString()}`);
        lines.push('╠──────────────────────────────────────────────────────────────────────────╣');
      }
    } else {
      // Show evolution runs as receipts if no formal receipts exist
      lines.push('║  No formal receipts found — showing evolution run history:               ║');
      lines.push('╠──────────────────────────────────────────────────────────────────────────╣');
      for (const run of recentRuns) {
        const status = run.phase === 'verified' ? '✅' : run.phase === 'failed' ? '❌' : run.phase === 'aborted' ? '⚠️' : '⏳';
        const metadata = run.metadata || {};
        const scanId = (metadata.scan_id as string) || 'N/A';
        const totalActions = (metadata.total_actions as number) || 0;
        
        lines.push(`║  ${status} Run: ${run.run_id}`);
        lines.push(`║     Plan:       ${run.plan_id}`);
        lines.push(`║     Phase:      ${run.phase}`);
        lines.push(`║     Scan ID:    ${scanId}`);
        lines.push(`║     Actions:    ${totalActions}`);
        lines.push(`║     Confidence: ${run.confidence_score !== null ? (run.confidence_score * 100).toFixed(0) + '%' : 'N/A'}`);
        lines.push(`║     Risk:       ${run.risk_level}`);
        lines.push(`║     Created:    ${new Date(run.created_at).toLocaleString()}`);
        if (run.completed_at) {
          lines.push(`║     Completed:  ${new Date(run.completed_at).toLocaleString()}`);
        }
        lines.push('╠──────────────────────────────────────────────────────────────────────────╣');
      }
    }

    lines.pop(); // Remove last separator
    lines.push('╚══════════════════════════════════════════════════════════════════════════╝');

    return {
      success: true,
      data: { receipts: recentReceipts, runs: recentRuns },
      formatted: lines.join('\n'),
    };
  },

  /**
   * evolution.receipt <run_id> — Get receipt for specific run
   */
  async receipt(run_id: string): Promise<CommandResult> {
    const receipt = await evolutionReceipts.getReceiptByRunId(run_id);

    if (!receipt) {
      return {
        success: false,
        error: 'Receipt not found',
        formatted: `❌ No receipt found for run ${run_id}`,
      };
    }

    return {
      success: true,
      data: receipt,
      formatted: evolutionReceipts.formatReceipt(receipt),
    };
  },

  /**
   * evolution.scan — Cognitive systems scan (v0.7.7)
   */
  async scan(options: ScanOptions = {}): Promise<CommandResult> {
    const result = await evolutionScan(options);

    return {
      success: result.plan_ready || result.proposals.length === 0,
      data: result,
      formatted: formatScanResult(result, options),
    };
  },
};

// Deprecated modernizerCommands alias removed — use evolutionCommands
export default evolutionCommands;
