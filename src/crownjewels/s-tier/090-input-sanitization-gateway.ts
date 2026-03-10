/**
 * S-Tier 090 — Input Sanitization Gateway
 * CJPI: 91 | Node: DEFENSE | ID: S-122
 *
 * Multi-layer input sanitization against injection, XSS,
 * and prompt manipulation attacks.
 */

export interface SanitizationResult {
  original: string;
  sanitized: string;
  threats: string[];
  blocked: boolean;
  sanitizedAt: string;
}

const XSS_PATTERNS = [
  /<script\b[^>]*>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b/gi,
  /<object\b/gi,
  /<embed\b/gi,
];

const INJECTION_PATTERNS = [
  /(\b(DROP|DELETE|INSERT|UPDATE|ALTER)\s+(TABLE|DATABASE|INDEX))/gi,
  /(;\s*--)/g,
  /(\bunion\s+select\b)/gi,
  /(\/\*[\s\S]*?\*\/)/g,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions|prompts)/gi,
  /you\s+are\s+now\s+(a|an)\b/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
];

export function sanitize(input: string): SanitizationResult {
  const threats: string[] = [];
  let sanitized = input;

  // XSS check
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(sanitized)) {
      threats.push('XSS attempt detected');
      sanitized = sanitized.replace(pattern, '');
    }
    pattern.lastIndex = 0;
  }

  // SQL injection check
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      threats.push('SQL injection attempt detected');
      sanitized = sanitized.replace(pattern, '');
    }
    pattern.lastIndex = 0;
  }

  // Prompt injection check
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      threats.push('Prompt injection attempt detected');
      sanitized = sanitized.replace(pattern, '[BLOCKED]');
    }
    pattern.lastIndex = 0;
  }

  // HTML entity encoding for remaining angle brackets
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return {
    original: input,
    sanitized,
    threats: [...new Set(threats)],
    blocked: threats.length > 2, // Block if multiple threat types
    sanitizedAt: new Date().toISOString(),
  };
}

export function isSafe(input: string): boolean {
  return sanitize(input).threats.length === 0;
}
