/**
 * Proprietary Evolution — ZIP Bundle Generator
 * Generates downloadable Capability Pack ZIPs with:
 * - Mini-Runtime™ Engine (from standalone-runtime.ts + standalone-discovery-engine.ts)
 * - License in HTML + MD
 * - README in HTML + MD
 * - Pipeline Details HTML (per capability)
 * - Valuation data
 * - Source code, test harnesses, manifest
 * 
 * Mini-Runtime is included as a SEALED binary — obfuscated to protect IP.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import { generateLicenseHTML, generateReadmeHTML } from '@/lib/export/elegant-html-docs';
import { generatePipelineDetailsHTML } from '@/lib/export/pipeline-details-page';
import { estimateMarketValue, formatMarketValue, getTierFromScore } from '@/lib/pipeline-valuation';
import { humanizeCapabilityName, humanizeFilename } from '@/lib/export/humanize-name';
import { generateCherryPickedCapabilities } from '@/lib/export/cherry-pick-effects';
import { generateUnifiedCapabilityFile, getUnifiedFilename } from '@/lib/export/unified-capability-file';

export interface CapabilityForExport {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  chain: string[];
  fingerprint: string;
  moatSignature: string;
  capabilityType: string;
  description?: string;
  category?: string;
}

interface UserSourceFile {
  name: string;
  extension: string;
  language: string;
  content: string;
}

export interface ExportOptions {
  targetLanguage: string;
  capabilities: CapabilityForExport[];
  candidateName: string;
  /** User's original source files from ingest — included in ZIP when exporting in source language */
  userSourceFiles?: UserSourceFile[];
  /** Display label for the source language (e.g. "Verilog", "Python") */
  sourceLanguage?: string;
}

const LANG_EXT: Record<string, string> = {
  typescript: '.ts', python: '.py', rust: '.rs', go: '.go', zig: '.zig',
  java: '.java', csharp: '.cs', ruby: '.rb', swift: '.swift', kotlin: '.kt',
  verilog: '.v', systemverilog: '.sv', vhdl: '.vhd', systemc: '.cpp',
  php: '.php', lua: '.lua', dart: '.dart', scala: '.scala', elixir: '.ex',
  haskell: '.hs', c: '.c', cpp: '.cpp', spice: '.spice', chisel: '.scala',
  amaranth: '.py',
};

const LANG_COMMENT: Record<string, [string, string]> = {
  typescript: ['//', '/*'], python: ['#', '"""'], rust: ['//', '/*'],
  go: ['//', '/*'], zig: ['//', '//'], java: ['//', '/*'],
  csharp: ['//', '/*'], ruby: ['#', '=begin'], swift: ['//', '/*'], kotlin: ['//', '/*'],
  verilog: ['//', '/*'], systemverilog: ['//', '/*'], vhdl: ['--', '--'], systemc: ['//', '/*'],
  php: ['//', '/*'], lua: ['--', '--[['], dart: ['//', '/*'], scala: ['//', '/*'],
  elixir: ['#', '@doc """'], haskell: ['--', '{-'], c: ['//', '/*'], cpp: ['//', '/*'],
  spice: ['*', '*'], chisel: ['//', '/*'], amaranth: ['#', '"""'],
};

// ═══ Runtime is now BUILT INTO the unified single file ═══
// No separate runtime loading needed — generateUnifiedCapabilityFile() handles everything.

interface SourceFile { name: string; extension: string; language: string; content: string; }

function generateCapabilitySource(cap: CapabilityForExport, lang: string, sourceFiles?: SourceFile[]): string {
  const [line] = LANG_COMMENT[lang] || ['//', '/*'];

  if (lang === 'typescript') {
    // Auto-wire imports from bundled original files
    const origFiles = sourceFiles || [];
    const tsFiles = origFiles.filter(f =>
      /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(f.name)
    );

    // Generate real import statements for each original file
    const importLines = tsFiles.length > 0
      ? tsFiles.map(f => {
          const modName = f.name.replace(/\.[^.]+$/, '');
          return `import * as ${modName.replace(/[^a-zA-Z0-9_$]/g, '_')} from '../original/${modName}';`;
        }).join('\n')
      : `${line} No TypeScript/JavaScript files detected in original/ — manual wiring needed`;

    // Build the executeOriginal body that calls into the originals
    const executeBody = tsFiles.length > 0
      ? (() => {
          const firstMod = tsFiles[0].name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_$]/g, '_');
          return [
            `  ${line} Auto-wired to original source: ${tsFiles.map(f => f.name).join(', ')}`,
            `  const mod = ${firstMod} as Record<string, unknown>;`,
            `  ${line} Attempt to call known entry points in priority order`,
            `  const entryPoints = ['execute', 'run', 'main', 'handle', 'process', 'default'];`,
            `  for (const ep of entryPoints) {`,
            `    if (typeof mod[ep] === 'function') {`,
            `      return (mod[ep] as Function)(input);`,
            `    }`,
            `  }`,
            `  ${line} No known entry point found — try default export`,
            `  if (typeof mod.default === 'function') {`,
            `    return (mod.default as Function)(input);`,
            `  }`,
            `  ${line} Return input if no callable found (honest passthrough)`,
            `  return input;`,
          ].join('\n');
        })()
      : `  ${line} Original files are in ../original/ — wire your imports above\n  return input;`;

    return `${line} ═══════════════════════════════════════════════════════
${line}  Capability: ${cap.name}
${line}  CJPI: ${cap.cjpiScore} | Tier: ${cap.tier.toUpperCase()}
${line}  Chain: ${cap.chain.join(' → ')}
${line}  Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
${line}  Moat Signature: ${cap.moatSignature.slice(0, 8)}
${line} ═══════════════════════════════════════════════════════
${line}
${line}  DUAL-LAYER ARCHITECTURE:
${line}    Layer 1 — Native Execution: Your original code runs first (unchanged)
${line}    Layer 2 — Cognitive Overlay: CMPSBL observes, enriches, augments
${line}
${line}  Your original code is in the ../original/ folder.
${line}  This file wraps it with the CMPSBL cognitive layer.
${line} ═══════════════════════════════════════════════════════

import { execute, executeChain, computeCJPI, tierFromCJPI, type CJPIInput } from '../cmpsbl';

${line} ═══════════════════════════════════════════════════════
${line}  Layer 1 — Original Source Imports (auto-wired from ../original/)
${line} ═══════════════════════════════════════════════════════
${importLines}

export const CAPABILITY_META = {
  name: '${cap.name}',
  cjpi: ${cap.cjpiScore},
  tier: '${cap.tier}',
  chain: ${JSON.stringify(cap.chain)},
  fingerprint: '${cap.fingerprint}',
  moatSignature: '${cap.moatSignature}',
  type: '${cap.capabilityType}',
} as const;

/**
 * Execute your original code directly.
 * This is the NATIVE EXECUTION LAYER — your logic runs unchanged.
 * Returns the raw result from your original code.
 */
export function executeOriginal(input: Record<string, unknown>): unknown {
${executeBody}
}

/**
 * Execute with CMPSBL cognitive overlay.
 * Runs your original code FIRST, then enriches with cognition.
 *
 * Flow: execute original → capture result → enrich with CMPSBL
 */
export function executeWithCognition(input: Record<string, unknown>): Record<string, unknown> {
  const start = Date.now();

  ${line} Layer 1: Run original code
  let originalResult: unknown;
  let originalExecuted = false;
  let originalError: string | null = null;

  try {
    originalResult = executeOriginal(input);
    originalExecuted = true;
  } catch (err) {
    originalError = err instanceof Error ? err.message : String(err);
    originalResult = input; ${line} Preserve input on failure
  }

  const executionMs = Date.now() - start;

  ${line} Layer 2: CMPSBL cognitive overlay
  return {
    ...(typeof originalResult === 'object' && originalResult !== null ? originalResult as Record<string, unknown> : { _original_result: originalResult }),
    _cmpsbl: {
      capability: CAPABILITY_META.name,
      cjpi: CAPABILITY_META.cjpi,
      tier: CAPABILITY_META.tier,
      chain: CAPABILITY_META.chain,
      execution: {
        original_executed: originalExecuted,
        original_error: originalError,
        execution_ms: executionMs,
        strategy: originalExecuted ? 'native' : 'passthrough',
        timestamp: new Date().toISOString(),
      },
    },
  };
}

${line} Default export — runs with cognition
export function execute(input: Record<string, unknown>): Record<string, unknown> {
  return executeWithCognition(input);
}

/**
 * Run original code ONLY — no CMPSBL overlay.
 * Use this when you want pure, unaugmented execution.
 */
export function executeNative(input: Record<string, unknown>): unknown {
  return executeOriginal(input);
}

export function validate(): boolean {
  const score: CJPIInput = { novelty: 80, utility: 75, complexity: 70, composability: 65 };
  const cjpi = computeCJPI(score);
  return tierFromCJPI(cjpi) === CAPABILITY_META.tier || cjpi > 0;
}
`;
  }

  if (lang === 'php') {
    return generatePhpCapabilitySource(cap, sourceFiles);
  }

  if (lang === 'python') {
    return generatePythonCapabilitySource(cap, sourceFiles);
  }

  // Other languages — structured metadata + dual-layer guidance
  return `${line} ═══════════════════════════════════════════════════════
${line}  Capability: ${cap.name}
${line}  CJPI: ${cap.cjpiScore} | Tier: ${cap.tier.toUpperCase()}
${line}  Chain: ${cap.chain.join(' → ')}
${line}  Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
${line}  Moat Signature: ${cap.moatSignature.slice(0, 8)}
${line} ═══════════════════════════════════════════════════════
${line}
${line}  DUAL-LAYER ARCHITECTURE:
${line}    Layer 1 — Native Execution: Your original code (in ../original/)
${line}    Layer 2 — Cognitive Overlay: CMPSBL enrichment pipeline
${line}
${line}  Runtime, Bridge, and Effects are ALL BUILT INTO the unified file (cmpsbl.*).
${line}  Import from cmpsbl.* directly — no separate runtime installation needed.
`;
}

// ═══ PHP CAPABILITY SOURCE (REAL EXECUTABLE) ═══

function generatePhpCapabilitySource(cap: CapabilityForExport, sourceFiles?: SourceFile[]): string {
  const phpFiles = (sourceFiles || []).filter(f => /\.php$/i.test(f.name));
  const requireLines = phpFiles.length > 0
    ? phpFiles.map(f => `require_once __DIR__ . '/../original/${f.name}';`).join('\n')
    : "// No PHP files detected in original/ — wire your require_once manually\n// require_once __DIR__ . '/../original/YourFile.php';";

  // Build the executeOriginal body
  const executeBody = phpFiles.length > 0
    ? (() => {
        // Try to find a class name from the first PHP file
        const firstName = phpFiles[0].name.replace(/\.php$/i, '');
        // Common PHP class naming: file TradeMatcher.php → class TradeMatcher
        return [
          `        // Auto-wired to: ${phpFiles.map(f => f.name).join(', ')}`,
          `        // Attempting to instantiate ${firstName} and call known entry points`,
          `        if (class_exists('${firstName}')) {`,
          `            $instance = new \\${firstName}();`,
          `            $methods = ['execute', 'run', 'handle', 'process', 'main', '__invoke'];`,
          `            foreach ($methods as $method) {`,
          `                if (method_exists($instance, $method)) {`,
          `                    return $instance->$method($input);`,
          `                }`,
          `            }`,
          `        }`,
          `        // No class found — try top-level functions`,
          `        $functions = ['execute', 'run', 'handle', 'process', 'main'];`,
          `        foreach ($functions as $fn) {`,
          `            if (function_exists($fn)) {`,
          `                return $fn($input);`,
          `            }`,
          `        }`,
          `        // Honest passthrough — no callable entry point found`,
          `        return $input;`,
        ].join('\n');
      })()
    : `        // Original files are in ../original/ — wire your require_once above\n        return $input;`;

  return `<?php
/**
 * ═══════════════════════════════════════════════════════
 *  CMPSBL® Capability: ${cap.name}
 *  CJPI: ${cap.cjpiScore} | Tier: ${cap.tier.toUpperCase()}
 *  Chain: ${cap.chain.join(' → ')}
 *  Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
 *  Moat Signature: ${cap.moatSignature.slice(0, 8)}
 * ═══════════════════════════════════════════════════════
 *
 *  DUAL-LAYER ARCHITECTURE:
 *    Layer 1 — Native Execution: Your original code runs first (unchanged)
 *    Layer 2 — Cognitive Overlay: CMPSBL observes, enriches, augments
 *
 *  Your original code is in the ../original/ folder.
 *
 *  Usage:
 *    require_once __DIR__ . '/${cap.name.toLowerCase()}.php';
 *    $cap = new CMPSBLCapability();
 *
 *    // Run with cognition (original + CMPSBL overlay)
 *    $result = $cap->execute(['key' => 'value']);
 *
 *    // Run original only (no CMPSBL overlay)
 *    $native = $cap->executeNative(['key' => 'value']);
 */

// Runtime is BUILT INTO the single-file distribution (cmpsbl.php).
// Use: require_once __DIR__ . '/../cmpsbl.php';
require_once __DIR__ . '/../cmpsbl.php';

// ═══ Layer 1 — Original Source Imports (auto-wired from ../original/) ═══
\${requireLines}

class CMPSBLCapability
{
    private array $meta;

    public function __construct(?string $manifestPath = null)
    {
        $this->meta = [
            'name'          => '${cap.name}',
            'cjpi'          => ${cap.cjpiScore},
            'tier'          => '${cap.tier}',
            'chain'         => ${JSON.stringify(cap.chain)},
            'fingerprint'   => '${cap.fingerprint}',
            'moatSignature' => '${cap.moatSignature}',
            'type'          => '${cap.capabilityType}',
        ];

        if ($manifestPath !== null && file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
            if (is_array($manifest)) {
                $this->meta = array_merge($this->meta, [
                    'modules'  => $manifest['modules'] ?? $this->meta['chain'],
                    'version'  => $manifest['version'] ?? '1.0.0',
                    'exported' => $manifest['exported'] ?? date('Y-m-d'),
                ]);
            }
        }

        $this->bridge = new CMPSBLRuntimeBridge($this->meta);
    }

    /**
     * Layer 1 — Execute your original code directly.
     * Auto-wired from ../original/ source files.
     *
     * @param  array $input
     * @return mixed  The raw result from your original code
     */
    public function executeOriginal(array $input = []): mixed
    {
${executeBody}
    }

    /**
     * Layer 1 only — Run original code with NO CMPSBL overlay.
     *
     * @param  array $input
     * @return mixed
     */
    public function executeNative(array $input = []): mixed
    {
        return $this->executeOriginal($input);
    }

    /**
     * Dual-layer execution — Original code FIRST, then CMPSBL cognitive overlay.
     * Flow: execute original → capture result → enrich with cognition
     *
     * @param  array $input  Arbitrary input data
     * @return array         Original result + CMPSBL cognitive enrichment
     */
    public function execute(array $input = []): array
    {
        $start = microtime(true);
        $originalExecuted = false;
        $originalError = null;

        // Layer 1: Run original code
        try {
            $originalResult = $this->executeOriginal($input);
            $originalExecuted = true;
        } catch (\\Throwable $e) {
            $originalError = $e->getMessage();
            $originalResult = $input; // Preserve input on failure
        }

        $executionMs = round((microtime(true) - $start) * 1000, 3);

        // Layer 2: CMPSBL cognitive overlay via pipeline
        $pipelineResult = $this->bridge->executePipeline(
            is_array($originalResult) ? $originalResult : ['_original_result' => $originalResult]
        );

        // Merge: original result is authoritative, pipeline adds cognition
        return array_merge(
            is_array($originalResult) ? $originalResult : ['_original_result' => $originalResult],
            ['_cmpsbl' => [
                'capability' => $this->meta['name'],
                'cjpi' => $this->meta['cjpi'],
                'tier' => $this->meta['tier'],
                'pipeline' => $pipelineResult['trace'] ?? [],
                'execution' => [
                    'original_executed' => $originalExecuted,
                    'original_error' => $originalError,
                    'execution_ms' => $executionMs,
                    'strategy' => $originalExecuted ? 'native' : 'passthrough',
                ],
            ]]
        );
    }

    public function validate(): bool
    {
        return $this->bridge->validateIntegrity();
    }

    public function getMeta(): array
    {
        return $this->meta;
    }
}
`;
}

function generatePythonCapabilitySource(cap: CapabilityForExport, sourceFiles?: SourceFile[]): string {
  const pyFiles = (sourceFiles || []).filter(f => /\.py$/i.test(f.name));
  const importLines = pyFiles.length > 0
    ? pyFiles.map(f => {
        const modName = f.name.replace(/\.py$/i, '');
        return `from original.${modName} import *  # Auto-wired from ../original/${f.name}`;
      }).join('\n')
    : '# No Python files detected in original/ — wire your imports manually\n# from original.your_file import YourClass';

  const executeBody = pyFiles.length > 0
    ? (() => {
        const firstName = pyFiles[0].name.replace(/\.py$/i, '');
        const className = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        return [
          `        # Auto-wired to: ${pyFiles.map(f => f.name).join(', ')}`,
          `        import sys, importlib`,
          `        mod = importlib.import_module('original.${firstName}')`,
          `        # Try class instantiation first`,
          `        for cls_name in ['${className}', '${firstName}']:`,
          `            cls = getattr(mod, cls_name, None)`,
          `            if cls and callable(cls):`,
          `                instance = cls()`,
          `                for method in ['execute', 'run', 'handle', 'process', 'main']:`,
          `                    fn = getattr(instance, method, None)`,
          `                    if callable(fn):`,
          `                        return fn(input_data)`,
          `        # Try top-level functions`,
          `        for fn_name in ['execute', 'run', 'handle', 'process', 'main']:`,
          `            fn = getattr(mod, fn_name, None)`,
          `            if callable(fn):`,
          `                return fn(input_data)`,
          `        # Honest passthrough — no callable entry point found`,
          `        return input_data or {}`,
        ].join('\n');
      })()
    : '        # Original files are in ../original/ — wire your imports above\n        return input_data or {}';

  return `"""
═══════════════════════════════════════════════════════
 CMPSBL® Capability: ${cap.name}
 CJPI: ${cap.cjpiScore} | Tier: ${cap.tier.toUpperCase()}
 Chain: ${cap.chain.join(' → ')}
 Fingerprint: ${cap.fingerprint.slice(0, 12).toUpperCase()}
 Moat Signature: ${cap.moatSignature.slice(0, 8)}
═══════════════════════════════════════════════════════

 DUAL-LAYER ARCHITECTURE:
   Layer 1 — Native Execution: Your original code runs first (unchanged)
   Layer 2 — Cognitive Overlay: CMPSBL observes, enriches, augments

 Your original code is in the ../original/ folder.

 Usage:
   from ${cap.name.toLowerCase()} import CMPSBLCapability
   cap = CMPSBLCapability()

   # Run with cognition (original + CMPSBL overlay)
   result = cap.execute({"key": "value"})

   # Run original only (no CMPSBL overlay)
   native = cap.execute_native({"key": "value"})
"""
import json
import os
import time
# Runtime is BUILT INTO the single-file distribution (cmpsbl.py).
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from cmpsbl import execute as cmpsbl_execute, execute_chain, compute_cjpi

# ═══ Layer 1 — Original Source Imports (auto-wired from ../original/) ═══
${importLines}

CAPABILITY_META = {
    "name": "${cap.name}",
    "cjpi": ${cap.cjpiScore},
    "tier": "${cap.tier}",
    "chain": ${JSON.stringify(cap.chain)},
    "fingerprint": "${cap.fingerprint}",
    "moatSignature": "${cap.moatSignature}",
    "type": "${cap.capabilityType}",
}


class CMPSBLCapability:
    def __init__(self, manifest_path: str = None):
        self.meta = dict(CAPABILITY_META)
        if manifest_path and os.path.exists(manifest_path):
            with open(manifest_path, "r") as f:
                manifest = json.load(f)
            self.meta["modules"] = manifest.get("modules", self.meta["chain"])
            self.meta["version"] = manifest.get("version", "1.0.0")
            self.meta["exported"] = manifest.get("exported", "")
        self.bridge = CMPSBLRuntimeBridge(self.meta)

    def execute_original(self, input_data: dict = None) -> any:
        """
        Layer 1 — Execute your original code directly.
        Auto-wired from ../original/ source files.
        """
${executeBody}

    def execute_native(self, input_data: dict = None) -> any:
        """Layer 1 only — Run original code with NO CMPSBL overlay."""
        return self.execute_original(input_data)

    def execute(self, input_data: dict = None) -> dict:
        """
        Dual-layer execution — Original code FIRST, then CMPSBL cognitive overlay.
        Flow: execute original → capture result → enrich with cognition
        """
        start = time.time()
        original_executed = False
        original_error = None

        # Layer 1: Run original code
        try:
            original_result = self.execute_original(input_data or {})
            original_executed = True
        except Exception as e:
            original_error = str(e)
            original_result = input_data or {}

        execution_ms = round((time.time() - start) * 1000, 3)

        # Layer 2: CMPSBL cognitive overlay via pipeline
        pipeline_input = original_result if isinstance(original_result, dict) else {"_original_result": original_result}
        pipeline_result = self.bridge.execute_pipeline(pipeline_input)

        # Merge: original result is authoritative, pipeline adds cognition
        base = original_result if isinstance(original_result, dict) else {"_original_result": original_result}
        return {
            **base,
            "_cmpsbl": {
                "capability": self.meta["name"],
                "cjpi": self.meta["cjpi"],
                "tier": self.meta["tier"],
                "pipeline": pipeline_result.get("trace", []),
                "execution": {
                    "original_executed": original_executed,
                    "original_error": original_error,
                    "execution_ms": execution_ms,
                    "strategy": "native" if original_executed else "passthrough",
                },
            },
        }

    def validate(self) -> bool:
        return self.bridge.validate_integrity()

    def get_meta(self) -> dict:
        return self.meta


if __name__ == "__main__":
    cap = CMPSBLCapability()
    result = cap.execute({"test": True})
    print(json.dumps(result, indent=2, default=str))
`;
}

function generateTestHarness(cap: CapabilityForExport, lang: string): string {
  const [line] = LANG_COMMENT[lang] || ['//', '/*'];

  if (lang === 'typescript') {
    return `${line} Test Harness for ${cap.name}
import { describe, it, expect } from 'vitest';
import { execute, executeNative, executeWithCognition, validate, CAPABILITY_META } from '../src/${cap.name.toLowerCase()}';

describe('${cap.name}', () => {
  it('should have correct metadata', () => {
    expect(CAPABILITY_META.cjpi).toBe(${cap.cjpiScore});
    expect(CAPABILITY_META.tier).toBe('${cap.tier}');
    expect(CAPABILITY_META.chain).toEqual(${JSON.stringify(cap.chain)});
  });

  it('should execute with cognition (dual-layer)', () => {
    const result = executeWithCognition({ test: true });
    expect(result._cmpsbl).toBeDefined();
    expect(result._cmpsbl.capability).toBe('${cap.name}');
    expect(result._cmpsbl.execution.strategy).toBeDefined();
  });

  it('should execute native (original only, no overlay)', () => {
    const result = executeNative({ test: true });
    ${line} Native execution should NOT contain _cmpsbl overlay
    expect(result).toBeDefined();
  });

  it('should default execute() to dual-layer mode', () => {
    const result = execute({ test: true });
    expect(result._cmpsbl).toBeDefined();
  });

  it('should validate structural integrity', () => {
    expect(validate()).toBe(true);
  });

  it('should preserve fingerprint identity', () => {
    expect(CAPABILITY_META.fingerprint).toBe('${cap.fingerprint}');
  });
});
`;
  }

  if (lang === 'php') {
    return `<?php
// Test Harness for ${cap.name}
// Run: php test/${cap.name.toLowerCase()}_test.php

require_once __DIR__ . '/../cmpsbl.php';
require_once __DIR__ . '/../src/${cap.name.toLowerCase()}.php';

function assert_true($condition, $msg) {
    if (!$condition) { echo "FAIL: $msg\\n"; exit(1); }
    echo "PASS: $msg\\n";
}

// Test 1: Metadata integrity
$cap = new CMPSBLCapability();
$meta = $cap->getMeta();
assert_true($meta['cjpi'] === ${cap.cjpiScore}, 'CJPI score matches');
assert_true($meta['tier'] === '${cap.tier}', 'Tier matches');
assert_true(count($meta['chain']) > 0, 'Chain is non-empty');

// Test 2: Execution produces output
$result = $cap->execute(['test' => true]);
assert_true($result['success'] === true, 'Execution succeeds');
assert_true(!empty($result['output']), 'Output is non-empty');
assert_true(!empty($result['trace']), 'Trace is non-empty');
assert_true($result['metadata']['capability'] === '${cap.name}', 'Capability name in metadata');

// Test 3: Trace has correct stage count
$chain = $meta['chain'];
assert_true(count($result['trace']) === count($chain), 'Trace stage count matches chain length');

// Test 4: Each trace entry has required fields
foreach ($result['trace'] as $entry) {
    assert_true(isset($entry['stage']), 'Trace entry has stage');
    assert_true(isset($entry['module']), 'Trace entry has module');
    assert_true(isset($entry['status']), 'Trace entry has status');
    assert_true(isset($entry['duration_ms']), 'Trace entry has duration_ms');
}

// Test 5: Structural validation
assert_true($cap->validate(), 'Structural validation passes');

echo "\\n✅ All tests passed for ${cap.name}\\n";
`;
  }

  if (lang === 'python') {
    return `"""Test Harness for ${cap.name}"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from cmpsbl import execute as cmpsbl_execute, compute_cjpi
from src.${cap.name.toLowerCase()} import CMPSBLCapability


def test_metadata():
    cap = CMPSBLCapability()
    meta = cap.get_meta()
    assert meta["cjpi"] == ${cap.cjpiScore}, f"CJPI mismatch: {meta['cjpi']}"
    assert meta["tier"] == "${cap.tier}", f"Tier mismatch: {meta['tier']}"
    assert len(meta["chain"]) > 0, "Chain is empty"
    print("PASS: metadata integrity")


def test_execution():
    cap = CMPSBLCapability()
    result = cap.execute({"test": True})
    assert result["success"] is True, "Execution failed"
    assert result["output"], "Output is empty"
    assert result["trace"], "Trace is empty"
    assert result["metadata"]["capability"] == "${cap.name}"
    print("PASS: execution produces output")


def test_trace_stages():
    cap = CMPSBLCapability()
    result = cap.execute({"test": True})
    chain = cap.get_meta()["chain"]
    assert len(result["trace"]) == len(chain), f"Trace count {len(result['trace'])} != chain {len(chain)}"
    for entry in result["trace"]:
        assert "stage" in entry
        assert "module" in entry
        assert "status" in entry
        assert "duration_ms" in entry
    print("PASS: trace stages correct")


def test_validation():
    cap = CMPSBLCapability()
    assert cap.validate(), "Validation failed"
    print("PASS: structural validation")


if __name__ == "__main__":
    test_metadata()
    test_execution()
    test_trace_stages()
    test_validation()
    print("\\n✅ All tests passed for ${cap.name}")
`;
  }

  return `${line} Test Harness for ${cap.name}
${line} Target: ${lang}
${line} Execute the capability and verify trace output.
${line} See PHP/Python/TypeScript test harnesses for reference.
`;
}

// ═══ RUNTIME BRIDGE GENERATORS — REMOVED ═══
// Bridge code is now built into the unified single file (cmpsbl.*).
// See src/lib/export/unified-capability-file.ts §3 for the bridge implementation.


function generateReadmeMd(options: ExportOptions): string {
  const { targetLanguage, capabilities, candidateName } = options;
  const topTier = capabilities.reduce((a, b) => a.cjpiScore > b.cjpiScore ? a : b);
  const totalValue = capabilities.reduce((sum, c) =>
    sum + estimateMarketValue(c.cjpiScore, c.category || 'general', c.chain.length), 0);

  return `# CMPSBL® Capability Pack — ${candidateName}

> **Generated by the Proprietary Evolution Lifecycle**
> Target: ${targetLanguage.toUpperCase()} | Capabilities: ${capabilities.length}
> Estimated Portfolio Value: ${formatMarketValue(totalValue)}

---

## 🎯 What This Is

This is a **Capability Pack** — a bundle of crystallized software capabilities discovered
through autonomous collision testing of your code against the CMPSBL® 40-primitive substrate matrix.

Each capability represents a unique behavioral pattern that emerged from the intersection
of your proprietary code and the substrate's cognitive architecture.

## 📦 Contents

| File | Purpose |
|------|---------|
| \`cmpsbl.*\` | **Single-file distribution** — Runtime + Effects + Bridge + API (drop-in) |
| \`src/\` | Per-capability source files with dual-layer architecture |
| \`test/\` | Auto-generated test harnesses |
| \`original/\` | Your original source files (unchanged) |
| \`manifest.json\` | Pack metadata and capability registry |
| \`LICENSE\` | CMPSBL® Software License (plain text) |
| \`LICENSE.html\` | CMPSBL® Software License (styled, printable) |
| \`README.html\` | This README (styled, printable) |
| \`PIPELINE-DETAILS.html\` | Per-capability technical dossier with valuation |

## ⚡ Quick Start

\`\`\`
// ONE FILE. Drop in, import, use.
// cmpsbl.ts contains everything: Runtime, Effects, Bridge, and your capabilities.

import { execute, executeChain, listCapabilities } from './cmpsbl';

// Execute a specific capability
const result = execute('my-capability', { query: 'hello' });

// Or run a raw module chain
const pipeline = executeChain(['DEFENSE', 'BRAIN', 'ORACLE'], { data: 123 });
\`\`\`

**How it works:**

1. **Everything is built into one file** — Mini-Runtime™, Module Effects, Pipeline Bridge are all embedded. No external runtime to install.
2. Call \`execute(name, input)\` — it runs YOUR code first, then the cognitive pipeline
3. Each module (${[...new Set(capabilities.flatMap(c => c.chain))].join(', ')}) transforms the execution context
4. You get back: \`{ _original, _enriched, _pipeline, _cmpsbl }\`

## 🏆 Capabilities (${capabilities.length})

| Capability | CJPI | Tier | Chain | Est. Value |
|------------|------|------|-------|------------|
${capabilities.map(c => {
  const val = estimateMarketValue(c.cjpiScore, c.category || 'general', c.chain.length);
  return `| ${c.name} | ${c.cjpiScore} | ${c.tier.toUpperCase()} | ${c.chain.join(' × ')} | ${formatMarketValue(val)} |`;
}).join('\n')}

## 🔬 Top Discovery

**${topTier.name}** — CJPI ${topTier.cjpiScore} (${topTier.tier.toUpperCase()})
- Chain: \`${topTier.chain.join(' → ')}\`
- Fingerprint: \`${topTier.fingerprint.slice(0, 12).toUpperCase()}\`

## 🚀 Single-File Architecture

Everything is **built into one file** (\`cmpsbl.*\`) — no external dependencies or runtime installation required:

- **§1 Mini-Runtime™** — CJPI scorer, Saga orchestrator, FSM engine, manifest parser, fingerprinting (BUILT-IN)
- **§2 Module Effects** — 40 primitive handlers, each transforms pipeline context (BUILT-IN)
- **§3 Runtime Bridge** — Pipeline executor with dependency ordering, trace & observability (BUILT-IN)
- **§4 Capability API** — \`execute()\`, \`executeChain()\`, \`validate()\`, \`selfTest()\`

> ⚠️ The Mini-Runtime™ is a sealed proprietary component embedded in this file.
> Extraction, redistribution, or decompilation is prohibited under the CMPSBL® Software License.

## 🔁 Recursive Evolution

Re-ingest this enhanced codebase into the Proprietary Evolution Lifecycle
to discover deeper capability chains. Each cycle compounds exclusivity.

## ⚠️ Honest Limitations

- This is a **v1 execution model** — sequential pipeline only, no async orchestration
- The runtime bridge is a **portable wrapper**, not the full substrate
- Module handlers implement **minimal behavioral contracts** — enough to be real, not enough to replace the full node
- For production substrate capabilities, use the CMPSBL platform directly

---

© 2025–2026 CMPSBL®. All rights reserved.
CMPSBL® and Mini-Runtime™ are trademarks of CMPSBL.
`;
}

function generateLicenseMd(): string {
  return `CMPSBL® SOFTWARE LICENSE
========================

Copyright (c) 2025–2026 CMPSBL®. All rights reserved.

This Capability Pack was generated by the CMPSBL® Proprietary Evolution Lifecycle.

GRANT OF LICENSE:
Subject to the terms of this license, you are granted a non-exclusive,
non-transferable license to use the enclosed software capabilities and
Mini-Runtime™ Engine in your own projects.

RESTRICTIONS:
1. You may not redistribute the Mini-Runtime™ Engine as a standalone product.
2. You may not reverse-engineer the discovery algorithms that produced these capabilities.
3. You may not claim independent creation of the capability patterns herein.
4. The Mini-Runtime™ Engine is a sealed proprietary component.
   Decompilation, modification, or extraction is prohibited.

PROPRIETARY NOTICE:
The structural fingerprints, moat signatures, and CJPI scores embedded in this
pack are the intellectual property of the originating substrate instance.

DISCLAIMER:
THIS SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.

CMPSBL® and Mini-Runtime™ are trademarks of CMPSBL.
`;
}

export async function generateCapabilityPackZip(options: ExportOptions): Promise<void> {
  const { targetLanguage, capabilities, candidateName, userSourceFiles, sourceLanguage } = options;
  const ext = LANG_EXT[targetLanguage] || '.ts';
  const zip = new JSZip();
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const packName = `cmpsbl-capability-pack-${candidateName.toLowerCase()}-${timestamp}`;

  // ═══ Unified Single-File Distribution ═══
  // ONE file containing: Mini-Runtime™ + Module Effects + Runtime Bridge + Capability API
  const unifiedCode = generateUnifiedCapabilityFile(capabilities, packName, targetLanguage, userSourceFiles);
  const unifiedFilename = getUnifiedFilename(targetLanguage);
  zip.file(unifiedFilename, unifiedCode);

  // src/ — Per-capability source files (for granular access)
  const srcFolder = zip.folder('src')!;
  for (const cap of capabilities) {
    srcFolder.file(`${cap.name.toLowerCase()}${ext}`, generateCapabilitySource(cap, targetLanguage, userSourceFiles));
  }

  const testFolder = zip.folder('test')!;
  for (const cap of capabilities) {
    testFolder.file(`${cap.name.toLowerCase()}_test${ext}`, generateTestHarness(cap, targetLanguage));
  }

  // original/ — User's original source files (included when exporting in source language)
  if (userSourceFiles && userSourceFiles.length > 0) {
    const originalFolder = zip.folder('original')!;
    for (const file of userSourceFiles) {
      originalFolder.file(file.name, file.content);
    }
    originalFolder.file('README.md', [
      `# Original Source — ${sourceLanguage || 'Developer Code'}`,
      '',
      `These are your original ${sourceLanguage || ''} source files — **the authoritative execution layer**.`,
      '',
      '## Dual-Layer Architecture',
      '',
      '```',
      'Layer 1 — Native Execution (this folder)',
      '  Your original code. Unchanged. Trusted. Deterministic.',
      '  This is the source of truth for all computation.',
      '',
      'Layer 2 — Cognitive Overlay (../src/ folder)',
      '  CMPSBL modules that observe, enrich, and augment.',
      '  Never substitutes your original logic.',
      '```',
      '',
      '## How to Use',
      '',
      '1. **Original only**: Import directly from this folder — runs your code with zero CMPSBL involvement',
      '2. **With cognition**: Use the `src/` capability files — they call YOUR code first, then add cognitive overlay',
      '3. **Inspect traces**: The `_cmpsbl` key in results shows what the cognitive layer observed',
      '',
      '## Files',
      '',
      ...userSourceFiles.map(f => `- **${f.name}** — ${f.language} (${f.content.length.toLocaleString()} chars)`),
      '',
      '---',
      '© Your original work. Cognitive overlay © 2025–2026 CMPSBL®.',
    ].join('\n'));
  }

  // manifest.json — CMPSBL manifest
  const avgCjpi = Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length);
  const totalValue = capabilities.reduce((sum, c) =>
    sum + estimateMarketValue(c.cjpiScore, c.category || 'general', c.chain.length), 0);

  zip.file('manifest.json', serializeCmpsblManifest({
    name: packName,
    cjpi: avgCjpi,
    modules: [...new Set(capabilities.flatMap(c => c.chain))],
    targets: [targetLanguage],
    version: '1.0.0',
    category: 'proprietary-evolution',
    fingerprint: capabilities[0]?.fingerprint?.slice(0, 12).toUpperCase(),
    source: 'proprietary-evolution-lifecycle',
  }));

  // LICENSE — Plain text + HTML
  const humanizedPackName = humanizeCapabilityName(candidateName, capabilities[0]?.chain, capabilities[0]?.category);
  zip.file('LICENSE', generateLicenseMd());
  zip.file('LICENSE.html', generateLicenseHTML(`Capability Pack — ${humanizedPackName}`));

  // README — Plain text + HTML
  zip.file('README.md', generateReadmeMd(options));
  zip.file('README.html', generateReadmeHTML({
    name: `Capability Pack — ${humanizedPackName}`,
    description: `${capabilities.length} crystallized capabilities discovered through autonomous collision testing against the CMPSBL® 40-primitive substrate matrix.`,
    files: [
      { name: unifiedFilename, purpose: 'Single-file distribution — Runtime + Effects + Bridge + API (drop-in)' },
      { name: 'src/', purpose: 'Per-capability source files with dual-layer architecture' },
      { name: 'test/', purpose: 'Auto-generated test harnesses' },
      { name: 'manifest.json', purpose: 'Pack metadata and capability registry' },
      { name: 'LICENSE.html', purpose: 'Commercial distribution license' },
      { name: 'PIPELINE-DETAILS.html', purpose: 'Per-capability valuation dossier' },
      { name: 'export-tier.json', purpose: 'Valuation summary' },
    ],
    quickStart: targetLanguage === 'php'
      ? `require_once '${unifiedFilename}';\\n$result = cmpsbl_execute('my-capability', ['key' => 'value']);`
      : targetLanguage === 'python'
      ? `from cmpsbl import execute\\nresult = execute('my-capability', {"key": "value"})`
      : `import { execute, executeChain } from './${unifiedFilename.replace(/\\.ts$/, '')}';\\nconst result = execute('my-capability', { key: 'value' });`,
    category: 'proprietary-evolution',
    modules: [...new Set(capabilities.flatMap(c => c.chain))],
    version: '1.0.0',
  }));

  // PIPELINE-DETAILS.html — Per-capability valuation & details
  for (const cap of capabilities) {
    const displayName = humanizeCapabilityName(cap.name, cap.chain, cap.category);
    const safeFilename = humanizeFilename(cap.name);
    const detailsHTML = generatePipelineDetailsHTML({
      name: displayName,
      description: cap.description || `Evolved capability: ${cap.chain.join(' → ')}`,
      category: cap.category || 'proprietary-evolution',
      score: cap.cjpiScore,
      tier: cap.tier || getTierFromScore(cap.cjpiScore),
      systemChain: cap.chain,
      fingerprint: cap.fingerprint,
      exportLanguages: [targetLanguage],
      obtainedAt: new Date().toISOString(),
      source: 'Proprietary Evolution Lifecycle',
    });
    zip.file(`${safeFilename}-PIPELINE-DETAILS.html`, detailsHTML);
  }

  // export-tier.json — Valuation summary
  zip.file('export-tier.json', JSON.stringify({
    pack: packName,
    averageScore: avgCjpi,
    averageTier: getTierFromScore(avgCjpi),
    capabilities: capabilities.map(c => ({
      name: c.name,
      score: c.cjpiScore,
      tier: c.tier,
      valuation: {
        estimated: estimateMarketValue(c.cjpiScore, c.category || 'general', c.chain.length),
        formatted: formatMarketValue(estimateMarketValue(c.cjpiScore, c.category || 'general', c.chain.length)),
        disclaimer: 'AI-generated estimate. Not financial advice.',
      },
    })),
    totalValuation: {
      estimated: totalValue,
      formatted: formatMarketValue(totalValue),
    },
  }, null, 2));

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  saveAs(blob, `${packName}.zip`);
}
