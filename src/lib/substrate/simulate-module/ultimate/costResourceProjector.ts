/**
 * SIMULATE Ultimate — System 5: Cost & Resource Projection Engine
 * 
 * Simulates cost impact of changes, forecasts resource consumption,
 * and models budget runway under different growth scenarios.
 * 
 * @module simulate/ultimate/costResourceProjector
 */

// ── Types ────────────────────────────────────────────────────────

export type ResourceType = 'cpu' | 'memory' | 'storage' | 'api_calls' | 'bandwidth' | 'compute_hours';

export interface ResourceProfile {
  type: ResourceType;
  currentUsage: number;
  capacity: number;
  growthRatePerDay: number;   // Units per day
  costPerUnit: number;        // Millicents per unit
}

export interface CostProjection {
  id: string;
  name: string;
  resources: ResourceProfile[];
  projectionDays: number;
  dailyCosts: Array<{ day: number; cost: number; resources: Record<ResourceType, number> }>;
  totalCost: number;
  exhaustionDates: Record<ResourceType, number | null>;  // Day when capacity is reached
  budgetRunwayDays: number | null;
  costTrend: 'stable' | 'linear_growth' | 'exponential_growth' | 'declining';
  projectedAt: string;
}

export interface ChangeImpact {
  id: string;
  changeName: string;
  beforeCostPerDay: number;
  afterCostPerDay: number;
  deltaCostPerDay: number;
  deltaPercent: number;
  resourceDeltas: Record<ResourceType, number>;
  breakEvenDays: number | null;  // If change has upfront cost but saves over time
  recommendation: 'proceed' | 'caution' | 'avoid';
  projectedAt: string;
}

// ── State ────────────────────────────────────────────────────────

const projections: CostProjection[] = [];
const impacts: ChangeImpact[] = [];
const MAX_PROJECTIONS = 200;
const MAX_IMPACTS = 200;

// ── Core API ────────────────────────────────────────────────────

/** Project resource consumption and costs over time */
export function projectCosts(
  name: string,
  resources: ResourceProfile[],
  projectionDays: number = 90,
  budget?: number,           // Total budget in millicents
): CostProjection {
  const dailyCosts: CostProjection['dailyCosts'] = [];
  const exhaustionDates: Record<string, number | null> = {};
  let totalCost = 0;
  let budgetRunwayDays: number | null = null;

  // Initialize exhaustion tracking
  for (const r of resources) {
    exhaustionDates[r.type] = null;
  }

  for (let day = 0; day < projectionDays; day++) {
    let dayCost = 0;
    const dayResources: Record<string, number> = {};

    for (const r of resources) {
      const usage = r.currentUsage + r.growthRatePerDay * day;
      dayResources[r.type] = Math.round(usage * 100) / 100;
      dayCost += usage * r.costPerUnit;

      if (usage >= r.capacity && exhaustionDates[r.type] === null) {
        exhaustionDates[r.type] = day;
      }
    }

    totalCost += dayCost;
    dailyCosts.push({
      day,
      cost: Math.round(dayCost),
      resources: dayResources as Record<ResourceType, number>,
    });

    if (budget && totalCost >= budget && budgetRunwayDays === null) {
      budgetRunwayDays = day;
    }
  }

  // Determine cost trend
  let costTrend: CostProjection['costTrend'] = 'stable';
  if (dailyCosts.length >= 2) {
    const first = dailyCosts[0].cost;
    const last = dailyCosts[dailyCosts.length - 1].cost;
    const ratio = first > 0 ? last / first : 1;
    if (ratio > 2) costTrend = 'exponential_growth';
    else if (ratio > 1.1) costTrend = 'linear_growth';
    else if (ratio < 0.9) costTrend = 'declining';
  }

  const projection: CostProjection = {
    id: crypto.randomUUID(),
    name,
    resources,
    projectionDays,
    dailyCosts,
    totalCost: Math.round(totalCost),
    exhaustionDates: exhaustionDates as Record<ResourceType, number | null>,
    budgetRunwayDays,
    costTrend,
    projectedAt: new Date().toISOString(),
  };

  projections.push(projection);
  if (projections.length > MAX_PROJECTIONS) projections.splice(0, projections.length - MAX_PROJECTIONS);

  return projection;
}

/** Simulate the cost impact of a proposed change */
export function simulateChangeImpact(
  changeName: string,
  currentResources: ResourceProfile[],
  modifiedResources: ResourceProfile[],
  upfrontCost: number = 0,     // One-time cost in millicents
): ChangeImpact {
  const beforeCost = currentResources.reduce((s, r) => s + r.currentUsage * r.costPerUnit, 0);
  const afterCost = modifiedResources.reduce((s, r) => s + r.currentUsage * r.costPerUnit, 0);
  const deltaCost = afterCost - beforeCost;

  const resourceDeltas: Record<string, number> = {};
  for (const r of modifiedResources) {
    const original = currentResources.find(c => c.type === r.type);
    resourceDeltas[r.type] = original ? r.currentUsage - original.currentUsage : r.currentUsage;
  }

  let breakEvenDays: number | null = null;
  if (upfrontCost > 0 && deltaCost < 0) {
    breakEvenDays = Math.ceil(upfrontCost / Math.abs(deltaCost));
  }

  const deltaPercent = beforeCost > 0 ? Math.round((deltaCost / beforeCost) * 10000) / 100 : 0;

  const recommendation: ChangeImpact['recommendation'] =
    deltaPercent > 20 ? 'avoid' :
    deltaPercent > 5 ? 'caution' : 'proceed';

  const impact: ChangeImpact = {
    id: crypto.randomUUID(),
    changeName,
    beforeCostPerDay: Math.round(beforeCost),
    afterCostPerDay: Math.round(afterCost),
    deltaCostPerDay: Math.round(deltaCost),
    deltaPercent,
    resourceDeltas: resourceDeltas as Record<ResourceType, number>,
    breakEvenDays,
    recommendation,
    projectedAt: new Date().toISOString(),
  };

  impacts.push(impact);
  if (impacts.length > MAX_IMPACTS) impacts.splice(0, impacts.length - MAX_IMPACTS);

  return impact;
}

export function getCostProjectorHealth() {
  return {
    totalProjections: projections.length,
    totalImpactAnalyses: impacts.length,
    avgProjectionDays: projections.length > 0
      ? Math.round(projections.reduce((s, p) => s + p.projectionDays, 0) / projections.length)
      : 0,
    proceedRate: impacts.length > 0
      ? Math.round((impacts.filter(i => i.recommendation === 'proceed').length / impacts.length) * 100)
      : 100,
  };
}

export function resetCostProjector(): void {
  projections.length = 0;
  impacts.length = 0;
}
