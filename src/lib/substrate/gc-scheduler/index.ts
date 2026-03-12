/**
 * Autonomous GC Scheduler v1.0.0
 * Runs Memory GC automatically on a configurable interval
 * Integrates with brain_events for audit trail
 */

import { supabase } from '@/integrations/supabase/client';
import { runMemoryGC } from '../memory-gc/index';

interface GCSchedulerConfig {
  intervalMs: number;       // Default: 6 hours
  enabled: boolean;
  maxConsecutiveRuns: number;
  cooldownAfterMaxMs: number;
}

const DEFAULT_CONFIG: GCSchedulerConfig = {
  intervalMs: 2 * 60 * 60 * 1000, // 2 hours (was 6)
  enabled: true,
  maxConsecutiveRuns: 6,           // was 4
  cooldownAfterMaxMs: 4 * 60 * 60 * 1000, // 4 hours (was 12)
};

let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
let consecutiveRuns = 0;
let lastRunAt: Date | null = null;

/**
 * Start the autonomous GC scheduler
 */
export function startGCScheduler(config: Partial<GCSchedulerConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (schedulerTimer) {
    console.log('[GC-Scheduler] Already running, stopping first');
    stopGCScheduler();
  }
  
  if (!cfg.enabled) {
    console.log('[GC-Scheduler] Disabled by config');
    return;
  }
  
  console.log(`[GC-Scheduler] Starting with interval ${cfg.intervalMs / 1000 / 60}min`);
  
  schedulerTimer = setInterval(async () => {
    if (consecutiveRuns >= cfg.maxConsecutiveRuns) {
      console.log('[GC-Scheduler] Max consecutive runs reached, entering cooldown');
      consecutiveRuns = 0;
      stopGCScheduler();
      cooldownTimer = setTimeout(() => startGCScheduler(cfg), cfg.cooldownAfterMaxMs);
      return;
    }
    
    await executeScheduledGC();
  }, cfg.intervalMs);
}

/**
 * Stop the scheduler — clears all timers to prevent leaks
 */
export function stopGCScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  if (cooldownTimer) {
    clearTimeout(cooldownTimer);
    cooldownTimer = null;
  }
  console.log('[GC-Scheduler] Stopped');
}

/**
 * Execute a single GC cycle
 */
async function executeScheduledGC(): Promise<void> {
  const startTime = Date.now();
  
  try {
    console.log('[GC-Scheduler] Running scheduled GC cycle...');
    const result = await runMemoryGC();
    consecutiveRuns++;
    lastRunAt = new Date();
    
    await supabase.from('brain_events').insert({
      module: 'system',
      event_type: 'gc_scheduled_run',
      data: {
        ...result,
        duration_ms: Date.now() - startTime,
        consecutive_run: consecutiveRuns,
      },
      outcome: 'success',
    });
    
    console.log('[GC-Scheduler] Cycle complete:', result);
  } catch (err) {
    console.error('[GC-Scheduler] Cycle failed:', err);
    await supabase.from('brain_events').insert({
      module: 'system',
      event_type: 'gc_scheduled_run',
      data: { error: String(err), duration_ms: Date.now() - startTime },
      outcome: 'failure',
    });
  }
}

/**
 * Get scheduler status
 */
export function getGCSchedulerStatus(): {
  running: boolean;
  consecutiveRuns: number;
  lastRunAt: Date | null;
} {
  return {
    running: schedulerTimer !== null,
    consecutiveRuns,
    lastRunAt,
  };
}
