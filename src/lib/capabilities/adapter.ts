/**
 * Capability Adapter
 * v7.0.0 — Universal Invocation Wrapper
 */

import { supabase } from '@/integrations/supabase/client';
import { getCapability, recordInvocation } from './registry';
import { validateInvocation, logGuardDecision } from './guards';
import { normalizeOutput } from './normalize';
import { recordConfidence } from './confidence';
import type { CapabilityResult, CapabilityInvocation } from './types';

/**
 * Invoke a capability through the governed adapter
 * This is the ONLY way to execute edge-adapted capabilities
 */
export async function invokeCapability<T = unknown>(
  invocation: CapabilityInvocation
): Promise<CapabilityResult<T>> {
  const startTime = performance.now();
  const { capabilityId, input, callerModule } = invocation;
  
  // Get capability from registry
  const capability = getCapability(capabilityId);
  if (!capability) {
    return {
      success: false,
      error: `Capability '${capabilityId}' not found in registry`,
      confidence: 0,
      executionMs: 0,
    };
  }
  
  // Validate through guards
  const guardResult = validateInvocation({
    capability,
    caller: callerModule,
    input,
  });
  
  logGuardDecision({ capability, caller: callerModule, input }, guardResult);
  
  if (!guardResult.allowed) {
    return {
      success: false,
      error: guardResult.reason,
      confidence: 0,
      executionMs: performance.now() - startTime,
    };
  }
  
  try {
    // Route through substrate if native, or invoke edge function directly if adapted
    let result: { data: T | null; error: Error | null };
    
    if (capability.source === 'edge-adapted' && capability.edgeFunctionPath) {
      // Invoke the edge function
      const { data, error } = await supabase.functions.invoke(capability.edgeFunctionPath, {
        body: input,
      });
      result = { data: data as T, error: error ? new Error(error.message) : null };
    } else {
      // Route through pf-substrate for native capabilities
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: capability.modules[0]?.toLowerCase() ?? 'system',
          action: capabilityId,
          ...input,
        },
      });
      result = { data: data as T, error: error ? new Error(error.message) : null };
    }
    
    const executionMs = performance.now() - startTime;
    
    if (result.error) {
      recordInvocation(capabilityId, false, 0);
      recordConfidence(capabilityId, 0, result.error.message);
      
      return {
        success: false,
        error: result.error.message,
        confidence: 0,
        executionMs,
      };
    }
    
    // Normalize output
    const normalized = normalizeOutput(result.data);
    const confidence = normalized.confidence ?? 1.0;
    
    recordInvocation(capabilityId, true, confidence);
    recordConfidence(capabilityId, confidence);
    
    return {
      success: true,
      data: normalized.data as T,
      confidence,
      executionMs,
    };
  } catch (err) {
    const executionMs = performance.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    recordInvocation(capabilityId, false, 0);
    recordConfidence(capabilityId, 0, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      confidence: 0,
      executionMs,
    };
  }
}

/**
 * Batch invoke multiple capabilities
 */
export async function invokeBatch<T = unknown>(
  invocations: CapabilityInvocation[]
): Promise<CapabilityResult<T>[]> {
  return Promise.all(invocations.map(inv => invokeCapability<T>(inv)));
}

/**
 * Check if a capability can be invoked
 */
export function canInvoke(capabilityId: string, callerModule: string): boolean {
  const capability = getCapability(capabilityId);
  if (!capability) return false;
  
  const result = validateInvocation({
    capability,
    caller: callerModule,
    input: {},
  });
  
  return result.allowed;
}
