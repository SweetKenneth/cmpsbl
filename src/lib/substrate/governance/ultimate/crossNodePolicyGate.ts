/**
 * GOVERNANCE Ultimate — System 9: Cross-Node Policy Enforcement
 * 
 * Pre-execution policy gates for all 40 nodes, per-node overrides,
 * integration with EVOLUTION SEBA pipeline and ENCODE governance.
 * 
 * @module governance/ultimate/crossNodePolicyGate
 */

// ── Types ────────────────────────────────────────────────────────

export type GateDecision = 'allow' | 'deny' | 'defer' | 'require_approval';

export interface PolicyGate {
  id: string;
  nodeId: string;
  action: string;
  conditions: GateCondition[];
  decision: GateDecision;
  overrideDecision: GateDecision | null;   // Per-node override
  enabled: boolean;
  priority: number;
}

export interface GateCondition {
  field: string;
  operator: '==' | '!=' | '>' | '<' | 'in' | 'not_in';
  value: string | number | string[];
}

export interface GateEvalContext {
  nodeId: string;
  action: string;
  actor: string;
  data?: Record<string, unknown>;
}

export interface GateEvalResult {
  nodeId: string;
  action: string;
  finalDecision: GateDecision;
  matchedGates: Array<{ gateId: string; decision: GateDecision }>;
  overrideApplied: boolean;
  evaluatedAt: number;
}

export interface CrossNodeGateStats {
  totalGates: number;
  enabledGates: number;
  nodesWithGates: number;
  totalEvaluations: number;
  denyRate: number;
  deferRate: number;
  overrideCount: number;
}

// ── State ────────────────────────────────────────────────────────

const gates: Map<string, PolicyGate> = new Map();
const nodeOverrides: Map<string, GateDecision> = new Map();  // nodeId → override
const MAX_GATES = 500;
let totalEvaluations = 0;
let denyCount = 0;
let deferCount = 0;
let overrideCount = 0;

function genId(): string { return `gate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

// ── Core API ────────────────────────────────────────────────────

/** Register a policy gate for a node */
export function registerGate(
  nodeId: string, action: string,
  conditions: GateCondition[],
  decision: GateDecision = 'deny',
  priority: number = 100,
): PolicyGate {
  const gate: PolicyGate = {
    id: genId(), nodeId, action, conditions,
    decision, overrideDecision: null,
    enabled: true, priority,
  };
  gates.set(gate.id, gate);
  if (gates.size > MAX_GATES) evictDisabled();
  return gate;
}

/** Set a per-node override (forces decision for all gates on that node) */
export function setNodeOverride(nodeId: string, decision: GateDecision): void {
  nodeOverrides.set(nodeId, decision);
}

/** Remove a per-node override */
export function clearNodeOverride(nodeId: string): boolean {
  return nodeOverrides.delete(nodeId);
}

/** Evaluate policy gates for a node action */
export function evaluateGate(context: GateEvalContext): GateEvalResult {
  totalEvaluations++;

  // Check for node-level override
  const nodeOverride = nodeOverrides.get(context.nodeId);
  if (nodeOverride) {
    overrideCount++;
    return {
      nodeId: context.nodeId, action: context.action,
      finalDecision: nodeOverride, matchedGates: [],
      overrideApplied: true, evaluatedAt: Date.now(),
    };
  }

  // Find matching gates
  const nodeGates = [...gates.values()]
    .filter(g => g.enabled && g.nodeId === context.nodeId && g.action === context.action)
    .sort((a, b) => b.priority - a.priority);

  const matchedGates: Array<{ gateId: string; decision: GateDecision }> = [];

  for (const gate of nodeGates) {
    const conditionsMet = gate.conditions.every(c => evaluateCondition(c, context));
    if (conditionsMet) {
      matchedGates.push({ gateId: gate.id, decision: gate.overrideDecision ?? gate.decision });
    }
  }

  // Determine final decision (most restrictive wins)
  let finalDecision: GateDecision = 'allow';
  for (const match of matchedGates) {
    if (match.decision === 'deny') { finalDecision = 'deny' as GateDecision; break; }
    if (match.decision === 'require_approval' && finalDecision === 'allow') finalDecision = 'require_approval';
    if (match.decision === 'defer' && finalDecision === 'allow') finalDecision = 'defer';
  }

  if (finalDecision === 'deny') denyCount++;
  else if (finalDecision === 'defer') deferCount++;

  return {
    nodeId: context.nodeId, action: context.action,
    finalDecision, matchedGates,
    overrideApplied: false, evaluatedAt: Date.now(),
  };
}

/** Evaluate a single condition */
function evaluateCondition(condition: GateCondition, ctx: GateEvalContext): boolean {
  const value = ctx.data?.[condition.field] ?? (ctx as unknown as Record<string, unknown>)[condition.field];

  switch (condition.operator) {
    case '==': return value === condition.value;
    case '!=': return value !== condition.value;
    case '>': return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value;
    case '<': return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value;
    case 'in': return Array.isArray(condition.value) && condition.value.includes(String(value));
    case 'not_in': return Array.isArray(condition.value) && !condition.value.includes(String(value));
    default: return false;
  }
}

/** Toggle a gate */
export function toggleGate(gateId: string, enabled: boolean): boolean {
  const gate = gates.get(gateId);
  if (!gate) return false;
  gate.enabled = enabled;
  return true;
}

/** Set per-gate override decision */
export function setGateOverride(gateId: string, decision: GateDecision | null): boolean {
  const gate = gates.get(gateId);
  if (!gate) return false;
  gate.overrideDecision = decision;
  return true;
}

function evictDisabled(): void {
  for (const [id, g] of gates) { if (!g.enabled) { gates.delete(id); return; } }
}

// ── Query ────────────────────────────────────────────────────────

export function getGate(id: string): PolicyGate | undefined { return gates.get(id); }
export function getGatesByNode(nodeId: string): PolicyGate[] {
  return [...gates.values()].filter(g => g.nodeId === nodeId);
}
export function getNodeOverrides(): Map<string, GateDecision> { return new Map(nodeOverrides); }

export function getCrossNodeGateStats(): CrossNodeGateStats {
  const all = [...gates.values()];
  const nodes = new Set(all.map(g => g.nodeId));
  const total = totalEvaluations || 1;

  return {
    totalGates: all.length,
    enabledGates: all.filter(g => g.enabled).length,
    nodesWithGates: nodes.size,
    totalEvaluations,
    denyRate: Math.round((denyCount / total) * 1000) / 1000,
    deferRate: Math.round((deferCount / total) * 1000) / 1000,
    overrideCount,
  };
}

export function resetCrossNodeGates(): void {
  gates.clear();
  nodeOverrides.clear();
  totalEvaluations = 0; denyCount = 0; deferCount = 0; overrideCount = 0;
}
