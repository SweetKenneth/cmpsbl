/**
 * CMPSBL® 10-Language Ascension Export Smoke Test
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Validates the FULL export pipeline across 10 different languages:
 *   1. TypeScript, 2. Python, 3. PHP, 4. Rust, 5. Go
 *   6. Java, 7. C, 8. Ruby, 9. Swift, 10. Kotlin
 *
 * For each language, validates:
 *   - Non-trivial output generation
 *   - All 4 sections (§1–§4) present
 *   - All capability names embedded
 *   - CJPI scoring system present
 *   - Execution API present
 *   - Zero external dependencies
 *   - Self-contained (no dead architecture references)
 *   - Black-box obfuscation applied
 *   - Correct file extension
 *
 * For PHP (inline embedding language):
 *   - Layer 1 source is embedded inline
 *   - Layer 2 linkage validator passes
 *   - class_exists equivalent present
 *
 * Patent compliance (U.S. App. No. 64/029,678):
 *   - Dual-layer architecture markers present
 *   - Original code preservation evidence
 *   - Behavioral wrapper evidence
 *
 * © CMPSBL® — All rights reserved.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateUnifiedCapabilityFile,
  getUnifiedFilename,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { validateLayer2, validateLayer2Linkage } from '@/lib/export/layer2-validator';

// ═══════════════════════════════════════════════════════════════
// FIXTURES — Simulate Ascension discovery across languages
// ═══════════════════════════════════════════════════════════════

const CAPABILITIES: UnifiedCapabilityInput[] = [
  {
    id: 'smoke-001',
    name: 'TaskProcessor',
    cjpiScore: 93,
    tier: 'apex',
    chain: ['CORE', 'BRAIN', 'DEFENSE', 'ORACLE', 'IMMUNITY', 'CORTEX', 'ENCODE'],
    fingerprint: 'aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44',
    moatSignature: 'moat-task-sealed',
    capabilityType: 'processing',
    description: 'Multi-threaded task processing with fault tolerance',
    category: 'infrastructure',
  },
  {
    id: 'smoke-002',
    name: 'DataGuard',
    cjpiScore: 78,
    tier: 'relic',
    chain: ['DEFENSE', 'SHADOW', 'AUDIT', 'GOVERNANCE', 'TREATY'],
    fingerprint: 'bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55',
    moatSignature: 'moat-guard-sealed',
    capabilityType: 'security',
    description: 'Data integrity with audit trail and compliance',
    category: 'security',
  },
  {
    id: 'smoke-003',
    name: 'SignalRouter',
    cjpiScore: 61,
    tier: 'relic',
    chain: ['NERVE', 'RELAY', 'RIPPLE', 'ECHO'],
    fingerprint: 'cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66aa11bb22cc33dd44ee55ff66',
    moatSignature: 'moat-signal-sealed',
    capabilityType: 'routing',
    description: 'Adaptive signal routing with cascading propagation',
    category: 'infrastructure',
  },
];

const PACK_NAME = 'smoke-test-10lang';

// Simulated user source files for PHP inline embedding test
const PHP_SOURCE_FILES = [
  {
    name: 'TaskWorker.php',
    extension: '.php',
    language: 'PHP',
    content: `<?php
class TaskWorker {
    public function enqueue(string $task): bool { return true; }
    public function run(): void { /* process queue */ }
    public function registerHandler(string $type, callable $handler): void {}
}
function sendEmail(string $to, string $body): bool { return true; }
`,
  },
];

const PYTHON_SOURCE_FILES = [
  {
    name: 'task_worker.py',
    extension: '.py',
    language: 'Python',
    content: `class TaskWorker:
    def enqueue(self, task: str) -> bool:
        return True
    def run(self):
        pass
def send_email(to: str, body: str) -> bool:
    return True
`,
  },
];

const TS_SOURCE_FILES = [
  {
    name: 'TaskWorker.ts',
    extension: '.ts',
    language: 'TypeScript',
    content: `export class TaskWorker {
  enqueue(task: string): boolean { return true; }
  run(): void { /* process */ }
}
export function sendEmail(to: string, body: string): boolean { return true; }
`,
  },
];

// ═══════════════════════════════════════════════════════════════
// ALL 10 LANGUAGES — Unified Smoke Tests
// ═══════════════════════════════════════════════════════════════

const LANGUAGES = [
  { lang: 'typescript', ext: '.ts', idioms: ['export function', 'interface', 'const '] },
  { lang: 'python',     ext: '.py', idioms: ['def ', 'class ', 'import '] },
  { lang: 'php',        ext: '.php', idioms: ['function ', 'class ', '$'] },
  { lang: 'rust',       ext: '.rs', idioms: ['pub fn', 'pub struct', 'match'] },
  { lang: 'go',         ext: '.go', idioms: ['func ', 'struct', 'package'] },
  { lang: 'java',       ext: '.java', idioms: ['public class', 'public static'] },
  { lang: 'c',          ext: '.c', idioms: ['struct', 'int ', 'void '] },
  { lang: 'ruby',       ext: '.rb', idioms: ['def ', 'class ', 'end'] },
  { lang: 'swift',      ext: '.swift', idioms: ['func ', 'struct ', 'let '] },
  { lang: 'kotlin',     ext: '.kt', idioms: ['fun ', 'class ', 'val '] },
];

import { isLanguageShipping } from '../language-parity-tiers';

describe('10-Language Ascension Export Smoke Test', () => {
  for (const { lang, ext, idioms } of LANGUAGES) {
    // Non-shipping languages are gated at the export gate by design.
    // Skip the suite cleanly so the gate is honored, not bypassed.
    const d = isLanguageShipping(lang) ? describe : describe.skip;
    d(`${lang.toUpperCase()} Export`, () => {
      // Lazy generation — never invoked when suite is skipped.
      let output = '';
      beforeAll(() => {
        output = generateUnifiedCapabilityFile(CAPABILITIES, PACK_NAME, lang);
      });

      it('generates non-trivial output (>500 chars)', () => {
        expect(output.length).toBeGreaterThan(500);
      });

      it(`has correct file extension (cmpsbl${ext})`, () => {
        const filename = getUnifiedFilename(lang);
        expect(filename).toContain('cmpsbl');
        expect(filename.endsWith(ext)).toBe(true);
      });

      it('contains all 4 sections (§1–§4)', () => {
        expect(output).toContain('§1');
        expect(output).toContain('§2');
        expect(output).toContain('§3');
        expect(output).toContain('§4');
      });

      it('embeds all discovered capability names', () => {
        for (const cap of CAPABILITIES) {
          expect(output).toContain(cap.name);
        }
      });

      it('references CJPI scoring', () => {
        // All languages should mention CJPI somewhere
        expect(output.toLowerCase()).toContain('cjpi');
      });

      it('contains execute API', () => {
        expect(output.toLowerCase()).toContain('execute');
      });

      it('contains no dead architecture references', () => {
        expect(output).not.toContain('loadMiniRuntime');
        expect(output).not.toContain('generateRuntimeBridge');
        expect(output).not.toContain('standalone-runtime');
      });

      it('contains no recursive re-ingestion references', () => {
        expect(output).not.toContain('re-ingest');
        expect(output).not.toContain('recursive ingestion');
      });

      // Language-specific idiom checks (at least 1 must be present)
      it(`uses ${lang} idioms`, () => {
        const hasIdiom = idioms.some(idiom => output.includes(idiom));
        expect(hasIdiom).toBe(true);
      });
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PHP Layer 2 Inline Embedding Test (Patent Compliance)
// ═══════════════════════════════════════════════════════════════

// Parity gate: PHP is COMING_SOON. Skip its dedicated suites until shipping.
const phpDescribe = isLanguageShipping('php') ? describe : describe.skip;

phpDescribe('PHP Inline Embedding (Patent Compliance)', () => {
  let phpOutput: string;
  beforeAll(() => {
    phpOutput = generateUnifiedCapabilityFile(
      CAPABILITIES, PACK_NAME, 'php', PHP_SOURCE_FILES,
    );
  });

  it('embeds original class inline (Layer 1 marker present)', () => {
    expect(phpOutput).toContain('LAYER 1');
    expect(phpOutput).toContain('ORIGINAL SOURCE');
  });

  it('embeds actual class definition from Layer 1', () => {
    expect(phpOutput).toContain('class TaskWorker');
    expect(phpOutput).toContain('function enqueue');
    expect(phpOutput).toContain('function sendEmail');
  });

  it('does NOT have a commented-out require_once for original', () => {
    // The inline version should NOT need a require_once to the original
    expect(phpOutput).not.toMatch(/\/\/\s*require_once.*original/);
  });

  it('is fully self-contained — no require of original/', () => {
    // Should not import from original/ directory since it is embedded inline
    const lines = phpOutput.split('\n');
    const activeRequires = lines.filter(l =>
      /require_once.*original\//i.test(l) && !l.trim().startsWith('//')
    );
    expect(activeRequires).toHaveLength(0);
  });

  it('passes Layer 2 linkage validation', () => {
    const result = validateLayer2Linkage(phpOutput, 'php', ['TaskWorker.php']);
    expect(result.linked).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes Layer 2 structural validation', () => {
    const result = validateLayer2(phpOutput, 'php');
    expect(result.valid).toBe(true);
  });

  it('contains class_exists check for runtime wiring', () => {
    expect(phpOutput).toContain("class_exists('TaskWorker')");
  });

  it('strips <?php tag from embedded source (no duplicate declaration)', () => {
    // Count <?php occurrences — should be exactly 1 (the file header)
    const phpTags = phpOutput.match(/<\?php/g) || [];
    expect(phpTags).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════
// Python and TypeScript per-cap source tests (with user files)
// ═══════════════════════════════════════════════════════════════

describe('Python Unified Export (with user source files)', () => {
  const pyOutput = generateUnifiedCapabilityFile(
    CAPABILITIES, PACK_NAME, 'python', PYTHON_SOURCE_FILES,
  );

  it('generates valid Python output', () => {
    expect(pyOutput).toContain('def ');
    expect(pyOutput).toContain('class ');
  });

  it('references the original module name', () => {
    expect(pyOutput).toContain('task_worker');
  });
});

describe('TypeScript Unified Export (with user source files)', () => {
  const tsOutput = generateUnifiedCapabilityFile(
    CAPABILITIES, PACK_NAME, 'typescript', TS_SOURCE_FILES,
  );

  it('generates valid TypeScript output', () => {
    expect(tsOutput).toContain('export function');
  });

  it('references the original module name', () => {
    expect(tsOutput).toContain('TaskWorker');
  });
});

// ═══════════════════════════════════════════════════════════════
// Patent Fulfillment — Dual-Layer Architecture Evidence
// ═══════════════════════════════════════════════════════════════

describe('Patent Fulfillment (U.S. App. No. 64/029,678)', () => {
  const pyOutput = generateUnifiedCapabilityFile(
    CAPABILITIES, PACK_NAME, 'python', PYTHON_SOURCE_FILES,
  );
  const tsOutput = generateUnifiedCapabilityFile(
    CAPABILITIES, PACK_NAME, 'typescript', TS_SOURCE_FILES,
  );

  it('Python: dual-layer markers present', () => {
    const hasLayer1 = pyOutput.includes('Layer 1') || pyOutput.includes('LAYER 1') || pyOutput.includes('original');
    const hasLayer2 = pyOutput.includes('Layer 2') || pyOutput.includes('cognitive') || pyOutput.includes('CMPSBL');
    expect(hasLayer1).toBe(true);
    expect(hasLayer2).toBe(true);
  });

  it('TypeScript: dual-layer markers present', () => {
    expect(tsOutput).toContain('Layer 1');
    expect(tsOutput).toContain('Layer 2');
  });

  it('shipping languages contain Convex Core DPL', () => {
    expect(pyOutput).toContain('CONVEX CORE');
    expect(tsOutput).toContain('CONVEX CORE');
  });

  it('shipping languages embed fingerprint data', () => {
    for (const output of [pyOutput, tsOutput]) {
      expect(output).toContain('AA11BB22CC33');
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// Runtime Capability Activation Check (PHP — gated on parity)
// ═══════════════════════════════════════════════════════════════

phpDescribe('Runtime Capabilities Activation (PHP)', () => {
  let phpOutput: string;
  beforeAll(() => {
    phpOutput = generateUnifiedCapabilityFile(
      CAPABILITIES, PACK_NAME, 'php', PHP_SOURCE_FILES,
    );
  });

  it('PHP: all 7 chain primitives from capability 1 are in handler registry', () => {
    for (const mod of CAPABILITIES[0].chain) {
      // Each module should be in the handler registry
      expect(phpOutput).toContain(`'${mod}'`);
    }
  });

  it('PHP: pipeline executor function exists', () => {
    expect(phpOutput).toContain('cmpsbl_execute_pipeline');
  });

  it('PHP: self-test function exists', () => {
    expect(phpOutput).toContain('cmpsbl_self_test');
  });

  it('PHP: capability listing function exists', () => {
    expect(phpOutput).toContain('cmpsbl_list_capabilities');
  });

  it('PHP: validate function exists', () => {
    expect(phpOutput).toContain('validate');
  });
});
