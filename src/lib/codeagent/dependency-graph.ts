/**
 * CodeAgent v3 - Dependency Graph Builder
 * Visualize component relationships and imports
 */

import { analyzeCode, ASTAnalysis } from './ast-analyzer';

export interface DependencyNode {
  id: string;
  path: string;
  name: string;
  type: 'component' | 'hook' | 'util' | 'type' | 'page' | 'api';
  imports: string[];
  exports: string[];
  complexity: number;
  linesOfCode: number;
}

export interface DependencyEdge {
  source: string;
  target: string;
  weight: number;
  importedSymbols: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  entryPoints: string[];
  leafNodes: string[];
  cycles: string[][];
  metrics: {
    totalNodes: number;
    totalEdges: number;
    avgComplexity: number;
    maxDepth: number;
    couplingScore: number;
  };
}

/**
 * Build a dependency graph from file analyses
 */
export function buildDependencyGraph(
  files: Map<string, string>
): DependencyGraph {
  const analyses = new Map<string, ASTAnalysis>();
  const nodes: DependencyNode[] = [];
  const edges: DependencyEdge[] = [];
  
  // First pass: analyze all files
  for (const [path, content] of files) {
    const analysis = analyzeCode(content, path);
    analyses.set(path, analysis);
    
    const type = inferFileType(path, analysis);
    const name = path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || path;
    
    nodes.push({
      id: path,
      path,
      name,
      type,
      imports: analysis.imports.map(i => i.source),
      exports: analysis.exports.map(e => e.name),
      complexity: analysis.cyclomaticComplexity,
      linesOfCode: analysis.linesOfCode
    });
  }
  
  // Second pass: build edges
  for (const [path, analysis] of analyses) {
    for (const imp of analysis.imports) {
      const resolvedPath = resolveImportPath(path, imp.source, files);
      if (resolvedPath && files.has(resolvedPath)) {
        edges.push({
          source: path,
          target: resolvedPath,
          weight: imp.specifiers.length,
          importedSymbols: imp.specifiers
        });
      }
    }
  }
  
  // Calculate metrics
  const entryPoints = findEntryPoints(nodes, edges);
  const leafNodes = findLeafNodes(nodes, edges);
  const cycles = detectCycles(nodes, edges);
  
  const totalComplexity = nodes.reduce((sum, n) => sum + n.complexity, 0);
  const avgComplexity = nodes.length > 0 ? totalComplexity / nodes.length : 0;
  const maxDepth = calculateMaxDepth(entryPoints, edges);
  const couplingScore = edges.length / Math.max(1, nodes.length);
  
  return {
    nodes,
    edges,
    entryPoints,
    leafNodes,
    cycles,
    metrics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      maxDepth,
      couplingScore: Math.round(couplingScore * 100) / 100
    }
  };
}

function inferFileType(path: string, analysis: ASTAnalysis): DependencyNode['type'] {
  if (path.includes('/pages/') || path.includes('/routes/')) return 'page';
  if (path.includes('/hooks/') || path.match(/use[A-Z]/)) return 'hook';
  if (path.includes('/components/')) return 'component';
  if (path.includes('/api/') || path.includes('/functions/')) return 'api';
  if (path.includes('/types/') || analysis.types.length > analysis.functions.length) return 'type';
  if (analysis.hasJSX) return 'component';
  return 'util';
}

function resolveImportPath(
  fromPath: string,
  importSource: string,
  files: Map<string, string>
): string | null {
  // Handle alias imports like @/components/...
  if (importSource.startsWith('@/')) {
    const resolved = 'src/' + importSource.slice(2);
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      if (files.has(resolved + ext)) return resolved + ext;
    }
  }
  
  // Handle relative imports
  if (importSource.startsWith('./') || importSource.startsWith('../')) {
    const fromDir = fromPath.split('/').slice(0, -1).join('/');
    const parts = importSource.split('/');
    let current = fromDir.split('/');
    
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') current.pop();
      else current.push(part);
    }
    
    const resolved = current.join('/');
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    for (const ext of extensions) {
      if (files.has(resolved + ext)) return resolved + ext;
    }
  }
  
  return null;
}

function findEntryPoints(nodes: DependencyNode[], edges: DependencyEdge[]): string[] {
  const imported = new Set(edges.map(e => e.target));
  return nodes.filter(n => !imported.has(n.id)).map(n => n.id);
}

function findLeafNodes(nodes: DependencyNode[], edges: DependencyEdge[]): string[] {
  const importing = new Set(edges.map(e => e.source));
  return nodes.filter(n => !importing.has(n.id)).map(n => n.id);
}

function detectCycles(nodes: DependencyNode[], edges: DependencyEdge[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];
  
  const adjacency = new Map<string, string[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
  }
  
  function dfs(nodeId: string): void {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(nodeId);
    
    for (const neighbor of adjacency.get(nodeId) || []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recStack.has(neighbor)) {
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    }
    
    path.pop();
    recStack.delete(nodeId);
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }
  
  return cycles;
}

function calculateMaxDepth(entryPoints: string[], edges: DependencyEdge[]): number {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    adjacency.get(edge.source)!.push(edge.target);
  }
  
  let maxDepth = 0;
  const visited = new Map<string, number>();
  
  function dfs(nodeId: string, depth: number): number {
    if (visited.has(nodeId)) return visited.get(nodeId)!;
    
    const neighbors = adjacency.get(nodeId) || [];
    let maxChildDepth = depth;
    
    for (const neighbor of neighbors) {
      maxChildDepth = Math.max(maxChildDepth, dfs(neighbor, depth + 1));
    }
    
    visited.set(nodeId, maxChildDepth);
    return maxChildDepth;
  }
  
  for (const entry of entryPoints) {
    maxDepth = Math.max(maxDepth, dfs(entry, 0));
  }
  
  return maxDepth;
}

/**
 * Get impact analysis for changing a file
 */
export function getImpactedFiles(
  graph: DependencyGraph,
  changedFile: string
): { direct: string[]; indirect: string[]; risk: 'low' | 'medium' | 'high' } {
  const direct = graph.edges
    .filter(e => e.target === changedFile)
    .map(e => e.source);
  
  const indirect: string[] = [];
  const visited = new Set(direct);
  const queue = [...direct];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const dependents = graph.edges
      .filter(e => e.target === current)
      .map(e => e.source);
    
    for (const dep of dependents) {
      if (!visited.has(dep)) {
        visited.add(dep);
        indirect.push(dep);
        queue.push(dep);
      }
    }
  }
  
  const totalImpacted = direct.length + indirect.length;
  const risk = totalImpacted > 10 ? 'high' : totalImpacted > 3 ? 'medium' : 'low';
  
  return { direct, indirect, risk };
}
