/**
 * S-Tier 085 — Resource Waste Profiler
 * CJPI: 91 | Node: VISION | ID: S-109
 *
 * Identifies wasted compute, memory, and network resources.
 * Generates optimization recommendations.
 */

export interface ResourceUsage {
  module: string;
  type: 'compute' | 'memory' | 'network' | 'storage';
  allocated: number;
  utilized: number;
  unit: string;
  timestamp: number;
}

export interface WasteReport {
  wasteItems: WasteItem[];
  totalWastePct: number;
  estimatedSavings: number;
  generatedAt: string;
}

export interface WasteItem {
  module: string;
  type: string;
  wastePct: number;
  recommendation: string;
}

export function profileWaste(usages: ResourceUsage[]): WasteReport {
  const items: WasteItem[] = [];
  let totalAllocated = 0;
  let totalUtilized = 0;

  for (const u of usages) {
    totalAllocated += u.allocated;
    totalUtilized += u.utilized;
    const wastePct = u.allocated > 0 ? Math.round(((u.allocated - u.utilized) / u.allocated) * 100) : 0;

    if (wastePct > 30) {
      items.push({
        module: u.module,
        type: u.type,
        wastePct,
        recommendation: wastePct > 70
          ? `${u.module.toUpperCase()} ${u.type}: Severely over-provisioned (${wastePct}% waste). Reduce allocation by ${Math.round(wastePct * 0.6)}%.`
          : `${u.module.toUpperCase()} ${u.type}: ${wastePct}% waste. Consider right-sizing.`,
      });
    }
  }

  const totalWaste = totalAllocated > 0 ? Math.round(((totalAllocated - totalUtilized) / totalAllocated) * 100) : 0;
  return {
    wasteItems: items.sort((a, b) => b.wastePct - a.wastePct),
    totalWastePct: totalWaste,
    estimatedSavings: totalAllocated - totalUtilized,
    generatedAt: new Date().toISOString(),
  };
}
