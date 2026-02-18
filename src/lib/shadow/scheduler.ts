/**
 * Shadow Mesh — Scheduler
 * Runs shadow batch probes every 15 minutes when enabled
 */

import { runShadowBatch } from './runBatch';

let schedulerStarted = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

export function startShadowScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;

  intervalId = setInterval(async () => {
    try {
      await runShadowBatch();
    } catch (e) {
      console.error('[shadow-scheduler]', e);
    }
  }, 15 * 60 * 1000); // 15 minutes
}

export function stopShadowScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  schedulerStarted = false;
}
