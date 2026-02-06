/**
 * Mobile Crash Diagnostics - Core Logger
 * Opt-in via ?diag=1 URL parameter
 */

const STORAGE_KEY = "__mobile_diag_logs__";
const MAX_LOGS = 200;

export function diagEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get("diag") === "1";
  } catch {
    return false;
  }
}

type LogLevel = "log" | "warn" | "error";

interface DiagLogEntry {
  t: number;
  level: LogLevel;
  msg: string;
}

export function diagLog(level: LogLevel, ...args: unknown[]): void {
  if (!diagEnabled()) return;

  // Console output
  const consoleFn = console[level] ?? console.log;
  consoleFn("[DIAG]", ...args);

  // Persist to localStorage for post-crash retrieval
  try {
    const prev: DiagLogEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const next = prev.slice(-(MAX_LOGS - 20));
    next.push({
      t: Date.now(),
      level,
      msg: args.map(a => (typeof a === "string" ? a : JSON.stringify(a))).join(" "),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable - silent fail
  }
}

export function readDiagLogs(): DiagLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearDiagLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
