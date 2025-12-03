/**
 * Input validation and sanitization utilities
 * 
 * Security Note: These are client-side helpers only. 
 * Always validate on the server/edge function side with Zod schemas.
 */

/** Maximum allowed input lengths */
export const INPUT_LIMITS = {
  email: 254,
  url: 2048,
  apiKey: 128,
  shortText: 200,
  longText: 5000,
  filename: 255,
} as const;

/** Dangerous patterns to detect */
const DANGEROUS_PATTERNS = {
  pathTraversal: /\.\.[\/\\]/,
  nullByte: /\x00/,
  commandInjection: /[;&|`$]/,
  scriptTags: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  eventHandlers: /\bon\w+\s*=/gi,
  sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
  noSqlInjection: /\{\s*['"$]/,
} as const;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > INPUT_LIMITS.email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  if (!url || url.length > INPUT_LIMITS.url) return false;
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isValidApiKey(key: string): boolean {
  if (!key || key.length < 32 || key.length > INPUT_LIMITS.apiKey) return false;
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Sanitize text input - removes dangerous characters and patterns
 * For display purposes only. Server-side validation is still required.
 */
export function sanitizeInput(input: string, maxLength = INPUT_LIMITS.shortText): string {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input
    .trim()
    .slice(0, maxLength)
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes
    .replace(/\x00/g, '')
    // Encode HTML entities for remaining angle brackets
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Remove potential script event handlers
    .replace(DANGEROUS_PATTERNS.eventHandlers, '')
    // Remove command injection characters
    .replace(/[;&|`$]/g, '');
  
  return sanitized;
}

/**
 * Sanitize for JSON context - prevents NoSQL injection
 */
export function sanitizeForJson(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/\$/g, '')
    .replace(/\{/g, '')
    .replace(/\}/g, '');
}

/**
 * Validate a filename to prevent path traversal
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length > INPUT_LIMITS.filename) return false;
  if (DANGEROUS_PATTERNS.pathTraversal.test(filename)) return false;
  if (DANGEROUS_PATTERNS.nullByte.test(filename)) return false;
  // Only allow alphanumeric, dash, underscore, dot
  return /^[\w\-. ]+$/.test(filename);
}

/**
 * Sanitize a filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  return filename
    .replace(/\.\./g, '')
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\x00/g, '')
    .slice(0, INPUT_LIMITS.filename);
}

/**
 * Check if input contains potentially dangerous patterns
 */
export function containsDangerousPatterns(input: string): boolean {
  if (!input) return false;
  return (
    DANGEROUS_PATTERNS.pathTraversal.test(input) ||
    DANGEROUS_PATTERNS.nullByte.test(input) ||
    DANGEROUS_PATTERNS.commandInjection.test(input) ||
    DANGEROUS_PATTERNS.scriptTags.test(input) ||
    DANGEROUS_PATTERNS.eventHandlers.test(input) ||
    DANGEROUS_PATTERNS.sqlInjection.test(input) ||
    DANGEROUS_PATTERNS.noSqlInjection.test(input)
  );
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  if (!uuid) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Validate integer within range
 */
export function isValidInteger(value: unknown, min?: number, max?: number): boolean {
  if (typeof value !== 'number' || !Number.isInteger(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Sanitize URL parameter value
 */
export function sanitizeUrlParam(param: string): string {
  if (!param || typeof param !== 'string') return '';
  return encodeURIComponent(param.slice(0, 500));
}
