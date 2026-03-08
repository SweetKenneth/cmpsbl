/**
 * Shadow Mesh — Scheduler
 * Runs shadow batch probes every 15 minutes when enabled.
 *
 * Chrome desktop fix: Chrome throttles setInterval to 1/min (or pauses it
 * entirely) when the tab is hidden or Energy Saver kicks in. We recover from
 * this by:
 *   1. Tracking when the last batch ran via a timestamp.
 *   2. Listening to `visibilitychange` — when the tab becomes visible again we
 *      immediately check if a run is overdue and fire one if so.
 *   3. Keeping the polling interval alive for normal foreground cadence.
 *
 * Safari on iOS is unaffected because it only suspends the JS timer while the
 * app is backgrounded (not tabbed away within the same browser), and the
 * visibility event fires on resume there too.
 */

import { runShadowBatch } from './runBatch';

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

let schedulerStarted = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
let lastRunAt = 0;

async function tryRunBatch() {
  try {
    await runShadowBatch();
  } catch (e) {
    console.error('[shadow-scheduler]', e);
  } finally {
    lastRunAt = Date.now();
  }
}

function handleVisibilityChange() {
  if (document.visibilityState !== 'visible') return;

  const elapsed = Date.now() - lastRunAt;
  if (elapsed >= INTERVAL_MS) {
    // Tab was hidden long enough that Chrome likely skipped a scheduled run
    console.info('[shadow-scheduler] Tab resumed after throttle — running overdue batch');
    tryRunBatch();
  }
}

export function startShadowScheduler() {
  if (schedulerStarted) return;
  // Never run shadow probes inside editor preview — causes reload loops
  try {
    const host = window.location.hostname;
    const qs = new URLSearchParams(window.location.search);
    if (qs.has('__lovable_token') || host.includes('lovableproject.com') || host.startsWith('id-preview--')) return;
  } catch { /* proceed */ }
  schedulerStarted = true;

  // Run immediately on first start so we don't wait 15 min for first probe
  tryRunBatch();

  // Periodic fallback (Chrome may throttle this when tab is hidden)
  intervalId = setInterval(tryRunBatch, INTERVAL_MS);

  // Visibility-based recovery for Chrome's throttling behaviour
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

export function stopShadowScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  schedulerStarted = false;
  lastRunAt = 0;
}
