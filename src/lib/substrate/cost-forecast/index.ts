/**
 * Provider Cost Forecasting
 * v1.0.0 — Predicts AI spend trends to prevent budget overruns
 * 
 * Uses exponential moving averages on historical usage to project
 * future costs and generate pre-emptive budget alerts.
 */

import { supabase } from '@/integrations/supabase/client';

export interface CostDataPoint {
  date: string;
  cost_cents: number;
  tokens: number;
  calls: number;
  provider: string;
}

export interface CostForecast {
  provider: string;
  currentDailyAvg: number;     // cents
  projectedMonthly: number;    // cents
  trend: 'rising' | 'stable' | 'declining';
  trendPct: number;            // % change
  budgetUtilization: number;   // 0-1
  daysUntilBudgetExhaust: number | null;
  confidence: number;          // 0-1
  alerts: string[];
}

export interface ForecastConfig {
  lookbackDays: number;
  monthlyBudgetCents: number;
  alertThreshold: number;      // 0-1, warn at this utilization
  emaAlpha: number;            // smoothing factor
}

const DEFAULT_CONFIG: ForecastConfig = {
  lookbackDays: 30,
  monthlyBudgetCents: 50_000, // $500 default budget
  alertThreshold: 0.8,
  emaAlpha: 0.3,
};

/** Exponential moving average */
function ema(values: number[], alpha: number): number {
  if (values.length === 0) return 0;
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = alpha * values[i] + (1 - alpha) * result;
  }
  return result;
}

/** Compute linear trend */
function linearTrend(values: number[]): { slope: number; r2: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, r2: 0 };

  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let num = 0, den = 0, ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (values[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  for (let i = 0; i < n; i++) {
    const predicted = slope * xs[i] + intercept;
    ssRes += (values[i] - predicted) ** 2;
    ssTot += (values[i] - yMean) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { slope, r2 };
}

/** Generate cost forecast for all providers */
export async function forecastCosts(
  config: Partial<ForecastConfig> = {}
): Promise<CostForecast[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const since = new Date();
  since.setDate(since.getDate() - cfg.lookbackDays);

  const { data: usage } = await supabase
    .from('ai_usage_log')
    .select('provider, cost, tokens_used, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (!usage || usage.length === 0) {
    return [{
      provider: 'all',
      currentDailyAvg: 0,
      projectedMonthly: 0,
      trend: 'stable',
      trendPct: 0,
      budgetUtilization: 0,
      daysUntilBudgetExhaust: null,
      confidence: 0,
      alerts: [],
    }];
  }

  // Group by provider
  const byProvider = new Map<string, CostDataPoint[]>();
  for (const row of usage) {
    const provider = row.provider || 'unknown';
    if (!byProvider.has(provider)) byProvider.set(provider, []);
    byProvider.get(provider)!.push({
      date: (row.created_at || '').slice(0, 10),
      cost_cents: Math.round((row.cost || 0) * 100),
      tokens: row.tokens_used || 0,
      calls: 1,
      provider,
    });
  }

  const forecasts: CostForecast[] = [];

  for (const [provider, points] of byProvider) {
    // Aggregate by day
    const dailyCosts = new Map<string, number>();
    for (const p of points) {
      dailyCosts.set(p.date, (dailyCosts.get(p.date) || 0) + p.cost_cents);
    }
    const dailyValues = Array.from(dailyCosts.values());

    const currentDailyAvg = ema(dailyValues, cfg.emaAlpha);
    const projectedMonthly = currentDailyAvg * 30;
    const { slope, r2 } = linearTrend(dailyValues);

    const trendPct = currentDailyAvg > 0
      ? (slope / currentDailyAvg) * 100
      : 0;

    const trend: CostForecast['trend'] =
      trendPct > 5 ? 'rising' :
      trendPct < -5 ? 'declining' : 'stable';

    const budgetUtilization = cfg.monthlyBudgetCents > 0
      ? projectedMonthly / cfg.monthlyBudgetCents
      : 0;

    const totalSpent = dailyValues.reduce((a, b) => a + b, 0);
    const remaining = cfg.monthlyBudgetCents - totalSpent;
    const daysUntilBudgetExhaust = currentDailyAvg > 0 && remaining > 0
      ? Math.round(remaining / currentDailyAvg)
      : null;

    const alerts: string[] = [];
    if (budgetUtilization >= 1) alerts.push(`⚠️ ${provider}: projected to EXCEED monthly budget`);
    else if (budgetUtilization >= cfg.alertThreshold) alerts.push(`⚡ ${provider}: approaching ${Math.round(budgetUtilization * 100)}% budget utilization`);
    if (trend === 'rising' && trendPct > 20) alerts.push(`📈 ${provider}: costs rising ${trendPct.toFixed(0)}% — review usage`);

    forecasts.push({
      provider,
      currentDailyAvg: Math.round(currentDailyAvg),
      projectedMonthly: Math.round(projectedMonthly),
      trend,
      trendPct: Math.round(trendPct * 10) / 10,
      budgetUtilization: Math.round(budgetUtilization * 1000) / 1000,
      daysUntilBudgetExhaust,
      confidence: Math.round(r2 * 100) / 100,
      alerts,
    });
  }

  return forecasts;
}

/** Quick budget check */
export async function getBudgetStatus(config: Partial<ForecastConfig> = {}) {
  const forecasts = await forecastCosts(config);
  const totalProjected = forecasts.reduce((s, f) => s + f.projectedMonthly, 0);
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return {
    totalProjectedMonthly: `$${(totalProjected / 100).toFixed(2)}`,
    budget: `$${(cfg.monthlyBudgetCents / 100).toFixed(2)}`,
    utilization: `${((totalProjected / cfg.monthlyBudgetCents) * 100).toFixed(1)}%`,
    allAlerts: forecasts.flatMap(f => f.alerts),
    providers: forecasts.map(f => ({ provider: f.provider, trend: f.trend, daily: `$${(f.currentDailyAvg / 100).toFixed(2)}` })),
  };
}
