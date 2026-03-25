/**
 * Substrate — Module Dependency Health Matrix
 * Maps inter-module dependencies and detects cascading failure risks.
 *
 * Optimizations:
 * - Pre-computed adjacency indexes for O(1) dependency/dependent lookups
 * - Single-pass buildDependencyMatrix (no repeated graph scans)
 * - Cached module ID set derived at init
 */

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'required' | 'optional' | 'event';
  weight: number; // 0–1, how critical this dependency is
}

export interface DependencyHealthNode {
  moduleId: string;
  healthScore: number;
  dependencies: string[];
  dependents: string[];
  cascadeRisk: number; // 0–1, how much this module's failure affects others
}

// Static dependency graph for the 40-primitive / 4-category substrate
const DEPENDENCY_GRAPH: DependencyEdge[] = [
  // CCR dependencies
  { from: 'brain', to: 'nexus', type: 'required', weight: 0.9 },
  { from: 'brain', to: 'memory', type: 'required', weight: 0.8 },
  { from: 'dream', to: 'brain', type: 'required', weight: 0.7 },
  { from: 'dream', to: 'memory', type: 'required', weight: 0.6 },
  // Execution dependencies
  { from: 'decode', to: 'nexus', type: 'required', weight: 0.95 },
  { from: 'decode', to: 'brain', type: 'optional', weight: 0.5 },
  { from: 'encode', to: 'nexus', type: 'required', weight: 0.9 },
  { from: 'encode', to: 'decode', type: 'required', weight: 0.7 },
  { from: 'cortex', to: 'brain', type: 'required', weight: 0.8 },
  { from: 'cortex', to: 'memory', type: 'required', weight: 0.7 },
  { from: 'vision', to: 'ripple', type: 'event', weight: 0.4 },
  { from: 'economy', to: 'access', type: 'required', weight: 0.8 },
  { from: 'integration', to: 'nexus', type: 'required', weight: 0.9 },
  { from: 'medic', to: 'vision', type: 'required', weight: 0.7 },
  { from: 'nerve', to: 'ripple', type: 'event', weight: 0.6 },
  // OCG dependencies
  { from: 'system', to: 'ripple', type: 'event', weight: 0.3 },
  { from: 'audit', to: 'ripple', type: 'event', weight: 0.5 },
  { from: 'relay', to: 'ripple', type: 'required', weight: 0.6 },
  // ESZ dependencies
  { from: 'sovereign', to: 'governance', type: 'required', weight: 0.8 },
  { from: 'oracle', to: 'brain', type: 'required', weight: 0.7 },
  { from: 'oracle', to: 'memory', type: 'optional', weight: 0.5 },
  { from: 'conscience', to: 'governance', type: 'required', weight: 0.8 },
  { from: 'treaty', to: 'sovereign', type: 'required', weight: 0.7 },
  // EPZ dependencies
  { from: 'compass', to: 'vision', type: 'required', weight: 0.6 },
  { from: 'echo', to: 'ripple', type: 'event', weight: 0.5 },
  { from: 'reflex', to: 'nexus', type: 'required', weight: 0.7 },
  // EMZ dependencies
  { from: 'forge', to: 'encode', type: 'required', weight: 0.8 },
  { from: 'lingua', to: 'decode', type: 'required', weight: 0.7 },
  { from: 'phantom', to: 'defense', type: 'required', weight: 0.6 },
  { from: 'harvest', to: 'integration', type: 'required', weight: 0.7 },
  // Mesh / Shell dependencies
  { from: 'defense', to: 'ripple', type: 'event', weight: 0.5 },
  { from: 'immunity', to: 'defense', type: 'required', weight: 0.6 },
  { from: 'evolution', to: 'brain', type: 'optional', weight: 0.4 },
];

// ═══ Pre-computed adjacency indexes — O(1) lookups ═══════════════

/** from → edges[] */
const dependencyIndex = new Map<string, DependencyEdge[]>();
/** to → edges[] */
const dependentIndex = new Map<string, DependencyEdge[]>();
/** All unique module IDs */
const allModuleIds: string[] = [];
/** Pre-computed cascade risk per module */
const cascadeRiskCache = new Map<string, number>();

// Build indexes once at module load
(function buildIndexes() {
  const moduleSet = new Set<string>();
  for (const edge of DEPENDENCY_GRAPH) {
    moduleSet.add(edge.from);
    moduleSet.add(edge.to);

    let deps = dependencyIndex.get(edge.from);
    if (!deps) { deps = []; dependencyIndex.set(edge.from, deps); }
    deps.push(edge);

    let depts = dependentIndex.get(edge.to);
    if (!depts) { depts = []; dependentIndex.set(edge.to, depts); }
    depts.push(edge);
  }
  allModuleIds.push(...moduleSet);

  // Pre-compute cascade risk for each module
  for (const moduleId of allModuleIds) {
    const dependents = dependentIndex.get(moduleId);
    if (!dependents || dependents.length === 0) {
      cascadeRiskCache.set(moduleId, 0);
    } else {
      let totalWeight = 0;
      for (let i = 0; i < dependents.length; i++) totalWeight += dependents[i].weight;
      cascadeRiskCache.set(moduleId, Math.min(1, totalWeight / dependents.length));
    }
  }
})();

/**
 * Get all dependencies for a module — O(1) lookup.
 */
export function getDependencies(moduleId: string): DependencyEdge[] {
  return dependencyIndex.get(moduleId) ?? [];
}

/**
 * Get all modules that depend on this module — O(1) lookup.
 */
export function getDependents(moduleId: string): DependencyEdge[] {
  return dependentIndex.get(moduleId) ?? [];
}

/**
 * Calculate cascade risk — O(1) from pre-computed cache.
 */
export function calculateCascadeRisk(moduleId: string): number {
  return cascadeRiskCache.get(moduleId) ?? 0;
}

/**
 * Build the full dependency health matrix — single pass over cached module IDs.
 */
export function buildDependencyMatrix(healthScores: Record<string, number>): DependencyHealthNode[] {
  const result: DependencyHealthNode[] = new Array(allModuleIds.length);
  for (let i = 0; i < allModuleIds.length; i++) {
    const moduleId = allModuleIds[i];
    const deps = dependencyIndex.get(moduleId);
    const depts = dependentIndex.get(moduleId);
    result[i] = {
      moduleId,
      healthScore: healthScores[moduleId] ?? 100,
      dependencies: deps ? deps.map(d => d.to) : [],
      dependents: depts ? depts.map(d => d.from) : [],
      cascadeRisk: cascadeRiskCache.get(moduleId) ?? 0,
    };
  }
  return result;
}

/**
 * Identify high-risk modules (high cascade risk + low health).
 */
export function getHighRiskModules(healthScores: Record<string, number>): DependencyHealthNode[] {
  // Single-pass filter instead of buildDependencyMatrix + filter + sort
  const result: DependencyHealthNode[] = [];
  for (let i = 0; i < allModuleIds.length; i++) {
    const moduleId = allModuleIds[i];
    const risk = cascadeRiskCache.get(moduleId) ?? 0;
    const health = healthScores[moduleId] ?? 100;
    if (risk > 0.5 && health < 70) {
      const deps = dependencyIndex.get(moduleId);
      const depts = dependentIndex.get(moduleId);
      result.push({
        moduleId,
        healthScore: health,
        dependencies: deps ? deps.map(d => d.to) : [],
        dependents: depts ? depts.map(d => d.from) : [],
        cascadeRisk: risk,
      });
    }
  }
  // Sort by cascade risk descending
  result.sort((a, b) => b.cascadeRisk - a.cascadeRisk);
  return result;
}

/**
 * Get the full dependency graph for visualization.
 */
export function getDependencyGraph(): DependencyEdge[] {
  return [...DEPENDENCY_GRAPH];
}
