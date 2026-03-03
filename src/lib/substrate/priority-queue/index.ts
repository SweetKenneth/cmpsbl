/**
 * Priority Queue Engine
 * Weighted task scheduling for matrix nodes
 * 
 * CORE/CCR operations always preempt lower-priority overlay work under load.
 * Uses sector-based priority with configurable weights.
 */

import type { MatrixSector } from '@/lib/core/matrixNodeRegistry';

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low' | 'deferred';

export interface PriorityTask {
  id: string;
  nodeId: string;
  sector: MatrixSector;
  priority: TaskPriority;
  action: string;
  payload?: Record<string, unknown>;
  enqueuedAt: number;
  startedAt: number | null;
  completedAt: number | null;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'preempted';
}

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25,
  deferred: 10,
};

const SECTOR_BOOST: Record<MatrixSector, number> = {
  core: 30,
  system: 25,
  ccr: 20,
  ocg: 10,
  execution: 0,
  esz: -2,
  epz: -3,
  emz: -3,
  field: -5,
  plane: -5,
  shell: -5,
};

const queue: PriorityTask[] = [];
const completed: PriorityTask[] = [];
let maxConcurrent = 5;
let running = 0;

function effectivePriority(task: PriorityTask): number {
  return PRIORITY_WEIGHTS[task.priority] + (SECTOR_BOOST[task.sector] ?? 0);
}

function sortQueue(): void {
  queue.sort((a, b) => effectivePriority(b) - effectivePriority(a));
}

export function enqueue(
  nodeId: string,
  sector: MatrixSector,
  action: string,
  priority: TaskPriority = 'normal',
  payload?: Record<string, unknown>
): PriorityTask {
  const task: PriorityTask = {
    id: `pq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nodeId,
    sector,
    priority,
    action,
    payload,
    enqueuedAt: Date.now(),
    startedAt: null,
    completedAt: null,
    status: 'queued',
  };
  queue.push(task);
  sortQueue();
  return task;
}

export function dequeue(): PriorityTask | null {
  if (running >= maxConcurrent) return null;
  const task = queue.find(t => t.status === 'queued');
  if (!task) return null;
  task.status = 'running';
  task.startedAt = Date.now();
  running++;
  return task;
}

export function complete(taskId: string, success: boolean): void {
  const idx = queue.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  const task = queue[idx];
  task.status = success ? 'completed' : 'failed';
  task.completedAt = Date.now();
  running = Math.max(0, running - 1);
  queue.splice(idx, 1);
  completed.push(task);
  if (completed.length > 500) completed.splice(0, completed.length - 250);
}

export function preempt(taskId: string): boolean {
  const task = queue.find(t => t.id === taskId && t.status === 'running');
  if (!task) return false;
  task.status = 'preempted';
  running = Math.max(0, running - 1);
  return true;
}

export function getQueueState() {
  return {
    queued: queue.filter(t => t.status === 'queued').length,
    running,
    maxConcurrent,
    totalCompleted: completed.length,
    topPending: queue.filter(t => t.status === 'queued').slice(0, 10).map(t => ({
      id: t.id,
      nodeId: t.nodeId,
      priority: t.priority,
      sector: t.sector,
      effectivePriority: effectivePriority(t),
    })),
  };
}

export function setMaxConcurrent(max: number): void {
  maxConcurrent = Math.max(1, Math.min(50, max));
}

export function getCompletedTasks(limit = 20): PriorityTask[] {
  return completed.slice(-limit);
}

export function clearQueue(): number {
  const cleared = queue.filter(t => t.status === 'queued').length;
  queue.length = 0;
  running = 0;
  return cleared;
}
