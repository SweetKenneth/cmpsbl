/**
 * TREATY Hardening — Security & input validation for the contract node.
 * Enforces party limits, term bounds, SLA metric validation, and duration constraints.
 */

import { getTreatyHealth, getTreatyHardening } from '../treaty-module';

export const TREATY_LIMITS = {
  MAX_CONTRACT_NAME_LENGTH: 200,
  MAX_PARTIES: 20,
  MAX_PARTY_NAME_LENGTH: 128,
  MAX_TERMS: 50,
  MAX_CLAUSE_LENGTH: 5_000,
  MAX_SLAS: 20,
  MAX_PENALTIES: 100,
  MIN_DURATION_DAYS: 1,
  MAX_DURATION_DAYS: 3650, // 10 years
  MAX_CONTRACTS: 200,
  SLA_VALUE_MIN: 0,
  SLA_VALUE_MAX: 100_000,
  VALID_SLA_METRICS: ['uptime', 'latency_p99', 'error_rate', 'throughput', 'response_time', 'availability'] as const,
  VALID_PENALTY_TYPES: ['credit', 'fee', 'termination_right', 'escalation'] as const,
} as const;

export interface TreatyValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTreatyInput(params: {
  name?: string;
  parties?: string[];
  terms?: { clause: string }[];
  slas?: { metric: string; target: number; minimum: number }[];
  durationDays?: number;
}): TreatyValidationResult {
  const errors: string[] = [];

  if (params.name !== undefined) {
    if (!params.name || params.name.trim().length === 0) {
      errors.push('Contract name is required');
    } else if (params.name.length > TREATY_LIMITS.MAX_CONTRACT_NAME_LENGTH) {
      errors.push(`Name exceeds ${TREATY_LIMITS.MAX_CONTRACT_NAME_LENGTH} chars`);
    }
  }

  if (params.parties !== undefined) {
    if (params.parties.length < 2) {
      errors.push('At least 2 parties required');
    } else if (params.parties.length > TREATY_LIMITS.MAX_PARTIES) {
      errors.push(`Too many parties (max ${TREATY_LIMITS.MAX_PARTIES})`);
    }
    for (const p of params.parties) {
      if (p.length > TREATY_LIMITS.MAX_PARTY_NAME_LENGTH) {
        errors.push(`Party name "${p.slice(0, 20)}..." exceeds limit`);
        break;
      }
    }
  }

  if (params.terms !== undefined) {
    if (params.terms.length > TREATY_LIMITS.MAX_TERMS) {
      errors.push(`Too many terms (max ${TREATY_LIMITS.MAX_TERMS})`);
    }
    for (const t of params.terms) {
      if (t.clause.length > TREATY_LIMITS.MAX_CLAUSE_LENGTH) {
        errors.push(`Term clause exceeds ${TREATY_LIMITS.MAX_CLAUSE_LENGTH} chars`);
        break;
      }
    }
  }

  if (params.slas !== undefined) {
    if (params.slas.length > TREATY_LIMITS.MAX_SLAS) {
      errors.push(`Too many SLAs (max ${TREATY_LIMITS.MAX_SLAS})`);
    }
    for (const sla of params.slas) {
      if (!(TREATY_LIMITS.VALID_SLA_METRICS as readonly string[]).includes(sla.metric)) {
        errors.push(`Invalid SLA metric "${sla.metric}"`);
      }
      if (sla.minimum > sla.target) {
        errors.push(`SLA minimum (${sla.minimum}) cannot exceed target (${sla.target})`);
      }
    }
  }

  if (params.durationDays !== undefined) {
    if (params.durationDays < TREATY_LIMITS.MIN_DURATION_DAYS || params.durationDays > TREATY_LIMITS.MAX_DURATION_DAYS) {
      errors.push(`Duration must be between ${TREATY_LIMITS.MIN_DURATION_DAYS} and ${TREATY_LIMITS.MAX_DURATION_DAYS} days`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function treatyHardeningReport() {
  const health = getTreatyHealth();
  const hardening = getTreatyHardening();

  return {
    node: 'TREATY',
    version: '1.0.0',
    health,
    hardening,
    limits: TREATY_LIMITS,
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
