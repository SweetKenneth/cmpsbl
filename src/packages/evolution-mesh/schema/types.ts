/**
 * Evolution Mesh — Schema Types
 * Framework-agnostic input validation types.
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
  archetype: import('./archetypes').InputArchetype;
  confidence: number;
}
