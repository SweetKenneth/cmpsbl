/**
 * ENCODE Module — Code Execution & Generation Intelligence
 * v9.1.0 ARCHITECT Epoch — Module #21, first-class substrate module
 * 
 * ENCODE is the substrate's code execution engine, receiving structured task packets
 * from DECODE (the human-facing intent router) and producing governed code artifacts.
 * ENCODE integrates bidirectionally with BRAIN for recall and writeback.
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TargetSurface = 'code' | 'ui' | 'docs' | 'db' | 'edge' | 'tests';

export interface EncodeTaskPacket {
  id: string;
  createdAt: string;
  intentSummary: string;
  targetSurface: TargetSurface;
  constraints: {
    destructiveAllowed: boolean;
    requiresApproval: boolean;
  };
  contextRefs: {
    brainKeys: string[];
    urls?: string[];
  };
  acceptance: string[];
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  result?: EncodeTaskResult;
}

export interface EncodeTaskResult {
  taskId: string;
  success: boolean;
  artifacts: EncodeArtifact[];
  learnings: string[];
  brainReceiptId?: string;
  completedAt: string;
  executionMs: number;
}

export interface EncodeArtifact {
  type: 'code' | 'diff' | 'doc' | 'schema' | 'test';
  filePath?: string;
  content: string;
  confidence: number;
  operation: 'create' | 'modify' | 'delete';
}

export interface EncodeModuleState {
  initialized: boolean;
  isRunning: boolean;
  totalTasksQueued: number;
  totalTasksCompleted: number;
  totalTasksFailed: number;
  lastRunAt: string | null;
  lastLearningReportId: string | null;
  taskQueue: EncodeTaskPacket[];
  receipts: EncodeTaskResult[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const state: EncodeModuleState = {
  initialized: false,
  isRunning: false,
  totalTasksQueued: 0,
  totalTasksCompleted: 0,
  totalTasksFailed: 0,
  lastRunAt: null,
  lastLearningReportId: null,
  taskQueue: [],
  receipts: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════

export function initEncode(): void {
  emitStarted('encode', 'init', {});
  state.initialized = true;
  emitSucceeded('encode', 'init', { module: 'encode', role: 'code_execution_engine' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function enqueueTask(packet: Omit<EncodeTaskPacket, 'id' | 'createdAt' | 'status'>): EncodeTaskPacket {
  const task: EncodeTaskPacket = {
    ...packet,
    id: `enc-${Date.now()}-${state.totalTasksQueued}`,
    createdAt: new Date().toISOString(),
    status: 'queued',
  };
  state.taskQueue.push(task);
  state.totalTasksQueued++;
  emit({ module: 'encode', event_type: 'task_queued', outcome: 'succeeded', data: { taskId: task.id, surface: task.targetSurface } });
  return task;
}

export function getTaskQueue(): EncodeTaskPacket[] {
  return [...state.taskQueue];
}

export function getReceipts(limit?: number): EncodeTaskResult[] {
  return limit ? state.receipts.slice(-limit) : [...state.receipts];
}

export function completeTask(taskId: string, result: Omit<EncodeTaskResult, 'taskId'>): EncodeTaskResult {
  const task = state.taskQueue.find(t => t.id === taskId);
  const receipt: EncodeTaskResult = { ...result, taskId };
  
  if (task) {
    task.status = result.success ? 'completed' : 'failed';
    task.result = receipt;
  }
  
  state.receipts.push(receipt);
  if (result.success) {
    state.totalTasksCompleted++;
  } else {
    state.totalTasksFailed++;
  }
  state.lastRunAt = new Date().toISOString();
  
  emit({ 
    module: 'encode', 
    event_type: result.success ? 'task_completed' : 'task_failed', 
    outcome: result.success ? 'succeeded' : 'failed', 
    data: { taskId, artifacts: result.artifacts.length, learnings: result.learnings.length } 
  });
  
  return receipt;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE & HEALTH
// ═══════════════════════════════════════════════════════════════════════════════

export function getEncodeState(): EncodeModuleState {
  return { ...state, taskQueue: [...state.taskQueue], receipts: [...state.receipts] };
}

export function getEncodeHealth(): number {
  if (!state.initialized) return 0;
  const total = state.totalTasksCompleted + state.totalTasksFailed;
  if (total === 0) return 100;
  return Math.round((state.totalTasksCompleted / total) * 100);
}
