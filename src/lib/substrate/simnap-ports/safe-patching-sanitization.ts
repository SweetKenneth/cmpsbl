/**
 * Safe File Patching & Input Sanitization — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Versioned surgical patches with BEFORE/AFTER diffs,
 * input sanitization pipeline, and secure FS access patterns.
 * 
 * Consumers: ENCODE, EVOLUTION, DEFENSE, RELAY, IDENTITY
 * Origin: safe-patching.ts, input-sanitization.ts
 */

// ── Safe Patching Types ───────────────────────────────────────────

export interface PatchOperation {
  id: string;
  target: string;              // file path or resource identifier
  type: 'insert' | 'replace' | 'delete' | 'append';
  before: string;              // snapshot before
  after: string;               // expected after
  rationale: string;
  author: string;              // originating module
  createdAt: number;
  appliedAt: number | null;
  rolledBackAt: number | null;
  version: number;
}

export interface PatchResult {
  success: boolean;
  patchId: string;
  applied: boolean;
  error?: string;
  diff: { additions: number; deletions: number };
}

export interface PatchHistory {
  patches: PatchOperation[];
  totalApplied: number;
  totalRolledBack: number;
  totalFailed: number;
}

// ── Patch Engine ──────────────────────────────────────────────────

const patchStore: PatchOperation[] = [];
let patchVersion = 0;

/**
 * Create a patch operation (does not apply it)
 */
export function createPatch(
  target: string,
  type: PatchOperation['type'],
  before: string,
  after: string,
  rationale: string,
  author: string
): PatchOperation {
  patchVersion++;
  const patch: PatchOperation = {
    id: crypto.randomUUID(),
    target,
    type,
    before,
    after,
    rationale,
    author,
    createdAt: Date.now(),
    appliedAt: null,
    rolledBackAt: null,
    version: patchVersion,
  };
  patchStore.push(patch);
  return patch;
}

/**
 * Validate a patch can be safely applied
 * Checks that the current state matches the expected 'before'
 */
export function validatePatch(
  patch: PatchOperation,
  currentContent: string
): { valid: boolean; reason?: string } {
  if (patch.appliedAt) return { valid: false, reason: 'Patch already applied' };
  if (patch.rolledBackAt) return { valid: false, reason: 'Patch was rolled back' };

  if (patch.type === 'replace' || patch.type === 'delete') {
    if (!currentContent.includes(patch.before)) {
      return { valid: false, reason: 'Current content does not match expected before-state' };
    }
  }

  return { valid: true };
}

/**
 * Apply a patch to content (pure function — returns new content)
 */
export function applyPatch(patch: PatchOperation, currentContent: string): PatchResult {
  const validation = validatePatch(patch, currentContent);
  if (!validation.valid) {
    return { success: false, patchId: patch.id, applied: false, error: validation.reason, diff: { additions: 0, deletions: 0 } };
  }

  let result: string;
  switch (patch.type) {
    case 'insert':
      result = patch.after + currentContent;
      break;
    case 'append':
      result = currentContent + patch.after;
      break;
    case 'replace':
      result = currentContent.replace(patch.before, patch.after);
      break;
    case 'delete':
      result = currentContent.replace(patch.before, '');
      break;
  }

  patch.appliedAt = Date.now();

  const additions = patch.after.split('\n').length;
  const deletions = patch.before.split('\n').length;

  return {
    success: true,
    patchId: patch.id,
    applied: true,
    diff: { additions, deletions },
  };
}

/**
 * Get patch history for a target
 */
export function getPatchHistory(target?: string): PatchHistory {
  const filtered = target
    ? patchStore.filter(p => p.target === target)
    : patchStore;

  return {
    patches: [...filtered],
    totalApplied: filtered.filter(p => p.appliedAt && !p.rolledBackAt).length,
    totalRolledBack: filtered.filter(p => p.rolledBackAt).length,
    totalFailed: filtered.filter(p => !p.appliedAt && !p.rolledBackAt).length,
  };
}

// ── Input Sanitization ────────────────────────────────────────────

export interface SanitizationRule {
  id: string;
  name: string;
  /** Pattern to detect */
  pattern: RegExp;
  /** Action to take */
  action: 'strip' | 'escape' | 'reject' | 'replace';
  /** Replacement value (for 'replace' action) */
  replacement?: string;
  /** Severity if detected */
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SanitizationResult {
  original: string;
  sanitized: string;
  violations: Array<{ rule: string; severity: string; match: string }>;
  safe: boolean;
}

/**
 * Default sanitization rules
 */
export const DEFAULT_SANITIZATION_RULES: SanitizationRule[] = [
  {
    id: 'xss_script',
    name: 'XSS Script Tag',
    pattern: /<script[\s>]/gi,
    action: 'strip',
    severity: 'critical',
  },
  {
    id: 'xss_event_handler',
    name: 'XSS Event Handler',
    pattern: /\bon\w+\s*=/gi,
    action: 'strip',
    severity: 'high',
  },
  {
    id: 'sql_injection',
    name: 'SQL Injection Attempt',
    pattern: /('|"|;|--|\b(DROP|DELETE|INSERT|UPDATE|ALTER|EXEC)\b)/gi,
    action: 'escape',
    severity: 'critical',
  },
  {
    id: 'path_traversal',
    name: 'Path Traversal',
    pattern: /\.\.\//g,
    action: 'strip',
    severity: 'high',
  },
  {
    id: 'null_bytes',
    name: 'Null Byte Injection',
    pattern: /\0/g,
    action: 'strip',
    severity: 'critical',
  },
  {
    id: 'command_injection',
    name: 'Command Injection',
    pattern: /[;&|`$()]/g,
    action: 'escape',
    severity: 'high',
  },
  {
    id: 'excessive_whitespace',
    name: 'Excessive Whitespace',
    pattern: /\s{10,}/g,
    action: 'replace',
    replacement: ' ',
    severity: 'low',
  },
];

/**
 * Sanitize input against a set of rules
 */
export function sanitizeInput(
  input: string,
  rules: SanitizationRule[] = DEFAULT_SANITIZATION_RULES
): SanitizationResult {
  let sanitized = input;
  const violations: SanitizationResult['violations'] = [];

  for (const rule of rules) {
    const matches = sanitized.match(rule.pattern);
    if (!matches) continue;

    violations.push({
      rule: rule.name,
      severity: rule.severity,
      match: matches[0],
    });

    switch (rule.action) {
      case 'strip':
        sanitized = sanitized.replace(rule.pattern, '');
        break;
      case 'escape':
        sanitized = sanitized.replace(rule.pattern, match =>
          match.split('').map(c => `&#${c.charCodeAt(0)};`).join('')
        );
        break;
      case 'replace':
        sanitized = sanitized.replace(rule.pattern, rule.replacement ?? '');
        break;
      case 'reject':
        return {
          original: input,
          sanitized: '',
          violations,
          safe: false,
        };
    }
  }

  return {
    original: input,
    sanitized: sanitized.trim(),
    violations,
    safe: violations.filter(v => v.severity === 'critical').length === 0,
  };
}

/**
 * Validate and constrain string length
 */
export function constrainInput(
  input: string,
  maxLength: number = 10000,
  allowedPattern?: RegExp
): { value: string; truncated: boolean; valid: boolean } {
  const truncated = input.length > maxLength;
  const value = truncated ? input.slice(0, maxLength) : input;
  const valid = allowedPattern ? allowedPattern.test(value) : true;
  return { value, truncated, valid };
}
