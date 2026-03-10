/**
 * S-Tier 034 — Causal Event Propagation Engine
 * CJPI: 94 | Node: RIPPLE | ID: S-RPL01
 *
 * Models causal chains through the substrate — when Event A triggers B,
 * which triggers C, the propagation engine tracks the full chain,
 * detects loops, and limits blast radius via configurable depth caps.
 */

export interface CausalEvent {
  id: string;
  source: string;     // originating module
  type: string;
  parentId: string | null;
  depth: number;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface PropagationRule {
  trigger: string;       // event type that causes propagation
  target: string;        // resulting event type
  targetModule: string;
  condition?: (event: CausalEvent) => boolean;
}

export interface CausalChain {
  root: CausalEvent;
  events: CausalEvent[];
  maxDepth: number;
  loopDetected: boolean;
}

const MAX_DEPTH = 12;
const rules: PropagationRule[] = [];
const chains = new Map<string, CausalChain>();

let idSeq = 0;
const nextId = () => `ce-${++idSeq}-${Date.now().toString(36)}`;

export function addRule(rule: PropagationRule): void {
  rules.push(rule);
}

export function clearRules(): void {
  rules.length = 0;
}

export function propagate(
  source: string,
  type: string,
  data?: Record<string, unknown>,
  parentId: string | null = null,
  depth = 0
): CausalChain {
  const event: CausalEvent = { id: nextId(), source, type, parentId, depth, timestamp: Date.now(), data };

  // Find or create chain
  const rootId = parentId
    ? ([...chains.values()].find(c => c.events.some(e => e.id === parentId))?.root.id ?? event.id)
    : event.id;

  if (!chains.has(rootId)) {
    chains.set(rootId, { root: event, events: [], maxDepth: 0, loopDetected: false });
  }
  const chain = chains.get(rootId)!;
  chain.events.push(event);
  chain.maxDepth = Math.max(chain.maxDepth, depth);

  // Loop detection
  const typeHistory = chain.events.filter(e => e.type === type);
  if (typeHistory.length > 3) {
    chain.loopDetected = true;
    return chain;
  }

  // Depth cap
  if (depth >= MAX_DEPTH) return chain;

  // Fire matching rules
  for (const rule of rules) {
    if (rule.trigger === type && (!rule.condition || rule.condition(event))) {
      propagate(rule.targetModule, rule.target, data, event.id, depth + 1);
    }
  }

  return chain;
}

export function getChain(rootId: string): CausalChain | null {
  return chains.get(rootId) ?? null;
}

export function getAllChains(): CausalChain[] {
  return [...chains.values()];
}

export function getStats() {
  const allChains = [...chains.values()];
  return {
    totalChains: allChains.length,
    totalEvents: allChains.reduce((s, c) => s + c.events.length, 0),
    loopCount: allChains.filter(c => c.loopDetected).length,
    avgDepth: allChains.length ? allChains.reduce((s, c) => s + c.maxDepth, 0) / allChains.length : 0,
  };
}
