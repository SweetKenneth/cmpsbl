/**
 * CMPSBL® DREAM — Lineage Provenance Tracker
 * Tracks full derivation chains for synthesized heuristics.
 * MAX_GENERATION = 5 — prevents semantic drift via depth limit.
 */

export const MAX_GENERATION = 5;

export interface LineageNode {
  id: string;
  generation: number;
  parentIds: string[];
  content: string;
  confidence: number;
  createdAt: string;
  domain: string;
  isTerminal: boolean; // true if generation === MAX_GENERATION
}

export interface LineageChain {
  rootId: string;
  nodes: LineageNode[];
  depth: number;
  avgConfidence: number;
  confidenceDecay: number; // avg loss per generation
}

// Bounded store
const MAX_LINEAGE_NODES = 5000;
const lineageIndex = new Map<string, LineageNode>();

/**
 * Register a root-level memory (generation 0)
 */
export function registerRoot(id: string, content: string, confidence: number, domain: string = 'general'): LineageNode {
  const node: LineageNode = {
    id,
    generation: 0,
    parentIds: [],
    content,
    confidence,
    createdAt: new Date().toISOString(),
    domain,
    isTerminal: false,
  };
  storeNode(node);
  return node;
}

/**
 * Register a derived heuristic with lineage
 */
export function registerDerived(
  id: string,
  parentIds: string[],
  content: string,
  confidence: number,
  domain: string = 'general'
): LineageNode | null {
  // Compute generation from parents
  let maxParentGen = 0;
  for (const pid of parentIds) {
    const parent = lineageIndex.get(pid);
    if (parent) {
      maxParentGen = Math.max(maxParentGen, parent.generation);
    }
  }

  const generation = maxParentGen + 1;

  // Enforce MAX_GENERATION
  if (generation > MAX_GENERATION) {
    return null; // Cannot derive further
  }

  const node: LineageNode = {
    id,
    generation,
    parentIds,
    content,
    confidence,
    createdAt: new Date().toISOString(),
    domain,
    isTerminal: generation === MAX_GENERATION,
  };
  storeNode(node);
  return node;
}

/**
 * Get full lineage chain for a node (ancestors to root)
 */
export function getLineageChain(nodeId: string): LineageChain | null {
  const node = lineageIndex.get(nodeId);
  if (!node) return null;

  const nodes: LineageNode[] = [];
  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const n = lineageIndex.get(id);
    if (!n) continue;
    nodes.push(n);

    for (const pid of n.parentIds) {
      if (!visited.has(pid)) queue.push(pid);
    }
  }

  nodes.sort((a, b) => a.generation - b.generation);

  // Calculate confidence decay
  const generations = [...new Set(nodes.map(n => n.generation))].sort((a, b) => a - b);
  let confidenceDecay = 0;
  if (generations.length >= 2) {
    const genConfidences = generations.map(g => {
      const genNodes = nodes.filter(n => n.generation === g);
      return genNodes.reduce((sum, n) => sum + n.confidence, 0) / genNodes.length;
    });
    const losses: number[] = [];
    for (let i = 1; i < genConfidences.length; i++) {
      losses.push(genConfidences[i - 1] - genConfidences[i]);
    }
    confidenceDecay = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  }

  const avgConfidence = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.confidence, 0) / nodes.length : 0;

  return {
    rootId: nodes[0]?.id || nodeId,
    nodes,
    depth: Math.max(...nodes.map(n => n.generation), 0),
    avgConfidence: Math.round(avgConfidence * 1000) / 1000,
    confidenceDecay: Math.round(confidenceDecay * 1000) / 1000,
  };
}

/**
 * Check if a node can be further derived
 */
export function canDerive(nodeId: string): boolean {
  const node = lineageIndex.get(nodeId);
  return !!node && !node.isTerminal;
}

/**
 * Get all terminal nodes (generation = MAX_GENERATION)
 */
export function getTerminalNodes(): LineageNode[] {
  return Array.from(lineageIndex.values()).filter(n => n.isTerminal);
}

/**
 * Get lineage stats
 */
export function getLineageStats(): {
  totalNodes: number;
  byGeneration: Record<number, number>;
  terminalCount: number;
  avgDepth: number;
} {
  const byGeneration: Record<number, number> = {};
  let terminalCount = 0;

  for (const node of lineageIndex.values()) {
    byGeneration[node.generation] = (byGeneration[node.generation] || 0) + 1;
    if (node.isTerminal) terminalCount++;
  }

  const generations = Object.keys(byGeneration).map(Number);
  const avgDepth = generations.length > 0 ? generations.reduce((a, b) => a + b, 0) / generations.length : 0;

  return {
    totalNodes: lineageIndex.size,
    byGeneration,
    terminalCount,
    avgDepth: Math.round(avgDepth * 10) / 10,
  };
}

function storeNode(node: LineageNode): void {
  if (lineageIndex.size >= MAX_LINEAGE_NODES && !lineageIndex.has(node.id)) {
    // Evict oldest terminal node first
    for (const [id, n] of lineageIndex) {
      if (n.isTerminal) { lineageIndex.delete(id); break; }
    }
    // Fallback: evict oldest
    if (lineageIndex.size >= MAX_LINEAGE_NODES) {
      const oldest = lineageIndex.keys().next().value;
      if (oldest) lineageIndex.delete(oldest);
    }
  }
  lineageIndex.set(node.id, node);
}
