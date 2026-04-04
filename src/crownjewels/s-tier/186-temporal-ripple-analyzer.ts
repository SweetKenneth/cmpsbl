/**
 * S-Tier 186 — Temporal Ripple Analyzer
 * CJPI: 92 | Module: RIPPLE | ID: S-RPL02
 *
 * Tracks mutations and their blast radius through dependency graphs.
 * Computes causal depth, latency amplification, propagation paths,
 * and temporal ordering. Zero dependencies. Pure TypeScript.
 */

export interface RippleMutation {
  id: string;
  source: string;
  affectedNodes: string[];
  timestamp: number;
  propagationMs: number;
}

export interface BlastAnalysis {
  mutationId: string;
  depth: number;
  affectedCount: number;
  latencyAmplification: number;
  propagationPath: string[];
  cascadeRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface RippleStats {
  totalMutations: number;
  avgBlastRadius: number;
  maxBlastRadius: number;
  hotspots: { source: string; count: number }[];
}

const MAX_MUTATIONS = 1000;

export function createTemporalRippleAnalyzer() {
  let mutations: RippleMutation[] = [];
  const dependencies = new Map<string, string[]>();

  function addDependency(node: string, dependsOn: string[]): void {
    dependencies.set(node, dependsOn);
  }

  function recordMutation(source: string, affectedNodes: string[]): RippleMutation {
    const expanded = expandCascade(source, affectedNodes);
    const mutation: RippleMutation = {
      id: `rpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source,
      affectedNodes: expanded,
      timestamp: Date.now(),
      propagationMs: expanded.length * 2.5,
    };
    if (mutations.length >= MAX_MUTATIONS) mutations.shift();
    mutations.push(mutation);
    return mutation;
  }

  function expandCascade(source: string, initial: string[]): string[] {
    const visited = new Set<string>(initial);
    const queue = [...initial];
    while (queue.length > 0) {
      const node = queue.shift()!;
      for (const [dep, deps] of dependencies) {
        if (deps.includes(node) && !visited.has(dep)) {
          visited.add(dep);
          queue.push(dep);
        }
      }
    }
    return [...visited];
  }

  function analyzeBlastRadius(mutationId: string): BlastAnalysis {
    const m = mutations.find(x => x.id === mutationId);
    if (!m) return { mutationId, depth: 0, affectedCount: 0, latencyAmplification: 1, propagationPath: [], cascadeRisk: 'low' };
    const depth = computeDepth(m.source, m.affectedNodes);
    const amp = 1 + m.affectedNodes.length * 0.08;
    const risk: BlastAnalysis['cascadeRisk'] =
      m.affectedNodes.length > 20 ? 'critical' :
      m.affectedNodes.length > 10 ? 'high' :
      m.affectedNodes.length > 5 ? 'medium' : 'low';
    return {
      mutationId,
      depth,
      affectedCount: m.affectedNodes.length,
      latencyAmplification: amp,
      propagationPath: [m.source, ...m.affectedNodes.slice(0, 10)],
      cascadeRisk: risk,
    };
  }

  function computeDepth(source: string, affected: string[]): number {
    let maxDepth = 0;
    const visited = new Set<string>();
    function walk(node: string, depth: number) {
      if (visited.has(node)) return;
      visited.add(node);
      maxDepth = Math.max(maxDepth, depth);
      for (const a of affected) {
        const deps = dependencies.get(a);
        if (deps?.includes(node)) walk(a, depth + 1);
      }
    }
    walk(source, 0);
    return maxDepth;
  }

  function getCausalChain(source: string, windowMs: number = 60000): RippleMutation[] {
    const cutoff = Date.now() - windowMs;
    return mutations
      .filter(m => m.source === source && m.timestamp > cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  function getStats(): RippleStats {
    const counts = new Map<string, number>();
    for (const m of mutations) counts.set(m.source, (counts.get(m.source) ?? 0) + 1);
    const radii = mutations.map(m => m.affectedNodes.length);
    return {
      totalMutations: mutations.length,
      avgBlastRadius: radii.length > 0 ? radii.reduce((a, b) => a + b, 0) / radii.length : 0,
      maxBlastRadius: radii.length > 0 ? Math.max(...radii) : 0,
      hotspots: [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([source, count]) => ({ source, count })),
    };
  }

  function reset(): void {
    mutations = [];
    dependencies.clear();
  }

  return { addDependency, recordMutation, analyzeBlastRadius, getCausalChain, getStats, reset };
}
