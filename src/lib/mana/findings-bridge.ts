/**
 * Findings Bridge — Ascension ↔ Mana Convergence
 *
 * Bridges Ascension's scan diagnostics into Mana's surgical attachment
 * configuration. Ascension scans and diagnoses; Mana deploys and defends.
 *
 * The bridge performs two functions:
 *   1. detectFunctionBoundaries() — extracts function names from source code
 *   2. buildAttachmentPlan() — maps primitives to specific function targets
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaCapability, AscensionFinding, ManaAttachmentEntry } from './types';

// ═══════════════════════════════════════════════════════════════
// §1 — Function Boundary Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Regex patterns for function declarations across common languages.
 * Extracts the function name from each match group 1.
 */
const FUNCTION_PATTERNS: RegExp[] = [
  // JS/TS: function name(...), const name = (...) =>, export function name
  /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$]\w*)\s*\(/g,
  /(?:const|let|var)\s+([a-zA-Z_$]\w*)\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/g,
  // Python: def name(
  /def\s+([a-zA-Z_]\w*)\s*\(/g,
  // Rust: fn name(, pub fn name(
  /(?:pub\s+)?(?:async\s+)?fn\s+([a-zA-Z_]\w*)\s*[(<]/g,
  // Go: func name(, func (r Type) name(
  /func\s+(?:\([^)]*\)\s+)?([a-zA-Z_]\w*)\s*\(/g,
  // Java/C#/Kotlin: access type name(
  /(?:public|private|protected|internal|static|override|suspend)\s+(?:\w+\s+)+([a-zA-Z_]\w*)\s*\(/g,
  // Ruby: def name
  /def\s+([a-zA-Z_]\w*[?!]?)/g,
  // C/C++: type name(
  /(?:void|int|char|bool|auto|string|float|double|size_t)\s+([a-zA-Z_]\w*)\s*\(/g,
  // PHP: function name(
  /function\s+([a-zA-Z_]\w*)\s*\(/g,
  // Swift: func name(
  /func\s+([a-zA-Z_]\w*)\s*[(<]/g,
  // Class methods: name(args) {  or  name: function
  /^\s+([a-zA-Z_$]\w*)\s*\([^)]*\)\s*\{/gm,
];

/** Names to exclude — language built-ins and test boilerplate */
const EXCLUDED_NAMES = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'yield',
  'constructor', 'toString', 'valueOf', 'hasOwnProperty',
  'describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach',
  'main', '__init__', '__str__', '__repr__', '__eq__',
]);

export interface FunctionBoundary {
  readonly name: string;
  readonly line: number;
}

/**
 * Detect function boundaries in source code.
 * Returns deduplicated function names in declaration order.
 */
export function detectFunctionBoundaries(source: string): FunctionBoundary[] {
  const seen = new Set<string>();
  const boundaries: FunctionBoundary[] = [];
  const lines = source.split('\n');

  for (const pattern of FUNCTION_PATTERNS) {
    // Reset lastIndex for global regex reuse
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(source)) !== null) {
      const name = match[1];
      if (!name || EXCLUDED_NAMES.has(name) || seen.has(name)) continue;
      if (name.length < 2 || name.startsWith('_')) continue;

      seen.add(name);
      // Calculate line number
      const beforeMatch = source.slice(0, match.index);
      const line = beforeMatch.split('\n').length;
      boundaries.push({ name, line });
    }
  }

  // Sort by line number for consistent output
  boundaries.sort((a, b) => a.line - b.line);
  return boundaries;
}

// ═══════════════════════════════════════════════════════════════
// §2 — Signal-to-Capability Mapping
// ═══════════════════════════════════════════════════════════════

/** Function name patterns that indicate specific capability needs */
const CAPABILITY_SIGNALS: Array<{
  patterns: RegExp[];
  capability: ManaCapability;
  primitive: string;
  reason: string;
}> = [
  // DEFENSE — input handling, parsing, request processing
  {
    patterns: [
      /^(parse|validate|sanitize|decode|deserialize|handle.*input|process.*request|accept|receive|read.*body)/i,
      /^(handle|process|on).*(request|input|data|payload|message|event|upload|form|payment|transaction|order)/i,
      /^(process|execute|run).*(payment|charge|transfer|withdraw|deposit)/i,
    ],
    capability: 'defense_gate',
    primitive: 'DEFENSE',
    reason: 'Handles untrusted input — boundary enforcement required',
  },
  // GOVERNANCE — state mutations
  {
    patterns: [
      /^(save|update|delete|remove|create|insert|write|set|put|patch|modify|mutate|assign|overwrite)/i,
      /^(handle|process|on).*(save|update|delete|create|submit|commit|push)/i,
    ],
    capability: 'governance_hook',
    primitive: 'GOVERNANCE',
    reason: 'Mutates state — governance audit required',
  },
  // CIRCUIT BREAKER — external calls, network, I/O
  {
    patterns: [
      /^(fetch|call|request|query|get.*api|post|send|connect|subscribe|poll|ping|invoke)/i,
      /^(load|download|upload|stream|pipe|forward|proxy|relay)/i,
    ],
    capability: 'circuit_breaker',
    primitive: 'FAILSAFE',
    reason: 'External call — circuit breaker for fault isolation',
  },
  // AUDIT — logging, tracking, recording
  {
    patterns: [
      /^(log|track|record|emit|report|audit|trace|capture|observe|measure|monitor)/i,
    ],
    capability: 'audit_trail',
    primitive: 'AUDIT',
    reason: 'Observation point — audit trail for provenance',
  },
  // SHADOW RULE — auth, access control, permissions
  {
    patterns: [
      /^(auth|login|logout|verify|check.*perm|grant|revoke|elevate|impersonate)/i,
      /^(is.*admin|has.*role|can.*access|is.*authorized|is.*authenticated)/i,
    ],
    capability: 'shadow_rule',
    primitive: 'DEFENSE',
    reason: 'Auth boundary — shadow rule for access control',
  },
];

// ═══════════════════════════════════════════════════════════════
// §3 — Attachment Plan Builder
// ═══════════════════════════════════════════════════════════════

/**
 * Map detected function boundaries against primitive signals to produce
 * targeted Mana attachment findings.
 *
 * @param boundaries  Function boundaries from detectFunctionBoundaries()
 * @param activePrimitives  Primitive names selected by Ascension scanner
 * @returns Targeted findings — each maps a function to a specific capability
 */
export function buildAttachmentPlan(
  boundaries: FunctionBoundary[],
  activePrimitives: ReadonlySet<string>,
): AscensionFinding[] {
  const findings: AscensionFinding[] = [];
  const assigned = new Set<string>(); // Track function→capability pairs to avoid dupes

  for (const boundary of boundaries) {
    for (const signal of CAPABILITY_SIGNALS) {
      // Only apply if the relevant primitive was selected by the scanner
      if (!activePrimitives.has(signal.primitive)) continue;

      const matched = signal.patterns.some(p => {
        p.lastIndex = 0;
        return p.test(boundary.name);
      });

      if (!matched) continue;

      const key = `${boundary.name}:${signal.capability}`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      findings.push({
        functionName: boundary.name,
        capability: signal.capability,
        primitive: signal.primitive,
        reason: signal.reason,
        confidence: 0.85, // Signal-matched — high confidence
      });
    }
  }

  // BEACON telemetry on all exported/public functions not already wrapped
  if (activePrimitives.has('BEACON') || activePrimitives.has('MEDIC') || activePrimitives.has('VISION')) {
    for (const boundary of boundaries) {
      const key = `${boundary.name}:beacon_telemetry`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      findings.push({
        functionName: boundary.name,
        capability: 'beacon_telemetry',
        primitive: 'BEACON',
        reason: 'Public function — telemetry observation',
        confidence: 0.60,
      });
    }
  }

  // Sort by confidence descending, then alphabetically
  findings.sort((a, b) => b.confidence - a.confidence || a.functionName.localeCompare(b.functionName));

  return findings;
}

/**
 * Convert AscensionFindings into serializable ManaAttachmentEntries
 * suitable for embedding in export artifacts.
 */
export function serializeAttachmentPlan(findings: AscensionFinding[]): ManaAttachmentEntry[] {
  return findings.map(f => ({
    functionName: f.functionName,
    capability: f.capability,
    primitive: f.primitive,
    reason: f.reason,
  }));
}
