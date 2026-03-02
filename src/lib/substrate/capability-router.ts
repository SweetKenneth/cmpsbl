/**
 * Capability Router — Dynamic routing based on module capabilities
 * Routes requests to the most capable available handler
 */

interface CapabilityEntry {
  module: string;
  capability: string;
  priority: number;
  healthy: boolean;
  latencyAvgMs: number;
  samples: number;
}

const registry = new Map<string, CapabilityEntry[]>();

export function registerCapability(module: string, capability: string, priority = 50): void {
  if (!registry.has(capability)) registry.set(capability, []);
  const list = registry.get(capability)!;
  const existing = list.find(e => e.module === module);
  if (existing) {
    existing.priority = priority;
    return;
  }
  list.push({ module, capability, priority, healthy: true, latencyAvgMs: 0, samples: 0 });
  list.sort((a, b) => b.priority - a.priority);
}

/** Find the best module for a capability */
export function resolve(capability: string): string | null {
  const list = registry.get(capability);
  if (!list) return null;
  const healthy = list.filter(e => e.healthy);
  if (healthy.length === 0) return list[0]?.module ?? null; // Fallback to unhealthy
  return healthy[0].module;
}

/** Get all modules that support a capability */
export function resolveAll(capability: string): string[] {
  return (registry.get(capability) || []).filter(e => e.healthy).map(e => e.module);
}

export function recordLatency(module: string, capability: string, latencyMs: number): void {
  const list = registry.get(capability);
  const entry = list?.find(e => e.module === module);
  if (entry) {
    entry.samples++;
    entry.latencyAvgMs = entry.latencyAvgMs + (latencyMs - entry.latencyAvgMs) / entry.samples;
  }
}

export function setHealthy(module: string, healthy: boolean): void {
  for (const list of registry.values()) {
    const entry = list.find(e => e.module === module);
    if (entry) entry.healthy = healthy;
  }
}

export function getCapabilityMap(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const [cap, list] of registry) {
    map[cap] = list.map(e => `${e.module}(p=${e.priority},h=${e.healthy})`);
  }
  return map;
}

export function listCapabilities(): string[] {
  return Array.from(registry.keys());
}

// Pre-register core capabilities
registerCapability('core', 'scheduling', 90);
registerCapability('core', 'health', 90);
registerCapability('nexus', 'ai_routing', 95);
registerCapability('brain', 'reasoning', 90);
registerCapability('vision', 'anomaly_detection', 90);
registerCapability('defense', 'threat_analysis', 90);
registerCapability('decode', 'narration', 90);
registerCapability('memory', 'persistence', 90);

// Expansion modules (37-node architecture)
registerCapability('sovereign', 'compliance_enforcement', 90);
registerCapability('oracle', 'predictive_modeling', 90);
registerCapability('conscience', 'ethics_assessment', 85);
registerCapability('phantom', 'privacy_protection', 90);
registerCapability('forge', 'artifact_synthesis', 85);
registerCapability('lingua', 'translation', 85);
registerCapability('compass', 'geospatial_analysis', 80);
registerCapability('echo', 'digital_twin_simulation', 85);
registerCapability('treaty', 'contract_negotiation', 80);
registerCapability('harvest', 'data_acquisition', 85);
registerCapability('reflex', 'edge_orchestration', 90);
