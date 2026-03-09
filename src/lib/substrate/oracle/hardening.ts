/**
 * ORACLE Hardening — Security & input validation for the prediction node.
 * Enforces feature limits, iteration bounds, and network size constraints.
 */

import { getOracleHealth, getOracleHardening } from '../oracle-module';

// ─── Limits ───────────────────────────────────────────────
export const ORACLE_LIMITS = {
  MAX_FEATURES: 200,
  MAX_FEATURE_NAME_LENGTH: 128,
  MAX_FEATURE_VALUE: 1e12,
  MIN_FEATURE_VALUE: -1e12,
  MAX_NETWORK_NODES: 500,
  MAX_NETWORK_EDGES: 2_000,
  MAX_NODE_NAME_LENGTH: 128,
  MIN_ITERATIONS: 100,
  MAX_ITERATIONS: 100_000,
  MAX_SIMULATION_NAME_LENGTH: 256,
  MAX_TARGET_LENGTH: 256,
  MAX_PREDICTIONS: 500,
  MAX_SIMULATIONS: 100,
  MAX_NETWORKS: 50,
} as const;

export interface OracleValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate inputs for prediction and simulation operations.
 */
export function validateOracleInput(params: {
  target?: string;
  features?: Record<string, number>;
  iterations?: number;
  simulationName?: string;
  networkNodes?: { name: string; prior: number }[];
}): OracleValidationResult {
  const errors: string[] = [];

  if (params.target !== undefined) {
    if (!params.target || params.target.trim().length === 0) {
      errors.push('Prediction target is required');
    } else if (params.target.length > ORACLE_LIMITS.MAX_TARGET_LENGTH) {
      errors.push(`Target exceeds ${ORACLE_LIMITS.MAX_TARGET_LENGTH} chars`);
    }
  }

  if (params.features !== undefined) {
    const keys = Object.keys(params.features);
    if (keys.length > ORACLE_LIMITS.MAX_FEATURES) {
      errors.push(`Too many features (max ${ORACLE_LIMITS.MAX_FEATURES})`);
    }
    for (const [key, val] of Object.entries(params.features)) {
      if (key.length > ORACLE_LIMITS.MAX_FEATURE_NAME_LENGTH) {
        errors.push(`Feature name "${key.slice(0, 20)}..." exceeds ${ORACLE_LIMITS.MAX_FEATURE_NAME_LENGTH} chars`);
        break;
      }
      if (val < ORACLE_LIMITS.MIN_FEATURE_VALUE || val > ORACLE_LIMITS.MAX_FEATURE_VALUE) {
        errors.push(`Feature value for "${key}" out of bounds [${ORACLE_LIMITS.MIN_FEATURE_VALUE}, ${ORACLE_LIMITS.MAX_FEATURE_VALUE}]`);
        break;
      }
      if (!isFinite(val)) {
        errors.push(`Feature value for "${key}" must be a finite number`);
        break;
      }
    }
  }

  if (params.iterations !== undefined) {
    if (params.iterations < ORACLE_LIMITS.MIN_ITERATIONS || params.iterations > ORACLE_LIMITS.MAX_ITERATIONS) {
      errors.push(`Iterations must be between ${ORACLE_LIMITS.MIN_ITERATIONS} and ${ORACLE_LIMITS.MAX_ITERATIONS.toLocaleString()}`);
    }
  }

  if (params.simulationName !== undefined) {
    if (!params.simulationName || params.simulationName.trim().length === 0) {
      errors.push('Simulation name is required');
    } else if (params.simulationName.length > ORACLE_LIMITS.MAX_SIMULATION_NAME_LENGTH) {
      errors.push(`Simulation name exceeds ${ORACLE_LIMITS.MAX_SIMULATION_NAME_LENGTH} chars`);
    }
  }

  if (params.networkNodes !== undefined) {
    if (params.networkNodes.length > ORACLE_LIMITS.MAX_NETWORK_NODES) {
      errors.push(`Too many network nodes (max ${ORACLE_LIMITS.MAX_NETWORK_NODES})`);
    }
    for (const node of params.networkNodes) {
      if (node.prior < 0 || node.prior > 1) {
        errors.push(`Prior for "${node.name}" must be between 0 and 1`);
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Aggregate hardening report for the ORACLE node.
 */
export function oracleHardeningReport() {
  const health = getOracleHealth();
  const hardening = getOracleHardening();

  return {
    node: 'ORACLE',
    version: '1.0.0',
    health,
    hardening,
    limits: ORACLE_LIMITS,
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
