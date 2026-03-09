/**
 * CONSCIENCE Hardening — Security & input validation for the ethics node.
 * Enforces action length limits, value bounds, and context sanitization.
 */

import { getConscienceHealth, getConscienceHardening } from '../conscience-module';

export const CONSCIENCE_LIMITS = {
  MAX_ACTION_LENGTH: 2_000,
  MAX_ENTITY_LENGTH: 256,
  MAX_VALUES: 50,
  MAX_VALUE_NAME_LENGTH: 128,
  VALUE_MIN: 0,
  VALUE_MAX: 1,
  MAX_CONTEXT_KEYS: 50,
  MAX_CONTEXT_VALUE_SIZE: 10_000,
  MAX_EVALUATIONS: 500,
  MAX_ALIGNMENT_SCORES: 200,
  BLOCKED_ACTION_PATTERNS: [
    /\bexploit\b.*\bvulnerabilit/i,
    /\bbypass\b.*\bsecurity/i,
    /\bexfiltrate\b/i,
  ] as readonly RegExp[],
} as const;

export interface ConscienceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConscienceInput(params: {
  action?: string;
  entity?: string;
  values?: Record<string, number>;
  context?: Record<string, unknown>;
}): ConscienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (params.action !== undefined) {
    if (!params.action || params.action.trim().length === 0) {
      errors.push('Action description is required');
    } else if (params.action.length > CONSCIENCE_LIMITS.MAX_ACTION_LENGTH) {
      errors.push(`Action exceeds ${CONSCIENCE_LIMITS.MAX_ACTION_LENGTH} chars`);
    }
    for (const pattern of CONSCIENCE_LIMITS.BLOCKED_ACTION_PATTERNS) {
      if (pattern.test(params.action ?? '')) {
        warnings.push('Action contains potentially adversarial phrasing — flagged for review');
        break;
      }
    }
  }

  if (params.entity !== undefined) {
    if (!params.entity || params.entity.trim().length === 0) {
      errors.push('Entity name is required');
    } else if (params.entity.length > CONSCIENCE_LIMITS.MAX_ENTITY_LENGTH) {
      errors.push(`Entity name exceeds ${CONSCIENCE_LIMITS.MAX_ENTITY_LENGTH} chars`);
    }
  }

  if (params.values !== undefined) {
    const keys = Object.keys(params.values);
    if (keys.length > CONSCIENCE_LIMITS.MAX_VALUES) {
      errors.push(`Too many values (max ${CONSCIENCE_LIMITS.MAX_VALUES})`);
    }
    for (const [key, val] of Object.entries(params.values)) {
      if (key.length > CONSCIENCE_LIMITS.MAX_VALUE_NAME_LENGTH) {
        errors.push(`Value name "${key.slice(0, 20)}..." exceeds limit`);
        break;
      }
      if (val < CONSCIENCE_LIMITS.VALUE_MIN || val > CONSCIENCE_LIMITS.VALUE_MAX) {
        errors.push(`Value "${key}" must be between ${CONSCIENCE_LIMITS.VALUE_MIN} and ${CONSCIENCE_LIMITS.VALUE_MAX}`);
        break;
      }
    }
  }

  if (params.context !== undefined) {
    if (Object.keys(params.context).length > CONSCIENCE_LIMITS.MAX_CONTEXT_KEYS) {
      errors.push(`Too many context keys (max ${CONSCIENCE_LIMITS.MAX_CONTEXT_KEYS})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function conscienceHardeningReport() {
  const health = getConscienceHealth();
  const hardening = getConscienceHardening();

  return {
    node: 'CONSCIENCE',
    version: '1.0.0',
    health,
    hardening,
    limits: { ...CONSCIENCE_LIMITS, BLOCKED_ACTION_PATTERNS: CONSCIENCE_LIMITS.BLOCKED_ACTION_PATTERNS.length },
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
