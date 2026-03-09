/**
 * ECONOMY ROI & Chargeback Engine — v1.0.0
 * Return-on-investment tracking and multi-tenant cost allocation
 * 
 * Provides:
 * - ROI calculation per module, capability, and pipeline
 * - Chargeback allocation for multi-tenant scenarios
 * - Value attribution (mapping costs to business outcomes)
 * - Cost efficiency scoring
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ROIRecord {
  id: string;
  module: string;
  capability?: string;
  costMillicents: number;
  valueMillicents: number;
  roi: number; // (value - cost) / cost
  period: string;
  timestamp: string;
}

export interface ChargebackAllocation {
  tenantId: string;
  module: string;
  costMillicents: number;
  allocationMethod: 'usage' | 'fixed' | 'proportional';
  usageWeight: number;
  period: string;
}

export interface ValueAttribution {
  module: string;
  capability: string;
  directValue: number; // Revenue/savings directly attributable
  indirectValue: number; // Inferred value (quality improvement, time saved)
  totalValue: number;
  confidence: number; // 0-100
}

export interface EfficiencyScore {
  module: string;
  costPerToken: number;
  costPerOperation: number;
  valuePerCost: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

export interface ChargebackSummary {
  tenantId: string;
  period: string;
  totalCost: number;
  moduleBreakdown: Array<{ module: string; cost: number; pct: number }>;
  invoiceReady: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const roiRecords: ROIRecord[] = [];
const MAX_ROI_RECORDS = 1000;

const chargebackAllocations: ChargebackAllocation[] = [];
const MAX_CHARGEBACKS = 2000;

const valueAttributions = new Map<string, ValueAttribution>();
const efficiencyHistory = new Map<string, EfficiencyScore[]>();

// ═══════════════════════════════════════════════════════════════════════════════
// ROI TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record an ROI observation
 */
export function recordROI(
  module: string,
  costMillicents: number,
  valueMillicents: number,
  capability?: string
): ROIRecord {
  const roi = costMillicents > 0
    ? Math.round(((valueMillicents - costMillicents) / costMillicents) * 100) / 100
    : 0;

  const record: ROIRecord = {
    id: `roi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    module,
    capability,
    costMillicents,
    valueMillicents,
    roi,
    period: new Date().toISOString().slice(0, 10),
    timestamp: new Date().toISOString(),
  };

  roiRecords.push(record);
  if (roiRecords.length > MAX_ROI_RECORDS) {
    roiRecords.splice(0, roiRecords.length - MAX_ROI_RECORDS);
  }

  return record;
}

/**
 * Get ROI summary for a module
 */
export function getModuleROI(module: string): {
  avgROI: number;
  totalCost: number;
  totalValue: number;
  recordCount: number;
  trend: 'improving' | 'stable' | 'declining';
} {
  const records = roiRecords.filter(r => r.module === module);
  if (records.length === 0) {
    return { avgROI: 0, totalCost: 0, totalValue: 0, recordCount: 0, trend: 'stable' };
  }

  const totalCost = records.reduce((s, r) => s + r.costMillicents, 0);
  const totalValue = records.reduce((s, r) => s + r.valueMillicents, 0);
  const avgROI = totalCost > 0
    ? Math.round(((totalValue - totalCost) / totalCost) * 100) / 100
    : 0;

  // Trend: compare first half vs second half
  const mid = Math.floor(records.length / 2);
  const firstHalfROI = records.slice(0, mid).reduce((s, r) => s + r.roi, 0) / (mid || 1);
  const secondHalfROI = records.slice(mid).reduce((s, r) => s + r.roi, 0) / ((records.length - mid) || 1);

  const trend: 'improving' | 'stable' | 'declining' =
    secondHalfROI > firstHalfROI * 1.1 ? 'improving' :
    secondHalfROI < firstHalfROI * 0.9 ? 'declining' : 'stable';

  return { avgROI, totalCost, totalValue, recordCount: records.length, trend };
}

/**
 * Get global ROI across all modules
 */
export function getGlobalROI(): {
  avgROI: number;
  totalCost: number;
  totalValue: number;
  topModules: Array<{ module: string; roi: number }>;
  bottomModules: Array<{ module: string; roi: number }>;
} {
  const moduleMap = new Map<string, { cost: number; value: number }>();

  for (const r of roiRecords) {
    const existing = moduleMap.get(r.module) || { cost: 0, value: 0 };
    existing.cost += r.costMillicents;
    existing.value += r.valueMillicents;
    moduleMap.set(r.module, existing);
  }

  const totalCost = Array.from(moduleMap.values()).reduce((s, m) => s + m.cost, 0);
  const totalValue = Array.from(moduleMap.values()).reduce((s, m) => s + m.value, 0);

  const moduleROIs = Array.from(moduleMap.entries())
    .map(([module, data]) => ({
      module,
      roi: data.cost > 0 ? Math.round(((data.value - data.cost) / data.cost) * 100) / 100 : 0,
    }))
    .sort((a, b) => b.roi - a.roi);

  return {
    avgROI: totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 100) / 100 : 0,
    totalCost,
    totalValue,
    topModules: moduleROIs.slice(0, 5),
    bottomModules: moduleROIs.slice(-5).reverse(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHARGEBACK ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Allocate costs to a tenant
 */
export function allocateChargeback(
  tenantId: string,
  module: string,
  costMillicents: number,
  method: ChargebackAllocation['allocationMethod'] = 'usage',
  usageWeight: number = 1.0
): ChargebackAllocation {
  const allocation: ChargebackAllocation = {
    tenantId,
    module,
    costMillicents: Math.round(costMillicents * usageWeight),
    allocationMethod: method,
    usageWeight,
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
  };

  chargebackAllocations.push(allocation);
  if (chargebackAllocations.length > MAX_CHARGEBACKS) {
    chargebackAllocations.splice(0, chargebackAllocations.length - MAX_CHARGEBACKS);
  }

  return allocation;
}

/**
 * Get chargeback summary for a tenant
 */
export function getTenantChargeback(tenantId: string, period?: string): ChargebackSummary {
  const targetPeriod = period || new Date().toISOString().slice(0, 7);
  const tenantAllocations = chargebackAllocations.filter(
    a => a.tenantId === tenantId && a.period === targetPeriod
  );

  const totalCost = tenantAllocations.reduce((s, a) => s + a.costMillicents, 0);

  // Module breakdown
  const moduleMap = new Map<string, number>();
  for (const a of tenantAllocations) {
    moduleMap.set(a.module, (moduleMap.get(a.module) || 0) + a.costMillicents);
  }

  const moduleBreakdown = Array.from(moduleMap.entries())
    .map(([module, cost]) => ({
      module,
      cost,
      pct: totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  return {
    tenantId,
    period: targetPeriod,
    totalCost,
    moduleBreakdown,
    invoiceReady: tenantAllocations.length > 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALUE ATTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record value attribution for a capability
 */
export function recordValueAttribution(
  module: string,
  capability: string,
  directValue: number,
  indirectValue: number = 0,
  confidence: number = 50
): ValueAttribution {
  const key = `${module}:${capability}`;
  const attribution: ValueAttribution = {
    module,
    capability,
    directValue,
    indirectValue,
    totalValue: directValue + indirectValue,
    confidence: Math.max(0, Math.min(100, confidence)),
  };

  valueAttributions.set(key, attribution);
  return attribution;
}

/**
 * Get all value attributions for a module
 */
export function getModuleValueAttributions(module: string): ValueAttribution[] {
  return Array.from(valueAttributions.values()).filter(v => v.module === module);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EFFICIENCY SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate efficiency score for a module
 */
export function calculateEfficiency(
  module: string,
  totalCost: number,
  totalTokens: number,
  totalOperations: number,
  totalValue: number
): EfficiencyScore {
  const costPerToken = totalTokens > 0 ? Math.round((totalCost / totalTokens) * 100) / 100 : 0;
  const costPerOperation = totalOperations > 0 ? Math.round(totalCost / totalOperations) : 0;
  const valuePerCost = totalCost > 0 ? Math.round((totalValue / totalCost) * 100) / 100 : 0;

  // Grade based on value/cost ratio
  const grade: EfficiencyScore['grade'] =
    valuePerCost >= 3 ? 'A' :
    valuePerCost >= 2 ? 'B' :
    valuePerCost >= 1 ? 'C' :
    valuePerCost >= 0.5 ? 'D' : 'F';

  // Check trend from history
  const history = efficiencyHistory.get(module) || [];
  let trend: EfficiencyScore['trend'] = 'stable';
  if (history.length >= 2) {
    const prevScore = history[history.length - 1].valuePerCost;
    trend = valuePerCost > prevScore * 1.1 ? 'improving' :
      valuePerCost < prevScore * 0.9 ? 'declining' : 'stable';
  }

  // Recommendations
  const recommendations: string[] = [];
  if (grade === 'D' || grade === 'F') {
    recommendations.push('Review high-cost operations for optimization');
  }
  if (costPerToken > 0.01) {
    recommendations.push('Consider lower-cost model tiers for routine operations');
  }
  if (trend === 'declining') {
    recommendations.push('Efficiency declining — investigate recent changes');
  }

  const score: EfficiencyScore = {
    module, costPerToken, costPerOperation, valuePerCost, grade, trend, recommendations,
  };

  // Store in history
  history.push(score);
  if (history.length > 30) history.shift();
  efficiencyHistory.set(module, history);

  return score;
}

/**
 * Get efficiency scores for all tracked modules
 */
export function getAllEfficiencyScores(): EfficiencyScore[] {
  return Array.from(efficiencyHistory.entries())
    .filter(([_, history]) => history.length > 0)
    .map(([_, history]) => history[history.length - 1]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface EconomyROIStats {
  totalROIRecords: number;
  totalChargebacks: number;
  totalValueAttributions: number;
  trackedModules: number;
  globalROI: number;
}

export function getROIStats(): EconomyROIStats {
  const globalROI = getGlobalROI();
  return {
    totalROIRecords: roiRecords.length,
    totalChargebacks: chargebackAllocations.length,
    totalValueAttributions: valueAttributions.size,
    trackedModules: new Set(roiRecords.map(r => r.module)).size,
    globalROI: globalROI.avgROI,
  };
}

/**
 * Reset all ROI/chargeback state (for testing)
 */
export function resetROIEngine(): void {
  roiRecords.length = 0;
  chargebackAllocations.length = 0;
  valueAttributions.clear();
  efficiencyHistory.clear();
}
