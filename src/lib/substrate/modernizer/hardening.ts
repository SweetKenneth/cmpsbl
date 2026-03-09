/**
 * MODERNIZER Hardening — Input validation, limits, and safety guards
 * Prevents abuse of scan, proposal, and evolution operations.
 */

export const MODERNIZER_LIMITS = {
  MAX_TITLE_LENGTH: 300,
  MAX_DESCRIPTION_LENGTH: 5_000,
  MAX_MODULE_NAME: 100,
  MAX_SCANS: 100,
  MAX_PROPOSALS: 200,
  VALID_DEPTHS: ['quick', 'standard', 'deep'] as const,
  VALID_RISK_LEVELS: ['low', 'medium', 'high', 'critical'] as const,
  VALID_STATUSES: ['pending', 'approved', 'rejected', 'applied', 'rolled_back'] as const,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
  MODULE_NAME_PATTERN: /^[a-z][a-z0-9_-]{0,99}$/,
} as const;

const BLOCKED_DESCRIPTION_PATTERNS = [
  /eval\s*\(/i,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /rm\s+-rf/i,
  /__proto__/,
  /constructor\s*\[/,
];

export interface ModernizerValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateScanInput(depth?: unknown, targetModule?: unknown): ModernizerValidationResult {
  const errors: string[] = [];

  if (depth !== undefined && !MODERNIZER_LIMITS.VALID_DEPTHS.includes(depth as any)) {
    errors.push(`Invalid scan depth: ${String(depth)}`);
  }

  if (targetModule !== undefined && targetModule !== null) {
    if (typeof targetModule !== 'string' || !MODERNIZER_LIMITS.MODULE_NAME_PATTERN.test(targetModule)) {
      errors.push('Target module must be a valid lowercase module name');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateProposalInput(
  title: unknown,
  description: unknown,
  riskLevel: unknown,
  confidence?: unknown
): ModernizerValidationResult {
  const errors: string[] = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title must be a non-empty string');
  } else if (title.length > MODERNIZER_LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title exceeds ${MODERNIZER_LIMITS.MAX_TITLE_LENGTH} character limit`);
  }

  if (typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description.length > MODERNIZER_LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description exceeds ${MODERNIZER_LIMITS.MAX_DESCRIPTION_LENGTH} character limit`);
  } else {
    for (const pattern of BLOCKED_DESCRIPTION_PATTERNS) {
      if (pattern.test(description)) {
        errors.push('Description contains blocked pattern');
        break;
      }
    }
  }

  if (!MODERNIZER_LIMITS.VALID_RISK_LEVELS.includes(riskLevel as any)) {
    errors.push(`Invalid risk level: ${String(riskLevel)}`);
  }

  if (confidence !== undefined) {
    if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      errors.push('Confidence must be a number between 0 and 1');
    }
  }

  return { valid: errors.length === 0, errors };
}
