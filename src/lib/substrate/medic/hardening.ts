/**
 * MEDIC Hardening — Input validation, limits, and safety guards
 * Prevents abuse of diagnostic, quarantine, and repair operations.
 */

export const MEDIC_LIMITS = {
  /** Max module name length */
  MAX_MODULE_NAME: 100,
  /** Max symptoms per diagnosis */
  MAX_SYMPTOMS: 50,
  /** Max symptom string length */
  MAX_SYMPTOM_LENGTH: 500,
  /** Max quarantine reason length */
  MAX_REASON_LENGTH: 1_000,
  /** Max repair action description */
  MAX_ACTION_LENGTH: 500,
  /** Max concurrent quarantine entries */
  MAX_QUARANTINE: 50,
  /** Max stored diagnoses */
  MAX_DIAGNOSES: 300,
  /** Max stored repairs */
  MAX_REPAIRS: 300,
  /** Valid module names pattern */
  MODULE_NAME_PATTERN: /^[a-z][a-z0-9_-]{0,99}$/,
} as const;

/** Blocked patterns in repair actions */
const BLOCKED_ACTION_PATTERNS = [
  /eval\s*\(/i,
  /exec\s*\(/i,
  /rm\s+-rf/i,
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /__proto__/,
  /constructor\s*\[/,
  /process\.exit/i,
];

export interface MedicValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDiagnoseInput(targetModule: unknown, symptoms: unknown): MedicValidationResult {
  const errors: string[] = [];

  if (typeof targetModule !== 'string' || !MEDIC_LIMITS.MODULE_NAME_PATTERN.test(targetModule)) {
    errors.push('Target module must be a valid lowercase module name');
  }

  if (!Array.isArray(symptoms)) {
    errors.push('Symptoms must be an array');
  } else {
    if (symptoms.length > MEDIC_LIMITS.MAX_SYMPTOMS) {
      errors.push(`Symptoms exceed ${MEDIC_LIMITS.MAX_SYMPTOMS} limit`);
    }
    for (let i = 0; i < Math.min(symptoms.length, MEDIC_LIMITS.MAX_SYMPTOMS); i++) {
      if (typeof symptoms[i] !== 'string') {
        errors.push(`Symptom [${i}] must be a string`);
      } else if (symptoms[i].length > MEDIC_LIMITS.MAX_SYMPTOM_LENGTH) {
        errors.push(`Symptom [${i}] exceeds ${MEDIC_LIMITS.MAX_SYMPTOM_LENGTH} character limit`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateQuarantineInput(module: unknown, reason: unknown): MedicValidationResult {
  const errors: string[] = [];

  if (typeof module !== 'string' || !MEDIC_LIMITS.MODULE_NAME_PATTERN.test(module)) {
    errors.push('Module must be a valid lowercase module name');
  }

  if (typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push('Quarantine reason must be a non-empty string');
  } else if (reason.length > MEDIC_LIMITS.MAX_REASON_LENGTH) {
    errors.push(`Reason exceeds ${MEDIC_LIMITS.MAX_REASON_LENGTH} character limit`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateRepairInput(diagnosisId: unknown, action: unknown): MedicValidationResult {
  const errors: string[] = [];

  if (typeof diagnosisId !== 'string' || diagnosisId.trim().length === 0) {
    errors.push('Diagnosis ID must be a non-empty string');
  }

  if (typeof action !== 'string' || action.trim().length === 0) {
    errors.push('Repair action must be a non-empty string');
  } else if (action.length > MEDIC_LIMITS.MAX_ACTION_LENGTH) {
    errors.push(`Action exceeds ${MEDIC_LIMITS.MAX_ACTION_LENGTH} character limit`);
  } else {
    for (const pattern of BLOCKED_ACTION_PATTERNS) {
      if (pattern.test(action)) {
        errors.push('Repair action contains a blocked pattern');
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
