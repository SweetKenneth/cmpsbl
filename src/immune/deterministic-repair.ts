/**
 * Shadow Mesh Phase 2 — Deterministic Repair Module
 * Non-AI, in-scope transformations for pilot executor inputs.
 *
 * SAFETY:
 *   - Only used inside the immune wrapper (wrapExecutor.ts)
 *   - Only runs for the 5 pilot executors
 *   - No cross-module writes, no filesystem writes, no recursion
 */

export interface DeterministicRepairResult {
  repaired: boolean;
  repair_type?: string;
  repaired_input: any;
}

const SCRIPT_RE = /<script[\s\S]*?<\/script>/gi;
const SECRET_KEY_RE = /\b(token|api_key|apikey|password|secret|authorization)\b/i;
const MAX_STRING_LEN = 5000;
const MAX_ARRAY_LEN = 1000;

/**
 * Attempt deterministic repairs on an input object.
 * Returns repaired=false if nothing changed.
 */
export function deterministicRepair(input: any): DeterministicRepairResult {
  if (input === null || input === undefined || typeof input !== 'object' || Array.isArray(input)) {
    return { repaired: false, repaired_input: input };
  }

  const copy = { ...input };
  const applied: string[] = [];

  // 1) NORMALIZE_NULLS — shallow walk, replace null/undefined with safe defaults
  for (const key of Object.keys(copy)) {
    if (copy[key] === null || copy[key] === undefined) {
      copy[key] = '';
      if (!applied.includes('NORMALIZE_NULLS')) applied.push('NORMALIZE_NULLS');
    }
  }

  // 2) CLAMP_SIZE — truncate oversized strings and arrays
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (typeof val === 'string' && val.length > MAX_STRING_LEN) {
      copy[key] = val.slice(0, MAX_STRING_LEN);
      if (!applied.includes('CLAMP_SIZE')) applied.push('CLAMP_SIZE');
    }
    if (Array.isArray(val) && val.length > MAX_ARRAY_LEN) {
      copy[key] = val.slice(0, MAX_ARRAY_LEN);
      if (!applied.includes('CLAMP_SIZE')) applied.push('CLAMP_SIZE');
    }
  }

  // 3) JSON_FALLBACK — if payload is unparseable string, reset to "{}"
  if (typeof copy.payload === 'string') {
    try {
      JSON.parse(copy.payload);
    } catch {
      copy.payload = '{}';
      if (!applied.includes('JSON_FALLBACK')) applied.push('JSON_FALLBACK');
    }
  }

  // 4) SANITIZE — strip <script> blocks, redact obvious secrets
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] !== 'string') continue;

    // Strip script tags
    if (SCRIPT_RE.test(copy[key])) {
      copy[key] = copy[key].replace(SCRIPT_RE, '');
      if (!applied.includes('SANITIZE')) applied.push('SANITIZE');
    }
    // Reset regex lastIndex after global flag
    SCRIPT_RE.lastIndex = 0;

    // Redact secret-like keys
    if (SECRET_KEY_RE.test(key) && copy[key].length > 0) {
      copy[key] = '[REDACTED]';
      if (!applied.includes('SANITIZE')) applied.push('SANITIZE');
    }
  }

  if (applied.length === 0) {
    return { repaired: false, repaired_input: input };
  }

  return {
    repaired: true,
    repair_type: applied.join('+'),
    repaired_input: copy,
  };
}
