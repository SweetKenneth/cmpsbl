/**
 * Secret Redaction System
 * Comprehensive secret masking for logs, UIs, and errors
 */

// Patterns that indicate sensitive keys
const SECRET_KEY_PATTERNS = [
  /^(OPENAI|GROQ|ANTHROPIC|PERPLEXITY|FIRECRAWL|E2B|SUPABASE|STRIPE|RESEND|CLERK|AUTH0)/i,
  /(_KEY|_SECRET|_TOKEN|_PASSWORD|_CREDENTIAL|_API_KEY|_PRIVATE)$/i,
  /^(api[_-]?key|secret|token|password|credential|authorization|bearer|jwt)$/i,
  /^(access[_-]?token|refresh[_-]?token|id[_-]?token)$/i,
  /^(private[_-]?key|public[_-]?key|signing[_-]?key)$/i,
  /^(database[_-]?url|connection[_-]?string|dsn)$/i,
  /^(cookie|session|auth)$/i,
];

// Patterns that indicate sensitive values
const SECRET_VALUE_PATTERNS = [
  // JWT tokens
  /^eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  // API keys with common prefixes
  /^(sk-|pk-|clf-|rk_|ak_|key-|secret-)[A-Za-z0-9_-]{20,}$/,
  // Bearer tokens
  /^Bearer\s+[A-Za-z0-9_-]+/i,
  // Base64 encoded secrets (long strings)
  /^[A-Za-z0-9+/=]{40,}$/,
  // UUID-like secrets
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
];

// Headers that should always be redacted
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
  'x-refresh-token',
  'x-session-id',
  'x-csrf-token',
  'proxy-authorization',
]);

// Query params that should be redacted
const SENSITIVE_PARAMS = new Set([
  'token',
  'api_key',
  'apikey',
  'key',
  'secret',
  'password',
  'access_token',
  'refresh_token',
  'auth',
  'session',
  'signature',
  'sig',
]);

const REDACTED = '[REDACTED]';
const PARTIAL_MASK_LENGTH = 4;

function isSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERNS.some(pattern => pattern.test(key));
}

function isSecretValue(value: string): boolean {
  return SECRET_VALUE_PATTERNS.some(pattern => pattern.test(value));
}

function maskValue(value: string, showPartial = false): string {
  if (!showPartial || value.length < PARTIAL_MASK_LENGTH * 2) {
    return REDACTED;
  }
  const prefix = value.slice(0, PARTIAL_MASK_LENGTH);
  const suffix = value.slice(-PARTIAL_MASK_LENGTH);
  return `${prefix}...${suffix}`;
}

export function redactSecrets<T>(data: T, showPartial = false, _depth = 0, _seen?: WeakSet<object>): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Guard against infinite recursion (circular refs or extreme nesting)
  if (_depth > 20) return REDACTED as T;

  if (typeof data === 'string') {
    if (isSecretValue(data)) {
      return maskValue(data, showPartial) as T;
    }
    return data;
  }

  if (typeof data !== 'object') return data;

  // Circular reference guard
  const seen = _seen ?? new WeakSet<object>();
  if (seen.has(data as object)) return REDACTED as T;
  seen.add(data as object);

  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item, showPartial, _depth + 1, seen)) as T;
  }

  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (isSecretKey(key)) {
      if (typeof value === 'string') {
        result[key] = maskValue(value, showPartial);
      } else {
        result[key] = REDACTED;
      }
    } else if (typeof value === 'string' && isSecretValue(value)) {
      result[key] = maskValue(value, showPartial);
    } else {
      result[key] = redactSecrets(value, showPartial, _depth + 1, seen);
    }
  }
  
  return result as T;
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
      result[key] = REDACTED;
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Redact sensitive query params
    for (const param of SENSITIVE_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, REDACTED);
      }
    }
    
    // Check for key-like params
    for (const [key] of parsed.searchParams.entries()) {
      if (isSecretKey(key)) {
        parsed.searchParams.set(key, REDACTED);
      }
    }
    
    // Redact password from auth
    if (parsed.password) {
      parsed.password = REDACTED;
    }
    
    return parsed.toString();
  } catch {
    // If URL parsing fails, do basic redaction
    return url.replace(/([?&])(token|key|secret|password|api_key)=[^&]+/gi, `$1$2=${REDACTED}`);
  }
}

export function redactError(error: Error): { message: string; stack?: string } {
  return {
    message: redactSecrets(error.message) as string,
    stack: error.stack ? redactSecrets(error.stack) as string : undefined,
  };
}

// Quick check if a string might contain secrets
export function mightContainSecrets(text: string): boolean {
  return SECRET_VALUE_PATTERNS.some(pattern => pattern.test(text));
}
