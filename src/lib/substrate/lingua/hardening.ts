/**
 * LINGUA Hardening — Input validation, limits, and safety guards
 * Prevents abuse of translation and schema mapping operations.
 */

export const LINGUA_LIMITS = {
  /** Max content length for translation input */
  MAX_CONTENT_LENGTH: 100_000,
  /** Max field mappings per schema operation */
  MAX_FIELD_MAPPINGS: 200,
  /** Max schema name length */
  MAX_SCHEMA_NAME: 500,
  /** Max field name length */
  MAX_FIELD_NAME: 200,
  /** Max transform expression length */
  MAX_TRANSFORM_LENGTH: 1_000,
  /** Min confidence for field mapping */
  MIN_CONFIDENCE: 0,
  /** Max confidence for field mapping */
  MAX_CONFIDENCE: 1,
  /** Allowed modalities */
  VALID_MODALITIES: ['text', 'code', 'image', 'audio', 'structured_data', 'embedding', 'graph'] as const,
  /** Allowed quality tiers */
  VALID_QUALITIES: ['draft', 'standard', 'premium', 'certified'] as const,
} as const;

/** Patterns blocked in transform expressions to prevent injection */
const BLOCKED_TRANSFORM_PATTERNS = [
  /eval\s*\(/i,
  /function\s*\(/i,
  /=>\s*\{/,
  /new\s+Function/i,
  /import\s*\(/i,
  /require\s*\(/i,
  /__proto__/,
  /constructor\s*\[/,
];

export interface LinguaValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTranslationInput(content: unknown, from: unknown, to: unknown, quality?: unknown): LinguaValidationResult {
  const errors: string[] = [];

  if (typeof content !== 'string') {
    errors.push('Content must be a string');
  } else if (content.length > LINGUA_LIMITS.MAX_CONTENT_LENGTH) {
    errors.push(`Content exceeds ${LINGUA_LIMITS.MAX_CONTENT_LENGTH} character limit`);
  } else if (content.trim().length === 0) {
    errors.push('Content cannot be empty');
  }

  if (!LINGUA_LIMITS.VALID_MODALITIES.includes(from as any)) {
    errors.push(`Invalid source modality: ${String(from)}`);
  }
  if (!LINGUA_LIMITS.VALID_MODALITIES.includes(to as any)) {
    errors.push(`Invalid target modality: ${String(to)}`);
  }
  if (from === to) {
    errors.push('Source and target modality must differ');
  }

  if (quality !== undefined && !LINGUA_LIMITS.VALID_QUALITIES.includes(quality as any)) {
    errors.push(`Invalid quality tier: ${String(quality)}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateSchemaInput(
  sourceSchema: unknown,
  targetSchema: unknown,
  fieldMappings: unknown
): LinguaValidationResult {
  const errors: string[] = [];

  if (typeof sourceSchema !== 'string' || sourceSchema.length > LINGUA_LIMITS.MAX_SCHEMA_NAME) {
    errors.push('Invalid or oversized source schema name');
  }
  if (typeof targetSchema !== 'string' || targetSchema.length > LINGUA_LIMITS.MAX_SCHEMA_NAME) {
    errors.push('Invalid or oversized target schema name');
  }

  if (!Array.isArray(fieldMappings)) {
    errors.push('Field mappings must be an array');
  } else {
    if (fieldMappings.length > LINGUA_LIMITS.MAX_FIELD_MAPPINGS) {
      errors.push(`Field mappings exceed ${LINGUA_LIMITS.MAX_FIELD_MAPPINGS} limit`);
    }
    for (let i = 0; i < Math.min(fieldMappings.length, LINGUA_LIMITS.MAX_FIELD_MAPPINGS); i++) {
      const fm = fieldMappings[i];
      if (!fm || typeof fm !== 'object') {
        errors.push(`Field mapping [${i}] is invalid`);
        continue;
      }
      if (typeof fm.sourceField !== 'string' || fm.sourceField.length > LINGUA_LIMITS.MAX_FIELD_NAME) {
        errors.push(`Field mapping [${i}] has invalid sourceField`);
      }
      if (typeof fm.targetField !== 'string' || fm.targetField.length > LINGUA_LIMITS.MAX_FIELD_NAME) {
        errors.push(`Field mapping [${i}] has invalid targetField`);
      }
      if (typeof fm.transform === 'string') {
        if (fm.transform.length > LINGUA_LIMITS.MAX_TRANSFORM_LENGTH) {
          errors.push(`Field mapping [${i}] transform exceeds length limit`);
        }
        for (const pattern of BLOCKED_TRANSFORM_PATTERNS) {
          if (pattern.test(fm.transform)) {
            errors.push(`Field mapping [${i}] transform contains blocked pattern`);
            break;
          }
        }
      }
      if (typeof fm.confidence === 'number') {
        if (!Number.isFinite(fm.confidence) || fm.confidence < LINGUA_LIMITS.MIN_CONFIDENCE || fm.confidence > LINGUA_LIMITS.MAX_CONFIDENCE) {
          errors.push(`Field mapping [${i}] confidence out of range [0, 1]`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
