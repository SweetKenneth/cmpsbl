/**
 * FORGE Hardening — Security & input validation for the manufacturing node.
 * Enforces payload limits, blueprint sanitization, and build safety.
 */

import { getForgeHealth, getForgeHardening } from '../forge-module';

// ─── Limits ───────────────────────────────────────────────
export const FORGE_LIMITS = {
  MAX_SPECIFICATION_LENGTH: 10_000,
  MAX_BLUEPRINT_NAME_LENGTH: 128,
  MAX_CONSTRAINTS: 20,
  MAX_CONSTRAINT_LENGTH: 500,
  MAX_ARTIFACTS: 300,
  MAX_BLUEPRINTS: 200,
  MAX_BUILDS: 200,
  MAX_CODE_SIZE_BYTES: 512_000, // 500KB
  BLOCKED_PATTERNS: [
    /eval\s*\(/i,
    /Function\s*\(/i,
    /require\s*\(\s*['"`]child_process/i,
    /import\s+.*from\s+['"`]fs/i,
    /process\.env/i,
    /__proto__/i,
    /constructor\s*\[\s*['"`]prototype/i,
  ] as readonly RegExp[],
} as const;

export interface ForgeValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate blueprint creation inputs before they reach the core module.
 */
export function validateForgeInput(params: {
  name?: string;
  specification?: string;
  constraints?: string[];
  code?: string;
}): ForgeValidationResult {
  const errors: string[] = [];

  // Name validation
  if (params.name !== undefined) {
    if (!params.name || params.name.trim().length === 0) {
      errors.push('Blueprint name is required');
    } else if (params.name.length > FORGE_LIMITS.MAX_BLUEPRINT_NAME_LENGTH) {
      errors.push(`Name exceeds ${FORGE_LIMITS.MAX_BLUEPRINT_NAME_LENGTH} chars`);
    }
  }

  // Specification validation
  if (params.specification !== undefined) {
    if (params.specification.length > FORGE_LIMITS.MAX_SPECIFICATION_LENGTH) {
      errors.push(`Specification exceeds ${FORGE_LIMITS.MAX_SPECIFICATION_LENGTH} chars`);
    }
    // Check for injection patterns
    for (const pattern of FORGE_LIMITS.BLOCKED_PATTERNS) {
      if (pattern.test(params.specification)) {
        errors.push('Specification contains blocked code pattern');
        break;
      }
    }
  }

  // Constraints validation
  if (params.constraints !== undefined) {
    if (params.constraints.length > FORGE_LIMITS.MAX_CONSTRAINTS) {
      errors.push(`Too many constraints (max ${FORGE_LIMITS.MAX_CONSTRAINTS})`);
    }
    for (const c of params.constraints) {
      if (c.length > FORGE_LIMITS.MAX_CONSTRAINT_LENGTH) {
        errors.push(`Constraint exceeds ${FORGE_LIMITS.MAX_CONSTRAINT_LENGTH} chars`);
        break;
      }
    }
  }

  // Code output size validation
  if (params.code !== undefined) {
    const size = new TextEncoder().encode(params.code).byteLength;
    if (size > FORGE_LIMITS.MAX_CODE_SIZE_BYTES) {
      errors.push(`Generated code exceeds ${FORGE_LIMITS.MAX_CODE_SIZE_BYTES / 1000}KB limit`);
    }
    for (const pattern of FORGE_LIMITS.BLOCKED_PATTERNS) {
      if (pattern.test(params.code)) {
        errors.push('Generated code contains blocked pattern');
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Aggregate hardening report for the FORGE node.
 */
export function forgeHardeningReport() {
  const health = getForgeHealth();
  const hardening = getForgeHardening();

  return {
    node: 'FORGE',
    version: '1.0.0',
    health,
    hardening,
    limits: { ...FORGE_LIMITS, BLOCKED_PATTERNS: FORGE_LIMITS.BLOCKED_PATTERNS.length },
    status: health >= 70 ? 'healthy' : health >= 40 ? 'degraded' : 'critical',
  };
}
