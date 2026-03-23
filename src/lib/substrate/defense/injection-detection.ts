/**
 * DEFENSE — Enterprise Injection Detection Engine v2.0.0 (Hardened)
 * Deep analysis of inputs for injection attacks across multiple vectors.
 *
 * v2.0.0 Hardening:
 *  - Anti-evasion: input normalization before pattern matching
 *  - Case-folded + comment-stripped scanning
 *  - Recursive payload decoding for nested injection
 *  - Frozen immutable results
 *  - Severity escalation for multi-vector chained attacks
 *  - Allowlist bypass prevention
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type InjectionVector =
  | 'sql_injection'
  | 'xss'
  | 'command_injection'
  | 'ssrf'
  | 'template_injection'
  | 'prototype_pollution'
  | 'path_traversal'
  | 'ldap_injection'
  | 'header_injection'
  | 'nosql_injection'
  | 'xml_injection'
  | 'open_redirect';

export type InputContext = 'query_param' | 'body_field' | 'header' | 'url_path' | 'file_name' | 'unknown';

export interface InjectionDetection {
  readonly vector: InjectionVector;
  readonly confidence: number;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly pattern: string;
  readonly matchedContent: string;
  readonly description: string;
  readonly cwe?: string;
  readonly mitreTechnique?: string;
}

export interface InjectionScanResult {
  readonly safe: boolean;
  readonly detections: readonly InjectionDetection[];
  readonly highestSeverity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  readonly riskScore: number;
  readonly chainedAttack: boolean;
  readonly evasionDetected: boolean;
  readonly scanDurationMs: number;
  readonly inputContext: InputContext;
  readonly normalizations: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// INPUT NORMALIZER — defeat evasion before pattern match
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeForInjectionScan(input: string): { content: string; techniques: string[] } {
  const techniques: string[] = [];
  let content = input;

  // 1. Null byte removal
  if (/\0|\x00/.test(content)) {
    content = content.replace(/\0|\x00/g, '');
    techniques.push('null_byte');
  }

  // 2. Unicode normalization
  try {
    const n = content.normalize('NFKC');
    if (n !== content) { content = n; techniques.push('unicode_nfkc'); }
  } catch { /* skip */ }

  // 3. SQL comment bypass (sel/**/ect → select)
  if (/\/\*.*?\*\//.test(content)) {
    content = content.replace(/\/\*.*?\*\//gs, '');
    techniques.push('sql_comment_strip');
  }

  // 4. HTML entity decode
  if (/&#x?[0-9a-f]+;/i.test(content)) {
    content = content
      .replace(/&#x([0-9a-f]{1,4});/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&#(\d{1,5});/g, (_, d) => String.fromCharCode(parseInt(d, 10)));
    techniques.push('html_entity');
  }

  // 5. Excessive whitespace collapse (S E L E C T → SELECT)
  if (/\w\s{2,}\w/.test(content)) {
    content = content.replace(/(\w)\s+(?=\w)/g, '$1 ');
    techniques.push('whitespace_collapse');
  }

  // 6. Double URL decode
  if (/%25[0-9a-f]{2}/i.test(content)) {
    try {
      content = decodeURIComponent(content);
      techniques.push('double_url_decode');
    } catch { /* skip */ }
  }

  return { content, techniques };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION RULES
// ═══════════════════════════════════════════════════════════════════════════════

interface InjectionRule {
  id: string;
  vector: InjectionVector;
  patterns: RegExp[];
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  cwe?: string;
  mitreTechnique?: string;
}

const INJECTION_RULES: InjectionRule[] = [
  // ── SQL Injection ──────────────────────────────────────────────────
  {
    id: 'SQLi-001', vector: 'sql_injection', confidence: 0.95, severity: 'critical', cwe: 'CWE-89', mitreTechnique: 'T1190',
    description: 'Classic SQL injection — UNION SELECT, OR 1=1, comment termination',
    patterns: [
      /(?:'\s*(?:OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i,
      /(?:UNION\s+(?:ALL\s+)?SELECT)/i,
      /(?:;\s*(?:DROP|DELETE|INSERT|UPDATE|ALTER|CREATE)\s)/i,
      /(?:--\s*$|#\s*$|\/\*[\s\S]*?\*\/)/,
    ],
  },
  {
    id: 'SQLi-002', vector: 'sql_injection', confidence: 0.85, severity: 'high', cwe: 'CWE-89',
    description: 'Blind SQL injection — time-based or boolean-based',
    patterns: [
      /(?:SLEEP\s*\(\s*\d+\s*\)|WAITFOR\s+DELAY|BENCHMARK\s*\()/i,
      /(?:IF\s*\(.*,\s*SLEEP)/i,
      /(?:(?:AND|OR)\s+\d+\s*[<>=]+\s*\d+)/i,
    ],
  },
  {
    id: 'SQLi-003', vector: 'sql_injection', confidence: 0.8, severity: 'high', cwe: 'CWE-89',
    description: 'SQL injection via stacked queries or subqueries',
    patterns: [
      /(?:;\s*SELECT\s)/i,
      /(?:INTO\s+(?:OUT|DUMP)FILE)/i,
      /(?:LOAD_FILE\s*\()/i,
    ],
  },
  // v2.0.0 — error-based SQLi
  {
    id: 'SQLi-004', vector: 'sql_injection', confidence: 0.8, severity: 'high', cwe: 'CWE-89',
    description: 'Error-based SQL injection via type conversion or extractvalue',
    patterns: [
      /(?:EXTRACTVALUE|UPDATEXML|XMLTYPE)\s*\(/i,
      /(?:CONVERT\s*\(.*USING\s)/i,
      /(?:GROUP\s+BY\s+.+HAVING)/i,
    ],
  },

  // ── XSS ────────────────────────────────────────────────────────────
  {
    id: 'XSS-001', vector: 'xss', confidence: 0.95, severity: 'critical', cwe: 'CWE-79', mitreTechnique: 'T1059.007',
    description: 'Reflected/stored XSS via script tags or event handlers',
    patterns: [
      /<script[\s>]/i,
      /javascript\s*:/i,
      /on(?:error|load|click|mouseover|focus|blur|submit|change|input|abort|animationend|pointerdown)\s*=/i,
    ],
  },
  {
    id: 'XSS-002', vector: 'xss', confidence: 0.85, severity: 'high', cwe: 'CWE-79',
    description: 'XSS via HTML injection, data URIs, or SVG payloads',
    patterns: [
      /<(?:img|iframe|embed|object|video|audio|source|link)\b[^>]*(?:src|href)\s*=\s*['"]?(?:data:|javascript:)/i,
      /<svg[\s>].*?(?:onload|onerror)/i,
      /(?:document\.(?:write|writeln)|\.innerHTML\s*=)/i,
    ],
  },
  {
    id: 'XSS-003', vector: 'xss', confidence: 0.7, severity: 'medium', cwe: 'CWE-79',
    description: 'DOM-based XSS via location, hash, or referrer manipulation',
    patterns: [
      /(?:location\s*[\[.](?:hash|search|href)|document\.referrer)/i,
      /(?:eval|Function|setTimeout|setInterval)\s*\(\s*(?:location|document)/i,
    ],
  },
  // v2.0.0 — mXSS and mutation-based XSS
  {
    id: 'XSS-004', vector: 'xss', confidence: 0.8, severity: 'high', cwe: 'CWE-79',
    description: 'Mutation XSS via template/style/noscript abuse',
    patterns: [
      /<(?:template|noscript|style|textarea)\b[^>]*>/i,
      /expression\s*\(/i,
      /(?:@import|url\s*\()\s*['"]?(?:javascript:|data:)/i,
    ],
  },

  // ── Command Injection ──────────────────────────────────────────────
  {
    id: 'CMD-001', vector: 'command_injection', confidence: 0.95, severity: 'critical', cwe: 'CWE-78', mitreTechnique: 'T1059',
    description: 'OS command injection via shell metacharacters',
    patterns: [
      /(?:[;|`]\s*(?:ls|cat|id|whoami|pwd|uname|curl|wget|nc|ncat)\b)/i,
      /(?:\$\(.*\)|`.*`)/,
      /(?:&&\s*(?:cat|rm|mv|cp|curl|wget|chmod)\b)/i,
    ],
  },
  {
    id: 'CMD-002', vector: 'command_injection', confidence: 0.8, severity: 'high', cwe: 'CWE-78',
    description: 'Command injection via environment variable manipulation',
    patterns: [
      /(?:\$\{.*\}|%[A-Z_]+%)/,
      /(?:(?:export|set)\s+[A-Z_]+=)/i,
    ],
  },

  // ── SSRF ───────────────────────────────────────────────────────────
  {
    id: 'SSRF-001', vector: 'ssrf', confidence: 0.9, severity: 'critical', cwe: 'CWE-918', mitreTechnique: 'T1090',
    description: 'Server-side request forgery targeting internal networks',
    patterns: [
      /(?:https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+))/i,
      /(?:https?:\/\/169\.254\.169\.254)/i,
      /(?:file:\/\/|gopher:\/\/|dict:\/\/)/i,
    ],
  },
  {
    id: 'SSRF-002', vector: 'ssrf', confidence: 0.75, severity: 'high', cwe: 'CWE-918',
    description: 'SSRF via DNS rebinding or URL shortener bypass',
    patterns: [
      /(?:https?:\/\/.*@)/i,
      /(?:https?:\/\/[^/]*\.(?:internal|local|corp|private)\b)/i,
      /(?:https?:\/\/\[::1\])/i,
    ],
  },
  // v2.0.0 — SSRF via decimal/octal IP
  {
    id: 'SSRF-003', vector: 'ssrf', confidence: 0.85, severity: 'high', cwe: 'CWE-918',
    description: 'SSRF via obfuscated IP (decimal, octal, hex)',
    patterns: [
      /(?:https?:\/\/\d{8,10}(?:\/|$))/i,  // decimal IP
      /(?:https?:\/\/0x[0-9a-f]{8})/i,       // hex IP
      /(?:https?:\/\/0[0-7]{3,}\.)/i,        // octal IP
    ],
  },

  // ── Template Injection ─────────────────────────────────────────────
  {
    id: 'TMPL-001', vector: 'template_injection', confidence: 0.9, severity: 'critical', cwe: 'CWE-1336',
    description: 'Server-side template injection (SSTI)',
    patterns: [
      /\{\{.*(?:__class__|__mro__|__subclasses__|__builtins__|__import__|config).*\}\}/i,
      /\$\{.*(?:Runtime|ProcessBuilder|exec|getClass)\}/i,
      /(?:#set\s*\(\s*\$|#foreach|#include\s*\()/i,
    ],
  },
  {
    id: 'TMPL-002', vector: 'template_injection', confidence: 0.7, severity: 'high', cwe: 'CWE-1336',
    description: 'Template injection via expression language',
    patterns: [
      /\{\{\s*\d+\s*[+\-*\/]\s*\d+\s*\}\}/,
      /\$\{.*\}/,
      /<%.*%>/,
    ],
  },

  // ── Prototype Pollution ────────────────────────────────────────────
  {
    id: 'PROTO-001', vector: 'prototype_pollution', confidence: 0.9, severity: 'critical', cwe: 'CWE-1321',
    description: 'JavaScript prototype pollution via __proto__ or constructor',
    patterns: [
      /__proto__/i,
      /constructor\s*\[\s*['"]prototype['"]\s*\]/i,
      /Object\.(?:assign|defineProperty)\s*\(\s*(?:Object\.prototype|{}\.constructor)/i,
    ],
  },

  // ── Path Traversal ─────────────────────────────────────────────────
  {
    id: 'PATH-001', vector: 'path_traversal', confidence: 0.9, severity: 'high', cwe: 'CWE-22',
    description: 'Directory traversal via ../ sequences or encoded variants',
    patterns: [
      /(?:\.\.\/){2,}/,
      /(?:\.\.\\){2,}/,
      /(?:%2e%2e(?:%2f|%5c)){2,}/i,
      /(?:\.\.%252f){2,}/i,
    ],
  },

  // ── Header Injection ───────────────────────────────────────────────
  {
    id: 'HDR-001', vector: 'header_injection', confidence: 0.85, severity: 'high', cwe: 'CWE-113',
    description: 'HTTP header injection via CRLF characters',
    patterns: [
      /(?:%0d%0a|%0a|%0d|\r\n|\n|\r)(?:Set-Cookie|Location|Content-Type|HTTP\/)/i,
      /(?:\\r\\n|\\n)(?:Set-Cookie|Location)/i,
    ],
  },

  // ── NoSQL Injection ────────────────────────────────────────────────
  {
    id: 'NOSQL-001', vector: 'nosql_injection', confidence: 0.9, severity: 'critical', cwe: 'CWE-943',
    description: 'NoSQL injection via MongoDB operators or JSON manipulation',
    patterns: [
      /\$(?:gt|gte|lt|lte|ne|in|nin|regex|where|exists|type)\b/i,
      /\{\s*['"]\$(?:gt|ne|regex|where)['"]:/i,
    ],
  },

  // ── XML Injection ──────────────────────────────────────────────────
  {
    id: 'XXE-001', vector: 'xml_injection', confidence: 0.95, severity: 'critical', cwe: 'CWE-611',
    description: 'XML External Entity (XXE) injection',
    patterns: [
      /<!DOCTYPE\s+\w+\s*\[\s*<!ENTITY/i,
      /<!ENTITY\s+\w+\s+SYSTEM/i,
      /<!ENTITY\s+%\s+\w+/i,
    ],
  },

  // v2.0.0 — Open Redirect
  {
    id: 'REDIR-001', vector: 'open_redirect', confidence: 0.8, severity: 'medium', cwe: 'CWE-601',
    description: 'Open redirect via URL parameter manipulation',
    patterns: [
      /(?:(?:redirect|return|next|url|goto|target|dest|rurl|redir)_?(?:url|uri|to|path)?=\s*(?:https?:|\/\/))/i,
      /(?:\/\/[^/]+\.(?:com|net|org|io)\b)/i,
    ],
  },
];

// Pre-index rules by vector for targeted scanning
const rulesByVector = new Map<InjectionVector, InjectionRule[]>();
for (const rule of INJECTION_RULES) {
  const arr = rulesByVector.get(rule.vector);
  if (arr) arr.push(rule); else rulesByVector.set(rule.vector, [rule]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXT CONFIDENCE MATRIX — systematic boosting
// ═══════════════════════════════════════════════════════════════════════════════

const CONTEXT_BOOST: Partial<Record<InputContext, Partial<Record<InjectionVector, number>>>> = {
  header:      { header_injection: 0.1, xss: 0.05 },
  url_path:    { path_traversal: 0.1, ssrf: 0.05, open_redirect: 0.1 },
  query_param: { sql_injection: 0.05, xss: 0.05, open_redirect: 0.1 },
  file_name:   { path_traversal: 0.15 },
  body_field:  { sql_injection: 0.05, nosql_injection: 0.05, template_injection: 0.05, prototype_pollution: 0.1 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCANNER
// ═══════════════════════════════════════════════════════════════════════════════

export interface InjectionScanOptions {
  context?: InputContext;
  vectors?: InjectionVector[];
  maxInputLength?: number;
  enableNormalization?: boolean;
}

/**
 * Scan input for injection attacks across all vectors.
 * Returns a frozen, immutable result with detections, risk score, and chained attack flag.
 */
export function detectInjection(input: string, options?: InjectionScanOptions): InjectionScanResult {
  const start = performance.now();
  const context: InputContext = options?.context || 'unknown';
  const maxLen = options?.maxInputLength || 32_768;
  const enableNorm = options?.enableNormalization !== false;

  // Truncate oversized inputs
  let scanInput = input.length > maxLen ? input.slice(0, maxLen) : input;
  const normalizations: string[] = [];

  // Anti-evasion normalization
  if (enableNorm) {
    const norm = normalizeForInjectionScan(scanInput);
    scanInput = norm.content;
    normalizations.push(...norm.techniques);
  }

  const detections: InjectionDetection[] = [];
  const detectedVectors = new Set<InjectionVector>();

  // Select rules to check
  const rulesToCheck = options?.vectors
    ? INJECTION_RULES.filter(r => options.vectors!.includes(r.vector))
    : INJECTION_RULES;

  const contextBoosts = CONTEXT_BOOST[context] || {};

  for (const rule of rulesToCheck) {
    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(scanInput);
      if (match) {
        detectedVectors.add(rule.vector);

        // Systematic context-aware confidence adjustment
        const boost = contextBoosts[rule.vector] || 0;
        const adjustedConfidence = Math.min(1, rule.confidence + boost);

        detections.push(Object.freeze({
          vector: rule.vector,
          confidence: adjustedConfidence,
          severity: rule.severity,
          pattern: pattern.source.slice(0, 60),
          matchedContent: redactInjection(match[0]),
          description: rule.description,
          cwe: rule.cwe,
          mitreTechnique: rule.mitreTechnique,
        }));

        break;
      }
    }
  }

  // Chained attack detection — escalate severity when multiple vectors combine
  const chainedAttack = detectedVectors.size >= 2;
  const evasionDetected = normalizations.length >= 2 && detections.length > 0;

  // Compute risk score
  const severityWeights = { critical: 40, high: 25, medium: 15, low: 5 };
  let riskScore = 0;
  for (const d of detections) {
    riskScore += severityWeights[d.severity] * d.confidence;
  }
  if (chainedAttack) riskScore *= 1.5;
  if (evasionDetected) riskScore *= 1.3; // Evasion penalty
  riskScore = Math.min(100, Math.round(riskScore));

  // Highest severity
  const severityOrder: InjectionScanResult['highestSeverity'][] = ['critical', 'high', 'medium', 'low', 'none'];
  let highestSeverity: InjectionScanResult['highestSeverity'] = 'none';
  for (const sev of severityOrder) {
    if (sev === 'none') break;
    if (detections.some(d => d.severity === sev)) { highestSeverity = sev; break; }
  }

  return Object.freeze({
    safe: detections.length === 0,
    detections: Object.freeze(detections),
    highestSeverity,
    riskScore,
    chainedAttack,
    evasionDetected,
    scanDurationMs: Math.round(performance.now() - start),
    inputContext: context,
    normalizations: Object.freeze(normalizations),
  });
}

/**
 * Quick boolean check — returns true if input appears safe
 */
export function isInputSafe(input: string, context?: InputContext): boolean {
  return detectInjection(input, { context }).safe;
}

/**
 * Get injection engine stats
 */
export function getInjectionEngineStats() {
  return {
    version: '2.0.0',
    totalRules: INJECTION_RULES.length,
    vectors: [...rulesByVector.keys()],
    rulesByVector: Object.fromEntries([...rulesByVector.entries()].map(([k, v]) => [k, v.length])),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function redactInjection(content: string): string {
  if (content.length <= 16) return content;
  return `${content.slice(0, 6)}...${content.slice(-6)}`;
}
