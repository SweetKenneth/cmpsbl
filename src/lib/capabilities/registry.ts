/**
 * Capability Registry
 * Single Source of Truth for 400+ Edge-Adapted Capabilities
 */

import type { RegisteredCapability, CapabilityStatus, CapabilityMetadata } from './types';

// In-memory registry (can be persisted to DB if needed)
const capabilities = new Map<string, RegisteredCapability>();

/**
 * Register a new capability
 */
export function registerCapability(
  id: string,
  metadata: CapabilityMetadata,
  source: 'edge-adapted' | 'native' | 'legacy' = 'edge-adapted',
  edgeFunctionPath?: string
): RegisteredCapability {
  const existing = capabilities.get(id);
  
  const capability: RegisteredCapability = {
    id,
    name: metadata.name,
    source,
    edgeFunctionPath,
    modules: metadata.modules,
    risk: metadata.risk,
    reversible: metadata.reversible,
    description: metadata.description,
    status: 'active',
    registeredAt: existing?.registeredAt ?? new Date().toISOString(),
    lastInvokedAt: existing?.lastInvokedAt,
    invokeCount: existing?.invokeCount ?? 0,
    confidence: 1.0,
  };
  
  capabilities.set(id, capability);
  console.log(`[CapabilityRegistry] Registered: ${id} (${source})`);
  
  return capability;
}

/**
 * Get a capability by ID
 */
export function getCapability(id: string): RegisteredCapability | undefined {
  return capabilities.get(id);
}

/**
 * List all registered capabilities
 */
export function listCapabilities(filter?: {
  status?: CapabilityStatus;
  source?: string;
  module?: string;
}): RegisteredCapability[] {
  let result = Array.from(capabilities.values());
  
  if (filter?.status) {
    result = result.filter(c => c.status === filter.status);
  }
  if (filter?.source) {
    result = result.filter(c => c.source === filter.source);
  }
  if (filter?.module) {
    result = result.filter(c => c.modules.includes(filter.module!));
  }
  
  return result;
}

/**
 * Deprecate a capability (idempotent)
 */
export function deprecateCapability(id: string): boolean {
  const capability = capabilities.get(id);
  if (!capability) return false;
  
  capability.status = 'deprecated';
  capabilities.set(id, capability);
  console.log(`[CapabilityRegistry] Deprecated: ${id}`);
  
  return true;
}

/**
 * Remove a capability entirely (idempotent)
 */
export function removeCapability(id: string): boolean {
  const existed = capabilities.has(id);
  capabilities.delete(id);
  
  if (existed) {
    console.log(`[CapabilityRegistry] Removed: ${id}`);
  }
  
  return existed;
}

/**
 * Record capability invocation
 */
export function recordInvocation(id: string, success: boolean, confidence: number): void {
  const capability = capabilities.get(id);
  if (!capability) return;
  
  capability.invokeCount += 1;
  capability.lastInvokedAt = new Date().toISOString();
  
  // Adjust confidence with exponential moving average
  capability.confidence = capability.confidence * 0.9 + (success ? confidence : 0) * 0.1;
  
  capabilities.set(id, capability);
}

/**
 * Get registry manifest for documentation
 */
export function getManifest(): {
  generatedAt: string;
  totalCapabilities: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  capabilities: RegisteredCapability[];
} {
  const all = listCapabilities();
  
  const bySource: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  
  for (const c of all) {
    bySource[c.source] = (bySource[c.source] ?? 0) + 1;
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
  }
  
  return {
    generatedAt: new Date().toISOString(),
    totalCapabilities: all.length,
    bySource,
    byStatus,
    capabilities: all,
  };
}

/**
 * Check if a capability exists and is active
 */
export function isCapabilityActive(id: string): boolean {
  const capability = capabilities.get(id);
  return capability?.status === 'active';
}

/**
 * Clear all capabilities (for testing)
 */
export function clearRegistry(): void {
  capabilities.clear();
}
