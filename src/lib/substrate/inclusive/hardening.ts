/**
 * INCLUSIVE Hardening — Input validation, limits, and safety guards
 * Prevents abuse of scan, repair, and validation operations.
 */

export const INCLUSIVE_LIMITS = {
  MAX_TARGET_LENGTH: 2_000,
  MAX_SCANS: 200,
  MAX_REPAIRS: 200,
  MAX_ISSUES_PER_SCAN: 500,
  VALID_WCAG_LEVELS: ['A', 'AA', 'AAA'] as const,
  VALID_SCAN_DEPTHS: ['quick', 'standard', 'deep'] as const,
  VALID_SEVERITIES: ['minor', 'moderate', 'serious', 'critical'] as const,
  /** Target URL pattern — must look like a URL or selector */
  TARGET_PATTERN: /^(https?:\/\/|\/|#|\.|\[)/,
} as const;

/** Blocked patterns in targets to prevent SSRF */
const BLOCKED_TARGET_PATTERNS = [
  /^file:\/\//i,
  /localhost/i,
  /127\.0\.0\./,
  /\[::1\]/,
  /0\.0\.0\.0/,
  /169\.254\./,
  /10\.\d+\.\d+\.\d+/,
  /192\.168\./,
];

export interface InclusiveValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateScanInput(
  target: unknown,
  wcagLevel?: unknown,
  depth?: unknown
): InclusiveValidationResult {
  const errors: string[] = [];

  if (typeof target !== 'string' || target.trim().length === 0) {
    errors.push('Target must be a non-empty string');
  } else if (target.length > INCLUSIVE_LIMITS.MAX_TARGET_LENGTH) {
    errors.push(`Target exceeds ${INCLUSIVE_LIMITS.MAX_TARGET_LENGTH} character limit`);
  } else {
    for (const pattern of BLOCKED_TARGET_PATTERNS) {
      if (pattern.test(target)) {
        errors.push('Target matches a blocked pattern (potential SSRF)');
        break;
      }
    }
  }

  if (wcagLevel !== undefined && !INCLUSIVE_LIMITS.VALID_WCAG_LEVELS.includes(wcagLevel as any)) {
    errors.push(`Invalid WCAG level: ${String(wcagLevel)}`);
  }

  if (depth !== undefined && !INCLUSIVE_LIMITS.VALID_SCAN_DEPTHS.includes(depth as any)) {
    errors.push(`Invalid scan depth: ${String(depth)}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateRepairInput(scanId: unknown): InclusiveValidationResult {
  const errors: string[] = [];

  if (typeof scanId !== 'string' || scanId.trim().length === 0) {
    errors.push('Scan ID must be a non-empty string');
  }

  return { valid: errors.length === 0, errors };
}
