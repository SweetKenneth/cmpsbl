/**
 * Intent Mesh → Capability Adapter Bridge
 * 
 * Routes intent mesh resolutions through the governed capability adapter
 * instead of executing raw edge functions. This ensures all mesh-resolved
 * operations go through guards, confidence tracking, and governance checks.
 *
 * INTENT MESH → resolver match → [THIS BRIDGE] → capability adapter → edge function
 */

import { invokeCapability, canInvoke } from '@/lib/capabilities/adapter';
import type { CapabilityResult } from '@/lib/capabilities/types';
import { getCapability } from '@/lib/capabilities/registry';
import { emit } from '@/lib/substrate/events';
import { log } from '@/lib/system/log';
import type { MeshIntent, ResolverResponse, MeshResolver } from '@/lib/substrate/intent-mesh/types';

/**
 * Attempt to resolve a mesh intent through the governed capability adapter.
 * Returns null if no matching capability exists (falls back to direct resolver).
 */
export async function resolveViaCapability(
  resolver: MeshResolver,
  intent: MeshIntent
): Promise<ResolverResponse | null> {
  const startTime = performance.now();
  
  // Map resolver ID to capability ID (convention: resolver IDs match capability IDs)
  const capabilityId = resolver.id;
  const capability = getCapability(capabilityId);
  
  if (!capability) {
    // No matching capability — let the mesh handle directly
    return null;
  }

  // Check governance before invoking
  if (!canInvoke(capabilityId, intent.sourceModule)) {
    log.debug('mesh-bridge', `Capability '${capabilityId}' blocked by guards for module ${intent.sourceModule}`);
    return {
      resolverId: resolver.id,
      module: resolver.module,
      success: false,
      error: `Governance blocked: capability '${capabilityId}' not permitted for ${intent.sourceModule}`,
      durationMs: performance.now() - startTime,
    };
  }

  try {
    const result: CapabilityResult = await invokeCapability({
      capabilityId,
      input: intent.input,
      callerModule: intent.sourceModule,
      timestamp: intent.timestamp,
    });

    const durationMs = performance.now() - startTime;

    emit({
      module: 'NEXUS',
      event_type: 'mesh.capability_bridge',
      outcome: result.success ? 'succeeded' : 'failed',
      data: {
        resolverId: resolver.id,
        capabilityId,
        sourceModule: intent.sourceModule,
        confidence: result.confidence,
        durationMs,
      },
    });

    return {
      resolverId: resolver.id,
      module: resolver.module,
      success: result.success,
      data: result.data ? (result.data as Record<string, unknown>) : undefined,
      error: result.error,
      durationMs,
    };
  } catch (err) {
    const durationMs = performance.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : 'Unknown bridge error';

    log.error('mesh-bridge', `Capability bridge failed for ${capabilityId}`, { error: errorMsg });

    return {
      resolverId: resolver.id,
      module: resolver.module,
      success: false,
      error: errorMsg,
      durationMs,
    };
  }
}

/**
 * Check if a resolver can be routed through the capability adapter.
 */
export function hasCapabilityRoute(resolverId: string): boolean {
  return !!getCapability(resolverId);
}

/**
 * Get governance-enriched resolver info.
 */
export function getResolverGovernanceStatus(resolverId: string, callerModule: string): {
  hasCapability: boolean;
  canInvoke: boolean;
  confidence: number;
} {
  const capability = getCapability(resolverId);
  if (!capability) {
    return { hasCapability: false, canInvoke: false, confidence: 0 };
  }
  return {
    hasCapability: true,
    canInvoke: canInvoke(resolverId, callerModule),
    confidence: capability.confidence,
  };
}
