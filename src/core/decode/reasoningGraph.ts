/**
 * DECODE Multi-Turn Reasoning Graph — v1.0.0
 * Tracks causal chains across conversation turns so DECODE can
 * reference prior reasoning, detect contradictions, and build
 * coherent narratives.
 * 
 * Structure: DAG of ReasoningNodes linked by causal edges.
 * Each node represents a claim, observation, or decision.
 */

// ═══ Types ════════════════════════════════════════════════════════

export interface ReasoningNode {
  id: string;
  sessionId: string;
  turnIndex: number;
  type: 'claim' | 'observation' | 'decision' | 'question' | 'inference';
  content: string;
  confidence: number;
  sources: string[]; // parent node IDs
  timestamp: string;
  invalidated?: boolean;
  invalidationReason?: string;
}

export interface CausalEdge {
  from: string;
  to: string;
  relation: 'supports' | 'contradicts' | 'refines' | 'follows' | 'questions';
  weight: number;
}

export interface ContradictionReport {
  nodeA: string;
  nodeB: string;
  contentA: string;
  contentB: string;
  severity: 'low' | 'medium' | 'high';
  detected: string;
}

export interface ReasoningGraphState {
  nodes: Map<string, ReasoningNode>;
  edges: CausalEdge[];
  contradictions: ContradictionReport[];
  sessionId: string;
}

// ═══ Constants ════════════════════════════════════════════════════

const MAX_NODES = 200;
const CONTRADICTION_KEYWORDS: Array<[RegExp, RegExp]> = [
  [/\b(always|every|all)\b/i, /\b(never|none|no)\b/i],
  [/\b(increase|up|higher|more)\b/i, /\b(decrease|down|lower|less|fewer)\b/i],
  [/\b(enabled?|active|on)\b/i, /\b(disabled?|inactive|off)\b/i],
  [/\b(safe|secure|clean)\b/i, /\b(unsafe|insecure|compromised|threat)\b/i],
  [/\b(success|working|operational)\b/i, /\b(fail|broken|down|error)\b/i],
];

// ═══ Graph Store ══════════════════════════════════════════════════

const graphs = new Map<string, ReasoningGraphState>();

let nodeCounter = 0;
function nextNodeId(): string {
  return `rn_${++nodeCounter}`;
}

function getGraph(sessionId: string): ReasoningGraphState {
  let graph = graphs.get(sessionId);
  if (!graph) {
    graph = {
      nodes: new Map(),
      edges: [],
      contradictions: [],
      sessionId,
    };
    graphs.set(sessionId, graph);
  }
  return graph;
}

// ═══ Contradiction Detection ══════════════════════════════════════

function detectContradiction(a: string, b: string): boolean {
  for (const [patA, patB] of CONTRADICTION_KEYWORDS) {
    if ((patA.test(a) && patB.test(b)) || (patB.test(a) && patA.test(b))) {
      // Check if they share enough topical overlap
      const tokensA = new Set(a.toLowerCase().split(/\s+/).filter(t => t.length > 3));
      const tokensB = new Set(b.toLowerCase().split(/\s+/).filter(t => t.length > 3));
      const overlap = [...tokensA].filter(t => tokensB.has(t)).length;
      if (overlap >= 2) return true;
    }
  }
  return false;
}

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Add a reasoning node to the graph
 */
export function addReasoningNode(
  sessionId: string,
  type: ReasoningNode['type'],
  content: string,
  sources: string[] = [],
  confidence: number = 0.8,
): ReasoningNode {
  const graph = getGraph(sessionId);
  const id = nextNodeId();

  const node: ReasoningNode = {
    id,
    sessionId,
    turnIndex: graph.nodes.size,
    type,
    content,
    confidence,
    sources,
    timestamp: new Date().toISOString(),
  };

  // Check for contradictions against existing claims
  if (type === 'claim' || type === 'observation') {
    for (const existing of graph.nodes.values()) {
      if (existing.invalidated) continue;
      if (existing.type !== 'claim' && existing.type !== 'observation') continue;

      if (detectContradiction(content, existing.content)) {
        const report: ContradictionReport = {
          nodeA: existing.id,
          nodeB: id,
          contentA: existing.content,
          contentB: content,
          severity: confidence > 0.7 && existing.confidence > 0.7 ? 'high' : 'medium',
          detected: new Date().toISOString(),
        };
        graph.contradictions.push(report);

        // Add contradicts edge
        graph.edges.push({
          from: id,
          to: existing.id,
          relation: 'contradicts',
          weight: 0.9,
        });
      }
    }
  }

  // Add causal edges from sources
  for (const sourceId of sources) {
    if (graph.nodes.has(sourceId)) {
      graph.edges.push({
        from: sourceId,
        to: id,
        relation: type === 'question' ? 'questions' : 'supports',
        weight: confidence,
      });
    }
  }

  // Enforce size limit
  if (graph.nodes.size >= MAX_NODES) {
    const oldest = [...graph.nodes.values()]
      .sort((a, b) => a.turnIndex - b.turnIndex)[0];
    if (oldest) {
      graph.nodes.delete(oldest.id);
    }
  }

  graph.nodes.set(id, node);
  return node;
}

/**
 * Invalidate a reasoning node (e.g., when new info contradicts it)
 */
export function invalidateNode(
  sessionId: string,
  nodeId: string,
  reason: string,
): boolean {
  const graph = getGraph(sessionId);
  const node = graph.nodes.get(nodeId);
  if (!node) return false;

  node.invalidated = true;
  node.invalidationReason = reason;
  return true;
}

/**
 * Get the causal chain leading to a specific node
 */
export function getCausalChain(
  sessionId: string,
  nodeId: string,
  maxDepth: number = 10,
): ReasoningNode[] {
  const graph = getGraph(sessionId);
  const chain: ReasoningNode[] = [];
  const visited = new Set<string>();

  function walk(id: string, depth: number): void {
    if (depth > maxDepth || visited.has(id)) return;
    visited.add(id);

    const node = graph.nodes.get(id);
    if (!node) return;

    chain.push(node);

    for (const source of node.sources) {
      walk(source, depth + 1);
    }
  }

  walk(nodeId, 0);
  return chain.reverse();
}

/**
 * Get all contradictions in the session
 */
export function getContradictions(sessionId: string): ContradictionReport[] {
  return getGraph(sessionId).contradictions;
}

/**
 * Get reasoning graph summary for context injection
 */
export function getReasoningSummary(sessionId: string): {
  totalNodes: number;
  claims: number;
  observations: number;
  decisions: number;
  contradictions: number;
  invalidated: number;
  activeChains: number;
} {
  const graph = getGraph(sessionId);
  const nodes = [...graph.nodes.values()];

  // Count root nodes (no incoming edges)
  const hasIncoming = new Set(graph.edges.map(e => e.to));
  const roots = nodes.filter(n => !hasIncoming.has(n.id)).length;

  return {
    totalNodes: nodes.length,
    claims: nodes.filter(n => n.type === 'claim').length,
    observations: nodes.filter(n => n.type === 'observation').length,
    decisions: nodes.filter(n => n.type === 'decision').length,
    contradictions: graph.contradictions.length,
    invalidated: nodes.filter(n => n.invalidated).length,
    activeChains: roots,
  };
}

/**
 * Clear reasoning graph for a session
 */
export function clearReasoningGraph(sessionId: string): void {
  graphs.delete(sessionId);
}
