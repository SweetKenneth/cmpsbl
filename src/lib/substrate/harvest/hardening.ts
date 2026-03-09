/**
 * HARVEST Hardening — Input validation, limits, and safety guards
 * Prevents abuse of data source registration, ETL pipelines, and job execution.
 */

export const HARVEST_LIMITS = {
  /** Max source name length */
  MAX_SOURCE_NAME: 200,
  /** Max endpoint URL length */
  MAX_ENDPOINT_LENGTH: 2_000,
  /** Min poll interval (1s) */
  MIN_POLL_INTERVAL_MS: 1_000,
  /** Max poll interval (24h) */
  MAX_POLL_INTERVAL_MS: 86_400_000,
  /** Max registered sources */
  MAX_SOURCES: 100,
  /** Max stored jobs */
  MAX_JOBS: 500,
  /** Max pipelines */
  MAX_PIPELINES: 50,
  /** Max source IDs per pipeline */
  MAX_PIPELINE_SOURCES: 20,
  /** Max transformations per pipeline */
  MAX_PIPELINE_TRANSFORMS: 50,
  /** Max transformation expression length */
  MAX_TRANSFORM_LENGTH: 1_000,
  /** Max pipeline name length */
  MAX_PIPELINE_NAME: 200,
  /** Max destination length */
  MAX_DESTINATION_LENGTH: 500,
  /** Valid source types */
  VALID_SOURCE_TYPES: ['api', 'webhook', 'rss', 'database', 'file', 'stream', 'sensor'] as const,
} as const;

/** Blocked patterns in endpoints to prevent SSRF */
const BLOCKED_ENDPOINT_PATTERNS = [
  /^file:\/\//i,
  /localhost/i,
  /127\.0\.0\./,
  /\[::1\]/,
  /0\.0\.0\.0/,
  /169\.254\./,        // link-local
  /10\.\d+\.\d+\.\d+/, // private range
  /172\.(1[6-9]|2\d|3[01])\./, // private range
  /192\.168\./,         // private range
];

/** Blocked patterns in transform expressions */
const BLOCKED_TRANSFORM_PATTERNS = [
  /eval\s*\(/i,
  /function\s*\(/i,
  /=>\s*\{/,
  /new\s+Function/i,
  /import\s*\(/i,
  /require\s*\(/i,
  /__proto__/,
  /constructor\s*\[/,
];

export interface HarvestValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSourceInput(
  name: unknown,
  type: unknown,
  endpoint: unknown,
  pollIntervalMs?: unknown
): HarvestValidationResult {
  const errors: string[] = [];

  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Source name must be a non-empty string');
  } else if (name.length > HARVEST_LIMITS.MAX_SOURCE_NAME) {
    errors.push(`Source name exceeds ${HARVEST_LIMITS.MAX_SOURCE_NAME} character limit`);
  }

  if (!HARVEST_LIMITS.VALID_SOURCE_TYPES.includes(type as any)) {
    errors.push(`Invalid source type: ${String(type)}`);
  }

  if (typeof endpoint !== 'string' || endpoint.trim().length === 0) {
    errors.push('Endpoint must be a non-empty string');
  } else if (endpoint.length > HARVEST_LIMITS.MAX_ENDPOINT_LENGTH) {
    errors.push(`Endpoint exceeds ${HARVEST_LIMITS.MAX_ENDPOINT_LENGTH} character limit`);
  } else {
    for (const pattern of BLOCKED_ENDPOINT_PATTERNS) {
      if (pattern.test(endpoint)) {
        errors.push('Endpoint matches a blocked pattern (potential SSRF)');
        break;
      }
    }
  }

  if (pollIntervalMs !== undefined) {
    if (typeof pollIntervalMs !== 'number' || !Number.isFinite(pollIntervalMs)) {
      errors.push('Poll interval must be a finite number');
    } else if (pollIntervalMs < HARVEST_LIMITS.MIN_POLL_INTERVAL_MS || pollIntervalMs > HARVEST_LIMITS.MAX_POLL_INTERVAL_MS) {
      errors.push(`Poll interval must be between ${HARVEST_LIMITS.MIN_POLL_INTERVAL_MS}ms and ${HARVEST_LIMITS.MAX_POLL_INTERVAL_MS}ms`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validatePipelineInput(
  name: unknown,
  sourceIds: unknown,
  transformations: unknown,
  destination: unknown
): HarvestValidationResult {
  const errors: string[] = [];

  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Pipeline name must be a non-empty string');
  } else if (name.length > HARVEST_LIMITS.MAX_PIPELINE_NAME) {
    errors.push(`Pipeline name exceeds ${HARVEST_LIMITS.MAX_PIPELINE_NAME} character limit`);
  }

  if (!Array.isArray(sourceIds)) {
    errors.push('Source IDs must be an array');
  } else if (sourceIds.length === 0) {
    errors.push('Pipeline must have at least one source');
  } else if (sourceIds.length > HARVEST_LIMITS.MAX_PIPELINE_SOURCES) {
    errors.push(`Pipeline cannot reference more than ${HARVEST_LIMITS.MAX_PIPELINE_SOURCES} sources`);
  }

  if (!Array.isArray(transformations)) {
    errors.push('Transformations must be an array');
  } else if (transformations.length > HARVEST_LIMITS.MAX_PIPELINE_TRANSFORMS) {
    errors.push(`Transformations exceed ${HARVEST_LIMITS.MAX_PIPELINE_TRANSFORMS} limit`);
  } else {
    for (let i = 0; i < transformations.length; i++) {
      const t = transformations[i];
      if (typeof t !== 'string') {
        errors.push(`Transformation [${i}] must be a string`);
        continue;
      }
      if (t.length > HARVEST_LIMITS.MAX_TRANSFORM_LENGTH) {
        errors.push(`Transformation [${i}] exceeds length limit`);
      }
      for (const pattern of BLOCKED_TRANSFORM_PATTERNS) {
        if (pattern.test(t)) {
          errors.push(`Transformation [${i}] contains blocked pattern`);
          break;
        }
      }
    }
  }

  if (typeof destination !== 'string' || destination.trim().length === 0) {
    errors.push('Destination must be a non-empty string');
  } else if (destination.length > HARVEST_LIMITS.MAX_DESTINATION_LENGTH) {
    errors.push(`Destination exceeds ${HARVEST_LIMITS.MAX_DESTINATION_LENGTH} character limit`);
  }

  return { valid: errors.length === 0, errors };
}
