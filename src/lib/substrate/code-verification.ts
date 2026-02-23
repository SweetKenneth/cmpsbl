/**
 * Code Verification Engine
 * Validates output quality from ENCODE and Executors.
 * Checks: structural integrity, type safety, injection patterns,
 * resilience patterns, and best practices.
 */

export interface VerificationCheck {
  id: string;
  name: string;
  category: 'structure' | 'safety' | 'resilience' | 'quality' | 'security';
  severity: 'error' | 'warning' | 'info';
  passed: boolean;
  message: string;
  detail?: string;
}

export interface CodeVerificationResult {
  score: number;          // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  checks: VerificationCheck[];
  summary: {
    total: number;
    passed: number;
    errors: number;
    warnings: number;
    info: number;
  };
  timestamp: number;
  source: 'encode' | 'executor' | 'manual';
}

// ── Check Implementations ──────────────────────────────────

function checkInputValidation(code: string): VerificationCheck {
  const hasValidation = /(?:typeof|instanceof|isNaN|\.length|!==\s*(?:undefined|null)|z\.(?:object|string|number)|\.parse\()/i.test(code);
  return {
    id: 'input_validation',
    name: 'Input Validation',
    category: 'resilience',
    severity: 'error',
    passed: hasValidation,
    message: hasValidation ? 'Input validation detected' : 'No input validation found — all inputs should be validated',
  };
}

function checkErrorHandling(code: string): VerificationCheck {
  const hasTryCatch = /try\s*\{/.test(code);
  const hasCatch = /catch\s*\(/.test(code);
  const hasErrorBoundary = /\.catch\(/.test(code) || /onError/.test(code);
  const passed = (hasTryCatch && hasCatch) || hasErrorBoundary;
  return {
    id: 'error_handling',
    name: 'Error Handling',
    category: 'resilience',
    severity: 'error',
    passed,
    message: passed ? 'Error handling present' : 'Missing error handling — all async operations need try/catch or .catch()',
  };
}

function checkTypeAnnotations(code: string): VerificationCheck {
  const hasTypes = /:\s*(?:string|number|boolean|Record|Array|Promise|void|any|unknown|null|undefined)/i.test(code);
  const hasInterface = /(?:interface|type)\s+\w+/i.test(code);
  const passed = hasTypes || hasInterface;
  return {
    id: 'type_annotations',
    name: 'Type Safety',
    category: 'quality',
    severity: 'warning',
    passed,
    message: passed ? 'Type annotations found' : 'Missing TypeScript type annotations',
  };
}

function checkNoHardcodedSecrets(code: string): VerificationCheck {
  const patterns = [
    /(?:api[_-]?key|token|secret|password)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    /(?:sk_|pk_|rk_)[a-zA-Z0-9]{10,}/g,
    /Bearer\s+[A-Za-z0-9+/=._-]{20,}/g,
  ];
  const hasSecrets = patterns.some(p => p.test(code));
  return {
    id: 'no_secrets',
    name: 'No Hardcoded Secrets',
    category: 'security',
    severity: 'error',
    passed: !hasSecrets,
    message: hasSecrets ? 'Hardcoded secrets detected — use environment variables' : 'No hardcoded secrets found',
  };
}

function checkNoXSS(code: string): VerificationCheck {
  const xssPatterns = [
    /innerHTML\s*=/gi,
    /dangerouslySetInnerHTML/gi,
    /document\.write/gi,
    /eval\s*\(/gi,
    /on(?:error|load|click|mouse)\s*=/gi,
  ];
  const hasXSS = xssPatterns.some(p => p.test(code));
  return {
    id: 'no_xss',
    name: 'XSS Prevention',
    category: 'security',
    severity: 'error',
    passed: !hasXSS,
    message: hasXSS ? 'Potential XSS vulnerability detected' : 'No XSS patterns found',
  };
}

function checkReturnTypes(code: string): VerificationCheck {
  const functionDecls = code.match(/(?:function|const|let)\s+\w+.*(?:=>|{)/g) ?? [];
  const withReturnType = functionDecls.filter(f => /\):\s*\w/.test(f));
  const passed = functionDecls.length === 0 || withReturnType.length >= functionDecls.length * 0.5;
  return {
    id: 'return_types',
    name: 'Return Type Annotations',
    category: 'quality',
    severity: 'info',
    passed,
    message: passed ? 'Most functions have return types' : 'Add return type annotations to functions',
  };
}

function checkConsoleUsage(code: string): VerificationCheck {
  const consoleCount = (code.match(/console\.(log|debug|info)\s*\(/g) ?? []).length;
  const passed = consoleCount <= 2;
  return {
    id: 'console_usage',
    name: 'Console Usage',
    category: 'quality',
    severity: 'info',
    passed,
    message: passed ? 'Minimal console usage' : `${consoleCount} console statements found — use structured logging`,
  };
}

function checkTimeoutGuards(code: string): VerificationCheck {
  const hasFetch = /fetch\(|supabase\.|axios\.|\.invoke\(/i.test(code);
  const hasTimeout = /timeout|AbortController|signal|setTimeout/i.test(code);
  const passed = !hasFetch || hasTimeout;
  return {
    id: 'timeout_guards',
    name: 'Timeout Guards',
    category: 'resilience',
    severity: 'warning',
    passed,
    message: passed ? 'External calls have timeout guards' : 'External API calls should have timeout guards (AbortController)',
  };
}

function checkStructuredErrors(code: string): VerificationCheck {
  const throwsRaw = /throw\s+new\s+Error\s*\(\s*['"`]/.test(code);
  const throwsStructured = /throw\s+(?:new\s+\w+Error|{ code|AppError|ServiceError)/i.test(code);
  const passed = !throwsRaw || throwsStructured;
  return {
    id: 'structured_errors',
    name: 'Structured Error Codes',
    category: 'resilience',
    severity: 'info',
    passed,
    message: passed ? 'Error handling uses structured patterns' : 'Use structured error codes instead of raw Error throws',
  };
}

function checkNoAnyTypes(code: string): VerificationCheck {
  const anyCount = (code.match(/:\s*any\b/g) ?? []).length;
  const asAnyCount = (code.match(/as\s+any\b/g) ?? []).length;
  const total = anyCount + asAnyCount;
  const passed = total <= 3;
  return {
    id: 'no_any',
    name: 'Minimal `any` Usage',
    category: 'quality',
    severity: 'warning',
    passed,
    message: passed ? 'Minimal use of `any` type' : `${total} uses of \`any\` — use proper types or \`unknown\``,
  };
}

// ── Main Verification ──────────────────────────────────────

const ALL_CHECKS = [
  checkInputValidation,
  checkErrorHandling,
  checkTypeAnnotations,
  checkNoHardcodedSecrets,
  checkNoXSS,
  checkReturnTypes,
  checkConsoleUsage,
  checkTimeoutGuards,
  checkStructuredErrors,
  checkNoAnyTypes,
];

/**
 * Run code verification against a code string.
 */
export function verifyCode(
  code: string,
  source: CodeVerificationResult['source'] = 'manual',
): CodeVerificationResult {
  const checks = ALL_CHECKS.map(check => check(code));

  const errors = checks.filter(c => !c.passed && c.severity === 'error').length;
  const warnings = checks.filter(c => !c.passed && c.severity === 'warning').length;
  const info = checks.filter(c => !c.passed && c.severity === 'info').length;
  const passed = checks.filter(c => c.passed).length;

  // Score: errors cost 15 pts, warnings 8 pts, info 3 pts
  const rawScore = Math.max(0, 100 - errors * 15 - warnings * 8 - info * 3);
  const score = Math.round(rawScore);

  const grade: CodeVerificationResult['grade'] =
    score >= 90 ? 'A' :
    score >= 75 ? 'B' :
    score >= 60 ? 'C' :
    score >= 40 ? 'D' : 'F';

  return {
    score,
    grade,
    checks,
    summary: { total: checks.length, passed, errors, warnings, info },
    timestamp: Date.now(),
    source,
  };
}

/**
 * Quick pass/fail check for code quality gate.
 */
export function passesQualityGate(code: string): { passed: boolean; score: number; blockers: string[] } {
  const result = verifyCode(code);
  const blockers = result.checks
    .filter(c => !c.passed && c.severity === 'error')
    .map(c => c.message);
  return { passed: blockers.length === 0, score: result.score, blockers };
}
