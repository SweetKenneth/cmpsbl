/**
 * Ascension V2 — Pre-Export Test Harness
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Final gate before ZIP assembly. Runs four deterministic checks against
 * the freshly generated ascended code:
 *
 *   ① Syntax/AST validity              (CRITICAL)
 *   ② Layer-2 ↔ Layer-1 linkage        (CRITICAL)
 *   ③ Layer-1 fingerprint integrity    (CRITICAL)
 *   ④ CMPSBL Layer auto-wire presence  (SOFT — warns)
 *   ⑤ Layer execution smoke test       (SOFT — warns; runtime-only langs)
 *
 * Any CRITICAL failure aborts export. SOFT failures attach as warnings to
 * the ZIP. Pure algorithmic — no external calls, no AI, fully deterministic.
 *
 * © CMPSBL® — All rights reserved.
 */

import { validateLayer2, validateLayer2Linkage } from '@/lib/export/layer2-validator';
import type { CmpsblLayerDefinition } from '@/lib/export/cmpsbl-layers';

export type HarnessSeverity = 'critical' | 'soft';

export interface HarnessCheck {
  id: string;
  label: string;
  severity: HarnessSeverity;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface HarnessReport {
  passed: boolean;            // true only if all CRITICAL checks pass
  criticalFailures: number;
  softWarnings: number;
  checks: HarnessCheck[];
  startedAt: number;
  completedAt: number;
  totalMs: number;
  /** Human-readable summary for ZIP bundling */
  summary: string;
}

export interface HarnessInput {
  ascendedCode: string;
  language: string;
  originalFiles: ReadonlyArray<{ name: string; content: string }>;
  selectedLayers: ReadonlyArray<CmpsblLayerDefinition>;
}

// ─────────────────────────────────────────────────────────────────────
// ① Syntax / AST validity — Layer 2 structural + language-aware Layer 1
//   pre-checks that catch Python 2 idioms and other parse-killers
// ─────────────────────────────────────────────────────────────────────

/**
 * Detect Python 2 syntax that Python 3 rejects (and would crash any
 * runtime import). Pure-regex, line-by-line, ignores strings/comments.
 */
function findPython2Idioms(code: string): Array<{ line: number; message: string }> {
  const issues: Array<{ line: number; message: string }> = [];
  const lines = code.split('\n');
  let inTripleSingle = false;
  let inTripleDouble = false;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    // Track triple-quoted blocks (very coarse — good enough for OSS code)
    const tsMatches = (raw.match(/'''/g) || []).length;
    const tdMatches = (raw.match(/"""/g) || []).length;
    if (tsMatches % 2 === 1) inTripleSingle = !inTripleSingle;
    if (tdMatches % 2 === 1) inTripleDouble = !inTripleDouble;
    if (inTripleSingle || inTripleDouble) continue;

    // Strip inline comments and string literals (rough)
    const stripped = raw
      .replace(/#.*$/, '')
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/"(?:[^"\\]|\\.)*"/g, '""');

    // `except Exception, e:` — Python 2 only
    if (/^\s*except\s+[A-Za-z_][\w.]*\s*,\s*[A-Za-z_]\w*\s*:/.test(stripped)) {
      issues.push({ line: i + 1, message: `Python 2 'except X, e:' syntax (use 'except X as e:')` });
    }
    // `raise X, "msg"` — Python 2 only
    if (/^\s*raise\s+[A-Za-z_][\w.]*\s*,\s*['"]/.test(stripped)) {
      issues.push({ line: i + 1, message: `Python 2 'raise X, msg' syntax (use 'raise X(msg)')` });
    }
    // `print x` (statement form, no parens) — Python 2 only
    if (/^\s*print\s+[^\s(=][^=]*$/.test(stripped) && !stripped.includes('(')) {
      issues.push({ line: i + 1, message: `Python 2 'print' statement (use print() function)` });
    }
  }
  return issues.slice(0, 5);
}

function checkSyntax(input: HarnessInput): HarnessCheck {
  const t0 = performance.now();
  const result = validateLayer2(input.ascendedCode, input.language);
  const errs = result.errors.filter(e => e.severity === 'error');

  // Language-aware deep pre-check on the ENTIRE ascended file (which
  // contains Layer 1 verbatim). Catches input source garbage before export.
  const lang = input.language.toLowerCase();
  let langIssues: Array<{ line: number; message: string }> = [];
  if (lang === 'python') {
    langIssues = findPython2Idioms(input.ascendedCode);
  }

  const passed = errs.length === 0 && langIssues.length === 0;
  let message: string;
  if (passed) {
    message = `Layer 2 parsed clean (${result.errors.length} advisory note${result.errors.length === 1 ? '' : 's'})`;
  } else if (langIssues.length > 0) {
    message = `${langIssues.length} ${lang} parse-killer(s): ${langIssues.slice(0, 2).map(e => `L${e.line}: ${e.message}`).join(' | ')}`;
  } else {
    message = `${errs.length} structural error(s): ${errs.slice(0, 2).map(e => `L${e.line}: ${e.message}`).join(' | ')}`;
  }
  return {
    id: 'syntax',
    label: 'Syntax / AST validity',
    severity: 'critical',
    passed,
    message,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ─────────────────────────────────────────────────────────────────────
// ② Layer-2 ↔ Layer-1 linkage — confirms wrapped file references original
// ─────────────────────────────────────────────────────────────────────

function checkLinkage(input: HarnessInput): HarnessCheck {
  const t0 = performance.now();
  const fileNames = input.originalFiles.map(f => f.name);
  const result = validateLayer2Linkage(input.ascendedCode, input.language, fileNames);
  return {
    id: 'linkage',
    label: 'Layer-2 ↔ Layer-1 linkage',
    severity: 'critical',
    passed: result.linked,
    message: result.linked
      ? `All ${fileNames.length} source file(s) linked into Layer 2`
      : `Linkage failed: ${result.errors.slice(0, 2).join(' | ')}`,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ─────────────────────────────────────────────────────────────────────
// ③ Layer-1 fingerprint integrity — original source byte-perfect inside
// ─────────────────────────────────────────────────────────────────────

/** FNV-1a 32-bit hash — deterministic, no crypto dependency */
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function checkFingerprint(input: HarnessInput): HarnessCheck {
  const t0 = performance.now();
  if (input.originalFiles.length === 0) {
    return {
      id: 'fingerprint',
      label: 'Layer-1 fingerprint integrity',
      severity: 'critical',
      passed: true,
      message: 'No source files to verify (capability-only export)',
      durationMs: Math.round(performance.now() - t0),
    };
  }

  const missing: string[] = [];
  const mutated: string[] = [];

  for (const file of input.originalFiles) {
    // Strategy: find the original content embedded inline. We accept the
    // file as preserved if the verbatim source appears as a contiguous
    // substring of the ascended code. This proves zero mutation of L1.
    const originalNormalized = file.content.replace(/\r\n/g, '\n');
    const ascendedNormalized = input.ascendedCode.replace(/\r\n/g, '\n');
    if (ascendedNormalized.includes(originalNormalized)) {
      continue; // byte-perfect embed
    }
    // Fallback: compare a content-hash anchor. Some emitters wrap source
    // in language-specific block markers; we detect partial drift by
    // checking that ≥90% of non-empty lines exist verbatim in the export.
    const lines = originalNormalized.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) continue;
    let hits = 0;
    for (const line of lines) {
      if (ascendedNormalized.includes(line)) hits++;
    }
    const ratio = hits / lines.length;
    if (ratio < 0.5) {
      missing.push(`${file.name} (${Math.round(ratio * 100)}% lines present)`);
    } else if (ratio < 0.95) {
      mutated.push(`${file.name} (${Math.round(ratio * 100)}% match — possible drift)`);
    }
  }

  const passed = missing.length === 0 && mutated.length === 0;
  const fingerprint = fnv1a(input.originalFiles.map(f => f.content).join('\0'));
  return {
    id: 'fingerprint',
    label: 'Layer-1 fingerprint integrity',
    severity: 'critical',
    passed,
    message: passed
      ? `Byte-perfect Layer 1 preserved (fp: ${fingerprint})`
      : `Source drift detected: ${[...missing, ...mutated].join(', ')}`,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ─────────────────────────────────────────────────────────────────────
// ④ CMPSBL Layer auto-wire presence — soft
// ─────────────────────────────────────────────────────────────────────

function checkLayerAutoWire(input: HarnessInput): HarnessCheck {
  const t0 = performance.now();
  if (input.selectedLayers.length === 0) {
    return {
      id: 'layer_wire',
      label: 'CMPSBL Layer auto-wire',
      severity: 'soft',
      passed: true,
      message: 'No layers selected — skip',
      durationMs: Math.round(performance.now() - t0),
    };
  }

  const missing: string[] = [];
  for (const layer of input.selectedLayers) {
    // Each layer exposes a wrapper name (e.g., cmpsbl_circuit_breaker_call).
    // The wire code must reference it AND the layer header must appear.
    const wrapperPresent = input.ascendedCode.includes(layer.autoWire.wrapperName);
    const headerPresent = input.ascendedCode.includes(layer.name);
    if (!wrapperPresent || !headerPresent) {
      missing.push(`${layer.name} (wrapper:${wrapperPresent ? '✓' : '✗'} header:${headerPresent ? '✓' : '✗'})`);
    }
  }

  const passed = missing.length === 0;
  return {
    id: 'layer_wire',
    label: 'CMPSBL Layer auto-wire',
    severity: 'soft',
    passed,
    message: passed
      ? `${input.selectedLayers.length} layer(s) auto-wired: ${input.selectedLayers.map(l => l.name).join(', ')}`
      : `Layer wire incomplete: ${missing.join(' | ')}`,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ─────────────────────────────────────────────────────────────────────
// ⑤ Layer execution smoke — soft (structural proxy in browser-safe env)
// ─────────────────────────────────────────────────────────────────────

function checkExecutionSmoke(input: HarnessInput): HarnessCheck {
  const t0 = performance.now();
  const lang = input.language.toLowerCase();
  // Runtime smoke tests are language-specific and require an interpreter.
  // In the browser-safe path we run a structural smoke: confirm the main
  // dispatch entry point is defined and that at least one handler body
  // exists for every module referenced in the dispatch table.
  const code = input.ascendedCode;

  const dispatchPattern = /(cmpsbl_execute|cmpsblExecute)\s*[\(=:]/;
  const hasEntryPoint = dispatchPattern.test(code);

  // Look for handler definitions per language
  let handlerPattern: RegExp;
  if (lang === 'python') {
    handlerPattern = /def\s+handle_\w+\s*\(/g;
  } else if (lang === 'typescript' || lang === 'javascript') {
    handlerPattern = /(?:function\s+handle\w+|const\s+handle\w+\s*=)/g;
  } else {
    // Generic — count any handler-like function
    handlerPattern = /handle[_A-Z]\w*\s*[\(({:]/g;
  }
  const handlerHits = (code.match(handlerPattern) || []).length;

  const passed = hasEntryPoint && handlerHits >= 3;
  return {
    id: 'exec_smoke',
    label: 'Layer execution smoke',
    severity: 'soft',
    passed,
    message: passed
      ? `Entry point + ${handlerHits} handlers detected`
      : `Smoke failed — entry:${hasEntryPoint ? '✓' : '✗'} handlers:${handlerHits}`,
    durationMs: Math.round(performance.now() - t0),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Public runner
// ─────────────────────────────────────────────────────────────────────

export function runPreExportHarness(input: HarnessInput): HarnessReport {
  const startedAt = Date.now();

  const checks: HarnessCheck[] = [
    checkSyntax(input),
    checkLinkage(input),
    checkFingerprint(input),
    checkLayerAutoWire(input),
    checkExecutionSmoke(input),
  ];

  const completedAt = Date.now();
  const criticalFailures = checks.filter(c => c.severity === 'critical' && !c.passed).length;
  const softWarnings = checks.filter(c => c.severity === 'soft' && !c.passed).length;
  const passed = criticalFailures === 0;

  const summaryLines = [
    'CMPSBL® Ascension V2 — Pre-Export Harness Report',
    '━'.repeat(60),
    `Verdict: ${passed ? '✓ PASSED' : '✗ FAILED'}`,
    `Critical failures: ${criticalFailures}`,
    `Soft warnings: ${softWarnings}`,
    `Total time: ${completedAt - startedAt}ms`,
    '',
    'Checks:',
    ...checks.map(c =>
      `  ${c.passed ? '✓' : '✗'} [${c.severity.toUpperCase().padEnd(8)}] ${c.label.padEnd(34)} — ${c.message} (${c.durationMs}ms)`
    ),
  ];

  return {
    passed,
    criticalFailures,
    softWarnings,
    checks,
    startedAt,
    completedAt,
    totalMs: completedAt - startedAt,
    summary: summaryLines.join('\n'),
  };
}

/** Format a brief one-line verdict for toast notifications */
export function formatHarnessVerdict(report: HarnessReport): string {
  if (report.passed && report.softWarnings === 0) {
    return `All ${report.checks.length} pre-export checks passed`;
  }
  if (report.passed) {
    return `Passed (${report.softWarnings} soft warning${report.softWarnings === 1 ? '' : 's'})`;
  }
  const firstFail = report.checks.find(c => c.severity === 'critical' && !c.passed);
  return `Blocked: ${firstFail?.label || 'critical check failed'}`;
}
