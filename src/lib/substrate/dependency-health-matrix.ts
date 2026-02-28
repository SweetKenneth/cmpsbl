/**
 * Substrate — Module Dependency Health Matrix
 * Maps inter-module dependencies and detects cascading failure risks.
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

// Static dependency graph for the substrate
const DEPENDENCY_GRAPH: DependencyEdge[] = [
  // CORE dependencies
  { from: 'brain', to: 'nexus', type: 'required', weight: 0.9 },
  { from: 'brain', to: 'memory', type: 'required', weight: 0.8 },
  { from: 'decode', to: 'nexus', type: 'required', weight: 0.95 },
  { from: 'decode', to: 'brain', type: 'optional', weight: 0.5 },
  { from: 'encode', to: 'nexus', type: 'required', weight: 0.9 },
  { from: 'encode', to: 'decode', type: 'required', weight: 0.7 },
  { from: 'cortex', to: 'brain', type: 'required', weight: 0.8 },
  { from: 'cortex', to: 'memory', type: 'required', weight: 0.7 },
  { from: 'vision', to: 'ripple', type: 'event', weight: 0.4 },
  { from: 'defense', to: 'ripple', type: 'event', weight: 0.5 },
  { from: 'economy', to: 'access', type: 'required', weight: 0.8 },
  { from: 'integration', to: 'nexus', type: 'required', weight: 0.9 },
  { from: 'system', to: 'ripple', type: 'event', weight: 0.3 },
];

/**
 * Get all dependencies for a module.
 */
export function getDependencies(moduleId: string): DependencyEdge[] {
  return DEPENDENCY_GRAPH.filter(e => e.from === moduleId);
}

/**
 * Get all modules that depend on this module.
 */
export function getDependents(moduleId: string): DependencyEdge[] {
  return DEPENDENCY_GRAPH.filter(e => e.to === moduleId);
}

/**
 * Calculate cascade risk: how many other modules would be affected
 * if this module fails, weighted by dependency criticality.
 */
export function calculateCascadeRisk(moduleId: string): number {
  const dependents = getDependents(moduleId);
  if (dependents.length === 0) return 0;

  const totalWeight = dependents.reduce((s, d) => s + d.weight, 0);
  const maxPossibleWeight = dependents.length; // max weight per edge is 1
  return Math.min(1, totalWeight / Math.max(1, maxPossibleWeight));
}

/**
 * Build the full dependency health matrix.
 */
export function buildDependencyMatrix(healthScores: Record<string, number>): DependencyHealthNode[] {
  const moduleIds = new Set<string>();
  DEPENDENCY_GRAPH.forEach(e => {
    moduleIds.add(e.from);
    moduleIds.add(e.to);
  });

  return Array.from(moduleIds).map(moduleId => ({
    moduleId,
    healthScore: healthScores[moduleId] ?? 100,
    dependencies: getDependencies(moduleId).map(d => d.to),
    dependents: getDependents(moduleId).map(d => d.from),
    cascadeRisk: calculateCascadeRisk(moduleId),
  }));
}

/**
 * Identify high-risk modules (high cascade risk + low health).
 */
export function getHighRiskModules(healthScores: Record<string, number>): DependencyHealthNode[] {
  return buildDependencyMatrix(healthScores)
    .filter(n => n.cascadeRisk > 0.5 && n.healthScore < 70)
    .sort((a, b) => b.cascadeRisk - a.cascadeRisk);
}

/**
 * Get the full dependency graph for visualization.
 */
export function getDependencyGraph(): DependencyEdge[] {
  return [...DEPENDENCY_GRAPH];
}
