/**
 * SYSTEM Dependency Graph
 * v10.5.4 ARCHITECT — Runtime dependency tracking and impact analysis
 */
 
 import { SUBSTRATE_MODULES, type SubstrateModuleName } from '../core';
 
 // Dependency node
 export interface DependencyNode {
   module: SubstrateModuleName;
   dependencies: SubstrateModuleName[];
   dependents: SubstrateModuleName[];
   depth: number;
   criticalPath: boolean;
 }
 
 // Dependency graph
 export interface DependencyGraph {
   nodes: Map<SubstrateModuleName, DependencyNode>;
   edges: Array<{ from: SubstrateModuleName; to: SubstrateModuleName }>;
   bootOrder: SubstrateModuleName[];
   criticalPath: SubstrateModuleName[];
 }
 
 // Impact analysis result
 export interface ImpactAnalysis {
   module: SubstrateModuleName;
   directImpact: SubstrateModuleName[];
   transitiveImpact: SubstrateModuleName[];
   riskLevel: 'low' | 'medium' | 'high' | 'critical';
   recommendation: string;
 }
 
 // Defined dependencies between modules
 const MODULE_DEPENDENCIES: Record<SubstrateModuleName, SubstrateModuleName[]> = {
   core: [],
   ripple: ['core'],
   access: ['core'],
   brain: ['core'],
   decode: ['core'],
   defense: ['core'],
   nexus: ['core'],
   vision: ['core'],
   dream: ['core'],
   system: ['core'],
   modernizer: ['core'],
   integration: ['core'],
   inclusive: ['core'],
   cortex: ['core'],
   memory: ['core'],
   relay: ['core'],
   audit: ['core'],
   identity: ['core'],
   economy: ['core'],
   sandbox: ['core'],
   encode: ['core', 'decode'],
   immunity: ['core', 'defense'],
   evolution: ['core'],
   intent: ['core'],
   governance: ['core'],
 };
 
 // Build and cache the graph
 let cachedGraph: DependencyGraph | null = null;
 
 /**
  * Build the dependency graph
  */
 export function buildGraph(): DependencyGraph {
   if (cachedGraph) return cachedGraph;
   
   const nodes = new Map<SubstrateModuleName, DependencyNode>();
   const edges: Array<{ from: SubstrateModuleName; to: SubstrateModuleName }> = [];
   
   // Initialize nodes
   for (const module of SUBSTRATE_MODULES) {
     nodes.set(module, {
       module,
       dependencies: MODULE_DEPENDENCIES[module] || [],
       dependents: [],
       depth: 0,
       criticalPath: false,
     });
   }
   
   // Build edges and dependents
   for (const module of SUBSTRATE_MODULES) {
     const deps = MODULE_DEPENDENCIES[module] || [];
     for (const dep of deps) {
       edges.push({ from: module, to: dep });
       nodes.get(dep)!.dependents.push(module);
     }
   }
   
   // Calculate depths
   calculateDepths(nodes);
   
   // Determine boot order
   const bootOrder = topologicalSort(nodes);
   
   // Find critical path
   const criticalPath = findCriticalPath(nodes);
   for (const module of criticalPath) {
     nodes.get(module)!.criticalPath = true;
   }
   
   cachedGraph = { nodes, edges, bootOrder, criticalPath };
   return cachedGraph;
 }
 
 /**
  * Calculate node depths
  */
 function calculateDepths(nodes: Map<SubstrateModuleName, DependencyNode>): void {
   const visited = new Set<SubstrateModuleName>();
   
   function calcDepth(module: SubstrateModuleName): number {
     if (visited.has(module)) return nodes.get(module)!.depth;
     visited.add(module);
     
     const node = nodes.get(module)!;
     if (node.dependencies.length === 0) {
       node.depth = 0;
       return 0;
     }
     
     const maxDepth = Math.max(...node.dependencies.map(calcDepth));
     node.depth = maxDepth + 1;
     return node.depth;
   }
   
   for (const module of nodes.keys()) {
     calcDepth(module);
   }
 }
 
 /**
  * Topological sort for boot order
  */
 function topologicalSort(nodes: Map<SubstrateModuleName, DependencyNode>): SubstrateModuleName[] {
   const sorted: SubstrateModuleName[] = [];
   const visited = new Set<SubstrateModuleName>();
   const visiting = new Set<SubstrateModuleName>();
   
   function visit(module: SubstrateModuleName): void {
     if (visited.has(module)) return;
     if (visiting.has(module)) return; // Cycle detected
     
     visiting.add(module);
     
     const node = nodes.get(module)!;
     for (const dep of node.dependencies) {
       visit(dep);
     }
     
     visiting.delete(module);
     visited.add(module);
     sorted.push(module);
   }
   
   for (const module of nodes.keys()) {
     visit(module);
   }
   
   return sorted;
 }
 
 /**
  * Find the critical path (longest dependency chain)
  */
 function findCriticalPath(nodes: Map<SubstrateModuleName, DependencyNode>): SubstrateModuleName[] {
   let maxDepth = 0;
   let deepestModule: SubstrateModuleName = 'core';
   
   for (const node of nodes.values()) {
     if (node.depth > maxDepth) {
       maxDepth = node.depth;
       deepestModule = node.module;
     }
   }
   
   // Trace back from deepest
   const path: SubstrateModuleName[] = [deepestModule];
   let current = nodes.get(deepestModule)!;
   
   while (current.dependencies.length > 0) {
     const deepestDep = current.dependencies.reduce((a, b) => 
       nodes.get(a)!.depth > nodes.get(b)!.depth ? a : b
     );
     path.unshift(deepestDep);
     current = nodes.get(deepestDep)!;
   }
   
   return path;
 }
 
 /**
  * Analyze impact of a module change
  */
 export function analyzeImpact(module: SubstrateModuleName): ImpactAnalysis {
   const graph = buildGraph();
   const node = graph.nodes.get(module);
   
   if (!node) {
     return {
       module,
       directImpact: [],
       transitiveImpact: [],
       riskLevel: 'low',
       recommendation: 'Module not found',
     };
   }
   
   // Direct impact = immediate dependents
   const directImpact = [...node.dependents];
   
   // Transitive impact = all modules that depend transitively
   const transitiveImpact = new Set<SubstrateModuleName>();
   const queue = [...directImpact];
   
   while (queue.length > 0) {
     const current = queue.shift()!;
     if (transitiveImpact.has(current)) continue;
     transitiveImpact.add(current);
     
     const currentNode = graph.nodes.get(current);
     if (currentNode) {
       queue.push(...currentNode.dependents);
     }
   }
   
   // Calculate risk level
   const totalImpact = transitiveImpact.size;
   let riskLevel: ImpactAnalysis['riskLevel'] = 'low';
   
   if (node.criticalPath || totalImpact > 8) {
     riskLevel = 'critical';
   } else if (totalImpact > 5) {
     riskLevel = 'high';
   } else if (totalImpact > 2) {
     riskLevel = 'medium';
   }
   
   // Generate recommendation
   let recommendation = 'Safe to modify with standard testing.';
   if (riskLevel === 'critical') {
     recommendation = 'This module is on the critical path. Extensive testing and staged rollout required.';
   } else if (riskLevel === 'high') {
     recommendation = 'Multiple dependent modules. Consider feature flags and comprehensive integration tests.';
   } else if (riskLevel === 'medium') {
     recommendation = 'Test all dependent modules before deployment.';
   }
   
   return {
     module,
     directImpact,
     transitiveImpact: Array.from(transitiveImpact),
     riskLevel,
     recommendation,
   };
 }
 
 /**
  * Get modules that can be safely updated in isolation
  */
 export function getIsolatedModules(): SubstrateModuleName[] {
   const graph = buildGraph();
   
   return Array.from(graph.nodes.values())
     .filter(node => node.dependents.length === 0)
     .map(node => node.module);
 }
 
 /**
  * Get boot order
  */
 export function getBootOrder(): SubstrateModuleName[] {
   return buildGraph().bootOrder;
 }
 
 /**
  * Get critical path
  */
 export function getCriticalPath(): SubstrateModuleName[] {
   return buildGraph().criticalPath;
 }
 
 /**
  * Get graph statistics
  */
 export function getGraphStats(): {
   totalModules: number;
   totalEdges: number;
   maxDepth: number;
   avgDependencies: number;
   criticalPathLength: number;
 } {
   const graph = buildGraph();
   const nodes = Array.from(graph.nodes.values());
   
   const maxDepth = Math.max(...nodes.map(n => n.depth));
   const avgDependencies = nodes.reduce((sum, n) => sum + n.dependencies.length, 0) / nodes.length;
   
   return {
     totalModules: nodes.length,
     totalEdges: graph.edges.length,
     maxDepth,
     avgDependencies,
     criticalPathLength: graph.criticalPath.length,
   };
 }
 
 /**
  * Invalidate cached graph
  */
 export function invalidateGraph(): void {
   cachedGraph = null;
 }