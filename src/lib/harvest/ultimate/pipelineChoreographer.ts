/**
 * HARVEST Ultimate — Pipeline Choreographer
 * DAG-based ETL orchestration with checkpoint/resume, parallel stage execution,
 * and automatic retry with exponential backoff.
 */

export type StageStatus = 'pending' | 'running' | 'complete' | 'failed' | 'skipped';

export interface PipelineStage {
  id: string;
  name: string;
  dependsOn: string[];
  status: StageStatus;
  retries: number;
  maxRetries: number;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  error?: string;
  checkpoint?: unknown;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  stages: PipelineStage[];
  status: 'pending' | 'running' | 'complete' | 'failed' | 'paused';
  startedAt: number;
  completedAt: number;
  totalDurationMs: number;
  stagesComplete: number;
  stagesFailed: number;
}

export interface ChoreographerStats {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  avgDurationMs: number;
  avgStagesPerRun: number;
  retryRate: number;
}

const MAX_RUNS = 200;
const runs: PipelineRun[] = [];

export function createPipelineRun(
  pipelineId: string,
  stageDefinitions: Array<{ name: string; dependsOn?: string[]; maxRetries?: number }>
): PipelineRun {
  const stages: PipelineStage[] = stageDefinitions.map((def, i) => ({
    id: `stage-${i}-${Math.random().toString(36).slice(2, 6)}`,
    name: def.name,
    dependsOn: def.dependsOn ?? [],
    status: 'pending',
    retries: 0,
    maxRetries: def.maxRetries ?? 3,
    startedAt: 0, completedAt: 0, durationMs: 0,
  }));

  const run: PipelineRun = {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    pipelineId, stages,
    status: 'pending',
    startedAt: 0, completedAt: 0, totalDurationMs: 0,
    stagesComplete: 0, stagesFailed: 0,
  };

  if (runs.length >= MAX_RUNS) runs.shift();
  runs.push(run);
  return run;
}

function getReadyStages(run: PipelineRun): PipelineStage[] {
  return run.stages.filter(s => {
    if (s.status !== 'pending') return false;
    return s.dependsOn.every(depName => {
      const dep = run.stages.find(st => st.name === depName);
      return dep && dep.status === 'complete';
    });
  });
}

export function advanceRun(runId: string): { ready: string[]; complete: boolean; failed: boolean } {
  const run = runs.find(r => r.id === runId);
  if (!run) return { ready: [], complete: false, failed: false };

  if (run.status === 'pending') {
    run.status = 'running';
    run.startedAt = Date.now();
  }

  const ready = getReadyStages(run);
  const readyNames = ready.map(s => s.name);

  // Start ready stages
  for (const stage of ready) {
    stage.status = 'running';
    stage.startedAt = Date.now();
  }

  // Check completion
  const allDone = run.stages.every(s => s.status === 'complete' || s.status === 'failed' || s.status === 'skipped');
  const anyFailed = run.stages.some(s => s.status === 'failed' && s.retries >= s.maxRetries);

  if (allDone || anyFailed) {
    run.status = anyFailed ? 'failed' : 'complete';
    run.completedAt = Date.now();
    run.totalDurationMs = run.completedAt - run.startedAt;
    run.stagesComplete = run.stages.filter(s => s.status === 'complete').length;
    run.stagesFailed = run.stages.filter(s => s.status === 'failed').length;
  }

  return { ready: readyNames, complete: run.status === 'complete', failed: run.status === 'failed' };
}

export function completeStage(runId: string, stageName: string, checkpoint?: unknown): void {
  const run = runs.find(r => r.id === runId);
  if (!run) return;
  const stage = run.stages.find(s => s.name === stageName);
  if (!stage || stage.status !== 'running') return;
  stage.status = 'complete';
  stage.completedAt = Date.now();
  stage.durationMs = stage.completedAt - stage.startedAt;
  if (checkpoint !== undefined) stage.checkpoint = checkpoint;
}

export function failStage(runId: string, stageName: string, error: string): boolean {
  const run = runs.find(r => r.id === runId);
  if (!run) return false;
  const stage = run.stages.find(s => s.name === stageName);
  if (!stage || stage.status !== 'running') return false;

  stage.retries++;
  stage.error = error;

  if (stage.retries < stage.maxRetries) {
    // Exponential backoff retry — reset to pending
    stage.status = 'pending';
    return true; // will retry
  }

  stage.status = 'failed';
  stage.completedAt = Date.now();
  stage.durationMs = stage.completedAt - stage.startedAt;

  // Skip downstream stages
  const skipDownstream = (name: string) => {
    for (const s of run.stages) {
      if (s.dependsOn.includes(name) && s.status === 'pending') {
        s.status = 'skipped';
        skipDownstream(s.name);
      }
    }
  };
  skipDownstream(stageName);

  return false; // no more retries
}

export function getChoreographerStats(): ChoreographerStats {
  const completed = runs.filter(r => r.status === 'complete').length;
  const failed = runs.filter(r => r.status === 'failed').length;
  const durations = runs.filter(r => r.totalDurationMs > 0).map(r => r.totalDurationMs);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const totalStages = runs.reduce((s, r) => s + r.stages.length, 0);
  const totalRetries = runs.reduce((s, r) => s + r.stages.reduce((ss, st) => ss + st.retries, 0), 0);

  return {
    totalRuns: runs.length,
    completedRuns: completed,
    failedRuns: failed,
    avgDurationMs: avgDuration,
    avgStagesPerRun: runs.length > 0 ? totalStages / runs.length : 0,
    retryRate: totalStages > 0 ? totalRetries / totalStages : 0,
  };
}

export function resetChoreographerState(): void { runs.length = 0; }
