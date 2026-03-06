/**
 * SEBA Terminal Handlers
 * Terminal commands for Self-Evolving Bounded Agent
 * 
 * Matches the demo guide output format (docs/internal/EVOLUTION-DEMO-GUIDE.md)
 */

import { registerHandler } from './validate-registry';
import { sebaAgent } from '@/lib/substrate/seba';
import { SEBAReceiptStore } from '@/lib/substrate/seba/receipt-store';
import { ProposalStore } from '@/lib/substrate/seba/proposal-store';
import { log } from '@/lib/system/log';

// ═══════════════════════════════════════════════════════════════════════════════
// OUTPUT FORMATTERS (match demo guide)
// ═══════════════════════════════════════════════════════════════════════════════

function formatBox(title: string, lines: string[]): string[] {
  const maxLen = Math.max(title.length + 4, ...lines.map(l => l.length)) + 4;
  const border = '═'.repeat(maxLen);
  const output: string[] = [];
  
  output.push(`╔${border}╗`);
  output.push(`║  ${title.padEnd(maxLen - 2)}║`);
  output.push(`╠${border}╣`);
  
  for (const line of lines) {
    output.push(`║  ${line.padEnd(maxLen - 2)}║`);
  }
  
  output.push(`╚${border}╝`);
  return output;
}

function formatStatusOutput(state: any, config: any, health: any): string[] {
  const mode = config?.mode || 'observe';
  const phase = state?.current_phase || 'idle';
  const healthScore = health?.overall || state?.agent_health || 100;
  const lastCycle = state?.last_cycle_at ? new Date(state.last_cycle_at).toISOString() : 'Never';
  const pending = state?.pending_proposals || 0;
  const approved = state?.approved_proposals || 0;
  const applied = state?.evolutions_applied || state?.executed_proposals || 0;
  
  return formatBox('SEBA — Full Spectrum Autonomy', [
    '',
    `Mode:        ${mode}`,
    `Phase:       ${phase}`,
    `Health:      ${healthScore}%`,
    `Last Cycle:  ${lastCycle}`,
    `Proposals:   pending: ${pending} | approved: ${approved} | applied: ${applied}`,
    '',
  ]);
}

function formatCycleOutput(cycleData: any): string[] {
  const proposals = cycleData?.proposals_generated || 0;
  const applied = cycleData?.evolutions_applied || 0;
  const phases = cycleData?.phases_completed || [];
  
  if (proposals === 0) {
    return formatBox('✅ CYCLE COMPLETE', [
      '',
      'Phase: COGNITIVE ANALYSIS',
      '',
      'Engines Scanned: 9',
      'Insights Found: 0',
      '',
      'No actionable insights found.',
      'System is operating optimally.',
      '',
    ]);
  }
  
  const lines = [
    '',
    'Phase: PROPOSALS GENERATED',
    '',
    `New Proposals: ${proposals}`,
    `Auto-Applied: ${applied}`,
    '',
    'Status: pending_review (awaiting governance)',
    '',
    'Use seba.review to see pending proposals.',
    '',
  ];
  
  return formatBox('✅ CYCLE COMPLETE', lines);
}

function formatReviewOutput(proposals: any[]): string[] {
  if (!proposals || proposals.length === 0) {
    return formatBox('📋 PENDING PROPOSALS', [
      '',
      'No pending proposals.',
      '',
      'Run seba.cycle to generate new proposals.',
      '',
    ]);
  }
  
  const lines: string[] = [''];
  
  for (const p of proposals.slice(0, 5)) {
    const shortId = p.id?.substring(0, 8) || 'unknown';
    const fullId = p.id || 'unknown';
    const title = p.title || 'Untitled';
    const confidence = typeof p.confidence === 'number' ? (p.confidence * 100).toFixed(0) : 'N/A';
    const impact = (p.expected_impact as any)?.risk_level || 'low';
    const phase = p.execution_phase || 'pending';
    
    // Always show BOTH Short and Full IDs (mobile-friendly)
    lines.push(`Short ID: ${shortId}`);
    lines.push(`Full ID:`);
    lines.push(`  ${fullId}`);
    lines.push('');
    lines.push(`Title: ${title}`);
    lines.push(`Status: ${p.status || 'pending'} | Phase: ${phase}`);
    lines.push(`Risk: ${impact} | Confidence: ${confidence}%`);
    lines.push('');
    lines.push(`Commands:`);
    lines.push(`  seba.approve ${fullId}`);
    lines.push(`  seba.reject ${fullId}`);
    lines.push('─'.repeat(40));
    lines.push('');
  }
  
  if (proposals.length > 5) {
    lines.push(`Showing 5 of ${proposals.length} proposals.`);
    lines.push('');
  }
  
  return formatBox('📋 PENDING PROPOSALS', lines);
}

function formatHistoryOutput(events: any[]): string[] {
  if (!events || events.length === 0) {
    return formatBox('📜 SEBA EVOLUTION HISTORY', [
      '',
      'No evolution history found.',
      '',
    ]);
  }
  
  const lines: string[] = [''];
  
  for (const e of events.slice(0, 10)) {
    const timestamp = new Date(e.created_at).toLocaleString();
    const eventType = e.event_type || 'unknown';
    const outcome = e.outcome || 'success';
    const data = e.data || {};
    
    lines.push(`${timestamp} | ${outcome.toUpperCase()}`);
    lines.push(`[${eventType}] ${data.target || data.proposal_id || ''}`);
    lines.push('');
  }
  
  if (events.length > 10) {
    lines.push(`Showing 10 of ${events.length} entries.`);
    lines.push('');
  }
  
  return formatBox('📜 SEBA EVOLUTION HISTORY', lines);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register all SEBA-related terminal commands
 */
export function registerSEBAHandlers(): void {
  // ═══ seba.status — Get SEBA agent status (formatted) ═══
  registerHandler('seba.status', async () => {
    const result = await sebaAgent.handleCommand('status');
    const healthResult = await sebaAgent.handleCommand('health');
    
    const statusData = result.data || {};
    const state = (statusData as any).state;
    const config = (statusData as any).config;
    const health = healthResult.data;
    
    return {
      success: result.success,
      formatted: formatStatusOutput(state, config, health),
      data: {
        codename: 'Full Spectrum Autonomy',
        state,
        config,
        health,
      },
    };
  });

  // ═══ seba.health — Get SEBA health metrics ═══
  registerHandler('seba.health', async () => {
    const result = await sebaAgent.handleCommand('health');
    
    return {
      success: result.success,
      data: result.data,
    };
  });

  // ═══ seba.pulse — Lightweight heartbeat ═══
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

  // ═══ seba.cycle — Run a SEBA evolution cycle (formatted) ═══
  registerHandler('seba.cycle', async () => {
    const result = await sebaAgent.handleCommand('cycle');
    const cycleData = result.data as any;
    
    return {
      success: result.success,
      formatted: formatCycleOutput(cycleData),
      data: {
        phases_completed: cycleData?.phases_completed || [],
        proposals_generated: cycleData?.proposals_generated || 0,
        proposals_approved: cycleData?.proposals_approved || 0,
        evolutions_applied: cycleData?.evolutions_applied || 0,
        message: result.message,
      },
    };
  });

  // ═══ seba.propose — Generate proposals without full cycle ═══
  registerHandler('seba.propose', async () => {
    const result = await sebaAgent.handleCommand('propose');
    const proposeData = result.data as any;
    
    const proposals = proposeData?.proposals || [];
    
    const lines = [''];
    if (proposals.length === 0) {
      lines.push('No insights found for proposals.');
      lines.push('');
    } else {
      lines.push(`Generated ${proposals.length} proposals from ${proposeData?.insights || 0} insights.`);
      lines.push('');
      for (const p of proposals.slice(0, 5)) {
        lines.push(`• ${p.title}`);
        lines.push(`  ID: ${p.id} | Risk: ${p.risk} | Confidence: ${(p.confidence * 100).toFixed(0)}%`);
        lines.push('');
      }
      lines.push('Use seba.review to see full details.');
      lines.push('');
    }
    
    return {
      success: result.success,
      formatted: formatBox('🔬 PROPOSAL GENERATION', lines),
      data: proposeData,
    };
  });

  // ═══ seba.review — List pending proposals (formatted) ═══
  registerHandler('seba.review', async () => {
    const pending = await ProposalStore.getPending();
    
    return {
      success: true,
      formatted: formatReviewOutput(pending),
      data: { 
        pending_count: pending.length, 
        proposals: pending,
      },
    };
  });

  // ═══ seba.approve <id> — Approve a proposal ═══
  registerHandler('seba.approve', async () => {
    // This handler shows usage when called without args
    return {
      success: true,
      formatted: [
        '',
        '  Usage: seba.approve <proposal_id>',
        '',
        '  Approves a pending proposal for execution.',
        '  Use seba.review to see pending proposals.',
        '',
      ],
      data: { usage: 'seba.approve <proposal_id>' },
    };
  });

  // ═══ seba.reject <id> — Reject a proposal ═══
  registerHandler('seba.reject', async () => {
    return {
      success: true,
      formatted: [
        '',
        '  Usage: seba.reject <proposal_id>',
        '',
        '  Rejects a pending proposal.',
        '  Use seba.review to see pending proposals.',
        '',
      ],
      data: { usage: 'seba.reject <proposal_id>' },
    };
  });

  // ═══ seba.execute <id> — Execute an approved proposal ═══
  registerHandler('seba.execute', async () => {
    return {
      success: true,
      formatted: [
        '',
        '  Usage: seba.execute <proposal_id> [phase]',
        '',
        '  Executes an approved proposal with shadow→production flow.',
        '',
        '  Phases:',
        '    (default)  — Apply to shadow environment',
        '    production — Apply to production (after shadow)',
        '',
        '  Example:',
        '    seba.execute abc12345           — shadow first',
        '    seba.execute abc12345 production — then production',
        '',
      ],
      data: { usage: 'seba.execute <proposal_id> [phase]' },
    };
  });

  // ═══ seba.rollback <id> — Rollback an applied proposal ═══
  registerHandler('seba.rollback', async () => {
    return {
      success: true,
      formatted: [
        '',
        '  Usage: seba.rollback <execution_id>',
        '',
        '  Rolls back an applied evolution.',
        '  Only works for reversible actions.',
        '',
      ],
      data: { usage: 'seba.rollback <execution_id>' },
    };
  });

  // ═══ seba.mode — Get/set SEBA mode ═══
  registerHandler('seba.mode', async () => {
    const result = await sebaAgent.handleCommand('mode');
    
    const lines = [
      '',
      `Current Mode: ${(result.data as any)?.current_mode || 'observe'}`,
      '',
      'Available Modes:',
      '  off      — SEBA disabled',
      '  observe  — Scan only, no proposals',
      '  advisory — Proposals require approval (default)',
      '  governed — Auto-execute low-risk approved',
      '',
      'Use seba.mode.<mode> to change.',
      '',
    ];
    
    return {
      success: result.success,
      formatted: formatBox('SEBA MODE', lines),
      data: result.data,
      modes: result.suggestions,
    };
  });

  // ═══ seba.mode.observe — Set observe mode ═══
  registerHandler('seba.mode.observe', async () => {
    const result = await sebaAgent.handleCommand('mode', { mode: 'observe' });
    return {
      success: result.success,
      formatted: ['', '✅ SEBA mode set to OBSERVE — scanning without proposals', ''],
      message: result.success ? 'SEBA mode set to OBSERVE — scanning without proposals' : result.message,
    };
  });

  // ═══ seba.mode.advisory — Set advisory mode ═══
  registerHandler('seba.mode.advisory', async () => {
    const result = await sebaAgent.handleCommand('mode', { mode: 'advisory' });
    return {
      success: result.success,
      formatted: ['', '✅ SEBA mode set to ADVISORY — proposals require approval', ''],
      message: result.success ? 'SEBA mode set to ADVISORY — proposals require approval' : result.message,
    };
  });

  // ═══ seba.mode.governed — Set governed mode ═══
  registerHandler('seba.mode.governed', async () => {
    const result = await sebaAgent.handleCommand('mode', { mode: 'governed' });
    return {
      success: result.success,
      formatted: ['', '✅ SEBA mode set to GOVERNED — auto-execute if governance approves', ''],
      message: result.success ? 'SEBA mode set to GOVERNED — auto-execute if governance approves' : result.message,
    };
  });

  // ═══ seba.enable — Enable SEBA ═══
  registerHandler('seba.enable', async () => {
    const result = await sebaAgent.handleCommand('enable');
    return {
      success: result.success,
      formatted: ['', '✅ SEBA enabled', ''],
      message: result.message,
    };
  });

  // ═══ seba.disable — Disable SEBA ═══
  registerHandler('seba.disable', async () => {
    const result = await sebaAgent.handleCommand('disable');
    return {
      success: result.success,
      formatted: ['', '❌ SEBA disabled', ''],
      message: result.message,
    };
  });

  // ═══ seba.proposals — Alias for seba.review ═══
  registerHandler('seba.proposals', async () => {
    const pending = await ProposalStore.getPending();
    return {
      success: true,
      formatted: formatReviewOutput(pending),
      data: { pending_count: pending.length, proposals: pending },
    };
  });

  // ═══ seba.receipts — View evolution receipts ═══
  registerHandler('seba.receipts', async () => {
    const receipts = await SEBAReceiptStore.getReceipts(10);
    
    const lines = [''];
    if (receipts.length === 0) {
      lines.push('No evolution receipts found.');
      lines.push('');
    } else {
      for (const r of receipts) {
        lines.push(`${r.timestamp} | ${r.phase}`);
        lines.push(`Cycle: ${r.cycle_id?.substring(0, 8) || 'N/A'}`);
        lines.push(`Insights: ${r.insights_found} | Proposals: ${r.proposals_generated}`);
        lines.push('');
      }
    }
    
    return {
      success: true,
      formatted: formatBox('📜 EVOLUTION RECEIPTS', lines),
      data: {
        total: receipts.length,
        receipts: receipts.map(r => ({
          id: r.id,
          cycle_id: r.cycle_id,
          phase: r.phase,
          insights_found: r.insights_found,
          proposals_generated: r.proposals_generated,
          proposals_auto_approved: r.proposals_auto_approved,
          timestamp: r.timestamp,
        })),
      },
    };
  });

  // ═══ seba.history — View execution history (formatted) ═══
  registerHandler('seba.history', async () => {
    const result = await sebaAgent.handleCommand('history', { limit: 10 });
    const events = (result.data as any)?.events || [];
    
    return {
      success: result.success,
      formatted: formatHistoryOutput(events),
      data: result.data,
    };
  });

  // ═══ seba.metrics — Get SEBA metrics ═══
  registerHandler('seba.metrics', async () => {
    const result = await sebaAgent.handleCommand('metrics');
    const metrics = result.data as any;
    
    const lines = [
      '',
      `Total Cycles:      ${metrics?.total_cycles || 0}`,
      `Successful:        ${metrics?.successful_cycles || 0}`,
      `Failed:            ${metrics?.failed_cycles || 0}`,
      `Success Rate:      ${metrics?.success_rate || 0}%`,
      '',
      `Proposals (24h):   ${metrics?.proposals_24h || 0}`,
      `Executions (24h):  ${metrics?.executions_24h || 0}`,
      `Rollbacks (24h):   ${metrics?.rollbacks_24h || 0}`,
      '',
      `Pending:           ${metrics?.pending_proposals || 0}`,
      `Approved:          ${metrics?.approved_proposals || 0}`,
      `Rejected:          ${metrics?.rejected_proposals || 0}`,
      '',
    ];
    
    return {
      success: result.success,
      formatted: formatBox('📊 SEBA METRICS', lines),
      data: result.data,
    };
  });

  // ═══ seba.config — View SEBA configuration ═══
  registerHandler('seba.config', async () => {
    const result = await sebaAgent.handleCommand('config');
    return {
      success: result.success,
      data: result.data,
    };
  });

  // ═══ seba.pause — Pause SEBA ═══
  registerHandler('seba.pause', async () => {
    const result = await sebaAgent.handleCommand('pause');
    return {
      success: result.success,
      formatted: ['', '⏸️ SEBA paused for 24 hours. Use seba.resume to continue.', ''],
      message: result.message,
    };
  });

  // ═══ seba.resume — Resume SEBA ═══
  registerHandler('seba.resume', async () => {
    const result = await sebaAgent.handleCommand('resume');
    return {
      success: result.success,
      formatted: ['', '▶️ SEBA resumed. Ready for next cycle.', ''],
      message: result.message,
    };
  });

  // ═══ seba.help — Show SEBA commands (formatted) ═══
  registerHandler('seba.help', async () => {
    const lines: string[] = [];
    lines.push('');
    lines.push('┌─────────────────────────────────────────────┐');
    lines.push('│         SEBA COMMAND REFERENCE v2.1         │');
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
    lines.push('  Cycle Operations:');
    lines.push('  ──────────────────');
    lines.push('    seba.cycle       Run full evolution cycle');
    lines.push('    seba.propose     Generate proposals only');
    lines.push('    seba.enable      Enable SEBA');
    lines.push('    seba.disable     Disable SEBA');
    lines.push('    seba.pause       Pause operations');
    lines.push('    seba.resume      Resume operations');
    lines.push('');
    lines.push('  Governance:');
    lines.push('  ────────────');
    lines.push('    seba.review            List pending proposals');
    lines.push('    seba.approve <id>      Approve a proposal');
    lines.push('    seba.reject <id>       Reject a proposal');
    lines.push('    seba.execute <id>      Execute approved proposal');
    lines.push('    seba.rollback <id>     Rollback applied proposal');
    lines.push('');
    lines.push('  Mode Control:');
    lines.push('  ──────────────');
    lines.push('    seba.mode              Get current mode');
    lines.push('    seba.mode.observe      Scan only mode');
    lines.push('    seba.mode.advisory     Proposals require approval');
    lines.push('    seba.mode.governed     Auto-execute if approved');
    lines.push('');
    lines.push('  History & Receipts:');
    lines.push('  ────────────────────');
    lines.push('    seba.history     View execution history');
    lines.push('    seba.receipts    View evolution receipts');
    lines.push('');

    return {
      success: true,
      formatted: lines,
      data: {
        command_count: 22,
        categories: ['Status', 'Cycle', 'Governance', 'Mode', 'History'],
      },
    };
  });

  log.info('terminal', 'SEBA handlers registered', { count: 22 });
}

/**
 * Execute SEBA command with arguments (for commands that need args)
 */
export async function executeSEBACommand(
  action: string,
  args: Record<string, unknown> = {}
): Promise<{ success: boolean; data?: unknown; formatted?: string[]; error?: string }> {
  // Handle commands that require arguments
  if (action === 'approve' && args.proposal_id) {
    const result = await sebaAgent.handleCommand('approve', { proposal_id: args.proposal_id });
    return {
      success: result.success,
      formatted: [
        '',
        result.success 
          ? `✅ Proposal ${args.proposal_id} APPROVED`
          : `❌ Failed to approve: ${result.message}`,
        result.success 
          ? `   Status: queued_for_execution`
          : '',
        result.success 
          ? `   Run seba.execute ${args.proposal_id} to apply.`
          : '',
        '',
      ],
      data: result.data,
      error: result.success ? undefined : result.message,
    };
  }

  if (action === 'reject' && args.proposal_id) {
    const result = await sebaAgent.handleCommand('reject', { 
      proposal_id: args.proposal_id, 
      reason: args.reason as string 
    });
    return {
      success: result.success,
      formatted: [
        '',
        result.success 
          ? `❌ Proposal ${args.proposal_id} REJECTED`
          : `Failed to reject: ${result.message}`,
        result.success 
          ? `   Status: rejected`
          : '',
        '',
      ],
      data: result.data,
      error: result.success ? undefined : result.message,
    };
  }

  if (action === 'execute' && args.proposal_id) {
    // Support phase argument: seba.execute <id> [shadow|production]
    const phase = (args.phase as string) || undefined;
    const result = await sebaAgent.handleCommand('execute', { 
      proposal_id: args.proposal_id,
      phase,
    });
    
    // Use the formatted message from the agent
    const lines = result.message?.split('\n') || [];
    
    return {
      success: result.success,
      formatted: ['', ...lines, ''],
      data: result.data,
      error: result.success ? undefined : result.message,
    };
  }

  if (action === 'rollback' && args.execution_id) {
    const result = await sebaAgent.handleCommand('rollback', { execution_id: args.execution_id });
    return {
      success: result.success,
      formatted: [
        '',
        result.success 
          ? `⏪ Rollback triggered for ${args.execution_id}`
          : `❌ Failed to rollback: ${result.message}`,
        '',
      ],
      data: result.data,
      error: result.success ? undefined : result.message,
    };
  }

  // Default: pass through to agent
  const result = await sebaAgent.handleCommand(action as any, args);
  return {
    success: result.success,
    data: result.data,
    error: result.success ? undefined : result.message,
  };
}
