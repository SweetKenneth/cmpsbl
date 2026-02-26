/**
 * Cascade Coder Logging
 * 
 * Lightweight logging for patch generation requests.
 * Prepares for future automation pipeline (job queue → auto-PR).
 */

export interface CoderLogEntry {
  timestamp: string;
  projectId: string;
  requestLength: number;
  parseSuccess: boolean;
  responseTime?: number;
  error?: string;
}

const LOG_PREFIX = '[CASCADE-CODER]';

/**
 * Log a patch generation attempt
 */
export function logPatchGeneration(entry: Omit<CoderLogEntry, 'timestamp'>): void {
  const fullEntry: CoderLogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  // Console log with prefix for easy filtering
  if (entry.parseSuccess) {
    console.log(`${LOG_PREFIX} ✅ Generated patch for ${entry.projectId}`, {
      requestLength: entry.requestLength,
      responseTime: entry.responseTime ? `${entry.responseTime}ms` : 'N/A'
    });
  } else {
    console.warn(`${LOG_PREFIX} ⚠️ Parse failed for ${entry.projectId}`, {
      requestLength: entry.requestLength,
      error: entry.error
    });
  }

  // Store in secureStorage for debugging (last 50 entries)
  try {
    const logs: CoderLogEntry[] = secureGet<CoderLogEntry[]>('cascade-coder-logs') || [];
    logs.unshift(fullEntry);
    secureSet('cascade-coder-logs', logs.slice(0, 50));
  } catch {
    // Storage unavailable — non-critical debug data
  }
}

/**
 * Get recent logs from secure storage
 */
export function getRecentLogs(): CoderLogEntry[] {
  try {
    return secureGet<CoderLogEntry[]>('cascade-coder-logs') || [];
  } catch {
    return [];
  }
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  try {
    secureRemove('cascade-coder-logs');
  } catch {
    // Storage unavailable — tolerable
  }
}
