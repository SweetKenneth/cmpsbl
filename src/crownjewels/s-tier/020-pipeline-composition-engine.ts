/**
 * S-Tier Crown Jewel #11 — Pipeline Composition Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 11 | CJPI: 95 | Version: 1.0.0
 * Module: CORTEX | Type: Architecture
 * Signature: 4d517b3a
 *
 * Composable pipeline builder with typed stage connections,
 * backpressure control, and parallel/sequential execution modes.
 */

type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

interface PipelineStage<TIn = unknown, TOut = unknown> {
  id: string;
  name: string;
  execute: (input: TIn, ctx: StageContext) => Promise<TOut>;
  retries?: number;
  timeoutMs?: number;
  condition?: (input: TIn) => boolean;
}

interface StageContext {
  pipelineId: string;
  stageIndex: number;
  totalStages: number;
  startedAt: number;
  metadata: Record<string, unknown>;
  signal: AbortSignal;
}

interface StageResult<T = unknown> {
  stageId: string;
  status: StageStatus;
  output?: T;
  error?: string;
  durationMs: number;
  retryCount: number;
}

interface PipelineResult<T = unknown> {
  pipelineId: string;
  success: boolean;
  output?: T;
  stages: StageResult[];
  totalDurationMs: number;
  completedAt: string;
}

export function createPipeline(pipelineId: string) {
  const stages: PipelineStage[] = [];
  let backpressureThreshold = 100; // max concurrent items
  let activeCount = 0;

  function addStage<TIn, TOut>(stage: PipelineStage<TIn, TOut>) {
    stages.push(stage as PipelineStage);
    return api;
  }

  function setBackpressure(threshold: number) {
    backpressureThreshold = threshold;
    return api;
  }

  async function execute<TIn, TOut>(input: TIn, signal?: AbortSignal): Promise<PipelineResult<TOut>> {
    const startTime = performance.now();
    const controller = new AbortController();
    const effectiveSignal = signal ?? controller.signal;
    const stageResults: StageResult[] = [];
    let currentOutput: unknown = input;
    let success = true;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];

      if (effectiveSignal.aborted) {
        stageResults.push({
          stageId: stage.id, status: 'skipped', durationMs: 0, retryCount: 0,
        });
        continue;
      }

      // Condition check
      if (stage.condition && !stage.condition(currentOutput)) {
        stageResults.push({
          stageId: stage.id, status: 'skipped', durationMs: 0, retryCount: 0,
        });
        continue;
      }

      // Backpressure wait
      while (activeCount >= backpressureThreshold) {
        await new Promise(r => setTimeout(r, 10));
      }

      const ctx: StageContext = {
        pipelineId,
        stageIndex: i,
        totalStages: stages.length,
        startedAt: performance.now(),
        metadata: {},
        signal: effectiveSignal,
      };

      const maxRetries = stage.retries ?? 0;
      let retryCount = 0;
      let stageOutput: unknown;
      let stageError: string | undefined;
      let stageStatus: StageStatus = 'pending';
      const stageStart = performance.now();

      activeCount++;

      while (retryCount <= maxRetries) {
        try {
          stageStatus = 'running';

          if (stage.timeoutMs) {
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Stage '${stage.id}' timed out after ${stage.timeoutMs}ms`)), stage.timeoutMs)
            );
            stageOutput = await Promise.race([
              stage.execute(currentOutput, ctx),
              timeoutPromise,
            ]);
          } else {
            stageOutput = await stage.execute(currentOutput, ctx);
          }

          stageStatus = 'completed';
          stageError = undefined;
          break;
        } catch (err) {
          stageError = err instanceof Error ? err.message : String(err);
          retryCount++;
          if (retryCount > maxRetries) {
            stageStatus = 'failed';
            success = false;
          }
        }
      }

      activeCount--;

      stageResults.push({
        stageId: stage.id,
        status: stageStatus,
        output: stageOutput,
        error: stageError,
        durationMs: performance.now() - stageStart,
        retryCount,
      });

      if (!success) break;
      currentOutput = stageOutput;
    }

    return {
      pipelineId,
      success,
      output: currentOutput as TOut,
      stages: stageResults,
      totalDurationMs: performance.now() - startTime,
      completedAt: new Date().toISOString(),
    };
  }

  async function executeParallel<TIn>(
    inputs: TIn[],
    signal?: AbortSignal
  ): Promise<PipelineResult[]> {
    return Promise.all(inputs.map(input => execute(input, signal)));
  }

  const api = {
    addStage,
    setBackpressure,
    execute,
    executeParallel,
    getStageCount: () => stages.length,
    getStageIds: () => stages.map(s => s.id),
  };

  return api;
}
