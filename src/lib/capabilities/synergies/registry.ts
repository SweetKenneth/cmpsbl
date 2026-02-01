/**
 * Synergy Registry
 * v7.0.0 — Cross-Module Pipeline Registration
 * 
 * Defines all available synergies that combine 2+ modules
 */

import type { SynergyDefinition, SynergyExecutor, SynergyRegistry } from './types';

const registry: SynergyRegistry = {
  synergies: new Map(),
  executors: new Map(),
};

/**
 * All 15 cross-module synergies
 * Each combines 2-4 modules for enhanced capability
 */
export const SYNERGY_DEFINITIONS: SynergyDefinition[] = [
  // === INTELLIGENCE SYNERGIES ===
  {
    id: 'smart-recall',
    name: 'Smart Recall',
    description: 'BRAIN memory lookup enhanced by DECODE context understanding and DREAM pattern matching',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'DREAM', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 2,
  },
  {
    id: 'predictive-issue-prevention',
    name: 'Predictive Issue Prevention',
    description: 'VISION metrics analyzed by BRAIN learning to trigger MODERNIZER pre-emptive fixes',
    category: 'intelligence',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'MODERNIZER', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 3,
  },
  {
    id: 'context-aware-generation',
    name: 'Context-Aware Generation',
    description: 'NEXUS generation informed by BRAIN memory and DECODE intent parsing',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 2,
  },
  {
    id: 'cross-domain-synthesis',
    name: 'Cross-Domain Synthesis',
    description: 'DREAM pattern discovery combined with NEXUS reasoning and BRAIN consolidation',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 3,
  },

  // === OPTIMIZATION SYNERGIES ===
  {
    id: 'adaptive-routing',
    name: 'Adaptive Routing',
    description: 'NEXUS provider selection optimized by VISION latency metrics and CORTEX cost analysis',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 2,
  },
  {
    id: 'intelligent-caching',
    name: 'Intelligent Caching',
    description: 'SYSTEM cache decisions driven by BRAIN access patterns and VISION hit rates',
    category: 'optimization',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 50,
    minModulesRequired: 2,
  },
  {
    id: 'batch-optimization',
    name: 'Batch Optimization',
    description: 'RIPPLE event batching tuned by VISION throughput metrics and CORTEX scheduling',
    category: 'optimization',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 2,
  },

  // === RESILIENCE SYNERGIES ===
  {
    id: 'graceful-degradation',
    name: 'Graceful Degradation',
    description: 'CORE fallback chain with DEFENSE circuit breakers and VISION health monitoring',
    category: 'resilience',
    modules: [
      { name: 'CORE', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 30,
    minModulesRequired: 3,
  },
  {
    id: 'self-healing',
    name: 'Self-Healing',
    description: 'SYSTEM diagnostics trigger MODERNIZER auto-fixes validated by VISION regression checks',
    category: 'resilience',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'MODERNIZER', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 1000,
    minModulesRequired: 3,
  },
  {
    id: 'distributed-trace-recovery',
    name: 'Distributed Trace Recovery',
    description: 'RIPPLE event replay guided by VISION trace analysis and BRAIN failure patterns',
    category: 'resilience',
    modules: [
      { name: 'RIPPLE', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: false },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 300,
    minModulesRequired: 2,
  },

  // === SECURITY SYNERGIES ===
  {
    id: 'threat-learning',
    name: 'Threat Learning',
    description: 'DEFENSE events feed BRAIN pattern recognition for VISION anomaly detection',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  {
    id: 'access-pattern-hardening',
    name: 'Access Pattern Hardening',
    description: 'ACCESS usage analyzed by BRAIN to inform DEFENSE rate limits and SYSTEM quotas',
    category: 'security',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
      { name: 'SYSTEM', role: 'fallback', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },

  // === ACCESSIBILITY SYNERGIES ===
  {
    id: 'inclusive-content',
    name: 'Inclusive Content',
    description: 'NEXUS generation filtered by INCLUSIVE compliance and DECODE clarity scoring',
    category: 'accessibility',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: true },
      { name: 'DECODE', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 2,
  },
  {
    id: 'adaptive-ui',
    name: 'Adaptive UI',
    description: 'INCLUSIVE scan informs MODERNIZER fixes and DECODE personalization',
    category: 'accessibility',
    modules: [
      { name: 'INCLUSIVE', role: 'primary', required: true },
      { name: 'MODERNIZER', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 2,
  },

  // === AUTOMATION SYNERGIES ===
  {
    id: 'evolution-confidence',
    name: 'Evolution Confidence',
    description: 'CORTEX proposals scored by BRAIN learning history and MODERNIZER impact analysis',
    category: 'automation',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'MODERNIZER', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 700,
    minModulesRequired: 3,
  },
  {
    id: 'autonomous-documentation',
    name: 'Autonomous Documentation',
    description: 'MODERNIZER code analysis combined with DECODE explanation and SYSTEM versioning',
    category: 'automation',
    modules: [
      { name: 'MODERNIZER', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 450,
    minModulesRequired: 2,
  },
  {
    id: 'intent-amplification',
    name: 'Intent Amplification',
    description: 'DECODE intent parsing amplified by RIPPLE event context and INCLUSIVE clarity',
    category: 'automation',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 2,
  },

  // === ADDITIONAL INTELLIGENCE SYNERGIES ===
  {
    id: 'learning-acceleration',
    name: 'Learning Acceleration',
    description: 'BRAIN learning enhanced by DREAM pattern synthesis and CORTEX prioritization',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 2,
  },
  {
    id: 'cognitive-fusion',
    name: 'Cognitive Fusion',
    description: 'NEXUS multi-provider reasoning fused with BRAIN memory and VISION performance data',
    category: 'intelligence',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 3,
  },

  // === ADDITIONAL OPTIMIZATION SYNERGIES ===
  {
    id: 'resource-balancing',
    name: 'Resource Balancing',
    description: 'CORTEX orchestration tuned by VISION metrics and SYSTEM quota management',
    category: 'optimization',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 3,
  },
  {
    id: 'latency-prediction',
    name: 'Latency Prediction',
    description: 'VISION historical latency analyzed by BRAIN patterns to predict NEXUS route timing',
    category: 'optimization',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 3,
  },

  // === ADDITIONAL RESILIENCE SYNERGIES ===
  {
    id: 'cascade-prevention',
    name: 'Cascade Prevention',
    description: 'DEFENSE circuit breakers coordinated with RIPPLE event isolation and CORE fallbacks',
    category: 'resilience',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'CORE', role: 'fallback', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 50,
    minModulesRequired: 3,
  },
  {
    id: 'memory-persistence',
    name: 'Memory Persistence',
    description: 'BRAIN consolidation backed by SYSTEM storage and VISION integrity checks',
    category: 'resilience',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: false },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 2,
  },

  // === ADDITIONAL SECURITY SYNERGIES ===
  {
    id: 'anomaly-correlation',
    name: 'Anomaly Correlation',
    description: 'VISION anomaly detection correlated with DEFENSE threat intel and BRAIN patterns',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 180,
    minModulesRequired: 3,
  },

  // === INTEGRATION & EXTERNAL SYNERGIES ===
  {
    id: 'external-api-intelligence',
    name: 'External API Intelligence',
    description: 'INTEGRATION adapter health monitored by VISION metrics and BRAIN pattern learning',
    category: 'optimization',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  {
    id: 'webhook-orchestration',
    name: 'Webhook Orchestration',
    description: 'INTEGRATION webhooks coordinated by RIPPLE event routing and CORTEX scheduling',
    category: 'orchestration',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 120,
    minModulesRequired: 3,
  },
  {
    id: 'adapter-failover',
    name: 'Adapter Failover',
    description: 'INTEGRATION adapter failures handled by DEFENSE circuit breakers and NEXUS fallback routing',
    category: 'resilience',
    modules: [
      { name: 'INTEGRATION', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'NEXUS', role: 'fallback', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 80,
    minModulesRequired: 3,
  },

  // === ACCESS & ENTITLEMENT SYNERGIES ===
  {
    id: 'entitlement-aware-routing',
    name: 'Entitlement-Aware Routing',
    description: 'ACCESS entitlements inform NEXUS model selection and CORTEX cost governance',
    category: 'optimization',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 60,
    minModulesRequired: 3,
  },
  {
    id: 'quota-prediction',
    name: 'Quota Prediction',
    description: 'ACCESS usage patterns analyzed by BRAIN to predict VISION quota exhaustion warnings',
    category: 'intelligence',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 100,
    minModulesRequired: 3,
  },
  {
    id: 'developer-experience-optimization',
    name: 'Developer Experience Optimization',
    description: 'ACCESS API patterns inform DECODE intent parsing and INCLUSIVE developer-friendly outputs',
    category: 'accessibility',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'INCLUSIVE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },

  // === SEBA AUTONOMOUS SYNERGIES ===
  {
    id: 'autonomous-evolution',
    name: 'Autonomous Evolution',
    description: 'CORTEX evolution proposals enhanced by BRAIN learning history and MODERNIZER impact simulation',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'MODERNIZER', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 4,
  },
  {
    id: 'cognitive-curriculum',
    name: 'Cognitive Curriculum',
    description: 'DREAM learning goals informed by BRAIN knowledge gaps and CORTEX priority scheduling',
    category: 'intelligence',
    modules: [
      { name: 'DREAM', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 3,
  },
  {
    id: 'bounded-autonomy-guard',
    name: 'Bounded Autonomy Guard',
    description: 'CORTEX autonomous actions gated by DEFENSE safety checks and VISION impact monitoring',
    category: 'security',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 150,
    minModulesRequired: 3,
  },

  // === FULL-STACK COGNITIVE SYNERGIES ===
  {
    id: 'end-to-end-reasoning',
    name: 'End-to-End Reasoning',
    description: 'DECODE intent through NEXUS reasoning through BRAIN memory through CORTEX decision',
    category: 'intelligence',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'NEXUS', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 900,
    minModulesRequired: 4,
  },
];

/**
 * Initialize the synergy registry with all definitions
 */
export function initSynergyRegistry(): void {
  for (const def of SYNERGY_DEFINITIONS) {
    registry.synergies.set(def.id, def);
  }
}

/**
 * Register a synergy executor
 */
export function registerSynergyExecutor(
  synergyId: string,
  executor: SynergyExecutor
): void {
  if (!registry.synergies.has(synergyId)) {
    throw new Error(`Synergy '${synergyId}' not found in registry`);
  }
  registry.executors.set(synergyId, executor);
}

/**
 * Get a synergy definition by ID
 */
export function getSynergy(id: string): SynergyDefinition | undefined {
  return registry.synergies.get(id);
}

/**
 * Get a synergy executor by ID
 */
export function getSynergyExecutor(id: string): SynergyExecutor | undefined {
  return registry.executors.get(id);
}

/**
 * List all synergies, optionally filtered by category
 */
export function listSynergies(category?: string): SynergyDefinition[] {
  const all = Array.from(registry.synergies.values());
  if (category) {
    return all.filter(s => s.category === category);
  }
  return all;
}

/**
 * Get synergies that use a specific module
 */
export function getSynergiesByModule(moduleName: string): SynergyDefinition[] {
  return Array.from(registry.synergies.values()).filter(s =>
    s.modules.some(m => m.name.toUpperCase() === moduleName.toUpperCase())
  );
}

/**
 * Get synergy categories with counts
 */
export function getSynergyCategories(): { category: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of registry.synergies.values()) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
}

// Auto-initialize on module load
initSynergyRegistry();
