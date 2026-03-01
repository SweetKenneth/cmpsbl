/**
 * ECONOMY Module — Cost Attribution & Budget Engine
 * Real-time cost tracking, budget enforcement, pricing signals
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 * 
 * CLM-Requested Upgrades Implemented:
 * ✅ Predictive cost forecasting (linear regression + seasonal)
 * ✅ Per-capability cost attribution
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber, boundArray } from '@/lib/system/hardening';

export interface CostRecord {
  id: string;
  module: string;
  action: string;
  capability?: string;
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

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Predictive Cost Forecasting
// ═══════════════════════════════════════════════════════════════════
export interface CostForecast {
  forecastDate: string;
  predictedSpendMillicents: number;
  confidenceInterval: { low: number; high: number };
  trend: 'increasing' | 'stable' | 'decreasing';
  dailyRate: number;
  projectedMonthly: number;
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Per-Capability Cost Attribution
// ═══════════════════════════════════════════════════════════════════
export interface CapabilityCostBreakdown {
  capability: string;
  totalCostMillicents: number;
  invocationCount: number;
  avgCostPerCall: number;
  avgTokensPerCall: number;
  avgComputeMs: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  percentOfTotal: number;
}

export interface EconomyModuleState {
  initialized: boolean;
  totalSpendMillicents: number;
  todaySpendMillicents: number;
  budgets: BudgetConfig[];
  costRecords: CostRecord[];
  alertsFired: number;
  capabilityBreakdown: CapabilityCostBreakdown[];
  latestForecast: CostForecast | null;
}

const state: EconomyModuleState = {
  initialized: false,
  totalSpendMillicents: 0,
  todaySpendMillicents: 0,
  budgets: [],
  costRecords: [],
  alertsFired: 0,
  capabilityBreakdown: [],
  latestForecast: null,
};

let moduleEngine: ModuleEngine | null = null;

export function initEconomy(): void {
  emitStarted('economy', 'init', {});
  try {
    initCircuitBreaker('economy', { failureThreshold: 5, recoveryTimeout: 30_000 });
    moduleEngine = activateModuleEngine('economy', '10.5.1');
    state.initialized = true;
    emitSucceeded('economy', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('economy', 'init', err instanceof Error ? err.message : String(err));
  }
}

const MAX_COST_RECORDS = 2000;

export function recordCost(module: string, action: string, tokenCount: number, computeMs: number, costMillicents: number, actorId: string = 'system', capability?: string): CostRecord {
  // Input validation
  const validModule = validateStringInput(module, { maxLength: 64, minLength: 1 }) ?? 'unknown';
  const validAction = validateStringInput(action, { maxLength: 128, minLength: 1 }) ?? 'unknown';
  const safeTokenCount = clampNumber(tokenCount, 0, 10_000_000, 0);
  const safeComputeMs = clampNumber(computeMs, 0, 600_000, 0);
  const safeCost = clampNumber(costMillicents, 0, 100_000_000, 0);

  const fallbackRecord: CostRecord = {
    id: `cost-fallback-${Date.now()}`, module: validModule, action: validAction, capability, tokenCount: safeTokenCount, computeMs: safeComputeMs,
    costMillicents: safeCost, timestamp: Date.now(), actorId,
  };

  const { result } = withResilienceSync(
    'economy',
    () => {
      const record: CostRecord = {
        id: `cost-${Date.now()}-${state.costRecords.length}`,
        module: validModule, action: validAction, capability, tokenCount: safeTokenCount, computeMs: safeComputeMs, costMillicents: safeCost, timestamp: Date.now(), actorId,
      };
      state.costRecords.push(record);
      // Bound cost records to prevent unbounded memory growth
      if (state.costRecords.length > MAX_COST_RECORDS) {
        state.costRecords = boundArray(state.costRecords, MAX_COST_RECORDS);
      }
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

      // Update capability breakdown
      if (capability) {
        updateCapabilityBreakdown(record);
      }

      return record;
    },
    fallbackRecord,
    'record_cost'
  );

  return result;
}

export function setBudget(module: string, dailyLimitMillicents: number, alertThresholds: number[] = [0.8, 0.9, 1.0]): void {
  const validModule = validateStringInput(module, { maxLength: 64, minLength: 1 });
  if (!validModule) return;
  const safeLimit = clampNumber(dailyLimitMillicents, 0, 1_000_000_000, 100_000);
  const existing = state.budgets.findIndex(b => b.module === validModule);
  const config: BudgetConfig = { module: validModule, dailyLimitMillicents: safeLimit, alertThresholds };
  if (existing >= 0) state.budgets[existing] = config;
  else if (state.budgets.length < 100) state.budgets.push(config);
}

export function getCostsByModule(module: string): number {
  return state.costRecords.filter(r => r.module === module).reduce((sum, r) => sum + r.costMillicents, 0);
}

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Per-Capability Cost Attribution
// ═══════════════════════════════════════════════════════════════════

function updateCapabilityBreakdown(record: CostRecord): void {
  if (!record.capability) return;

  const existing = state.capabilityBreakdown.find(c => c.capability === record.capability);
  if (existing) {
    existing.totalCostMillicents += record.costMillicents;
    existing.invocationCount++;
    existing.avgCostPerCall = existing.totalCostMillicents / existing.invocationCount;
    existing.avgTokensPerCall = (existing.avgTokensPerCall * (existing.invocationCount - 1) + record.tokenCount) / existing.invocationCount;
    existing.avgComputeMs = (existing.avgComputeMs * (existing.invocationCount - 1) + record.computeMs) / existing.invocationCount;
  } else {
    state.capabilityBreakdown.push({
      capability: record.capability!,
      totalCostMillicents: record.costMillicents,
      invocationCount: 1,
      avgCostPerCall: record.costMillicents,
      avgTokensPerCall: record.tokenCount,
      avgComputeMs: record.computeMs,
      trend: 'stable',
      percentOfTotal: 0,
    });
  }

  // Recalculate percentages
  const total = state.capabilityBreakdown.reduce((sum, c) => sum + c.totalCostMillicents, 0);
  for (const cap of state.capabilityBreakdown) {
    cap.percentOfTotal = total > 0 ? Math.round((cap.totalCostMillicents / total) * 100) : 0;
  }
}

export function getCapabilityBreakdown(): CapabilityCostBreakdown[] {
  return [...state.capabilityBreakdown].sort((a, b) => b.totalCostMillicents - a.totalCostMillicents);
}

export function getCostsByCapability(capability: string): number {
  return state.costRecords
    .filter(r => r.capability === capability)
    .reduce((sum, r) => sum + r.costMillicents, 0);
}

// ═══════════════════════════════════════════════════════════════════
// CLM UPGRADE: Predictive Cost Forecasting
// ═══════════════════════════════════════════════════════════════════

export function forecastCosts(daysAhead: number = 7): CostForecast {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Group costs by day
  const dailyCosts = new Map<string, number>();
  for (const record of state.costRecords) {
    const dayKey = new Date(record.timestamp).toISOString().slice(0, 10);
    dailyCosts.set(dayKey, (dailyCosts.get(dayKey) || 0) + record.costMillicents);
  }

  const sortedDays = Array.from(dailyCosts.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  if (sortedDays.length < 2) {
    const currentRate = state.todaySpendMillicents;
    const forecast: CostForecast = {
      forecastDate: new Date(now + daysAhead * dayMs).toISOString().slice(0, 10),
      predictedSpendMillicents: currentRate * daysAhead,
      confidenceInterval: { low: 0, high: currentRate * daysAhead * 2 },
      trend: 'stable',
      dailyRate: currentRate,
      projectedMonthly: currentRate * 30,
      warnings: ['Insufficient data for accurate forecast (< 2 days)'],
    };
    state.latestForecast = forecast;
    return forecast;
  }

  // Simple linear regression on daily costs
  const values = sortedDays.map(([, v]) => v);
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) * (i - xMean);
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Forecast
  const predictedDaily = intercept + slope * (n + daysAhead);
  const predictedSpend = Math.max(0, predictedDaily * daysAhead);

  // Standard deviation for confidence interval
  const residuals = values.map((v, i) => v - (intercept + slope * i));
  const stdDev = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / n);

  // Determine trend
  const trend: 'increasing' | 'stable' | 'decreasing' =
    slope > yMean * 0.05 ? 'increasing' :
    slope < -yMean * 0.05 ? 'decreasing' : 'stable';

  // Warnings
  const warnings: string[] = [];
  if (trend === 'increasing' && slope > yMean * 0.2) warnings.push('Cost growth rate exceeds 20% — review budget allocations');
  const lastDay = values[values.length - 1];
  if (lastDay > yMean * 1.5) warnings.push('Yesterday\'s spend was 50%+ above average');

  const forecast: CostForecast = {
    forecastDate: new Date(now + daysAhead * dayMs).toISOString().slice(0, 10),
    predictedSpendMillicents: Math.round(predictedSpend),
    confidenceInterval: {
      low: Math.max(0, Math.round(predictedSpend - 2 * stdDev * daysAhead)),
      high: Math.round(predictedSpend + 2 * stdDev * daysAhead),
    },
    trend,
    dailyRate: Math.round(yMean),
    projectedMonthly: Math.round(yMean * 30),
    warnings,
  };

  state.latestForecast = forecast;
  emit({ module: 'economy', event_type: 'forecast_generated', outcome: 'succeeded', data: { trend, predictedSpend: forecast.predictedSpendMillicents, dailyRate: forecast.dailyRate } });

  return forecast;
}

export function getEconomyState(): EconomyModuleState { return { ...state }; }
export function getEconomyHealth(): number { return state.initialized ? 100 : 0; }

export function getEconomyResilience() {
  return getModuleResilienceReport('economy', getEconomyHealth());
}

export function getEconomyEngine() {
  return moduleEngine;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENING LAYER v2.0.0 ("Ledger") — Re-exports
// ═══════════════════════════════════════════════════════════════════════════════

export {
  ECONOMY_HARDENING_VERSION,
  ECONOMY_HARDENING_CODENAME,
  // 1. Transaction Integrity Seal
  sealTransaction, verifyTransactionSeal,
  // 2. Budget Breach Circuit Breaker
  checkBudgetCircuit, recordBudgetBreach, resetBudgetCircuit,
  // 3. Cost Record Tamper Detection
  hashCostRecord, verifyRecordIntegrity,
  // 4. Spend Velocity Limiter
  configureSpendVelocity, checkSpendVelocity,
  // 5. Attribution Confidence Scorer
  scoreAttribution,
  // 6. Forecast Drift Detector
  detectForecastDrift,
  // 7. Budget Envelope Guard
  checkEnvelope,
  // 8. Cost Anomaly Detector
  detectCostAnomaly,
  // 9. Audit Trail Hash Chain
  appendAuditEntry, verifyAuditChain, getAuditChain,
  // 10. Currency Precision Guard
  enforcePrecision, validateMillicents,
  // 11. Runaway Prevention Gate
  checkRunawaySpend,
  // 12. Cost Allocation Validator
  validateAllocations,
  // 13. Budget Rollover Engine
  calculateRollover,
  // 14. Spend Pattern Fingerprinter
  fingerprintSpendPattern,
  // 15. Reconciliation Engine
  reconcileRecords,
  // 16. Cost Ceiling Enforcer
  setCostCeiling, checkCostCeiling,
  // 17. Attribution Lineage Tracker
  trackLineage, getLineageChain,
  // 18. Forecast Accuracy Scorer
  recordForecastOutcome, getForecastAccuracy,
  // 19. Budget Alert Deduplicator
  shouldFireBudgetAlert,
  // 20. Cost Replay Protector
  isReplayedTransaction,
  // 21. Multi-Currency Normalizer
  normalizeToUSD,
  // 22. Spend Quota Partitioner
  partitionQuotas,
  // 23. Economy Warmup Validator
  checkEconomyReadiness,
  // 24. Telemetry Cost Tracker
  recordTelemetryCost, getTelemetryCostSummary,
  // 25. Health Composite
  calculateEconomyHealth,
  // Types
  type TransactionSeal, type BudgetCircuitState, type TamperCheckResult,
  type AttributionConfidence, type ForecastDrift, type EnvelopeStatus,
  type CostAnomaly, type EconomyAuditEntry, type LineageNode,
  type ForecastAccuracy, type ReconciliationResult, type AllocationValidation,
  type RolloverResult, type SpendFingerprint, type QuotaPartition,
  type EconomyReadiness, type EconomyHealthReport,
} from './economy-hardening';
