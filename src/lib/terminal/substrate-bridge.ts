/**
 * Substrate Bridge — Routes terminal commands through pf-substrate
 * One backend, two frontends (Web Terminal + CLI)
 * 
 * Every command goes through the same edge function the dashboard uses.
 */

import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/system/log';

export interface SubstrateResponse {
  success: boolean;
  [key: string]: unknown;
}

/**
 * Call pf-substrate edge function directly
 */
export async function callSubstrate(
  module: string,
  action: string,
  params: Record<string, unknown> = {}
): Promise<SubstrateResponse> {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('pf-substrate', {
      body: { module, action, ...params },
    });

    if (error) {
      log.warn('terminal', `Substrate call failed: ${module}/${action}`, { error: error.message });
      return { success: false, error: error.message };
    }

    const latencyMs = Date.now() - startTime;
    log.debug('terminal', `Substrate: ${module}/${action} (${latencyMs}ms)`);

    return data as SubstrateResponse;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    log.error('terminal', `Substrate bridge error: ${module}/${action}`, { error: msg });
    return { success: false, error: msg };
  }
}

/**
 * Factory: creates a handler that routes through pf-substrate.
 * Parses "module.action" from the command name.
 */
export function bridge(module: string, action: string) {
  return async (args?: Record<string, unknown>): Promise<SubstrateResponse> => {
    return callSubstrate(module, action, args);
  };
}

/**
 * Auto-bridge: parses "module.action" from command name
 */
export function autoBridge(commandName: string) {
  const dotIdx = commandName.indexOf('.');
  if (dotIdx === -1) {
    return bridge(commandName, 'status');
  }
  const module = commandName.slice(0, dotIdx);
  const action = commandName.slice(dotIdx + 1);
  return bridge(module, action);
}
