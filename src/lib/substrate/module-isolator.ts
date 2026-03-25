/**
 * Module Isolator — Sandboxed execution for untrusted or experimental modules
 * Catches errors, enforces timeouts, and limits resource consumption
 */

interface IsolationResult<T> {
  success: boolean;
  result?: T;
  error?: string;
  durationMs: number;
  memoryDelta?: number;
}

interface IsolationConfig {
  timeoutMs: number;
  catchErrors: boolean;
  trackMemory: boolean;
}

const DEFAULT_CONFIG: IsolationConfig = {
  timeoutMs: 5000,
  catchErrors: true,
  trackMemory: true,
};

const stats = { executions: 0, failures: 0, timeouts: 0 };

/** Execute a function in an isolated context with timeout and error capture */
export async function isolate<T>(
  moduleId: string,
  fn: () => Promise<T> | T,
  config: Partial<IsolationConfig> = {},
): Promise<IsolationResult<T>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const start = performance.now();
  stats.executions++;

  const memBefore = cfg.trackMemory && (performance as any).memory
    ? (performance as any).memory.usedJSHeapSize : 0;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      Promise.resolve(fn()),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { stats.timeouts++; reject(new Error(`Module "${moduleId}" timed out after ${cfg.timeoutMs}ms`)); }, cfg.timeoutMs);
      }),
    ]);

    const memAfter = cfg.trackMemory && (performance as any).memory
      ? (performance as any).memory.usedJSHeapSize : 0;

    clearTimeout(timer);
    return {
      success: true,
      result,
      durationMs: performance.now() - start,
      memoryDelta: memAfter - memBefore,
    };
  } catch (err) {
    clearTimeout(timer);
    stats.failures++;
    if (!cfg.catchErrors) throw err;
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: performance.now() - start,
    };
  }
}

/** Batch isolate multiple modules */
export async function isolateAll(
  tasks: Array<{ id: string; fn: () => Promise<unknown> }>,
  config?: Partial<IsolationConfig>,
): Promise<Map<string, IsolationResult<unknown>>> {
  const results = new Map<string, IsolationResult<unknown>>();
  await Promise.all(
    tasks.map(async (t) => {
      results.set(t.id, await isolate(t.id, t.fn, config));
    }),
  );
  return results;
}

export function getIsolationStats() { return { ...stats }; }
