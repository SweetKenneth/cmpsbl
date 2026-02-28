/**
 * #15 — Rate Limit Stress Tester
 * Probe public endpoints for missing rate limiting.
 */

export interface RateLimitReport {
  endpoints: EndpointRateLimitStatus[];
  globalRateLimit: GlobalRateLimitInfo;
  unprotectedCritical: EndpointRateLimitStatus[];
  totalEndpoints: number;
  protectedCount: number;
  unprotectedCount: number;
  riskScore: number;
  recommendations: string[];
  scanTimestamp: string;
}

export interface EndpointRateLimitStatus {
  path: string;
  method: string;
  hasRateLimit: boolean;
  rateLimitType: 'per_ip' | 'per_user' | 'global' | 'none';
  limit: number | null;
  window: string | null;
  isCritical: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export interface GlobalRateLimitInfo {
  detected: boolean;
  middleware: string | null;
  defaultLimit: number | null;
  defaultWindow: string | null;
}

// Critical endpoints that MUST have rate limiting
const CRITICAL_ENDPOINTS = [
  { pattern: /auth|login|signin|sign-in/i, reason: 'Authentication endpoint — brute-force risk' },
  { pattern: /signup|register|sign-up|create-account/i, reason: 'Registration endpoint — bot abuse risk' },
  { pattern: /password|forgot|reset/i, reason: 'Password reset — enumeration & abuse risk' },
  { pattern: /payment|checkout|charge|subscribe/i, reason: 'Payment endpoint — fraud risk' },
  { pattern: /upload|import/i, reason: 'Upload endpoint — resource exhaustion risk' },
  { pattern: /api\/v\d+/i, reason: 'API endpoint — rate abuse risk' },
  { pattern: /webhook/i, reason: 'Webhook endpoint — replay attack risk' },
  { pattern: /search|query/i, reason: 'Search endpoint — DoS via expensive queries' },
  { pattern: /email|sms|notify|send/i, reason: 'Notification endpoint — spam abuse risk' },
  { pattern: /otp|verify|code/i, reason: 'Verification endpoint — brute-force risk' },
  { pattern: /export|download/i, reason: 'Export endpoint — resource exhaustion risk' },
  { pattern: /graphql/i, reason: 'GraphQL endpoint — query complexity abuse risk' },
];

// Rate limit library patterns
const RATE_LIMIT_LIBRARY_PATTERNS = [
  { pattern: /express-rate-limit|rateLimit/i, type: 'express-rate-limit' },
  { pattern: /rate-limiter-flexible/i, type: 'rate-limiter-flexible' },
  { pattern: /bottleneck/i, type: 'bottleneck' },
  { pattern: /@fastify\/rate-limit/i, type: 'fastify-rate-limit' },
  { pattern: /express-slow-down/i, type: 'express-slow-down' },
  { pattern: /@upstash\/ratelimit/i, type: 'upstash-ratelimit' },
  { pattern: /limiter|throttle/i, type: 'generic' },
];

// Rate limit configuration patterns
const RATE_CONFIG_PATTERNS = {
  limit: /(?:max|limit|points|requests)\s*[:=]\s*(\d+)/i,
  window: /(?:windowMs|window|duration|per)\s*[:=]\s*(\d+\s*\*?\s*\d*\s*\*?\s*\d*)|['"`](\d+[smhd])['"`]/i,
};

/**
 * Analyze rate limiting coverage across endpoints
 */
export function analyzeRateLimits(
  files: Array<{ path: string; content: string }>,
  routes: Array<{ path: string; method: string; file: string }>
): RateLimitReport {
  const endpoints: EndpointRateLimitStatus[] = [];
  const recommendations: string[] = [];
  const allContent = files.map(f => f.content).join('\n');

  // Detect global rate limit middleware
  const globalRateLimit = detectGlobalRateLimit(allContent);

  // Analyze each route
  for (const route of routes) {
    const routeFile = files.find(f => f.path === route.file);
    const fileContent = routeFile?.content || '';
    
    // Check if this specific route has rate limiting
    const hasLocalRateLimit = RATE_LIMIT_LIBRARY_PATTERNS.some(p => p.pattern.test(fileContent));
    const hasRateLimit = hasLocalRateLimit || globalRateLimit.detected;
    
    // Determine rate limit type
    let rateLimitType: EndpointRateLimitStatus['rateLimitType'] = 'none';
    if (hasRateLimit) {
      if (/ip|remoteAddress|req\.ip/i.test(fileContent)) rateLimitType = 'per_ip';
      else if (/user\.id|userId|auth\.uid/i.test(fileContent)) rateLimitType = 'per_user';
      else rateLimitType = globalRateLimit.detected ? 'global' : 'per_ip';
    }

    // Extract limits
    const limitMatch = fileContent.match(RATE_CONFIG_PATTERNS.limit);
    const limit = limitMatch ? parseInt(limitMatch[1]) : globalRateLimit.defaultLimit;

    // Check if critical
    const criticalMatch = CRITICAL_ENDPOINTS.find(c => c.pattern.test(route.path));
    const isCritical = !!criticalMatch;

    // Risk level
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(route.method);
    let riskLevel: EndpointRateLimitStatus['riskLevel'] = 'safe';
    
    if (!hasRateLimit) {
      if (isCritical) riskLevel = 'critical';
      else if (isMutation) riskLevel = 'high';
      else riskLevel = 'medium';
    } else if (limit && limit > 1000) {
      riskLevel = isCritical ? 'medium' : 'low';
    }

    endpoints.push({
      path: route.path,
      method: route.method,
      hasRateLimit,
      rateLimitType,
      limit,
      window: null,
      isCritical,
      riskLevel,
      reason: criticalMatch?.reason || (isMutation ? 'Mutation endpoint' : 'Standard endpoint'),
    });
  }

  const unprotectedCritical = endpoints.filter(e => !e.hasRateLimit && e.isCritical);
  const protectedCount = endpoints.filter(e => e.hasRateLimit).length;
  const unprotectedCount = endpoints.filter(e => !e.hasRateLimit).length;

  // Recommendations
  if (unprotectedCritical.length > 0) {
    recommendations.push(`CRITICAL: ${unprotectedCritical.length} critical endpoint(s) lack rate limiting`);
    for (const ep of unprotectedCritical.slice(0, 5)) {
      recommendations.push(`  → ${ep.method} ${ep.path}: ${ep.reason}`);
    }
  }

  if (!globalRateLimit.detected) {
    recommendations.push('No global rate limiting middleware detected — add one as a baseline defense');
  }

  const unprotectedMutations = endpoints.filter(e => !e.hasRateLimit && ['POST', 'PUT', 'DELETE'].includes(e.method));
  if (unprotectedMutations.length > 0) {
    recommendations.push(`${unprotectedMutations.length} mutation endpoint(s) lack rate limiting`);
  }

  const riskScore = Math.min(100,
    unprotectedCritical.length * 20 +
    unprotectedMutations.length * 10 +
    (globalRateLimit.detected ? 0 : 15)
  );

  return {
    endpoints,
    globalRateLimit,
    unprotectedCritical,
    totalEndpoints: endpoints.length,
    protectedCount,
    unprotectedCount,
    riskScore,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}

function detectGlobalRateLimit(allContent: string): GlobalRateLimitInfo {
  for (const lib of RATE_LIMIT_LIBRARY_PATTERNS) {
    if (lib.pattern.test(allContent)) {
      const limitMatch = allContent.match(RATE_CONFIG_PATTERNS.limit);
      return {
        detected: true,
        middleware: lib.type,
        defaultLimit: limitMatch ? parseInt(limitMatch[1]) : null,
        defaultWindow: null,
      };
    }
  }

  return { detected: false, middleware: null, defaultLimit: null, defaultWindow: null };
}
