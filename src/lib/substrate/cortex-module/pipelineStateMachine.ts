/**
 * CORTEX — Pipeline State Machine
 * Deterministic state transitions: QUEUED → RUNNING → DONE/FAILED
 */

export type PipelineState = 'QUEUED' | 'VALIDATING' | 'RUNNING' | 'PAUSED' | 'DONE' | 'FAILED' | 'CANCELLED';

export interface PipelineTransition {
  from: PipelineState;
  to: PipelineState;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface PipelineInstance {
  id: string;
  name: string;
  state: PipelineState;
  transitions: PipelineTransition[];
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  maxRetries: number;
  error?: string;
}

const VALID_TRANSITIONS: Record<PipelineState, PipelineState[]> = {
  QUEUED: ['VALIDATING', 'CANCELLED'],
  VALIDATING: ['RUNNING', 'FAILED', 'CANCELLED'],
  RUNNING: ['DONE', 'FAILED', 'PAUSED', 'CANCELLED'],
  PAUSED: ['RUNNING', 'CANCELLED'],
  DONE: [],
  FAILED: ['QUEUED'], // retry
  CANCELLED: [],
};

export function createPipeline(id: string, name: string, maxRetries = 3): PipelineInstance {
  const now = new Date().toISOString();
  return {
    id,
    name,
    state: 'QUEUED',
    transitions: [{ from: 'QUEUED', to: 'QUEUED', timestamp: now, reason: 'Created' }],
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
    maxRetries,
  };
}

export function transitionPipeline(
  pipeline: PipelineInstance,
  to: PipelineState,
  reason?: string
): PipelineInstance {
  const allowed = VALID_TRANSITIONS[pipeline.state];
  if (!allowed.includes(to)) {
    throw new Error(
      `Invalid transition: ${pipeline.state} → ${to} for pipeline ${pipeline.id}`
    );
  }

  const now = new Date().toISOString();
  const transition: PipelineTransition = {
    from: pipeline.state,
    to,
    timestamp: now,
    reason,
  };

  const retryCount = to === 'QUEUED' && pipeline.state === 'FAILED'
    ? pipeline.retryCount + 1
    : pipeline.retryCount;

  if (retryCount > pipeline.maxRetries) {
    throw new Error(`Max retries (${pipeline.maxRetries}) exceeded for pipeline ${pipeline.id}`);
  }

  return {
    ...pipeline,
    state: to,
    transitions: [...pipeline.transitions, transition],
    updatedAt: now,
    retryCount,
    error: to === 'FAILED' ? reason : pipeline.error,
  };
}

export function isTerminal(state: PipelineState): boolean {
  return VALID_TRANSITIONS[state].length === 0 ||
    (state === 'FAILED'); // can retry but is effectively terminal until retried
}

export function getPipelineDuration(pipeline: PipelineInstance): number {
  const start = new Date(pipeline.createdAt).getTime();
  const end = new Date(pipeline.updatedAt).getTime();
  return end - start;
}

export function canRetry(pipeline: PipelineInstance): boolean {
  return pipeline.state === 'FAILED' && pipeline.retryCount < pipeline.maxRetries;
}
