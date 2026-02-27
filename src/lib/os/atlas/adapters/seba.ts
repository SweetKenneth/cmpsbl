/**
 * Atlas SEBA Adapter
 * SEBA integration for Atlas control plane
 */

import { sebaAgent, type SEBACommand, type SEBAMode } from '@/lib/substrate/seba';
import { checkOpAllowed } from '../capabilities';
import { writeAuditEntry, generateTraceId, redactSecrets } from '../audit';
import type { SEBACmd } from '../types';

export interface SEBAAdapterResult {
  ok: boolean;
  cmd: SEBACmd;
  data?: unknown;
  message?: string;
  error?: string;
  trace_id: string;
  execution_ms: number;
}

/**
 * Execute a SEBA command through Atlas
 */
export async function executeSEBACommand(
  cmd: SEBACmd,
  args?: Record<string, unknown>,
  actor?: string,
  actor_role?: string
): Promise<SEBAAdapterResult> {
  const startTime = performance.now();
  const trace_id = generateTraceId();
  
  // Check capability
  const allowed = await checkOpAllowed('seba');
  if (!allowed.allowed) {
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'seba',
      target: cmd,
      payload: args,
      result_summary: allowed.reason,
      status: 'blocked',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      cmd,
      error: allowed.reason,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
  
  try {
    // Map Atlas command to SEBA command
    const sebaCmd = mapToSEBACommand(cmd);
    const sebaArgs = mapSEBAArgs(cmd, args);
    
    const result = await sebaAgent.handleCommand(sebaCmd, sebaArgs);
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'seba',
      target: cmd,
      payload: args,
      result_summary: result.message,
      status: result.success ? 'success' : 'fail',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: result.success,
      cmd,
      data: redactSecrets(result.data),
      message: result.message,
      error: result.success ? undefined : result.message,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'seba',
      target: cmd,
      payload: args,
      result_summary: errorMessage,
      status: 'fail',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      cmd,
      error: errorMessage,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
}

function mapToSEBACommand(cmd: SEBACmd): SEBACommand {
  // Direct mapping - SEBA uses same command names
  return cmd as SEBACommand;
}

function mapSEBAArgs(cmd: SEBACmd, args?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!args) return undefined;
  
  switch (cmd) {
    case 'mode':
      return { mode: args.mode as SEBAMode };
    case 'approve':
    case 'reject':
    case 'execute':
      return { proposal_id: args.proposal_id as string };
    case 'rollback':
      return { execution_id: args.execution_id as string };
    case 'history':
      return { limit: args.limit as number };
    default:
      return args;
  }
}

/**
 * Get SEBA status summary for Atlas
 */
export async function getSEBAStatus(): Promise<{
  enabled: boolean;
  mode: string;
  phase: string;
  cycles: { total: number; successful: number; failed: number };
  proposals: { pending: number; approved: number; rejected: number };
  health: number;
}> {
  const result = await sebaAgent.handleCommand('status');
  
  if (!result.success || !result.data) {
    return {
      enabled: false,
      mode: 'off',
      phase: 'unknown',
      cycles: { total: 0, successful: 0, failed: 0 },
      proposals: { pending: 0, approved: 0, rejected: 0 },
      health: 0,
    };
  }
  
  const state = (result.data as { state: Record<string, unknown> }).state;
  const config = (result.data as { config: Record<string, unknown> }).config;
  
  return {
    enabled: config?.enabled as boolean ?? false,
    mode: (state?.mode as string) ?? 'off',
    phase: (state?.current_phase as string) ?? 'idle',
    cycles: {
      total: (state?.total_cycles as number) ?? 0,
      successful: (state?.successful_cycles as number) ?? 0,
      failed: (state?.failed_cycles as number) ?? 0,
    },
    proposals: {
      pending: (state?.pending_proposals as number) ?? 0,
      approved: (state?.approved_proposals as number) ?? 0,
      rejected: (state?.rejected_proposals as number) ?? 0,
    },
    health: (state?.agent_health as number) ?? 100,
  };
}
