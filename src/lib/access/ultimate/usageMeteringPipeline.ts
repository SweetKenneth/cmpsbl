/**
 * ACCESS Ultimate — System 4: Usage Metering Pipeline
 * 
 * Per-call cost computation in millicents, real-time aggregation,
 * overage detection, and cost attribution per product code.
 * 
 * @module access/ultimate/usageMeteringPipeline
 */

// ── Types ────────────────────────────────────────────────────────

export interface MeterEvent {
  id: string;
  keyId: string;
  developerId: string;
  module: string;
  action: string;
  tokensUsed: number;
  computeMs: number;
  productCode: string;
  costMillicents: number;
  timestamp: number;
}

export interface CostRule {
  productCode: string;
  baseCostMillicents: number;
  perTokenMillicents: number;
  complexityMultiplier: number;
}

export interface AggregatedBucket {
  keyId: string;
  period: string;              // YYYY-MM-DD-HH or YYYY-MM-DD
  totalCalls: number;
  totalTokens: number;
  totalCostMillicents: number;
  byModule: Record<string, number>;
  byProduct: Record<string, number>;
}

export type OverageAction = 'warn' | 'throttle' | 'block';

export interface OverageAlert {
  id: string;
  keyId: string;
  developerId: string;
  percentUsed: number;
  action: OverageAction;
  quotaLimit: number;
  currentUsage: number;
  timestamp: number;
}

export interface MeteringStats {
  totalEvents: number;
  totalCostMillicents: number;
  totalTokensMetered: number;
  totalOverageAlerts: number;
  uniqueProducts: number;
  avgCostPerCall: number;
  costRulesActive: number;
}

// ── State ────────────────────────────────────────────────────────

const events: MeterEvent[] = [];
const costRules: Map<string, CostRule> = new Map();
const buckets: Map<string, AggregatedBucket> = new Map();
const overageAlerts: OverageAlert[] = [];
const quotaLimits: Map<string, number> = new Map(); // keyId → monthly limit in millicents
const MAX_EVENTS = 5000;
const MAX_ALERTS = 500;

// ── Default Cost Rules ──────────────────────────────────────────

function initDefaultRules(): void {
  if (costRules.size > 0) return;
  const defaults: CostRule[] = [
    { productCode: 'brain.query', baseCostMillicents: 10, perTokenMillicents: 0.5, complexityMultiplier: 1.0 },
    { productCode: 'brain.reasoning', baseCostMillicents: 50, perTokenMillicents: 1.0, complexityMultiplier: 1.5 },
    { productCode: 'decode.chat', baseCostMillicents: 5, perTokenMillicents: 0.3, complexityMultiplier: 1.0 },
    { productCode: 'memory.store', baseCostMillicents: 3, perTokenMillicents: 0.1, complexityMultiplier: 1.0 },
    { productCode: 'memory.search', baseCostMillicents: 8, perTokenMillicents: 0.2, complexityMultiplier: 1.2 },
    { productCode: 'encode.mutation', baseCostMillicents: 100, perTokenMillicents: 2.0, complexityMultiplier: 2.0 },
    { productCode: 'evolution.apply', baseCostMillicents: 200, perTokenMillicents: 3.0, complexityMultiplier: 2.5 },
    { productCode: 'default', baseCostMillicents: 5, perTokenMillicents: 0.2, complexityMultiplier: 1.0 },
  ];
  for (const rule of defaults) costRules.set(rule.productCode, rule);
}

// ── Core API ────────────────────────────────────────────────────

/** Compute cost for a single API call */
export function computeCost(productCode: string, tokensUsed: number, complexityOverride?: number): number {
  initDefaultRules();
  const rule = costRules.get(productCode) ?? costRules.get('default')!;
  const multiplier = complexityOverride ?? rule.complexityMultiplier;
  return Math.round(rule.baseCostMillicents * multiplier + tokensUsed * rule.perTokenMillicents);
}

/** Record a metered event */
export function meterEvent(
  keyId: string, developerId: string, module: string, action: string,
  tokensUsed: number, computeMs: number, productCode: string,
): MeterEvent {
  const costMillicents = computeCost(productCode, tokensUsed);

  const event: MeterEvent = {
    id: `me-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    keyId, developerId, module, action,
    tokensUsed, computeMs, productCode, costMillicents,
    timestamp: Date.now(),
  };

  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  // Aggregate into buckets
  aggregateEvent(event);

  // Check overage
  checkOverage(keyId, developerId);

  return event;
}

/** Aggregate event into hourly and daily buckets */
function aggregateEvent(event: MeterEvent): void {
  const date = new Date(event.timestamp);
  const hourKey = `${event.keyId}:${date.toISOString().slice(0, 13)}`;
  const dayKey = `${event.keyId}:${date.toISOString().slice(0, 10)}`;

  for (const key of [hourKey, dayKey]) {
    if (!buckets.has(key)) {
      buckets.set(key, {
        keyId: event.keyId,
        period: key.split(':').slice(1).join(':'),
        totalCalls: 0, totalTokens: 0, totalCostMillicents: 0,
        byModule: {}, byProduct: {},
      });
    }
    const bucket = buckets.get(key)!;
    bucket.totalCalls++;
    bucket.totalTokens += event.tokensUsed;
    bucket.totalCostMillicents += event.costMillicents;
    bucket.byModule[event.module] = (bucket.byModule[event.module] || 0) + event.costMillicents;
    bucket.byProduct[event.productCode] = (bucket.byProduct[event.productCode] || 0) + event.costMillicents;
  }
}

/** Check if developer is over quota */
function checkOverage(keyId: string, developerId: string): void {
  const limit = quotaLimits.get(keyId);
  if (!limit) return;

  const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  let monthTotal = 0;
  for (const [key, bucket] of buckets) {
    if (key.startsWith(`${keyId}:${monthKey}`)) {
      monthTotal += bucket.totalCostMillicents;
    }
  }

  const percentUsed = (monthTotal / limit) * 100;
  let action: OverageAction | null = null;

  if (percentUsed >= 100) action = 'block';
  else if (percentUsed >= 90) action = 'throttle';
  else if (percentUsed >= 75) action = 'warn';

  if (action) {
    overageAlerts.push({
      id: `oa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      keyId, developerId, percentUsed: Math.round(percentUsed),
      action, quotaLimit: limit, currentUsage: monthTotal,
      timestamp: Date.now(),
    });
    if (overageAlerts.length > MAX_ALERTS) overageAlerts.splice(0, overageAlerts.length - MAX_ALERTS);
  }
}

/** Set monthly cost quota for a key */
export function setQuotaLimit(keyId: string, limitMillicents: number): void {
  quotaLimits.set(keyId, limitMillicents);
}

/** Add or update a cost rule */
export function setCostRule(rule: CostRule): void {
  costRules.set(rule.productCode, rule);
}

// ── Query ────────────────────────────────────────────────────────

export function getMeterEvents(keyId?: string, count?: number): MeterEvent[] {
  let filtered = keyId ? events.filter(e => e.keyId === keyId) : events;
  if (count) filtered = filtered.slice(-count);
  return filtered;
}

export function getBuckets(keyId?: string): AggregatedBucket[] {
  const all = [...buckets.values()];
  return keyId ? all.filter(b => b.keyId === keyId) : all;
}

export function getOverageAlerts(keyId?: string): OverageAlert[] {
  return keyId ? overageAlerts.filter(a => a.keyId === keyId) : [...overageAlerts];
}

export function getMeteringStats(): MeteringStats {
  const products = new Set(events.map(e => e.productCode));
  const totalCost = events.reduce((s, e) => s + e.costMillicents, 0);
  return {
    totalEvents: events.length,
    totalCostMillicents: totalCost,
    totalTokensMetered: events.reduce((s, e) => s + e.tokensUsed, 0),
    totalOverageAlerts: overageAlerts.length,
    uniqueProducts: products.size,
    avgCostPerCall: events.length > 0 ? Math.round(totalCost / events.length) : 0,
    costRulesActive: costRules.size,
  };
}

export function resetMeteringPipeline(): void {
  events.length = 0;
  costRules.clear();
  buckets.clear();
  overageAlerts.length = 0;
  quotaLimits.clear();
}
