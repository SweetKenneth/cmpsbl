/**
 * #8 — Data Flow Analyzer
 * Track how user input travels from frontend → API → database → response
 * to identify injection points, missing sanitization, and data leakage.
 */

export interface DataFlowAnalysis {
  flows: DataFlow[];
  injectionPoints: InjectionPoint[];
  sanitizationGaps: SanitizationGap[];
  dataLeaks: DataLeak[];
  riskScore: number;
  totalFlows: number;
  unsafeFlows: number;
  scanTimestamp: string;
}

export interface DataFlow {
  id: string;
  entryPoint: string;
  entryType: 'form_input' | 'url_param' | 'query_param' | 'header' | 'body' | 'file_upload' | 'websocket';
  path: DataFlowStep[];
  exitPoint: string;
  exitType: 'html_render' | 'json_response' | 'database_write' | 'file_write' | 'redirect' | 'email' | 'log';
  isSanitized: boolean;
  isValidated: boolean;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

export interface DataFlowStep {
  location: string;
  operation: 'read' | 'transform' | 'validate' | 'sanitize' | 'store' | 'send';
  file: string;
  line: number | null;
  transformations: string[];
}

export interface InjectionPoint {
  type: 'sql' | 'xss' | 'nosql' | 'command' | 'path_traversal' | 'template' | 'ldap' | 'header';
  file: string;
  line: number | null;
  code: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  remediation: string;
}

export interface SanitizationGap {
  inputSource: string;
  outputDestination: string;
  missingSanitization: string;
  file: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DataLeak {
  type: 'pii_in_logs' | 'sensitive_in_response' | 'debug_data' | 'stack_trace' | 'internal_ids' | 'verbose_errors';
  file: string;
  line: number | null;
  description: string;
  severity: 'high' | 'medium' | 'low';
  data: string;
}

// SQL injection patterns
const SQL_INJECTION_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /`[^`]*\$\{[^}]*\}[^`]*`.*(?:query|exec|execute|raw)/i, description: 'Template literal in SQL query — use parameterized queries' },
  { pattern: /['"`]\s*\+\s*(?:req|request|params|query|body)\./i, description: 'String concatenation with user input in query' },
  { pattern: /(?:query|exec|execute)\s*\(\s*['"`][^'"]*\+/i, description: 'Dynamic SQL construction from user input' },
  { pattern: /\.raw\s*\(\s*`[^`]*\$\{/i, description: 'Raw query with template literal interpolation' },
  { pattern: /supabase.*\.rpc\s*\(\s*[^,]+,\s*\{.*\breq\b/i, description: 'Unvalidated input passed to RPC function' },
];

// XSS patterns
const XSS_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /dangerouslySetInnerHTML/i, description: 'dangerouslySetInnerHTML may render unsanitized HTML' },
  { pattern: /innerHTML\s*=\s*(?!['"`]\s*['"`])/i, description: 'Direct innerHTML assignment with potential user content' },
  { pattern: /document\.write\s*\(/i, description: 'document.write can inject unescaped content' },
  { pattern: /\.html\s*\(\s*(?:req|request|params|query|body)\./i, description: 'User input rendered as HTML without escaping' },
  { pattern: /eval\s*\(/i, description: 'eval() can execute arbitrary code from user input' },
  { pattern: /new Function\s*\(/i, description: 'new Function() can execute arbitrary code' },
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /child_process.*exec\s*\([^)]*(?:req|params|query|body|input)/i, description: 'User input in shell command execution' },
  { pattern: /spawn\s*\([^)]*(?:req|params|query|body|input)/i, description: 'User input in process spawn' },
  { pattern: /system\s*\([^)]*(?:req|params|query|body|input)/i, description: 'User input in system call' },
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /(?:readFile|writeFile|createReadStream|access)\s*\([^)]*(?:req|params|query|body)/i, description: 'User input in file path without validation' },
  { pattern: /path\.join\s*\([^)]*(?:req|params|query|body)/i, description: 'User input in path construction — check for ../ traversal' },
  { pattern: /\.\.\/|\.\.\\/, description: 'Potential path traversal pattern in code' },
];

// Data leakage patterns
const DATA_LEAK_PATTERNS: Array<{ pattern: RegExp; type: DataLeak['type']; description: string }> = [
  { pattern: /console\.(log|info|debug|warn)\s*\([^)]*(?:password|token|secret|key|ssn|credit)/i, type: 'pii_in_logs', description: 'Sensitive data logged to console' },
  { pattern: /console\.(log|info)\s*\([^)]*(?:req\.body|req\.headers)/i, type: 'pii_in_logs', description: 'Request body/headers logged — may contain auth tokens' },
  { pattern: /(?:res|response)\.(?:json|send)\s*\([^)]*(?:password|hash|secret|internal)/i, type: 'sensitive_in_response', description: 'Sensitive field in API response' },
  { pattern: /stack.*trace|stackTrace|err\.stack/i, type: 'stack_trace', description: 'Stack trace may be exposed to client' },
  { pattern: /NODE_ENV.*!==.*production.*(?:console|debug|verbose)/i, type: 'debug_data', description: 'Debug data conditionally exposed' },
  { pattern: /(?:res|response)\.(?:json|send)\s*\(\s*(?:err|error)\s*\)/i, type: 'verbose_errors', description: 'Full error object sent to client — may contain internal details' },
];

/**
 * Analyze data flows through the application
 */
export function analyzeDataFlows(
  files: Array<{ path: string; content: string }>
): DataFlowAnalysis {
  const injectionPoints: InjectionPoint[] = [];
  const sanitizationGaps: SanitizationGap[] = [];
  const dataLeaks: DataLeak[] = [];

  for (const file of files) {
    const lines = file.content.split('\n');

    // Check SQL injection
    for (const { pattern, description } of SQL_INJECTION_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          injectionPoints.push({
            type: 'sql',
            file: file.path,
            line: i + 1,
            code: lines[i].trim().slice(0, 100),
            severity: 'critical',
            description,
            remediation: 'Use parameterized queries or an ORM with bound parameters.',
          });
        }
      }
    }

    // Check XSS
    for (const { pattern, description } of XSS_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          injectionPoints.push({
            type: 'xss',
            file: file.path,
            line: i + 1,
            code: lines[i].trim().slice(0, 100),
            severity: 'high',
            description,
            remediation: 'Use framework auto-escaping. Sanitize with DOMPurify before rendering HTML.',
          });
        }
      }
    }

    // Check command injection
    for (const { pattern, description } of COMMAND_INJECTION_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          injectionPoints.push({
            type: 'command',
            file: file.path,
            line: i + 1,
            code: lines[i].trim().slice(0, 100),
            severity: 'critical',
            description,
            remediation: 'Use execFile() with argument arrays instead of exec() with string concatenation.',
          });
        }
      }
    }

    // Check path traversal
    for (const { pattern, description } of PATH_TRAVERSAL_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          injectionPoints.push({
            type: 'path_traversal',
            file: file.path,
            line: i + 1,
            code: lines[i].trim().slice(0, 100),
            severity: 'high',
            description,
            remediation: 'Validate and normalize file paths. Reject inputs containing "../".',
          });
        }
      }
    }

    // Check data leaks
    for (const { pattern, type, description } of DATA_LEAK_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          dataLeaks.push({
            type,
            file: file.path,
            line: i + 1,
            description,
            severity: type === 'pii_in_logs' || type === 'sensitive_in_response' ? 'high' : 'medium',
            data: lines[i].trim().slice(0, 80),
          });
        }
      }
    }

    // Check sanitization gaps
    const hasUserInput = /req\.(body|query|params)|request\.(body|query)|formData/i.test(file.content);
    const hasDbWrite = /\.insert|\.update|\.create|\.save|\.query|\.exec/i.test(file.content);
    const hasSanitization = /sanitize|escape|purify|validator\.|zod|yup|joi/i.test(file.content);
    
    if (hasUserInput && hasDbWrite && !hasSanitization) {
      sanitizationGaps.push({
        inputSource: 'user request',
        outputDestination: 'database',
        missingSanitization: 'No input validation/sanitization between user input and database write',
        file: file.path,
        severity: 'high',
      });
    }

    if (hasUserInput && /dangerouslySetInnerHTML|innerHTML|\.html\(/.test(file.content) && !hasSanitization) {
      sanitizationGaps.push({
        inputSource: 'user request',
        outputDestination: 'HTML render',
        missingSanitization: 'No sanitization between user input and HTML rendering',
        file: file.path,
        severity: 'high',
      });
    }
  }

  const totalFlows = injectionPoints.length + sanitizationGaps.length + dataLeaks.length;
  const criticalCount = injectionPoints.filter(i => i.severity === 'critical').length;
  const highCount = injectionPoints.filter(i => i.severity === 'high').length + 
                    sanitizationGaps.filter(s => s.severity === 'high').length +
                    dataLeaks.filter(d => d.severity === 'high').length;

  const riskScore = Math.min(100, criticalCount * 25 + highCount * 10 + totalFlows * 2);

  return {
    flows: [],
    injectionPoints,
    sanitizationGaps,
    dataLeaks,
    riskScore,
    totalFlows,
    unsafeFlows: criticalCount + highCount,
    scanTimestamp: new Date().toISOString(),
  };
}
