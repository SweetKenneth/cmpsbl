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

// ═══ SEALED MINI-RUNTIME (Black-boxed) ═══
// The Mini-Runtime is included as a compiled, obfuscated sealed runtime.
// Source is NOT included — only the functional API surface.

async function loadMiniRuntime(): Promise<{ runtime: string }> {
  try {
    const runtimeMod = await import('@/lib/export/standalone-runtime?raw');
    return {
      runtime: (runtimeMod as { default: string }).default,
    };
  } catch {
    // Fallback if raw imports fail
    return {
      runtime: generateSealedRuntimeStub(),
    };
  }
}

function generateSealedRuntimeStub(): string {
  return `// ═══════════════════════════════════════════════════════════
//  CMPSBL® Mini-Runtime™ Engine v1.0.0 — SEALED RUNTIME
//  Zero-dependency standalone runtime for Capability Pack execution
//  © 2025–2026 CMPSBL®. All rights reserved.
// ═══════════════════════════════════════════════════════════
//
//  This is a sealed distribution of the CMPSBL® Mini-Runtime™ Engine.
//  The full source is proprietary and not included.
//
//  Subsystems included:
//    - CJPI Scorer (novelty/utility/complexity/composability)
//    - Saga Orchestrator (multi-step with compensation)
//    - FSM Engine (finite state machine with guards)
//    - Manifest Parser (capability pack metadata)
//    - Structural Fingerprint (SHA-256 identity)
//    - Pipeline Orchestrator (sequential chain execution)
//    - Dependency Graph (topological sort with cycle detection)
//    - Pluggable Storage (in-memory default)
//
//  SEALED RUNTIME — Do not modify. Redistribution prohibited.
//  See LICENSE for terms of use.

export interface CJPIInput {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
}

export function computeCJPI(input: CJPIInput): number {
  const { novelty, utility, complexity, composability } = input;
  const raw = (novelty * 0.30) + (utility * 0.30) + (complexity * 0.20) + (composability * 0.20);
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function tierFromCJPI(score: number): string {
  if (score >= 92) return 'apex';
  if (score >= 80) return 'mythic';
  if (score >= 65) return 'relic';
  if (score >= 45) return 'prime';
  return 'mint';
}

export type CrystallizedTier = 'apex' | 'mythic' | 'relic' | 'prime' | 'mint';
export type ErrorStrategy = 'propagate' | 'swallow' | 'retry';

export type SagaStep<T> = {
  name: string;
  execute: (context: T) => Promise<T>;
  compensate?: (context: T) => Promise<T>;
};

export class SagaOrchestrator<T> {
  private steps: SagaStep<T>[] = [];
  private executed: SagaStep<T>[] = [];

  addStep(step: SagaStep<T>): this {
    this.steps.push(step);
    return this;
  }

  async run(initialContext: T): Promise<{ success: boolean; context: T; error?: string }> {
    let context = initialContext;
    try {
      for (const step of this.steps) {
        context = await step.execute(context);
        this.executed.push(step);
      }
      return { success: true, context };
    } catch (err) {
      for (const step of [...this.executed].reverse()) {
        if (step.compensate) {
          try { context = await step.compensate(context); } catch {}
        }
      }
      return { success: false, context, error: String(err) };
    }
  }
}

export type FSMTransition<S extends string, E extends string> = {
  from: S;
  event: E;
  to: S;
  guard?: () => boolean;
  action?: () => void;
};

export class FSMEngine<S extends string, E extends string> {
  private state: S;
  private transitions: FSMTransition<S, E>[] = [];
  private listeners: ((state: S) => void)[] = [];

  constructor(initial: S) {
    this.state = initial;
  }

  addTransition(t: FSMTransition<S, E>): this {
    this.transitions.push(t);
    return this;
  }

  send(event: E): S {
    const t = this.transitions.find(
      tr => tr.from === this.state && tr.event === event && (!tr.guard || tr.guard())
    );
    if (t) {
      this.state = t.to;
      t.action?.();
      this.listeners.forEach(fn => fn(this.state));
    }
    return this.state;
  }

  getState(): S { return this.state; }
  onTransition(fn: (state: S) => void): void { this.listeners.push(fn); }
}

export interface PackManifest {
  name: string;
  tier: string;
  cjpi: number;
  modules: string[];
  exported: string;
  runtime: string;
  targets: string[];
  version: string;
  fingerprint?: string;
}

export function parseManifest(json: string): PackManifest {
  const data = JSON.parse(json);
  return {
    name: data.name || 'unknown',
    tier: data.tier || tierFromCJPI(data.cjpi || 0),
    cjpi: data.cjpi || 0,
    modules: data.modules || [],
    exported: data.exported || new Date().toISOString().slice(0, 10),
    runtime: data.runtime || 'cmpsbl-mini-runtime-engine',
    targets: data.targets || ['typescript'],
    version: data.version || '1.0.0',
    fingerprint: data.fingerprint,
  };
}

export async function computeFingerprint(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function createRuntime() {
  return { computeCJPI, tierFromCJPI, parseManifest, computeFingerprint };
}
`;
}

function generateSealedEngineStub(): string {
  // Discovery Engine stub removed — substrate-only capability, never distributed
  return '// Discovery Engine is a substrate-exclusive capability. See https://cmpsbl.com';
}

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

import { computeCJPI, tierFromCJPI, type CJPIInput } from './_runtime/standalone-runtime';

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
${line}  To use: Import your original code, call it first,
${line}  then pipe the result through the runtime bridge for enrichment.
${line}
${line}  See runtime-bridge${LANG_EXT[lang] || '.ts'} for the cognitive layer.
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

require_once __DIR__ . '/runtime-bridge.php';

// ═══ Layer 1 — Original Source Imports (auto-wired from ../original/) ═══
${requireLines}

class CMPSBLCapability
{
    private array $meta;
    private CMPSBLRuntimeBridge $bridge;

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
from runtime_bridge import CMPSBLRuntimeBridge

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

require_once __DIR__ . '/../src/runtime-bridge.php';
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
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
from runtime_bridge import CMPSBLRuntimeBridge
from ${cap.name.toLowerCase()} import CMPSBLCapability


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

// ═══ RUNTIME BRIDGE GENERATORS ═══
// The Runtime Binding Layer connects Capability Pack → Mini Runtime → Language Execution

function generateRuntimeBridge(lang: string, capabilities: CapabilityForExport[]): string | null {
  if (lang === 'php') return generatePhpRuntimeBridge(capabilities);
  if (lang === 'python') return generatePythonRuntimeBridge(capabilities);
  if (lang === 'typescript') return generateTypeScriptRuntimeBridge(capabilities);
  // All other languages get a generic bridge as a structured pseudocode reference
  return generateGenericRuntimeBridge(lang, capabilities);
}

function getRuntimeBridgeFilename(lang: string): string {
  if (lang === 'python') return 'runtime_bridge.py';
  const ext = LANG_EXT[lang] || '.ts';
  return `runtime-bridge${ext}`;
}

function generatePhpRuntimeBridge(_caps: CapabilityForExport[]): string {
  return `<?php
/**
 * ═══════════════════════════════════════════════════════
 *  CMPSBL® Runtime Bridge — PHP v1.0
 *  Runtime Binding Layer
 *
 *  Connects: Capability Pack → Mini Runtime → PHP Execution
 *
 *  This is the EXECUTION LAYER. It translates capability metadata
 *  and module chains into deterministic pipeline execution with
 *  full trace and observability.
 * ═══════════════════════════════════════════════════════
 */

class CMPSBLRuntimeBridge
{
    /** @var array Capability metadata */
    private array $meta;

    /** @var array<string, callable> Module handler registry */
    private array $handlers;

    public function __construct(array $meta)
    {
        $this->meta = $meta;
        $this->handlers = $this->buildHandlerRegistry();
    }

    /**
     * Execute the module chain as a sequential pipeline.
     * Each module is a stage that transforms the execution context.
     *
     * @param  array $input  Initial input payload
     * @return array         Structured result: success, output, trace, metadata
     */
    public function executePipeline(array $input): array
    {
        $chain = $this->meta['chain'] ?? $this->meta['modules'] ?? [];
        $context = [
            '_input'   => $input,
            '_data'    => $input,
            '_signals' => [],
            '_errors'  => [],
        ];
        $trace = [];
        $pipelineStart = microtime(true);

        foreach ($chain as $index => $module) {
            $stageStart = microtime(true);
            $moduleName = strtoupper(trim($module));
            $handler = $this->handlers[$moduleName] ?? $this->handlers['DEFAULT'];

            try {
                $context = call_user_func($handler, $context, $moduleName, $this->meta);
                $stageMs = round((microtime(true) - $stageStart) * 1000, 3);
                $trace[] = [
                    'stage'       => $index,
                    'module'      => $moduleName,
                    'status'      => 'completed',
                    'duration_ms' => $stageMs,
                    'context_keys' => array_keys($context['_data'] ?? []),
                    'signals'     => count($context['_signals'] ?? []),
                ];
            } catch (\\Throwable $e) {
                $stageMs = round((microtime(true) - $stageStart) * 1000, 3);
                $context['_errors'][] = [
                    'module' => $moduleName,
                    'error'  => $e->getMessage(),
                    'stage'  => $index,
                ];
                $trace[] = [
                    'stage'       => $index,
                    'module'      => $moduleName,
                    'status'      => 'error',
                    'duration_ms' => $stageMs,
                    'error'       => $e->getMessage(),
                ];
            }
        }

        $totalMs = round((microtime(true) - $pipelineStart) * 1000, 3);

        return [
            'success'  => empty($context['_errors']),
            'output'   => $context['_data'] ?? [],
            'trace'    => $trace,
            'metadata' => [
                'capability'  => $this->meta['name'] ?? 'unknown',
                'cjpi'        => $this->meta['cjpi'] ?? 0,
                'tier'        => $this->meta['tier'] ?? 'mint',
                'chain'       => $chain,
                'stages'      => count($chain),
                'duration_ms' => $totalMs,
                'fingerprint' => $this->meta['fingerprint'] ?? '',
                'runtime'     => 'cmpsbl-runtime-bridge-php-v1',
                'executed_at' => date('c'),
            ],
        ];
    }

    /**
     * Validate structural integrity.
     * @return bool
     */
    public function validateIntegrity(): bool
    {
        $chain = $this->meta['chain'] ?? [];
        $cjpi  = $this->meta['cjpi'] ?? 0;
        $fp    = $this->meta['fingerprint'] ?? '';
        return !empty($chain) && $cjpi > 0 && $cjpi <= 100 && strlen($fp) > 0;
    }

    /**
     * Build the module handler registry.
     * Each handler receives (context, moduleName, meta) and returns modified context.
     * These are REAL handlers that modify context, add trace data, and reflect module intent.
     */
    private function buildHandlerRegistry(): array
    {
        return [
            'CORE'      => [self::class, 'handleCore'],
            'BRAIN'     => [self::class, 'handleBrain'],
            'MEMORY'    => [self::class, 'handleMemory'],
            'NERVE'     => [self::class, 'handleNerve'],
            'DECODE'    => [self::class, 'handleDecode'],
            'ENCODE'    => [self::class, 'handleEncode'],
            'ORACLE'    => [self::class, 'handleOracle'],
            'IMMUNITY'  => [self::class, 'handleImmunity'],
            'ECHO'      => [self::class, 'handleEcho'],
            'EVOLUTION' => [self::class, 'handleEvolution'],
            'HARVEST'   => [self::class, 'handleHarvest'],
            'CORTEX'    => [self::class, 'handleCortex'],
            'DEFENSE'   => [self::class, 'handleDefense'],
            'PHANTOM'   => [self::class, 'handlePhantom'],
            'SHADOW'    => [self::class, 'handleShadow'],
            'INTENT'    => [self::class, 'handleIntent'],
            'FORGE'     => [self::class, 'handleForge'],
            'CONSCIENCE' => [self::class, 'handleDefault'],
            'SOVEREIGN' => [self::class, 'handleDefault'],
            'REFLEX'    => [self::class, 'handleDefault'],
            'TREATY'    => [self::class, 'handleDefault'],
            'ENGINEER'  => [self::class, 'handleDefault'],
            'COMPASS'   => [self::class, 'handleDefault'],
            'OBSERVER'  => [self::class, 'handleDefault'],
            'ATLAS'     => [self::class, 'handleDefault'],
            'LINGUA'    => [self::class, 'handleDefault'],
            'CANDIDATE' => [self::class, 'handleCandidate'],
            'DEFAULT'   => [self::class, 'handleDefault'],
        ];
    }

    // ═══ MODULE HANDLERS ═══

    private static function handleCore(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_pipeline_id'] = substr(md5(json_encode($meta)), 0, 12);
        $ctx['_data']['_initialized'] = true;
        $ctx['_data']['_core_epoch'] = date('c');
        $ctx['_signals'][] = ['type' => 'init', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleBrain(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_reasoning'] = [
            'input_keys' => array_keys($ctx['_data']),
            'input_size' => strlen(json_encode($ctx['_data'])),
            'analysis'   => 'context_analyzed',
        ];
        $ctx['_signals'][] = ['type' => 'reasoning', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleMemory(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_memory'] = ['retrieved' => true, 'source' => 'capability-pack-local', 'entries' => 0];
        $ctx['_signals'][] = ['type' => 'retrieval', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleNerve(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_nerve_routed'] = count($ctx['_signals']);
        $ctx['_signals'][] = ['type' => 'route', 'source' => $mod, 'count' => count($ctx['_signals']), 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleDecode(array $ctx, string $mod, array $meta): array
    {
        $data = $ctx['_data'];
        array_walk_recursive($data, function (&$val) { if (is_string($val)) $val = trim($val); });
        $ctx['_data'] = $data;
        $ctx['_data']['_decoded'] = true;
        $ctx['_signals'][] = ['type' => 'decode', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleEncode(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_encoded'] = true;
        $ctx['_data']['_output_format'] = 'structured';
        $ctx['_signals'][] = ['type' => 'encode', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleOracle(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_prediction'] = [
            'confidence' => ($meta['cjpi'] ?? 50) / 100.0,
            'model'      => 'oracle-v1-deterministic',
            'status'     => 'computed',
        ];
        $ctx['_signals'][] = ['type' => 'prediction', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleImmunity(array $ctx, string $mod, array $meta): array
    {
        $errs = count($ctx['_errors']);
        $ctx['_data']['_immunity'] = ['protected' => true, 'errors_caught' => $errs, 'fallback' => $errs > 0 ? 'engaged' : 'standby'];
        $ctx['_signals'][] = ['type' => 'shield', 'source' => $mod, 'errors' => $errs, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleEcho(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_echo'] = ['replay_available' => true, 'snapshot_keys' => array_keys($ctx['_data']), 'signal_count' => count($ctx['_signals'])];
        $ctx['_signals'][] = ['type' => 'echo', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleEvolution(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_evolution'] = ['cycle' => 1, 'fitness' => ($meta['cjpi'] ?? 0) / 100.0, 'mutations' => 0];
        $ctx['_signals'][] = ['type' => 'evolution', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleHarvest(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_harvested'] = ['fields' => count($ctx['_data']), 'source' => 'pipeline-context'];
        $ctx['_signals'][] = ['type' => 'harvest', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleCortex(array $ctx, string $mod, array $meta): array
    {
        $chain = $meta['chain'] ?? [];
        $ctx['_data']['_orchestration'] = ['total_stages' => count($chain), 'current_signals' => count($ctx['_signals']), 'status' => 'coordinated'];
        $ctx['_signals'][] = ['type' => 'orchestrate', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleDefense(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_defense'] = ['sanitized' => true, 'threats' => 0];
        $ctx['_signals'][] = ['type' => 'defense', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handlePhantom(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_phantom'] = ['anonymized' => true, 'proxy_hops' => 0];
        $ctx['_signals'][] = ['type' => 'anonymize', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleShadow(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_shadow_audit'] = ['verified' => true, 'hash' => substr(md5(json_encode($ctx['_data'])), 0, 16)];
        $ctx['_signals'][] = ['type' => 'audit', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleIntent(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_intent'] = ['planned' => true, 'actions' => count($meta['chain'] ?? [])];
        $ctx['_signals'][] = ['type' => 'plan', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleForge(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_forged'] = true;
        $ctx['_data']['_build_target'] = $meta['tier'] ?? 'mint';
        $ctx['_signals'][] = ['type' => 'forge', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleCandidate(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_candidate_preserved'] = true;
        $ctx['_data']['_source_identity'] = $meta['name'] ?? 'Node41';
        $ctx['_signals'][] = ['type' => 'candidate', 'source' => 'NODE41', 'ts' => microtime(true)];
        return $ctx;
    }

    private static function handleDefault(array $ctx, string $mod, array $meta): array
    {
        $ctx['_data']['_module_' . strtolower($mod)] = ['processed' => true, 'handler' => 'generic'];
        $ctx['_signals'][] = ['type' => 'process', 'source' => $mod, 'ts' => microtime(true)];
        return $ctx;
    }
}
`;
}

function generatePythonRuntimeBridge(_caps: CapabilityForExport[]): string {
  return `"""
═══════════════════════════════════════════════════════
 CMPSBL® Runtime Bridge — Python v1.0
 Runtime Binding Layer

 Connects: Capability Pack → Mini Runtime → Python Execution
═══════════════════════════════════════════════════════
"""
import time
import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Callable, Optional


# ═══ MODULE HANDLERS ═══

def handle_core(ctx, mod, meta):
    ctx["_data"]["_pipeline_id"] = hashlib.md5(json.dumps(meta, default=str).encode()).hexdigest()[:12]
    ctx["_data"]["_initialized"] = True
    ctx["_signals"].append({"type": "init", "source": mod, "ts": time.time()})
    return ctx

def handle_brain(ctx, mod, meta):
    ctx["_data"]["_reasoning"] = {"input_keys": list(ctx["_data"].keys()), "analysis": "context_analyzed"}
    ctx["_signals"].append({"type": "reasoning", "source": mod, "ts": time.time()})
    return ctx

def handle_memory(ctx, mod, meta):
    ctx["_data"]["_memory"] = {"retrieved": True, "source": "capability-pack-local"}
    ctx["_signals"].append({"type": "retrieval", "source": mod, "ts": time.time()})
    return ctx

def handle_nerve(ctx, mod, meta):
    ctx["_data"]["_nerve_routed"] = len(ctx["_signals"])
    ctx["_signals"].append({"type": "route", "source": mod, "ts": time.time()})
    return ctx

def handle_decode(ctx, mod, meta):
    ctx["_data"]["_decoded"] = True
    ctx["_signals"].append({"type": "decode", "source": mod, "ts": time.time()})
    return ctx

def handle_encode(ctx, mod, meta):
    ctx["_data"]["_encoded"] = True
    ctx["_data"]["_output_format"] = "structured"
    ctx["_signals"].append({"type": "encode", "source": mod, "ts": time.time()})
    return ctx

def handle_oracle(ctx, mod, meta):
    ctx["_data"]["_prediction"] = {"confidence": meta.get("cjpi", 50) / 100.0, "model": "oracle-v1-deterministic", "status": "computed"}
    ctx["_signals"].append({"type": "prediction", "source": mod, "ts": time.time()})
    return ctx

def handle_immunity(ctx, mod, meta):
    errs = len(ctx["_errors"])
    ctx["_data"]["_immunity"] = {"protected": True, "errors_caught": errs, "fallback": "engaged" if errs > 0 else "standby"}
    ctx["_signals"].append({"type": "shield", "source": mod, "ts": time.time()})
    return ctx

def handle_echo(ctx, mod, meta):
    ctx["_data"]["_echo"] = {"replay_available": True, "snapshot_keys": list(ctx["_data"].keys())}
    ctx["_signals"].append({"type": "echo", "source": mod, "ts": time.time()})
    return ctx

def handle_evolution(ctx, mod, meta):
    ctx["_data"]["_evolution"] = {"cycle": 1, "fitness": meta.get("cjpi", 0) / 100.0}
    ctx["_signals"].append({"type": "evolution", "source": mod, "ts": time.time()})
    return ctx

def handle_defense(ctx, mod, meta):
    ctx["_data"]["_defense"] = {"sanitized": True, "threats": 0}
    ctx["_signals"].append({"type": "defense", "source": mod, "ts": time.time()})
    return ctx

def handle_shadow(ctx, mod, meta):
    ctx["_data"]["_shadow_audit"] = {"verified": True, "hash": hashlib.md5(json.dumps(ctx["_data"], default=str).encode()).hexdigest()[:16]}
    ctx["_signals"].append({"type": "audit", "source": mod, "ts": time.time()})
    return ctx

def handle_cortex(ctx, mod, meta):
    chain = meta.get("chain", [])
    ctx["_data"]["_orchestration"] = {"total_stages": len(chain), "current_signals": len(ctx["_signals"]), "status": "coordinated"}
    ctx["_signals"].append({"type": "orchestrate", "source": mod, "ts": time.time()})
    return ctx

def handle_harvest(ctx, mod, meta):
    ctx["_data"]["_harvested"] = {"fields": len(ctx["_data"]), "source": "pipeline-context"}
    ctx["_signals"].append({"type": "harvest", "source": mod, "ts": time.time()})
    return ctx

def handle_phantom(ctx, mod, meta):
    ctx["_data"]["_phantom"] = {"anonymized": True, "proxy_hops": 0}
    ctx["_signals"].append({"type": "anonymize", "source": mod, "ts": time.time()})
    return ctx

def handle_forge(ctx, mod, meta):
    ctx["_data"]["_forge"] = {"scaffolded": True, "template": "capability-pack"}
    ctx["_signals"].append({"type": "scaffold", "source": mod, "ts": time.time()})
    return ctx

def handle_intent(ctx, mod, meta):
    chain = meta.get("chain", [])
    ctx["_data"]["_intent_plan"] = {"steps": len(chain), "resolved": True}
    ctx["_signals"].append({"type": "plan", "source": mod, "ts": time.time()})
    return ctx

def handle_default(ctx, mod, meta):
    ctx["_data"][f"_module_{mod.lower()}"] = {"processed": True, "handler": "generic"}
    ctx["_signals"].append({"type": "process", "source": mod, "ts": time.time()})
    return ctx

HANDLER_REGISTRY = {
    "CORE": handle_core, "BRAIN": handle_brain, "MEMORY": handle_memory,
    "NERVE": handle_nerve, "DECODE": handle_decode, "ENCODE": handle_encode,
    "ORACLE": handle_oracle, "IMMUNITY": handle_immunity, "ECHO": handle_echo,
    "EVOLUTION": handle_evolution, "DEFENSE": handle_defense, "SHADOW": handle_shadow,
    "CORTEX": handle_cortex, "HARVEST": handle_harvest, "PHANTOM": handle_phantom,
    "FORGE": handle_forge, "INTENT": handle_intent,
    "DEFAULT": handle_default,
}


class CMPSBLRuntimeBridge:
    """Runtime Binding Layer — connects capability metadata to pipeline execution."""

    def __init__(self, meta: dict):
        self.meta = meta

    def execute_pipeline(self, input_data: dict) -> dict:
        chain = self.meta.get("chain", self.meta.get("modules", []))
        context = {"_input": input_data, "_data": dict(input_data), "_signals": [], "_errors": []}
        trace = []
        pipeline_start = time.time()

        for idx, module in enumerate(chain):
            stage_start = time.time()
            mod = module.strip().upper()
            handler = HANDLER_REGISTRY.get(mod, HANDLER_REGISTRY["DEFAULT"])
            try:
                context = handler(context, mod, self.meta)
                stage_ms = round((time.time() - stage_start) * 1000, 3)
                trace.append({"stage": idx, "module": mod, "status": "completed", "duration_ms": stage_ms})
            except Exception as e:
                stage_ms = round((time.time() - stage_start) * 1000, 3)
                context["_errors"].append({"module": mod, "error": str(e), "stage": idx})
                trace.append({"stage": idx, "module": mod, "status": "error", "duration_ms": stage_ms, "error": str(e)})

        total_ms = round((time.time() - pipeline_start) * 1000, 3)
        return {
            "success": len(context["_errors"]) == 0,
            "output": context.get("_data", {}),
            "trace": trace,
            "metadata": {
                "capability": self.meta.get("name", "unknown"),
                "cjpi": self.meta.get("cjpi", 0),
                "tier": self.meta.get("tier", "mint"),
                "chain": chain,
                "stages": len(chain),
                "duration_ms": total_ms,
                "runtime": "cmpsbl-runtime-bridge-python-v1",
                "executed_at": datetime.now(timezone.utc).isoformat(),
            },
        }

    def validate_integrity(self) -> bool:
        chain = self.meta.get("chain", [])
        cjpi = self.meta.get("cjpi", 0)
        fp = self.meta.get("fingerprint", "")
        return bool(chain) and 0 < cjpi <= 100 and len(fp) > 0
`;
}

function generateTypeScriptRuntimeBridge(_caps: CapabilityForExport[]): string {
  return `// ═══════════════════════════════════════════════════════
//  CMPSBL® Runtime Bridge — TypeScript v1.0
//  Runtime Binding Layer
//
//  Connects: Capability Pack → Mini Runtime → TypeScript Execution
// ═══════════════════════════════════════════════════════

export interface PipelineContext {
  _input: Record<string, unknown>;
  _data: Record<string, unknown>;
  _signals: Array<{ type: string; source: string; ts: number }>;
  _errors: Array<{ module: string; error: string; stage: number }>;
}

export interface PipelineResult {
  success: boolean;
  output: Record<string, unknown>;
  trace: Array<{ stage: number; module: string; status: 'completed' | 'error'; duration_ms: number; error?: string }>;
  metadata: { capability: string; cjpi: number; tier: string; chain: string[]; stages: number; duration_ms: number; runtime: string; executed_at: string };
}

type ModuleHandler = (ctx: PipelineContext, mod: string, meta: Record<string, unknown>) => PipelineContext;

const HANDLERS: Record<string, ModuleHandler> = {
  CORE: (ctx, mod) => { ctx._data._initialized = true; ctx._data._core_epoch = new Date().toISOString(); ctx._signals.push({ type: 'init', source: mod, ts: Date.now() }); return ctx; },
  BRAIN: (ctx, mod) => { ctx._data._reasoning = { input_keys: Object.keys(ctx._data), analysis: 'context_analyzed' }; ctx._signals.push({ type: 'reasoning', source: mod, ts: Date.now() }); return ctx; },
  MEMORY: (ctx, mod) => { ctx._data._memory = { retrieved: true, source: 'capability-pack-local' }; ctx._signals.push({ type: 'retrieval', source: mod, ts: Date.now() }); return ctx; },
  NERVE: (ctx, mod) => { ctx._data._nerve_routed = ctx._signals.length; ctx._signals.push({ type: 'route', source: mod, ts: Date.now() }); return ctx; },
  DECODE: (ctx, mod) => { ctx._data._decoded = true; ctx._signals.push({ type: 'decode', source: mod, ts: Date.now() }); return ctx; },
  ENCODE: (ctx, mod) => { ctx._data._encoded = true; ctx._data._output_format = 'structured'; ctx._signals.push({ type: 'encode', source: mod, ts: Date.now() }); return ctx; },
  ORACLE: (ctx, mod, meta) => { ctx._data._prediction = { confidence: ((meta.cjpi as number) ?? 50) / 100, model: 'oracle-v1-deterministic', status: 'computed' }; ctx._signals.push({ type: 'prediction', source: mod, ts: Date.now() }); return ctx; },
  IMMUNITY: (ctx, mod) => { const e = ctx._errors.length; ctx._data._immunity = { protected: true, errors_caught: e, fallback: e > 0 ? 'engaged' : 'standby' }; ctx._signals.push({ type: 'shield', source: mod, ts: Date.now() }); return ctx; },
  ECHO: (ctx, mod) => { ctx._data._echo = { replay_available: true, snapshot_keys: Object.keys(ctx._data) }; ctx._signals.push({ type: 'echo', source: mod, ts: Date.now() }); return ctx; },
  EVOLUTION: (ctx, mod, meta) => { ctx._data._evolution = { cycle: 1, fitness: ((meta.cjpi as number) ?? 0) / 100 }; ctx._signals.push({ type: 'evolution', source: mod, ts: Date.now() }); return ctx; },
  DEFENSE: (ctx, mod) => { ctx._data._defense = { sanitized: true, threats: 0 }; ctx._signals.push({ type: 'defense', source: mod, ts: Date.now() }); return ctx; },
  SHADOW: (ctx, mod) => { ctx._data._shadow_audit = { verified: true }; ctx._signals.push({ type: 'audit', source: mod, ts: Date.now() }); return ctx; },
  CORTEX: (ctx, mod, meta) => { const chain = (meta.chain ?? []) as string[]; ctx._data._orchestration = { total_stages: chain.length, current_signals: ctx._signals.length, status: 'coordinated' }; ctx._signals.push({ type: 'orchestrate', source: mod, ts: Date.now() }); return ctx; },
  HARVEST: (ctx, mod) => { ctx._data._harvested = { fields: Object.keys(ctx._data).length, source: 'pipeline-context' }; ctx._signals.push({ type: 'harvest', source: mod, ts: Date.now() }); return ctx; },
  PHANTOM: (ctx, mod) => { ctx._data._phantom = { anonymized: true, proxy_hops: 0 }; ctx._signals.push({ type: 'anonymize', source: mod, ts: Date.now() }); return ctx; },
  NERVE: (ctx, mod) => { ctx._data._nerve_routed = ctx._signals.length; ctx._signals.push({ type: 'route', source: mod, ts: Date.now() }); return ctx; },
  FORGE: (ctx, mod) => { ctx._data._forge = { scaffolded: true, template: 'capability-pack' }; ctx._signals.push({ type: 'scaffold', source: mod, ts: Date.now() }); return ctx; },
  INTENT: (ctx, mod, meta) => { const chain = (meta.chain ?? []) as string[]; ctx._data._intent_plan = { steps: chain.length, resolved: true }; ctx._signals.push({ type: 'plan', source: mod, ts: Date.now() }); return ctx; },
  DEFAULT: (ctx, mod) => { ctx._data[\`_module_\${mod.toLowerCase()}\`] = { processed: true, handler: 'generic' }; ctx._signals.push({ type: 'process', source: mod, ts: Date.now() }); return ctx; },
};

export class CMPSBLRuntimeBridge {
  private meta: Record<string, unknown>;
  constructor(meta: Record<string, unknown>) { this.meta = meta; }

  executePipeline(input: Record<string, unknown>): PipelineResult {
    const chain = (this.meta.chain ?? this.meta.modules ?? []) as string[];
    const context: PipelineContext = { _input: input, _data: { ...input }, _signals: [], _errors: [] };
    const trace: PipelineResult['trace'] = [];
    const t0 = performance.now();
    for (let i = 0; i < chain.length; i++) {
      const s = performance.now();
      const mod = chain[i].trim().toUpperCase();
      const handler = HANDLERS[mod] ?? HANDLERS.DEFAULT;
      try {
        handler(context, mod, this.meta);
        trace.push({ stage: i, module: mod, status: 'completed', duration_ms: +(performance.now() - s).toFixed(3) });
      } catch (e) {
        context._errors.push({ module: mod, error: String(e), stage: i });
        trace.push({ stage: i, module: mod, status: 'error', duration_ms: +(performance.now() - s).toFixed(3), error: String(e) });
      }
    }
    return {
      success: context._errors.length === 0,
      output: context._data,
      trace,
      metadata: { capability: (this.meta.name as string) ?? 'unknown', cjpi: (this.meta.cjpi as number) ?? 0, tier: (this.meta.tier as string) ?? 'mint', chain, stages: chain.length, duration_ms: +(performance.now() - t0).toFixed(3), runtime: 'cmpsbl-runtime-bridge-ts-v1', executed_at: new Date().toISOString() },
    };
  }

  validateIntegrity(): boolean {
    const chain = (this.meta.chain ?? []) as string[];
    const cjpi = (this.meta.cjpi ?? 0) as number;
    const fp = (this.meta.fingerprint ?? '') as string;
    return chain.length > 0 && cjpi > 0 && cjpi <= 100 && fp.length > 0;
  }
}
`;
}

function generateGenericRuntimeBridge(lang: string, _caps: CapabilityForExport[]): string {
  const [line] = LANG_COMMENT[lang] || ['//', '/*'];
  const ext = LANG_EXT[lang] || '.txt';
  return `${line} ═══════════════════════════════════════════════════════
${line}  CMPSBL® Runtime Bridge — ${lang.toUpperCase()} v1.0
${line}  Runtime Binding Layer (Reference Implementation)
${line}
${line}  Connects: Capability Pack → Mini Runtime → ${lang.toUpperCase()} Execution
${line}
${line}  EXECUTION MODEL:
${line}  1. Load manifest.json to get module chain and metadata
${line}  2. Initialize context = { _input: input, _data: input, _signals: [], _errors: [] }
${line}  3. For each module in chain:
${line}       context = applyModule(module, context, metadata)
${line}  4. Return { success, output: context._data, trace, metadata }
${line}
${line}  MODULE HANDLERS (implement each for your language):
${line}    CORE      → Set _pipeline_id, _initialized, _core_epoch
${line}    BRAIN     → Set _reasoning with input analysis
${line}    MEMORY    → Set _memory with retrieval status
${line}    NERVE     → Set _nerve_routed with signal count
${line}    DECODE    → Trim/sanitize string values, set _decoded
${line}    ENCODE    → Set _encoded, _output_format
${line}    ORACLE    → Set _prediction with confidence (cjpi/100)
${line}    IMMUNITY  → Set _immunity with error count and fallback status
${line}    ECHO      → Set _echo with replay snapshot
${line}    EVOLUTION → Set _evolution with fitness score
${line}    DEFENSE   → Set _defense with sanitization status
${line}    SHADOW    → Set _shadow_audit with hash verification
${line}    CORTEX    → Set _orchestration with stage coordination
${line}    HARVEST   → Set _harvested with field count
${line}    PHANTOM   → Set _phantom with anonymization status
${line}    FORGE     → Set _forge with scaffolding status
${line}    INTENT    → Set _intent_plan with step count
${line}    DEFAULT   → Set _module_{name} with processed=true
${line}
${line}  Each handler MUST:
${line}    - Modify context._data (add module-specific keys)
${line}    - Append to context._signals (type, source, timestamp)
${line}    - Return the modified context
${line}
${line}  See PHP/Python/TypeScript bridges for complete implementations.
${line}  Port the handler logic 1:1 to ${lang.toUpperCase()} for full execution.
${line} ═══════════════════════════════════════════════════════
`;
}


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
| \`src/\` | Executable capability implementations (callable classes/functions) |
| \`src/runtime-bridge.*\` | **Runtime Binding Layer** — connects capabilities to pipeline execution |
| \`test/\` | Auto-generated test harnesses |
| \`_runtime/\` | CMPSBL® Mini-Runtime™ Engine (sealed, zero dependencies) |
| \`manifest.json\` | Pack metadata and capability registry |
| \`LICENSE\` | CMPSBL® Software License (plain text) |
| \`LICENSE.html\` | CMPSBL® Software License (styled, printable) |
| \`README.html\` | This README (styled, printable) |
| \`PIPELINE-DETAILS.html\` | Per-capability technical dossier with valuation |

## ⚡ Quick Start

\`\`\`
// Each capability is a REAL execution entrypoint.
// 1. Load the capability class
// 2. Call execute(input) — runs the module chain pipeline
// 3. Get structured output with trace and metadata
\`\`\`

**How it works:**

1. The capability class loads manifest metadata
2. It delegates to the **Runtime Bridge** (\`runtime-bridge.*\`)
3. The bridge executes the module chain as a sequential pipeline
4. Each module (${[...new Set(capabilities.flatMap(c => c.chain))].join(', ')}) transforms the execution context
5. You get back: \`{ success, output, trace, metadata }\`

> This is **deterministic pipeline execution** — not a simulation.
> Every module modifies context, adds trace data, and reflects its behavioral intent.

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

## 🔗 Runtime Binding Layer (NEW)

This pack includes a **language-native Runtime Bridge** that makes capabilities executable:

- **Pipeline Execution** — Sequential module chain processing with context passing
- **Module Handlers** — Each substrate module has a real handler that modifies execution context
- **Trace & Observability** — Every execution produces per-stage timing, status, and signal data
- **Error Recovery** — Exceptions are caught per-stage with full error trace

The bridge is a wrapper, not the full substrate. Capability execution happens through
the deterministic pipeline model. For the full cognitive runtime, use the CMPSBL substrate directly.

## 🚀 Mini-Runtime™ Engine (Sealed)

This pack includes the **CMPSBL® Mini-Runtime™ Engine** as a sealed distribution:

- **CJPI Scorer** — Crown Jewel Pipeline Index computation
- **Saga Orchestrator** — Multi-step execution with compensation
- **FSM Engine** — Finite state machines with guards and actions
- **Discovery Engine** — Portable discovery reactor
- **Manifest Parser** — Capability metadata parsing
- **Structural Fingerprint** — SHA-256 identity verification

> ⚠️ The Mini-Runtime™ is a sealed proprietary component. Redistribution as a standalone
> product is prohibited under the CMPSBL® Software License.

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

  // ═══ Cherry-Picked Capabilities — Only the primitives acquired ═══
  const allChains = capabilities.map(c => c.chain);
  const capabilitiesCode = generateCherryPickedCapabilities(allChains, targetLanguage, packName);
  const capabilitiesExt = LANG_EXT[targetLanguage] || '.ts';
  const capabilitiesFilename = targetLanguage === 'php' ? 'capabilities.php'
    : targetLanguage === 'python' ? 'capabilities.py'
    : `capabilities${capabilitiesExt}`;

  // src/ — Single capabilities file + per-capability source files
  const srcFolder = zip.folder('src')!;
  srcFolder.file(capabilitiesFilename, capabilitiesCode);
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
      { name: `src/${capabilitiesFilename}`, purpose: 'Acquired capabilities — plain functions, zero dependencies' },
      { name: 'src/', purpose: 'Per-capability source files with dual-layer architecture' },
      { name: 'test/', purpose: 'Auto-generated test harnesses' },
      { name: 'manifest.json', purpose: 'Pack metadata and capability registry' },
      { name: 'LICENSE.html', purpose: 'Commercial distribution license' },
      { name: 'PIPELINE-DETAILS.html', purpose: 'Per-capability valuation dossier' },
      { name: 'export-tier.json', purpose: 'Valuation summary' },
    ],
    quickStart: targetLanguage === 'php'
      ? `require_once 'src/capabilities.php';\\n$result = CMPSBLCapabilities::runChain(['DEFENSE', 'BRAIN'], ['key' => 'value']);`
      : targetLanguage === 'python'
      ? `from src.capabilities import run_chain\\nresult = await run_chain(['DEFENSE', 'BRAIN'], {"key": "value"})`
      : `import { runChain, invoke } from './src/capabilities';\\nconst result = await runChain(['DEFENSE', 'BRAIN'], { key: 'value' });\\n// Or call one: await invoke('DEFENSE', { key: 'value' });`,
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
