/**
 * EVOLUTION Hardening — Input validation, limits, and safety guards
 * Prevents abuse of evolution cycle operations and mutation proposals.
 */

export const EVOLUTION_LIMITS = {
  /** Max title length for evolution cycle */
  MAX_TITLE_LENGTH: 300,
  /** Max changes per cycle */
  MAX_CHANGES_PER_CYCLE: 50,
  /** Max targets per cycle */
  MAX_TARGETS_PER_CYCLE: 40,
  /** Max change description length */
  MAX_CHANGE_DESC_LENGTH: 2_000,
  /** Max reason length for rollback */
  MAX_REASON_LENGTH: 1_000,
  /** Min health score to permit auto-apply */
  MIN_HEALTH_FOR_APPLY: 30,
  /** Max concurrent evolution cycles */
  MAX_CONCURRENT_CYCLES: 1,
  /** Cooldown between cycles (ms) */
  CYCLE_COOLDOWN_MS: 10_000,
} as const;

/** Blocked patterns in change descriptions */
const BLOCKED_CHANGE_PATTERNS = [
  /DROP\s+TABLE/i,
  /DELETE\s+FROM/i,
  /TRUNCATE/i,
  /rm\s+-rf/i,
  /eval\s*\(/i,
  /__proto__/,
  /constructor\s*\[/,
];

export interface EvolutionValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCycleInput(
  title: unknown,
  changes: unknown,
  targets: unknown,
  healthBefore?: unknown
): EvolutionValidationResult {
  const errors: string[] = [];

  // Title
  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Cycle title must be a non-empty string');
  } else if (title.length > EVOLUTION_LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Cycle title exceeds ${EVOLUTION_LIMITS.MAX_TITLE_LENGTH} character limit`);
  }

  // Changes
  if (!Array.isArray(changes)) {
    errors.push('Changes must be an array');
  } else {
    if (changes.length === 0) {
      errors.push('At least one change is required');
    } else if (changes.length > EVOLUTION_LIMITS.MAX_CHANGES_PER_CYCLE) {
      errors.push(`Changes exceed ${EVOLUTION_LIMITS.MAX_CHANGES_PER_CYCLE} limit`);
    }
    for (let i = 0; i < Math.min(changes.length, EVOLUTION_LIMITS.MAX_CHANGES_PER_CYCLE); i++) {
      const c = changes[i];
      if (c && typeof c === 'object' && typeof c.description === 'string') {
        if (c.description.length > EVOLUTION_LIMITS.MAX_CHANGE_DESC_LENGTH) {
          errors.push(`Change [${i}] description exceeds length limit`);
        }
        for (const pattern of BLOCKED_CHANGE_PATTERNS) {
          if (pattern.test(c.description)) {
            errors.push(`Change [${i}] description contains blocked pattern`);
            break;
          }
        }
      }
    }
  }

  // Targets
  if (!Array.isArray(targets)) {
    errors.push('Targets must be an array');
  } else if (targets.length > EVOLUTION_LIMITS.MAX_TARGETS_PER_CYCLE) {
    errors.push(`Targets exceed ${EVOLUTION_LIMITS.MAX_TARGETS_PER_CYCLE} limit`);
  }

  // Health
  if (healthBefore !== undefined) {
    if (typeof healthBefore !== 'number' || !Number.isFinite(healthBefore)) {
      errors.push('healthBefore must be a finite number');
    } else if (healthBefore < 0 || healthBefore > 100) {
      errors.push('healthBefore must be between 0 and 100');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRollbackInput(cycleId: unknown, reason: unknown): EvolutionValidationResult {
  const errors: string[] = [];

  if (typeof cycleId !== 'string' || cycleId.trim().length === 0) {
    errors.push('Cycle ID must be a non-empty string');
  }

  if (typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push('Rollback reason must be a non-empty string');
  } else if (reason.length > EVOLUTION_LIMITS.MAX_REASON_LENGTH) {
    errors.push(`Reason exceeds ${EVOLUTION_LIMITS.MAX_REASON_LENGTH} character limit`);
  }

  return { valid: errors.length === 0, errors };
}
