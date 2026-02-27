/**
 * Hardening Utilities — Shared safety primitives
 * Production-grade guards for substrate operations
 * 
 * Provides: withTimeout, clampNumber, validateStringInput, safeParse
 * Used across CORE, CCR, and Overlay nodes for consistent hardening.
 */

/**
 * Wrap a promise with a timeout. Rejects with TIMEOUT_ERROR if exceeded.
 * Does NOT cancel the underlying operation — it only races against it.
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  label = 'operation'
): Promise<T> {
  if (timeoutMs <= 0 || !Number.isFinite(timeoutMs)) {
    throw new Error(`[withTimeout] Invalid timeout: ${timeoutMs}ms for ${label}`);
  }

  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`[TIMEOUT] ${label} exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([fn(), timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Clamp a numeric value to [min, max]. Returns defaultVal for NaN/Infinity.
 */
export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  defaultVal: number
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultVal;
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Validate a string input — returns null if invalid.
 * Guards: type check, length bounds, optional pattern.
 */
export function validateStringInput(
  value: unknown,
  opts: { maxLength?: number; minLength?: number; pattern?: RegExp; label?: string } = {}
): string | null {
  if (typeof value !== 'string') return null;
  const { maxLength = 10_000, minLength = 0, pattern } = opts;

  if (value.length < minLength || value.length > maxLength) return null;
  if (pattern && !pattern.test(value)) return null;

  return value;
}

/**
 * Safe JSON parse — returns null on failure instead of throwing.
 */
export function safeParse<T = unknown>(json: string, maxLength = 1_000_000): T | null {
  if (typeof json !== 'string' || json.length > maxLength) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Guard that ensures an array doesn't exceed a max size.
 * Trims from the front (oldest entries) if over limit.
 */
export function boundArray<T>(arr: T[], maxSize: number): T[] {
  if (arr.length <= maxSize) return arr;
  return arr.slice(arr.length - maxSize);
}

/**
 * Wrap an async function with a default timeout + error normalization.
 * Returns { success, data, error } — never throws.
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  opts: { timeoutMs?: number; label?: string } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { timeoutMs = 30_000, label = 'safeExecute' } = opts;
  try {
    const data = await withTimeout(fn, timeoutMs, label);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
