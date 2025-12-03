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

  // Store in localStorage for debugging (last 50 entries)
  try {
    const existing = localStorage.getItem('cascade-coder-logs');
    const logs: CoderLogEntry[] = existing ? JSON.parse(existing) : [];
    logs.unshift(fullEntry);
    localStorage.setItem('cascade-coder-logs', JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    // Silently fail if localStorage unavailable
  }
}

/**
 * Get recent logs from localStorage
 */
export function getRecentLogs(): CoderLogEntry[] {
  try {
    const existing = localStorage.getItem('cascade-coder-logs');
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  try {
    localStorage.removeItem('cascade-coder-logs');
  } catch {
    // Silently fail
  }
}
