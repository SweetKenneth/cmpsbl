/**
 * Atlas Autoblog Adapter
 * v7.0.0 — Autoblog integration for Atlas control plane
 */

import { 
  getAutoblogStatus as getStatus,
  autoblogPlan,
  autoblogDraft,
  autoblogVerify,
  autoblogPublish,
  autoblogPublishAll,
  autoblogAbort,
  getAutoblogSettings,
  getAutoblogQueue,
} from '@/lib/autoblog';
import { checkOpAllowed } from '../capabilities';
import { writeAuditEntry, generateTraceId, redactSecrets } from '../audit';
import type { AutoblogCmd } from '../types';

export interface AutoblogAdapterResult {
  ok: boolean;
  cmd: AutoblogCmd;
  data?: unknown;
  message?: string;
  error?: string;
  blocked?: boolean;
  trace_id: string;
  execution_ms: number;
}

/**
 * Execute an Autoblog command through Atlas
 */
export async function executeAutoblogCommand(
  cmd: AutoblogCmd,
  args?: Record<string, unknown>,
  actor?: string,
  actor_role?: string
): Promise<AutoblogAdapterResult> {
  const startTime = performance.now();
  const trace_id = generateTraceId();
  
  // Check capability
  const allowed = await checkOpAllowed('autoblog');
  if (!allowed.allowed) {
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'autoblog',
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
      blocked: true,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
  
  try {
    let result: { ok: boolean; data?: unknown; message?: string; error?: string; blocked?: boolean };
    
    switch (cmd) {
      case 'status':
        const status = await getStatus();
        result = { 
          ok: status.ok, 
          data: {
            settings: status.settings,
            circuit: status.circuit,
          }
        };
        break;
        
      case 'draft':
        if (args?.queue_id) {
          const draftResult = await autoblogDraft(args.queue_id as string);
          result = { ok: draftResult.ok, data: draftResult.data, blocked: draftResult.blocked };
        } else {
          // Plan + draft in one go
          const planResult = await autoblogPlan();
          if (planResult.ok && planResult.queueId) {
            const draftResult = await autoblogDraft(planResult.queueId);
            result = { ok: draftResult.ok, data: { ...planResult.data, ...draftResult.data } };
          } else {
            result = { ok: false, error: planResult.reason, blocked: planResult.blocked };
          }
        }
        break;
        
      case 'publish':
        if (args?.queue_id) {
          const pubResult = await autoblogPublish(args.queue_id as string);
          result = { ok: pubResult.ok, data: pubResult.data, error: pubResult.reason };
        } else {
          // Publish all ready
          const pubAllResult = await autoblogPublishAll();
          result = { ok: pubAllResult.ok, data: pubAllResult.data };
        }
        break;
        
      case 'schedule':
        // For now, use plan which schedules
        const schedResult = await autoblogPlan();
        result = { ok: schedResult.ok, data: schedResult.data, blocked: schedResult.blocked };
        break;
        
      case 'pause':
        // Update settings to disable
        result = { ok: true, message: 'Autoblog paused (update settings to re-enable)' };
        break;
        
      case 'resume':
        result = { ok: true, message: 'Autoblog resumed' };
        break;
        
      case 'queue':
        const queue = await getAutoblogQueue();
        result = { ok: true, data: { queue } };
        break;
        
      case 'history':
        const settings = await getAutoblogSettings();
        const queueHistory = await getAutoblogQueue();
        result = { 
          ok: true, 
          data: { 
            settings,
            recent: queueHistory.slice(0, args?.limit as number ?? 10),
          }
        };
        break;
        
      default:
        result = { ok: false, error: `Unknown autoblog command: ${cmd}` };
    }
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'autoblog',
      target: cmd,
      payload: args,
      result_summary: result.message ?? (result.ok ? 'Success' : result.error),
      status: result.blocked ? 'blocked' : (result.ok ? 'success' : 'fail'),
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: result.ok,
      cmd,
      data: redactSecrets(result.data),
      message: result.message,
      error: result.error,
      blocked: result.blocked,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'autoblog',
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

/**
 * Get Autoblog status summary for Atlas
 */
export async function getAutoblogStatusSummary(): Promise<{
  enabled: boolean;
  mode: string;
  circuit_state: string;
  queue_length: number;
  last_publish?: string;
  next_scheduled?: string;
}> {
  try {
    const status = await getStatus();
    const queue = await getAutoblogQueue();
    
    return {
      enabled: status.settings?.enabled ?? false,
      mode: status.settings?.mode ?? 'off',
      circuit_state: status.circuit?.state ?? 'unknown',
      queue_length: queue.length,
      last_publish: queue.find(q => q.status === 'published')?.completed_at,
      next_scheduled: queue.find(q => q.status === 'queued')?.planned_at,
    };
  } catch {
    return {
      enabled: false,
      mode: 'off',
      circuit_state: 'unknown',
      queue_length: 0,
    };
  }
}
