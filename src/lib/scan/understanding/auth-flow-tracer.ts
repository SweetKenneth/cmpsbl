/**
 * #7 — Auth Flow Tracer
 * Trace the full authentication lifecycle to detect gaps.
 */

export interface AuthFlowAnalysis {
  flows: AuthFlow[];
  gaps: AuthGap[];
  tokenManagement: TokenManagementInfo;
  passwordPolicy: PasswordPolicyInfo;
  sessionConfig: SessionConfigInfo;
  overallScore: number;
  recommendations: string[];
  scanTimestamp: string;
}

export interface AuthFlow {
  name: string;
  type: 'signup' | 'login' | 'logout' | 'password_reset' | 'token_refresh' | 'email_verify' | 'mfa' | 'oauth' | 'magic_link';
  implemented: boolean;
  secure: boolean;
  issues: string[];
  evidence: string[];
}

export interface AuthGap {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation: string;
  category: 'token' | 'session' | 'password' | 'flow' | 'storage' | 'transport';
}

export interface TokenManagementInfo {
  usesJWT: boolean;
  usesRefreshTokens: boolean;
  tokenStorageMethod: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory' | 'unknown';
  tokenExpiry: string | null;
  rotationImplemented: boolean;
  issues: string[];
}

export interface PasswordPolicyInfo {
  minLength: number | null;
  requiresUppercase: boolean;
  requiresNumbers: boolean;
  requiresSpecialChars: boolean;
  hasBreachCheck: boolean;
  issues: string[];
}

export interface SessionConfigInfo {
  sessionTimeout: string | null;
  idleTimeout: string | null;
  concurrentSessions: boolean;
  secureCookies: boolean;
  httpOnlyCookies: boolean;
  sameSiteCookies: string | null;
  issues: string[];
}

// Auth-related code patterns
const AUTH_CODE_PATTERNS = {
  signup: [/signup|sign.?up|register|create.?account|onboard/i],
  login: [/login|sign.?in|authenticate|credential/i],
  logout: [/logout|sign.?out|log.?out|clearSession|revokeToken/i],
  password_reset: [/reset.?password|forgot.?password|password.?recovery/i],
  token_refresh: [/refresh.?token|token.?refresh|renewToken|rotateToken/i],
  email_verify: [/verify.?email|email.?verification|confirm.?email/i],
  mfa: [/mfa|2fa|two.?factor|totp|authenticator/i],
  oauth: [/oauth|openid|google.?auth|github.?auth|social.?login/i],
  magic_link: [/magic.?link|passwordless|email.?link/i],
};

const TOKEN_STORAGE_PATTERNS = {
  localStorage: [/localStorage\.setItem.*(?:token|jwt|auth)/i, /localStorage\[.*(?:token|jwt|auth)/i],
  sessionStorage: [/sessionStorage\.setItem.*(?:token|jwt|auth)/i],
  cookie: [/document\.cookie|setCookie|js-cookie|cookie.*token/i, /httpOnly.*true/i],
  memory: [/(?:const|let|var)\s+(?:token|jwt)\s*=/i, /useState.*token/i],
};

const PASSWORD_POLICY_PATTERNS = {
  minLength: /(?:min|minimum).*(?:length|len|char).*?(\d+)|\.length\s*>=?\s*(\d+)/i,
  uppercase: /[A-Z]|uppercase|upper.?case/,
  numbers: /\d|[0-9]|digit|number/,
  specialChars: /[!@#$%^&*]|special|symbol|punctuation/,
  breachCheck: /haveibeenpwned|breach|pwned|compromised/i,
};

/**
 * Analyze authentication flows from source code
 */
export function analyzeAuthFlows(
  files: Array<{ path: string; content: string }>
): AuthFlowAnalysis {
  const flows: AuthFlow[] = [];
  const gaps: AuthGap[] = [];
  const recommendations: string[] = [];

  const allContent = files.map(f => f.content).join('\n');

  // Check each auth flow
  for (const [flowType, patterns] of Object.entries(AUTH_CODE_PATTERNS)) {
    const evidence: string[] = [];
    let implemented = false;
    const issues: string[] = [];

    for (const file of files) {
      for (const pattern of patterns) {
        if (pattern.test(file.content)) {
          implemented = true;
          evidence.push(file.path);
        }
      }
    }

    // Flow-specific security checks
    if (flowType === 'login' && implemented) {
      if (!/rate.?limit|throttle|attempt/i.test(allContent)) {
        issues.push('No rate limiting on login attempts');
      }
      if (!/lockout|lock.?out|max.?attempts/i.test(allContent)) {
        issues.push('No account lockout after failed attempts');
      }
    }

    if (flowType === 'signup' && implemented) {
      if (!/captcha|recaptcha|turnstile|hcaptcha/i.test(allContent)) {
        issues.push('No CAPTCHA protection on signup');
      }
    }

    if (flowType === 'password_reset' && implemented) {
      if (!/expir|ttl|timeout/i.test(allContent)) {
        issues.push('Reset token may not expire');
      }
    }

    flows.push({
      name: flowType.replace(/_/g, ' '),
      type: flowType as AuthFlow['type'],
      implemented,
      secure: implemented && issues.length === 0,
      issues,
      evidence: [...new Set(evidence)],
    });
  }

  // Token management analysis
  const tokenManagement = analyzeTokenManagement(files, allContent);

  // Password policy analysis
  const passwordPolicy = analyzePasswordPolicy(allContent);

  // Session config analysis
  const sessionConfig = analyzeSessionConfig(allContent);

  // Generate gaps
  const unimplemented = flows.filter(f => !f.implemented);
  
  if (!flows.find(f => f.type === 'logout')?.implemented) {
    gaps.push({
      id: 'gap-no-logout',
      severity: 'high',
      title: 'Missing logout implementation',
      description: 'No logout flow detected. Users cannot properly terminate sessions.',
      remediation: 'Implement server-side session invalidation and client-side token cleanup on logout.',
      category: 'flow',
    });
  }

  if (!flows.find(f => f.type === 'token_refresh')?.implemented && tokenManagement.usesJWT) {
    gaps.push({
      id: 'gap-no-refresh',
      severity: 'critical',
      title: 'Missing token refresh mechanism',
      description: 'JWT tokens are used without refresh token rotation. Short-lived tokens will force re-authentication.',
      remediation: 'Implement refresh token rotation with secure storage (httpOnly cookies).',
      category: 'token',
    });
  }

  if (tokenManagement.tokenStorageMethod === 'localStorage') {
    gaps.push({
      id: 'gap-localstorage-token',
      severity: 'high',
      title: 'Tokens stored in localStorage',
      description: 'localStorage is accessible to any JavaScript on the page, making tokens vulnerable to XSS attacks.',
      remediation: 'Store tokens in httpOnly secure cookies or in-memory with refresh token rotation.',
      category: 'storage',
    });
  }

  if (!sessionConfig.secureCookies && /cookie/i.test(allContent)) {
    gaps.push({
      id: 'gap-insecure-cookies',
      severity: 'high',
      title: 'Cookies not marked as Secure',
      description: 'Session cookies may be transmitted over HTTP, exposing them to interception.',
      remediation: 'Set Secure and HttpOnly flags on all authentication cookies.',
      category: 'transport',
    });
  }

  if (!flows.find(f => f.type === 'mfa')?.implemented) {
    gaps.push({
      id: 'gap-no-mfa',
      severity: 'medium',
      title: 'No multi-factor authentication',
      description: 'MFA is not implemented, reducing account security.',
      remediation: 'Implement TOTP-based MFA or WebAuthn for enhanced security.',
      category: 'flow',
    });
  }

  // Overall score
  const implementedCount = flows.filter(f => f.implemented).length;
  const secureCount = flows.filter(f => f.secure).length;
  const totalFlows = flows.length;
  const overallScore = Math.round(((implementedCount * 0.5 + secureCount * 0.5) / totalFlows) * 100);

  // Recommendations
  if (gaps.length > 0) {
    recommendations.push(...gaps.filter(g => g.severity === 'critical').map(g => `[CRITICAL] ${g.remediation}`));
    recommendations.push(...gaps.filter(g => g.severity === 'high').map(g => `[HIGH] ${g.remediation}`));
  }

  return {
    flows,
    gaps,
    tokenManagement,
    passwordPolicy,
    sessionConfig,
    overallScore,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}

function analyzeTokenManagement(
  files: Array<{ path: string; content: string }>,
  allContent: string
): TokenManagementInfo {
  const usesJWT = /jwt|jsonwebtoken|jose/i.test(allContent);
  const usesRefreshTokens = /refresh.?token|refreshToken/i.test(allContent);
  const issues: string[] = [];

  let tokenStorageMethod: TokenManagementInfo['tokenStorageMethod'] = 'unknown';
  for (const [method, patterns] of Object.entries(TOKEN_STORAGE_PATTERNS)) {
    if (patterns.some(p => p.test(allContent))) {
      tokenStorageMethod = method as TokenManagementInfo['tokenStorageMethod'];
      break;
    }
  }

  const expiryMatch = allContent.match(/expiresIn.*?['"`](\d+[smhd])['"`]|maxAge.*?(\d+)/i);
  const tokenExpiry = expiryMatch?.[1] || expiryMatch?.[2] || null;

  const rotationImplemented = /rotate|rotation|revoke.*old/i.test(allContent);

  if (usesJWT && !usesRefreshTokens) issues.push('JWTs used without refresh token mechanism');
  if (tokenStorageMethod === 'localStorage') issues.push('Tokens in localStorage — vulnerable to XSS');
  if (!rotationImplemented && usesRefreshTokens) issues.push('Refresh tokens not rotated on use');

  return { usesJWT, usesRefreshTokens, tokenStorageMethod, tokenExpiry, rotationImplemented, issues };
}

function analyzePasswordPolicy(allContent: string): PasswordPolicyInfo {
  const minLengthMatch = allContent.match(PASSWORD_POLICY_PATTERNS.minLength);
  const minLength = minLengthMatch ? parseInt(minLengthMatch[1] || minLengthMatch[2]) : null;
  const issues: string[] = [];

  if (minLength !== null && minLength < 8) issues.push('Password minimum length is below 8 characters');
  if (minLength === null) issues.push('No minimum password length enforcement detected');

  return {
    minLength,
    requiresUppercase: PASSWORD_POLICY_PATTERNS.uppercase.test(allContent),
    requiresNumbers: PASSWORD_POLICY_PATTERNS.numbers.test(allContent),
    requiresSpecialChars: PASSWORD_POLICY_PATTERNS.specialChars.test(allContent),
    hasBreachCheck: PASSWORD_POLICY_PATTERNS.breachCheck.test(allContent),
    issues,
  };
}

function analyzeSessionConfig(allContent: string): SessionConfigInfo {
  const issues: string[] = [];
  const secureCookies = /secure\s*:\s*true|Secure/i.test(allContent);
  const httpOnlyCookies = /httpOnly\s*:\s*true|HttpOnly/i.test(allContent);
  const sameSiteMatch = allContent.match(/sameSite\s*:\s*['"`]?(Strict|Lax|None)['"`]?/i);

  if (!secureCookies) issues.push('No Secure flag detected on cookies');
  if (!httpOnlyCookies) issues.push('No HttpOnly flag detected on cookies');
  if (sameSiteMatch?.[1]?.toLowerCase() === 'none') issues.push('SameSite=None allows cross-site cookie access');

  return {
    sessionTimeout: null,
    idleTimeout: null,
    concurrentSessions: /concurrent|max.?sessions/i.test(allContent),
    secureCookies,
    httpOnlyCookies,
    sameSiteCookies: sameSiteMatch?.[1] || null,
    issues,
  };
}
