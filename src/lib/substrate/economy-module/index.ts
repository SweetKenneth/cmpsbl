/**
 * ECONOMY Module — Cost Attribution & Budget Engine
 * v9.3.0 ARCHITECT Epoch — Real-time cost tracking, budget enforcement, pricing signals
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';

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
  alertThresholds: number[];
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

let moduleEngine: ModuleEngine | null = null;

export function initEconomy(): void {
  emitStarted('economy', 'init', {});
  try {
    initCircuitBreaker('economy', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('economy', '9.3.0');
    state.initialized = true;
    emitSucceeded('economy', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('economy', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function recordCost(module: string, action: string, tokenCount: number, computeMs: number, costMillicents: number, actorId: string = 'system'): CostRecord {
  const fallbackRecord: CostRecord = {
    id: `cost-fallback-${Date.now()}`, module, action, tokenCount, computeMs,
    costMillicents, timestamp: Date.now(), actorId,
  };

  const { result } = withResilienceSync(
    'economy',
    () => {
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
    },
    fallbackRecord,
    'record_cost'
  );

  return result;
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

export function getEconomyResilience() {
  return getModuleResilienceReport('economy', getEconomyHealth());
}

export function getEconomyEngine() {
  return moduleEngine;
}
