/**
 * PHANTOM Hardening — Security & input validation for the privacy node.
 * Enforces PII detection, data size limits, and privacy parameter bounds.
 */

import { getPhantomHealth, getPhantomHardening } from '../phantom-module';

// ─── Limits ───────────────────────────────────────────────
export const PHANTOM_LIMITS = {
  MAX_COLUMNS: 100,
  MAX_COLUMN_NAME_LENGTH: 128,
  MAX_ROWS: 1_000_000,
  MIN_ROWS: 10,
  MAX_DATASET_NAME_LENGTH: 256,
  MAX_ANONYMIZE_FIELDS: 500,
  MAX_FIELD_VALUE_SIZE: 64_000, // 64KB per field
  EPSILON_MIN: 0.01,
  EPSILON_MAX: 10,
  DELTA_MIN: 1e-10,
  DELTA_MAX: 0.1,
  MAX_DATASETS: 200,
  MAX_ANONYMIZATIONS: 500,
  PII_PATTERNS: [
    /\b\d{3}-\d{2}-\d{4}\b/,                    // SSN
    /\b\d{16}\b/,                                 // Credit card (raw digits)
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card (formatted)
    /\b[A-Z]{1,2}\d{6,9}\b/i,                    // Passport-like
  ] as readonly RegExp[],
} as const;

export interface PhantomValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate inputs for synthetic data generation and anonymization.
 */
export function validatePhantomInput(params: {
  name?: string;
  columns?: string[];
  rowCount?: number;
  epsilon?: number;
  delta?: number;
  data?: Record<string, unknown>;
}): PhantomValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Dataset name
  if (params.name !== undefined) {
    if (!params.name || params.name.trim().length === 0) {
      errors.push('Dataset name is required');
    } else if (params.name.length > PHANTOM_LIMITS.MAX_DATASET_NAME_LENGTH) {
      errors.push(`Name exceeds ${PHANTOM_LIMITS.MAX_DATASET_NAME_LENGTH} chars`);
    }
  }

  // Columns
  if (params.columns !== undefined) {
    if (params.columns.length > PHANTOM_LIMITS.MAX_COLUMNS) {
      errors.push(`Too many columns (max ${PHANTOM_LIMITS.MAX_COLUMNS})`);
    }
    for (const col of params.columns) {
      if (col.length > PHANTOM_LIMITS.MAX_COLUMN_NAME_LENGTH) {
        errors.push(`Column name "${col.slice(0, 20)}..." exceeds ${PHANTOM_LIMITS.MAX_COLUMN_NAME_LENGTH} chars`);
        break;
      }
    }
  }

  // Row count
  if (params.rowCount !== undefined) {
    if (params.rowCount < PHANTOM_LIMITS.MIN_ROWS) {
      errors.push(`Row count must be at least ${PHANTOM_LIMITS.MIN_ROWS}`);
    }
    if (params.rowCount > PHANTOM_LIMITS.MAX_ROWS) {
      errors.push(`Row count exceeds ${PHANTOM_LIMITS.MAX_ROWS.toLocaleString()}`);
    }
  }

  // Privacy parameters
  if (params.epsilon !== undefined) {
    if (params.epsilon < PHANTOM_LIMITS.EPSILON_MIN || params.epsilon > PHANTOM_LIMITS.EPSILON_MAX) {
      errors.push(`Epsilon must be between ${PHANTOM_LIMITS.EPSILON_MIN} and ${PHANTOM_LIMITS.EPSILON_MAX}`);
    }
    if (params.epsilon > 5) {
      warnings.push('High epsilon (>5) significantly reduces privacy guarantees');
    }
  }

  if (params.delta !== undefined) {
    if (params.delta < PHANTOM_LIMITS.DELTA_MIN || params.delta > PHANTOM_LIMITS.DELTA_MAX) {
      errors.push(`Delta must be between ${PHANTOM_LIMITS.DELTA_MIN} and ${PHANTOM_LIMITS.DELTA_MAX}`);
    }
  }

  // Data field validation + PII detection
  if (params.data !== undefined) {
    const fieldCount = Object.keys(params.data).length;
    if (fieldCount > PHANTOM_LIMITS.MAX_ANONYMIZE_FIELDS) {
      errors.push(`Too many fields to anonymize (max ${PHANTOM_LIMITS.MAX_ANONYMIZE_FIELDS})`);
    }

    // Scan for PII patterns in string values (warn, don't block)
    for (const [key, value] of Object.entries(params.data)) {
      if (typeof value === 'string') {
        if (new TextEncoder().encode(value).byteLength > PHANTOM_LIMITS.MAX_FIELD_VALUE_SIZE) {
          errors.push(`Field "${key}" exceeds ${PHANTOM_LIMITS.MAX_FIELD_VALUE_SIZE / 1000}KB limit`);
          continue;
        }
        for (const pattern of PHANTOM_LIMITS.PII_PATTERNS) {
          if (pattern.test(value)) {
            warnings.push(`Possible PII detected in field "${key}" — ensure anonymization covers this`);
            break;
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Aggregate hardening report for the PHANTOM node.
 */
export function phantomHardeningReport() {
  const health = getPhantomHealth();
  const hardening = getPhantomHardening();

  return {
    node: 'PHANTOM',
    version: '1.0.0',
    health,
    hardening,
    limits: {
      ...PHANTOM_LIMITS,
      PII_PATTERNS: PHANTOM_LIMITS.PII_PATTERNS.length,
    },
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
