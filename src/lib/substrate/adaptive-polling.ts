/**
 * Adaptive Polling — Dynamically adjusts poll intervals based on activity
 * Backs off when idle, speeds up during active use
 */

interface PollConfig {
  id: string;
  minInterval: number;
  maxInterval: number;
  currentInterval: number;
  backoffFactor: number;
  speedupFactor: number;
  lastActivity: number;
  idleThreshold: number; // ms before considered idle
  timer: ReturnType<typeof setInterval> | null;
  callback: () => void | Promise<void>;
}

const pollers = new Map<string, PollConfig>();

export function createPoller(
  id: string,
  callback: () => void | Promise<void>,
  options: {
    minInterval?: number;
    maxInterval?: number;
    backoffFactor?: number;
    speedupFactor?: number;
    idleThreshold?: number;
  } = {},
): void {
  const config: PollConfig = {
    id,
    callback,
    minInterval: options.minInterval ?? 5000,
    maxInterval: options.maxInterval ?? 120_000,
    currentInterval: options.minInterval ?? 5000,
    backoffFactor: options.backoffFactor ?? 1.5,
    speedupFactor: options.speedupFactor ?? 0.5,
    idleThreshold: options.idleThreshold ?? 30_000,
    lastActivity: Date.now(),
    timer: null,
  };
  pollers.set(id, config);
}

function tick(config: PollConfig): void {
  const idle = Date.now() - config.lastActivity > config.idleThreshold;

  if (idle) {
    config.currentInterval = Math.min(config.currentInterval * config.backoffFactor, config.maxInterval);
  }

  // Schedule next tick
  config.timer = setTimeout(async () => {
    try { await config.callback(); } catch { /* silent */ }
    tick(config);
  }, config.currentInterval);
}

export function startPoller(id: string): void {
  const config = pollers.get(id);
  if (!config || config.timer) return;
  tick(config);
}

export function stopPoller(id: string): void {
  const config = pollers.get(id);
  if (config?.timer) { clearTimeout(config.timer); config.timer = null; }
}

/** Signal user activity to speed up polling */
export function signalActivity(id: string): void {
  const config = pollers.get(id);
  if (!config) return;
  config.lastActivity = Date.now();
  config.currentInterval = Math.max(config.currentInterval * config.speedupFactor, config.minInterval);
}

export function getPollerStatus(id: string) {
  const c = pollers.get(id);
  if (!c) return null;
  return { interval: Math.round(c.currentInterval), idle: Date.now() - c.lastActivity > c.idleThreshold, active: !!c.timer };
}

export function getAllPollers() {
  return Array.from(pollers.entries()).map(([id, c]) => ({
    id,
    interval: Math.round(c.currentInterval),
    active: !!c.timer,
  }));
}
