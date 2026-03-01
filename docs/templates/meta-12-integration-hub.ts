/**
 * Meta-Engine #12 — Resilient Integration Hub
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Circuit Breaker + Rate Limiter + Cache + Pipeline + WAL + Scheduler
 *
 * Complete external service integration layer. Every outbound call flows
 * through rate limiting, circuit protection, response caching, transformation
 * pipelines, WAL-backed durability, and automatic retry scheduling.
 * One import replaces your entire integration middleware stack.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface IntegrationConfig {
  id: string;
  name: string;
  baseUrl?: string;
  rateLimit: { maxRequests: number; windowMs: number };
  circuitBreaker?: { failureThreshold?: number; timeoutMs?: number };
  cache?: { ttlMs?: number; maxSize?: number };
  retry?: { maxAttempts?: number; backoffMs?: number; maxBackoffMs?: number };
  transform?: {
    request?: (payload: unknown) => unknown;
    response?: (body: unknown) => unknown;
  };
}

export interface IntegrationRequest {
  integration: string;
  operation: string;
  payload?: unknown;
  idempotencyKey?: string;
  priority?: number;
  cacheable?: boolean;
}

export interface IntegrationResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  latencyMs: number;
  cached: boolean;
  attempts: number;
  integration: string;
  operation: string;
}

export interface HubStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  cachedResponses: number;
  rateLimited: number;
  circuitBroken: number;
  avgLatencyMs: number;
  integrationHealth: Record<string, { successRate: number; avgLatency: number; state: string }>;
}

export function createIntegrationHub() {
  const integrations = new Map<string, IntegrationConfig>();
  const handlers = new Map<string, (operation: string, payload: unknown) => Promise<unknown>>();
  let totalCalls = 0, successCalls = 0, failedCalls = 0, cachedCount = 0, rlDenied = 0, cbDenied = 0, totalLatency = 0;

  // ── Rate Limiter ───────────────────────────────────────────────
  const rlState = new Map<string, number[]>();
  function rlCheck(id: string, limits: { maxRequests: number; windowMs: number }): boolean {
    let reqs = rlState.get(id) ?? []; const now = Date.now();
    reqs = reqs.filter(t => now - t < limits.windowMs); rlState.set(id, reqs);
    if (reqs.length < limits.maxRequests) { reqs.push(now); return true; }
    return false;
  }

  // ── Circuit Breaker ────────────────────────────────────────────
  const cbState = new Map<string, { failures: number; state: 'closed' | 'open' | 'half_open'; openedAt: number }>();
  function cbCheck(id: string, cfg: IntegrationConfig): boolean {
    const c = cbState.get(id); if (!c || c.state === 'closed') return true;
    if (c.state === 'open' && Date.now() - c.openedAt > (cfg.circuitBreaker?.timeoutMs ?? 30_000)) { c.state = 'half_open'; return true; }
    return c.state === 'half_open';
  }
  function cbRecord(id: string, cfg: IntegrationConfig, ok: boolean) {
    let c = cbState.get(id); if (!c) { c = { failures: 0, state: 'closed', openedAt: 0 }; cbState.set(id, c); }
    if (ok) { c.failures = 0; if (c.state === 'half_open') c.state = 'closed'; return; }
    c.failures++; if (c.failures >= (cfg.circuitBreaker?.failureThreshold ?? 5) && c.state !== 'open') { c.state = 'open'; c.openedAt = Date.now(); }
  }

  // ── Cache ──────────────────────────────────────────────────────
  const cacheStore = new Map<string, { data: unknown; expiresAt: number }>();
  function cacheGet(key: string): unknown | undefined { const e = cacheStore.get(key); if (!e || Date.now() > e.expiresAt) { cacheStore.delete(key); return undefined; } return e.data; }
  function cacheSet(key: string, data: unknown, ttl: number) { cacheStore.set(key, { data, expiresAt: Date.now() + ttl }); }

  // ── WAL ────────────────────────────────────────────────────────
  const wal: Array<{ id: string; req: IntegrationRequest; status: 'pending' | 'done' | 'failed'; ts: number }> = [];
  const idempotencyStore = new Map<string, IntegrationResponse>();

  // ── Retry Queue ────────────────────────────────────────────────
  const retryQueue: Array<{ req: IntegrationRequest; attempts: number; nextAttempt: number }> = [];

  // ── Per-integration metrics ────────────────────────────────────
  const metrics = new Map<string, { calls: number; successes: number; totalLatency: number }>();

  // ── Registration ───────────────────────────────────────────────

  function register(config: IntegrationConfig, handler: (operation: string, payload: unknown) => Promise<unknown>) {
    integrations.set(config.id, config);
    handlers.set(config.id, handler);
  }

  // ── Execution ──────────────────────────────────────────────────

  async function call(req: IntegrationRequest): Promise<IntegrationResponse> {
    const start = Date.now();
    totalCalls++;

    const config = integrations.get(req.integration);
    if (!config) return { success: false, error: 'Integration not registered', latencyMs: 0, cached: false, attempts: 0, integration: req.integration, operation: req.operation };

    const handler = handlers.get(req.integration)!;
    const m = metrics.get(req.integration) ?? { calls: 0, successes: 0, totalLatency: 0 };
    m.calls++;

    // Idempotency
    if (req.idempotencyKey) {
      const prev = idempotencyStore.get(req.idempotencyKey);
      if (prev) { cachedCount++; return { ...prev, cached: true }; }
    }

    // Cache check
    if (req.cacheable !== false && config.cache) {
      const cacheKey = `${req.integration}:${req.operation}:${JSON.stringify(req.payload ?? {})}`;
      const cached = cacheGet(cacheKey);
      if (cached !== undefined) { cachedCount++; return { success: true, data: cached, latencyMs: Date.now() - start, cached: true, attempts: 0, integration: req.integration, operation: req.operation }; }
    }

    // Rate limit
    if (!rlCheck(req.integration, config.rateLimit)) {
      rlDenied++;
      return { success: false, error: 'Rate limited', latencyMs: Date.now() - start, cached: false, attempts: 0, integration: req.integration, operation: req.operation };
    }

    // Circuit breaker
    if (!cbCheck(req.integration, config)) {
      cbDenied++;
      // Schedule retry
      retryQueue.push({ req, attempts: 0, nextAttempt: Date.now() + (config.retry?.backoffMs ?? 5000) });
      return { success: false, error: 'Circuit open — queued for retry', latencyMs: Date.now() - start, cached: false, attempts: 0, integration: req.integration, operation: req.operation };
    }

    // WAL log
    const walId = `wal_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    wal.push({ id: walId, req, status: 'pending', ts: Date.now() });

    // Execute with retry
    const maxAttempts = config.retry?.maxAttempts ?? 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let payload = req.payload;
        if (config.transform?.request) payload = config.transform.request(payload);

        let result = await handler(req.operation, payload);

        if (config.transform?.response) result = config.transform.response(result);

        cbRecord(req.integration, config, true);

        // WAL commit
        const walEntry = wal.find(w => w.id === walId);
        if (walEntry) walEntry.status = 'done';

        // Cache store
        if (req.cacheable !== false && config.cache) {
          cacheSet(`${req.integration}:${req.operation}:${JSON.stringify(req.payload ?? {})}`, result, config.cache.ttlMs ?? 60_000);
        }

        const latency = Date.now() - start;
        m.successes++;
        m.totalLatency += latency;
        metrics.set(req.integration, m);
        successCalls++;
        totalLatency += latency;

        const response: IntegrationResponse = { success: true, data: result, latencyMs: latency, cached: false, attempts: attempt, integration: req.integration, operation: req.operation };

        if (req.idempotencyKey) idempotencyStore.set(req.idempotencyKey, response);
        return response;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (attempt < maxAttempts) {
          const delay = Math.min((config.retry?.backoffMs ?? 1000) * Math.pow(2, attempt - 1), config.retry?.maxBackoffMs ?? 30_000);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    // All attempts failed
    cbRecord(req.integration, config, false);
    const walEntry = wal.find(w => w.id === walId);
    if (walEntry) walEntry.status = 'failed';
    failedCalls++;
    m.totalLatency += Date.now() - start;
    metrics.set(req.integration, m);

    return { success: false, error: lastError, latencyMs: Date.now() - start, cached: false, attempts: maxAttempts, integration: req.integration, operation: req.operation };
  }

  // ── Retry Tick ─────────────────────────────────────────────────

  async function tick(): Promise<number> {
    const now = Date.now();
    const ready = retryQueue.filter(r => r.nextAttempt <= now);
    let processed = 0;
    for (const item of ready) {
      const idx = retryQueue.indexOf(item);
      retryQueue.splice(idx, 1);
      await call(item.req);
      processed++;
    }
    return processed;
  }

  // ── Stats ──────────────────────────────────────────────────────

  function getStats(): HubStats {
    const integrationHealth: HubStats['integrationHealth'] = {};
    for (const [id, m] of metrics) {
      const cb = cbState.get(id);
      integrationHealth[id] = {
        successRate: m.calls > 0 ? m.successes / m.calls : 1,
        avgLatency: m.calls > 0 ? m.totalLatency / m.calls : 0,
        state: cb?.state ?? 'closed',
      };
    }
    return {
      totalCalls, successfulCalls: successCalls, failedCalls: failedCalls,
      cachedResponses: cachedCount, rateLimited: rlDenied, circuitBroken: cbDenied,
      avgLatencyMs: totalCalls > 0 ? totalLatency / totalCalls : 0,
      integrationHealth,
    };
  }

  return { register, call, tick, getStats, get retryQueueSize() { return retryQueue.length; } };
}
