/**
 * IMMUNITY — Schema-Driven Validation & Input Archetypes
 * 
 * Per-executor input schemas with structured validation reports
 * and archetype classification for targeted repair selection.
 */

export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  enum?: string[];
  default?: unknown;
}

export interface ExecutorSchema {
  executor: string;
  fields: Record<string, FieldSchema>;
  /** At least one of these fields must be present */
  requiredOneOf?: string[];
}

export interface ValidationIssue {
  field: string;
  issue: 'missing' | 'wrong_type' | 'too_short' | 'too_long' | 'invalid_enum' | 'unknown_field';
  expected?: string;
  got?: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  archetype: InputArchetype;
  confidence: number; // 0-1, how well-formed the input is
}

/**
 * Input Archetype (#6) — clusters malformed inputs into categories
 * so the repair pipeline can apply targeted strategies.
 */
export type InputArchetype =
  | 'well_formed'       // passes schema
  | 'empty_shell'       // {} or all nulls
  | 'type_mismatch'     // right keys, wrong types
  | 'missing_required'  // missing critical fields
  | 'oversized'         // values too large
  | 'injection_attempt' // XSS/SQL patterns detected
  | 'shape_alien'       // no recognized keys at all
  | 'partial_valid';    // some fields valid, some not

// ═══════════════════════════════════════════════════════════════════════════
// PILOT EXECUTOR SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const SCHEMAS: Record<string, ExecutorSchema> = {
  // ── INCLUSIVE MODULE ──
  'adaptive-ui': {
    executor: 'adaptive-ui',
    fields: {
      target: { type: 'string', default: 'self', maxLength: 2000 },
      url: { type: 'string', maxLength: 2000 },
      resource_id: { type: 'string', maxLength: 500 },
      content: { type: 'string', maxLength: 10000 },
    },
    requiredOneOf: ['target', 'url', 'resource_id'],
  },
  'cognitive-load-optimization': {
    executor: 'cognitive-load-optimization',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      target: { type: 'string', maxLength: 2000 },
    },
  },
  'comprehensive-accessibility-audit': {
    executor: 'comprehensive-accessibility-audit',
    fields: {
      wcagLevel: { type: 'string', enum: ['A', 'AA', 'AAA'], default: 'AA' },
      url: { type: 'string', maxLength: 2000 },
      target: { type: 'string', maxLength: 2000 },
      domain: { type: 'string', maxLength: 500 },
    },
    requiredOneOf: ['url', 'target', 'domain'],
  },
  'personalized-accessibility-engine': {
    executor: 'personalized-accessibility-engine',
    fields: {
      userId: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      preferences: { type: 'object' },
      content: { type: 'string', maxLength: 10000 },
    },
  },
  'inclusive-content': {
    executor: 'inclusive-content',
    fields: {
      content: { type: 'string', required: true, maxLength: 10000 },
      ariaLabel: { type: 'string', maxLength: 1000 },
      target: { type: 'string', maxLength: 2000 },
    },
  },

  // ── COGNITIVE MODULE ──
  'reasoning-engine': {
    executor: 'reasoning-engine',
    fields: {
      query: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      context: { type: 'object' },
      constraints: { type: 'object' },
      depth: { type: 'number' },
      traceId: { type: 'string', maxLength: 200 },
    },
  },
  'learning-engine': {
    executor: 'learning-engine',
    fields: {
      signal: { type: 'string', required: true, minLength: 1, maxLength: 5000 },
      domain: { type: 'string', maxLength: 500 },
      feedback: { type: 'object' },
      reinforcement: { type: 'number' },
      source: { type: 'string', maxLength: 200 },
    },
  },
  'imagination-engine': {
    executor: 'imagination-engine',
    fields: {
      prompt: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      mode: { type: 'string', enum: ['GENERATE', 'SYNTHESIZE', 'EXPLORE', 'COMPOSE'] },
      constraints: { type: 'object' },
      creativity: { type: 'number' },
      seed: { type: 'string', maxLength: 200 },
    },
  },

  // ── OPERATIONAL MODULE ──
  'relay-event-dispatcher': {
    executor: 'relay-event-dispatcher',
    fields: {
      event: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      payload: { type: 'object' },
      target: { type: 'string', maxLength: 500 },
      priority: { type: 'number' },
      channel: { type: 'string', maxLength: 200 },
    },
  },
  'economy-cost-tracker': {
    executor: 'economy-cost-tracker',
    fields: {
      action: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      module: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      tokens: { type: 'number' },
      computeMs: { type: 'number' },
      costMillicents: { type: 'number' },
    },
  },
  'audit-compliance-check': {
    executor: 'audit-compliance-check',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      standard: { type: 'string', enum: ['WCAG', 'ADA', 'GDPR', 'SOC2', 'GENERAL'], default: 'GENERAL' },
      domain: { type: 'string', maxLength: 500 },
      severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    },
  },

  // ── ORCHESTRATOR MODULE ──
  'mesh-pipeline-resolver': {
    executor: 'mesh-pipeline-resolver',
    fields: {
      intent: { type: 'string', required: true, minLength: 1, maxLength: 2000 },
      modules: { type: 'array' },
      constraints: { type: 'object' },
      priority: { type: 'number' },
      traceId: { type: 'string', maxLength: 200 },
    },
  },
  'seba-proposal-evaluator': {
    executor: 'seba-proposal-evaluator',
    fields: {
      proposal: { type: 'string', required: true, minLength: 1, maxLength: 5000 },
      impactMetrics: { type: 'object' },
      riskLevel: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
      module: { type: 'string', maxLength: 200 },
      confidence: { type: 'number' },
    },
  },

  // ── INFRASTRUCTURE MODULE ──
  'memory-consolidation-engine': {
    executor: 'memory-consolidation-engine',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      userId: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      target: { type: 'string', maxLength: 500 },
      action: { type: 'string', enum: ['CONSOLIDATE', 'PROMOTE', 'DEMOTE', 'ARCHIVE'], default: 'CONSOLIDATE' },
    },
  },
  'identity-verification-engine': {
    executor: 'identity-verification-engine',
    fields: {
      userId: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      action: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      content: { type: 'string', maxLength: 10000 },
      token: { type: 'string', maxLength: 2000 },
    },
  },
  'sandbox-isolation-guard': {
    executor: 'sandbox-isolation-guard',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      userId: { type: 'string', maxLength: 500 },
      boundary: { type: 'string', enum: ['STRICT', 'PERMISSIVE', 'SANDBOX'], default: 'STRICT' },
    },
  },
  'encode-task-scheduler': {
    executor: 'encode-task-scheduler',
    fields: {
      action: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      content: { type: 'string', maxLength: 10000 },
      target: { type: 'string', maxLength: 500 },
      priority: { type: 'number' },
      scheduledAt: { type: 'string', maxLength: 100 },
    },
  },

  // ── INTELLIGENCE MODULE ──
  'dream-pattern-synthesizer': {
    executor: 'dream-pattern-synthesizer',
    fields: {
      prompt: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      content: { type: 'string', maxLength: 10000 },
      userId: { type: 'string', maxLength: 500 },
      mode: { type: 'string', enum: ['SYNTHESIZE', 'EXPLORE', 'COMPOSE'] },
    },
  },
  'decode-intent-classifier': {
    executor: 'decode-intent-classifier',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      query: { type: 'string', maxLength: 5000 },
      userId: { type: 'string', maxLength: 500 },
      context: { type: 'object' },
    },
  },
  'vision-anomaly-detector': {
    executor: 'vision-anomaly-detector',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      userId: { type: 'string', maxLength: 500 },
      threshold: { type: 'number' },
    },
  },

  // ── INCLUSIVE MODULE (new Phase 1) ──
  'contrast-ratio-analyzer': {
    executor: 'contrast-ratio-analyzer',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      foreground: { type: 'string', maxLength: 50 },
      background: { type: 'string', maxLength: 50 },
      target: { type: 'string', maxLength: 2000 },
    },
  },
  'focus-management-engine': {
    executor: 'focus-management-engine',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      target: { type: 'string', required: true, minLength: 1, maxLength: 2000 },
      action: { type: 'string', enum: ['TRAP', 'RELEASE', 'MOVE', 'RESTORE'] },
      userId: { type: 'string', maxLength: 500 },
    },
  },
  // ── COGNITIVE MODULE (new Phase 1) ──
  'semantic-analysis-engine': {
    executor: 'semantic-analysis-engine',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      query: { type: 'string', maxLength: 5000 },
      depth: { type: 'number' },
      context: { type: 'object' },
    },
  },
  'context-window-manager': {
    executor: 'context-window-manager',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 50000 },
      action: { type: 'string', enum: ['EXPAND', 'SHRINK', 'SLIDE', 'RESET'] },
      windowSize: { type: 'number' },
      userId: { type: 'string', maxLength: 500 },
    },
  },
  // ── OPERATIONAL MODULE (new Phase 1) ──
  'rate-limiter-engine': {
    executor: 'rate-limiter-engine',
    fields: {
      action: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      limit: { type: 'number' },
      windowMs: { type: 'number' },
      userId: { type: 'string', maxLength: 500 },
    },
  },
  'telemetry-aggregator': {
    executor: 'telemetry-aggregator',
    fields: {
      event: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      module: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      payload: { type: 'object' },
      timestamp: { type: 'string', maxLength: 100 },
    },
  },
  // ── ORCHESTRATOR MODULE (new Phase 1) ──
  'workflow-orchestrator': {
    executor: 'workflow-orchestrator',
    fields: {
      intent: { type: 'string', required: true, minLength: 1, maxLength: 2000 },
      steps: { type: 'array' },
      constraints: { type: 'object' },
      priority: { type: 'number' },
      traceId: { type: 'string', maxLength: 200 },
    },
  },
  'dependency-resolver': {
    executor: 'dependency-resolver',
    fields: {
      module: { type: 'string', required: true, minLength: 1, maxLength: 200 },
      action: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      dependencies: { type: 'array' },
      context: { type: 'object' },
    },
  },
  // ── INFRASTRUCTURE MODULE (new Phase 1) ──
  'cache-invalidation-engine': {
    executor: 'cache-invalidation-engine',
    fields: {
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      action: { type: 'string', enum: ['INVALIDATE', 'REFRESH', 'PURGE', 'WARM'] },
      pattern: { type: 'string', maxLength: 1000 },
      userId: { type: 'string', maxLength: 500 },
    },
  },
  'config-propagation-engine': {
    executor: 'config-propagation-engine',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      action: { type: 'string', enum: ['PUSH', 'PULL', 'SYNC', 'VALIDATE'] },
      version: { type: 'string', maxLength: 50 },
    },
  },
  'health-check-coordinator': {
    executor: 'health-check-coordinator',
    fields: {
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      action: { type: 'string', enum: ['CHECK', 'REPORT', 'HEAL', 'ESCALATE'] },
      module: { type: 'string', maxLength: 200 },
      threshold: { type: 'number' },
    },
  },
  // ── INTELLIGENCE MODULE (new Phase 1) ──
  'sentiment-drift-analyzer': {
    executor: 'sentiment-drift-analyzer',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      baseline: { type: 'number' },
      window: { type: 'number' },
      userId: { type: 'string', maxLength: 500 },
    },
  },
  'temporal-pattern-engine': {
    executor: 'temporal-pattern-engine',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      query: { type: 'string', maxLength: 5000 },
      timeRange: { type: 'string', maxLength: 100 },
      granularity: { type: 'string', enum: ['MINUTE', 'HOUR', 'DAY', 'WEEK'] },
    },
  },
  'correlation-discovery-engine': {
    executor: 'correlation-discovery-engine',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      target: { type: 'string', required: true, minLength: 1, maxLength: 500 },
      minCorrelation: { type: 'number' },
      context: { type: 'object' },
    },
  },
  'signal-noise-separator': {
    executor: 'signal-noise-separator',
    fields: {
      content: { type: 'string', required: true, minLength: 1, maxLength: 10000 },
      threshold: { type: 'number' },
      mode: { type: 'string', enum: ['FILTER', 'CLASSIFY', 'EXTRACT'] },
      userId: { type: 'string', maxLength: 500 },
    },
  },
};

/** Matches SQL keywords followed by whitespace or special chars — catches "SELECT*", "DROP\nTABLE", etc. */
const SQL_INJECT_RE = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|CREATE|EXEC)\b[\s*(/;,]/i;
const XSS_RE = /<script[\s\S]*?<\/script>/gi;

/**
 * Validate input against an executor's schema.
 * Returns a detailed report with archetype classification.
 */
export function validateInput(
  executorName: string,
  input: Record<string, unknown>,
): ValidationReport {
  const schema = SCHEMAS[executorName];
  if (!schema) {
    // No schema = fall back to basic check
    const keys = Object.keys(input);
    return {
      valid: keys.length > 0,
      issues: [],
      archetype: keys.length === 0 ? 'empty_shell' : 'well_formed',
      confidence: keys.length > 0 ? 0.5 : 0,
    };
  }

  const issues: ValidationIssue[] = [];
  const inputKeys = new Set(Object.keys(input));

  // Check for empty shell
  if (inputKeys.size === 0 || Object.values(input).every(v => v === null || v === undefined || v === '')) {
    return { valid: false, issues: [{ field: '*', issue: 'missing' }], archetype: 'empty_shell', confidence: 0 };
  }

  // Check required fields
  for (const [field, spec] of Object.entries(schema.fields)) {
    const val = input[field];

    if (spec.required && (val === null || val === undefined || val === '')) {
      issues.push({ field, issue: 'missing', expected: spec.type });
      continue;
    }

    if (val === null || val === undefined) continue;

    // Type check — covers ALL schema types including number and boolean
    if (spec.type === 'string' && typeof val !== 'string') {
      issues.push({ field, issue: 'wrong_type', expected: 'string', got: typeof val });
    } else if (spec.type === 'number' && typeof val !== 'number') {
      issues.push({ field, issue: 'wrong_type', expected: 'number', got: typeof val });
    } else if (spec.type === 'boolean' && typeof val !== 'boolean') {
      issues.push({ field, issue: 'wrong_type', expected: 'boolean', got: typeof val });
    } else if (spec.type === 'object' && (typeof val !== 'object' || Array.isArray(val))) {
      issues.push({ field, issue: 'wrong_type', expected: 'object', got: Array.isArray(val) ? 'array' : typeof val });
    } else if (spec.type === 'array' && !Array.isArray(val)) {
      issues.push({ field, issue: 'wrong_type', expected: 'array', got: typeof val });
    }

    // String-specific checks
    if (typeof val === 'string') {
      if (spec.minLength && val.length < spec.minLength) {
        issues.push({ field, issue: 'too_short', expected: `>=${spec.minLength}` });
      }
      if (spec.maxLength && val.length > spec.maxLength) {
        issues.push({ field, issue: 'too_long', expected: `<=${spec.maxLength}` });
      }
      if (spec.enum && !spec.enum.includes(val.toUpperCase())) {
        issues.push({ field, issue: 'invalid_enum', expected: spec.enum.join('|'), got: val });
      }
    }
  }

  // requiredOneOf check
  if (schema.requiredOneOf) {
    const hasOne = schema.requiredOneOf.some(f => {
      const v = input[f];
      return v !== null && v !== undefined && v !== '';
    });
    if (!hasOne) {
      issues.push({ field: schema.requiredOneOf.join('|'), issue: 'missing', expected: 'at least one' });
    }
  }

  // Check for injection patterns
  // CRITICAL: Reset lastIndex BEFORE testing — XSS_RE has global flag,
  // stale lastIndex causes intermittent detection failures (root cause of
  // injection_attempt inputs leaking through to escalation queue).
  let hasInjection = false;
  const EVENT_HANDLER_INJECT_RE = /\bon\w+\s*=/i;
  for (const val of Object.values(input)) {
    if (typeof val === 'string') {
      SQL_INJECT_RE.lastIndex = 0;
      XSS_RE.lastIndex = 0;
      if (SQL_INJECT_RE.test(val) || XSS_RE.test(val) || EVENT_HANDLER_INJECT_RE.test(val)) {
        hasInjection = true;
        break;
      }
      SQL_INJECT_RE.lastIndex = 0;
      XSS_RE.lastIndex = 0;
    }
  }

  // Check for unknown fields
  const schemaKeys = new Set(Object.keys(schema.fields));
  for (const k of inputKeys) {
    if (!schemaKeys.has(k)) {
      issues.push({ field: k, issue: 'unknown_field' });
    }
  }

  // Classify archetype
  const archetype = classifyArchetype(issues, hasInjection, inputKeys, schemaKeys);
  // Enhancement #7: Smarter confidence — unknown_field issues penalize less than structural issues
  const structuralIssues = issues.filter(i => i.issue !== 'unknown_field').length;
  const unknownFieldIssues = issues.filter(i => i.issue === 'unknown_field').length;
  const confidence = issues.length === 0 ? 1.0 : Math.max(0, 1 - (structuralIssues * 0.2) - (unknownFieldIssues * 0.03));

  return {
    valid: issues.filter(i => i.issue !== 'unknown_field').length === 0,
    issues,
    archetype,
    confidence,
  };
}

function classifyArchetype(
  issues: ValidationIssue[],
  hasInjection: boolean,
  inputKeys: Set<string>,
  schemaKeys: Set<string>,
): InputArchetype {
  if (issues.length === 0) return 'well_formed';
  if (hasInjection) return 'injection_attempt';

  const typeMismatches = issues.filter(i => i.issue === 'wrong_type').length;
  const missing = issues.filter(i => i.issue === 'missing').length;
  const oversized = issues.filter(i => i.issue === 'too_long').length;
  const unknowns = issues.filter(i => i.issue === 'unknown_field').length;
  const structuralIssues = typeMismatches + missing + oversized;

  // If the ONLY issues are unknown fields, the input is effectively well-formed.
  // Unknown fields don't affect executor functionality — they're just extra keys.
  // This prevents inflated repair rates from adversarial inputs that have valid
  // required fields but also carry extra unknown keys.
  if (structuralIssues === 0 && unknowns > 0) return 'well_formed';

  // If ALL keys are unknown, it's an alien shape
  const knownCount = [...inputKeys].filter(k => schemaKeys.has(k)).length;
  if (knownCount === 0 && inputKeys.size > 0) return 'shape_alien';

  // If mostly unknown fields with minimal structural issues, still shape_alien
  if (knownCount > 0 && unknowns > knownCount * 2 && structuralIssues <= 1) return 'shape_alien';

  if (oversized > 0) return 'oversized';
  if (typeMismatches > 0 && missing === 0) return 'type_mismatch';
  if (missing > 0 && typeMismatches === 0) return 'missing_required';

  // Mixed issues (type_mismatch + missing) = partial_valid → safe-fail
  return 'partial_valid';
}

/**
 * Get the schema for an executor (for repair pipeline context)
 */
export function getExecutorSchema(executorName: string): ExecutorSchema | undefined {
  return SCHEMAS[executorName];
}

/**
 * Get all registered schemas
 */
export function getAllSchemas(): Record<string, ExecutorSchema> {
  return { ...SCHEMAS };
}
