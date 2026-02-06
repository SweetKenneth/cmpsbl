/**
 * SEBA Terminal Handlers
 * v2.0.0 — Terminal commands for Self-Evolving Bounded Agent
 */

import { registerHandler } from './validate-registry';
import { sebaAgent } from '@/lib/substrate/seba';
import { SEBAReceiptStore } from '@/lib/substrate/seba/receipt-store';
import { log } from '@/lib/system/log';

/**
 * Register all SEBA-related terminal commands
 */
export function registerSEBAHandlers(): void {
  // seba.status — Get SEBA agent status
  registerHandler('seba.status', async () => {
    const result = await sebaAgent.handleCommand('status');
    const healthResult = await sebaAgent.handleCommand('health');
    
    return {
      success: result.success,
      data: {
        version: '2.0.0',
        codename: 'Full Spectrum Autonomy',
        ...result.data,
        health: healthResult.data,
      },
    };
  });

  // seba.health — Get SEBA health metrics
  registerHandler('seba.health', async () => {
    const result = await sebaAgent.handleCommand('health');
    
    return {
      success: result.success,
      data: result.data,
    };
  });

  // seba.pulse — Lightweight heartbeat
  registerHandler('seba.pulse', async () => {
    const result = await sebaAgent.handleCommand('status');
    const state = (result.data as any)?.state;
    
    return {
      success: true,
      data: {
        status: state?.agent_health >= 80 ? 'healthy' : state?.agent_health >= 50 ? 'degraded' : 'critical',
        health_score: state?.agent_health || 100,
        mode: (result.data as any)?.config?.mode || 'observe',
      },
    };
  });

  // seba.cycle — Run a SEBA evolution cycle
  registerHandler('seba.cycle', async () => {
    const result = await sebaAgent.handleCommand('cycle');
    const cycleData = result.data as any;
    
    return {
      success: result.success,
      data: {
        phases_completed: cycleData?.phases_completed || [],
        proposals_generated: cycleData?.proposals_generated || 0,
        evolutions_applied: cycleData?.evolutions_applied || 0,
        message: result.message,
      },
    };
  });

  // seba.mode — Get/set SEBA mode
  registerHandler('seba.mode', async () => {
    const result = await sebaAgent.handleCommand('mode');
    return {
      success: result.success,
      data: result.data,
      message: result.message,
      modes: result.suggestions,
    };
  });

  // seba.mode.observe — Set observe mode
  registerHandler('seba.mode.observe', async () => {
    const result = await sebaAgent.handleCommand('mode', { mode: 'observe' });
    return {
      success: result.success,
      message: result.success ? 'SEBA mode set to OBSERVE — scanning without proposals' : result.message,
    };
  });

  // seba.mode.advisory — Set advisory mode (shadow)
  registerHandler('seba.mode.advisory', async () => {
    const result = await sebaAgent.handleCommand('mode', { mode: 'advisory' });
    return {
      success: result.success,
      message: result.success ? 'SEBA mode set to ADVISORY — proposals require approval' : result.message,
    };
  });

  // seba.mode.governed — Set governed mode
  registerHandler('seba.mode.governed', async () => {
    const result = await sebaAgent.handleCommand('mode', { mode: 'governed' });
    return {
      success: result.success,
      message: result.success ? 'SEBA mode set to GOVERNED — auto-execute if governance approves' : result.message,
    };
  });

  // seba.enable — Enable SEBA
  registerHandler('seba.enable', async () => {
    const result = await sebaAgent.handleCommand('enable');
    return {
      success: result.success,
      message: result.message,
    };
  });

  // seba.disable — Disable SEBA
  registerHandler('seba.disable', async () => {
    const result = await sebaAgent.handleCommand('disable');
    return {
      success: result.success,
      message: result.message,
    };
  });

  // seba.proposals — List pending proposals (review queue)
  registerHandler('seba.proposals', async () => {
    const result = await sebaAgent.handleCommand('review');
    return {
      success: result.success,
      data: result.data,
    };
  });

  // seba.receipts — View evolution receipts
  registerHandler('seba.receipts', async () => {
    const receipts = await SEBAReceiptStore.getReceipts(10);
    
    return {
      success: true,
      data: {
        total: receipts.length,
        receipts: receipts.map(r => ({
          id: r.id,
          cycle_id: r.cycle_id,
          phase: r.phase_reached,
          proposals: r.proposals_generated,
          applied: r.proposals_applied,
          created_at: r.created_at,
        })),
      },
    };
  });

  // seba.history — View execution history
  registerHandler('seba.history', async () => {
    const result = await sebaAgent.handleCommand('history', { limit: 10 });
    return {
      success: result.success,
      data: result.data,
    };
  });

  // seba.metrics — Get SEBA metrics
  registerHandler('seba.metrics', async () => {
    const result = await sebaAgent.handleCommand('metrics');
    return {
      success: result.success,
      data: result.data,
    };
  });

  // seba.config — View SEBA configuration
  registerHandler('seba.config', async () => {
    const result = await sebaAgent.handleCommand('config');
    return {
      success: result.success,
      data: result.data,
    };
  });

  // seba.pause — Pause SEBA
  registerHandler('seba.pause', async () => {
    const result = await sebaAgent.handleCommand('pause');
    return {
      success: result.success,
      message: result.message,
    };
  });

  // seba.resume — Resume SEBA
  registerHandler('seba.resume', async () => {
    const result = await sebaAgent.handleCommand('resume');
    return {
      success: result.success,
      message: result.message,
    };
  });

  // seba.help — Show SEBA commands
  registerHandler('seba.help', async () => {
    const lines: string[] = [];
    lines.push('');
    lines.push('┌─────────────────────────────────────────────┐');
    lines.push('│         SEBA COMMAND REFERENCE v2.0         │');
    lines.push('│      Self-Evolving Bounded Agent            │');
    lines.push('└─────────────────────────────────────────────┘');
    lines.push('');
    lines.push('  Status & Health:');
    lines.push('  ─────────────────');
    lines.push('    seba.status      Full agent status');
    lines.push('    seba.health      Health metrics');
    lines.push('    seba.pulse       Lightweight heartbeat');
    lines.push('    seba.config      View configuration');
    lines.push('    seba.metrics     Performance metrics');
    lines.push('');
    lines.push('  Operations:');
    lines.push('  ────────────');
    lines.push('    seba.cycle       Run evolution cycle');
    lines.push('    seba.enable      Enable SEBA');
    lines.push('    seba.disable     Disable SEBA');
    lines.push('    seba.pause       Pause operations');
    lines.push('    seba.resume      Resume operations');
    lines.push('');
    lines.push('  Mode Control:');
    lines.push('  ──────────────');
    lines.push('    seba.mode            Get current mode');
    lines.push('    seba.mode.observe    Scan only mode');
    lines.push('    seba.mode.advisory   Proposals require approval');
    lines.push('    seba.mode.governed   Auto-execute if approved');
    lines.push('');
    lines.push('  Proposals & History:');
    lines.push('  ─────────────────────');
    lines.push('    seba.proposals   List pending proposals');
    lines.push('    seba.receipts    View evolution receipts');
    lines.push('    seba.history     View execution history');
    lines.push('');

    return {
      success: true,
      formatted: lines,
      data: {
        version: '2.0.0',
        command_count: 17,
        categories: ['Status', 'Operations', 'Mode Control', 'History'],
      },
    };
  });

  log.info('terminal', 'SEBA handlers registered', { count: 17 });
}

/**
 * Execute SEBA command with arguments
 */
export async function executeSEBACommand(
  action: string,
  args: Record<string, unknown> = {}
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const result = await sebaAgent.handleCommand(action as any, args);
  return {
    success: result.success,
    data: result.data,
    error: result.success ? undefined : result.message,
  };
}
