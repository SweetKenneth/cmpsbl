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
const SQL_INJECT_RE = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|CREATE|EXEC)\b\s)/i;
const MAX_STRING_LEN = 5000;
const MAX_ARRAY_LEN = 1000;

/**
 * Minimum expected keys for pilot executor inputs.
 * If an input is missing ALL of these, DEFAULT_SHAPE fills them in.
 */
const EXPECTED_KEYS = ['content', 'url', 'domain', 'userId', 'wcagLevel', 'ariaLabel'] as const;

/** Known string-expected fields (arrays should be flattened) */
const STRING_FIELDS = new Set(['content', 'url', 'domain', 'userId', 'ariaLabel', 'target', 'label', 'description']);

/** Valid wcagLevel values */
const VALID_WCAG_LEVELS = new Set(['A', 'AA', 'AAA']);

/** Control character regex (strip \x00-\x1F except \n \r \t) */
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

/** Prototype pollution keys */
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Measure object nesting depth */
function measureDepth(obj: unknown, current = 0): number {
  if (current > 10) return current; // safety cap
  if (!obj || typeof obj !== 'object') return current;
  let max = current;
  for (const val of Object.values(obj as Record<string, unknown>)) {
    if (val && typeof val === 'object') {
      max = Math.max(max, measureDepth(val, current + 1));
    }
  }
  return max;
}
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

  // 5) FLATTEN_ARRAY — convert arrays to comma-joined strings for known string fields
  for (const key of Object.keys(copy)) {
    if (STRING_FIELDS.has(key) && Array.isArray(copy[key])) {
      copy[key] = (copy[key] as any[]).map(String).join(', ');
      if (!applied.includes('FLATTEN_ARRAY')) applied.push('FLATTEN_ARRAY');
    }
  }

  // 6) SQL_SANITIZE — strip SQL injection patterns from string values
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && SQL_INJECT_RE.test(copy[key])) {
      copy[key] = copy[key].replace(SQL_INJECT_RE, '');
      SQL_INJECT_RE.lastIndex = 0;
      if (!applied.includes('SQL_SANITIZE')) applied.push('SQL_SANITIZE');
    }
    SQL_INJECT_RE.lastIndex = 0;
  }

  // 7) ENUM_CLAMP — normalize wcagLevel to valid values
  if ('wcagLevel' in copy && typeof copy.wcagLevel === 'string') {
    const upper = copy.wcagLevel.toUpperCase();
    if (!VALID_WCAG_LEVELS.has(upper)) {
      copy.wcagLevel = 'AA'; // safe default
      if (!applied.includes('ENUM_CLAMP')) applied.push('ENUM_CLAMP');
    } else if (copy.wcagLevel !== upper) {
      copy.wcagLevel = upper;
      if (!applied.includes('ENUM_CLAMP')) applied.push('ENUM_CLAMP');
    }
  }

  // 8) COERCE_TYPE — cast booleans and numbers to strings for string-expected fields
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (typeof val === 'boolean' || typeof val === 'number') {
      copy[key] = String(val);
      if (!applied.includes('COERCE_TYPE')) applied.push('COERCE_TYPE');
    }
  }

  // 9) STRIP_EMPTY_OBJECTS — replace empty object values {} with empty string
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) {
      copy[key] = '';
      if (!applied.includes('STRIP_EMPTY_OBJECTS')) applied.push('STRIP_EMPTY_OBJECTS');
    }
  }

  // 10) DEFAULT_SHAPE — if input has no recognized keys OR is empty, inject minimum shape
  const hasExpectedKey = EXPECTED_KEYS.some(k => k in copy);
  if (!hasExpectedKey) {
    const firstVal = Object.keys(copy).length > 0 ? copy[Object.keys(copy)[0]] : '';
    copy.content = typeof firstVal === 'string' ? firstVal : '';
    if (!applied.includes('DEFAULT_SHAPE')) applied.push('DEFAULT_SHAPE');
  }

  // 11) NESTED_STRINGIFY — stringify nested objects in string-expected fields
  for (const key of Object.keys(copy)) {
    if (STRING_FIELDS.has(key) && copy[key] && typeof copy[key] === 'object' && !Array.isArray(copy[key])) {
      try {
        copy[key] = JSON.stringify(copy[key]);
      } catch {
        copy[key] = '';
      }
      if (!applied.includes('NESTED_STRINGIFY')) applied.push('NESTED_STRINGIFY');
    }
  }

  // 12) CONTROL_CHAR_STRIP — remove dangerous control characters from strings
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && CONTROL_CHAR_RE.test(copy[key])) {
      copy[key] = copy[key].replace(CONTROL_CHAR_RE, '');
      CONTROL_CHAR_RE.lastIndex = 0;
      if (!applied.includes('CONTROL_CHAR_STRIP')) applied.push('CONTROL_CHAR_STRIP');
    }
    CONTROL_CHAR_RE.lastIndex = 0;
  }

  // 13) PROTO_GUARD — remove prototype pollution keys
  for (const key of Array.from(Object.keys(copy))) {
    if (DANGEROUS_KEYS.has(key)) {
      delete copy[key];
      if (!applied.includes('PROTO_GUARD')) applied.push('PROTO_GUARD');
    }
    // Also strip __proto__ from nested object values
    if (copy[key] && typeof copy[key] === 'object' && !Array.isArray(copy[key])) {
      const nested = copy[key] as Record<string, unknown>;
      for (const nk of Object.keys(nested)) {
        if (DANGEROUS_KEYS.has(nk)) {
          delete nested[nk];
          if (!applied.includes('PROTO_GUARD')) applied.push('PROTO_GUARD');
        }
      }
      // If nested object is now empty after stripping, convert to empty string
      if (Object.keys(nested).length === 0) {
        copy[key] = '';
      }
    }
  }

  // 14) DEEP_TYPE_COERCE — for non-string-field objects/arrays, stringify them
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && !STRING_FIELDS.has(key)) {
      try {
        copy[key] = JSON.stringify(val);
      } catch {
        copy[key] = '';
      }
      if (!applied.includes('DEEP_TYPE_COERCE')) applied.push('DEEP_TYPE_COERCE');
    }
  }

  // 15) ENUM_TYPE_COERCE — cast non-string wcagLevel (e.g. number 999) to string before ENUM_CLAMP
  if ('wcagLevel' in copy && typeof copy.wcagLevel !== 'string') {
    const coerced = String(copy.wcagLevel).toUpperCase();
    copy.wcagLevel = VALID_WCAG_LEVELS.has(coerced) ? coerced : 'AA';
    if (!applied.includes('ENUM_TYPE_COERCE')) applied.push('ENUM_TYPE_COERCE');
  }

  // 16) PREFERENCES_NORMALIZE — ensure preferences field is always a plain object
  if ('preferences' in copy) {
    const pref = copy.preferences;
    if (typeof pref === 'string') {
      try { copy.preferences = JSON.parse(pref); } catch { copy.preferences = {}; }
      if (!applied.includes('PREFERENCES_NORMALIZE')) applied.push('PREFERENCES_NORMALIZE');
    } else if (typeof pref === 'number' || typeof pref === 'boolean' || Array.isArray(pref) || pref === null) {
      copy.preferences = {};
      if (!applied.includes('PREFERENCES_NORMALIZE')) applied.push('PREFERENCES_NORMALIZE');
    }
  }

  // 17) DEEP_FLATTEN — flatten deeply nested objects (>3 levels) to prevent stack issues
  for (const key of Object.keys(copy)) {
    if (copy[key] && typeof copy[key] === 'object' && !Array.isArray(copy[key])) {
      if (measureDepth(copy[key]) > 3) {
        try { copy[key] = JSON.stringify(copy[key]); } catch { copy[key] = ''; }
        if (!applied.includes('DEEP_FLATTEN')) applied.push('DEEP_FLATTEN');
      }
    }
  }

  // 18) WHITESPACE_NORMALIZE — collapse excessive whitespace/newlines in string values
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const normalized = copy[key].replace(/\s{10,}/g, ' ').replace(/\n{5,}/g, '\n');
      if (normalized !== copy[key]) {
        copy[key] = normalized;
        if (!applied.includes('WHITESPACE_NORMALIZE')) applied.push('WHITESPACE_NORMALIZE');
      }
    }
  }

  // 19) ARRAY_NONSTRING_COERCE — convert arrays in non-string fields to JSON strings
  for (const key of Object.keys(copy)) {
    if (Array.isArray(copy[key]) && !STRING_FIELDS.has(key)) {
      try { copy[key] = JSON.stringify(copy[key]); } catch { copy[key] = '[]'; }
      if (!applied.includes('ARRAY_NONSTRING_COERCE')) applied.push('ARRAY_NONSTRING_COERCE');
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
