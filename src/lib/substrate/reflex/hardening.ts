/**
 * REFLEX Hardening — Security & input validation for the edge decision node.
 * Enforces trigger length, rule safety, node registration limits, and latency bounds.
 */

import { getReflexHealth, getReflexHardening } from '../reflex-module';

export const REFLEX_LIMITS = {
  MAX_TRIGGER_LENGTH: 1_000,
  MAX_RULE_NAME_LENGTH: 128,
  MAX_CONDITION_LENGTH: 2_000,
  MAX_ACTION_LENGTH: 2_000,
  MAX_NODE_NAME_LENGTH: 100,
  MAX_REGION_LENGTH: 100,
  MAX_RULES: 200,
  MAX_NODES: 100,
  MAX_DECISIONS: 1_000,
  MIN_LATENCY_MS: 1,
  MAX_LATENCY_MS: 1_000,
  MAX_CONTEXT_KEYS: 50,
  MAX_CONTEXT_VALUE_SIZE: 10_000,
  BLOCKED_ACTION_PATTERNS: [
    /\beval\b/i,
    /\bexec\b/i,
    /\bsystem\b\s*\(/i,
    /\brm\s+-rf\b/i,
  ] as readonly RegExp[],
} as const;

export interface ReflexValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateReflexInput(params: {
  trigger?: string;
  ruleName?: string;
  condition?: string;
  action?: string;
  nodeName?: string;
  region?: string;
  context?: Record<string, unknown>;
}): ReflexValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (params.trigger !== undefined) {
    if (!params.trigger || params.trigger.trim().length === 0) {
      errors.push('Trigger is required');
    } else if (params.trigger.length > REFLEX_LIMITS.MAX_TRIGGER_LENGTH) {
      errors.push(`Trigger exceeds ${REFLEX_LIMITS.MAX_TRIGGER_LENGTH} chars`);
    }
  }

  if (params.ruleName !== undefined) {
    if (!params.ruleName || params.ruleName.trim().length === 0) {
      errors.push('Rule name is required');
    } else if (params.ruleName.length > REFLEX_LIMITS.MAX_RULE_NAME_LENGTH) {
      errors.push(`Rule name exceeds ${REFLEX_LIMITS.MAX_RULE_NAME_LENGTH} chars`);
    }
  }

  if (params.condition !== undefined) {
    if (params.condition.length > REFLEX_LIMITS.MAX_CONDITION_LENGTH) {
      errors.push(`Condition exceeds ${REFLEX_LIMITS.MAX_CONDITION_LENGTH} chars`);
    }
  }

  if (params.action !== undefined) {
    if (params.action.length > REFLEX_LIMITS.MAX_ACTION_LENGTH) {
      errors.push(`Action exceeds ${REFLEX_LIMITS.MAX_ACTION_LENGTH} chars`);
    }
    for (const pattern of REFLEX_LIMITS.BLOCKED_ACTION_PATTERNS) {
      if (pattern.test(params.action)) {
        warnings.push('Action contains potentially dangerous command pattern');
        break;
      }
    }
  }

  if (params.nodeName !== undefined) {
    if (params.nodeName.length > REFLEX_LIMITS.MAX_NODE_NAME_LENGTH) {
      errors.push(`Node name exceeds ${REFLEX_LIMITS.MAX_NODE_NAME_LENGTH} chars`);
    }
  }

  if (params.region !== undefined) {
    if (params.region.length > REFLEX_LIMITS.MAX_REGION_LENGTH) {
      errors.push(`Region exceeds ${REFLEX_LIMITS.MAX_REGION_LENGTH} chars`);
    }
  }

  if (params.context !== undefined) {
    if (Object.keys(params.context).length > REFLEX_LIMITS.MAX_CONTEXT_KEYS) {
      errors.push(`Too many context keys (max ${REFLEX_LIMITS.MAX_CONTEXT_KEYS})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function reflexHardeningReport() {
  const health = getReflexHealth();
  const hardening = getReflexHardening();

  return {
    node: 'REFLEX',
    version: '1.0.0',
    health,
    hardening,
    limits: { ...REFLEX_LIMITS, BLOCKED_ACTION_PATTERNS: REFLEX_LIMITS.BLOCKED_ACTION_PATTERNS.length },
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
