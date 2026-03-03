/**
 * Context Hydration Engine — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Parallel context assembly from multiple sources
 * with timeout guards and priority weighting.
 * 
 * Consumers: BRAIN, NEXUS, DREAM, ORACLE
 * Origin: simnapScheduler.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export interface ContextSource {
  id: string;
  name: string;
  /** Priority 1-10 (10 = highest) */
  priority: number;
  /** Fetch function that returns context data */
  fetch: () => Promise<ContextFragment>;
  /** Timeout for this source (ms) */
  timeoutMs: number;
  /** Whether this source is required (failure = overall failure) */
  required: boolean;
}

export interface ContextFragment {
  sourceId: string;
  data: Record<string, unknown>;
  tokens?: number;
  freshness: 'live' | 'cached' | 'stale';
}

export interface HydratedContext {
  fragments: ContextFragment[];
  totalTokens: number;
  sources: {
    succeeded: string[];
    failed: string[];
    timedOut: string[];
  };
  hydrationTime: number;
  complete: boolean;
}

export interface HydrationConfig {
  /** Max total time for all sources (ms) */
  maxTotalTimeMs: number;
  /** Max total tokens to assemble */
  maxTokens: number;
  /** Whether to continue if a required source fails */
  failOnRequired: boolean;
}

// ── Default Config ────────────────────────────────────────────────

export const DEFAULT_HYDRATION_CONFIG: HydrationConfig = {
  maxTotalTimeMs: 5000,
  maxTokens: 32000,
  failOnRequired: true,
};

// ── Hydration Engine ──────────────────────────────────────────────

/**
 * Race a promise against a timeout
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Context source '${label}' timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
    promise
      .then(val => { clearTimeout(timer); resolve(val); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

/**
 * Hydrate context from multiple sources in parallel
 * Sources are fetched concurrently with individual timeouts,
 * then assembled in priority order up to the token budget.
 */
export async function hydrateContext(
  sources: ContextSource[],
  config: HydrationConfig = DEFAULT_HYDRATION_CONFIG
): Promise<HydratedContext> {
  const start = performance.now();
  const succeeded: string[] = [];
  const failed: string[] = [];
  const timedOut: string[] = [];
  const fragments: ContextFragment[] = [];

  // Sort by priority descending so high-priority sources fill first
  const sorted = [...sources].sort((a, b) => b.priority - a.priority);

  // Fetch all sources in parallel with individual timeouts
  const results = await Promise.allSettled(
    sorted.map(source =>
      withTimeout(source.fetch(), Math.min(source.timeoutMs, config.maxTotalTimeMs), source.name)
        .then(fragment => ({ source, fragment, status: 'ok' as const }))
        .catch(err => {
          const isTimeout = err.message?.includes('timed out');
          return { source, error: err, status: isTimeout ? 'timeout' as const : 'error' as const };
        })
    )
  );

  // Assemble results respecting token budget
  let totalTokens = 0;

  for (const result of results) {
    if (result.status === 'rejected') continue;

    const val = result.value;
    if (val.status === 'ok') {
      const frag = val.fragment;
      const fragTokens = frag.tokens ?? estimateTokens(frag.data);

      if (totalTokens + fragTokens <= config.maxTokens) {
        fragments.push(frag);
        totalTokens += fragTokens;
        succeeded.push(val.source.id);
      } else {
        // Token budget exceeded — skip lower priority sources
        failed.push(val.source.id);
      }
    } else if (val.status === 'timeout') {
      timedOut.push(val.source.id);
    } else {
      failed.push(val.source.id);
    }
  }

  // Check required sources
  const requiredSources = sorted.filter(s => s.required);
  const missingRequired = requiredSources.filter(
    s => !succeeded.includes(s.id)
  );

  const complete = config.failOnRequired
    ? missingRequired.length === 0
    : true;

  return {
    fragments,
    totalTokens,
    sources: { succeeded, failed, timedOut },
    hydrationTime: performance.now() - start,
    complete,
  };
}

/**
 * Rough token estimate from data size
 */
function estimateTokens(data: Record<string, unknown>): number {
  const json = JSON.stringify(data);
  return Math.ceil(json.length / 4); // ~4 chars per token
}

/**
 * Create a context source from a simple async function
 */
export function createContextSource(
  id: string,
  name: string,
  fetch: () => Promise<Record<string, unknown>>,
  opts: Partial<Pick<ContextSource, 'priority' | 'timeoutMs' | 'required'>> = {}
): ContextSource {
  return {
    id,
    name,
    priority: opts.priority ?? 5,
    timeoutMs: opts.timeoutMs ?? 3000,
    required: opts.required ?? false,
    fetch: async () => ({
      sourceId: id,
      data: await fetch(),
      freshness: 'live' as const,
    }),
  };
}

/**
 * Create a cached context source that serves stale data after first fetch
 */
export function createCachedContextSource(
  id: string,
  name: string,
  fetch: () => Promise<Record<string, unknown>>,
  cacheTtlMs: number = 60_000,
  opts: Partial<Pick<ContextSource, 'priority' | 'timeoutMs' | 'required'>> = {}
): ContextSource {
  let cache: { data: Record<string, unknown>; fetchedAt: number } | null = null;

  return {
    id,
    name,
    priority: opts.priority ?? 5,
    timeoutMs: opts.timeoutMs ?? 3000,
    required: opts.required ?? false,
    fetch: async () => {
      const now = Date.now();
      if (cache && now - cache.fetchedAt < cacheTtlMs) {
        return { sourceId: id, data: cache.data, freshness: 'cached' as const };
      }

      try {
        const data = await fetch();
        cache = { data, fetchedAt: now };
        return { sourceId: id, data, freshness: 'live' as const };
      } catch {
        if (cache) {
          return { sourceId: id, data: cache.data, freshness: 'stale' as const };
        }
        throw new Error(`Context source '${name}' failed with no cache`);
      }
    },
  };
}
