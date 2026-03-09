/**
 * ECHO Hardening — Security & input validation for the simulation node.
 * Enforces twin limits, scenario step bounds, intervention safety, and state size caps.
 */

import { getEchoHealth, getEchoHardening } from '../echo-module';

export const ECHO_LIMITS = {
  MAX_TWIN_NAME_LENGTH: 256,
  MAX_ENTITY_TYPE_LENGTH: 100,
  MAX_STATE_KEYS: 200,
  MAX_STATE_VALUE: 1e12,
  MIN_STATE_VALUE: -1e12,
  MAX_PARAMETERS: 100,
  MAX_INTERVENTIONS: 100,
  MIN_STEPS: 1,
  MAX_STEPS: 10_000,
  MAX_SCENARIO_NAME_LENGTH: 256,
  MAX_TWINS: 100,
  MAX_SCENARIOS: 200,
  MAX_HISTORY_PER_TWIN: 500,
  MAX_INTERVENTION_VALUE: 1e9,
  MIN_INTERVENTION_VALUE: -1e9,
} as const;

export interface EchoValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEchoInput(params: {
  name?: string;
  entityType?: string;
  initialState?: Record<string, number>;
  parameters?: Record<string, number>;
  interventions?: { parameter: string; operation: string; value: number; atStep: number }[];
  steps?: number;
}): EchoValidationResult {
  const errors: string[] = [];

  if (params.name !== undefined) {
    if (!params.name || params.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (params.name.length > ECHO_LIMITS.MAX_TWIN_NAME_LENGTH) {
      errors.push(`Name exceeds ${ECHO_LIMITS.MAX_TWIN_NAME_LENGTH} chars`);
    }
  }

  if (params.entityType !== undefined) {
    if (params.entityType.length > ECHO_LIMITS.MAX_ENTITY_TYPE_LENGTH) {
      errors.push(`Entity type exceeds ${ECHO_LIMITS.MAX_ENTITY_TYPE_LENGTH} chars`);
    }
  }

  if (params.initialState !== undefined) {
    const keys = Object.keys(params.initialState);
    if (keys.length > ECHO_LIMITS.MAX_STATE_KEYS) {
      errors.push(`Too many state keys (max ${ECHO_LIMITS.MAX_STATE_KEYS})`);
    }
    for (const [key, val] of Object.entries(params.initialState)) {
      if (!isFinite(val) || val < ECHO_LIMITS.MIN_STATE_VALUE || val > ECHO_LIMITS.MAX_STATE_VALUE) {
        errors.push(`State value for "${key}" out of bounds or non-finite`);
        break;
      }
    }
  }

  if (params.parameters !== undefined) {
    if (Object.keys(params.parameters).length > ECHO_LIMITS.MAX_PARAMETERS) {
      errors.push(`Too many parameters (max ${ECHO_LIMITS.MAX_PARAMETERS})`);
    }
  }

  if (params.interventions !== undefined) {
    if (params.interventions.length > ECHO_LIMITS.MAX_INTERVENTIONS) {
      errors.push(`Too many interventions (max ${ECHO_LIMITS.MAX_INTERVENTIONS})`);
    }
    const validOps = ['set', 'multiply', 'add'];
    for (const intv of params.interventions) {
      if (!validOps.includes(intv.operation)) {
        errors.push(`Invalid intervention operation "${intv.operation}"`);
        break;
      }
      if (intv.value < ECHO_LIMITS.MIN_INTERVENTION_VALUE || intv.value > ECHO_LIMITS.MAX_INTERVENTION_VALUE) {
        errors.push(`Intervention value out of bounds`);
        break;
      }
      if (intv.atStep < 0) {
        errors.push('Intervention step cannot be negative');
        break;
      }
    }
  }

  if (params.steps !== undefined) {
    if (params.steps < ECHO_LIMITS.MIN_STEPS || params.steps > ECHO_LIMITS.MAX_STEPS) {
      errors.push(`Steps must be between ${ECHO_LIMITS.MIN_STEPS} and ${ECHO_LIMITS.MAX_STEPS.toLocaleString()}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function echoHardeningReport() {
  const health = getEchoHealth();
  const hardening = getEchoHardening();

  return {
    node: 'ECHO',
    version: '1.0.0',
    health,
    hardening,
    limits: ECHO_LIMITS,
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
