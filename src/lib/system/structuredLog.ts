/**
 * Structured Logger — Level-aware, context-rich logging
 * Replaces raw console.log with structured entries
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  timestamp: number;
  traceId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
let minLevel: LogLevel = 'info';
const buffer: LogEntry[] = [];
const MAX_BUFFER = 500;
const sinks: Array<(entry: LogEntry) => void> = [];

export function setMinLevel(level: LogLevel): void {
  minLevel = level;
}

export function addSink(sink: (entry: LogEntry) => void): () => void {
  sinks.push(sink);
  return () => {
    const i = sinks.indexOf(sink);
    if (i >= 0) sinks.splice(i, 1);
  };
}

function emit(entry: LogEntry): void {
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[minLevel]) return;

  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.splice(0, 100);

  // Console output
  const prefix = `[${entry.module}]`;
  switch (entry.level) {
    case 'debug': console.debug(prefix, entry.message, entry.data ?? ''); break;
    case 'info': console.info(prefix, entry.message, entry.data ?? ''); break;
    case 'warn': console.warn(prefix, entry.message, entry.data ?? ''); break;
    case 'error':
    case 'fatal': console.error(prefix, entry.message, entry.data ?? ''); break;
  }

  sinks.forEach(s => s(entry));
}

export function createLogger(module: string) {
  const make = (level: LogLevel) => (message: string, data?: unknown, traceId?: string) => {
    emit({ level, module, message, data, timestamp: Date.now(), traceId });
  };
  return {
    debug: make('debug'),
    info: make('info'),
    warn: make('warn'),
    error: make('error'),
    fatal: make('fatal'),
  };
}

export function getLogBuffer(): LogEntry[] {
  return [...buffer];
}

export function clearLogBuffer(): void {
  buffer.length = 0;
}

export function filterLogs(filter: { level?: LogLevel; module?: string; since?: number }): LogEntry[] {
  return buffer.filter(e =>
    (!filter.level || LOG_LEVELS[e.level] >= LOG_LEVELS[filter.level]) &&
    (!filter.module || e.module === filter.module) &&
    (!filter.since || e.timestamp >= filter.since)
  );
}

export type { LogLevel, LogEntry };
