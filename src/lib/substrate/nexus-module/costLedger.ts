/**
 * NEXUS — Cost Ledger & Budget Controller
 * Per-request cost tracking with daily/hourly budget ceilings.
 */

export interface CostEntry {
  id: string;
  providerId: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costMillicents: number;
  timestamp: number;
  category: string;
}

export interface BudgetConfig {
  dailyLimitMillicents: number;
  hourlyLimitMillicents: number;
  alertThresholdRatio: number;  // 0-1, alert at this % of budget
}

export interface BudgetStatus {
  dailySpent: number;
  hourlySpent: number;
  dailyRemaining: number;
  hourlyRemaining: number;
  dailyUtilization: number;
  hourlyUtilization: number;
  isOverDailyBudget: boolean;
  isOverHourlyBudget: boolean;
  shouldAlert: boolean;
  cheapestProvider: string | null;
  topSpenders: { providerId: string; spent: number }[];
}

const ledger: CostEntry[] = [];
const MAX_LEDGER = 10000;
let entryCounter = 0;

const DEFAULT_BUDGET: BudgetConfig = {
  dailyLimitMillicents: 500_00, // $5.00/day
  hourlyLimitMillicents: 50_00,  // $0.50/hour
  alertThresholdRatio: 0.8,
};

let budgetConfig = { ...DEFAULT_BUDGET };

export function configureBudget(config: Partial<BudgetConfig>): void {
  budgetConfig = { ...budgetConfig, ...config };
}

export function recordCost(entry: Omit<CostEntry, 'id' | 'timestamp'>): CostEntry {
  const full: CostEntry = {
    ...entry,
    id: `cost-${Date.now()}-${++entryCounter}`,
    timestamp: Date.now(),
  };
  ledger.push(full);
  if (ledger.length > MAX_LEDGER) ledger.splice(0, ledger.length - MAX_LEDGER);
  return full;
}

export function getBudgetStatus(): BudgetStatus {
  const now = Date.now();
  const dayStart = now - 86_400_000;
  const hourStart = now - 3_600_000;

  const dailyEntries = ledger.filter(e => e.timestamp >= dayStart);
  const hourlyEntries = ledger.filter(e => e.timestamp >= hourStart);

  const dailySpent = dailyEntries.reduce((s, e) => s + e.costMillicents, 0);
  const hourlySpent = hourlyEntries.reduce((s, e) => s + e.costMillicents, 0);

  // Per-provider spend
  const providerSpend = new Map<string, number>();
  for (const e of dailyEntries) {
    providerSpend.set(e.providerId, (providerSpend.get(e.providerId) ?? 0) + e.costMillicents);
  }

  const topSpenders = Array.from(providerSpend.entries())
    .map(([providerId, spent]) => ({ providerId, spent }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  // Find cheapest provider (by avg cost per entry)
  const providerCounts = new Map<string, number>();
  for (const e of dailyEntries) {
    providerCounts.set(e.providerId, (providerCounts.get(e.providerId) ?? 0) + 1);
  }
  let cheapestProvider: string | null = null;
  let cheapestAvg = Infinity;
  for (const [id, total] of providerSpend) {
    const count = providerCounts.get(id) ?? 1;
    const avg = total / count;
    if (avg < cheapestAvg) {
      cheapestAvg = avg;
      cheapestProvider = id;
    }
  }

  const dailyUtilization = budgetConfig.dailyLimitMillicents > 0
    ? dailySpent / budgetConfig.dailyLimitMillicents
    : 0;
  const hourlyUtilization = budgetConfig.hourlyLimitMillicents > 0
    ? hourlySpent / budgetConfig.hourlyLimitMillicents
    : 0;

  return {
    dailySpent,
    hourlySpent,
    dailyRemaining: Math.max(0, budgetConfig.dailyLimitMillicents - dailySpent),
    hourlyRemaining: Math.max(0, budgetConfig.hourlyLimitMillicents - hourlySpent),
    dailyUtilization,
    hourlyUtilization,
    isOverDailyBudget: dailySpent >= budgetConfig.dailyLimitMillicents,
    isOverHourlyBudget: hourlySpent >= budgetConfig.hourlyLimitMillicents,
    shouldAlert: dailyUtilization >= budgetConfig.alertThresholdRatio ||
                 hourlyUtilization >= budgetConfig.alertThresholdRatio,
    cheapestProvider,
    topSpenders,
  };
}

export function getCostBreakdown(windowMs = 86_400_000): {
  byProvider: Record<string, number>;
  byCategory: Record<string, number>;
  byModel: Record<string, number>;
  total: number;
} {
  const cutoff = Date.now() - windowMs;
  const entries = ledger.filter(e => e.timestamp >= cutoff);

  const byProvider: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byModel: Record<string, number> = {};
  let total = 0;

  for (const e of entries) {
    byProvider[e.providerId] = (byProvider[e.providerId] ?? 0) + e.costMillicents;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.costMillicents;
    byModel[e.model] = (byModel[e.model] ?? 0) + e.costMillicents;
    total += e.costMillicents;
  }

  return { byProvider, byCategory, byModel, total };
}

export function clearLedger(): void {
  ledger.length = 0;
}
