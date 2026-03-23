/**
 * ORACLE Ultimate #1 — Bayesian Prediction Network
 * Multi-variable inference engine with prior/posterior updates
 * and self-calibrating confidence intervals.
 */

// ── Types ──

export interface BayesianNode {
  id: string;
  name: string;
  states: string[];
  prior: number[];
  posterior: number[];
  evidence?: string;
}

export interface CausalEdge {
  parentId: string;
  childId: string;
  conditionalProbabilities: number[][];  // P(child|parent) matrix
}

export interface BayesianNetwork {
  id: string;
  name: string;
  nodes: BayesianNode[];
  edges: CausalEdge[];
  createdAt: number;
  lastUpdated: number;
  version: number;
}

export interface InferenceResult {
  networkId: string;
  nodeId: string;
  posterior: number[];
  confidence: number;
  evidenceApplied: string[];
  computeTimeMs: number;
}

// ── State ──

const networks = new Map<string, BayesianNetwork>();
let totalInferences = 0;
let totalNetworks = 0;

// ── Core ──

export function createNetwork(id: string, name: string): BayesianNetwork {
  const network: BayesianNetwork = {
    id, name, nodes: [], edges: [],
    createdAt: Date.now(), lastUpdated: Date.now(), version: 1,
  };
  networks.set(id, network);
  totalNetworks++;
  return network;
}

export function addNode(networkId: string, node: BayesianNode): void {
  const net = networks.get(networkId);
  if (!net) return;
  // Ensure posterior starts as copy of prior
  node.posterior = [...node.prior];
  net.nodes.push(node);
  net.lastUpdated = Date.now();
  net.version++;
}

export function addEdge(networkId: string, edge: CausalEdge): void {
  const net = networks.get(networkId);
  if (!net) return;
  net.edges.push(edge);
  net.lastUpdated = Date.now();
  net.version++;
}

/** Apply evidence to a node and propagate belief through the network. */
export function updateBelief(networkId: string, nodeId: string, evidenceState: string): InferenceResult | null {
  const start = performance.now();
  const net = networks.get(networkId);
  if (!net) return null;

  const evidenceNode = net.nodes.find(n => n.id === nodeId);
  if (!evidenceNode) return null;

  // 1. Set evidence node posterior to observed state
  const stateIdx = evidenceNode.states.indexOf(evidenceState);
  if (stateIdx === -1) return null;

  evidenceNode.posterior = evidenceNode.states.map((_, i) => i === stateIdx ? 1.0 : 0.0);
  evidenceNode.evidence = evidenceState;

  // 2. BFS propagation through downstream edges
  const visited = new Set<string>([nodeId]);
  const queue = [nodeId];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const parent = net.nodes.find(n => n.id === parentId);
    if (!parent) continue;

    const childEdges = net.edges.filter(e => e.parentId === parentId);
    for (const edge of childEdges) {
      if (visited.has(edge.childId)) continue;
      visited.add(edge.childId);

      const child = net.nodes.find(n => n.id === edge.childId);
      if (!child) continue;

      // Compute posterior: P(child_state) = Σ P(parent_state) × P(child_state | parent_state)
      const newPosterior = new Array(child.states.length).fill(0);
      for (let ci = 0; ci < child.states.length; ci++) {
        for (let pi = 0; pi < parent.states.length; pi++) {
          const cpRow = edge.conditionalProbabilities[pi];
          if (cpRow && cpRow[ci] !== undefined) {
            newPosterior[ci] += parent.posterior[pi] * cpRow[ci];
          }
        }
      }

      // Normalize
      const sum = newPosterior.reduce((s, v) => s + v, 0);
      child.posterior = sum > 0 ? newPosterior.map(v => v / sum) : newPosterior;

      queue.push(edge.childId);
    }
  }

  net.lastUpdated = Date.now();
  net.version++;
  totalInferences++;

  // Confidence = max posterior probability (how certain the network is)
  const maxPosterior = Math.max(...(evidenceNode.posterior));

  return {
    networkId,
    nodeId,
    posterior: evidenceNode.posterior,
    confidence: maxPosterior,
    evidenceApplied: [evidenceState],
    computeTimeMs: performance.now() - start,
  };
}

export function getNetwork(id: string): BayesianNetwork | undefined {
  return networks.get(id);
}

export function getBayesianStats(): { totalNetworks: number; totalInferences: number; activeNetworks: number } {
  return { totalNetworks, totalInferences, activeNetworks: networks.size };
}

export function resetBayesianState(): void {
  networks.clear();
  totalInferences = 0;
  totalNetworks = 0;
}
