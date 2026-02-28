/**
 * Scan Scheduling & Event-Driven Triggers
 * Manages scan cadence: scheduled scans, event-driven triggers (deploy, merge, threshold breach),
 * and scan debouncing to prevent redundant runs.
 */

export type ScanTrigger =
  | 'scheduled'
  | 'deploy'
  | 'merge'
  | 'threshold_breach'
  | 'manual'
  | 'evolution_complete'
  | 'regression_detected';

export interface ScanSchedule {
  id: string;
  name: string;
  trigger: ScanTrigger;
  cronExpression?: string; // for scheduled
  scanDepth: 'shallow' | 'standard' | 'deep' | 'forensic';
  categories?: string[];
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  runCount: number;
  maxConsecutiveFailures: number;
  consecutiveFailures: number;
}

export interface ScanTriggerEvent {
  trigger: ScanTrigger;
  timestamp: string;
  metadata: Record<string, unknown>;
  source: string;
}

export interface SchedulerState {
  schedules: ScanSchedule[];
  pendingTriggers: ScanTriggerEvent[];
  debounceWindowMs: number;
  lastScanAt: string | null;
  isRunning: boolean;
}

const DEFAULT_DEBOUNCE_MS = 60_000; // 1 minute

let state: SchedulerState = {
  schedules: [],
  pendingTriggers: [],
  debounceWindowMs: DEFAULT_DEBOUNCE_MS,
  lastScanAt: null,
  isRunning: false,
};

/**
 * Register a scan schedule
 */
export function registerSchedule(
  name: string,
  trigger: ScanTrigger,
  scanDepth: ScanSchedule['scanDepth'],
  opts: {
    cronExpression?: string;
    categories?: string[];
    maxConsecutiveFailures?: number;
  } = {},
): ScanSchedule {
  const schedule: ScanSchedule = {
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    trigger,
    cronExpression: opts.cronExpression,
    scanDepth,
    categories: opts.categories,
    enabled: true,
    lastRunAt: null,
    nextRunAt: null,
    runCount: 0,
    maxConsecutiveFailures: opts.maxConsecutiveFailures ?? 3,
    consecutiveFailures: 0,
  };

  state.schedules.push(schedule);
  return schedule;
}

/**
 * Emit a scan trigger event
 */
export function emitTrigger(
  trigger: ScanTrigger,
  source: string,
  metadata: Record<string, unknown> = {},
): { accepted: boolean; reason: string } {
  const now = Date.now();

  // Debounce check
  if (state.lastScanAt) {
    const elapsed = now - new Date(state.lastScanAt).getTime();
    if (elapsed < state.debounceWindowMs) {
      return {
        accepted: false,
        reason: `Debounced: ${Math.round((state.debounceWindowMs - elapsed) / 1000)}s until next allowed scan`,
      };
    }
  }

  // Check if already running
  if (state.isRunning) {
    state.pendingTriggers.push({
      trigger,
      timestamp: new Date().toISOString(),
      metadata,
      source,
    });
    return { accepted: false, reason: 'Scan already in progress. Trigger queued.' };
  }

  // Find matching schedules
  const matchingSchedules = state.schedules.filter(
    s => s.enabled && s.trigger === trigger,
  );

  if (matchingSchedules.length === 0 && trigger !== 'manual') {
    return { accepted: false, reason: `No enabled schedules for trigger: ${trigger}` };
  }

  return { accepted: true, reason: 'Trigger accepted' };
}

/**
 * Get the next scheduled scan
 */
export function getNextScheduledScan(): ScanSchedule | null {
  const scheduled = state.schedules
    .filter(s => s.enabled && s.trigger === 'scheduled' && s.nextRunAt)
    .sort((a, b) => (a.nextRunAt ?? '').localeCompare(b.nextRunAt ?? ''));

  return scheduled[0] ?? null;
}

/**
 * Record scan completion for scheduling
 */
export function recordScanCompletion(
  scheduleId: string | null,
  success: boolean,
): void {
  state.lastScanAt = new Date().toISOString();
  state.isRunning = false;

  if (scheduleId) {
    const schedule = state.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      schedule.lastRunAt = state.lastScanAt;
      schedule.runCount++;
      if (success) {
        schedule.consecutiveFailures = 0;
      } else {
        schedule.consecutiveFailures++;
        if (schedule.consecutiveFailures >= schedule.maxConsecutiveFailures) {
          schedule.enabled = false;
        }
      }
    }
  }

  // Process pending triggers
  if (state.pendingTriggers.length > 0) {
    const next = state.pendingTriggers.shift()!;
    emitTrigger(next.trigger, next.source, next.metadata);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  activeSchedules: number;
  disabledSchedules: number;
  pendingTriggers: number;
  isRunning: boolean;
  lastScanAt: string | null;
  schedules: ScanSchedule[];
} {
  return {
    activeSchedules: state.schedules.filter(s => s.enabled).length,
    disabledSchedules: state.schedules.filter(s => !s.enabled).length,
    pendingTriggers: state.pendingTriggers.length,
    isRunning: state.isRunning,
    lastScanAt: state.lastScanAt,
    schedules: [...state.schedules],
  };
}

/**
 * Configure debounce window
 */
export function setDebounceWindow(ms: number): void {
  state.debounceWindowMs = ms;
}

/**
 * Reset scheduler (for testing)
 */
export function resetScheduler(): void {
  state = {
    schedules: [],
    pendingTriggers: [],
    debounceWindowMs: DEFAULT_DEBOUNCE_MS,
    lastScanAt: null,
    isRunning: false,
  };
}

/**
 * Create default scan schedules
 */
export function registerDefaultSchedules(): ScanSchedule[] {
  return [
    registerSchedule('Post-Deploy Security Scan', 'deploy', 'deep', {
      categories: ['security', 'rls_policy', 'secret_exposure'],
    }),
    registerSchedule('Post-Merge Debt Check', 'merge', 'standard', {
      categories: ['complexity', 'dead_code', 'test_coverage'],
    }),
    registerSchedule('Regression Alert Scan', 'regression_detected', 'forensic'),
    registerSchedule('Post-Evolution Verification', 'evolution_complete', 'standard', {
      categories: ['security', 'performance', 'complexity'],
    }),
  ];
}
