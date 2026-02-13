/**
 * ECONOMY Module — Cost Attribution & Budget Engine
 * v9.1.0 ARCHITECT Epoch — Real-time cost tracking, budget enforcement, pricing signals
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';

export interface CostRecord {
  id: string;
  module: string;
  action: string;
  tokenCount: number;
  computeMs: number;
  costMillicents: number;
  timestamp: number;
  actorId: string;
}

export interface BudgetConfig {
  module: string;
  dailyLimitMillicents: number;
  alertThresholds: number[]; // e.g. [0.8, 0.9, 1.0]
}

export interface EconomyModuleState {
  initialized: boolean;
  totalSpendMillicents: number;
  todaySpendMillicents: number;
  budgets: BudgetConfig[];
  costRecords: CostRecord[];
  alertsFired: number;
}

const state: EconomyModuleState = {
  initialized: false,
  totalSpendMillicents: 0,
  todaySpendMillicents: 0,
  budgets: [],
  costRecords: [],
  alertsFired: 0,
};

export function initEconomy(): void {
  emitStarted('economy', 'init', {});
  state.initialized = true;
  emitSucceeded('economy', 'init', {});
}

export function recordCost(module: string, action: string, tokenCount: number, computeMs: number, costMillicents: number, actorId: string = 'system'): CostRecord {
  const record: CostRecord = {
    id: `cost-${Date.now()}-${state.costRecords.length}`,
    module, action, tokenCount, computeMs, costMillicents, timestamp: Date.now(), actorId,
  };
  state.costRecords.push(record);
  state.totalSpendMillicents += costMillicents;
  state.todaySpendMillicents += costMillicents;
  
  // Check budgets
  const budget = state.budgets.find(b => b.module === module);
  if (budget) {
    const moduleSpend = state.costRecords
      .filter(r => r.module === module)
      .reduce((sum, r) => sum + r.costMillicents, 0);
    const ratio = moduleSpend / budget.dailyLimitMillicents;
    for (const threshold of budget.alertThresholds) {
      if (ratio >= threshold) {
        emit({ module: 'economy', event_type: 'budget_alert', outcome: 'succeeded', data: { module, ratio, threshold } });
        state.alertsFired++;
      }
    }
  }
  
  return record;
}

export function setBudget(module: string, dailyLimitMillicents: number, alertThresholds: number[] = [0.8, 0.9, 1.0]): void {
  const existing = state.budgets.findIndex(b => b.module === module);
  const config: BudgetConfig = { module, dailyLimitMillicents, alertThresholds };
  if (existing >= 0) state.budgets[existing] = config;
  else state.budgets.push(config);
}

export function getCostsByModule(module: string): number {
  return state.costRecords.filter(r => r.module === module).reduce((sum, r) => sum + r.costMillicents, 0);
}

export function getEconomyState(): EconomyModuleState { return { ...state }; }
export function getEconomyHealth(): number { return state.initialized ? 100 : 0; }
