/**
 * PFV Port → Causal Link Extraction & Reasoning
 * Origin → affects chain tracking for causal reasoning across primitives
 * Benefits: BRAIN, ORACLE, GOVERNANCE
 * Source: PromptFluid-Vision brain/contextClassifier.ts (causal extraction)
 */

export interface CausalChain {
  origin: string;
  affects: string[];
  confidence: number;
  timestamp: string;
}

/**
 * Extract causal links from metadata tags
 */
export function extractCausalLinks(metadata?: Record<string, any>): {
  origin?: string;
  affects?: string[];
} {
  return {
    origin: metadata?.origin,
    affects: Array.isArray(metadata?.affects) ? metadata.affects : undefined,
  };
}

/**
 * Build a causal chain from a sequence of events
 */
export function buildCausalChain(
  events: Array<{ module: string; metadata?: Record<string, any>; timestamp: string }>
): CausalChain[] {
  const chains: CausalChain[] = [];

  for (const event of events) {
    const links = extractCausalLinks(event.metadata);
    if (links.origin && links.affects?.length) {
      chains.push({
        origin: links.origin,
        affects: links.affects,
        confidence: event.metadata?.confidence ?? 0.5,
        timestamp: event.timestamp,
      });
    }
  }

  return chains;
}

/**
 * Find all downstream nodes affected by a given origin
 */
export function getDownstreamEffects(
  chains: CausalChain[],
  origin: string,
  visited = new Set<string>()
): string[] {
  if (visited.has(origin)) return [];
  visited.add(origin);

  const directEffects = chains
    .filter(c => c.origin === origin)
    .flatMap(c => c.affects);

  const allEffects = new Set(directEffects);

  // Recursive: follow the chain
  for (const effect of directEffects) {
    const downstream = getDownstreamEffects(chains, effect, visited);
    downstream.forEach(d => allEffects.add(d));
  }

  return [...allEffects];
}

/**
 * Detect circular causal dependencies
 */
export function detectCircularDependencies(chains: CausalChain[]): string[][] {
  const cycles: string[][] = [];
  const graph = new Map<string, Set<string>>();

  for (const chain of chains) {
    if (!graph.has(chain.origin)) graph.set(chain.origin, new Set());
    chain.affects.forEach(a => graph.get(chain.origin)!.add(a));
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const cycleStart = path.indexOf(node);
      if (cycleStart >= 0) cycles.push(path.slice(cycleStart));
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    for (const neighbor of graph.get(node) || []) {
      dfs(neighbor, [...path, node]);
    }

    stack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node, []);
  }

  return cycles;
}

/**
 * Score the impact of an origin based on downstream breadth and chain confidence
 */
export function scoreImpact(chains: CausalChain[], origin: string): number {
  const downstream = getDownstreamEffects(chains, origin);
  const relevantChains = chains.filter(c => c.origin === origin);
  const avgConfidence = relevantChains.length > 0
    ? relevantChains.reduce((s, c) => s + c.confidence, 0) / relevantChains.length
    : 0;

  // Impact = breadth × confidence
  return downstream.length * avgConfidence;
}
