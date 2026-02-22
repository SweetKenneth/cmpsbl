/**
 * Evolution Mesh — Schema Validator
 * Framework-agnostic input validation with archetype classification.
 */

import type { FieldSchema, ExecutorSchema, ValidationIssue, ValidationReport } from './types';
import type { InputArchetype } from './archetypes';

const SQL_INJECT_RE = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|UNION|CREATE|EXEC)\b\s)/i;
const XSS_RE = /<script[\s\S]*?<\/script>/gi;

/**
 * Define a schema for an executor/endpoint.
 */
export function defineSchema(fields: Record<string, FieldSchema>, options?: { requiredOneOf?: string[] }): ExecutorSchema {
  return { fields, requiredOneOf: options?.requiredOneOf };
}

/**
 * Validate input against a schema. Returns archetype classification.
 */
export function validateInput(
  schema: ExecutorSchema | undefined,
  input: Record<string, unknown>,
): ValidationReport {
  if (!schema) {
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

  // Empty shell check
  if (inputKeys.size === 0 || Object.values(input).every(v => v === null || v === undefined || v === '')) {
    return { valid: false, issues: [{ field: '*', issue: 'missing' }], archetype: 'empty_shell', confidence: 0 };
  }

  // Required fields
  for (const [field, spec] of Object.entries(schema.fields)) {
    const val = input[field];
    if (spec.required && (val === null || val === undefined || val === '')) {
      issues.push({ field, issue: 'missing', expected: spec.type });
      continue;
    }
    if (val === null || val === undefined) continue;

    // Type check
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

    // String checks
    if (typeof val === 'string') {
      if (spec.minLength && val.length < spec.minLength) {
        issues.push({ field, issue: 'too_short', expected: `>=${spec.minLength}` });
      }
      if (spec.maxLength && val.length > spec.maxLength) {
        issues.push({ field, issue: 'too_long', expected: `<=${spec.maxLength}` });
      }
      if (spec.enum && !spec.enum.includes(val)) {
        issues.push({ field, issue: 'invalid_enum', expected: spec.enum.join('|'), got: val });
      }
    }
  }

  // requiredOneOf
  if (schema.requiredOneOf) {
    const hasOne = schema.requiredOneOf.some(f => {
      const v = input[f];
      return v !== null && v !== undefined && v !== '';
    });
    if (!hasOne) {
      issues.push({ field: schema.requiredOneOf.join('|'), issue: 'missing', expected: 'at least one' });
    }
  }

  // Injection detection
  for (const val of Object.values(input)) {
    if (typeof val === 'string') {
      if (SQL_INJECT_RE.test(val) || XSS_RE.test(val)) {
        return { valid: false, issues, archetype: 'injection_attempt', confidence: 0.9 };
      }
    }
  }

  // Classify archetype
  const archetype = classifyArchetype(schema, input, issues);
  return {
    valid: issues.length === 0,
    issues,
    archetype,
    confidence: issues.length === 0 ? 1.0 : Math.max(0.1, 1 - issues.length * 0.15),
  };
}

function classifyArchetype(
  schema: ExecutorSchema,
  input: Record<string, unknown>,
  issues: ValidationIssue[],
): InputArchetype {
  if (issues.length === 0) return 'well_formed';

  const schemaKeys = new Set(Object.keys(schema.fields));
  const inputKeys = Object.keys(input);
  const recognizedKeys = inputKeys.filter(k => schemaKeys.has(k));

  if (recognizedKeys.length === 0) return 'shape_alien';

  const missingCount = issues.filter(i => i.issue === 'missing').length;
  const typeCount = issues.filter(i => i.issue === 'wrong_type').length;
  const sizeCount = issues.filter(i => i.issue === 'too_long' || i.issue === 'too_short').length;

  if (sizeCount > 0 && sizeCount >= issues.length / 2) return 'oversized';
  if (typeCount > 0 && typeCount >= issues.length / 2) return 'type_mismatch';
  if (missingCount > 0 && missingCount >= issues.length / 2) return 'missing_required';

  return 'partial_valid';
}
