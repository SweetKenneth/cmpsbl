/**
 * Resource Budget Manager — SYSTEM v9.0.0
 * Tracks and enforces memory, CPU, and event-buffer budgets per node
 * with soft/hard limits and quota rebalancing.
 */

// --- Types ---

export type ResourceType = 'memory' | 'cpu' | 'event_buffer' | 'connections';

export interface ResourceBudget {
  nodeId: string;
  resourceType: ResourceType;
  softLimit: number;
  hardLimit: number;
  currentUsage: number;
  peakUsage: number;
  lastUpdated: number;
  violations: number;
}

export interface BudgetAlert {
  nodeId: string;
  resourceType: ResourceType;
  alertType: 'soft_limit' | 'hard_limit' | 'spike';
  currentUsage: number;
  limit: number;
  timestamp: number;
}

export interface RebalanceResult {
  nodeId: string;
  resourceType: ResourceType;
  oldSoftLimit: number;
  newSoftLimit: number;
  reason: string;
}

// --- Constants ---

const MAX_ALERTS = 300;
const SPIKE_THRESHOLD_RATIO = 1.5; // 50% jump in one update

// --- State ---

const budgets: Map<string, ResourceBudget> = new Map();
const alerts: BudgetAlert[] = [];

// --- Helpers ---

function budgetKey(nodeId: string, resourceType: ResourceType): string {
  return `${nodeId}::${resourceType}`;
}

// --- Core ---

export function setBudget(
  nodeId: string,
  resourceType: ResourceType,
  softLimit: number,
  hardLimit: number
): void {
  const key = budgetKey(nodeId, resourceType);
  const existing = budgets.get(key);

  budgets.set(key, {
    nodeId,
    resourceType,
    softLimit,
    hardLimit,
    currentUsage: existing?.currentUsage ?? 0,
    peakUsage: existing?.peakUsage ?? 0,
    lastUpdated: Date.now(),
    violations: existing?.violations ?? 0,
  });
}

export function updateUsage(
  nodeId: string,
  resourceType: ResourceType,
  usage: number
): BudgetAlert[] {
  const key = budgetKey(nodeId, resourceType);
  const budget = budgets.get(key);
  if (!budget) return [];

  const previousUsage = budget.currentUsage;
  budget.currentUsage = usage;
  budget.peakUsage = Math.max(budget.peakUsage, usage);
  budget.lastUpdated = Date.now();

  const newAlerts: BudgetAlert[] = [];

  // Hard limit violation
  if (usage > budget.hardLimit) {
    budget.violations++;
    const alert: BudgetAlert = {
      nodeId, resourceType, alertType: 'hard_limit',
      currentUsage: usage, limit: budget.hardLimit, timestamp: Date.now(),
    };
    newAlerts.push(alert);
    alerts.push(alert);
  }
  // Soft limit warning
  else if (usage > budget.softLimit) {
    const alert: BudgetAlert = {
      nodeId, resourceType, alertType: 'soft_limit',
      currentUsage: usage, limit: budget.softLimit, timestamp: Date.now(),
    };
    newAlerts.push(alert);
    alerts.push(alert);
  }

  // Spike detection
  if (previousUsage > 0 && usage / previousUsage > SPIKE_THRESHOLD_RATIO) {
    const alert: BudgetAlert = {
      nodeId, resourceType, alertType: 'spike',
      currentUsage: usage, limit: budget.softLimit, timestamp: Date.now(),
    };
    newAlerts.push(alert);
    alerts.push(alert);
  }

  if (alerts.length > MAX_ALERTS) alerts.splice(0, alerts.length - MAX_ALERTS);

  return newAlerts;
}

export function getBudget(nodeId: string, resourceType: ResourceType): ResourceBudget | null {
  const key = budgetKey(nodeId, resourceType);
  const b = budgets.get(key);
  return b ? { ...b } : null;
}

export function getNodeBudgets(nodeId: string): ResourceBudget[] {
  return [...budgets.values()].filter(b => b.nodeId === nodeId).map(b => ({ ...b }));
}

export function getAllBudgets(): ResourceBudget[] {
  return [...budgets.values()].map(b => ({ ...b }));
}

export function isOverBudget(nodeId: string, resourceType: ResourceType): boolean {
  const b = budgets.get(budgetKey(nodeId, resourceType));
  return b ? b.currentUsage > b.hardLimit : false;
}

export function getUtilization(nodeId: string, resourceType: ResourceType): number {
  const b = budgets.get(budgetKey(nodeId, resourceType));
  if (!b || b.hardLimit === 0) return 0;
  return Math.round((b.currentUsage / b.hardLimit) * 100);
}

export function rebalanceBudgets(resourceType: ResourceType, totalBudget: number): RebalanceResult[] {
  const relevant = [...budgets.values()].filter(b => b.resourceType === resourceType);
  if (relevant.length === 0) return [];

  const results: RebalanceResult[] = [];
  const totalCurrentUsage = relevant.reduce((sum, b) => sum + b.currentUsage, 0);

  for (const budget of relevant) {
    const usageRatio = totalCurrentUsage > 0 ? budget.currentUsage / totalCurrentUsage : 1 / relevant.length;
    const newSoftLimit = Math.round(totalBudget * usageRatio * 0.8); // 80% of fair share
    const oldSoftLimit = budget.softLimit;

    if (Math.abs(newSoftLimit - oldSoftLimit) > oldSoftLimit * 0.1) {
      budget.softLimit = newSoftLimit;
      results.push({
        nodeId: budget.nodeId,
        resourceType,
        oldSoftLimit,
        newSoftLimit,
        reason: `Rebalanced based on usage ratio ${Math.round(usageRatio * 100)}%`,
      });
    }
  }

  return results;
}

export function getAlerts(count: number = 50): BudgetAlert[] {
  return alerts.slice(-count);
}

export function getViolationCount(nodeId: string): number {
  return [...budgets.values()]
    .filter(b => b.nodeId === nodeId)
    .reduce((sum, b) => sum + b.violations, 0);
}

export function clearBudgetState(): void {
  budgets.clear();
  alerts.length = 0;
}
