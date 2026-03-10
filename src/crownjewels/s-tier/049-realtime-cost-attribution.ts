/**
 * S-Tier 049 — Realtime Cost Attribution Engine
 * CJPI: 93 | Node: ECONOMY | ID: S-102
 *
 * Tracks compute/API costs per module, per request, in real time.
 * Enables per-feature cost visibility for the ECONOMY node.
 */

export interface CostEntry {
  module: string;
  action: string;
  costMillicents: number;
  tokensUsed: number;
  timestamp: number;
}

export interface ModuleCostSummary {
  module: string;
  totalCostMillicents: number;
  totalTokens: number;
  requestCount: number;
  avgCostPerRequest: number;
}

const ledger: CostEntry[] = [];

export function recordCost(entry: CostEntry): void {
  ledger.push(entry);
}

export function getModuleCosts(sinceMs?: number): ModuleCostSummary[] {
  const cutoff = sinceMs ? Date.now() - sinceMs : 0;
  const filtered = ledger.filter(e => e.timestamp >= cutoff);

  const byModule = new Map<string, CostEntry[]>();
  for (const e of filtered) {
    if (!byModule.has(e.module)) byModule.set(e.module, []);
    byModule.get(e.module)!.push(e);
  }

  return [...byModule.entries()].map(([module, entries]) => ({
    module,
    totalCostMillicents: entries.reduce((s, e) => s + e.costMillicents, 0),
    totalTokens: entries.reduce((s, e) => s + e.tokensUsed, 0),
    requestCount: entries.length,
    avgCostPerRequest: Math.round(entries.reduce((s, e) => s + e.costMillicents, 0) / entries.length),
  })).sort((a, b) => b.totalCostMillicents - a.totalCostMillicents);
}

export function getTotalCost(sinceMs?: number): number {
  const cutoff = sinceMs ? Date.now() - sinceMs : 0;
  return ledger.filter(e => e.timestamp >= cutoff).reduce((s, e) => s + e.costMillicents, 0);
}

export function getLedgerSize(): number {
  return ledger.length;
}
