/**
 * #14 — CORS & Header Auditor
 * Validate CORS policies, CSP, HSTS, and cookie flags against OWASP best practices.
 */

export interface HeaderAuditReport {
  cors: CORSAnalysis;
  securityHeaders: SecurityHeaderCheck[];
  cookieFlags: CookieFlagCheck[];
  csp: CSPAnalysis;
  overallScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
  scanTimestamp: string;
}

export interface CORSAnalysis {
  configured: boolean;
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
  isWildcard: boolean;
  issues: string[];
}

export interface SecurityHeaderCheck {
  header: string;
  status: 'present' | 'missing' | 'misconfigured';
  value: string | null;
  recommendation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  owasp: string;
}

export interface CookieFlagCheck {
  cookieName: string | null;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  issues: string[];
}

export interface CSPAnalysis {
  present: boolean;
  directives: Record<string, string[]>;
  issues: string[];
  hasUnsafeInline: boolean;
  hasUnsafeEval: boolean;
}

const REQUIRED_HEADERS: Array<{
  header: string;
  pattern: RegExp;
  recommendation: string;
  severity: SecurityHeaderCheck['severity'];
  owasp: string;
}> = [
  { header: 'Strict-Transport-Security', pattern: /strict-transport-security|hsts/i, recommendation: 'Add HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains', severity: 'high', owasp: 'A07:2021' },
  { header: 'X-Content-Type-Options', pattern: /x-content-type-options|nosniff/i, recommendation: 'Add: X-Content-Type-Options: nosniff', severity: 'medium', owasp: 'A05:2021' },
  { header: 'X-Frame-Options', pattern: /x-frame-options|DENY|SAMEORIGIN/i, recommendation: 'Add: X-Frame-Options: DENY (or use CSP frame-ancestors)', severity: 'medium', owasp: 'A05:2021' },
  { header: 'X-XSS-Protection', pattern: /x-xss-protection/i, recommendation: 'Add: X-XSS-Protection: 0 (rely on CSP instead)', severity: 'low', owasp: 'A03:2021' },
  { header: 'Referrer-Policy', pattern: /referrer-policy/i, recommendation: 'Add: Referrer-Policy: strict-origin-when-cross-origin', severity: 'medium', owasp: 'A05:2021' },
  { header: 'Permissions-Policy', pattern: /permissions-policy|feature-policy/i, recommendation: 'Add: Permissions-Policy to restrict browser features', severity: 'low', owasp: 'A05:2021' },
  { header: 'Content-Security-Policy', pattern: /content-security-policy/i, recommendation: 'Add CSP header to prevent XSS and data injection attacks', severity: 'high', owasp: 'A03:2021' },
];

/**
 * Audit CORS configuration and security headers from source code
 */
export function auditHeaders(
  files: Array<{ path: string; content: string }>
): HeaderAuditReport {
  const allContent = files.map(f => f.content).join('\n');
  const recommendations: string[] = [];

  // CORS Analysis
  const cors = analyzeCORS(allContent, files);

  // Security Headers
  const securityHeaders = analyzeSecurityHeaders(allContent);

  // Cookie Flags
  const cookieFlags = analyzeCookieFlags(allContent);

  // CSP Analysis
  const csp = analyzeCSP(allContent);

  // Calculate score
  let score = 100;
  
  // CORS deductions
  if (cors.isWildcard) score -= 20;
  if (cors.allowCredentials && cors.isWildcard) score -= 15;
  score -= cors.issues.length * 5;

  // Header deductions
  for (const header of securityHeaders) {
    if (header.status === 'missing') {
      score -= header.severity === 'critical' ? 15 : header.severity === 'high' ? 10 : 5;
    } else if (header.status === 'misconfigured') {
      score -= 5;
    }
  }

  // Cookie deductions
  for (const cookie of cookieFlags) {
    score -= cookie.issues.length * 5;
  }

  // CSP deductions
  if (!csp.present) score -= 15;
  if (csp.hasUnsafeInline) score -= 10;
  if (csp.hasUnsafeEval) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const grade: HeaderAuditReport['grade'] = 
    score >= 95 ? 'A+' : score >= 85 ? 'A' : score >= 70 ? 'B' : 
    score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

  // Generate recommendations
  if (cors.isWildcard) recommendations.push('Replace wildcard CORS origin (*) with specific allowed domains');
  for (const header of securityHeaders.filter(h => h.status !== 'present')) {
    recommendations.push(header.recommendation);
  }
  if (!csp.present) recommendations.push('Implement Content-Security-Policy header');
  if (csp.hasUnsafeInline) recommendations.push("Remove 'unsafe-inline' from CSP — use nonces or hashes instead");
  if (csp.hasUnsafeEval) recommendations.push("Remove 'unsafe-eval' from CSP — refactor code to avoid eval()");

  return {
    cors,
    securityHeaders,
    cookieFlags,
    csp,
    overallScore: score,
    grade,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}

function analyzeCORS(allContent: string, files: Array<{ path: string; content: string }>): CORSAnalysis {
  const issues: string[] = [];
  
  const originMatch = allContent.match(/(?:Access-Control-Allow-Origin|origin)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi);
  const methodMatch = allContent.match(/(?:Access-Control-Allow-Methods|methods)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi);
  const headerMatch = allContent.match(/(?:Access-Control-Allow-Headers|allowedHeaders)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi);
  const credMatch = allContent.match(/(?:Access-Control-Allow-Credentials|credentials)\s*[:=]\s*(?:true|['"`]true['"`])/gi);

  const origins = originMatch?.map(m => m.match(/['"`]([^'"`]+)['"`]/)?.[1] || '').filter(Boolean) || [];
  const isWildcard = origins.includes('*') || /origin\s*[:=]\s*['"`]\*['"`]/.test(allContent);
  const allowCredentials = !!credMatch;

  if (isWildcard) issues.push('Wildcard origin (*) allows any domain to make requests');
  if (isWildcard && allowCredentials) issues.push('CRITICAL: Wildcard origin with credentials is a severe security risk');
  if (origins.length === 0 && !isWildcard) issues.push('No CORS origin configuration detected');
  
  const methods = methodMatch?.flatMap(m => (m.match(/['"`]([^'"`]+)['"`]/)?.[1] || '').split(',').map(s => s.trim())) || [];

  return {
    configured: originMatch !== null || isWildcard,
    allowedOrigins: origins,
    allowedMethods: methods,
    allowedHeaders: headerMatch?.flatMap(m => (m.match(/['"`]([^'"`]+)['"`]/)?.[1] || '').split(',').map(s => s.trim())) || [],
    allowCredentials,
    isWildcard,
    issues,
  };
}

function analyzeSecurityHeaders(allContent: string): SecurityHeaderCheck[] {
  return REQUIRED_HEADERS.map(header => {
    const found = header.pattern.test(allContent);
    return {
      header: header.header,
      status: found ? 'present' as const : 'missing' as const,
      value: null,
      recommendation: header.recommendation,
      severity: header.severity,
      owasp: header.owasp,
    };
  });
}

function analyzeCookieFlags(allContent: string): CookieFlagCheck[] {
  const checks: CookieFlagCheck[] = [];
  const cookiePatterns = allContent.match(/(?:set-cookie|cookie|setCookie|res\.cookie)\s*(?:\(|[:=])[^;}\n]+/gi);

  if (cookiePatterns) {
    for (const pattern of cookiePatterns.slice(0, 10)) {
      const issues: string[] = [];
      const secure = /secure/i.test(pattern);
      const httpOnly = /httpOnly/i.test(pattern);
      const sameSiteMatch = pattern.match(/sameSite\s*[:=]\s*['"`]?(\w+)/i);

      if (!secure) issues.push('Missing Secure flag — cookie sent over HTTP');
      if (!httpOnly) issues.push('Missing HttpOnly flag — cookie accessible to JavaScript');
      if (!sameSiteMatch) issues.push('Missing SameSite attribute');
      if (sameSiteMatch?.[1]?.toLowerCase() === 'none' && !secure) issues.push('SameSite=None requires Secure flag');

      checks.push({
        cookieName: null,
        secure,
        httpOnly,
        sameSite: sameSiteMatch?.[1] || null,
        issues,
      });
    }
  }

  return checks;
}

function analyzeCSP(allContent: string): CSPAnalysis {
  const cspMatch = allContent.match(/content-security-policy\s*[:=]\s*['"`]([^'"`]+)['"`]/i);
  const issues: string[] = [];

  if (!cspMatch) {
    return { present: false, directives: {}, issues: ['No CSP header detected'], hasUnsafeInline: false, hasUnsafeEval: false };
  }

  const cspValue = cspMatch[1];
  const directives: Record<string, string[]> = {};
  
  for (const directive of cspValue.split(';')) {
    const parts = directive.trim().split(/\s+/);
    if (parts.length > 0) {
      directives[parts[0]] = parts.slice(1);
    }
  }

  const hasUnsafeInline = cspValue.includes("'unsafe-inline'");
  const hasUnsafeEval = cspValue.includes("'unsafe-eval'");

  if (hasUnsafeInline) issues.push("'unsafe-inline' weakens XSS protection");
  if (hasUnsafeEval) issues.push("'unsafe-eval' allows code injection via eval()");
  if (!directives['default-src']) issues.push("Missing 'default-src' fallback directive");

  return { present: true, directives, issues, hasUnsafeInline, hasUnsafeEval };
}
