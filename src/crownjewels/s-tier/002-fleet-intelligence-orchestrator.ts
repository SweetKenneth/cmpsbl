/**
 * S-Tier Crown Jewel #2 — NEXUS Fleet Intelligence Orchestrator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 2 | CJPI: 98 | Version: 1.0.0
 * Module: NEXUS | Type: Architecture
 * Signature: b4d8f2a1
 * Generated: 2026-03-01T00:00:00.000Z
 */

interface ProviderConfig { id: string; name: string; costPerMillionTokens: number; maxTokens: number; supportedTasks: string[]; }
interface ProviderHealth { id: string; latencyP50: number; latencyP95: number; latencyP99: number; errorRate: number; availability: number; rateLimitRemaining: number; lastUpdated: number; consecutiveFailures: number; qualityScore: number; status: 'healthy' | 'degraded' | 'down'; }
interface RoutingRequest { taskType: string; maxLatencyMs?: number; maxCostPerMillion?: number; preferQuality?: boolean; excludeProviders?: string[]; requiredTokens?: number; }
interface RoutingDecision { providerId: string; score: number; reason: string; fallbackChain: string[]; }
interface ProviderOutcome { providerId: string; taskType: string; latencyMs: number; tokensUsed: number; success: boolean; qualityScore?: number; }

export function createFleetRouter() {
  const providers = new Map<string, ProviderConfig>();
  const health = new Map<string, ProviderHealth>();
  const taskAffinity = new Map<string, Map<string, number>>();
  const latencyHistory = new Map<string, number[]>();

  function registerProvider(config: ProviderConfig) {
    providers.set(config.id, config);
    health.set(config.id, { id: config.id, latencyP50: 500, latencyP95: 2000, latencyP99: 5000, errorRate: 0, availability: 1, rateLimitRemaining: 1000, lastUpdated: Date.now(), consecutiveFailures: 0, qualityScore: 0.8, status: 'healthy' });
    latencyHistory.set(config.id, []);
  }

  function computeScore(providerId: string, request: RoutingRequest): number {
    const h = health.get(providerId); const p = providers.get(providerId);
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
    const score = h.qualityScore * qW + latencyScore * lW + costScore * 0.15 + h.availability * 0.15 + affinity * 0.15;
    return Math.max(0, score - Math.min(0.5, h.consecutiveFailures * 0.1));
  }

  function selectProvider(request: RoutingRequest): RoutingDecision | null {
    const scored: Array<{ id: string; score: number }> = [];
    for (const id of providers.keys()) { const s = computeScore(id, request); if (s > 0) scored.push({ id, score: s }); }
    scored.sort((a, b) => b.score - a.score);
    if (!scored.length) return null;
    return { providerId: scored[0].id, score: scored[0].score, reason: `Best for '${request.taskType}'`, fallbackChain: scored.slice(1, 4).map(s => s.id) };
  }

  function recordOutcome(outcome: ProviderOutcome) {
    const h = health.get(outcome.providerId); if (!h) return;
    const history = latencyHistory.get(outcome.providerId) ?? [];
    history.push(outcome.latencyMs); if (history.length > 100) history.shift();
    latencyHistory.set(outcome.providerId, history);
    const sorted = [...history].sort((a, b) => a - b);
    h.latencyP50 = sorted[Math.floor(sorted.length * 0.5)] ?? 500;
    h.latencyP95 = sorted[Math.floor(sorted.length * 0.95)] ?? 2000;
    h.latencyP99 = sorted[Math.floor(sorted.length * 0.99)] ?? 5000;
    const alpha = 0.1;
    h.errorRate = h.errorRate * (1 - alpha) + (outcome.success ? 0 : 1) * alpha;
    h.availability = 1 - h.errorRate;
    h.consecutiveFailures = outcome.success ? 0 : h.consecutiveFailures + 1;
    h.status = h.consecutiveFailures >= 5 ? 'down' : h.errorRate > 0.3 ? 'degraded' : 'healthy';
    h.lastUpdated = Date.now();
    if (outcome.qualityScore !== undefined) h.qualityScore = h.qualityScore * (1 - alpha) + outcome.qualityScore * alpha;
    if (!taskAffinity.has(outcome.taskType)) taskAffinity.set(outcome.taskType, new Map());
    const aMap = taskAffinity.get(outcome.taskType)!;
    const cur = aMap.get(outcome.providerId) ?? 0.5;
    aMap.set(outcome.providerId, outcome.success ? Math.min(1, cur + 0.05) : Math.max(0, cur - 0.1));
  }

  return { registerProvider, selectProvider, recordOutcome, getProviderHealth: (id: string) => health.get(id), getAllHealth: () => [...health.values()], getStats: () => ({ total: providers.size, active: [...health.values()].filter(h => h.status !== 'down').length }) };
}
