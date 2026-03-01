# AI Operations Platform — Meta-Engine

> Complete AI provider fleet management in a single import. Route requests across providers, enforce budgets, detect anomalies, and maintain tamper-evident audit trails — all wired together.

## What It Is

A **meta-engine** that composes Fleet Intelligence, Cost-Aware Routing, Anomaly Detection, and Audit Chain into one unified platform. Instead of wiring 4 separate engines together, you get a single `createAIOps()` call that handles the entire AI operations lifecycle.

## Why It's More Valuable Than Individual Engines

| Standalone | Meta-Engine |
|---|---|
| You wire fleet router → cost tracker → anomaly detector → audit chain | One import, pre-wired |
| You build the feedback loops yourself | Outcomes auto-feed health, cost, anomaly, and audit |
| You handle cross-cutting concerns | Budget overruns auto-trigger anomalies and audit entries |
| You build dashboards from scratch | `.getStatus()` returns the full operational picture |

## Use Cases

- **AI SaaS products** — Manage OpenAI + Anthropic + Google with cost controls
- **Enterprise AI platforms** — Audit every AI call for compliance (SOC 2, HIPAA)
- **AI agent frameworks** — Route agent tasks to optimal models with learned affinity
- **Cost optimization** — Automatically downshift to cheaper models as budget depletes
- **Incident response** — Detect cascading provider failures before users notice

## Quick Start

```typescript
import { createAIOps } from './ai-ops-platform';

const aiops = createAIOps({
  dailyBudgetCents: 5000,  // $50/day
  alertThresholds: [0.5, 0.75, 0.9],
  criticalReservePct: 0.15,
  anomalyWindowMs: 120_000,
});

// Register your AI providers
aiops.registerProvider({
  id: 'openai-gpt4',
  name: 'GPT-4',
  costPerMillionTokens: 30,
  maxTokens: 128000,
  supportedTasks: ['reasoning', 'code', 'analysis'],
});

aiops.registerProvider({
  id: 'gemini-flash',
  name: 'Gemini 2.5 Flash',
  costPerMillionTokens: 0.75,
  maxTokens: 1000000,
  supportedTasks: ['*'],
});

aiops.registerProvider({
  id: 'claude-sonnet',
  name: 'Claude Sonnet',
  costPerMillionTokens: 15,
  maxTokens: 200000,
  supportedTasks: ['reasoning', 'writing', 'code'],
});

// Route a request — considers health, cost, affinity, budget
const decision = aiops.route({
  taskType: 'reasoning',
  preferQuality: true,
  requiredTokens: 4000,
});

if (decision) {
  const startTime = Date.now();
  try {
    const result = await callProvider(decision.providerId, prompt);
    
    // Record success — engine learns and audits automatically
    aiops.recordOutcome({
      providerId: decision.providerId,
      taskType: 'reasoning',
      latencyMs: Date.now() - startTime,
      tokensUsed: result.usage.total_tokens,
      costCents: result.usage.total_tokens * 0.00003,
      success: true,
      qualityScore: 0.92,
    });
  } catch (err) {
    // Record failure — triggers health degradation + anomaly check
    aiops.recordOutcome({
      providerId: decision.providerId,
      taskType: 'reasoning',
      latencyMs: Date.now() - startTime,
      tokensUsed: 0,
      costCents: 0,
      success: false,
    });
    
    // Use fallback chain
    for (const fallbackId of decision.fallbackChain) {
      // try next provider...
    }
  }
}

// Full operational status
const status = aiops.getStatus();
console.log(status);
// {
//   fleet: { totalProviders: 3, active: 3, degraded: 0 },
//   budget: { spentToday: 1250, remainingCents: 3750, utilizationPct: 25, currentTier: 'premium' },
//   anomalies: { recentCount: 0, incidents: [] },
//   audit: { totalEntries: 47, chainValid: true, merkleRoot: 'a3f7c...' }
// }

// Query audit trail
const todaysAICalls = aiops.queryAudit({ since: Date.now() - 86400000 });
```

## Full Source

```typescript
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AI Operations Platform — Meta-Engine                       ║
 * ║  Composes: Fleet Router + Cost Router + Anomaly + Audit     ║
 * ║  Zero dependencies. Drop into any TypeScript project.       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ProviderConfig {
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

export interface RoutingRequest {
  taskType: string;
  maxLatencyMs?: number;
  maxCostPerMillion?: number;
  preferQuality?: boolean;
  excludeProviders?: string[];
  requiredTokens?: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export interface RoutingDecision {
  providerId: string;
  score: number;
  reason: string;
  fallbackChain: string[];
  estimatedCostCents: number;
  budgetTier: 'premium' | 'standard' | 'budget';
}

export interface OutcomeReport {
  providerId: string;
  taskType: string;
  latencyMs: number;
  tokensUsed: number;
  costCents: number;
  success: boolean;
  qualityScore?: number;
  error?: string;
}

interface AuditEntry {
  index: number;
  actor: string;
  action: string;
  resource: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  payloadHash: string;
  previousHash: string;
  entryHash: string;
}

type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

interface Anomaly {
  id: string;
  source: string;
  metric: string;
  value: number;
  severity: AnomalySeverity;
  timestamp: number;
}

interface CorrelatedIncident {
  id: string;
  anomalies: Anomaly[];
  severity: AnomalySeverity;
  correlationType: 'temporal' | 'causal';
  hypothesis: string;
  confidence: number;
  rootCause?: string;
  affectedProviders: string[];
  createdAt: number;
}

interface CostEntry {
  providerId: string;
  costCents: number;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: number;
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

export interface AIOpsConfig {
  dailyBudgetCents: number;
  alertThresholds?: number[];
  criticalReservePct?: number;
  anomalyWindowMs?: number;
  maxAnomalyBuffer?: number;
  maxAuditEntries?: number;
  onAlert?: (alert: string) => void;
  onIncident?: (incident: CorrelatedIncident) => void;
  onBudgetTierChange?: (oldTier: string, newTier: string) => void;
}

export interface AIOpsStatus {
  fleet: {
    totalProviders: number;
    active: number;
    degraded: number;
    down: number;
    providers: Array<{ id: string; status: string; qualityScore: number; errorRate: number; latencyP50: number }>;
  };
  budget: BudgetStatus;
  anomalies: {
    recentCount: number;
    incidents: CorrelatedIncident[];
  };
  audit: {
    totalEntries: number;
    chainValid: boolean;
    merkleRoot: string;
  };
}

// ━━━ Meta-Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createAIOps(config: AIOpsConfig) {
  const {
    dailyBudgetCents,
    alertThresholds = [0.5, 0.75, 0.9],
    criticalReservePct = 0.2,
    anomalyWindowMs = 120_000,
    maxAnomalyBuffer = 500,
    onAlert,
    onIncident,
    onBudgetTierChange,
  } = config;

  // ════════════════════════════════════════════════════
  // LAYER 1: Hash Utility
  // ════════════════════════════════════════════════════

  function hash(input: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  // ════════════════════════════════════════════════════
  // LAYER 2: Fleet Intelligence
  // ════════════════════════════════════════════════════

  const providers = new Map<string, ProviderConfig>();
  const healthMap = new Map<string, ProviderHealth>();
  const taskAffinity = new Map<string, Map<string, number>>();
  const latencyHistory = new Map<string, number[]>();

  function registerProvider(providerConfig: ProviderConfig) {
    providers.set(providerConfig.id, providerConfig);
    healthMap.set(providerConfig.id, {
      id: providerConfig.id,
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
    latencyHistory.set(providerConfig.id, []);

    // Audit the registration
    auditAppend('system', 'provider.register', `provider:${providerConfig.id}`, {
      name: providerConfig.name,
      costPerMillion: providerConfig.costPerMillionTokens,
      supportedTasks: providerConfig.supportedTasks,
    });
  }

  function removeProvider(id: string) {
    providers.delete(id);
    healthMap.delete(id);
    latencyHistory.delete(id);
    auditAppend('system', 'provider.remove', `provider:${id}`);
  }

  function updateHealth(id: string, updates: Partial<ProviderHealth>) {
    const h = healthMap.get(id);
    if (!h) return;
    Object.assign(h, updates, { lastUpdated: Date.now() });
  }

  function computeScore(providerId: string, request: RoutingRequest): number {
    const h = healthMap.get(providerId);
    const p = providers.get(providerId);
    if (!h || !p || h.status === 'down') return -1;
    if (request.excludeProviders?.includes(providerId)) return -1;
    if (!p.supportedTasks.includes(request.taskType) && !p.supportedTasks.includes('*')) return -1;
    if (request.maxLatencyMs && h.latencyP95 > request.maxLatencyMs) return -0.5;
    if (request.maxCostPerMillion && p.costPerMillionTokens > request.maxCostPerMillion) return -0.5;
    if (request.requiredTokens && p.maxTokens < request.requiredTokens) return -1;
    if (h.rateLimitRemaining < 5) return -0.5;

    const qW = request.preferQuality ? 0.40 : 0.25;
    const lW = request.preferQuality ? 0.15 : 0.30;
    const latencyScore = 1 - Math.min(1, h.latencyP50 / 10000);
    const costScore = 1 - Math.min(1, p.costPerMillionTokens / 50);
    const affinity = taskAffinity.get(request.taskType)?.get(providerId) ?? 0.5;

    const budget = getBudgetStatus();
    const tierPenalty = budget.currentTier === 'budget' && p.costPerMillionTokens > 10 ? 0.3 : 0;

    const score =
      h.qualityScore * qW +
      latencyScore * lW +
      costScore * 0.15 +
      h.availability * 0.15 +
      affinity * 0.15 -
      tierPenalty;

    return Math.max(0, score - Math.min(0.5, h.consecutiveFailures * 0.1));
  }

  // ════════════════════════════════════════════════════
  // LAYER 3: Cost-Aware Routing
  // ════════════════════════════════════════════════════

  const costLog: CostEntry[] = [];
  let dayStart = new Date().setHours(0, 0, 0, 0);
  const alertsFired = new Set<number>();
  let lastTier: BudgetStatus['currentTier'] = 'premium';

  function resetIfNewDay() {
    const today = new Date().setHours(0, 0, 0, 0);
    if (today > dayStart) {
      dayStart = today;
      alertsFired.clear();
    }
  }

  function spentToday(): number {
    resetIfNewDay();
    return costLog.filter(e => e.timestamp >= dayStart).reduce((s, e) => s + e.costCents, 0);
  }

  function getBudgetStatus(): BudgetStatus {
    const spent = spentToday();
    const remaining = dailyBudgetCents - spent;
    const utilization = dailyBudgetCents > 0 ? spent / dailyBudgetCents : 0;
    const criticalReserve = dailyBudgetCents * criticalReservePct;
    const alerts: string[] = [];
    for (const t of alertThresholds) {
      if (utilization >= t && !alertsFired.has(t)) {
        const msg = `Budget ${Math.round(t * 100)}% consumed ($${(spent / 100).toFixed(2)} of $${(dailyBudgetCents / 100).toFixed(2)})`;
        alerts.push(msg);
        alertsFired.add(t);
        onAlert?.(msg);
      }
    }
    const tier: BudgetStatus['currentTier'] =
      utilization < 0.5 ? 'premium' : utilization < 0.8 ? 'standard' : 'budget';

    if (tier !== lastTier) {
      onBudgetTierChange?.(lastTier, tier);
      auditAppend('system', 'budget.tier_change', 'budget', { from: lastTier, to: tier, utilization: Math.round(utilization * 100) });
      lastTier = tier;
    }

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

  function canAfford(estimatedCostCents: number, priority: CostEntry['priority']): boolean {
    const status = getBudgetStatus();
    return priority === 'critical'
      ? status.remainingCents >= estimatedCostCents
      : status.availableForNonCritical >= estimatedCostCents;
  }

  // ════════════════════════════════════════════════════
  // LAYER 4: Anomaly Correlation
  // ════════════════════════════════════════════════════

  const anomalies: Anomaly[] = [];
  let anomalyIdCounter = 0;

  function ingestAnomaly(source: string, metric: string, value: number, severity: AnomalySeverity): Anomaly {
    const anomaly: Anomaly = {
      id: `anomaly_${++anomalyIdCounter}`,
      source, metric, value, severity,
      timestamp: Date.now(),
    };
    anomalies.push(anomaly);
    if (anomalies.length > maxAnomalyBuffer) anomalies.splice(0, anomalies.length - maxAnomalyBuffer);

    auditAppend('system', 'anomaly.detected', `provider:${source}`, {
      metric, value, severity,
    });

    return anomaly;
  }

  function groupByTime(list: Anomaly[], windowMs: number): Anomaly[][] {
    if (!list.length) return [];
    const sorted = [...list].sort((a, b) => a.timestamp - b.timestamp);
    const groups: Anomaly[][] = [[sorted[0]]];
    for (let i = 1; i < sorted.length; i++) {
      const last = groups[groups.length - 1];
      if (sorted[i].timestamp - last[0].timestamp <= windowMs) last.push(sorted[i]);
      else groups.push([sorted[i]]);
    }
    return groups.filter(g => g.length >= 2);
  }

  function maxSev(list: Anomaly[]): AnomalySeverity {
    for (const s of ['critical', 'high', 'medium', 'low'] as AnomalySeverity[]) {
      if (list.some(a => a.severity === s)) return s;
    }
    return 'low';
  }

  function correlateAnomalies(): CorrelatedIncident[] {
    const recent = anomalies.filter(a => Date.now() - a.timestamp < anomalyWindowMs * 5);
    if (recent.length < 2) return [];
    const incidents: CorrelatedIncident[] = [];
    const used = new Set<string>();

    for (const group of groupByTime(recent.filter(a => !used.has(a.id)), anomalyWindowMs)) {
      if (group.length < 2) continue;
      group.forEach(a => used.add(a.id));
      const incident: CorrelatedIncident = {
        id: `incident_${++anomalyIdCounter}`,
        anomalies: group,
        severity: maxSev(group),
        correlationType: 'temporal',
        hypothesis: `${group.length} provider anomalies co-occurring within ${anomalyWindowMs / 1000}s`,
        confidence: 0.7,
        affectedProviders: [...new Set(group.map(a => a.source))],
        createdAt: Date.now(),
      };
      incidents.push(incident);
      onIncident?.(incident);
    }

    return incidents;
  }

  // ════════════════════════════════════════════════════
  // LAYER 5: Tamper-Evident Audit Chain
  // ════════════════════════════════════════════════════

  const auditChain: AuditEntry[] = [];

  function hashEntry(actor: string, action: string, resource: string, payload: string, timestamp: number, previousHash: string): string {
    return hash(`${previousHash}|${actor}|${action}|${resource}|${payload}|${timestamp}`);
  }

  function auditAppend(actor: string, action: string, resource: string, payload?: Record<string, unknown>): AuditEntry {
    const timestamp = Date.now();
    const payloadStr = payload ? JSON.stringify(payload) : '';
    const payloadHash = hash(payloadStr);
    const previousHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].entryHash : '00000000';
    const entryHash = hashEntry(actor, action, resource, payloadStr, timestamp, previousHash);
    const entry: AuditEntry = {
      index: auditChain.length,
      actor, action, resource, payload,
      timestamp, payloadHash, previousHash, entryHash,
    };
    auditChain.push(entry);
    return entry;
  }

  function verifyAudit(): { valid: boolean; totalEntries: number; brokenAtIndex?: number; error?: string } {
    if (auditChain.length === 0) return { valid: true, totalEntries: 0 };
    for (let i = 0; i < auditChain.length; i++) {
      const entry = auditChain[i];
      const expectedPrev = i === 0 ? '00000000' : auditChain[i - 1].entryHash;
      if (entry.previousHash !== expectedPrev) return { valid: false, totalEntries: auditChain.length, brokenAtIndex: i, error: `Previous hash mismatch at ${i}` };
      const payloadStr = entry.payload ? JSON.stringify(entry.payload) : '';
      const computed = hashEntry(entry.actor, entry.action, entry.resource, payloadStr, entry.timestamp, entry.previousHash);
      if (entry.entryHash !== computed) return { valid: false, totalEntries: auditChain.length, brokenAtIndex: i, error: `Entry hash mismatch at ${i}` };
    }
    return { valid: true, totalEntries: auditChain.length };
  }

  function getMerkleRoot(): string {
    if (auditChain.length === 0) return '00000000';
    let level = auditChain.map(e => e.entryHash);
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        next.push(hash(level[i] + (level[i + 1] ?? level[i])));
      }
      level = next;
    }
    return level[0];
  }

  function queryAudit(params?: { actor?: string; action?: string; since?: number; limit?: number }): AuditEntry[] {
    let results = [...auditChain];
    if (params?.actor) results = results.filter(e => e.actor === params.actor);
    if (params?.action) results = results.filter(e => e.action === params.action);
    if (params?.since) results = results.filter(e => e.timestamp >= params.since!);
    if (params?.limit) results = results.slice(-params.limit);
    return results;
  }

  // ════════════════════════════════════════════════════
  // ORCHESTRATION: The Meta-Engine Wiring
  // ════════════════════════════════════════════════════

  function route(request: RoutingRequest): RoutingDecision | null {
    const priority = request.priority ?? 'medium';

    // Score all providers
    const scored: Array<{ id: string; score: number }> = [];
    for (const id of providers.keys()) {
      const s = computeScore(id, request);
      if (s > 0) scored.push({ id, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    if (!scored.length) {
      auditAppend('system', 'route.no_provider', `task:${request.taskType}`, { request });
      return null;
    }

    const best = scored[0];
    const provider = providers.get(best.id)!;
    const estimatedCost = (provider.costPerMillionTokens * (request.requiredTokens ?? 1000)) / 1_000_000;

    // Budget gate
    if (!canAfford(estimatedCost, priority)) {
      auditAppend('system', 'route.budget_blocked', `task:${request.taskType}`, {
        estimatedCost, priority, providerId: best.id,
      });

      // Try cheaper fallback
      const cheaperScored = scored.filter(s => {
        const p = providers.get(s.id)!;
        const cost = (p.costPerMillionTokens * (request.requiredTokens ?? 1000)) / 1_000_000;
        return canAfford(cost, priority);
      });

      if (!cheaperScored.length) return null;
      const fallback = cheaperScored[0];
      const fallbackProvider = providers.get(fallback.id)!;
      return {
        providerId: fallback.id,
        score: fallback.score,
        reason: `Budget-constrained fallback for '${request.taskType}'`,
        fallbackChain: cheaperScored.slice(1, 4).map(s => s.id),
        estimatedCostCents: (fallbackProvider.costPerMillionTokens * (request.requiredTokens ?? 1000)) / 1_000_000,
        budgetTier: getBudgetStatus().currentTier,
      };
    }

    return {
      providerId: best.id,
      score: best.score,
      reason: `Best for '${request.taskType}' (score: ${best.score.toFixed(3)})`,
      fallbackChain: scored.slice(1, 4).map(s => s.id),
      estimatedCostCents: estimatedCost,
      budgetTier: getBudgetStatus().currentTier,
    };
  }

  function recordOutcome(outcome: OutcomeReport) {
    const h = healthMap.get(outcome.providerId);
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
    const prevStatus = h.status;
    h.errorRate = h.errorRate * (1 - alpha) + (outcome.success ? 0 : 1) * alpha;
    h.availability = 1 - h.errorRate;
    h.consecutiveFailures = outcome.success ? 0 : h.consecutiveFailures + 1;
    h.status = h.consecutiveFailures >= 5 ? 'down' : h.errorRate > 0.3 ? 'degraded' : 'healthy';
    h.lastUpdated = Date.now();

    if (outcome.qualityScore !== undefined) {
      h.qualityScore = h.qualityScore * (1 - alpha) + outcome.qualityScore * alpha;
    }

    // Update task affinity
    if (!taskAffinity.has(outcome.taskType)) taskAffinity.set(outcome.taskType, new Map());
    const aMap = taskAffinity.get(outcome.taskType)!;
    const cur = aMap.get(outcome.providerId) ?? 0.5;
    aMap.set(outcome.providerId, outcome.success ? Math.min(1, cur + 0.05) : Math.max(0, cur - 0.1));

    // Record cost
    costLog.push({
      providerId: outcome.providerId,
      costCents: outcome.costCents,
      category: outcome.taskType,
      priority: 'medium',
      timestamp: Date.now(),
    });

    // Audit the outcome
    auditAppend(
      `provider:${outcome.providerId}`,
      outcome.success ? 'call.success' : 'call.failure',
      `task:${outcome.taskType}`,
      {
        latencyMs: outcome.latencyMs,
        tokensUsed: outcome.tokensUsed,
        costCents: outcome.costCents,
        qualityScore: outcome.qualityScore,
        error: outcome.error,
      }
    );

    // Anomaly detection on outcomes
    if (!outcome.success) {
      ingestAnomaly(outcome.providerId, 'call_failure', 1, h.consecutiveFailures >= 3 ? 'high' : 'medium');
    }
    if (outcome.latencyMs > 10000) {
      ingestAnomaly(outcome.providerId, 'high_latency', outcome.latencyMs, outcome.latencyMs > 30000 ? 'high' : 'medium');
    }
    if (h.status !== prevStatus) {
      ingestAnomaly(outcome.providerId, 'status_change', 0, h.status === 'down' ? 'critical' : 'high');
    }

    // Auto-correlate
    correlateAnomalies();
  }

  // ════════════════════════════════════════════════════
  // STATUS & QUERIES
  // ════════════════════════════════════════════════════

  function getStatus(): AIOpsStatus {
    return {
      fleet: {
        totalProviders: providers.size,
        active: [...healthMap.values()].filter(h => h.status === 'healthy').length,
        degraded: [...healthMap.values()].filter(h => h.status === 'degraded').length,
        down: [...healthMap.values()].filter(h => h.status === 'down').length,
        providers: [...healthMap.values()].map(h => ({
          id: h.id,
          status: h.status,
          qualityScore: Math.round(h.qualityScore * 100) / 100,
          errorRate: Math.round(h.errorRate * 1000) / 1000,
          latencyP50: h.latencyP50,
        })),
      },
      budget: getBudgetStatus(),
      anomalies: {
        recentCount: anomalies.filter(a => Date.now() - a.timestamp < anomalyWindowMs * 5).length,
        incidents: correlateAnomalies(),
      },
      audit: {
        totalEntries: auditChain.length,
        chainValid: verifyAudit().valid,
        merkleRoot: getMerkleRoot(),
      },
    };
  }

  function exportAuditChain(): AuditEntry[] {
    return [...auditChain];
  }

  return {
    // Fleet
    registerProvider,
    removeProvider,
    updateHealth,
    getProviderHealth: (id: string) => healthMap.get(id),
    getAllHealth: () => [...healthMap.values()],
    // Routing (orchestrated)
    route,
    recordOutcome,
    canAfford,
    // Budget
    getBudgetStatus,
    // Anomaly
    getAnomalies: () => [...anomalies],
    correlateAnomalies,
    // Audit
    queryAudit,
    verifyAudit,
    getMerkleRoot,
    exportAuditChain,
    // Full status
    getStatus,
  };
}
```

## API Reference

### Core Operations

| Method | Description |
|--------|-------------|
| `createAIOps(config)` | Create the platform with budget + anomaly config |
| `registerProvider(config)` | Add an AI provider (auto-audited) |
| `route(request)` | Route with budget gating + fallback chains |
| `recordOutcome(outcome)` | Feed results — auto-updates health, cost, anomalies, audit |
| `getStatus()` | Full fleet + budget + anomaly + audit status |

### Callbacks

| Callback | Fires When |
|----------|-----------|
| `onAlert(msg)` | Budget threshold crossed |
| `onIncident(incident)` | Anomalies correlated into incident |
| `onBudgetTierChange(old, new)` | Tier shifts (premium → standard → budget) |

### Queries

| Method | Description |
|--------|-------------|
| `queryAudit(params?)` | Search audit trail by actor, action, time |
| `verifyAudit()` | Verify tamper-evident chain integrity |
| `getMerkleRoot()` | Get Merkle root for external anchoring |
| `getBudgetStatus()` | Current spend, remaining, tier |
| `correlateAnomalies()` | Get correlated incidents |

## Architecture

```
                    ┌──────────────┐
   Request ──────→  │   ROUTING    │  ← Budget Gate
                    │   ENGINE     │  ← Provider Scores
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   EXECUTE    │  ← Your code calls the provider
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
   recordOutcome →  │  FEEDBACK    │
                    │    LOOP      │
                    └──┬───┬───┬───┘
                       │   │   │
          ┌────────────┘   │   └──────────────┐
          ▼                ▼                  ▼
   ┌──────────┐    ┌──────────────┐    ┌───────────┐
   │  HEALTH  │    │   COST       │    │  ANOMALY  │
   │  UPDATE  │    │   LEDGER     │    │  DETECTOR │
   └──────────┘    └──────────────┘    └─────┬─────┘
          │                │                 │
          └────────┬───────┘                 │
                   ▼                         ▼
            ┌────────────┐          ┌────────────────┐
            │   AUDIT    │  ←───── │   INCIDENT     │
            │   CHAIN    │         │  CORRELATOR    │
            └────────────┘          └────────────────┘
```

## Real-World Patterns

### Graceful Degradation
```typescript
const decision = aiops.route({ taskType: 'reasoning', preferQuality: true });
if (!decision) {
  // All providers down or budget exhausted
  return fallbackToCache(prompt);
}
```

### Budget-Aware Model Selection
```typescript
const status = aiops.getBudgetStatus();
const decision = aiops.route({
  taskType: 'summarization',
  // When budget is tight, accept cheaper models
  maxCostPerMillion: status.currentTier === 'budget' ? 5 : 50,
});
```

### Compliance Export
```typescript
// Weekly audit export
const weeklyAudit = aiops.queryAudit({ since: Date.now() - 7 * 86400000 });
const merkleRoot = aiops.getMerkleRoot();
const integrity = aiops.verifyAudit();
await saveComplianceReport({ entries: weeklyAudit, merkleRoot, integrity });
```

## License

MIT — Drop in anywhere. No attribution required.
