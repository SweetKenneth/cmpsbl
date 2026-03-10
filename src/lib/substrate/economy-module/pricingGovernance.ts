/**
 * ECONOMY Pricing Governance — v1.0.0
 * Grants ECONOMY ownership of all consensus pricing operations as a primitive.
 * 
 * Responsibilities:
 * - Track all pf-nexus-pricing invocations (cost, latency, provider breakdown)
 * - Record per-provider success/failure/outlier rates
 * - Detect pricing anomalies (z-score spikes, provider drift)
 * - Budget enforcement for pricing operations
 * - Governance receipts for batch repricing runs
 * - ROI analysis on pricing accuracy over time
 */

import { emit } from '../events';
import { recordCost } from './index';
import { recordSpendSample } from './spendIntelligence';
import { clampNumber } from '@/lib/system/hardening';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PricingRunRecord {
  id: string;
  artifact_id: string;
  artifact_name: string;
  source_table: string;
  providers_queried: string[];
  providers_succeeded: string[];
  providers_failed: string[];
  outliers_rejected: string[];
  pricing_source: string;
  recommended_price: number;
  consensus_mid: number | null;
  confidence: number;
  total_latency_ms: number;
  per_provider_latency: Record<string, number>;
  estimated_cost_millicents: number;
  timestamp: number;
}

export interface PricingProviderStats {
  provider: string;
  total_queries: number;
  successes: number;
  failures: number;
  outlier_rejections: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_mid_price: number;
  price_stddev: number;
  last_queried_at: number;
}

export interface PricingAnomalyEvent {
  id: string;
  type: 'price_spike' | 'provider_drift' | 'consensus_collapse' | 'budget_breach' | 'confidence_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  artifact_name: string;
  description: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface BatchRepricingReceipt {
  id: string;
  started_at: number;
  completed_at: number | null;
  total_artifacts: number;
  priced_successfully: number;
  priced_failed: number;
  total_cost_millicents: number;
  avg_confidence: number;
  avg_price: number;
  providers_used: Record<string, number>;
  anomalies_detected: number;
  status: 'in_progress' | 'completed' | 'failed';
}

export interface PricingGovernanceState {
  initialized: boolean;
  totalPricingRuns: number;
  totalCostMillicents: number;
  dailyBudgetMillicents: number;
  dailySpendMillicents: number;
  budgetDay: string;
  runs: PricingRunRecord[];
  providerStats: Map<string, PricingProviderStats>;
  anomalies: PricingAnomalyEvent[];
  activeBatch: BatchRepricingReceipt | null;
  batchHistory: BatchRepricingReceipt[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_RUNS = 5000;
const MAX_ANOMALIES = 500;
const MAX_BATCH_HISTORY = 50;

const state: PricingGovernanceState = {
  initialized: false,
  totalPricingRuns: 0,
  totalCostMillicents: 0,
  dailyBudgetMillicents: 500_000, // $5.00/day default
  dailySpendMillicents: 0,
  budgetDay: new Date().toISOString().slice(0, 10),
  runs: [],
  providerStats: new Map(),
  anomalies: [],
  activeBatch: null,
  batchHistory: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════

export function initPricingGovernance(): void {
  state.initialized = true;
  emit({
    module: 'economy',
    event_type: 'pricing_governance_initialized',
    outcome: 'succeeded',
    data: { dailyBudget: state.dailyBudgetMillicents },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE PRIMITIVE: RECORD PRICING RUN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a completed pricing run — the central primitive.
 * Called after every pf-nexus-pricing invocation.
 */
export function recordPricingRun(run: Omit<PricingRunRecord, 'id' | 'timestamp'>): PricingRunRecord {
  resetDayIfNeeded();

  const record: PricingRunRecord = {
    ...run,
    id: `prun-${Date.now()}-${state.totalPricingRuns}`,
    timestamp: Date.now(),
  };

  // Bound storage
  state.runs.push(record);
  if (state.runs.length > MAX_RUNS) {
    state.runs = state.runs.slice(-MAX_RUNS);
  }

  state.totalPricingRuns++;
  state.totalCostMillicents += record.estimated_cost_millicents;
  state.dailySpendMillicents += record.estimated_cost_millicents;

  // Feed ECONOMY cost ledger
  recordCost(
    'economy',
    'consensus_pricing',
    0, // no tokens from ECONOMY's perspective — provider tokens tracked separately
    record.total_latency_ms,
    record.estimated_cost_millicents,
    'system',
    'economy.consensus_pricing',
  );

  // Feed spend intelligence
  recordSpendSample('economy.pricing', record.estimated_cost_millicents);

  // Update per-provider stats
  for (const provider of record.providers_queried) {
    updateProviderStats(provider, record);
  }

  // Anomaly detection
  detectPricingAnomalies(record);

  emit({
    module: 'economy',
    event_type: 'pricing_run_recorded',
    outcome: 'succeeded',
    data: {
      artifact: record.artifact_name,
      source: record.pricing_source,
      price: record.recommended_price,
      confidence: record.confidence,
      providers: record.providers_succeeded.length,
    },
  });

  return record;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER STATS
// ═══════════════════════════════════════════════════════════════════════════════

function updateProviderStats(provider: string, run: PricingRunRecord): void {
  const existing = state.providerStats.get(provider) || {
    provider,
    total_queries: 0,
    successes: 0,
    failures: 0,
    outlier_rejections: 0,
    success_rate: 0,
    avg_latency_ms: 0,
    avg_mid_price: 0,
    price_stddev: 0,
    last_queried_at: 0,
  };

  existing.total_queries++;
  existing.last_queried_at = Date.now();

  if (run.providers_succeeded.includes(provider)) {
    existing.successes++;
    // Update avg latency
    const latency = run.per_provider_latency[provider] || 0;
    existing.avg_latency_ms = (existing.avg_latency_ms * (existing.successes - 1) + latency) / existing.successes;
  } else if (run.providers_failed.includes(provider)) {
    existing.failures++;
  }

  if (run.outliers_rejected.includes(provider)) {
    existing.outlier_rejections++;
  }

  existing.success_rate = existing.total_queries > 0
    ? Math.round((existing.successes / existing.total_queries) * 100) / 100
    : 0;

  state.providerStats.set(provider, existing);
}

export function getProviderPricingStats(): PricingProviderStats[] {
  return Array.from(state.providerStats.values())
    .sort((a, b) => b.total_queries - a.total_queries);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function detectPricingAnomalies(run: PricingRunRecord): void {
  // 1. Confidence drop detection
  if (run.confidence < 0.3 && run.providers_succeeded.length > 0) {
    pushAnomaly({
      type: 'confidence_drop',
      severity: 'medium',
      artifact_name: run.artifact_name,
      description: `Low confidence (${run.confidence}) despite ${run.providers_succeeded.length} provider(s) succeeding`,
      data: { confidence: run.confidence, providers: run.providers_succeeded },
    });
  }

  // 2. Consensus collapse — all external providers disagree significantly
  if (run.outliers_rejected.length >= 2 && run.providers_succeeded.length <= 1) {
    pushAnomaly({
      type: 'consensus_collapse',
      severity: 'high',
      artifact_name: run.artifact_name,
      description: `${run.outliers_rejected.length} providers rejected as outliers — consensus unreliable`,
      data: { rejected: run.outliers_rejected, remaining: run.providers_succeeded },
    });
  }

  // 3. Price spike — compare to recent average
  const recentRuns = state.runs.slice(-100).filter(r => r.recommended_price > 0);
  if (recentRuns.length >= 10) {
    const avgPrice = recentRuns.reduce((s, r) => s + r.recommended_price, 0) / recentRuns.length;
    const stdDev = Math.sqrt(
      recentRuns.reduce((s, r) => s + (r.recommended_price - avgPrice) ** 2, 0) / recentRuns.length
    );
    const zScore = stdDev > 0 ? (run.recommended_price - avgPrice) / stdDev : 0;

    if (Math.abs(zScore) > 2.5) {
      pushAnomaly({
        type: 'price_spike',
        severity: Math.abs(zScore) > 4 ? 'critical' : 'high',
        artifact_name: run.artifact_name,
        description: `Price $${run.recommended_price} is ${zScore.toFixed(1)}σ from recent average $${avgPrice.toFixed(2)}`,
        data: { price: run.recommended_price, avg: avgPrice, zScore, stdDev },
      });
    }
  }

  // 4. Budget breach
  if (state.dailySpendMillicents > state.dailyBudgetMillicents) {
    pushAnomaly({
      type: 'budget_breach',
      severity: 'critical',
      artifact_name: 'SYSTEM',
      description: `Daily pricing budget exceeded: ${state.dailySpendMillicents} > ${state.dailyBudgetMillicents} millicents`,
      data: { spend: state.dailySpendMillicents, budget: state.dailyBudgetMillicents },
    });
  }
}

function pushAnomaly(anomaly: Omit<PricingAnomalyEvent, 'id' | 'timestamp'>): void {
  const event: PricingAnomalyEvent = {
    ...anomaly,
    id: `panomaly-${Date.now()}-${state.anomalies.length}`,
    timestamp: Date.now(),
  };

  state.anomalies.push(event);
  if (state.anomalies.length > MAX_ANOMALIES) {
    state.anomalies = state.anomalies.slice(-MAX_ANOMALIES);
  }

  emit({
    module: 'economy',
    event_type: 'pricing_anomaly_detected',
    outcome: 'succeeded',
    data: { type: event.type, severity: event.severity, artifact: event.artifact_name },
  });
}

export function getPricingAnomalies(since?: number): PricingAnomalyEvent[] {
  if (since) return state.anomalies.filter(a => a.timestamp >= since);
  return [...state.anomalies];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH REPRICING GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════════

export function startBatchRepricing(totalArtifacts: number): BatchRepricingReceipt {
  const receipt: BatchRepricingReceipt = {
    id: `batch-${Date.now()}`,
    started_at: Date.now(),
    completed_at: null,
    total_artifacts: totalArtifacts,
    priced_successfully: 0,
    priced_failed: 0,
    total_cost_millicents: 0,
    avg_confidence: 0,
    avg_price: 0,
    providers_used: {},
    anomalies_detected: 0,
    status: 'in_progress',
  };

  state.activeBatch = receipt;

  emit({
    module: 'economy',
    event_type: 'batch_repricing_started',
    outcome: 'succeeded',
    data: { batchId: receipt.id, total: totalArtifacts },
  });

  return receipt;
}

export function recordBatchItem(
  success: boolean,
  price: number,
  confidence: number,
  costMillicents: number,
  providersUsed: string[],
): void {
  if (!state.activeBatch) return;

  const batch = state.activeBatch;
  if (success) {
    batch.priced_successfully++;
  } else {
    batch.priced_failed++;
  }

  batch.total_cost_millicents += costMillicents;

  // Rolling averages
  const total = batch.priced_successfully + batch.priced_failed;
  batch.avg_confidence = (batch.avg_confidence * (total - 1) + confidence) / total;
  if (success) {
    const successTotal = batch.priced_successfully;
    batch.avg_price = (batch.avg_price * (successTotal - 1) + price) / successTotal;
  }

  // Track provider usage
  for (const p of providersUsed) {
    batch.providers_used[p] = (batch.providers_used[p] || 0) + 1;
  }
}

export function completeBatchRepricing(): BatchRepricingReceipt | null {
  if (!state.activeBatch) return null;

  const batch = state.activeBatch;
  batch.completed_at = Date.now();
  batch.status = batch.priced_failed > batch.priced_successfully ? 'failed' : 'completed';
  batch.anomalies_detected = state.anomalies.filter(
    a => a.timestamp >= batch.started_at
  ).length;

  // Archive
  state.batchHistory.push(batch);
  if (state.batchHistory.length > MAX_BATCH_HISTORY) {
    state.batchHistory = state.batchHistory.slice(-MAX_BATCH_HISTORY);
  }

  state.activeBatch = null;

  emit({
    module: 'economy',
    event_type: 'batch_repricing_completed',
    outcome: 'succeeded',
    data: {
      batchId: batch.id,
      success: batch.priced_successfully,
      failed: batch.priced_failed,
      cost: batch.total_cost_millicents,
      avgPrice: batch.avg_price,
      avgConfidence: batch.avg_confidence,
      duration_ms: (batch.completed_at || Date.now()) - batch.started_at,
    },
  });

  return batch;
}

export function getActiveBatch(): BatchRepricingReceipt | null {
  return state.activeBatch;
}

export function getBatchHistory(): BatchRepricingReceipt[] {
  return [...state.batchHistory];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════════

export function setPricingBudget(dailyMillicents: number): void {
  state.dailyBudgetMillicents = clampNumber(dailyMillicents, 10_000, 10_000_000, 500_000);
  emit({
    module: 'economy',
    event_type: 'pricing_budget_updated',
    outcome: 'succeeded',
    data: { budget: state.dailyBudgetMillicents },
  });
}

export function canExecutePricingRun(): { allowed: boolean; reason?: string } {
  resetDayIfNeeded();

  if (state.dailySpendMillicents >= state.dailyBudgetMillicents) {
    return { allowed: false, reason: 'Daily pricing budget exhausted' };
  }

  const remaining = state.dailyBudgetMillicents - state.dailySpendMillicents;
  if (remaining < 500) {
    return { allowed: true, reason: 'Warning: less than $0.005 pricing budget remaining today' };
  }

  return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PricingGovernanceSummary {
  totalRuns: number;
  totalCostMillicents: number;
  dailySpend: number;
  dailyBudget: number;
  budgetUtilization: number;
  avgConfidence: number;
  avgRecommendedPrice: number;
  consensusRate: number;
  providerStats: PricingProviderStats[];
  recentAnomalies: PricingAnomalyEvent[];
  activeBatch: BatchRepricingReceipt | null;
  batchHistory: BatchRepricingReceipt[];
  topPricingSource: string;
}

export function getPricingGovernanceSummary(): PricingGovernanceSummary {
  resetDayIfNeeded();

  const recent = state.runs.slice(-500);
  const avgConfidence = recent.length > 0
    ? recent.reduce((s, r) => s + r.confidence, 0) / recent.length
    : 0;
  const avgPrice = recent.length > 0
    ? recent.reduce((s, r) => s + r.recommended_price, 0) / recent.length
    : 0;

  // Source distribution
  const sourceCount: Record<string, number> = {};
  for (const r of recent) {
    sourceCount[r.pricing_source] = (sourceCount[r.pricing_source] || 0) + 1;
  }
  const topSource = Object.entries(sourceCount).sort((a, b) => b[1] - a[1])[0];
  const consensusRuns = (sourceCount['consensus'] || 0) + (sourceCount['partial-consensus'] || 0);

  return {
    totalRuns: state.totalPricingRuns,
    totalCostMillicents: state.totalCostMillicents,
    dailySpend: state.dailySpendMillicents,
    dailyBudget: state.dailyBudgetMillicents,
    budgetUtilization: state.dailyBudgetMillicents > 0
      ? Math.round((state.dailySpendMillicents / state.dailyBudgetMillicents) * 100) / 100
      : 0,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    avgRecommendedPrice: Math.round(avgPrice * 100) / 100,
    consensusRate: recent.length > 0
      ? Math.round((consensusRuns / recent.length) * 100) / 100
      : 0,
    providerStats: getProviderPricingStats(),
    recentAnomalies: state.anomalies.slice(-20),
    activeBatch: state.activeBatch,
    batchHistory: state.batchHistory.slice(-10),
    topPricingSource: topSource?.[0] || 'none',
  };
}

/**
 * Get pricing cost breakdown by provider (for ECONOMY dashboards)
 */
export function getPricingCostByProvider(): Record<string, number> {
  const costs: Record<string, number> = {};
  for (const run of state.runs) {
    for (const provider of run.providers_queried) {
      // Approximate: distribute run cost evenly across queried providers
      const perProvider = Math.round(run.estimated_cost_millicents / run.providers_queried.length);
      costs[provider] = (costs[provider] || 0) + perProvider;
    }
  }
  return costs;
}

/**
 * Get pricing accuracy trend (confidence over time)
 */
export function getPricingConfidenceTrend(windowSize: number = 50): Array<{ index: number; confidence: number; source: string }> {
  return state.runs.slice(-windowSize).map((run, i) => ({
    index: i,
    confidence: run.confidence,
    source: run.pricing_source,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function resetDayIfNeeded(): void {
  const today = new Date().toISOString().slice(0, 10);
  if (state.budgetDay !== today) {
    state.budgetDay = today;
    state.dailySpendMillicents = 0;
  }
}

export function getPricingGovernanceState(): PricingGovernanceState {
  return { ...state, providerStats: new Map(state.providerStats) };
}

export function resetPricingGovernance(): void {
  state.runs.length = 0;
  state.providerStats.clear();
  state.anomalies.length = 0;
  state.activeBatch = null;
  state.batchHistory.length = 0;
  state.totalPricingRuns = 0;
  state.totalCostMillicents = 0;
  state.dailySpendMillicents = 0;
}
