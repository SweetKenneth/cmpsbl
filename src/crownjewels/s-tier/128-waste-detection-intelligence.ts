/**
 * S-Tier 128 — Waste Detection Intelligence
 * ID: S-CJ86 | CJPI: 87 | Module: VISION
 * 
 * Automated waste detection across compute, storage, and network resources.
 */

export interface ResourceUsage {
  resourceId: string;
  type: 'compute' | 'storage' | 'network' | 'memory';
  allocated: number;
  utilized: number;
  costPerUnit: number;
  lastAccessed: string;
}

export interface WasteReport {
  id: string;
  totalWaste: number;
  wasteByType: Record<string, number>;
  items: WasteItem[];
  generatedAt: string;
}

export interface WasteItem {
  resourceId: string;
  type: string;
  wastePercent: number;
  wastedCost: number;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}

export class WasteDetectionIntelligence {
  private usages: ResourceUsage[] = [];

  report(usage: ResourceUsage): void {
    const idx = this.usages.findIndex(u => u.resourceId === usage.resourceId);
    if (idx >= 0) this.usages[idx] = usage;
    else this.usages.push(usage);
  }

  analyze(): WasteReport {
    const items: WasteItem[] = [];
    const wasteByType: Record<string, number> = {};

    for (const usage of this.usages) {
      const utilization = usage.allocated > 0 ? usage.utilized / usage.allocated : 1;
      const wastePercent = (1 - utilization) * 100;
      const wastedCost = (usage.allocated - usage.utilized) * usage.costPerUnit;

      if (wastePercent < 20) continue;

      const daysSinceAccess = (Date.now() - new Date(usage.lastAccessed).getTime()) / 86400000;
      const severity: WasteItem['severity'] = wastePercent > 80 || daysSinceAccess > 30 ? 'high'
        : wastePercent > 50 || daysSinceAccess > 7 ? 'medium' : 'low';

      let recommendation = '';
      if (daysSinceAccess > 30) recommendation = `Decommission: unused for ${Math.floor(daysSinceAccess)} days`;
      else if (wastePercent > 80) recommendation = `Downsize: ${wastePercent.toFixed(0)}% waste`;
      else recommendation = `Right-size: reduce allocation by ${wastePercent.toFixed(0)}%`;

      items.push({ resourceId: usage.resourceId, type: usage.type, wastePercent, wastedCost, recommendation, severity });
      wasteByType[usage.type] = (wasteByType[usage.type] || 0) + wastedCost;
    }

    return {
      id: crypto.randomUUID(),
      totalWaste: items.reduce((s, i) => s + i.wastedCost, 0),
      wasteByType,
      items: items.sort((a, b) => b.wastedCost - a.wastedCost),
      generatedAt: new Date().toISOString(),
    };
  }
}
