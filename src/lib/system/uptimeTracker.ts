/**
 * SYSTEM — Uptime Tracker
 * Tracks session uptime and provides runtime health metrics.
 */

const bootTime = Date.now();

/**
 * Get current session uptime in milliseconds.
 */
export function getUptimeMs(): number {
  return Date.now() - bootTime;
}

/**
 * Get formatted uptime string (e.g., "2h 15m 30s").
 */
export function getUptimeFormatted(): string {
  const ms = getUptimeMs();
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60_000) % 60;
  const hours = Math.floor(ms / 3_600_000);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Get boot timestamp as ISO string.
 */
export function getBootTimestamp(): string {
  return new Date(bootTime).toISOString();
}

/**
 * Get uptime report for telemetry.
 */
export function getUptimeReport(): {
  bootTimestamp: string;
  uptimeMs: number;
  uptimeFormatted: string;
  isLongRunning: boolean;
} {
  const uptimeMs = getUptimeMs();
  return {
    bootTimestamp: getBootTimestamp(),
    uptimeMs,
    uptimeFormatted: getUptimeFormatted(),
    isLongRunning: uptimeMs > 4 * 60 * 60 * 1000, // > 4 hours
  };
}
