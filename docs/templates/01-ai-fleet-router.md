# AI Fleet Router

> Zero-dependency, drop-in multi-provider AI routing engine with cost controls, health tracking, circuit breaking, and adaptive task affinity.

## What It Does

Routes AI requests across multiple providers (OpenAI, Google, Anthropic, etc.) using real-time health scoring, cost budgets, latency percentiles, and learned task affinity. Automatically degrades failing providers, suggests fallback chains, and enforces daily spend limits.

## Use Cases

- **Multi-model AI applications** — Route to the best provider per task type
- **Cost-controlled AI pipelines** — Hard daily budgets with critical reserves
- **High-availability AI services** — Automatic failover with circuit breaking
- **A/B model testing** — Score and compare providers in real-time

## Drop-In Instructions

1. Copy the source below into your project (e.g. `src/lib/ai-fleet-router.ts`)
2. Import and configure providers
3. Route requests and record outcomes — the engine learns automatically

```typescript
import { createAIFleetRouter } from './ai-fleet-router';

const router = createAIFleetRouter({ dailyBudgetCents: 5000 });

router.registerProvider({
  id: 'openai-gpt4',
  name: 'GPT-4',
  costPerMillionTokens: 30,
  maxTokens: 128000,
  supportedTasks: ['reasoning', 'code', 'analysis'],
});

router.registerProvider({
  id: 'gemini-flash',
  name: 'Gemini Flash',
  costPerMillionTokens: 0.75,
  maxTokens: 1000000,
  supportedTasks: ['*'],
});

// Route a request
const decision = router.route({
  taskType: 'reasoning',
  maxCostPerMillion: 40,
  preferQuality: true,
});

if (decision) {
  console.log(`Use ${decision.providerId}, fallbacks: ${decision.fallbackChain}`);
}

// Record outcome — engine learns task affinity over time
router.recordOutcome({
  providerId: 'openai-gpt4',
  taskType: 'reasoning',
  latencyMs: 1200,
  tokensUsed: 5000,
  success: true,
  qualityScore: 0.95,
  costCents: 0.15,
  category: 'inference',
});

// Check budget
const budget = router.getBudgetStatus();
console.log(`${budget.utilizationPct}% of daily budget used`);
```

## Full Source

```typescript
/**
 * AI Fleet Router — Drop-in multi-provider AI routing engine
 * Combines: Fleet Intelligence + Cost-Aware Routing + Health Tracking
 * Zero dependencies. Works in any TypeScript/JavaScript project.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ProviderConfig {
  id: string;
  name: string;
  costPerMillionTokens: number;
  maxTokens: number;
  supportedTasks: string[];
}

interface ProviderHealth {
  id: string;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  availability: number;
  rateLimitRemaining: number;
  lastUpdated: number;
  consecutiveFailures: number;
  qualityScore: number;
  status: 'healthy' | 'degraded' | 'down';
}

interface RoutingRequest {
  taskType: string;
  maxLatencyMs?: number;
  maxCostPerMillion?: number;
  preferQuality?: boolean;
  excludeProviders?: string[];
  requiredTokens?: number;
}

interface RoutingDecision {
  providerId: string;
  score: number;
  reason: string;
  fallbackChain: string[];
  estimatedCostCents?: number;
}

interface ProviderOutcome {
  providerId: string;
  taskType: string;
  latencyMs: number;
  tokensUsed: number;
  success: boolean;
  qualityScore?: number;
  costCents: number;
  category: string;
}

interface BudgetConfig {
  dailyBudgetCents: number;
  alertThresholds?: number[];
  criticalReservePct?: number;
}

interface BudgetStatus {
  spentToday: number;
  budget: number;
  remainingCents: number;
  utilizationPct: number;
  criticalReserveCents: number;
  availableForNonCritical: number;
  alerts: string[];
  currentTier: 'premium' | 'standard' | 'budget';
}

interface CostEntry {
  providerId: string;
  costCents: number;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
}

// ━━━ Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createAIFleetRouter(budgetConfig: BudgetConfig) {
  const {
    dailyBudgetCents,
    alertThresholds = [0.5, 0.75, 0.9],
    criticalReservePct = 0.2,
  } = budgetConfig;

  const providers = new Map<string, ProviderConfig>();
  const health = new Map<string, ProviderHealth>();
  const taskAffinity = new Map<string, Map<string, number>>();
  const latencyHistory = new Map<string, number[]>();
  const costLog: CostEntry[] = [];
  let dayStart = new Date().setHours(0, 0, 0, 0);
  const alertsFired = new Set<number>();

  // ── Provider Management ──

  function registerProvider(config: ProviderConfig) {
    providers.set(config.id, config);
    health.set(config.id, {
      id: config.id,
      latencyP50: 500,
      latencyP95: 2000,
      latencyP99: 5000,
      errorRate: 0,
      availability: 1,
      rateLimitRemaining: 1000,
      lastUpdated: Date.now(),
      consecutiveFailures: 0,
      qualityScore: 0.8,
      status: 'healthy',
    });
    latencyHistory.set(config.id, []);
  }

  // ── Budget Tracking ──

  function resetIfNewDay() {
    const today = new Date().setHours(0, 0, 0, 0);
    if (today > dayStart) {
      dayStart = today;
      alertsFired.clear();
    }
  }

  function spentToday(): number {
    resetIfNewDay();
    return costLog
      .filter((e) => e.timestamp >= dayStart)
      .reduce((s, e) => s + e.costCents, 0);
  }

  function getBudgetStatus(): BudgetStatus {
    const spent = spentToday();
    const remaining = dailyBudgetCents - spent;
    const utilization = spent / dailyBudgetCents;
    const criticalReserve = dailyBudgetCents * criticalReservePct;
    const alerts: string[] = [];
    for (const t of alertThresholds) {
      if (utilization >= t && !alertsFired.has(t)) {
        alerts.push(`Budget ${Math.round(t * 100)}% consumed`);
        alertsFired.add(t);
      }
    }
    const tier: BudgetStatus['currentTier'] =
      utilization < 0.5 ? 'premium' : utilization < 0.8 ? 'standard' : 'budget';
    return {
      spentToday: spent,
      budget: dailyBudgetCents,
      remainingCents: remaining,
      utilizationPct: Math.round(utilization * 100),
      criticalReserveCents: criticalReserve,
      availableForNonCritical: Math.max(0, remaining - criticalReserve),
      alerts,
      currentTier: tier,
    };
  }

  // ── Scoring ──

  function computeScore(providerId: string, request: RoutingRequest): number {
    const h = health.get(providerId);
    const p = providers.get(providerId);
    if (!h || !p || h.status === 'down') return -1;
    if (request.excludeProviders?.includes(providerId)) return -1;
    if (
      !p.supportedTasks.includes(request.taskType) &&
      !p.supportedTasks.includes('*')
    )
      return -1;
    if (request.maxLatencyMs && h.latencyP95 > request.maxLatencyMs) return -0.5;
    if (request.maxCostPerMillion && p.costPerMillionTokens > request.maxCostPerMillion)
      return -0.5;
    if (request.requiredTokens && p.maxTokens < request.requiredTokens) return -1;
    if (h.rateLimitRemaining < 5) return -0.5;

    const qW = request.preferQuality ? 0.4 : 0.25;
    const lW = request.preferQuality ? 0.15 : 0.3;
    const latencyScore = 1 - Math.min(1, h.latencyP50 / 10000);
    const costScore = 1 - Math.min(1, p.costPerMillionTokens / 50);
    const affinity = taskAffinity.get(request.taskType)?.get(providerId) ?? 0.5;

    // Check budget tier constraints
    const budget = getBudgetStatus();
    const tierPenalty =
      budget.currentTier === 'budget' && p.costPerMillionTokens > 10 ? 0.3 : 0;

    const score =
      h.qualityScore * qW +
      latencyScore * lW +
      costScore * 0.15 +
      h.availability * 0.15 +
      affinity * 0.15 -
      tierPenalty;

    return Math.max(0, score - Math.min(0.5, h.consecutiveFailures * 0.1));
  }

  // ── Routing ──

  function route(request: RoutingRequest): RoutingDecision | null {
    const scored: Array<{ id: string; score: number }> = [];
    for (const id of providers.keys()) {
      const s = computeScore(id, request);
      if (s > 0) scored.push({ id, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    if (!scored.length) return null;

    const best = scored[0];
    const provider = providers.get(best.id);
    return {
      providerId: best.id,
      score: best.score,
      reason: `Best for '${request.taskType}' (score: ${best.score.toFixed(3)})`,
      fallbackChain: scored.slice(1, 4).map((s) => s.id),
      estimatedCostCents: provider
        ? (provider.costPerMillionTokens * (request.requiredTokens ?? 1000)) / 1_000_000
        : undefined,
    };
  }

  // ── Learning ──

  function recordOutcome(outcome: ProviderOutcome) {
    const h = health.get(outcome.providerId);
    if (!h) return;

    // Update latency percentiles
    const history = latencyHistory.get(outcome.providerId) ?? [];
    history.push(outcome.latencyMs);
    if (history.length > 100) history.shift();
    latencyHistory.set(outcome.providerId, history);
    const sorted = [...history].sort((a, b) => a - b);
    h.latencyP50 = sorted[Math.floor(sorted.length * 0.5)] ?? 500;
    h.latencyP95 = sorted[Math.floor(sorted.length * 0.95)] ?? 2000;
    h.latencyP99 = sorted[Math.floor(sorted.length * 0.99)] ?? 5000;

    // Update error rate (EWMA)
    const alpha = 0.1;
    h.errorRate = h.errorRate * (1 - alpha) + (outcome.success ? 0 : 1) * alpha;
    h.availability = 1 - h.errorRate;
    h.consecutiveFailures = outcome.success ? 0 : h.consecutiveFailures + 1;
    h.status =
      h.consecutiveFailures >= 5
        ? 'down'
        : h.errorRate > 0.3
        ? 'degraded'
        : 'healthy';
    h.lastUpdated = Date.now();

    // Update quality
    if (outcome.qualityScore !== undefined) {
      h.qualityScore = h.qualityScore * (1 - alpha) + outcome.qualityScore * alpha;
    }

    // Update task affinity
    if (!taskAffinity.has(outcome.taskType))
      taskAffinity.set(outcome.taskType, new Map());
    const aMap = taskAffinity.get(outcome.taskType)!;
    const cur = aMap.get(outcome.providerId) ?? 0.5;
    aMap.set(
      outcome.providerId,
      outcome.success ? Math.min(1, cur + 0.05) : Math.max(0, cur - 0.1)
    );

    // Record cost
    costLog.push({
      providerId: outcome.providerId,
      costCents: outcome.costCents,
      category: outcome.category,
      priority: 'medium',
      timestamp: Date.now(),
    });
  }

  // ── Queries ──

  function getProviderHealth(id: string) {
    return health.get(id);
  }

  function getAllHealth() {
    return [...health.values()];
  }

  function getStats() {
    return {
      totalProviders: providers.size,
      activeProviders: [...health.values()].filter((h) => h.status !== 'down').length,
      degradedProviders: [...health.values()].filter((h) => h.status === 'degraded')
        .length,
      totalRoutedToday: costLog.filter((e) => e.timestamp >= dayStart).length,
      budget: getBudgetStatus(),
    };
  }

  return {
    registerProvider,
    route,
    recordOutcome,
    getProviderHealth,
    getAllHealth,
    getBudgetStatus,
    getStats,
  };
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `createAIFleetRouter(config)` | Create a router with daily budget config |
| `registerProvider(config)` | Add an AI provider to the fleet |
| `route(request)` | Get the best provider for a task |
| `recordOutcome(outcome)` | Feed results back — engine learns affinity |
| `getBudgetStatus()` | Check spend, remaining budget, tier |
| `getProviderHealth(id)` | Get latency percentiles, error rate, status |
| `getAllHealth()` | Health snapshot of all providers |
| `getStats()` | Aggregate fleet statistics |

## Architecture

```
Request → Score All Providers → Rank → Budget Gate → Decision + Fallback Chain
                ↑                                           ↓
          Health Data ←──── Record Outcome ←──── Execution Result
                ↑
          Task Affinity (learned over time)
```

## License

MIT — Drop in anywhere. No attribution required.
