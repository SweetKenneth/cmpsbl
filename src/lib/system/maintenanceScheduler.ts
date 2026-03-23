/**
 * Maintenance Window Scheduler — SYSTEM v9.0.0
 * Coordinates non-disruptive repair windows, batching low-priority
 * repairs during idle periods and prioritizing critical fixes.
 */

// --- Types ---

export type RepairPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RepairTask {
  id: string;
  subsystem: string;
  description: string;
  priority: RepairPriority;
  estimatedDurationMs: number;
  createdAt: number;
  scheduledFor?: number;
  executedAt?: number;
  status: 'pending' | 'scheduled' | 'executing' | 'completed' | 'failed';
  result?: string;
}

export interface MaintenanceWindow {
  id: string;
  startTime: number;
  endTime: number;
  tasks: string[]; // task IDs
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  totalDurationMs: number;
}

export interface SchedulerConfig {
  maxWindowDurationMs: number;
  idleThresholdMs: number; // How long system must be idle to trigger window
  criticalBypassWindow: boolean; // Critical tasks bypass window scheduling
  maxConcurrentTasks: number;
  batchLowPriority: boolean;
}

// --- Constants ---

const DEFAULT_CONFIG: SchedulerConfig = {
  maxWindowDurationMs: 5 * 60_000, // 5 min
  idleThresholdMs: 60_000, // 1 min idle
  criticalBypassWindow: true,
  maxConcurrentTasks: 3,
  batchLowPriority: true,
};

const MAX_TASKS = 500;
const MAX_WINDOWS = 100;

const PRIORITY_ORDER: Record<RepairPriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

// --- State ---

const tasks: Map<string, RepairTask> = new Map();
const windows: MaintenanceWindow[] = [];
let config = { ...DEFAULT_CONFIG };
let lastActivityTimestamp = Date.now();

// --- Core ---

export function setSchedulerConfig(updates: Partial<SchedulerConfig>): void {
  config = { ...config, ...updates };
}

export function recordActivity(): void {
  lastActivityTimestamp = Date.now();
}

export function getIdleDuration(): number {
  return Date.now() - lastActivityTimestamp;
}

export function isSystemIdle(): boolean {
  return getIdleDuration() >= config.idleThresholdMs;
}

export function submitRepairTask(task: Omit<RepairTask, 'status' | 'createdAt'>): RepairTask {
  const full: RepairTask = {
    ...task,
    createdAt: Date.now(),
    status: 'pending',
  };

  tasks.set(full.id, full);

  // Bound tasks
  if (tasks.size > MAX_TASKS) {
    const completed = [...tasks.values()]
      .filter(t => t.status === 'completed' || t.status === 'failed')
      .sort((a, b) => (a.executedAt ?? a.createdAt) - (b.executedAt ?? b.createdAt));
    for (const old of completed.slice(0, tasks.size - MAX_TASKS)) {
      tasks.delete(old.id);
    }
  }

  // Critical tasks get immediate scheduling
  if (full.priority === 'critical' && config.criticalBypassWindow) {
    full.status = 'scheduled';
    full.scheduledFor = Date.now();
  }

  return { ...full };
}

export function scheduleMaintenanceWindow(): MaintenanceWindow | null {
  const pending = [...tasks.values()]
    .filter(t => t.status === 'pending')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  if (pending.length === 0) return null;

  const now = Date.now();
  let totalDuration = 0;
  const selectedTaskIds: string[] = [];

  for (const task of pending) {
    if (totalDuration + task.estimatedDurationMs > config.maxWindowDurationMs) break;
    task.status = 'scheduled';
    task.scheduledFor = now;
    selectedTaskIds.push(task.id);
    totalDuration += task.estimatedDurationMs;
  }

  if (selectedTaskIds.length === 0) return null;

  const window: MaintenanceWindow = {
    id: `mw_${now}_${Math.random().toString(36).slice(2, 6)}`,
    startTime: now,
    endTime: now + totalDuration,
    tasks: selectedTaskIds,
    status: 'scheduled',
    totalDurationMs: totalDuration,
  };

  windows.push(window);
  if (windows.length > MAX_WINDOWS) windows.splice(0, windows.length - MAX_WINDOWS);

  return window;
}

export function executeWindow(windowId: string): {
  completed: string[];
  failed: string[];
} {
  const window = windows.find(w => w.id === windowId);
  if (!window || window.status !== 'scheduled') return { completed: [], failed: [] };

  window.status = 'active';
  const completed: string[] = [];
  const failed: string[] = [];

  for (const taskId of window.tasks) {
    const task = tasks.get(taskId);
    if (!task) continue;

    task.status = 'executing';
    task.executedAt = Date.now();

    // Simulate execution (in production, this would call actual repair functions)
    task.status = 'completed';
    task.result = 'Executed successfully';
    completed.push(taskId);
  }

  window.status = 'completed';
  return { completed, failed };
}

export function getPendingTasks(): RepairTask[] {
  return [...tasks.values()]
    .filter(t => t.status === 'pending' || t.status === 'scheduled')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .map(t => ({ ...t }));
}

export function getCriticalTasks(): RepairTask[] {
  return [...tasks.values()]
    .filter(t => t.priority === 'critical' && t.status !== 'completed' && t.status !== 'failed')
    .map(t => ({ ...t }));
}

export function getTask(taskId: string): RepairTask | null {
  const t = tasks.get(taskId);
  return t ? { ...t } : null;
}

export function getWindows(): MaintenanceWindow[] {
  return [...windows];
}

export function getActiveWindow(): MaintenanceWindow | null {
  return windows.find(w => w.status === 'active') ?? null;
}

export function cancelWindow(windowId: string): boolean {
  const window = windows.find(w => w.id === windowId);
  if (!window || window.status !== 'scheduled') return false;

  window.status = 'cancelled';
  for (const taskId of window.tasks) {
    const task = tasks.get(taskId);
    if (task && task.status === 'scheduled') {
      task.status = 'pending';
      task.scheduledFor = undefined;
    }
  }

  return true;
}

export function clearSchedulerState(): void {
  tasks.clear();
  windows.length = 0;
  config = { ...DEFAULT_CONFIG };
  lastActivityTimestamp = Date.now();
}
