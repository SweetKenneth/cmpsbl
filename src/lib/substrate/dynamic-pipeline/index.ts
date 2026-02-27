/**
 * Dynamic Pipeline Composition
 * Runtime-composable execution pipelines
 * 
 * Allows operators to compose pipelines from registered stages
 * at runtime, enabling adaptive workflow construction.
 */

export interface PipelineStage {
  id: string;
  name: string;
  moduleId: string;
  handler: string;
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  timeoutMs: number;
  retries: number;
}

export interface ComposedPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  mode: 'sequential' | 'parallel' | 'adaptive';
  status: 'draft' | 'validated' | 'active' | 'archived';
  createdAt: number;
  lastRunAt: number | null;
  runCount: number;
}

export interface PipelineRunResult {
  pipelineId: string;
  runId: string;
  status: 'success' | 'partial' | 'failed';
  stageResults: Array<{
    stageId: string;
    status: 'success' | 'skipped' | 'failed';
    durationMs: number;
    output: unknown;
    error: string | null;
  }>;
  totalDurationMs: number;
  completedAt: number;
}

const stageRegistry = new Map<string, PipelineStage>();
const pipelines = new Map<string, ComposedPipeline>();
const runHistory: PipelineRunResult[] = [];

/**
 * Register a pipeline stage
 */
export function registerStage(stage: PipelineStage): PipelineStage {
  stageRegistry.set(stage.id, stage);
  return stage;
}

/**
 * Compose a pipeline from stages
 */
export function composePipeline(
  name: string,
  stageIds: string[],
  mode: ComposedPipeline['mode'] = 'sequential'
): ComposedPipeline | null {
  const stages = stageIds.map(id => stageRegistry.get(id)).filter(Boolean) as PipelineStage[];
  if (stages.length !== stageIds.length) return null;

  const pipeline: ComposedPipeline = {
    id: `pipeline-${Date.now()}`,
    name,
    stages,
    mode,
    status: 'draft',
    createdAt: Date.now(),
    lastRunAt: null,
    runCount: 0,
  };

  pipelines.set(pipeline.id, pipeline);
  return pipeline;
}

/**
 * Validate pipeline compatibility (output→input schema matching)
 */
export function validatePipeline(pipelineId: string): { valid: boolean; errors: string[] } {
  const pipeline = pipelines.get(pipelineId);
  if (!pipeline) return { valid: false, errors: ['Pipeline not found'] };

  const errors: string[] = [];

  if (pipeline.mode === 'sequential') {
    for (let i = 1; i < pipeline.stages.length; i++) {
      const prev = pipeline.stages[i - 1];
      const curr = pipeline.stages[i];
      const outputKeys = Object.keys(prev.outputSchema);
      const inputKeys = Object.keys(curr.inputSchema);
      const missing = inputKeys.filter(k => !outputKeys.includes(k));
      if (missing.length > 0) {
        errors.push(`Stage ${curr.id} missing inputs: ${missing.join(', ')} (from ${prev.id})`);
      }
    }
  }

  if (errors.length === 0) {
    pipeline.status = 'validated';
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Simulate a pipeline run
 */
export function simulateRun(pipelineId: string): PipelineRunResult | null {
  const pipeline = pipelines.get(pipelineId);
  if (!pipeline) return null;

  const stageResults = pipeline.stages.map(stage => ({
    stageId: stage.id,
    status: 'success' as const,
    durationMs: Math.floor(Math.random() * 500) + 50,
    output: {},
    error: null,
  }));

  const result: PipelineRunResult = {
    pipelineId,
    runId: `run-${Date.now()}`,
    status: 'success',
    stageResults,
    totalDurationMs: stageResults.reduce((sum, r) => sum + r.durationMs, 0),
    completedAt: Date.now(),
  };

  pipeline.runCount++;
  pipeline.lastRunAt = Date.now();
  runHistory.push(result);
  return result;
}

/** Get all pipelines */
export function getPipelines(): ComposedPipeline[] {
  return Array.from(pipelines.values());
}

/** Get registered stages */
export function getRegisteredStages(): PipelineStage[] {
  return Array.from(stageRegistry.values());
}

/** Get run history */
export function getRunHistory(): PipelineRunResult[] {
  return [...runHistory];
}
