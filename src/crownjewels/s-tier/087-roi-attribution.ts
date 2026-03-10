/**
 * S-Tier 087 — ROI Attribution Engine
 * CJPI: 91 | Node: ECONOMY | ID: S-111
 *
 * Attributes business value to AI operations and calculates ROI
 * per module, per feature, and per user workflow.
 */

export interface ValueEvent {
  module: string;
  action: string;
  costMillicents: number;
  valueMilicents: number;
  timestamp: number;
}

export interface ROIReport {
  module: string;
  totalCost: number;
  totalValue: number;
  roi: number;           // (value - cost) / cost
  eventCount: number;
}

const events: ValueEvent[] = [];

export function recordValue(event: ValueEvent): void {
  events.push(event);
}

export function getROIByModule(sinceMs?: number): ROIReport[] {
  const cutoff = sinceMs ? Date.now() - sinceMs : 0;
  const filtered = events.filter(e => e.timestamp >= cutoff);

  const byModule = new Map<string, ValueEvent[]>();
  for (const e of filtered) {
    if (!byModule.has(e.module)) byModule.set(e.module, []);
    byModule.get(e.module)!.push(e);
  }

  return [...byModule.entries()].map(([module, evts]) => {
    const totalCost = evts.reduce((s, e) => s + e.costMillicents, 0);
    const totalValue = evts.reduce((s, e) => s + e.valueMilicents, 0);
    return {
      module,
      totalCost,
      totalValue,
      roi: totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 100) / 100 : 0,
      eventCount: evts.length,
    };
  }).sort((a, b) => b.roi - a.roi);
}

export function getOverallROI(): { totalCost: number; totalValue: number; roi: number } {
  const totalCost = events.reduce((s, e) => s + e.costMillicents, 0);
  const totalValue = events.reduce((s, e) => s + e.valueMilicents, 0);
  return { totalCost, totalValue, roi: totalCost > 0 ? Math.round(((totalValue - totalCost) / totalCost) * 100) / 100 : 0 };
}
