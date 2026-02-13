/**
 * Atlas Module Runner
 * v9.1.0 — ARCHITECT Epoch Unified execution layer for all module actions
 */

import { supabase } from '@/integrations/supabase/client';
import { getModule, getAction } from './registry';
import { checkOpAllowed } from './capabilities';
import { writeAuditEntry, generateTraceId, redactSecrets } from './audit';
import type { AtlasResponse, AtlasStatus } from './types';

export interface RunActionOptions {
  module: string;
  action: string;
  args?: Record<string, unknown>;
  dry_run?: boolean;
  actor?: string;
  actor_role?: string;
}

export interface RunActionResult {
  ok: boolean;
  output?: unknown;
  warnings?: string[];
  error?: string;
  trace_id: string;
  execution_ms: number;
  dry_run: boolean;
}

/**
 * Execute a module action through the unified runner
 */
export async function runAction(options: RunActionOptions): Promise<RunActionResult> {
  const startTime = performance.now();
  const trace_id = generateTraceId();
  const target = `${options.module}.${options.action}`;
  
  // Check if module execution is allowed
  const allowed = await checkOpAllowed('module_exec');
  if (!allowed.allowed) {
    await writeAuditEntry({
      actor: options.actor,
      actor_role: options.actor_role,
      op: 'run_action',
      target,
      payload: options.args,
      result_summary: allowed.reason,
      status: 'blocked',
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: options.dry_run,
    });
    
    return {
      ok: false,
      error: allowed.reason,
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: options.dry_run ?? false,
    };
  }
  
  // Validate module and action exist
  const module = getModule(options.module);
  if (!module) {
    return {
      ok: false,
      error: `Unknown module: ${options.module}`,
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: options.dry_run ?? false,
    };
  }
  
  const action = getAction(options.module, options.action);
  if (!action) {
    return {
      ok: false,
      error: `Unknown action: ${options.action} in module ${options.module}`,
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: options.dry_run ?? false,
    };
  }
  
  // Dry run - return execution plan without side effects
  if (options.dry_run) {
    const result: RunActionResult = {
      ok: true,
      output: {
        plan: {
          module: module.id,
          module_name: module.name,
          action: action.id,
          action_name: action.name,
          risk: action.risk,
          reversible: action.reversible,
          requires_confirmation: action.requiresConfirmation,
          args: redactSecrets(options.args),
        },
        preview: `Would execute ${module.name}.${action.name} with ${Object.keys(options.args || {}).length} arguments`,
      },
      warnings: action.risk === 'high' ? ['This is a high-risk action'] : undefined,
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: true,
    };
    
    await writeAuditEntry({
      actor: options.actor,
      actor_role: options.actor_role,
      op: 'run_action',
      target,
      payload: options.args,
      result_summary: 'Dry run completed',
      status: 'dry_run',
      trace_id,
      execution_ms: result.execution_ms,
      dry_run: true,
    });
    
    return result;
  }
  
  // Execute action via substrate edge function
  try {
    const { data, error } = await supabase.functions.invoke('pf-substrate', {
      body: {
        module: options.module,
        action: options.action,
        ...options.args,
      },
    });
    
    if (error) {
      await writeAuditEntry({
        actor: options.actor,
        actor_role: options.actor_role,
        op: 'run_action',
        target,
        payload: options.args,
        result_summary: error.message,
        status: 'fail',
        trace_id,
        execution_ms: performance.now() - startTime,
      });
      
      return {
        ok: false,
        error: error.message,
        trace_id,
        execution_ms: performance.now() - startTime,
        dry_run: false,
      };
    }
    
    // Success
    await writeAuditEntry({
      actor: options.actor,
      actor_role: options.actor_role,
      op: 'run_action',
      target,
      payload: options.args,
      result_summary: 'Action completed successfully',
      status: 'success',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: true,
      output: redactSecrets(data),
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    await writeAuditEntry({
      actor: options.actor,
      actor_role: options.actor_role,
      op: 'run_action',
      target,
      payload: options.args,
      result_summary: errorMessage,
      status: 'fail',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      error: errorMessage,
      trace_id,
      execution_ms: performance.now() - startTime,
      dry_run: false,
    };
  }
}

/**
 * Validate action arguments
 */
export function validateArgs(
  moduleId: string, 
  actionId: string, 
  args: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const action = getAction(moduleId, actionId);
  if (!action) {
    return { valid: false, errors: [`Unknown action: ${moduleId}.${actionId}`] };
  }
  
  // Basic validation - specific schemas can be added per action
  const errors: string[] = [];
  
  // Check for empty required actions (future: use JSON Schema)
  
  return { valid: errors.length === 0, errors };
}
