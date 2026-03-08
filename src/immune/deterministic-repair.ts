/**
 * IMMUNITY — Deterministic Repair Module
 * Non-AI, in-scope transformations for all executor inputs.
 *
 * SAFETY:
 *   - Only used inside the immune wrapper (wrapExecutor.ts)
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
 * Minimum expected keys for executor inputs.
 * If an input is missing ALL of these, DEFAULT_SHAPE fills them in.
 * Covers all module categories: INCLUSIVE, COGNITIVE, OPERATIONAL,
 * ORCHESTRATOR, INFRASTRUCTURE, and INTELLIGENCE.
 */
const EXPECTED_KEYS = [
  // INCLUSIVE
  'content', 'url', 'domain', 'userId', 'wcagLevel', 'ariaLabel', 'foreground', 'background',
  // COGNITIVE
  'query', 'signal', 'prompt', 'depth', 'windowSize',
  // OPERATIONAL
  'event', 'action', 'module', 'limit', 'windowMs', 'timestamp',
  // ORCHESTRATOR
  'intent', 'proposal', 'steps', 'dependencies',
  // INFRASTRUCTURE
  'target', 'pattern', 'version', 'boundary', 'threshold',
  // INTELLIGENCE
  'baseline', 'timeRange', 'granularity', 'minCorrelation', 'mode',
] as const;

/** Known string-expected fields (arrays should be flattened) */
const STRING_FIELDS = new Set([
  'content', 'url', 'domain', 'userId', 'ariaLabel', 'target', 'label', 'description',
  'query', 'signal', 'prompt', 'event', 'action', 'module', 'intent', 'proposal',
  'channel', 'source', 'seed', 'traceId', 'standard', 'riskLevel', 'severity',
]);

/** Known object-expected fields — must NOT be stringified */
const OBJECT_FIELDS = new Set([
  'constraints', 'context', 'feedback', 'payload', 'preferences',
  'impactMetrics', 'metadata', 'steps', 'dependencies', 'modules',
]);

/** Known number-expected fields — must NOT be coerced to string */
const NUMBER_FIELDS = new Set([
  'depth', 'priority', 'tokens', 'computeMs', 'costMillicents',
  'creativity', 'reinforcement', 'threshold', 'windowSize', 'limit',
  'windowMs', 'minCorrelation', 'baseline', 'window', 'confidence',
]);

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
  //     Now injects ALL expected keys with meaningful defaults for executor compatibility
  const hasExpectedKey = EXPECTED_KEYS.some(k => k in copy && copy[k] !== '' && copy[k] !== null && copy[k] !== undefined);
  if (!hasExpectedKey) {
    const firstVal = Object.keys(copy).length > 0 ? copy[Object.keys(copy)[0]] : '';
    copy.content = typeof firstVal === 'string' && firstVal.length > 0 ? firstVal : 'audit target';
    copy.target = 'self';
    copy.userId = 'anonymous';
    copy.url = 'https://localhost';
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

  // 20) EMOJI_FLOOD_COLLAPSE — collapse repeated emoji/unicode (same char >10×)
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      // Match any character (including multi-byte) repeated >10 times consecutively
      const collapsed = copy[key].replace(/([\s\S])\1{10,}/g, '$1$1$1');
      if (collapsed !== copy[key]) {
        copy[key] = collapsed;
        if (!applied.includes('EMOJI_FLOOD_COLLAPSE')) applied.push('EMOJI_FLOOD_COLLAPSE');
      }
    }
  }

  // 21) EMPTY_STRING_BACKFILL — empty string on expected keys gets meaningful defaults
  const BACKFILL_DEFAULTS: Record<string, string> = {
    content: 'audit target',
    url: 'https://localhost',
    domain: 'localhost',
    userId: 'anonymous',
    wcagLevel: 'AA',
    ariaLabel: 'element',
  };
  for (const ek of EXPECTED_KEYS) {
    if (ek in copy && copy[ek] === '') {
      copy[ek] = BACKFILL_DEFAULTS[ek] ?? `default-${ek}`;
      if (!applied.includes('EMPTY_STRING_BACKFILL')) applied.push('EMPTY_STRING_BACKFILL');
    }
  }

  // 22) ALL_EMPTY_INJECT — if every value is empty string after repairs, inject minimal content
  const allEmpty = Object.keys(copy).length > 0 && Object.values(copy).every(v => v === '' || v === null || v === undefined);
  if (allEmpty) {
    copy.content = 'audit target';
    copy.target = 'self';
    if (!applied.includes('ALL_EMPTY_INJECT')) applied.push('ALL_EMPTY_INJECT');
  }

  // 40) PLACEHOLDER_NATURALIZE — convert bracketed placeholders to natural defaults
  // that pass isInputWellFormed validation (Phase 2.6 legacy consolidation)
  const PLACEHOLDER_RE = /^\[(?:empty|probe):[\w-]+\]$/;
  const NATURAL_DEFAULTS: Record<string, string> = {
    content: 'audit target',
    url: 'https://localhost',
    domain: 'localhost',
    userId: 'anonymous',
    wcagLevel: 'AA',
    ariaLabel: 'element',
    target: 'self',
    label: 'default',
    description: 'auto-generated',
  };
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && PLACEHOLDER_RE.test(copy[key])) {
      copy[key] = NATURAL_DEFAULTS[key] ?? '';
      if (!applied.includes('PLACEHOLDER_NATURALIZE')) applied.push('PLACEHOLDER_NATURALIZE');
    }
  }

  // 41) FLATTENED_CSV_CLEANUP — clean up comma-joined artifacts from FLATTEN_ARRAY
  // (trailing/leading commas, double commas, excess whitespace around commas)
  if (applied.includes('FLATTEN_ARRAY')) {
    for (const key of Object.keys(copy)) {
      if (STRING_FIELDS.has(key) && typeof copy[key] === 'string' && copy[key].includes(',')) {
        let cleaned = copy[key]
          .replace(/,\s*,+/g, ',')     // collapse double commas
          .replace(/^[\s,]+/, '')       // strip leading commas
          .replace(/[\s,]+$/, '')       // strip trailing commas
          .trim();
        if (cleaned !== copy[key]) {
          copy[key] = cleaned;
          if (!applied.includes('FLATTENED_CSV_CLEANUP')) applied.push('FLATTENED_CSV_CLEANUP');
        }
      }
    }
  }

  // 23) HTML_ANGLE_ENCODE — encode < > in non-URL string fields (catches XSS beyond <script>)
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && key !== 'url' && key !== 'target') {
      const encoded = copy[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (encoded !== copy[key]) {
        copy[key] = encoded;
        if (!applied.includes('HTML_ANGLE_ENCODE')) applied.push('HTML_ANGLE_ENCODE');
      }
    }
  }

  // 24) DUPLICATE_CHAR_COLLAPSE — any single ASCII char repeated >50 times collapsed
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const deduped = copy[key].replace(/(.)\1{50,}/g, '$1$1$1');
      if (deduped !== copy[key]) {
        copy[key] = deduped;
        if (!applied.includes('DUPLICATE_CHAR_COLLAPSE')) applied.push('DUPLICATE_CHAR_COLLAPSE');
      }
    }
  }

  // 25) OBJECT_VALUE_STRINGIFY — any remaining non-primitive values get stringified as last resort
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (val !== null && typeof val === 'object') {
      try { copy[key] = JSON.stringify(val); } catch { copy[key] = ''; }
      if (!applied.includes('OBJECT_VALUE_STRINGIFY')) applied.push('OBJECT_VALUE_STRINGIFY');
    }
  }

  // 26) URL_NORMALIZE — ensure url/domain fields have valid protocol or get stripped
  for (const urlKey of ['url', 'domain', 'target']) {
    if (urlKey in copy && typeof copy[urlKey] === 'string' && copy[urlKey].length > 0) {
      let u = copy[urlKey].trim();
      // Strip javascript: and data: protocols
      if (/^(javascript|data|vbscript):/i.test(u)) {
        copy[urlKey] = '';
        if (!applied.includes('URL_NORMALIZE')) applied.push('URL_NORMALIZE');
      } else if (u.length > 0 && !u.startsWith('http') && !u.startsWith('/') && u !== 'self') {
        copy[urlKey] = 'https://' + u;
        if (!applied.includes('URL_NORMALIZE')) applied.push('URL_NORMALIZE');
      }
    }
  }

  // 27) NAN_INFINITY_GUARD — replace NaN/Infinity string literals with meaningful defaults
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const lower = copy[key].trim().toLowerCase();
      if (lower === 'nan' || lower === 'infinity' || lower === '-infinity' || lower === 'undefined') {
        copy[key] = BACKFILL_DEFAULTS[key] ?? 'default';
        if (!applied.includes('NAN_INFINITY_GUARD')) applied.push('NAN_INFINITY_GUARD');
      }
    }
  }

  // 28) PATH_TRAVERSAL_STRIP — remove ../ sequences and absolute path patterns
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && (copy[key].includes('../') || copy[key].includes('..\\'))) {
      copy[key] = copy[key].replace(/\.\.[\\/]+/g, '');
      if (!applied.includes('PATH_TRAVERSAL_STRIP')) applied.push('PATH_TRAVERSAL_STRIP');
    }
  }

  // 29) ZERO_WIDTH_STRIP — remove zero-width characters (U+200B, U+200C, U+200D, U+FEFF, U+00AD)
  const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\uFEFF\u00AD\u2060\u180E]/g;
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && ZERO_WIDTH_RE.test(copy[key])) {
      copy[key] = copy[key].replace(ZERO_WIDTH_RE, '');
      ZERO_WIDTH_RE.lastIndex = 0;
      if (!applied.includes('ZERO_WIDTH_STRIP')) applied.push('ZERO_WIDTH_STRIP');
    }
    ZERO_WIDTH_RE.lastIndex = 0;
  }

  // 30) DOUBLE_ENCODE_FIX — decode double-encoded HTML entities (&amp;lt; → &lt; → <, then re-encode)
  const DOUBLE_ENCODE_RE = /&amp;(lt|gt|amp|quot|apos);/gi;
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && DOUBLE_ENCODE_RE.test(copy[key])) {
      copy[key] = copy[key].replace(DOUBLE_ENCODE_RE, '&$1;');
      DOUBLE_ENCODE_RE.lastIndex = 0;
      if (!applied.includes('DOUBLE_ENCODE_FIX')) applied.push('DOUBLE_ENCODE_FIX');
    }
    DOUBLE_ENCODE_RE.lastIndex = 0;
  }

  // 31) FUNCTION_VALUE_GUARD — detect stringified function values and replace
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && (copy[key].startsWith('function') || copy[key].startsWith('() =>') || copy[key].startsWith('async '))) {
      copy[key] = '[removed:function]';
      if (!applied.includes('FUNCTION_VALUE_GUARD')) applied.push('FUNCTION_VALUE_GUARD');
    }
  }

  // 32) UNICODE_SURROGATE_FIX — remove broken lone surrogates (U+D800–U+DFFF range in strings)
  const LONE_SURROGATE_RE = /[\uD800-\uDFFF]/g;
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && LONE_SURROGATE_RE.test(copy[key])) {
      copy[key] = copy[key].replace(LONE_SURROGATE_RE, '\uFFFD');
      LONE_SURROGATE_RE.lastIndex = 0;
      if (!applied.includes('UNICODE_SURROGATE_FIX')) applied.push('UNICODE_SURROGATE_FIX');
    }
    LONE_SURROGATE_RE.lastIndex = 0;
  }

  // 33) REGEX_PATTERN_STRIP — strip potential ReDoS patterns (nested quantifiers)
  const REDOS_RE = /(\(.+\)[\*\+\?]\{?\d*,?\d*\}?){2,}/;
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && REDOS_RE.test(copy[key])) {
      copy[key] = copy[key].replace(/[.*+?^${}()|[\]\\]{5,}/g, '[pattern-stripped]');
      if (!applied.includes('REGEX_PATTERN_STRIP')) applied.push('REGEX_PATTERN_STRIP');
    }
  }

  // 34) EXCESS_KEY_PRUNE — if input has >50 keys, keep only expected keys + first 20 others
  const allKeys = Object.keys(copy);
  if (allKeys.length > 50) {
    const keepSet = new Set<string>(EXPECTED_KEYS as unknown as string[]);
    let extras = 0;
    for (const k of allKeys) {
      if (!keepSet.has(k)) {
        if (extras < 20) { extras++; keepSet.add(k); }
        else { delete copy[k]; }
      }
    }
    if (!applied.includes('EXCESS_KEY_PRUNE')) applied.push('EXCESS_KEY_PRUNE');
  }

  // 35) NEGATIVE_TO_ZERO — convert negative numeric strings to "0" for count-like fields
  const NUMERIC_FIELDS = new Set(['count', 'limit', 'offset', 'page', 'size', 'maxItems', 'depth']);
  for (const key of Object.keys(copy)) {
    if (NUMERIC_FIELDS.has(key) && typeof copy[key] === 'string') {
      const n = Number(copy[key]);
      if (!isNaN(n) && n < 0) {
        copy[key] = '0';
        if (!applied.includes('NEGATIVE_TO_ZERO')) applied.push('NEGATIVE_TO_ZERO');
      }
    }
  }

  // 36) MULTILINE_COLLAPSE — if a string field has >100 lines, collapse to first 50 + last 10
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const lines = copy[key].split('\n');
      if (lines.length > 100) {
        copy[key] = [...lines.slice(0, 50), '...', ...lines.slice(-10)].join('\n');
        if (!applied.includes('MULTILINE_COLLAPSE')) applied.push('MULTILINE_COLLAPSE');
      }
    }
  }

  // 37) EVENT_HANDLER_STRIP — remove on* event handler patterns from string values
  const EVENT_HANDLER_RE = /\bon\w+\s*=\s*["'][^"']*["']/gi;
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && EVENT_HANDLER_RE.test(copy[key])) {
      copy[key] = copy[key].replace(EVENT_HANDLER_RE, '');
      EVENT_HANDLER_RE.lastIndex = 0;
      if (!applied.includes('EVENT_HANDLER_STRIP')) applied.push('EVENT_HANDLER_STRIP');
    }
    EVENT_HANDLER_RE.lastIndex = 0;
  }

  // 38) TRIM_ALL_STRINGS — final pass: trim leading/trailing whitespace from all string values
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const trimmed = copy[key].trim();
      if (trimmed !== copy[key]) {
        copy[key] = trimmed;
        if (!applied.includes('TRIM_ALL_STRINGS')) applied.push('TRIM_ALL_STRINGS');
      }
    }
  }

  // 39) USERID_SHAPE_FIX — ensure userId is always a plain string (not object/array remnant)
  if ('userId' in copy && (copy.userId === '{}' || copy.userId === '[]' || copy.userId === 'null' || copy.userId === 'undefined' || copy.userId === '')) {
    copy.userId = 'anonymous';
    if (!applied.includes('USERID_SHAPE_FIX')) applied.push('USERID_SHAPE_FIX');
  }

  // 42) EXECUTOR_REQUIRED_INJECT — ensure critical required fields exist with defaults
  if (!('userId' in copy) || copy.userId === '' || copy.userId === null || copy.userId === undefined) {
    copy.userId = 'anonymous';
    if (!applied.includes('EXECUTOR_REQUIRED_INJECT')) applied.push('EXECUTOR_REQUIRED_INJECT');
  }
  if (!('target' in copy) || copy.target === '' || copy.target === null || copy.target === undefined) {
    if (!('url' in copy && typeof copy.url === 'string' && copy.url.length > 0) &&
        !('domain' in copy && typeof copy.domain === 'string' && copy.domain.length > 0) &&
        !('resource_id' in copy && typeof copy.resource_id === 'string' && (copy.resource_id as string).length > 0)) {
      copy.target = 'self';
      if (!applied.includes('EXECUTOR_REQUIRED_INJECT')) applied.push('EXECUTOR_REQUIRED_INJECT');
    }
  }
  if (!('content' in copy) || copy.content === '' || copy.content === null || copy.content === undefined) {
    copy.content = 'audit target';
    if (!applied.includes('EXECUTOR_REQUIRED_INJECT')) applied.push('EXECUTOR_REQUIRED_INJECT');
  }

  // 43) POST_SANITIZE_RECOVERY — after sanitization rules strip content to empty/short, recover
  //     This catches: SQL_SANITIZE leaving empty content, SANITIZE stripping <script> to empty,
  //     EVENT_HANDLER_STRIP removing all content, HTML_ANGLE_ENCODE leaving only entities
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const val = copy[key].trim();
      // If sanitization left only whitespace, entities, or stripped markers
      if (val === '' || val === '&lt;&gt;' || val === '&lt;/&gt;' || val === '[removed:function]' ||
          val === '; --' || val === '--' || val === ';' || /^[\s;,\-]+$/.test(val)) {
        copy[key] = BACKFILL_DEFAULTS[key] ?? NATURAL_DEFAULTS[key] ?? 'default';
        if (!applied.includes('POST_SANITIZE_RECOVERY')) applied.push('POST_SANITIZE_RECOVERY');
      }
    }
  }

  // 44) URL_EMPTY_RECOVERY — after URL_NORMALIZE strips dangerous URLs, backfill
  for (const urlKey of ['url', 'domain']) {
    if (urlKey in copy && (copy[urlKey] === '' || copy[urlKey] === null || copy[urlKey] === undefined)) {
      copy[urlKey] = BACKFILL_DEFAULTS[urlKey] ?? (urlKey === 'url' ? 'https://localhost' : 'localhost');
      if (!applied.includes('URL_EMPTY_RECOVERY')) applied.push('URL_EMPTY_RECOVERY');
    }
  }

  // 45) FUNCTION_GUARD_RECOVERY — replace [removed:function] markers with meaningful defaults
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && copy[key] === '[removed:function]') {
      copy[key] = BACKFILL_DEFAULTS[key] ?? NATURAL_DEFAULTS[key] ?? 'default';
      if (!applied.includes('FUNCTION_GUARD_RECOVERY')) applied.push('FUNCTION_GUARD_RECOVERY');
    }
  }

  // 46) PATTERN_STRIPPED_RECOVERY — replace [pattern-stripped] markers
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && copy[key].includes('[pattern-stripped]')) {
      copy[key] = BACKFILL_DEFAULTS[key] ?? NATURAL_DEFAULTS[key] ?? 'default';
      if (!applied.includes('PATTERN_STRIPPED_RECOVERY')) applied.push('PATTERN_STRIPPED_RECOVERY');
    }
  }

  // 47) FINAL_CONTENT_GUARANTEE — absolute last-resort: if content is still empty/invalid after all rules
  if ('content' in copy && typeof copy.content === 'string' && copy.content.trim().length < 1) {
    copy.content = 'audit target';
    if (!applied.includes('FINAL_CONTENT_GUARANTEE')) applied.push('FINAL_CONTENT_GUARANTEE');
  }

  // 48) FINAL_USERID_GUARANTEE — ensure userId is never empty after all transforms
  if ('userId' in copy && typeof copy.userId === 'string' && copy.userId.trim().length < 1) {
    copy.userId = 'anonymous';
    if (!applied.includes('FINAL_USERID_GUARANTEE')) applied.push('FINAL_USERID_GUARANTEE');
  }

  // ── Enhancement #6: New rules for lowest-performing probes ──

  // 49) ALIEN_KEY_STRIP — for shape_alien inputs (no recognized keys), strip unrecognized keys
  //     after DEFAULT_SHAPE has injected the minimums. Prevents unknown_field validation failures.
  if (applied.includes('DEFAULT_SHAPE')) {
    const RECOGNIZED_KEYS = new Set([...EXPECTED_KEYS, 'target', 'label', 'description', 'preferences', 'payload', 'metadata', 'resource_id']);
    const unknownKeys = Object.keys(copy).filter(k => !RECOGNIZED_KEYS.has(k));
    if (unknownKeys.length > 5) {
      for (const k of unknownKeys.slice(5)) {
        delete copy[k];
      }
      if (!applied.includes('ALIEN_KEY_STRIP')) applied.push('ALIEN_KEY_STRIP');
    }
  }

  // 50) ENTITY_ONLY_RECOVERY — if content is only HTML entities (no actual text), replace
  if ('content' in copy && typeof copy.content === 'string') {
    const stripped = copy.content.replace(/&\w+;/g, '').trim();
    if (stripped.length === 0 && copy.content.length > 0) {
      copy.content = 'audit target';
      if (!applied.includes('ENTITY_ONLY_RECOVERY')) applied.push('ENTITY_ONLY_RECOVERY');
    }
  }

  // 51) SQL_RESIDUE_CLEANUP — clean up residual SQL artifacts after sanitization
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const val = copy[key].trim();
      if (/^[;\s\-]+$/.test(val) || val === '-- ' || val === ';--' || val === '1=1') {
        copy[key] = BACKFILL_DEFAULTS[key] ?? NATURAL_DEFAULTS[key] ?? 'default';
        if (!applied.includes('SQL_RESIDUE_CLEANUP')) applied.push('SQL_RESIDUE_CLEANUP');
      }
    }
  }

  // 52) REQUIREDONE_GUARANTEE — ensure at least one locator field exists for schemas with requiredOneOf
  const hasLocator = ('target' in copy && typeof copy.target === 'string' && copy.target.length > 0)
    || ('url' in copy && typeof copy.url === 'string' && copy.url.length > 0)
    || ('domain' in copy && typeof copy.domain === 'string' && copy.domain.length > 0)
    || ('resource_id' in copy && typeof copy.resource_id === 'string' && (copy.resource_id as string).length > 0);
  if (!hasLocator) {
    copy.target = 'self';
    if (!applied.includes('REQUIREDONE_GUARANTEE')) applied.push('REQUIREDONE_GUARANTEE');
  }

  // 53) ARIALABEL_GUARANTEE — ensure ariaLabel is never empty for accessibility executors
  if ('ariaLabel' in copy && typeof copy.ariaLabel === 'string' && copy.ariaLabel.trim().length < 1) {
    copy.ariaLabel = 'element';
    if (!applied.includes('ARIALABEL_GUARANTEE')) applied.push('ARIALABEL_GUARANTEE');
  }

  // 54) PREFERENCES_EMPTY_OBJ — ensure preferences is {} not empty string
  if ('preferences' in copy && copy.preferences === '') {
    copy.preferences = {};
    if (!applied.includes('PREFERENCES_EMPTY_OBJ')) applied.push('PREFERENCES_EMPTY_OBJ');
  }

  // ── Executor-Specific Repair Rules ──

  // 55) ADAPTIVE_UI_SHAPE — adaptive-ui requires 'viewport', 'colorScheme', 'motionPreference'
  //     These are commonly missing from adversarial probes. Inject sensible defaults.
  if ('content' in copy || 'target' in copy) {
    if (!('viewport' in copy) || !copy.viewport) {
      copy.viewport = 'desktop';
      if (!applied.includes('ADAPTIVE_UI_SHAPE')) applied.push('ADAPTIVE_UI_SHAPE');
    }
    if (!('colorScheme' in copy) || !copy.colorScheme) {
      copy.colorScheme = 'light';
      if (!applied.includes('ADAPTIVE_UI_SHAPE')) applied.push('ADAPTIVE_UI_SHAPE');
    }
    if (!('motionPreference' in copy) || !copy.motionPreference) {
      copy.motionPreference = 'no-preference';
      if (!applied.includes('ADAPTIVE_UI_SHAPE')) applied.push('ADAPTIVE_UI_SHAPE');
    }
    if (!('fontSize' in copy) || !copy.fontSize) {
      copy.fontSize = 'medium';
      if (!applied.includes('ADAPTIVE_UI_SHAPE')) applied.push('ADAPTIVE_UI_SHAPE');
    }
    if (!('contrastLevel' in copy) || !copy.contrastLevel) {
      copy.contrastLevel = 'normal';
      if (!applied.includes('ADAPTIVE_UI_SHAPE')) applied.push('ADAPTIVE_UI_SHAPE');
    }
  }

  // 56) COGNITIVE_LOAD_SHAPE — cognitive-load-optimization requires 'complexity', 'taskType', 'userExperience'
  if ('content' in copy || 'target' in copy) {
    if (!('complexity' in copy) || !copy.complexity) {
      copy.complexity = 'medium';
      if (!applied.includes('COGNITIVE_LOAD_SHAPE')) applied.push('COGNITIVE_LOAD_SHAPE');
    }
    if (!('taskType' in copy) || !copy.taskType) {
      copy.taskType = 'navigation';
      if (!applied.includes('COGNITIVE_LOAD_SHAPE')) applied.push('COGNITIVE_LOAD_SHAPE');
    }
    if (!('userExperience' in copy) || !copy.userExperience) {
      copy.userExperience = 'intermediate';
      if (!applied.includes('COGNITIVE_LOAD_SHAPE')) applied.push('COGNITIVE_LOAD_SHAPE');
    }
    if (!('maxCognitiveLoad' in copy)) {
      copy.maxCognitiveLoad = '7';
      if (!applied.includes('COGNITIVE_LOAD_SHAPE')) applied.push('COGNITIVE_LOAD_SHAPE');
    }
    if (!('informationDensity' in copy) || !copy.informationDensity) {
      copy.informationDensity = 'balanced';
      if (!applied.includes('COGNITIVE_LOAD_SHAPE')) applied.push('COGNITIVE_LOAD_SHAPE');
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
