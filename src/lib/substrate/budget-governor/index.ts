/**
 * Cognitive Budget Governor
 * v1.0.0 — Fine-grained AI spend control per module and operation
 * 
 * Tracks token and cost budgets with configurable limits,
 * alerts, and automatic throttling when budgets are exceeded.
 */

export interface BudgetAllocation {
  moduleId: string;
  dailyTokenLimit: number;
  dailyCostLimitCents: number;
  tokensUsedToday: number;
  costUsedTodayCents: number;
  alertThreshold: number; // 0-1
  throttled: boolean;
  lastResetAt: number;
}

export interface BudgetAlert {
  moduleId: string;
  type: 'warning' | 'exceeded' | 'throttled';
  message: string;
  timestamp: number;
  percentUsed: number;
}

const allocations = new Map<string, BudgetAllocation>();
const alerts: BudgetAlert[] = [];

export function setAllocation(moduleId: string, dailyTokens: number, dailyCostCents: number, alertAt: number = 0.8): BudgetAllocation {
  const alloc: BudgetAllocation = {
    moduleId, dailyTokenLimit: dailyTokens, dailyCostLimitCents: dailyCostCents,
    tokensUsedToday: 0, costUsedTodayCents: 0,
    alertThreshold: alertAt, throttled: false, lastResetAt: Date.now(),
  };
  allocations.set(moduleId, alloc);
  return alloc;
}

export function recordSpend(moduleId: string, tokens: number, costCents: number): { allowed: boolean; alert: BudgetAlert | null } {
  const alloc = allocations.get(moduleId);
  if (!alloc) return { allowed: true, alert: null };

  // Check daily reset
  const dayStart = new Date().setHours(0, 0, 0, 0);
  if (alloc.lastResetAt < dayStart) {
    alloc.tokensUsedToday = 0;
    alloc.costUsedTodayCents = 0;
    alloc.throttled = false;
    alloc.lastResetAt = Date.now();
  }

  alloc.tokensUsedToday += tokens;
  alloc.costUsedTodayCents += costCents;

  const tokenPercent = alloc.tokensUsedToday / alloc.dailyTokenLimit;
  const costPercent = alloc.costUsedTodayCents / alloc.dailyCostLimitCents;
  const maxPercent = Math.max(tokenPercent, costPercent);

  if (maxPercent >= 1.0) {
    alloc.throttled = true;
    const alert: BudgetAlert = {
      moduleId, type: 'exceeded',
      message: `${moduleId} exceeded daily budget (${(maxPercent * 100).toFixed(0)}%)`,
      timestamp: Date.now(), percentUsed: maxPercent * 100,
    };
    alerts.push(alert);
    return { allowed: false, alert };
  }

  if (maxPercent >= alloc.alertThreshold) {
    const alert: BudgetAlert = {
      moduleId, type: 'warning',
      message: `${moduleId} approaching budget limit (${(maxPercent * 100).toFixed(0)}%)`,
      timestamp: Date.now(), percentUsed: maxPercent * 100,
    };
    alerts.push(alert);
    return { allowed: true, alert };
  }

  return { allowed: true, alert: null };
}

export function getAllocations(): BudgetAllocation[] { return Array.from(allocations.values()); }
export function getAllocation(moduleId: string): BudgetAllocation | undefined { return allocations.get(moduleId); }
export function getAlerts(since?: number): BudgetAlert[] {
  if (since) return alerts.filter(a => a.timestamp > since);
  return [...alerts];
}
export function getThrottledModules(): string[] {
  return Array.from(allocations.values()).filter(a => a.throttled).map(a => a.moduleId);
}
