/**
 * ENGINEER — Maintenance Window Optimizer
 * Identifies optimal repair windows by analyzing system load patterns.
 * Batches compatible repairs and respects governance mode constraints.
 * @module engineer/maintenanceWindowOptimizer
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type GovernanceMode = 'LOCKDOWN' | 'ACTIVE' | 'OBSERVE' | 'EVOLVE';

export interface RepairTask {
  id: string;
  name: string;
  estimatedDurationMs: number;
  priority: number;          // 1–10
  nodeId: string;
  requiresDowntime: boolean;
  compatibleWith: string[];  // task IDs that can run in parallel
}

export interface MaintenanceWindow {
  startHour: number;         // 0–23
  dayOfWeek: number;         // 0=Sun, 6=Sat
  loadScore: number;         // 0–100 (lower = better for maintenance)
  available: boolean;
}

export interface ScheduledBatch {
  window: MaintenanceWindow;
  tasks: RepairTask[];
  totalDurationMs: number;
  batchScore: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const LOW_LOAD_THRESHOLD = 30;
const MAX_TASKS_PER_BATCH = 5;
const GOVERNANCE_CAPS: Record<GovernanceMode, number> = {
  LOCKDOWN: 0,    // no maintenance
  OBSERVE: 1,     // 1 task max
  ACTIVE: 3,
  EVOLVE: MAX_TASKS_PER_BATCH,
};

// ── State ──────────────────────────────────────────────────────────────────

const loadGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(50));

// ── Core ───────────────────────────────────────────────────────────────────

export function updateLoadProfile(dayOfWeek: number, hour: number, loadScore: number): void {
  if (dayOfWeek >= 0 && dayOfWeek < 7 && hour >= 0 && hour < 24) {
    loadGrid[dayOfWeek][hour] = Math.max(0, Math.min(100, loadScore));
  }
}

export function importWeeklyProfile(profile: Array<{ dayOfWeek: number; hour: number; expectedLoad: number }>): void {
  for (const entry of profile) {
    updateLoadProfile(entry.dayOfWeek, entry.hour, entry.expectedLoad);
  }
}

export function findOptimalWindows(count = 5): MaintenanceWindow[] {
  const windows: MaintenanceWindow[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      windows.push({
        startHour: hour,
        dayOfWeek: day,
        loadScore: loadGrid[day][hour],
        available: loadGrid[day][hour] < LOW_LOAD_THRESHOLD,
      });
    }
  }

  return windows
    .filter(w => w.available)
    .sort((a, b) => a.loadScore - b.loadScore)
    .slice(0, count);
}

export function batchRepairs(
  tasks: RepairTask[],
  governanceMode: GovernanceMode,
): ScheduledBatch[] {
  const cap = GOVERNANCE_CAPS[governanceMode];
  if (cap === 0) return [];

  const windows = findOptimalWindows(10);
  if (windows.length === 0) return [];

  // Sort tasks by priority (highest first)
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority);
  const batches: ScheduledBatch[] = [];
  const assigned = new Set<string>();

  for (const window of windows) {
    const batch: RepairTask[] = [];
    let totalDuration = 0;

    for (const task of sorted) {
      if (assigned.has(task.id)) continue;
      if (batch.length >= cap) break;

      // Check compatibility with existing batch members
      const compatible = batch.every(
        bt => task.compatibleWith.includes(bt.id) || bt.compatibleWith.includes(task.id) || !task.requiresDowntime
      );
      if (!compatible) continue;

      batch.push(task);
      totalDuration += task.estimatedDurationMs;
      assigned.add(task.id);
    }

    if (batch.length > 0) {
      batches.push({
        window,
        tasks: batch,
        totalDurationMs: totalDuration,
        batchScore: Math.round(
          (batch.reduce((s, t) => s + t.priority, 0) / batch.length) * (1 - window.loadScore / 100) * 100
        ) / 100,
      });
    }

    if (assigned.size >= sorted.length) break;
  }

  return batches.sort((a, b) => b.batchScore - a.batchScore);
}

export function resetLoadProfile(): void {
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      loadGrid[d][h] = 50;
    }
  }
}
