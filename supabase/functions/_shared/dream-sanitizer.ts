/**
 * Dream Content Sanitization & Security Utilities
 * Prevents XSS, script injection, and classifies content for research
 */

// Maximum payload sizes
export const LIMITS = {
  MAX_PAYLOAD_SIZE: 4096, // 4KB max payload
  MAX_CONTENT_LENGTH: 2000,
  MAX_NAME_LENGTH: 50,
  MAX_DOMAIN_LENGTH: 100,
  IP_RATE_LIMIT: 15, // 15 requests per 5 minutes
  IP_RATE_WINDOW_MINUTES: 5,
  ACCOUNT_DAILY_LIMIT: 50,
};

// Dangerous patterns to detect and strip
const DANGEROUS_PATTERNS = {
  scriptTags: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  styleTags: /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
  htmlTags: /<[^>]*>/g,
  eventHandlers: /\bon\w+\s*=/gi,
  jsProtocol: /javascript:/gi,
  dataProtocol: /data:(?!image\/(png|jpg|jpeg|gif|webp))/gi,
  vbscript: /vbscript:/gi,
  expression: /expression\s*\(/gi,
  importStatement: /@import/gi,
  sqlKeywords: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  commandInjection: /[;&|`$\\]/g,
  nullBytes: /\x00/g,
  pathTraversal: /\.\.[\/\\]/g,
};

// Classification tags based on content analysis
export type ClassificationTag = 
  | 'code' | 'jailbreak' | 'sexual' | 'violent' 
  | 'psychotic' | 'surreal' | 'narrative' | 'meme'
  | 'clean' | 'poetic' | 'therapeutic' | 'lucid';

// Classification patterns (lenient research mode)
const CLASSIFICATION_PATTERNS: Record<ClassificationTag, RegExp[]> = {
  code: [
    /\b(function|const|let|var|import|export|class|def|return)\b/i,
    /<[a-z]+[^>]*>/i,
    /\{[\s\S]*\}/,
    /console\.(log|error|warn)/i,
    /\/\*[\s\S]*?\*\//,
    /\/\/.*/,
  ],
  jailbreak: [
    /ignore previous/i,
    /forget your instructions/i,
    /pretend you are/i,
    /roleplay as/i,
    /bypass/i,
    /override/i,
    /system prompt/i,
    /dan mode/i,
    /jailbreak/i,
    /<script/i,
    /\balert\s*\(/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
  ],
  sexual: [
    /\b(sex|nude|naked|erotic|porn|xxx)\b/i,
  ],
  violent: [
    /\b(kill|murder|blood|gore|torture|decapitate|dismember)\b/i,
    /\b(violence|violent|attack|assault)\b/i,
  ],
  psychotic: [
    /\b(voices told me|the walls are watching|they're inside|paranoid|conspiracy)\b/i,
    /\b(losing my mind|going crazy|insane|psychosis)\b/i,
  ],
  surreal: [
    /\b(floating|melting|transforming|morphing|kaleidoscope)\b/i,
    /\b(impossible|bizarre|strange|weird|abstract)\b/i,
    /\b(colors|shapes|shifting|endless|infinite)\b/i,
  ],
  narrative: [
    /\b(suddenly|then|finally|meanwhile|afterwards)\b/i,
    /\b(I was|I saw|I felt|I heard|I ran)\b/i,
    /\b(in my dream|dreamed|dreaming)\b/i,
  ],
  meme: [
    /\b(lol|lmao|bruh|sus|based|cope|ratio)\b/i,
    /\b(poggers|yeet|bussin|cap|no cap|sheesh)\b/i,
  ],
  clean: [], // Default if nothing matches
  poetic: [
    /\b(whisper|ethereal|celestial|luminous|serene)\b/i,
    /\b(twilight|dawn|dusk|moonlight|starlight)\b/i,
  ],
  therapeutic: [
    /\b(healing|peaceful|calm|safe|protected|comfort)\b/i,
    /\b(release|letting go|acceptance|forgiveness)\b/i,
  ],
  lucid: [
    /\b(realized I was dreaming|became aware|took control)\b/i,
    /\b(lucid dream|conscious|aware|controlling)\b/i,
  ],
};

// Profanity filter (lenient - just for flagging, not blocking)
const PROFANITY_PATTERNS = [
  /\bf+u+c+k+/gi,
  /\bs+h+i+t+/gi,
  /\ba+s+s+h+o+l+e+/gi,
  /\bb+i+t+c+h+/gi,
  /\bn+i+g+g+/gi, // Serious slurs should be caught
];

// Illegal content patterns (these WILL be rejected)
const ILLEGAL_PATTERNS = [
  /\b(child pornography|cp|minor|underage)\b.*\b(sex|nude|porn|naked)\b/gi,
  /\b(sex|nude|porn|naked)\b.*\b(child|minor|underage)\b/gi,
  /\b(how to make|build|create)\b.*\b(bomb|explosive|weapon)\b/gi,
];

export interface SanitizationResult {
  sanitizedText: string;
  rawText: string;
  tags: ClassificationTag[];
  riskScore: number;
  isRejected: boolean;
  rejectionReason: string | null;
  hasProfanity: boolean;
  hasIllegalContent: boolean;
  hasDangerousPatterns: boolean;
}

/**
 * Normalize unicode to prevent bypass attacks
 */
function normalizeUnicode(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width chars
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control chars
    .replace(/[\uD800-\uDFFF]/g, ''); // Lone surrogates
}

/**
 * Strip/escape all dangerous markup
 */
function stripDangerousContent(text: string): string {
  let sanitized = text;
  
  // Remove script and style tags entirely
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.scriptTags, '[script removed]');
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.styleTags, '[style removed]');
  
  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Remove event handlers
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.eventHandlers, '');
  
  // Remove dangerous protocols
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.jsProtocol, '');
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.dataProtocol, '');
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.vbscript, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.nullBytes, '');
  
  // Remove path traversal attempts
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.pathTraversal, '');
  
  return sanitized.trim();
}

/**
 * Classify content and return tags
 */
function classifyContent(text: string): ClassificationTag[] {
  const tags: ClassificationTag[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [tag, patterns] of Object.entries(CLASSIFICATION_PATTERNS)) {
    if (patterns.length === 0) continue;
    
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        tags.push(tag as ClassificationTag);
        break;
      }
    }
  }
  
  // If nothing matched, it's clean
  if (tags.length === 0) {
    tags.push('clean');
  }
  
  return [...new Set(tags)];
}

/**
 * Calculate risk score (0-100)
 */
function calculateRiskScore(text: string, tags: ClassificationTag[]): number {
  let score = 0;
  
  // Base score from tags
  if (tags.includes('jailbreak')) score += 40;
  if (tags.includes('code')) score += 15;
  if (tags.includes('violent')) score += 20;
  if (tags.includes('sexual')) score += 15;
  if (tags.includes('psychotic')) score += 10;
  
  // Check for dangerous patterns
  if (DANGEROUS_PATTERNS.scriptTags.test(text)) score += 30;
  if (DANGEROUS_PATTERNS.eventHandlers.test(text)) score += 20;
  if (DANGEROUS_PATTERNS.sqlKeywords.test(text)) score += 15;
  if (DANGEROUS_PATTERNS.commandInjection.test(text)) score += 10;
  
  // Check for profanity
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) {
      score += 5;
      break;
    }
  }
  
  return Math.min(100, score);
}

/**
 * Check for illegal content
 */
function hasIllegalContent(text: string): boolean {
  for (const pattern of ILLEGAL_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

/**
 * Check for profanity
 */
function hasProfanity(text: string): boolean {
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

/**
 * Check for dangerous patterns
 */
function hasDangerousPatterns(text: string): boolean {
  return (
    DANGEROUS_PATTERNS.scriptTags.test(text) ||
    DANGEROUS_PATTERNS.styleTags.test(text) ||
    DANGEROUS_PATTERNS.eventHandlers.test(text) ||
    DANGEROUS_PATTERNS.jsProtocol.test(text) ||
    DANGEROUS_PATTERNS.sqlKeywords.test(text)
  );
}

/**
 * Main sanitization function
 */
export function sanitizeDreamContent(rawText: string): SanitizationResult {
  // Normalize unicode first
  const normalizedText = normalizeUnicode(rawText);
  
  // Check for illegal content (reject immediately)
  if (hasIllegalContent(normalizedText)) {
    return {
      sanitizedText: '',
      rawText: rawText.substring(0, LIMITS.MAX_CONTENT_LENGTH),
      tags: ['jailbreak'],
      riskScore: 100,
      isRejected: true,
      rejectionReason: 'Content violates terms of service',
      hasProfanity: false,
      hasIllegalContent: true,
      hasDangerousPatterns: true,
    };
  }
  
  // Classify content
  const tags = classifyContent(normalizedText);
  
  // Calculate risk score
  const riskScore = calculateRiskScore(normalizedText, tags);
  
  // Strip dangerous content
  const sanitizedText = stripDangerousContent(normalizedText);
  
  return {
    sanitizedText: sanitizedText.substring(0, LIMITS.MAX_CONTENT_LENGTH),
    rawText: rawText.substring(0, LIMITS.MAX_CONTENT_LENGTH),
    tags,
    riskScore,
    isRejected: false,
    rejectionReason: null,
    hasProfanity: hasProfanity(normalizedText),
    hasIllegalContent: false,
    hasDangerousPatterns: hasDangerousPatterns(normalizedText),
  };
}

/**
 * Validate dream type
 */
export function validateDreamType(type: unknown): 'dream' | 'nightmare' {
  if (type === 'nightmare') return 'nightmare';
  return 'dream';
}

/**
 * Validate content type header
 */
export function isValidContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const validTypes = ['application/json'];
  return validTypes.some(t => contentType.toLowerCase().includes(t));
}

/**
 * Extract client IP from request
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent
 */
export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}
