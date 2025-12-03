/**
 * Security utilities for edge functions
 */

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
