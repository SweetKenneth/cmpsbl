/**
 * COMPASS Ultimate — Bearing Calculator
 * Given current state + goal state, computes the heading (sequence of actions/nodes)
 * needed to reach the destination. Substrate-wide GPS for intent fulfillment.
 */

export interface SystemState {
  nodeStates: Record<string, number>;  // nodeId → health/activity value
  activeIntents: string[];
  timestamp: number;
}

export interface Bearing {
  id: string;
  from: SystemState;
  to: SystemState;
  heading: BearingStep[];
  confidence: number;
  estimatedDuration: number;
  computedAt: number;
}

export interface BearingStep {
  order: number;
  nodeId: string;
  action: string;
  expectedDuration: number;
  prerequisite?: string;    // previous step's nodeId
  risk: 'low' | 'medium' | 'high';
}

export interface BearingStats {
  totalBearings: number;
  avgSteps: number;
  avgConfidence: number;
  avgDuration: number;
  highRiskSteps: number;
}

const MAX_BEARINGS = 200;
const bearings: Bearing[] = [];

// Known action costs (nodeId → estimated ms)
const actionCosts = new Map<string, number>();

export function setActionCost(nodeId: string, estimatedMs: number): void {
  actionCosts.set(nodeId, estimatedMs);
}

export function computeBearing(current: SystemState, goal: SystemState): Bearing {
  const steps: BearingStep[] = [];
  let totalDuration = 0;

  // Diff the states to determine required transitions
  const requiredChanges: Array<{ nodeId: string; from: number; to: number; delta: number }> = [];

  for (const [nodeId, goalValue] of Object.entries(goal.nodeStates)) {
    const currentValue = current.nodeStates[nodeId] ?? 0;
    const delta = Math.abs(goalValue - currentValue);
    if (delta > 0.01) {
      requiredChanges.push({ nodeId, from: currentValue, to: goalValue, delta });
    }
  }

  // Sort by delta magnitude (biggest changes first for maximum impact)
  requiredChanges.sort((a, b) => b.delta - a.delta);

  // Generate steps
  for (let i = 0; i < requiredChanges.length; i++) {
    const change = requiredChanges[i];
    const cost = actionCosts.get(change.nodeId) ?? 1000;
    const risk: BearingStep['risk'] = change.delta > 0.5 ? 'high' : change.delta > 0.2 ? 'medium' : 'low';

    steps.push({
      order: i + 1,
      nodeId: change.nodeId,
      action: change.to > change.from ? 'activate' : 'deactivate',
      expectedDuration: cost,
      prerequisite: i > 0 ? requiredChanges[i - 1].nodeId : undefined,
      risk,
    });
    totalDuration += cost;
  }

  // Intent alignment steps
  const missingIntents = goal.activeIntents.filter(i => !current.activeIntents.includes(i));
  for (const intent of missingIntents) {
    steps.push({
      order: steps.length + 1,
      nodeId: 'INTENT',
      action: `activate_intent:${intent}`,
      expectedDuration: 500,
      risk: 'low',
    });
    totalDuration += 500;
  }

  const confidence = requiredChanges.length > 0
    ? Math.max(0.3, 1 - requiredChanges.length * 0.05)
    : 1;

  const bearing: Bearing = {
    id: `bearing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from: current, to: goal, heading: steps,
    confidence, estimatedDuration: totalDuration,
    computedAt: Date.now(),
  };

  if (bearings.length >= MAX_BEARINGS) bearings.shift();
  bearings.push(bearing);
  return bearing;
}

export function getBearingStats(): BearingStats {
  const highRisk = bearings.reduce((s, b) =>
    s + b.heading.filter(h => h.risk === 'high').length, 0);

  return {
    totalBearings: bearings.length,
    avgSteps: bearings.length > 0 ? bearings.reduce((s, b) => s + b.heading.length, 0) / bearings.length : 0,
    avgConfidence: bearings.length > 0 ? bearings.reduce((s, b) => s + b.confidence, 0) / bearings.length : 0,
    avgDuration: bearings.length > 0 ? bearings.reduce((s, b) => s + b.estimatedDuration, 0) / bearings.length : 0,
    highRiskSteps: highRisk,
  };
}

export function resetBearingState(): void { bearings.length = 0; actionCosts.clear(); }
