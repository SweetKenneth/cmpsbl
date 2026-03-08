/**
 * SYSTEM Dependency Graph
 * Runtime dependency tracking and impact analysis
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
 
  /**
   * Module dependency graph — Field-Based Topology
   * 
   * Spine:  CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM)
   * Grid:   OCG (RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE) — taps off CORE
   * Exec:   Execution nodes depend on CCR + OCG upstream
   * Fields: EVOLUTION, IMMUNITY, INTENT — permeate CCR + Execution
   * Plane:  GOVERNANCE — supervisory blanket over all spine nodes
   * Shell:  DEFENSE — outer containment, depends on GOVERNANCE + IDENTITY
   */
  const MODULE_DEPENDENCIES: Record<SubstrateModuleName, SubstrateModuleName[]> = {
    // ── Spine ──
    core: [],
    system: ['core'],
    brain: ['core', 'system'],
    memory: ['core', 'system', 'brain'],
    dream: ['core', 'system', 'brain', 'memory'],

    // ── Grid: OCG ── (taps off CORE + SYSTEM)
    ripple: ['core', 'system'],
    access: ['core', 'system', 'identity'],
    identity: ['core', 'system'],
    relay: ['core', 'system', 'ripple'],
    audit: ['core', 'system', 'ripple'],

    // ── Execution Sector ── (depends on CCR + OCG upstream)
    decode: ['core', 'brain', 'memory'],
    encode: ['core', 'decode', 'brain', 'memory'],
    vision: ['core', 'system', 'ripple'],
    cortex: ['core', 'brain', 'decode', 'encode'],
    nexus: ['core', 'system', 'economy'],
    economy: ['core', 'system', 'access', 'audit'],
    sandbox: ['core', 'system', 'identity'],
    inclusive: ['core', 'vision'],
    medic: ['core', 'system', 'vision'],
    nerve: ['core', 'ripple', 'system'],
    integration: ['core', 'system', 'ripple', 'audit'],
    modernizer: ['core', 'encode', 'cortex'],

    // ── Fields ── (permeate CCR + Execution)
    evolution: ['core', 'brain', 'memory', 'vision'],
    immunity: ['core', 'defense', 'audit', 'ripple'],
    intent: ['core', 'brain', 'decode'],

    // ── Plane ── (supervisory blanket)
    governance: ['core', 'system', 'audit', 'identity'],

    // ── Shell ── (outer containment)
    defense: ['core', 'system', 'identity', 'ripple'],

    // ── Expansion Modules (38-Node Architecture) ──
    sovereign: ['core', 'defense', 'access'],
    oracle: ['core', 'brain', 'vision'],
    conscience: ['core', 'defense'],
    phantom: ['core', 'defense', 'identity'],
    forge: ['core', 'encode'],
    lingua: ['core', 'decode', 'nexus'],
    compass: ['core', 'vision', 'brain'],
    echo: ['core', 'memory'],
    treaty: ['core', 'access'],
    harvest: ['core', 'memory', 'economy'],
    reflex: ['core', 'nexus', 'vision'],
    shadow: ['core', 'defense'],
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
   
   // Trace back from deepest — build forward to avoid O(n²) unshift
   const path: SubstrateModuleName[] = [];
   let current = nodes.get(deepestModule)!;
   path.push(deepestModule);
   
   while (current.dependencies.length > 0) {
     const deepestDep = current.dependencies.reduce((a, b) => 
       nodes.get(a)!.depth > nodes.get(b)!.depth ? a : b
     );
     path.push(deepestDep);
     current = nodes.get(deepestDep)!;
   }
   
   path.reverse();
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