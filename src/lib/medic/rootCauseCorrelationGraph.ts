/**
 * MEDIC — Root Cause Correlation Graph
 * Builds a causal DAG from symptom signals across the 40-node mesh.
 * Uses temporal correlation and dependency-chain analysis.
 * @module medic/rootCauseCorrelationGraph
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface SymptomSignal {
  id: string;
  nodeId: string;
  symptom: string;
  timestamp: number;
  severity: number;       // 0–100
  dependencies: string[]; // upstream nodeIds this node depends on
}

export interface CausalEdge {
  from: string; // symptom id
  to: string;   // symptom id
  correlation: number; // 0–1
  temporal: boolean;   // within time window
  structural: boolean; // dependency chain link
}

export interface RootCauseResult {
  rootCauseNodeId: string;
  rootCauseSymptom: string;
  confidence: number;        // 0–1
  causalChain: string[];     // nodeId path from root to leaves
  affectedNodes: string[];
  edges: CausalEdge[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const TEMPORAL_WINDOW_MS = 30_000; // 30 seconds
const MIN_CORRELATION = 0.3;

// ── Core ───────────────────────────────────────────────────────────────────

function computeTemporalCorrelation(a: SymptomSignal, b: SymptomSignal): number {
  const timeDiff = Math.abs(a.timestamp - b.timestamp);
  if (timeDiff > TEMPORAL_WINDOW_MS) return 0;
  return 1 - timeDiff / TEMPORAL_WINDOW_MS;
}

function computeStructuralLink(a: SymptomSignal, b: SymptomSignal): boolean {
  return b.dependencies.includes(a.nodeId);
}

export function buildCorrelationGraph(signals: SymptomSignal[]): CausalEdge[] {
  const edges: CausalEdge[] = [];

  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      const a = signals[i];
      const b = signals[j];

      const temporal = computeTemporalCorrelation(a, b);
      const structuralAB = computeStructuralLink(a, b);
      const structuralBA = computeStructuralLink(b, a);

      const correlation = temporal * 0.5 + (structuralAB || structuralBA ? 0.5 : 0);

      if (correlation >= MIN_CORRELATION) {
        // Direction: upstream node is the "from"
        const [from, to] = structuralAB ? [a, b] :
                           structuralBA ? [b, a] :
                           a.timestamp <= b.timestamp ? [a, b] : [b, a];
        edges.push({
          from: from.id,
          to: to.id,
          correlation: Math.round(correlation * 100) / 100,
          temporal: temporal > 0,
          structural: structuralAB || structuralBA,
        });
      }
    }
  }

  return edges;
}

export function identifyRootCause(signals: SymptomSignal[]): RootCauseResult | null {
  if (signals.length === 0) return null;

  const edges = buildCorrelationGraph(signals);
  const signalMap = new Map(signals.map(s => [s.id, s]));

  // Count in-degree: root cause = node with 0 or minimal in-edges, max out-edges
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  for (const s of signals) {
    inDegree.set(s.id, 0);
    outDegree.set(s.id, 0);
  }

  for (const edge of edges) {
    outDegree.set(edge.from, (outDegree.get(edge.from) ?? 0) + 1);
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  // Score: high out-degree + low in-degree + early timestamp + high severity
  let bestId: string | null = null;
  let bestScore = -Infinity;

  for (const s of signals) {
    const out = outDegree.get(s.id) ?? 0;
    const inp = inDegree.get(s.id) ?? 0;
    const timeRank = 1 - (signals.indexOf(s) / signals.length);
    const score = out * 3 - inp * 2 + timeRank + (s.severity / 100);

    if (score > bestScore) {
      bestScore = score;
      bestId = s.id;
    }
  }

  if (!bestId) return null;

  const rootSignal = signalMap.get(bestId)!;

  // BFS from root to find causal chain
  const visited = new Set<string>([bestId]);
  const queue = [bestId];
  const chain: string[] = [rootSignal.nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.from === current && !visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push(edge.to);
        const node = signalMap.get(edge.to);
        if (node) chain.push(node.nodeId);
      }
    }
  }

  const affectedNodes = [...new Set(chain.slice(1))];
  const confidence = Math.min(1, (edges.length / Math.max(1, signals.length)) * 0.7 + 0.3);

  return {
    rootCauseNodeId: rootSignal.nodeId,
    rootCauseSymptom: rootSignal.symptom,
    confidence: Math.round(confidence * 100) / 100,
    causalChain: [...new Set(chain)],
    affectedNodes,
    edges,
  };
}
