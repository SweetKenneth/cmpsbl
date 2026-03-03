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

// ─── Pre-register: CORE + SYSTEM ─────────────────────────────────────────────
registerCapability('core', 'scheduling', 95);
registerCapability('core', 'health', 95);
registerCapability('core', 'boot_sequencing', 95);
registerCapability('system', 'lifecycle_management', 90);
registerCapability('system', 'configuration', 90);
registerCapability('system', 'diagnostics', 85);

// ─── Pre-register: CCR Zone ─────────────────────────────────────────────────
registerCapability('brain', 'reasoning', 90);
registerCapability('brain', 'pattern_recognition', 85);
registerCapability('memory', 'persistence', 90);
registerCapability('memory', 'tiered_storage', 85);
registerCapability('memory', 'semantic_search', 80);
registerCapability('dream', 'synthesis', 85);
registerCapability('dream', 'heuristic_generation', 80);

// ─── Pre-register: OCG Zone ─────────────────────────────────────────────────
registerCapability('ripple', 'event_propagation', 90);
registerCapability('ripple', 'cascade_detection', 85);
registerCapability('access', 'authentication', 90);
registerCapability('access', 'entitlements', 85);
registerCapability('identity', 'session_management', 90);
registerCapability('identity', 'role_resolution', 85);
registerCapability('relay', 'webhook_dispatch', 85);
registerCapability('relay', 'cross_module_messaging', 85);
registerCapability('audit', 'integrity_logging', 90);
registerCapability('audit', 'tamper_detection', 85);

// ─── Pre-register: Execution Sector ─────────────────────────────────────────
registerCapability('decode', 'narration', 90);
registerCapability('decode', 'intent_parsing', 90);
registerCapability('encode', 'code_generation', 90);
registerCapability('encode', 'surgical_patching', 85);
registerCapability('vision', 'anomaly_detection', 90);
registerCapability('vision', 'telemetry', 85);
registerCapability('cortex', 'pipeline_orchestration', 90);
registerCapability('cortex', 'cognitive_composition', 85);
registerCapability('nexus', 'ai_routing', 95);
registerCapability('nexus', 'provider_selection', 90);
registerCapability('economy', 'cost_attribution', 85);
registerCapability('economy', 'budget_governance', 80);
registerCapability('sandbox', 'isolated_execution', 90);
registerCapability('sandbox', 'speculative_runs', 80);
registerCapability('inclusive', 'wcag_scanning', 85);
registerCapability('inclusive', 'accessibility_audit', 80);
registerCapability('medic', 'self_diagnostics', 90);
registerCapability('medic', 'predictive_failure', 85);
registerCapability('nerve', 'inter_node_signaling', 90);
registerCapability('nerve', 'consensus_repair', 85);
registerCapability('integration', 'external_connectivity', 85);
registerCapability('integration', 'adapter_management', 80);

// ─── Pre-register: ESZ — Expansion Sovereignty Zone ─────────────────────────
registerCapability('sovereign', 'compliance_enforcement', 90);
registerCapability('sovereign', 'jurisdiction_classification', 85);
registerCapability('oracle', 'predictive_modeling', 90);
registerCapability('oracle', 'bayesian_inference', 85);
registerCapability('conscience', 'ethics_assessment', 85);
registerCapability('conscience', 'bias_detection', 85);
registerCapability('treaty', 'contract_negotiation', 80);
registerCapability('treaty', 'sla_enforcement', 80);

// ─── Pre-register: EPZ — Expansion Perception Zone ──────────────────────────
registerCapability('compass', 'geospatial_analysis', 80);
registerCapability('compass', 'navigation_intelligence', 75);
registerCapability('echo', 'digital_twin_simulation', 85);
registerCapability('echo', 'scenario_replay', 80);
registerCapability('reflex', 'edge_orchestration', 90);
registerCapability('reflex', 'low_latency_decisions', 85);

// ─── Pre-register: EMZ — Expansion Manufacturing Zone ───────────────────────
registerCapability('forge', 'artifact_synthesis', 85);
registerCapability('forge', 'template_generation', 80);
registerCapability('lingua', 'translation', 85);
registerCapability('lingua', 'localization', 80);
registerCapability('phantom', 'privacy_protection', 90);
registerCapability('phantom', 'pii_masking', 85);
registerCapability('harvest', 'data_acquisition', 85);
registerCapability('harvest', 'etl_orchestration', 80);

// ─── Pre-register: Fields ───────────────────────────────────────────────────
registerCapability('evolution', 'shadow_validation', 85);
registerCapability('evolution', 'canary_deployment', 80);
registerCapability('immunity', 'cascade_breaking', 90);
registerCapability('immunity', 'anomaly_signatures', 85);
registerCapability('intent', 'goal_decomposition', 85);
registerCapability('intent', 'capability_routing', 80);

// ─── Pre-register: Plane + Shell ────────────────────────────────────────────
registerCapability('governance', 'veto_authority', 95);
registerCapability('governance', 'policy_enforcement', 90);
registerCapability('defense', 'threat_analysis', 95);
registerCapability('defense', 'rate_limiting', 90);
registerCapability('defense', 'quarantine', 85);
