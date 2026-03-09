/**
 * ATLAS Hardening — Input validation, limits, and safety guards
 * Prevents abuse of governance mode changes, proposal submission, and system controls.
 */

export const ATLAS_LIMITS = {
  MAX_TITLE_LENGTH: 300,
  MAX_DESCRIPTION_LENGTH: 5_000,
  MAX_IMPACT_LENGTH: 2_000,
  MAX_REASON_LENGTH: 1_000,
  MAX_SOURCE_LENGTH: 100,
  MAX_PROPOSALS: 500,
  VALID_MODES: ['ACTIVE', 'OBSERVE', 'LOCKDOWN', 'EVOLVE'] as const,
  VALID_RISK_LEVELS: ['low', 'medium', 'high', 'critical'] as const,
  VALID_DECISIONS: ['approve', 'reject', 'defer'] as const,
  CLM_THROTTLE_MIN: 0,
  CLM_THROTTLE_MAX: 1,
  VELOCITY_MIN: 0,
  VELOCITY_MAX: 20,
} as const;

const BLOCKED_PATTERNS = [
  /eval\s*\(/i,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /__proto__/,
  /constructor\s*\[/,
  /process\.exit/i,
];

export interface AtlasValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateModeChange(mode: unknown): AtlasValidationResult {
  const errors: string[] = [];
  if (!ATLAS_LIMITS.VALID_MODES.includes(mode as any)) {
    errors.push(`Invalid governance mode: ${String(mode)}. Must be one of: ${ATLAS_LIMITS.VALID_MODES.join(', ')}`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateProposalInput(
  source: unknown,
  title: unknown,
  description: unknown,
  impactAssessment: unknown,
  riskLevel?: unknown
): AtlasValidationResult {
  const errors: string[] = [];

  if (typeof source !== 'string' || source.trim().length === 0) {
    errors.push('Source must be a non-empty string');
  } else if (source.length > ATLAS_LIMITS.MAX_SOURCE_LENGTH) {
    errors.push(`Source exceeds ${ATLAS_LIMITS.MAX_SOURCE_LENGTH} character limit`);
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title must be a non-empty string');
  } else if (title.length > ATLAS_LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title exceeds ${ATLAS_LIMITS.MAX_TITLE_LENGTH} character limit`);
  }

  if (typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description.length > ATLAS_LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description exceeds ${ATLAS_LIMITS.MAX_DESCRIPTION_LENGTH} character limit`);
  } else {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(description)) {
        errors.push('Description contains blocked pattern');
        break;
      }
    }
  }

  if (typeof impactAssessment !== 'string') {
    errors.push('Impact assessment must be a string');
  } else if (impactAssessment.length > ATLAS_LIMITS.MAX_IMPACT_LENGTH) {
    errors.push(`Impact assessment exceeds ${ATLAS_LIMITS.MAX_IMPACT_LENGTH} character limit`);
  }

  if (riskLevel !== undefined && !ATLAS_LIMITS.VALID_RISK_LEVELS.includes(riskLevel as any)) {
    errors.push(`Invalid risk level: ${String(riskLevel)}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateDecisionInput(proposalId: unknown, decision: unknown, reason: unknown): AtlasValidationResult {
  const errors: string[] = [];

  if (typeof proposalId !== 'string' || proposalId.trim().length === 0) {
    errors.push('Proposal ID must be a non-empty string');
  }

  if (!ATLAS_LIMITS.VALID_DECISIONS.includes(decision as any)) {
    errors.push(`Invalid decision: ${String(decision)}`);
  }

  if (typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push('Decision reason must be a non-empty string');
  } else if (reason.length > ATLAS_LIMITS.MAX_REASON_LENGTH) {
    errors.push(`Reason exceeds ${ATLAS_LIMITS.MAX_REASON_LENGTH} character limit`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateControlInput(key: string, value: unknown): AtlasValidationResult {
  const errors: string[] = [];

  switch (key) {
    case 'clm_throttle':
      if (typeof value !== 'number' || !Number.isFinite(value) || value < ATLAS_LIMITS.CLM_THROTTLE_MIN || value > ATLAS_LIMITS.CLM_THROTTLE_MAX) {
        errors.push(`CLM throttle must be between ${ATLAS_LIMITS.CLM_THROTTLE_MIN} and ${ATLAS_LIMITS.CLM_THROTTLE_MAX}`);
      }
      break;
    case 'evolution_velocity':
      if (typeof value !== 'number' || !Number.isFinite(value) || value < ATLAS_LIMITS.VELOCITY_MIN || value > ATLAS_LIMITS.VELOCITY_MAX) {
        errors.push(`Evolution velocity must be between ${ATLAS_LIMITS.VELOCITY_MIN} and ${ATLAS_LIMITS.VELOCITY_MAX}`);
      }
      break;
    case 'seba_enabled':
    case 'capability_lock':
      if (typeof value !== 'boolean') {
        errors.push(`${key} must be a boolean`);
      }
      break;
    default:
      errors.push(`Unknown control key: ${key}`);
  }

  return { valid: errors.length === 0, errors };
}
