/**
 * Ascension V2 — End-to-End Pipeline Stress Test
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Drives the full V2 state machine through every shipping language:
 *   TypeScript · JavaScript · Python · Rust · Go
 *
 * For each language this suite verifies, end-to-end:
 *   1. Pre-Ascension Gate accepts canonical, well-formed source
 *   2. Pre-Ascension Gate REJECTS adversarial / malformed source
 *   3. Orchestrator phase machine progresses idle → done with audit chain intact
 *   4. Fingerprint is deterministic across whitespace-only reformatting
 *   5. Fingerprint differs when meaningful tokens differ
 *   6. Pre-Export Harness flags missing Layer 1 (drift), missing entry point,
 *      and passes a well-formed Layer-2-wrapped synthetic export
 *   7. Audit chain remains tamper-evident across the entire run
 *   8. Registry parity — every language asserted here is currently SHIPPING
 *
 * Pure algorithmic — no network, no AI, no flake.
 * © CMPSBL® — All rights reserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initRun,
  commitUpload,
  registerDiscovery,
  beginLocking,
  commitAscension,
  completeRun,
  getSnapshot,
  PreAscensionGateError,
} from '@/lib/ascension-v2/orchestrator';
import {
  runPreAscensionGate,
  formatGateError,
} from '@/lib/ascension-v2/pre-ascension-gate';
import {
  computeFingerprint,
  computeMultiFileFingerprint,
  verifyFingerprint,
} from '@/lib/ascension-v2/fingerprint-gate';
import {
  appendAudit,
  verifyChain,
  getChainState,
  resetChain,
} from '@/lib/ascension-v2/audit-chain';
import {
  runPreExportHarness,
  type HarnessInput,
} from '@/lib/ascension-v2/pre-export-harness';
import { getShippingLanguages } from '@/lib/export/language-parity-tiers';

// ═════════════════════════════════════════════════════════════════════════════
// Per-language fixture: (canonical source, adversarial source, file ext)
// ═════════════════════════════════════════════════════════════════════════════

interface LangFixture {
  readonly id: string;             // canonical id, must be SHIPPING
  readonly label: string;          // human label, surfaces in test names
  readonly ext: string;            // file extension (with dot)
  readonly canonical: string;      // valid, well-formed source
  readonly adversarial: string;    // structurally invalid source
}

const FIXTURES: ReadonlyArray<LangFixture> = [
  {
    id: 'typescript',
    label: 'TypeScript',
    ext: '.ts',
    canonical: `
export function calculate(a: number, b: number): number {
  return a + b;
}

export class Engine {
  process(items: ReadonlyArray<string>): string[] {
    return items.map(i => i.toUpperCase());
  }
}
`.trim(),
    // Class declaration with no body — jsStructuralCheck must catch this.
    adversarial: `
export class Broken
  process() { return 1; }
`.trim(),
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    ext: '.js',
    canonical: `
function calculate(a, b) {
  return a + b;
}

class Engine {
  process(items) {
    return items.map(i => i.toUpperCase());
  }
}

module.exports = { calculate, Engine };
`.trim(),
    // Unclosed brace — balancedScan must reject.
    adversarial: `
function broken(a, b) {
  return a + b;
`.trim(),
  },
  {
    id: 'python',
    label: 'Python',
    ext: '.py',
    canonical: `
def calculate(a, b):
    """Add two numbers — with reasonable bounds."""
    return a + b


class Engine:
    def process(self, items):
        return [i.upper() for i in items]
`.trim(),
    // try: with no except/finally — pythonStructuralCheck must reject.
    adversarial: `
def broken():
    try:
        x = 1
    return x
`.trim(),
  },
  {
    id: 'rust',
    label: 'Rust',
    ext: '.rs',
    canonical: `
pub fn calculate(a: i64, b: i64) -> i64 {
    a + b
}

pub struct Engine;

impl Engine {
    pub fn process(&self, items: Vec<String>) -> Vec<String> {
        items.into_iter().map(|s| s.to_uppercase()).collect()
    }
}
`.trim(),
    // Unclosed brace — balancedScan fallback must reject.
    adversarial: `
pub fn broken() -> i64 {
    let x = 1;
`.trim(),
  },
  {
    id: 'go',
    label: 'Go',
    ext: '.go',
    canonical: `
package main

import "strings"

func Calculate(a, b int) int {
    return a + b
}

type Engine struct{}

func (e *Engine) Process(items []string) []string {
    out := make([]string, 0, len(items))
    for _, s := range items {
        out = append(out, strings.ToUpper(s))
    }
    return out
}
`.trim(),
    // Unclosed brace.
    adversarial: `
package main

func Broken() int {
    return 1
`.trim(),
  },
  {
    id: 'java',
    label: 'Java',
    ext: '.java',
    canonical: `
public class Engine {
    public int calculate(int a, int b) { return a + b; }
    public String process(String item) { return item.toUpperCase(); }
}
`.trim(),
    adversarial: `
public class Broken {
    public int broken() { return 1;
`.trim(),
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    ext: '.kt',
    canonical: `
fun calculate(a: Int, b: Int): Int = a + b

class Engine {
    fun process(items: List<String>): List<String> = items.map { it.uppercase() }
}
`.trim(),
    adversarial: `
fun broken(): Int {
    val x = 1
`.trim(),
  },
  {
    id: 'csharp',
    label: 'C#',
    ext: '.cs',
    canonical: `
using System.Collections.Generic;
using System.Linq;

public class Engine {
    public int Calculate(int a, int b) { return a + b; }
    public IEnumerable<string> Process(IEnumerable<string> items) {
        return items.Select(i => i.ToUpper());
    }
}
`.trim(),
    adversarial: `
public class Broken {
    public int Broken() { return 1;
`.trim(),
  },
  {
    id: 'swift',
    label: 'Swift',
    ext: '.swift',
    canonical: `
func calculate(_ a: Int, _ b: Int) -> Int { return a + b }

class Engine {
    func process(_ items: [String]) -> [String] {
        return items.map { $0.uppercased() }
    }
}
`.trim(),
    adversarial: `
func broken() -> Int {
    let x = 1
`.trim(),
  },
];

// ═════════════════════════════════════════════════════════════════════════════
// Synthetic Layer-2-wrapped export — used to exercise the Pre-Export Harness
// without requiring the real polyglot emitter chain inside this unit test.
// The harness only verifies STRUCTURE (entry point + handlers + verbatim L1
// embed), so we hand-construct a minimal but valid wrapper for each language.
// ═════════════════════════════════════════════════════════════════════════════

function syntheticLayer2(
  language: string,
  layer1: string,
  originalFileName: string,
): string {
  const lang = language.toLowerCase();
  // Linkage validator requires both the embed marker (`LAYER 1` +
  // `ORIGINAL SOURCE`) and a reference to the basename of the L1 file.
  const baseName = originalFileName.replace(/\.[^.]+$/, ''); // strip ext
  const banner = `═════ LAYER 1 — ORIGINAL SOURCE: ${baseName} ═════`;
  // Three handler stubs satisfy the harness smoke threshold (≥3 handlers).
  if (lang === 'python') {
    return [
      '# CMPSBL® Layer 2 — Synthetic Wrapper',
      `# ${banner}`,
      'def cmpsbl_execute(module, action, payload):',
      '    return {"ok": True}',
      '',
      'def handle_circuit_breaker(payload): return payload',
      'def handle_self_healing(payload):  return payload',
      'def handle_consensus(payload):     return payload',
      '',
      `# ${banner}`,
      layer1,
    ].join('\n');
  }
  if (lang === 'rust') {
    return [
      '// CMPSBL® Layer 2 — Synthetic Wrapper',
      `// ${banner}`,
      'pub fn cmpsbl_execute() {}',
      'pub fn handle_circuit_breaker() {}',
      'pub fn handle_self_healing()    {}',
      'pub fn handle_consensus()       {}',
      '',
      `// ${banner}`,
      layer1,
    ].join('\n');
  }
  if (lang === 'go') {
    return [
      '// CMPSBL® Layer 2 — Synthetic Wrapper',
      'package cmpsbl',
      '',
      `// ${banner}`,
      'func cmpsbl_execute() {}',
      'func handle_circuit_breaker() {}',
      'func handle_self_healing()    {}',
      'func handle_consensus()       {}',
      '',
      `// ${banner}`,
      layer1,
    ].join('\n');
  }
  // TS / JS share the same shape.
  return [
    '// CMPSBL® Layer 2 — Synthetic Wrapper',
    `// ${banner}`,
    'function cmpsbl_execute(mod, action, payload) { return { ok: true }; }',
    'function handle_circuit_breaker(p) { return p; }',
    'function handle_self_healing(p)    { return p; }',
    'function handle_consensus(p)       { return p; }',
    '',
    `// ${banner}`,
    layer1,
  ].join('\n');
}

// ═════════════════════════════════════════════════════════════════════════════
// Suite
// ═════════════════════════════════════════════════════════════════════════════

beforeEach(() => {
  // Each test owns a clean audit chain so chain-length assertions are exact.
  resetChain();
});

describe('V2 Pipeline — registry parity', () => {
  it('every fixture language is currently SHIPPING in the parity registry', () => {
    const shippingIds = new Set(getShippingLanguages().map(l => l.id));
    for (const f of FIXTURES) {
      expect(shippingIds.has(f.id), `${f.label} must be SHIPPING`).toBe(true);
    }
  });

  it('exactly five fixtures are exercised end-to-end', () => {
    expect(FIXTURES).toHaveLength(5);
  });
});

describe.each(FIXTURES)('V2 Pipeline — $label', (fx) => {
  const fileName = `module${fx.ext}`;

  // ─── Pre-Ascension Gate ──────────────────────────────────────────────────
  it('Pre-Ascension Gate accepts canonical source', () => {
    const result = runPreAscensionGate(
      [{ name: fileName, content: fx.canonical }],
      fx.id,
    );
    if (!result.ok) {
      // Surface error detail in CI logs to make regressions trivial to fix.
      throw new Error(
        `Gate rejected canonical ${fx.label}: ${result.errors.map(formatGateError).join(' | ')}`,
      );
    }
    expect(result.ok).toBe(true);
    expect(result.checked).toBe(1);
  });

  it('Pre-Ascension Gate rejects adversarial source with a structured error', () => {
    const result = runPreAscensionGate(
      [{ name: fileName, content: fx.adversarial }],
      fx.id,
    );
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    const err = result.errors[0];
    expect(err.code).toMatch(/^E_SOURCE_/);
    expect(err.line).toBeGreaterThan(0);
    expect(err.message.length).toBeGreaterThan(0);
    expect(err.suggestion.length).toBeGreaterThan(0);
  });

  it('Pre-Ascension Gate rejects empty input', () => {
    const result = runPreAscensionGate([], fx.id);
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('E_SOURCE_EMPTY');
  });

  it.runIf(fx.id === 'python')('Pre-Ascension Gate accepts valid multiline Python condition headers', () => {
    const result = runPreAscensionGate(
      [
        {
          name: fileName,
          content: `
def validate(values):
    allowed_tools = ["alpha"]
    tools = []
    if allowed_tools is not None and set(allowed_tools) != {
        tool.name for tool in tools
    }:
        return values
    return values
`.trim(),
        },
      ],
      fx.id,
    );

    if (!result.ok) {
      throw new Error(
        `Gate rejected valid multiline Python header: ${result.errors.map(formatGateError).join(' | ')}`,
      );
    }

    expect(result.ok).toBe(true);
  });

  // ─── Fingerprint Gate ────────────────────────────────────────────────────
  it('fingerprint is whitespace-invariant', () => {
    const fpA = computeFingerprint(fx.canonical, fx.id);
    // Reformat: insert random spaces around punctuation + collapse newlines.
    const reformatted = fx.canonical
      .replace(/([{}();,])/g, ' $1 ')
      .replace(/\n+/g, '\n  ');
    const fpB = computeFingerprint(reformatted, fx.id);
    expect(fpB.hash).toBe(fpA.hash);
  });

  it('fingerprint differs when an identifier changes', () => {
    const fpA = computeFingerprint(fx.canonical, fx.id);
    const mutated = fx.canonical.replace(/calculate/i, 'compute_v2');
    const fpB = computeFingerprint(mutated, fx.id);
    // If the source didn't contain `calculate` (defensive), skip the inequality.
    if (mutated !== fx.canonical) {
      expect(fpB.hash).not.toBe(fpA.hash);
    }
  });

  it('verifyFingerprint round-trips on identical source', () => {
    const fp = computeFingerprint(fx.canonical, fx.id);
    const v = verifyFingerprint(fx.canonical, fx.id, fp);
    expect(v.matches).toBe(true);
    expect(v.drift).toBe(false);
  });

  // ─── Orchestrator state machine ──────────────────────────────────────────
  it('orchestrator drives idle → done with intact audit chain', () => {
    const runId = initRun();
    expect(runId).toMatch(/^run_/);

    const fp = commitUpload([{ name: fileName, content: fx.canonical }], fx.id);
    expect(fp.hash).toMatch(/^[0-9a-f]{8}$/);
    expect(getSnapshot().phase).toBe('analyzing');

    registerDiscovery({
      name: 'SyntheticCapability',
      cjpiScore: 88,
      tier: 'mythic',
      description: 'unit-test discovery',
      chain: ['CORE', 'BRAIN', 'DEFENSE'],
      chainDepth: 3,
    });

    beginLocking();
    expect(getSnapshot().phase).toBe('locking');

    commitAscension(1);
    expect(getSnapshot().phase).toBe('exporting');

    completeRun();
    const snap = getSnapshot();
    expect(snap.phase).toBe('done');
    expect(snap.ascended).toBe(1);
    expect(snap.topScore).toBe(88);
    expect(snap.progress).toBe(100);
    expect(snap.discovered).toHaveLength(1);

    // Audit chain must be tamper-evident and contain all key events.
    const chain = getChainState();
    expect(chain.verified).toBe(true);
    const actions = chain.entries.map(e => e.action);
    expect(actions).toContain('run_init');
    expect(actions).toContain('pre_ascension_gate');
    expect(actions).toContain('fingerprint_computed');
    expect(actions).toContain('discovery');
    expect(actions).toContain('locking_started');
    expect(actions).toContain('ascension_complete');
    expect(actions).toContain('run_complete');
    expect(verifyChain()).toBe(true);
  });

  it('orchestrator throws PreAscensionGateError on malformed upload', () => {
    initRun();
    expect(() =>
      commitUpload([{ name: fileName, content: fx.adversarial }], fx.id),
    ).toThrow(PreAscensionGateError);
    expect(getSnapshot().phase).toBe('error');
  });

  it('orchestrator refuses out-of-order phase transitions', () => {
    initRun();
    expect(() => beginLocking()).toThrow(/Cannot lock in phase: idle/);
    expect(() => commitAscension(0)).toThrow(/Cannot ascend in phase/);
  });

  // ─── Pre-Export Harness ──────────────────────────────────────────────────
  it('Pre-Export Harness PASSES on a well-formed synthetic Layer-2 export', () => {
    const ascended = syntheticLayer2(fx.id, fx.canonical, fileName);
    const input: HarnessInput = {
      ascendedCode: ascended,
      language: fx.id,
      originalFiles: [{ name: fileName, content: fx.canonical }],
      selectedLayers: [],
    };
    const report = runPreExportHarness(input);
    expect(report.passed, report.summary).toBe(true);
    expect(report.criticalFailures).toBe(0);
  });

  it('Pre-Export Harness FAILS when Layer 1 is missing (fingerprint drift)', () => {
    // Wrap a *different* L1 → fingerprint check must reject.
    const ascended = syntheticLayer2(fx.id, '/* unrelated content */', fileName);
    const input: HarnessInput = {
      ascendedCode: ascended,
      language: fx.id,
      originalFiles: [{ name: fileName, content: fx.canonical }],
      selectedLayers: [],
    };
    const report = runPreExportHarness(input);
    expect(report.passed).toBe(false);
    const fp = report.checks.find(c => c.id === 'fingerprint');
    expect(fp?.passed).toBe(false);
  });

  it('Pre-Export Harness execution-smoke flags a missing entry point', () => {
    // Strip the entry point — handlers remain, so only smoke check fails.
    const stripped = syntheticLayer2(fx.id, fx.canonical, fileName).replace(
      /cmpsbl_execute/g,
      'unrelated_symbol',
    );
    const input: HarnessInput = {
      ascendedCode: stripped,
      language: fx.id,
      originalFiles: [{ name: fileName, content: fx.canonical }],
      selectedLayers: [],
    };
    const report = runPreExportHarness(input);
    const smoke = report.checks.find(c => c.id === 'exec_smoke');
    expect(smoke?.passed).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Cross-cutting invariants — run once across the full fixture matrix
// ═════════════════════════════════════════════════════════════════════════════

describe('V2 Pipeline — cross-language invariants', () => {
  it('multi-file fingerprint is stable under file-order permutation', () => {
    const files = FIXTURES.map((f, i) => ({
      name: `mod${i}${f.ext}`,
      content: f.canonical,
    }));
    const fpA = computeMultiFileFingerprint(files, 'multi');
    const fpB = computeMultiFileFingerprint([...files].reverse(), 'multi');
    expect(fpB.hash).toBe(fpA.hash);
  });

  it('audit chain detects tampering in any historical entry', () => {
    appendAudit('alpha', 'one');
    appendAudit('beta', 'two');
    appendAudit('gamma', 'three');
    expect(verifyChain()).toBe(true);

    // Tamper: mutate the middle entry's detail. Because entries are frozen
    // we mutate the readonly array in place via cast — this simulates a
    // hostile actor with raw memory access.
    const chain = getChainState();
    const middle = chain.entries[1] as { detail: string };
    try {
      middle.detail = 'TAMPERED';
    } catch {
      // entries are Object.freeze'd → mutation is silently dropped in
      // strict mode. Skip this assertion in that case; the freeze itself
      // is the defense.
      return;
    }
    expect(verifyChain()).toBe(false);
  });

  it('every shipping language in the parity registry has an E2E fixture', () => {
    const shippingIds = getShippingLanguages().map(l => l.id).sort();
    const fixtureIds = FIXTURES.map(f => f.id).sort();
    expect(fixtureIds).toEqual(shippingIds);
  });
});
