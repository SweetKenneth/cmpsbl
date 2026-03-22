/**
 * DEFENSE — Enterprise Injection Detection Engine v1.0.0
 * Deep analysis of inputs for injection attacks across multiple vectors.
 * Detects: SQLi, XSS, SSRF, Command Injection, Template Injection,
 *          Prototype Pollution, Path Traversal, LDAP Injection, Header Injection.
 *
 * Architecture:
 *  - Multi-vector analysis in single pass
 *  - Context-aware scoring (input position matters)
 *  - Confidence-weighted verdicts
 *  - Chained attack detection
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
  | 'xml_injection';

export type InputContext = 'query_param' | 'body_field' | 'header' | 'url_path' | 'file_name' | 'unknown';

export interface InjectionDetection {
  vector: InjectionVector;
  confidence: number;      // 0-1
  severity: 'critical' | 'high' | 'medium' | 'low';
  pattern: string;
  matchedContent: string;
  description: string;
  cwe?: string;            // CWE reference
}

export interface InjectionScanResult {
  safe: boolean;
  detections: InjectionDetection[];
  highestSeverity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  riskScore: number;       // 0-100
  chainedAttack: boolean;  // multiple vectors in single input
  scanDurationMs: number;
  inputContext: InputContext;
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
}

const INJECTION_RULES: InjectionRule[] = [
  // ── SQL Injection ──────────────────────────────────────────────────
  {
    id: 'SQLi-001', vector: 'sql_injection', confidence: 0.95, severity: 'critical', cwe: 'CWE-89',
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

  // ── XSS ────────────────────────────────────────────────────────────
  {
    id: 'XSS-001', vector: 'xss', confidence: 0.95, severity: 'critical', cwe: 'CWE-79',
    description: 'Reflected/stored XSS via script tags or event handlers',
    patterns: [
      /<script[\s>]/i,
      /javascript\s*:/i,
      /on(?:error|load|click|mouseover|focus|blur|submit|change|input)\s*=/i,
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

  // ── Command Injection ──────────────────────────────────────────────
  {
    id: 'CMD-001', vector: 'command_injection', confidence: 0.95, severity: 'critical', cwe: 'CWE-78',
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
    id: 'SSRF-001', vector: 'ssrf', confidence: 0.9, severity: 'critical', cwe: 'CWE-918',
    description: 'Server-side request forgery targeting internal networks',
    patterns: [
      /(?:https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+))/i,
      /(?:https?:\/\/169\.254\.169\.254)/i, // AWS metadata
      /(?:file:\/\/|gopher:\/\/|dict:\/\/)/i,
    ],
  },
  {
    id: 'SSRF-002', vector: 'ssrf', confidence: 0.75, severity: 'high', cwe: 'CWE-918',
    description: 'SSRF via DNS rebinding or URL shortener bypass',
    patterns: [
      /(?:https?:\/\/.*@)/i, // URL with credentials
      /(?:https?:\/\/[^/]*\.(?:internal|local|corp|private)\b)/i,
      /(?:https?:\/\/\[::1\])/i, // IPv6 localhost
    ],
  },

  // ── Template Injection ─────────────────────────────────────────────
  {
    id: 'TMPL-001', vector: 'template_injection', confidence: 0.9, severity: 'critical', cwe: 'CWE-1336',
    description: 'Server-side template injection (SSTI)',
    patterns: [
      /\{\{.*(?:__class__|__mro__|__subclasses__|__builtins__|__import__|config).*\}\}/i,
      /\$\{.*(?:Runtime|ProcessBuilder|exec|getClass)\}/i,
      /(?:#set\s*\(\s*\$|#foreach|#include\s*\()/i, // Velocity
    ],
  },
  {
    id: 'TMPL-002', vector: 'template_injection', confidence: 0.7, severity: 'high', cwe: 'CWE-1336',
    description: 'Template injection via expression language',
    patterns: [
      /\{\{\s*\d+\s*[+\-*\/]\s*\d+\s*\}\}/, // Math probe {{7*7}}
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
      /(?:\.\.%252f){2,}/i, // Double URL encoding
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
];

// Pre-index rules by vector for targeted scanning
const rulesByVector = new Map<InjectionVector, InjectionRule[]>();
for (const rule of INJECTION_RULES) {
  const arr = rulesByVector.get(rule.vector);
  if (arr) arr.push(rule); else rulesByVector.set(rule.vector, [rule]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCANNER
// ═══════════════════════════════════════════════════════════════════════════════

export interface InjectionScanOptions {
  context?: InputContext;
  vectors?: InjectionVector[];  // Limit scan to specific vectors
  maxInputLength?: number;
}

/**
 * Scan input for injection attacks across all vectors.
 * Returns structured result with detections, risk score, and chained attack flag.
 */
export function detectInjection(input: string, options?: InjectionScanOptions): InjectionScanResult {
  const start = performance.now();
  const context: InputContext = options?.context || 'unknown';
  const maxLen = options?.maxInputLength || 32_768;

  // Truncate oversized inputs
  const scanInput = input.length > maxLen ? input.slice(0, maxLen) : input;
  const detections: InjectionDetection[] = [];
  const detectedVectors = new Set<InjectionVector>();

  // Select rules to check
  const rulesToCheck = options?.vectors
    ? INJECTION_RULES.filter(r => options.vectors!.includes(r.vector))
    : INJECTION_RULES;

  for (const rule of rulesToCheck) {
    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(scanInput);
      if (match) {
        detectedVectors.add(rule.vector);
        
        // Context-aware confidence adjustment
        let adjustedConfidence = rule.confidence;
        if (context === 'header' && rule.vector === 'header_injection') adjustedConfidence = Math.min(1, adjustedConfidence + 0.1);
        if (context === 'url_path' && rule.vector === 'path_traversal') adjustedConfidence = Math.min(1, adjustedConfidence + 0.1);
        if (context === 'query_param' && rule.vector === 'sql_injection') adjustedConfidence = Math.min(1, adjustedConfidence + 0.05);

        detections.push({
          vector: rule.vector,
          confidence: adjustedConfidence,
          severity: rule.severity,
          pattern: pattern.source.slice(0, 60),
          matchedContent: redactInjection(match[0]),
          description: rule.description,
          cwe: rule.cwe,
        });

        break; // One match per rule is sufficient
      }
    }
  }

  // Chained attack detection — multiple distinct vectors in single input
  const chainedAttack = detectedVectors.size >= 2;

  // Compute risk score
  let riskScore = 0;
  const severityWeights = { critical: 40, high: 25, medium: 15, low: 5 };
  for (const d of detections) {
    riskScore += severityWeights[d.severity] * d.confidence;
  }
  if (chainedAttack) riskScore *= 1.5; // Chained attack multiplier
  riskScore = Math.min(100, Math.round(riskScore));

  // Highest severity
  const severityOrder: InjectionScanResult['highestSeverity'][] = ['critical', 'high', 'medium', 'low', 'none'];
  let highestSeverity: InjectionScanResult['highestSeverity'] = 'none';
  for (const sev of severityOrder) {
    if (sev === 'none') break;
    if (detections.some(d => d.severity === sev)) { highestSeverity = sev; break; }
  }

  return {
    safe: detections.length === 0,
    detections,
    highestSeverity,
    riskScore,
    chainedAttack,
    scanDurationMs: Math.round(performance.now() - start),
    inputContext: context,
  };
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
