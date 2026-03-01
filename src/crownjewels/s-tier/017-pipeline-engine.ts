/**
 * S-Tier Crown Jewel #17 — DECODE Pipeline Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 17 | CJPI: 92 | Module: DECODE | Type: Architecture
 *
 * Composable async data transformation pipelines with branching,
 * error recovery, parallel stages, tap/inspect, retry, and
 * execution telemetry. Unix-pipe philosophy for TypeScript.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface StageResult<T> {
  value: T;
  stageName: string;
  durationMs: number;
  retries: number;
}

export interface PipelineStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  avgDurationMs: number;
  stageTimings: Record<string, { avg: number; max: number; min: number; runs: number }>;
}

interface Stage<TIn, TOut> {
  name: string;
  transform: (input: TIn) => TOut | Promise<TOut>;
  onError?: (error: Error, input: TIn) => TOut | Promise<TOut>;
  retries?: number;
  retryDelayMs?: number;
  condition?: (input: TIn) => boolean;
}

export function createPipeline<TInitial>(name: string) {
  const stages: Stage<any, any>[] = [];
  const taps: Array<{ after: string; fn: (value: any) => void }> = [];
  const runs: Array<{ success: boolean; durationMs: number }> = [];
  const stageMetrics = new Map<string, number[]>();

  // ── Builder ──────────────────────────────────────────────────────

  function pipe<TIn, TOut>(
    stageName: string,
    transform: (input: TIn) => TOut | Promise<TOut>,
    opts?: { onError?: (err: Error, input: TIn) => TOut | Promise<TOut>; retries?: number; retryDelayMs?: number; condition?: (input: TIn) => boolean },
  ) {
    stages.push({ name: stageName, transform, ...opts });
    return builder;
  }

  function tap(afterStage: string, fn: (value: any) => void) {
    taps.push({ after: afterStage, fn });
    return builder;
  }

  function branch<T>(
    stageName: string,
    predicate: (input: T) => boolean,
    ifTrue: (input: T) => T | Promise<T>,
    ifFalse: (input: T) => T | Promise<T>,
  ) {
    stages.push({
      name: stageName,
      transform: async (input: T) => predicate(input) ? ifTrue(input) : ifFalse(input),
    });
    return builder;
  }

  function parallel<T>(
    stageName: string,
    fns: Array<(input: T) => unknown | Promise<unknown>>,
    merge: (results: unknown[], input: T) => T | Promise<T>,
  ) {
    stages.push({
      name: stageName,
      transform: async (input: T) => {
        const results = await Promise.all(fns.map(fn => fn(input)));
        return merge(results, input);
      },
    });
    return builder;
  }

  // ── Execution ────────────────────────────────────────────────────

  async function execute(input: TInitial): Promise<{ result: any; stages: StageResult<any>[]; durationMs: number }> {
    const pipelineStart = Date.now();
    let current: any = input;
    const stageResults: StageResult<any>[] = [];

    for (const stage of stages) {
      if (stage.condition && !stage.condition(current)) {
        stageResults.push({ value: current, stageName: stage.name, durationMs: 0, retries: 0 });
        continue;
      }

      const stageStart = Date.now();
      let retries = 0;
      const maxRetries = stage.retries ?? 0;

      while (true) {
        try {
          current = await stage.transform(current);
          break;
        } catch (err) {
          retries++;
          if (retries > maxRetries) {
            if (stage.onError) {
              current = await stage.onError(err instanceof Error ? err : new Error(String(err)), current);
              break;
            }
            runs.push({ success: false, durationMs: Date.now() - pipelineStart });
            throw err;
          }
          if (stage.retryDelayMs) await new Promise(r => setTimeout(r, stage.retryDelayMs! * retries));
        }
      }

      const stageDuration = Date.now() - stageStart;
      stageResults.push({ value: current, stageName: stage.name, durationMs: stageDuration, retries });

      if (!stageMetrics.has(stage.name)) stageMetrics.set(stage.name, []);
      stageMetrics.get(stage.name)!.push(stageDuration);

      // Run taps
      for (const t of taps) { if (t.after === stage.name) t.fn(current); }
    }

    const totalDuration = Date.now() - pipelineStart;
    runs.push({ success: true, durationMs: totalDuration });
    return { result: current, stages: stageResults, durationMs: totalDuration };
  }

  // ── Stats ────────────────────────────────────────────────────────

  function getStats(): PipelineStats {
    const successful = runs.filter(r => r.success);
    const stageTimings: PipelineStats['stageTimings'] = {};
    for (const [name, times] of stageMetrics) {
      stageTimings[name] = {
        avg: times.reduce((a, b) => a + b, 0) / times.length,
        max: Math.max(...times),
        min: Math.min(...times),
        runs: times.length,
      };
    }
    return {
      totalRuns: runs.length,
      successfulRuns: successful.length,
      failedRuns: runs.length - successful.length,
      avgDurationMs: successful.length > 0 ? successful.reduce((a, b) => a + b.durationMs, 0) / successful.length : 0,
      stageTimings,
    };
  }

  const builder = { pipe, tap, branch, parallel, execute, getStats, get stageCount() { return stages.length; } };
  return builder;
}
