/**
 * Unified Security Utilities for Edge Functions
 * Provides rate limiting, input sanitization, request validation, and logging
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const SECURITY_LIMITS = {
  MAX_PAYLOAD_SIZE: 16384, // 16KB for general endpoints
  MAX_MESSAGE_LENGTH: 4000,
  MAX_SYSTEM_PROMPT_LENGTH: 8000,
  DEFAULT_RATE_LIMIT: 30, // 30 requests per window
  DEFAULT_RATE_WINDOW_MINUTES: 5,
  BURST_RATE_LIMIT: 10, // 10 requests per minute for burst protection
  MAX_CONVERSATION_HISTORY: 20,
  MAX_IP_HEADER_LENGTH: 45, // IPv6 max length
};

// ═══════════════════════════════════════════════════════════════
// DANGEROUS PATTERN DETECTION
// ═══════════════════════════════════════════════════════════════

const DANGEROUS_PATTERNS = {
  scriptTags: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  styleTags: /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
  eventHandlers: /\bon\w+\s*=/gi,
  jsProtocol: /javascript:/gi,
  dataProtocol: /data:(?!image\/(png|jpg|jpeg|gif|webp))/gi,
  vbscript: /vbscript:/gi,
  sqlKeywords: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|DECLARE)\s)/gi,
  commandInjection: /[;&|`$\\]/g,
  nullBytes: /\x00/g,
  pathTraversal: /\.\.[\/\\]/g,
};

const JAILBREAK_PATTERNS = [
  /ignore (all )?(previous|prior|above|your)/i,
  /forget (your|all|the) (instructions|rules|constraints)/i,
  /pretend (you are|to be|you're)/i,
  /roleplay as/i,
  /you are now/i,
  /new persona/i,
  /bypass (your|the|all)/i,
  /override (your|the|all)/i,
  /system prompt/i,
  /dan mode/i,
  /jailbreak/i,
  /developer mode/i,
  /act as if you have no/i,
  /ignore safety/i,
  /no ethical/i,
];

// ═══════════════════════════════════════════════════════════════
// ORIGINAL SANITIZATION FUNCTIONS (preserved for compatibility)
// ═══════════════════════════════════════════════════════════════

/**
 * Sanitizes objects for logging by redacting sensitive fields
 */
export function sanitizeForLog(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const sensitive = [
    'api_key', 'apikey', 'token', 'secret', 'password', 
    'authorization', 'auth', 'key', 'credentials'
  ];

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLog(item));
  }

  const sanitized: any = {};

  for (const key in obj) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitive.some(s => lowerKey.includes(s));

    if (isSensitive) {
      if (typeof obj[key] === 'string' && obj[key].length > 4) {
        sanitized[key] = '***' + obj[key].slice(-4);
      } else {
        sanitized[key] = '***';
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeForLog(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}

/**
 * Redacts email addresses for logging
 */
export function redactEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}***@${domain}`;
}

/**
 * Safe error logging that redacts sensitive data
 */
export function logError(message: string, error: any): void {
  const sanitizedError = sanitizeForLog(error);
  console.error(message, sanitizedError);
}

/**
 * Creates a safe error response for clients without leaking internal details
 * Logs full error server-side for debugging
 */
export function createSafeErrorResponse(
  error: any, 
  corsHeaders: Record<string, string>,
  defaultMessage: string = 'An error occurred'
): Response {
  // Log full error server-side
  console.error('[INTERNAL ERROR]', sanitizeForLog(error));
  
  // Return generic error to client
  const clientError = {
    error: defaultMessage,
    code: error.name || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(clientError), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Creates a safe validation error response
 */
export function createValidationErrorResponse(
  corsHeaders: Record<string, string>,
  message: string = 'Invalid input data'
): Response {
  return new Response(JSON.stringify({
    error: message,
    code: 'VALIDATION_ERROR'
  }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// ═══════════════════════════════════════════════════════════════
// REQUEST HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Extract client IP from request headers
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim();
    return ip?.substring(0, SECURITY_LIMITS.MAX_IP_HEADER_LENGTH) || 'unknown';
  }
  
  return (
    req.headers.get('x-real-ip')?.substring(0, SECURITY_LIMITS.MAX_IP_HEADER_LENGTH) ||
    req.headers.get('cf-connecting-ip')?.substring(0, SECURITY_LIMITS.MAX_IP_HEADER_LENGTH) ||
    'unknown'
  );
}

/**
 * Extract user agent
 */
export function getUserAgent(req: Request): string {
  return (req.headers.get('user-agent') || 'unknown').substring(0, 500);
}

/**
 * Validate content type header
 */
export function isValidContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.toLowerCase().includes('application/json');
}

/**
 * Check payload size from headers
 */
export function checkPayloadSize(req: Request, maxSize: number = SECURITY_LIMITS.MAX_PAYLOAD_SIZE): boolean {
  const contentLength = parseInt(req.headers.get('content-length') || '0');
  return contentLength <= maxSize;
}

// ═══════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize unicode to prevent bypass attacks
 */
export function normalizeUnicode(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width chars
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control chars
    .replace(/[\uD800-\uDFFF]/g, ''); // Lone surrogates
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Check for dangerous patterns in text
 */
export function hasDangerousPatterns(text: string): boolean {
  return (
    DANGEROUS_PATTERNS.scriptTags.test(text) ||
    DANGEROUS_PATTERNS.styleTags.test(text) ||
    DANGEROUS_PATTERNS.eventHandlers.test(text) ||
    DANGEROUS_PATTERNS.jsProtocol.test(text) ||
    DANGEROUS_PATTERNS.sqlKeywords.test(text)
  );
}

/**
 * Check for jailbreak attempts
 */
export function hasJailbreakPatterns(text: string): boolean {
  return JAILBREAK_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Calculate risk score (0-100)
 */
export function calculateRiskScore(text: string): number {
  let score = 0;
  
  if (hasJailbreakPatterns(text)) score += 40;
  if (DANGEROUS_PATTERNS.scriptTags.test(text)) score += 30;
  if (DANGEROUS_PATTERNS.eventHandlers.test(text)) score += 20;
  if (DANGEROUS_PATTERNS.sqlKeywords.test(text)) score += 15;
  if (DANGEROUS_PATTERNS.commandInjection.test(text)) score += 10;
  if (DANGEROUS_PATTERNS.pathTraversal.test(text)) score += 10;
  
  return Math.min(100, score);
}

/**
 * Sanitize user message
 */
export function sanitizeMessage(text: string, maxLength: number = SECURITY_LIMITS.MAX_MESSAGE_LENGTH): {
  sanitized: string;
  original: string;
  riskScore: number;
  wasModified: boolean;
} {
  const original = text.substring(0, maxLength);
  const normalized = normalizeUnicode(original);
  const riskScore = calculateRiskScore(normalized);
  
  // For messages, we escape but don't strip (preserve user intent for AI processing)
  let sanitized = normalized;
  
  // Remove null bytes and path traversal
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.nullBytes, '');
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.pathTraversal, '');
  
  return {
    sanitized: sanitized.substring(0, maxLength),
    original,
    riskScore,
    wasModified: sanitized !== original,
  };
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  resetAt: string;
  retryAfterSeconds?: number;
}

/**
 * Check IP-based rate limit
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  functionName: string,
  limit: number = SECURITY_LIMITS.DEFAULT_RATE_LIMIT,
  windowMinutes: number = SECURITY_LIMITS.DEFAULT_RATE_WINDOW_MINUTES
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
  const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000);
  const cacheKey = `${functionName}:${identifier}`;

  try {
    // Check existing rate limit record
    const { data, error } = await supabase
      .from('edge_rate_limits')
      .select('*')
      .eq('identifier', cacheKey)
      .gte('window_start', windowStart.toISOString())
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if rate limit check fails
      return { allowed: true, currentCount: 0, limit, resetAt: resetAt.toISOString() };
    }

    if (data) {
      const currentCount = data.request_count || 0;
      const windowStartTime = new Date(data.window_start);
      const actualResetAt = new Date(windowStartTime.getTime() + windowMinutes * 60 * 1000);
      
      if (currentCount >= limit) {
        const retryAfterSeconds = Math.ceil((actualResetAt.getTime() - Date.now()) / 1000);
        return {
          allowed: false,
          currentCount,
          limit,
          resetAt: actualResetAt.toISOString(),
          retryAfterSeconds: Math.max(0, retryAfterSeconds),
        };
      }

      // Increment counter
      await supabase
        .from('edge_rate_limits')
        .update({
          request_count: currentCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      return {
        allowed: true,
        currentCount: currentCount + 1,
        limit,
        resetAt: actualResetAt.toISOString(),
      };
    }

    // Create new window
    await supabase
      .from('edge_rate_limits')
      .insert({
        identifier: cacheKey,
        function_name: functionName,
        request_count: 1,
        window_start: new Date().toISOString(),
      });

    return {
      allowed: true,
      currentCount: 1,
      limit,
      resetAt: resetAt.toISOString(),
    };

  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open
    return { allowed: true, currentCount: 0, limit, resetAt: resetAt.toISOString() };
  }
}

// ═══════════════════════════════════════════════════════════════
// SECURITY AUDIT LOGGING
// ═══════════════════════════════════════════════════════════════

/**
 * Log security event to audit table
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  event: {
    functionName: string;
    eventType: 'rate_limit' | 'jailbreak_attempt' | 'dangerous_content' | 'invalid_request' | 'auth_failure';
    clientIP: string;
    userAgent?: string;
    details?: Record<string, unknown>;
    riskScore?: number;
  }
): Promise<void> {
  try {
    await supabase
      .from('security_audit_log')
      .insert({
        function_name: event.functionName,
        event_type: event.eventType,
        client_ip: event.clientIP,
        user_agent: event.userAgent || null,
        details: event.details || null,
        risk_score: event.riskScore || 0,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(
  data: unknown,
  status: number = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
    }
  );
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
  extraHeaders: Record<string, string> = {}
): Response {
  return jsonResponse(
    {
      success: false,
      error: message,
      code: code || (status === 429 ? 'RATE_LIMITED' : status === 422 ? 'UNSAFE_CONTENT' : 'ERROR'),
      timestamp: new Date().toISOString(),
    },
    status,
    extraHeaders
  );
}

/**
 * Handle CORS preflight
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// REQUEST VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

/**
 * Validate request basics (method, content-type, size)
 */
export function validateRequest(
  req: Request,
  options: {
    allowedMethods?: string[];
    requireJson?: boolean;
    maxPayloadSize?: number;
  } = {}
): ValidationResult {
  const {
    allowedMethods = ['POST'],
    requireJson = true,
    maxPayloadSize = SECURITY_LIMITS.MAX_PAYLOAD_SIZE,
  } = options;

  // Method check
  if (!allowedMethods.includes(req.method)) {
    return {
      valid: false,
      error: `Method not allowed. Use: ${allowedMethods.join(', ')}`,
      status: 405,
    };
  }

  // Content-Type check for POST/PUT
  if (requireJson && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!isValidContentType(req.headers.get('content-type'))) {
      return {
        valid: false,
        error: 'Content-Type must be application/json',
        status: 400,
      };
    }
  }

  // Payload size check
  if (!checkPayloadSize(req, maxPayloadSize)) {
    return {
      valid: false,
      error: `Payload too large. Maximum: ${maxPayloadSize} bytes`,
      status: 413,
    };
  }

  return { valid: true };
}

/**
 * Full security check for incoming request
 */
export async function securityCheck(
  supabase: SupabaseClient,
  req: Request,
  functionName: string,
  options: {
    rateLimit?: number;
    rateLimitWindow?: number;
    allowedMethods?: string[];
    skipRateLimit?: boolean;
  } = {}
): Promise<{
  passed: boolean;
  response?: Response;
  clientIP: string;
  userAgent: string;
}> {
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);

  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return { passed: true, response: corsResponse, clientIP, userAgent };
  }

  // Validate request basics
  const validation = validateRequest(req, {
    allowedMethods: options.allowedMethods,
  });

  if (!validation.valid) {
    return {
      passed: false,
      response: errorResponse(validation.error!, validation.status!),
      clientIP,
      userAgent,
    };
  }

  // Rate limit check
  if (!options.skipRateLimit) {
    const rateLimit = await checkRateLimit(
      supabase,
      clientIP,
      functionName,
      options.rateLimit || SECURITY_LIMITS.DEFAULT_RATE_LIMIT,
      options.rateLimitWindow || SECURITY_LIMITS.DEFAULT_RATE_WINDOW_MINUTES
    );

    if (!rateLimit.allowed) {
      await logSecurityEvent(supabase, {
        functionName,
        eventType: 'rate_limit',
        clientIP,
        userAgent,
        details: {
          currentCount: rateLimit.currentCount,
          limit: rateLimit.limit,
        },
      });

      return {
        passed: false,
        response: errorResponse(
          'Rate limit exceeded. Please slow down.',
          429,
          'RATE_LIMITED',
          {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt,
          }
        ),
        clientIP,
        userAgent,
      };
    }
  }

  return { passed: true, clientIP, userAgent };
}
