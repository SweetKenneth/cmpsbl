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

/**
 * Deep-freeze an object recursively. Prevents mutation of config objects.
 */
export function deepFreeze<T extends Record<string, unknown>>(obj: T): Readonly<T> {
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val as Record<string, unknown>);
    }
  }
  return obj;
}

/**
 * Strip HTML tags from untrusted strings.
 * NOT a full sanitizer — use for display text only.
 */
export function sanitizeText(input: string, maxLength = 10_000): string {
  if (typeof input !== 'string') return '';
  return input
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * Generate a deterministic hash for deduplication.
 * Uses FNV-1a 32-bit for speed.
 */
export function fnv1aHash(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Debounce a function call with leading-edge option.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
  leading = false
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hasLeadingCall = false;

  return (...args: Parameters<T>) => {
    if (leading && !hasLeadingCall) {
      hasLeadingCall = true;
      fn(...args);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (!leading || hasLeadingCall) fn(...args);
      hasLeadingCall = false;
      timer = null;
    }, delayMs);
  };
}
