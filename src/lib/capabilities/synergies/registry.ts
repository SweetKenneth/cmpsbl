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
