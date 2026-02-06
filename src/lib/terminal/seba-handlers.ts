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
    const status = await sebaAgent.getStatus();
    const health = await sebaAgent.getHealth();
    
    return {
      success: true,
      data: {
        version: '2.0.0',
        codename: 'Full Spectrum Autonomy',
        mode: status.mode,
        phase: status.current_phase,
        health: {
          agent_health: health.agent_health,
          cognitive_utilization: health.cognitive_utilization,
          governance_compliance: health.governance_compliance,
        },
        cycles: {
          total: status.total_cycles,
          successful: status.successful_cycles,
          failed: status.failed_cycles,
          blocked: status.blocked_cycles,
          today: status.cycles_today,
        },
        proposals: {
          pending: status.pending_proposals,
          approved: status.approved_proposals,
          rejected: status.rejected_proposals,
          executed: status.executed_proposals,
        },
        config: {
          auto_approve_threshold: status.auto_approve_threshold,
          risk_tolerance: status.risk_tolerance,
        },
      },
    };
  });

  // seba.health — Get SEBA health metrics
  registerHandler('seba.health', async () => {
    const health = await sebaAgent.getHealth();
    
    return {
      success: true,
      data: health,
    };
  });

  // seba.pulse — Lightweight heartbeat
  registerHandler('seba.pulse', async () => {
    const health = await sebaAgent.getHealth();
    
    return {
      success: true,
      data: {
        status: health.agent_health >= 80 ? 'healthy' : health.agent_health >= 50 ? 'degraded' : 'critical',
        health_score: health.agent_health,
        mode: 'active',
      },
    };
  });

  // seba.cycle — Run a SEBA evolution cycle
  registerHandler('seba.cycle', async () => {
    const result = await sebaAgent.runCycle();
    
    return {
      success: result.success,
      data: {
        phase_reached: result.phase_reached,
        proposals_generated: result.proposals.length,
        proposals: result.proposals.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          confidence: p.confidence,
          status: p.status,
        })),
        message: result.message,
      },
    };
  });

  // seba.mode — Get/set SEBA mode
  registerHandler('seba.mode', async () => {
    return {
      success: false,
      error: 'Usage: seba.mode <off|observe|shadow|autonomous>',
      modes: {
        off: 'SEBA disabled',
        observe: 'Scan only, no proposals',
        shadow: 'Generate proposals, require approval',
        autonomous: 'Auto-apply low-risk improvements',
      },
    };
  });

  // seba.mode.observe — Set observe mode
  registerHandler('seba.mode.observe', async () => {
    await sebaAgent.setMode('observe');
    return {
      success: true,
      message: 'SEBA mode set to OBSERVE — scanning without proposals',
    };
  });

  // seba.mode.shadow — Set shadow mode
  registerHandler('seba.mode.shadow', async () => {
    await sebaAgent.setMode('shadow');
    return {
      success: true,
      message: 'SEBA mode set to SHADOW — proposals require approval',
    };
  });

  // seba.mode.autonomous — Set autonomous mode
  registerHandler('seba.mode.autonomous', async () => {
    await sebaAgent.setMode('autonomous');
    return {
      success: true,
      message: 'SEBA mode set to AUTONOMOUS — low-risk improvements auto-apply',
      warning: 'High-risk proposals still require approval',
    };
  });

  // seba.proposals — List pending proposals
  registerHandler('seba.proposals', async () => {
    const command = await sebaAgent.executeCommand({ action: 'proposals' });
    
    return {
      success: command.success,
      data: command.data,
    };
  });

  // seba.receipts — View evolution receipts
  registerHandler('seba.receipts', async () => {
    const store = new SEBAReceiptStore();
    const receipts = await store.getReceipts(10);
    
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

  // seba.stamps — View evolution stamps (code comments)
  registerHandler('seba.stamps', async () => {
    const command = await sebaAgent.executeCommand({ action: 'stamps' });
    
    return {
      success: command.success,
      data: command.data,
    };
  });

  // seba.cooldown — Check/set cooldown status
  registerHandler('seba.cooldown', async () => {
    const status = await sebaAgent.getStatus();
    
    return {
      success: true,
      data: {
        in_cooldown: status.current_phase === 'cooldown',
        cycles_today: status.cycles_today,
        message: status.current_phase === 'cooldown' 
          ? 'SEBA is in cooldown period' 
          : 'SEBA ready for next cycle',
      },
    };
  });

  // seba.analyze — Run cognitive analysis
  registerHandler('seba.analyze', async () => {
    const command = await sebaAgent.executeCommand({ action: 'analyze' });
    
    return {
      success: command.success,
      data: {
        description: 'Cognitive analysis complete',
        insights: command.data,
        engines: ['Memory', 'Learning', 'Imagination', 'Reasoning', 'Security', 'Telemetry', 'Governance', 'Resources', 'Architecture'],
      },
    };
  });

  // seba.config — View SEBA configuration
  registerHandler('seba.config', async () => {
    const config = sebaAgent.getConfig();
    
    return {
      success: true,
      data: {
        enabled: config.enabled,
        mode: config.mode,
        auto_approve_threshold: config.auto_approve_threshold,
        risk_tolerance: config.risk_tolerance,
        max_proposals_per_cycle: config.max_proposals_per_cycle,
        max_cycles_per_day: config.max_cycles_per_day,
        cooldown_minutes: config.cooldown_minutes,
      },
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
    lines.push('');
    lines.push('  Operations:');
    lines.push('  ────────────');
    lines.push('    seba.cycle       Run evolution cycle');
    lines.push('    seba.analyze     Run cognitive analysis');
    lines.push('    seba.cooldown    Check cooldown status');
    lines.push('');
    lines.push('  Mode Control:');
    lines.push('  ──────────────');
    lines.push('    seba.mode.observe     Scan only mode');
    lines.push('    seba.mode.shadow      Proposals require approval');
    lines.push('    seba.mode.autonomous  Auto-apply low-risk');
    lines.push('');
    lines.push('  Proposals & History:');
    lines.push('  ─────────────────────');
    lines.push('    seba.proposals   List pending proposals');
    lines.push('    seba.receipts    View evolution receipts');
    lines.push('    seba.stamps      View evolution stamps');
    lines.push('');

    return {
      success: true,
      formatted: lines,
      data: {
        version: '2.0.0',
        command_count: 14,
        categories: ['Status', 'Operations', 'Mode Control', 'History'],
      },
    };
  });

  log.info('terminal', 'SEBA handlers registered', { count: 14 });
}

/**
 * Execute SEBA command with arguments
 */
export async function executeSEBACommand(
  action: string,
  args: Record<string, unknown> = {}
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const result = await sebaAgent.executeCommand({ action, ...args });
  return result;
}
