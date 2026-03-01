/**
 * Meta-Engine #7 — Intelligent API Gateway
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Rate Limiter + Circuit Breaker + Cache + Feature Flags + Cost Router + Pipeline
 *
 * Complete API management layer. Routes requests through rate limiting,
 * feature gating, response caching, cost tracking, circuit protection,
 * and transformation pipelines. One import replaces an entire gateway stack.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface GatewayConfig {
  rateLimit: { maxRequests: number; windowMs: number; burstAllowance?: number };
  cache?: { maxSize?: number; defaultTtlMs?: number };
  budget?: { dailyBudgetCents: number };
  circuitBreaker?: { failureThreshold?: number; timeoutMs?: number };
  onRequest?: (req: GatewayRequest) => void;
  onResponse?: (req: GatewayRequest, res: GatewayResponse) => void;
  onBlocked?: (req: GatewayRequest, reason: string) => void;
}

export interface GatewayRequest {
  id: string;
  route: string;
  method: string;
  userId?: string;
  apiKey?: string;
  payload?: unknown;
  headers?: Record<string, string>;
  timestamp: number;
}

export interface GatewayResponse {
  status: number;
  body: unknown;
  cached: boolean;
  latencyMs: number;
  route: string;
  costCents?: number;
}

export interface RouteHandler {
  route: string;
  handler: (req: GatewayRequest) => Promise<{ status: number; body: unknown; costCents?: number }>;
  cacheTtlMs?: number;
  featureFlag?: string;
  rateLimit?: { maxRequests: number; windowMs: number };
  transform?: (body: unknown) => unknown;
  priority?: number;
}

export interface GatewayStats {
  totalRequests: number;
  cachedResponses: number;
  rateLimited: number;
  circuitBroken: number;
  featureGated: number;
  totalCostCents: number;
  avgLatencyMs: number;
  routeStats: Record<string, { calls: number; avgLatencyMs: number; errors: number }>;
}

export function createAPIGateway(config: GatewayConfig) {
  const routes = new Map<string, RouteHandler>();
  const featureFlags = new Map<string, { enabled: boolean; rolloutPct?: number; targetUsers?: string[] }>();
  let totalRequests = 0, cachedResponses = 0, rateLimited = 0, circuitBroken = 0, featureGated = 0, totalCostCents = 0, totalLatency = 0;
  const routeMetrics = new Map<string, { calls: number; totalLatency: number; errors: number }>();

  // ── Rate Limiter ───────────────────────────────────────────────
  const rlKeys = new Map<string, { requests: number[]; penalty: number }>();
  function rlCheck(key: string, limits: { maxRequests: number; windowMs: number }): boolean {
    let s = rlKeys.get(key); if (!s) { s = { requests: [], penalty: 0 }; rlKeys.set(key, s); }
    const now = Date.now(); s.requests = s.requests.filter(t => now - t < limits.windowMs);
    const eff = Math.max(1, Math.floor(limits.maxRequests / Math.pow(2, s.penalty)));
    if (s.requests.length < eff) { s.requests.push(now); return true; }
    return false;
  }
  function rlPenalize(key: string) { const s = rlKeys.get(key); if (s) s.penalty = Math.min(s.penalty + 1, 4); }

  // ── Cache ──────────────────────────────────────────────────────
  const cache = new Map<string, { body: unknown; expiresAt: number }>();
  function cacheGet(key: string): unknown | undefined { const e = cache.get(key); if (!e || Date.now() > e.expiresAt) { cache.delete(key); return undefined; } return e.body; }
  function cacheSet(key: string, body: unknown, ttl: number) { cache.set(key, { body, expiresAt: Date.now() + ttl }); if (cache.size > (config.cache?.maxSize ?? 500)) { const oldest = cache.keys().next().value; if (oldest) cache.delete(oldest); } }

  // ── Circuit Breaker ────────────────────────────────────────────
  const circuits = new Map<string, { failures: number; state: 'closed' | 'open' | 'half_open'; openedAt: number }>();
  function cbCheck(route: string): boolean {
    const c = circuits.get(route); if (!c || c.state === 'closed') return true;
    if (c.state === 'open' && Date.now() - c.openedAt > (config.circuitBreaker?.timeoutMs ?? 30_000)) { c.state = 'half_open'; return true; }
    return c.state === 'half_open';
  }
  function cbRecord(route: string, ok: boolean) {
    let c = circuits.get(route); if (!c) { c = { failures: 0, state: 'closed', openedAt: 0 }; circuits.set(route, c); }
    if (ok) { c.failures = 0; if (c.state === 'half_open') c.state = 'closed'; return; }
    c.failures++; if (c.failures >= (config.circuitBreaker?.failureThreshold ?? 5) && c.state !== 'open') { c.state = 'open'; c.openedAt = Date.now(); }
  }

  // ── Feature Flags ──────────────────────────────────────────────
  function ffCheck(flagKey: string, userId?: string): boolean {
    const flag = featureFlags.get(flagKey); if (!flag) return true; if (!flag.enabled) return false;
    if (userId && flag.targetUsers?.includes(userId)) return true;
    if (flag.rolloutPct !== undefined && userId) {
      let h = 0; const s = `${userId}:${flagKey}`; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return Math.abs(h) % 100 < flag.rolloutPct;
    }
    return flag.enabled;
  }

  // ── Budget Tracking ────────────────────────────────────────────
  let dayStart = new Date().setHours(0, 0, 0, 0);
  let spentToday = 0;
  function budgetCheck(cost: number): boolean {
    const today = new Date().setHours(0, 0, 0, 0); if (today > dayStart) { dayStart = today; spentToday = 0; }
    if (!config.budget) return true;
    return spentToday + cost <= config.budget.dailyBudgetCents;
  }
  function budgetRecord(cost: number) { spentToday += cost; totalCostCents += cost; }

  // ── Route Registration ─────────────────────────────────────────

  function registerRoute(handler: RouteHandler) { routes.set(handler.route, handler); }
  function setFeatureFlag(key: string, opts: { enabled: boolean; rolloutPct?: number; targetUsers?: string[] }) { featureFlags.set(key, opts); }

  // ── Request Processing ─────────────────────────────────────────

  async function handle(req: GatewayRequest): Promise<GatewayResponse> {
    const start = Date.now();
    totalRequests++;
    config.onRequest?.(req);

    const route = routes.get(req.route);
    if (!route) return respond(req, 404, { error: 'Route not found' }, start);

    // Rate limit
    const rlKey = req.apiKey ?? req.userId ?? req.id;
    const limits = route.rateLimit ?? config.rateLimit;
    if (!rlCheck(rlKey, limits)) {
      rateLimited++;
      config.onBlocked?.(req, 'rate_limited');
      return respond(req, 429, { error: 'Rate limited' }, start);
    }

    // Feature flag
    if (route.featureFlag && !ffCheck(route.featureFlag, req.userId)) {
      featureGated++;
      config.onBlocked?.(req, 'feature_gated');
      return respond(req, 403, { error: 'Feature not available' }, start);
    }

    // Circuit breaker
    if (!cbCheck(req.route)) {
      circuitBroken++;
      config.onBlocked?.(req, 'circuit_open');
      return respond(req, 503, { error: 'Service temporarily unavailable' }, start);
    }

    // Cache check (GET only)
    if (req.method === 'GET' && route.cacheTtlMs) {
      const cacheKey = `${req.route}:${JSON.stringify(req.payload ?? {})}`;
      const cached = cacheGet(cacheKey);
      if (cached !== undefined) { cachedResponses++; return respond(req, 200, cached, start, true); }
    }

    // Execute
    const metrics = routeMetrics.get(req.route) ?? { calls: 0, totalLatency: 0, errors: 0 };
    try {
      const result = await route.handler(req);
      cbRecord(req.route, true);
      metrics.calls++;

      let body = result.body;
      if (route.transform) body = route.transform(body);
      if (result.costCents) { budgetRecord(result.costCents); }

      // Cache store
      if (req.method === 'GET' && route.cacheTtlMs) {
        cacheSet(`${req.route}:${JSON.stringify(req.payload ?? {})}`, body, route.cacheTtlMs);
      }

      const lat = Date.now() - start;
      metrics.totalLatency += lat;
      routeMetrics.set(req.route, metrics);
      return respond(req, result.status, body, start, false, result.costCents);
    } catch (err) {
      cbRecord(req.route, false);
      metrics.errors++;
      metrics.calls++;
      routeMetrics.set(req.route, metrics);
      return respond(req, 500, { error: err instanceof Error ? err.message : 'Internal error' }, start);
    }
  }

  function respond(req: GatewayRequest, status: number, body: unknown, start: number, cached = false, costCents?: number): GatewayResponse {
    const res: GatewayResponse = { status, body, cached, latencyMs: Date.now() - start, route: req.route, costCents };
    totalLatency += res.latencyMs;
    config.onResponse?.(req, res);
    return res;
  }

  function getStats(): GatewayStats {
    const rs: GatewayStats['routeStats'] = {};
    for (const [route, m] of routeMetrics) { rs[route] = { calls: m.calls, avgLatencyMs: m.calls > 0 ? m.totalLatency / m.calls : 0, errors: m.errors }; }
    return { totalRequests, cachedResponses, rateLimited, circuitBroken, featureGated, totalCostCents, avgLatencyMs: totalRequests > 0 ? totalLatency / totalRequests : 0, routeStats: rs };
  }

  return { registerRoute, setFeatureFlag, handle, getStats, rlPenalize };
}
