/**
 * SIMULATE Ultimate — System 7: Blast Radius Projector
 * 
 * Given a proposed change, simulates which nodes/resolvers/chains
 * are affected via dependency-graph-aware propagation. Generates
 * risk heat maps per node.
 * 
 * @module simulate/ultimate/blastRadiusProjector
 */

// ── Types ────────────────────────────────────────────────────────

export interface DependencyEdge {
  from: string;
  to: string;
  weight: number;       // 0-1, coupling strength
  type: 'direct' | 'indirect' | 'data' | 'event';
}

export interface BlastRadiusConfig {
  changeTarget: string;        // Node/component being changed
  changeType: 'code' | 'config' | 'schema' | 'dependency' | 'removal';
  changeSeverity: number;      // 0-1
  maxDepth: number;            // Propagation depth limit
}

export interface AffectedComponent {
  nodeId: string;
  depth: number;               // How many hops from the change
  impactScore: number;         // 0-100
  riskLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  pathFromSource: string[];
  affectedCapabilities: string[];
}

export interface BlastRadiusResult {
  id: string;
  config: BlastRadiusConfig;
  affectedComponents: AffectedComponent[];
  totalAffected: number;
  maxImpactScore: number;
  riskHeatMap: Record<string, number>;  // nodeId → impact 0-100
  propagationPaths: string[][];
  recommendation: 'safe' | 'review' | 'dangerous';
  projectedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const projections: BlastRadiusResult[] = [];
const MAX_PROJECTIONS = 300;

// ── Dependency Graph ─────────────────────────────────────────────

const SUBSTRATE_DEPENDENCIES: DependencyEdge[] = [
  // Core dependencies
  { from: 'core', to: 'brain', weight: 0.9, type: 'direct' },
  { from: 'core', to: 'memory', weight: 0.9, type: 'direct' },
  { from: 'core', to: 'nerve', weight: 0.8, type: 'direct' },
  { from: 'core', to: 'system', weight: 0.95, type: 'direct' },
  { from: 'brain', to: 'memory', weight: 0.8, type: 'data' },
  { from: 'brain', to: 'oracle', weight: 0.6, type: 'data' },
  { from: 'brain', to: 'dream', weight: 0.5, type: 'event' },
  { from: 'nerve', to: 'relay', weight: 0.7, type: 'direct' },
  { from: 'nerve', to: 'medic', weight: 0.6, type: 'event' },
  { from: 'cortex', to: 'nerve', weight: 0.7, type: 'direct' },
  { from: 'cortex', to: 'intent', weight: 0.6, type: 'event' },
  { from: 'defense', to: 'immunity', weight: 0.8, type: 'direct' },
  { from: 'defense', to: 'phantom', weight: 0.5, type: 'event' },
  { from: 'evolution', to: 'shadow', weight: 0.9, type: 'direct' },
  { from: 'evolution', to: 'simulate', weight: 0.7, type: 'direct' },
  { from: 'evolution', to: 'governance', weight: 0.8, type: 'event' },
  { from: 'encode', to: 'decode', weight: 0.6, type: 'indirect' },
  { from: 'intent', to: 'cortex', weight: 0.7, type: 'event' },
  { from: 'intent', to: 'decode', weight: 0.5, type: 'event' },
  { from: 'oracle', to: 'simulate', weight: 0.7, type: 'data' },
  { from: 'oracle', to: 'compass', weight: 0.5, type: 'data' },
  { from: 'echo', to: 'simulate', weight: 0.6, type: 'data' },
  { from: 'forge', to: 'evolution', weight: 0.5, type: 'event' },
  { from: 'governance', to: 'audit', weight: 0.7, type: 'event' },
  { from: 'vision', to: 'inclusive', weight: 0.5, type: 'event' },
  { from: 'simulate', to: 'shadow', weight: 0.6, type: 'data' },
  { from: 'nexus', to: 'economy', weight: 0.7, type: 'data' },
  { from: 'system', to: 'medic', weight: 0.8, type: 'direct' },
  { from: 'relay', to: 'integration', weight: 0.6, type: 'direct' },
  { from: 'sandbox', to: 'defense', weight: 0.5, type: 'event' },
  { from: 'harvest', to: 'memory', weight: 0.5, type: 'data' },
  { from: 'lingua', to: 'decode', weight: 0.4, type: 'indirect' },
  { from: 'treaty', to: 'sovereign', weight: 0.5, type: 'data' },
  { from: 'identity', to: 'defense', weight: 0.6, type: 'direct' },
  { from: 'analytics', to: 'vision', weight: 0.5, type: 'data' },
];

// ── BFS Propagation ──────────────────────────────────────────────

function propagate(config: BlastRadiusConfig): AffectedComponent[] {
  const affected: AffectedComponent[] = [];
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; depth: number; path: string[]; cumulativeWeight: number }> = [];

  queue.push({ nodeId: config.changeTarget, depth: 0, path: [config.changeTarget], cumulativeWeight: 1 });
  visited.add(config.changeTarget);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth > 0) {
      const impactScore = Math.round(current.cumulativeWeight * config.changeSeverity * 100 * (1 / current.depth));
      affected.push({
        nodeId: current.nodeId,
        depth: current.depth,
        impactScore: Math.min(100, impactScore),
        riskLevel: impactScore >= 80 ? 'critical' : impactScore >= 60 ? 'high' : impactScore >= 30 ? 'moderate' : impactScore >= 10 ? 'low' : 'none',
        pathFromSource: current.path,
        affectedCapabilities: [],
      });
    }

    if (current.depth >= config.maxDepth) continue;

    // Find outgoing edges
    const outgoing = SUBSTRATE_DEPENDENCIES.filter(e => e.from === current.nodeId);
    const incoming = SUBSTRATE_DEPENDENCIES.filter(e => e.to === current.nodeId);

    for (const edge of [...outgoing, ...incoming]) {
      const neighbor = edge.from === current.nodeId ? edge.to : edge.from;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          nodeId: neighbor,
          depth: current.depth + 1,
          path: [...current.path, neighbor],
          cumulativeWeight: current.cumulativeWeight * edge.weight,
        });
      }
    }
  }

  return affected.sort((a, b) => b.impactScore - a.impactScore);
}

// ── Core API ────────────────────────────────────────────────────

/** Project the blast radius of a proposed change */
export function projectBlastRadius(config: BlastRadiusConfig): BlastRadiusResult {
  const affected = propagate(config);

  const riskHeatMap: Record<string, number> = {};
  for (const comp of affected) {
    riskHeatMap[comp.nodeId] = comp.impactScore;
  }

  const propagationPaths = affected.map(a => a.pathFromSource);
  const maxImpact = affected.length > 0 ? affected[0].impactScore : 0;

  const criticalCount = affected.filter(a => a.riskLevel === 'critical').length;
  const recommendation: BlastRadiusResult['recommendation'] =
    criticalCount > 3 ? 'dangerous' :
    criticalCount > 0 || affected.length > 15 ? 'review' : 'safe';

  const result: BlastRadiusResult = {
    id: crypto.randomUUID(),
    config,
    affectedComponents: affected,
    totalAffected: affected.length,
    maxImpactScore: maxImpact,
    riskHeatMap,
    propagationPaths,
    recommendation,
    projectedAt: new Date().toISOString(),
  };

  projections.push(result);
  if (projections.length > MAX_PROJECTIONS) projections.splice(0, projections.length - MAX_PROJECTIONS);

  return result;
}

export function getDependencyGraph(): DependencyEdge[] { return [...SUBSTRATE_DEPENDENCIES]; }

export function getBlastRadiusHealth() {
  const recent = projections.slice(-30);
  return {
    totalProjections: projections.length,
    dependencyEdges: SUBSTRATE_DEPENDENCIES.length,
    avgAffectedNodes: recent.length > 0
      ? Math.round(recent.reduce((s, r) => s + r.totalAffected, 0) / recent.length * 10) / 10
      : 0,
    dangerousRate: recent.length > 0
      ? Math.round((recent.filter(r => r.recommendation === 'dangerous').length / recent.length) * 100)
      : 0,
  };
}

export function resetBlastRadius(): void {
  projections.length = 0;
}
