/**
 * CMPSBL® Scan Pipeline — Phase 4 Unified Entry Point
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single entry point: source code → behavior-ready artifact config.
 *
 * Pipeline:
 *   1. Detect function boundaries (findings-bridge)
 *   2. Build attachment plan (findings-bridge)
 *   3. Map to policies (scan-to-policy)
 *   4. Generate recommendations (recommended-behaviors)
 *   5. Produce artifact-ready attachments
 *
 * Exit criteria: Scan → Attachment is a natural pipeline.
 *               Minimal human interpretation required.
 *               Scanning becomes the entry point to Ascension.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ScanFinding, PolicyAttachmentEntry, ScanToPolicyResult } from './scan-to-policy';
import { scanToAttachments, mapFindingsToPolicy } from './scan-to-policy';
import type { BehaviorReport, BehaviorRecommendation } from './recommended-behaviors';
import { generateBehaviorReport, renderBehaviorReportText } from './recommended-behaviors';
import { resolveEngine, type BehaviorEngine } from './engines/primitive-engine-map';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PIPELINE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Complete pipeline output — everything needed to activate an artifact */
export interface ScanPipelineResult {
  /** Artifact-embeddable attachment entries with policies */
  readonly attachments: readonly PolicyAttachmentEntry[];
  /** Policy mapping diagnostics */
  readonly policyResult: ScanToPolicyResult;
  /** Developer-facing behavior report */
  readonly behaviorReport: BehaviorReport;
  /** Pre-rendered text report for artifact embedding */
  readonly behaviorReportText: string;
  /** Pipeline execution metadata */
  readonly meta: PipelineMeta;
}

export interface PipelineMeta {
  readonly findingsCount: number;
  readonly attachmentsGenerated: number;
  readonly unmappedCount: number;
  readonly enforcingCount: number;
  readonly observingCount: number;
  readonly executionMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — FUNCTION BOUNDARY DETECTION (inline — no cross-package import)
// ═══════════════════════════════════════════════════════════════════════════════

/** Lightweight function boundary patterns (same logic as findings-bridge) */
const FN_PATTERNS: RegExp[] = [
  /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$]\w*)\s*\(/g,
  /(?:const|let|var)\s+([a-zA-Z_$]\w*)\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/g,
  /def\s+([a-zA-Z_]\w*)\s*\(/g,
  /(?:pub\s+)?(?:async\s+)?fn\s+([a-zA-Z_]\w*)\s*[(<]/g,
  /func\s+(?:\([^)]*\)\s+)?([a-zA-Z_]\w*)\s*\(/g,
  /(?:void|int|char|bool|auto|string|float|double|size_t)\s+([a-zA-Z_]\w*)\s*\(/g,
];

const EXCLUDED = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'yield',
  'constructor', 'toString', 'valueOf', 'describe', 'it', 'test', 'expect',
  'main', '__init__',
]);

interface DetectedBoundary {
  readonly name: string;
  readonly line: number;
}

function detectBoundaries(source: string): DetectedBoundary[] {
  const seen = new Set<string>();
  const results: DetectedBoundary[] = [];

  for (const pattern of FN_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      const name = match[1];
      if (!name || EXCLUDED.has(name) || seen.has(name) || name.length < 2 || name.startsWith('_')) continue;
      seen.add(name);
      const line = source.slice(0, match.index).split('\n').length;
      results.push({ name, line });
    }
  }

  return results.sort((a, b) => a.line - b.line);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2.1 — BODY SIGNAL EXTRACTION (AST-lite, regex-based)
// ═══════════════════════════════════════════════════════════════════════════════

interface BodySignal {
  readonly capability: string;
  readonly primitive: string;
  readonly confidence: number;
}

const BODY_PATTERNS: ReadonlyArray<{
  readonly pattern: RegExp;
  readonly signal: BodySignal;
}> = [
  {
    pattern: /(req\.body|req\.query|JSON\.parse|deserialize)/i,
    signal: { capability: 'defense_gate', primitive: 'DEFENSE', confidence: 0.9 },
  },
  {
    pattern: /(\.save\(|\.update\(|\.delete\(|\.insert\(|setState\()/i,
    signal: { capability: 'governance_hook', primitive: 'GOVERNANCE', confidence: 0.85 },
  },
  {
    pattern: /(fetch\(|axios\.|http\.|await\s+\w+\()/i,
    signal: { capability: 'circuit_breaker', primitive: 'FAILSAFE', confidence: 0.85 },
  },
  {
    pattern: /(auth|token|jwt|isAuthorized|hasPermission)/i,
    signal: { capability: 'shadow_rule', primitive: 'DEFENSE', confidence: 0.9 },
  },
  {
    pattern: /(console\.log|logger\.|emit|track|metric)/i,
    signal: { capability: 'audit_trail', primitive: 'AUDIT', confidence: 0.7 },
  },
];

/** Extract capability signals from function body content (500-char window) */
function extractBodySignals(
  source: string,
  boundaries: readonly DetectedBoundary[],
): Map<string, BodySignal[]> {
  const result = new Map<string, BodySignal[]>();

  for (const boundary of boundaries) {
    const fnIndex = source.indexOf(boundary.name);
    if (fnIndex === -1) continue;

    const snippet = source.slice(fnIndex, fnIndex + 500);

    for (const { pattern, signal } of BODY_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(snippet)) {
        const existing = result.get(boundary.name) ?? [];
        existing.push(signal);
        result.set(boundary.name, existing);
      }
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2.2 — CALL GRAPH LITE
// ═══════════════════════════════════════════════════════════════════════════════

/** Lightweight intra-file call graph — detects which functions call which */
function detectCallGraph(
  source: string,
  boundaries: readonly DetectedBoundary[],
): Map<string, string[]> {
  const calls = new Map<string, string[]>();

  for (const boundary of boundaries) {
    const fnIndex = source.indexOf(boundary.name);
    if (fnIndex === -1) continue;

    const snippet = source.slice(fnIndex, fnIndex + 500);
    const called: string[] = [];

    for (const other of boundaries) {
      if (other.name === boundary.name) continue;
      const regex = new RegExp(`\\b${other.name}\\(`);
      if (regex.test(snippet)) {
        called.push(other.name);
      }
    }

    if (called.length > 0) {
      calls.set(boundary.name, called);
    }
  }

  return calls;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SIGNAL MATCHING (name + body + call graph)
// ═══════════════════════════════════════════════════════════════════════════════

interface SignalRule {
  readonly patterns: RegExp[];
  readonly capability: string;
  readonly primitive: string;
  readonly reason: string;
  readonly confidence: number;
}

const SIGNAL_RULES: readonly SignalRule[] = [
  {
    patterns: [
      /^(parse|validate|sanitize|decode|deserialize|handle.*input|process.*request)/i,
      /^(handle|process|on).*(request|input|data|payload|message|event|upload|payment|transaction)/i,
    ],
    capability: 'defense_gate',
    primitive: 'DEFENSE',
    reason: 'Handles untrusted input — boundary enforcement required',
    confidence: 0.85,
  },
  {
    patterns: [
      /^(save|update|delete|remove|create|insert|write|set|put|patch|modify|mutate)/i,
      /^(handle|process|on).*(save|update|delete|create|submit|commit)/i,
    ],
    capability: 'governance_hook',
    primitive: 'GOVERNANCE',
    reason: 'Mutates state — governance audit required',
    confidence: 0.85,
  },
  {
    patterns: [
      /^(fetch|call|request|query|get.*api|post|send|connect|subscribe|poll|invoke)/i,
      /^(load|download|upload|stream|pipe|forward|proxy|relay)/i,
    ],
    capability: 'circuit_breaker',
    primitive: 'FAILSAFE',
    reason: 'External call — circuit breaker for fault isolation',
    confidence: 0.85,
  },
  {
    patterns: [/^(log|track|record|emit|report|audit|trace|capture|observe|measure|monitor)/i],
    capability: 'audit_trail',
    primitive: 'AUDIT',
    reason: 'Observation point — audit trail for provenance',
    confidence: 0.75,
  },
  {
    patterns: [
      /^(auth|login|logout|verify|check.*perm|grant|revoke|elevate)/i,
      /^(is.*admin|has.*role|can.*access|is.*authorized)/i,
    ],
    capability: 'shadow_rule',
    primitive: 'DEFENSE',
    reason: 'Auth boundary — shadow rule for access control',
    confidence: 0.90,
  },
];

function matchSignals(
  sourceCode: string,
  boundaries: readonly DetectedBoundary[],
  activePrimitives?: ReadonlySet<string>,
): ScanFinding[] {
  const findings: ScanFinding[] = [];
  const assigned = new Set<string>();

  // Phase 4.1: body-aware signal extraction
  const bodySignals = extractBodySignals(sourceCode, boundaries);

  for (const boundary of boundaries) {
    // Name-based matching
    for (const rule of SIGNAL_RULES) {
      if (activePrimitives && !activePrimitives.has(rule.primitive)) continue;

      const matched = rule.patterns.some(p => {
        p.lastIndex = 0;
        return p.test(boundary.name);
      });
      if (!matched) continue;

      const key = `${boundary.name}:${rule.capability}`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      findings.push({
        functionName: boundary.name,
        primitive: rule.primitive,
        capability: rule.capability,
        reason: rule.reason,
        confidence: rule.confidence,
        line: boundary.line,
      });
    }

    // Body-signal matching (supplements name-based)
    const extraSignals = bodySignals.get(boundary.name) ?? [];
    for (const sig of extraSignals) {
      const key = `${boundary.name}:${sig.capability}`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      findings.push({
        functionName: boundary.name,
        primitive: sig.primitive,
        capability: sig.capability,
        reason: 'Detected from function body pattern',
        confidence: sig.confidence,
        line: boundary.line,
      });
    }

    // BEACON telemetry fallback for unmatched public functions
    const beaconKey = `${boundary.name}:beacon_telemetry`;
    if (!assigned.has(beaconKey)) {
      if (!activePrimitives || activePrimitives.has('BEACON')) {
        assigned.add(beaconKey);
        findings.push({
          functionName: boundary.name,
          primitive: 'BEACON',
          capability: 'beacon_telemetry',
          reason: 'Public function — telemetry observation',
          confidence: 0.60,
          line: boundary.line,
        });
      }
    }
  }

  // Phase 4.1: call graph propagation
  const callGraph = detectCallGraph(sourceCode, boundaries);
  const propagated: ScanFinding[] = [];

  for (const finding of findings) {
    const downstream = callGraph.get(finding.functionName);
    if (!downstream) continue;

    for (const fn of downstream) {
      const key = `${fn}:${finding.capability}`;
      if (assigned.has(key)) continue;
      assigned.add(key);

      propagated.push({
        ...finding,
        functionName: fn,
        reason: `Inherited from ${finding.functionName}`,
        confidence: finding.confidence * 0.75,
      });
    }
  }

  findings.push(...propagated);

  return findings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — PIPELINE ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

export interface ScanPipelineOptions {
  /** Restrict to specific primitives (omit = all primitives active) */
  readonly activePrimitives?: ReadonlySet<string>;
  /** Minimum confidence threshold — findings below this are dropped */
  readonly minConfidence?: number;
}

/**
 * Full Phase 4 pipeline: source code → behavior-ready artifact config.
 *
 * This is the unified entry point that makes scanning the natural
 * gateway into Ascension's runtime ecosystem.
 */
export function runScanPipeline(
  sourceCode: string,
  options: ScanPipelineOptions = {},
): ScanPipelineResult {
  const start = performance.now();
  const minConf = options.minConfidence ?? 0;

  // Step 1: Detect function boundaries
  const boundaries = detectBoundaries(sourceCode);

  // Step 2: Match signals → findings
  let findings = matchSignals(boundaries, options.activePrimitives);

  // Step 3: Apply confidence threshold
  if (minConf > 0) {
    findings = findings.filter(f => f.confidence >= minConf);
  }

  // Step 4: Map findings → policies + attachments
  const { attachments, result: policyResult } = scanToAttachments(findings);

  // Step 5: Generate behavior report
  const behaviorReport = generateBehaviorReport(findings);
  const behaviorReportText = renderBehaviorReportText(behaviorReport);

  const executionMs = Math.round(performance.now() - start);

  return {
    attachments,
    policyResult,
    behaviorReport,
    behaviorReportText,
    meta: {
      findingsCount: findings.length,
      attachmentsGenerated: attachments.length,
      unmappedCount: policyResult.unmapped.length,
      enforcingCount: policyResult.enforcingCount,
      observingCount: policyResult.observingCount,
      executionMs,
    },
  };
}

/**
 * Pipeline from pre-computed findings (for callers that already ran boundary detection).
 */
export function runScanPipelineFromFindings(findings: readonly ScanFinding[]): ScanPipelineResult {
  const start = performance.now();

  const { attachments, result: policyResult } = scanToAttachments(findings);
  const behaviorReport = generateBehaviorReport(findings);
  const behaviorReportText = renderBehaviorReportText(behaviorReport);

  return {
    attachments,
    policyResult,
    behaviorReport,
    behaviorReportText,
    meta: {
      findingsCount: findings.length,
      attachmentsGenerated: attachments.length,
      unmappedCount: policyResult.unmapped.length,
      enforcingCount: policyResult.enforcingCount,
      observingCount: policyResult.observingCount,
      executionMs: Math.round(performance.now() - start),
    },
  };
}
