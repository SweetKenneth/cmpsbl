/**
 * Centralized Logging System
 * Production-safe logging with redaction and trace propagation
 */

import { redactSecrets } from '@/lib/defense/redact';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  trace_id?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface LogConfig {
  minLevel: LogLevel;
  redactSecrets: boolean;
  collapseNoisy: boolean;
  consoleOutput: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Production defaults
const config: LogConfig = {
  minLevel: import.meta.env.PROD ? 'info' : 'debug',
  redactSecrets: true,
  collapseNoisy: import.meta.env.PROD,
  consoleOutput: true,
};

// Noisy log suppression
const recentLogs = new Map<string, { count: number; lastTime: number }>();
const COLLAPSE_WINDOW_MS = 5000;
const COLLAPSE_THRESHOLD = 3;

function shouldCollapseLog(key: string): boolean {
  if (!config.collapseNoisy) return false;

  const now = Date.now();
  const entry = recentLogs.get(key);

  if (!entry || now - entry.lastTime > COLLAPSE_WINDOW_MS) {
    recentLogs.set(key, { count: 1, lastTime: now });
    return false;
  }

  entry.count++;
  entry.lastTime = now;

  if (entry.count === COLLAPSE_THRESHOLD) {
    return false; // Show collapsed message
  }

  return entry.count > COLLAPSE_THRESHOLD;
}

function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.level.toUpperCase()}]`,
    `[${entry.module}]`,
    entry.message,
  ];

  if (entry.trace_id) {
    parts.push(`(${entry.trace_id})`);
  }

  return parts.join(' ');
}

function writeLog(entry: LogEntry): void {
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[config.minLevel]) {
    return;
  }

  const collapseKey = `${entry.module}:${entry.message}`;
  if (shouldCollapseLog(collapseKey)) {
    return;
  }

  const formatted = formatLogEntry(entry);
  const redactedData = entry.data && config.redactSecrets 
    ? redactSecrets(entry.data) 
    : entry.data;

  if (config.consoleOutput) {
    switch (entry.level) {
      case 'debug':
        console.debug(formatted, redactedData || '');
        break;
      case 'info':
        console.info(formatted, redactedData || '');
        break;
      case 'warn':
        console.warn(formatted, redactedData || '');
        break;
      case 'error':
        console.error(formatted, redactedData || '');
        break;
    }
  }
}

function createLogFunction(level: LogLevel) {
  return (
    module: string,
    message: string,
    data?: Record<string, unknown>,
    traceId?: string
  ) => {
    writeLog({
      level,
      module,
      message,
      trace_id: traceId,
      timestamp: new Date().toISOString(),
      data,
    });
  };
}

export const log = {
  debug: createLogFunction('debug'),
  info: createLogFunction('info'),
  warn: createLogFunction('warn'),
  error: createLogFunction('error'),

  // Configure logging
  configure(updates: Partial<LogConfig>) {
    Object.assign(config, updates);
  },

  // Create a module-scoped logger
  forModule(module: string) {
    return {
      debug: (msg: string, data?: Record<string, unknown>, traceId?: string) =>
        log.debug(module, msg, data, traceId),
      info: (msg: string, data?: Record<string, unknown>, traceId?: string) =>
        log.info(module, msg, data, traceId),
      warn: (msg: string, data?: Record<string, unknown>, traceId?: string) =>
        log.warn(module, msg, data, traceId),
      error: (msg: string, data?: Record<string, unknown>, traceId?: string) =>
        log.error(module, msg, data, traceId),
    };
  },
};

// Cleanup old collapse entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - COLLAPSE_WINDOW_MS * 2;
    for (const [key, entry] of recentLogs.entries()) {
      if (entry.lastTime < cutoff) {
        recentLogs.delete(key);
      }
    }
  }, 60000);
}
