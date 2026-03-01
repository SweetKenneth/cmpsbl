/**
 * S-Tier Crown Jewel #6 — NEXUS Cost-Aware Routing Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 6 | CJPI: 96 | Version: 1.0.0
 * Module: NEXUS | Type: Architecture
 * Signature: f80c26e5
 * Generated: 2026-03-01T00:00:00.000Z
 */

interface CostEntry { providerId: string; costCents: number; category: string; priority: 'critical' | 'high' | 'medium' | 'low'; timestamp: number; }
interface BudgetConfig { dailyBudgetCents: number; alertThresholds?: number[]; criticalReservePct?: number; }
interface ProviderCost { id: string; costPerMillionTokens: number; tier: 'premium' | 'standard' | 'budget'; }
interface BudgetStatus { spentToday: number; budget: number; remainingCents: number; utilizationPct: number; criticalReserveCents: number; availableForNonCritical: number; alerts: string[]; currentTier: 'premium' | 'standard' | 'budget'; }

export function createCostRouter(config: BudgetConfig) {
  const { dailyBudgetCents, alertThresholds = [0.5, 0.75, 0.9], criticalReservePct = 0.2 } = config;
  const costLog: CostEntry[] = [];
  const providers = new Map<string, ProviderCost>();
  let dayStart = new Date().setHours(0, 0, 0, 0);
  const alertsFired = new Set<number>();

  function resetIfNewDay() { const today = new Date().setHours(0, 0, 0, 0); if (today > dayStart) { dayStart = today; alertsFired.clear(); } }
  function registerProvider(p: ProviderCost) { providers.set(p.id, p); }

  function recordCost(providerId: string, costCents: number, category: string, priority: CostEntry['priority'] = 'medium') {
    resetIfNewDay();
    costLog.push({ providerId, costCents, category, priority, timestamp: Date.now() });
  }

  function spentToday(): number { resetIfNewDay(); return costLog.filter(e => e.timestamp >= dayStart).reduce((s, e) => s + e.costCents, 0); }

  function getStatus(): BudgetStatus {
    const spent = spentToday(); const remaining = dailyBudgetCents - spent;
    const utilization = spent / dailyBudgetCents; const criticalReserve = dailyBudgetCents * criticalReservePct;
    const alerts: string[] = [];
    for (const t of alertThresholds) { if (utilization >= t && !alertsFired.has(t)) { alerts.push(`Budget ${Math.round(t * 100)}% consumed`); alertsFired.add(t); } }
    const tier: BudgetStatus['currentTier'] = utilization < 0.5 ? 'premium' : utilization < 0.8 ? 'standard' : 'budget';
    return { spentToday: spent, budget: dailyBudgetCents, remainingCents: remaining, utilizationPct: Math.round(utilization * 100), criticalReserveCents: criticalReserve, availableForNonCritical: Math.max(0, remaining - criticalReserve), alerts, currentTier: tier };
  }

  function canAfford(providerId: string, estimatedCostCents: number, priority: CostEntry['priority']): boolean {
    const status = getStatus();
    return priority === 'critical' ? status.remainingCents >= estimatedCostCents : status.availableForNonCritical >= estimatedCostCents;
  }

  function suggestProvider(category: string, priority: CostEntry['priority']): string | null {
    const status = getStatus();
    const sorted = [...providers.values()].sort((a, b) => a.costPerMillionTokens - b.costPerMillionTokens);
    if (priority === 'critical') return sorted.find(p => p.tier === 'premium')?.id ?? sorted[0]?.id ?? null;
    if (status.currentTier === 'budget') return sorted[0]?.id ?? null;
    return sorted.find(p => p.tier !== 'premium')?.id ?? sorted[0]?.id ?? null;
  }

  return { registerProvider, recordCost, getStatus, canAfford, suggestProvider };
}
