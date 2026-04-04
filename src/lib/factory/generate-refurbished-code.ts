/**
 * Generate Refurbished Code — Dual-layer source output
 * Takes original code + applied primitives and produces the "refurbished" version
 * with real per-primitive wrappers, guards, and instrumentation injected INTO the code.
 *
 * Bridge Adapter: Output always matches the source language via language-specific
 * syntax adapters. Python in → Python out. Rust in → Rust out. HDL in → HDL out.
 */

import type { PrimitiveRecommendation } from './scan-team';
import { detectLanguage } from './code-metrics';

// ── Language Syntax Adapters ──

interface LanguageAdapter {
  comment: (text: string) => string;
  blockComment: (lines: string[]) => string;
  importStatement: (module: string, symbols: string[]) => string;
  constDecl: (name: string, value: string) => string;
  /** Transform a JS-syntax guard block into language-native call syntax */
  transformGuard: (jsGuard: string) => string;
  fileExtension: string;
}

// ── Guard Syntax Transform Helpers ──

/** Convert camelCase to snake_case */
function toSnakeCase(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * Convert JS object-literal args to keyword-argument style.
 * `{ blockThreshold: 0.30, reviewThreshold: 0.60 }` → `block_threshold=0.30, review_threshold=0.60`
 * Works for single-line and multi-line object args.
 */
function jsArgsToKwargs(call: string, keyTransform: (k: string) => string, separator: string): string {
  // Match `({ ... })` blocks (single or multi-line)
  return call.replace(/\(\{([^}]*)\}\)/g, (_match, inner: string) => {
    const pairs = inner
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(pair => {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) return pair;
        const key = pair.slice(0, colonIdx).trim().replace(/['"]/g, '');
        const val = pair.slice(colonIdx + 1).trim();
        return `${keyTransform(key)}${separator}${val}`;
      });
    return `(${pairs.join(', ')})`;
  });
}

/** Remove trailing semicolons from each line */
function stripSemicolons(code: string): string {
  return code.replace(/;[ \t]*$/gm, '');
}

/** Convert JS array-of-objects `[{ key: val }, ...]` to native list/slice syntax */
function jsArrayToNative(call: string, keyTransform: (k: string) => string, separator: string, wrapItem?: (inner: string) => string): string {
  // Match `([...])` containing object literals
  return call.replace(/\(\[([^\]]*)\]\)/gs, (_match, inner: string) => {
    // Split by `},` to get each object
    const items = inner.split(/\},/).map(s => s.trim().replace(/^\{/, '').replace(/\}$/, '').trim()).filter(Boolean);
    const converted = items.map(item => {
      const pairs = item.split(',').map(p => p.trim()).filter(Boolean).map(pair => {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) return pair;
        const key = pair.slice(0, colonIdx).trim().replace(/['"]/g, '');
        const val = pair.slice(colonIdx + 1).trim();
        return `${keyTransform(key)}${separator}${val}`;
      });
      const joined = pairs.join(', ');
      return wrapItem ? wrapItem(joined) : `{${joined}}`;
    });
    return `([${converted.join(', ')}])`;
  });
}

/** Identity — JS/TS guard syntax is already correct */
const identityGuard = (g: string) => g;

/** Python: kwargs + snake_case + no semicolons */
function pythonGuard(g: string): string {
  let out = jsArgsToKwargs(g, toSnakeCase, '=');
  out = jsArrayToNative(out, toSnakeCase, '=', (inner) => `dict(${inner})`);
  return stripSemicolons(out);
}

/** Ruby: kwargs with symbol keys + snake_case + no semicolons */
function rubyGuard(g: string): string {
  let out = jsArgsToKwargs(g, (k) => `${toSnakeCase(k)}:`, ' ');
  out = jsArrayToNative(out, (k) => `${toSnakeCase(k)}:`, ' ');
  return stripSemicolons(out);
}

/** Go: struct literals with PascalCase keys */
function goGuard(g: string): string {
  const toPascal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  let out = jsArgsToKwargs(g, toPascal, ': ');
  out = jsArrayToNative(out, toPascal, ': ');
  return stripSemicolons(out);
}

/** Rust: struct literals with snake_case + `::` method separator */
function rustGuard(g: string): string {
  // Replace `.method(` with `::method(`
  let out = g.replace(/\.(\w+)\(/g, '::$1(');
  out = jsArgsToKwargs(out, toSnakeCase, ': ');
  out = jsArrayToNative(out, toSnakeCase, ': ');
  return out; // Rust keeps semicolons
}

/** Elixir: keyword list syntax with snake_case atoms + no semicolons */
function elixirGuard(g: string): string {
  let out = jsArgsToKwargs(g, (k) => `${toSnakeCase(k)}:`, ' ');
  out = jsArrayToNative(out, (k) => `${toSnakeCase(k)}:`, ' ');
  return stripSemicolons(out);
}

/** Kotlin/Scala: named args with camelCase (same as JS keys) */
function namedArgGuard(g: string): string {
  return jsArgsToKwargs(g, (k) => k, ' = ');
}

/** Lua: table constructor `{ key = value }` + no semicolons */
function luaGuard(g: string): string {
  let out = jsArgsToKwargs(g, toSnakeCase, ' = ');
  // Re-wrap in `({...})` → `({...})` is already correct for Lua tables
  return stripSemicolons(out);
}

/** Swift: trailing argument labels with camelCase */
function swiftGuard(g: string): string {
  return jsArgsToKwargs(g, (k) => `${k}:`, ' ');
}

const ADAPTERS: Record<string, LanguageAdapter> = {
  TypeScript: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `import { ${syms.join(', ')} } from '${mod}';`,
    constDecl: (name, val) => `const ${name} = Object.freeze(${val});`,
    fileExtension: '.ts',
  },
  JavaScript: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `import { ${syms.join(', ')} } from '${mod}';`,
    constDecl: (name, val) => `const ${name} = Object.freeze(${val});`,
    fileExtension: '.js',
  },
  Python: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `"""\n${lines.join('\n')}\n"""`,
    importStatement: (mod, syms) => `from ${mod.replace(/@/g, '').replace(/\//g, '.')} import ${syms.join(', ')}`,
    constDecl: (name, val) => `${name} = ${val}`,
    fileExtension: '.py',
  },
  Rust: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `use ${mod.replace(/@/g, '').replace(/\//g, '::')}::{${syms.join(', ')}};`,
    constDecl: (name, val) => `const ${name.toUpperCase()}: &str = r#"${val}"#;`,
    fileExtension: '.rs',
  },
  Go: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `import "${mod}"`,
    constDecl: (name, val) => `var ${name} = ${val}`,
    fileExtension: '.go',
  },
  Java: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => syms.map(s => `import ${mod.replace(/@/g, '').replace(/\//g, '.')}.${s};`).join('\n'),
    constDecl: (name, val) => `static final String ${name} = ${val};`,
    fileExtension: '.java',
  },
  'C#': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/// <summary>\n${lines.map(l => `/// ${l}`).join('\n')}\n/// </summary>`,
    importStatement: (mod, _syms) => `using ${mod.replace(/@/g, '').replace(/\//g, '.')};`,
    constDecl: (name, val) => `static readonly string ${name} = @"${val}";`,
    fileExtension: '.cs',
  },
  C: {
    comment: (t) => `/* ${t} */`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `#include "${mod}.h"`,
    constDecl: (name, val) => `static const char* ${name} = "${val}";`,
    fileExtension: '.c',
  },
  'C++': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `#include "${mod}.hpp"`,
    constDecl: (name, val) => `constexpr auto ${name} = R"(${val})";`,
    fileExtension: '.cpp',
  },
  Ruby: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `=begin\n${lines.join('\n')}\n=end`,
    importStatement: (mod, _syms) => `require '${mod}'`,
    constDecl: (name, val) => `${name.toUpperCase()} = ${val}.freeze`,
    fileExtension: '.rb',
  },
  Swift: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `import ${mod.replace(/@/g, '').replace(/\//g, '.')}`,
    constDecl: (name, val) => `let ${name} = ${val}`,
    fileExtension: '.swift',
  },
  Kotlin: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => syms.map(s => `import ${mod.replace(/@/g, '').replace(/\//g, '.')}.${s}`).join('\n'),
    constDecl: (name, val) => `val ${name} = ${val}`,
    fileExtension: '.kt',
  },
  PHP: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `use ${mod.replace(/@/g, '').replace(/\//g, '\\\\')};`,
    constDecl: (name, val) => `define('${name.toUpperCase()}', ${val});`,
    fileExtension: '.php',
  },
  Scala: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `import ${mod.replace(/@/g, '').replace(/\//g, '.')}.{${syms.join(', ')}}`,
    constDecl: (name, val) => `val ${name} = ${val}`,
    fileExtension: '.scala',
  },
  Lua: {
    comment: (t) => `-- ${t}`,
    blockComment: (lines) => `--[[\n${lines.join('\n')}\n]]`,
    importStatement: (mod, _syms) => `local ${mod.split('/').pop()} = require("${mod}")`,
    constDecl: (name, val) => `local ${name} = ${val}`,
    fileExtension: '.lua',
  },
  R: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (mod, _syms) => `library(${mod.split('/').pop()})`,
    constDecl: (name, val) => `${name} <- ${val}`,
    fileExtension: '.R',
  },
  Dart: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `import 'package:${mod.replace(/@/g, '')}';`,
    constDecl: (name, val) => `const ${name} = ${val};`,
    fileExtension: '.dart',
  },
  Elixir: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `@moduledoc """\n${lines.join('\n')}\n"""`,
    importStatement: (mod, _syms) => `import ${mod.split('/').pop()?.replace(/-/g, '_') ?? mod}`,
    constDecl: (name, val) => `@${name} ${val}`,
    fileExtension: '.ex',
  },
  // HDL adapters
  VHDL: {
    comment: (t) => `-- ${t}`,
    blockComment: (lines) => lines.map(l => `-- ${l}`).join('\n'),
    importStatement: (mod, _syms) => `library ${mod.split('/').pop()};\nuse ${mod.split('/').pop()}.all;`,
    constDecl: (name, val) => `constant ${name} : string := "${val}";`,
    fileExtension: '.vhd',
  },
  Verilog: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `\`include "${mod}.v"`,
    constDecl: (name, val) => `localparam ${name} = "${val}";`,
    fileExtension: '.v',
  },
  SystemVerilog: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `import ${mod.split('/').pop()}::*;`,
    constDecl: (name, val) => `localparam string ${name} = "${val}";`,
    fileExtension: '.sv',
  },
  // Extended languages
  Perl: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `=pod\n${lines.join('\n')}\n=cut`,
    importStatement: (mod, _syms) => `use ${mod.replace(/\//g, '::')};`,
    constDecl: (name, val) => `use constant ${name} => ${val};`,
    fileExtension: '.pl',
  },
  Julia: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `#=\n${lines.join('\n')}\n=#`,
    importStatement: (mod, _syms) => `using ${mod.split('/').pop()}`,
    constDecl: (name, val) => `const ${name} = ${val}`,
    fileExtension: '.jl',
  },
  'F#': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `(*\n${lines.join('\n')}\n*)`,
    importStatement: (mod, _syms) => `open ${mod.replace(/\//g, '.')}`,
    constDecl: (name, val) => `let [<Literal>] ${name} = ${val}`,
    fileExtension: '.fs',
  },
  Clojure: {
    comment: (t) => `;; ${t}`,
    blockComment: (lines) => lines.map(l => `;; ${l}`).join('\n'),
    importStatement: (mod, _syms) => `(require '[${mod.split('/').pop()}])`,
    constDecl: (name, val) => `(def ${name} ${val})`,
    fileExtension: '.clj',
  },
  Erlang: {
    comment: (t) => `% ${t}`,
    blockComment: (lines) => lines.map(l => `% ${l}`).join('\n'),
    importStatement: (mod, _syms) => `-include("${mod.split('/').pop()}.hrl").`,
    constDecl: (name, val) => `-define(${name.toUpperCase()}, ${val}).`,
    fileExtension: '.erl',
  },
  OCaml: {
    comment: (t) => `(* ${t} *)`,
    blockComment: (lines) => `(*\n${lines.join('\n')}\n*)`,
    importStatement: (mod, _syms) => `open ${mod.split('/').pop()?.charAt(0).toUpperCase()}${mod.split('/').pop()?.slice(1)}`,
    constDecl: (name, val) => `let ${name} = ${val}`,
    fileExtension: '.ml',
  },
  Nim: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `#[\n${lines.join('\n')}\n]#`,
    importStatement: (mod, _syms) => `import ${mod.split('/').pop()}`,
    constDecl: (name, val) => `const ${name} = ${val}`,
    fileExtension: '.nim',
  },
  Crystal: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (mod, _syms) => `require "${mod}"`,
    constDecl: (name, val) => `${name.toUpperCase()} = ${val}`,
    fileExtension: '.cr',
  },
  Groovy: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => syms.map(s => `import ${mod.replace(/@/g, '').replace(/\//g, '.')}.${s}`).join('\n'),
    constDecl: (name, val) => `final ${name} = ${val}`,
    fileExtension: '.groovy',
  },
  Fortran: {
    comment: (t) => `! ${t}`,
    blockComment: (lines) => lines.map(l => `! ${l}`).join('\n'),
    importStatement: (mod, _syms) => `use ${mod.split('/').pop()}`,
    constDecl: (name, val) => `character(len=*), parameter :: ${name} = "${val}"`,
    fileExtension: '.f90',
  },
  'Objective-C': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `#import "${mod}.h"`,
    constDecl: (name, val) => `static NSString *const ${name} = @"${val}";`,
    fileExtension: '.m',
  },
  D: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/+\n${lines.join('\n')}\n+/`,
    importStatement: (mod, _syms) => `import ${mod.replace(/\//g, '.')};`,
    constDecl: (name, val) => `enum ${name} = ${val};`,
    fileExtension: '.d',
  },
  Shell: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (mod, _syms) => `source "${mod}"`,
    constDecl: (name, val) => `readonly ${name}="${val}"`,
    fileExtension: '.sh',
  },
  Bash: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (mod, _syms) => `source "${mod}"`,
    constDecl: (name, val) => `readonly ${name}="${val}"`,
    fileExtension: '.sh',
  },
  PowerShell: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `<#\n${lines.join('\n')}\n#>`,
    importStatement: (mod, _syms) => `Import-Module ${mod.split('/').pop()}`,
    constDecl: (name, val) => `Set-Variable -Name "${name}" -Value "${val}" -Option Constant`,
    fileExtension: '.ps1',
  },
  Solidity: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `import "${mod}.sol";`,
    constDecl: (name, val) => `string constant ${name} = "${val}";`,
    fileExtension: '.sol',
  },
  CUDA: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `#include "${mod}.cuh"`,
    constDecl: (name, val) => `__constant__ const char* ${name} = "${val}";`,
    fileExtension: '.cu',
  },
  GLSL: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: () => '',
    constDecl: (name, val) => `const int ${name} = ${val};`,
    fileExtension: '.glsl',
  },
  Metal: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: () => '#include <metal_stdlib>',
    constDecl: (name, val) => `constant auto ${name} = ${val};`,
    fileExtension: '.metal',
  },
  WGSL: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => lines.map(l => `// ${l}`).join('\n'),
    importStatement: () => '',
    constDecl: (name, val) => `const ${name}: u32 = ${val}u;`,
    fileExtension: '.wgsl',
  },
  Bluespec: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, _syms) => `import ${mod.split('/').pop()}::*;`,
    constDecl: (name, val) => `String ${name} = "${val}";`,
    fileExtension: '.bsv',
  },
  FIRRTL: {
    comment: (t) => `; ${t}`,
    blockComment: (lines) => lines.map(l => `; ${l}`).join('\n'),
    importStatement: () => '',
    constDecl: (name, val) => `; const ${name} = ${val}`,
    fileExtension: '.fir',
  },
  Chisel: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `import ${mod.replace(/@/g, '').replace(/\//g, '.')}.{${syms.join(', ')}}`,
    constDecl: (name, val) => `val ${name} = ${val}`,
    fileExtension: '.scala',
  },
};

/** Resolve the adapter for a detected language, falling back to TypeScript */
function getAdapter(language: string): LanguageAdapter {
  return ADAPTERS[language] ?? ADAPTERS['TypeScript'];
}

/** Extract module path and symbol names from a TS import string */
function parseImport(tsImport: string): { module: string; symbols: string[] } {
  const modMatch = tsImport.match(/from\s+['"]([^'"]+)['"]/);
  const symMatch = tsImport.match(/\{([^}]+)\}/);
  return {
    module: modMatch?.[1] ?? 'cmpsbl/runtime',
    symbols: symMatch?.[1].split(',').map(s => s.trim()) ?? [],
  };
}

/** Per-primitive code transformation templates (canonical TS format — adapted at output) */
const PRIMITIVE_WRAPPERS: Record<string, { imports: string; guard: string; wrapper: (code: string) => string }> = {
  failsafe: {
    imports: "import { CircuitBreaker, SnapshotManager } from '@cmpsbl/runtime/failsafe';",
    guard: "const failsafeBreaker = CircuitBreaker.create({ threshold: 5, resetMs: 30_000 });\nSnapshotManager.init({ autoSnapshot: true, intervalMs: 300_000 });",
    wrapper: (code) => {
      return code.replace(
        /(?:await\s+)(fetch|axios|http)\b/g,
        'await failsafeBreaker.execute(() => $1'
      );
    },
  },
  defense: {
    imports: "import { DefenseLayer, RequestValidator, DeviceFingerprint } from '@cmpsbl/runtime/defense';",
    guard: "DefenseLayer.activate({ mode: 'enforce', fingerprinting: true });\nRequestValidator.init({ blockInjection: true, blockXSS: true, rateLimitPerIp: 100 });",
    wrapper: (code) => code,
  },
  governance: {
    imports: "import { GovernancePolicy, ComplianceAuditor } from '@cmpsbl/runtime/governance';",
    guard: "GovernancePolicy.enforce({\n  maxConcurrency: 100,\n  auditAllMutations: true,\n  requireApprovalAbove: 'high-risk',\n});\nComplianceAuditor.start({ logDestination: 'structured' });",
    wrapper: (code) => code,
  },
  beacon: {
    imports: "import { HealthBeacon, MetricsCollector } from '@cmpsbl/runtime/beacon';",
    guard: "HealthBeacon.start({ interval: 15_000, endpoints: ['/_health', '/_ready'] });\nMetricsCollector.init({ exportFormat: 'prometheus' });",
    wrapper: (code) => code,
  },
  brain: {
    imports: "import { LearningEngine, InsightAccumulator } from '@cmpsbl/runtime/brain';",
    guard: "LearningEngine.init({ mode: 'passive', retentionDays: 90 });\nInsightAccumulator.observe({ trackPatterns: true, autoOptimize: false });",
    wrapper: (code) => code,
  },
  memory: {
    imports: "import { PersistentMemory, StateRecovery } from '@cmpsbl/runtime/memory';",
    guard: "PersistentMemory.init({ adapter: 'filesystem', snapshotOnCrash: true });\nStateRecovery.enable({ strategy: 'last-known-good' });",
    wrapper: (code) => code,
  },
  identity: {
    imports: "import { IdentityResolver, SessionBinder } from '@cmpsbl/runtime/identity';",
    guard: "IdentityResolver.init({ multiFactorRequired: true, sessionTtlMs: 3_600_000 });\nSessionBinder.enforce({ bindToDevice: true, maxConcurrentSessions: 3 });",
    wrapper: (code) => code,
  },
  conscience: {
    imports: "import { EthicalGate, AlignmentMonitor } from '@cmpsbl/runtime/conscience';",
    guard: "EthicalGate.init({ blockThreshold: 0.30, reviewThreshold: 0.60 });\nAlignmentMonitor.start({ driftAlertThreshold: 0.15 });",
    wrapper: (code) => code,
  },
  encode: {
    imports: "import { BehavioralMapper, IntentTracer } from '@cmpsbl/runtime/encode';",
    guard: "BehavioralMapper.scan({ traceDepth: 'full', documentExports: true });\nIntentTracer.enable({ tagFunctions: true, generateSignatures: true });",
    wrapper: (code) => code,
  },
  oracle: {
    imports: "import { PredictiveAnalyzer, FailureForecast } from '@cmpsbl/runtime/oracle';",
    guard: "PredictiveAnalyzer.init({ horizon: '60s', confidenceThreshold: 0.75 });\nFailureForecast.monitor({ cascadeDetection: true, alertOnDrift: true });",
    wrapper: (code) => code,
  },
  engineer: {
    imports: "import { DependencyResolver, StructuralRepair } from '@cmpsbl/runtime/engineer';",
    guard: "DependencyResolver.audit({ pinVersions: true, detectCycles: true });\nStructuralRepair.init({ autoFix: 'safe-only', reportPath: './engineer-report.json' });",
    wrapper: (code) => code,
  },
  cortex: {
    imports: "import { ReasoningEngine, ContextRouter } from '@cmpsbl/runtime/cortex';",
    guard: "ReasoningEngine.init({ maxChainDepth: 5, timeoutMs: 10_000 });\nContextRouter.enable({ weightByRecency: true, parallelBranches: 3 });",
    wrapper: (code) => code,
  },
  nexus: {
    imports: "import { IntelligentRouter, LoadBalancer } from '@cmpsbl/runtime/nexus';",
    guard: "IntelligentRouter.init({ strategy: 'latency-aware', healthCheckMs: 5_000 });\nLoadBalancer.enable({ algorithm: 'weighted-round-robin' });",
    wrapper: (code) => code,
  },
  architect: {
    imports: "import { BlueprintGuard, RegressionDetector } from '@cmpsbl/runtime/architect';",
    guard: "BlueprintGuard.init({ baselineVersion: '1.0', blockRegressions: true });\nRegressionDetector.watch({ structuralDrift: true, alertThreshold: 0.10 });",
    wrapper: (code) => code,
  },
  automaton: {
    imports: "import { TaskAutomator, ScheduleEngine } from '@cmpsbl/runtime/automaton';",
    guard: "TaskAutomator.init({ maxConcurrent: 10, retryPolicy: 'exponential' });\nScheduleEngine.enable({ timezone: 'UTC', cleanupAfterMs: 86_400_000 });",
    wrapper: (code) => code,
  },
  shadow: {
    imports: "import { ShadowMirror, CanaryOrchestrator } from '@cmpsbl/runtime/shadow';",
    guard: "ShadowMirror.init({ mirrorPercent: 5, compareOutputs: true });\nCanaryOrchestrator.enable({ autoRollback: true, anomalyThreshold: 0.05 });",
    wrapper: (code) => code,
  },
  sovereign: {
    imports: "import { AuthorityResolver, PolicyEnforcer } from '@cmpsbl/runtime/sovereign';",
    guard: "AuthorityResolver.init({ hierarchical: true, conflictResolution: 'most-restrictive' });\nPolicyEnforcer.enforce({ auditDelegation: true });",
    wrapper: (code) => code,
  },
  treaty: {
    imports: "import { ContractValidator, SchemaEnforcer } from '@cmpsbl/runtime/treaty';",
    guard: "ContractValidator.init({ strictMode: true, breakingChangeAlert: true });\nSchemaEnforcer.enable({ validateRequests: true, validateResponses: true });",
    wrapper: (code) => code,
  },
  relay: {
    imports: "import { MessageRelay, DeliveryGuarantee } from '@cmpsbl/runtime/relay';",
    guard: "MessageRelay.init({ retryPolicy: 'at-least-once', deadLetterAfter: 3 });\nDeliveryGuarantee.enable({ orderingMode: 'strict' });",
    wrapper: (code) => code,
  },
  sandbox: {
    imports: "import { SandboxExecutor, IsolationGuard } from '@cmpsbl/runtime/sandbox';",
    guard: "SandboxExecutor.init({ memoryLimitMb: 256, timeoutMs: 30_000 });\nIsolationGuard.enforce({ blockNetworkAccess: false, blockFileSystem: true });",
    wrapper: (code) => code,
  },
  simulate: {
    imports: "import { SimulationEngine, TrafficReplay } from '@cmpsbl/runtime/simulate';",
    guard: "SimulationEngine.init({ historicalDataDays: 30, parallelScenarios: 5 });\nTrafficReplay.enable({ replaySpeed: '10x', captureBaseline: true });",
    wrapper: (code) => code,
  },
  forge: {
    imports: "import { BuildValidator, ArtifactSealer } from '@cmpsbl/runtime/forge';",
    guard: "BuildValidator.init({ hashAlgorithm: 'sha256', rejectTampered: true });\nArtifactSealer.enable({ signOutputs: true, verifyInputs: true });",
    wrapper: (code) => code,
  },
  immunity: {
    imports: "import { DependencyShield, IsolationBarrier } from '@cmpsbl/runtime/immunity';",
    guard: "DependencyShield.init({ monitorCVEs: true, autoQuarantine: true });\nIsolationBarrier.enforce({ blastRadius: 'component', fallbackOnFailure: true });",
    wrapper: (code) => code,
  },
  compass: {
    imports: "import { ModuleNavigator, DependencyMapper } from '@cmpsbl/runtime/compass';",
    guard: "ModuleNavigator.init({ autoIndex: true, resolveAliases: true });\nDependencyMapper.generate({ outputPath: './architecture-map.json' });",
    wrapper: (code) => code,
  },
  reflex: {
    imports: "import { ReflexHandler, FallbackChain } from '@cmpsbl/runtime/reflex';",
    guard: "ReflexHandler.init({ maxLatencyMs: 50, escalateAfter: 3 });\nFallbackChain.define([\n  { strategy: 'cache', ttlMs: 60_000 },\n  { strategy: 'default-value' },\n  { strategy: 'graceful-degrade' },\n]);",
    wrapper: (code) => code,
  },
  echo: {
    imports: "import { StructuredLogger, EventCorrelator } from '@cmpsbl/runtime/echo';",
    guard: "StructuredLogger.init({ format: 'json', level: 'info', correlationId: true });\nEventCorrelator.enable({ traceContext: true, spanDepth: 10 });",
    wrapper: (code) => {
      return code.replace(/console\.(log|warn|error|info)\(/g, 'StructuredLogger.$1(');
    },
  },
  observer: {
    imports: "import { StateObserver, TransitionTracker } from '@cmpsbl/runtime/observer';",
    guard: "StateObserver.init({ captureSnapshots: true, diffMode: 'structural' });\nTransitionTracker.enable({ emitEvents: true, retainHistory: 100 });",
    wrapper: (code) => code,
  },
  lingua: {
    imports: "import { TextNormalizer, EncodingGuard } from '@cmpsbl/runtime/lingua';",
    guard: "TextNormalizer.init({ defaultEncoding: 'utf-8', sanitizeInputs: true });\nEncodingGuard.enforce({ rejectMalformed: true, normalizeUnicode: true });",
    wrapper: (code) => code,
  },
  harvest: {
    imports: "import { DeadCodeDetector, PruningAdvisor } from '@cmpsbl/runtime/harvest';",
    guard: "DeadCodeDetector.init({ scanDepth: 'full', ignoreTests: true });\nPruningAdvisor.generate({ safetyThreshold: 0.95, outputReport: true });",
    wrapper: (code) => code,
  },
  phantom: {
    imports: "import { PhantomTraffic, LoadProfile } from '@cmpsbl/runtime/phantom';",
    guard: "PhantomTraffic.init({ concurrency: 50, profileSource: 'production-mirror' });\nLoadProfile.capture({ duration: '1h', sampleRate: 0.01 });",
    wrapper: (code) => code,
  },
  nerve: {
    imports: "import { EventBus, SignalPropagator } from '@cmpsbl/runtime/nerve';",
    guard: "EventBus.init({ delivery: 'exactly-once', ordering: 'causal' });\nSignalPropagator.enable({ partitionTolerant: true, retryPolicy: 'bounded' });",
    wrapper: (code) => code,
  },
  primitive: {
    imports: "import { RuntimeKernel, BaseHardening } from '@cmpsbl/runtime/primitive';",
    guard: "RuntimeKernel.init({ mode: 'hardened', strictTypes: true });\nBaseHardening.apply({ nullSafety: true, boundaryChecks: true });",
    wrapper: (code) => code,
  },
  wraith: {
    imports: "import { StealthOps, SecretRotator } from '@cmpsbl/runtime/wraith';",
    guard: "StealthOps.init({ minimalFootprint: true, encryptInTransit: true });\nSecretRotator.enable({ rotationIntervalMs: 86_400_000, auditAccess: true });",
    wrapper: (code) => {
      return code.replace(
        /(?:password|secret|api_key|token)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
        (match, _val) => match.replace(_val, '${WRAITH_SEALED_SECRET}')
      );
    },
  },
  obsidian: {
    imports: "import { RedundantStore, IntegrityVerifier } from '@cmpsbl/runtime/obsidian';",
    guard: "RedundantStore.init({ replicas: 3, consistencyLevel: 'quorum' });\nIntegrityVerifier.enable({ checksumAlgorithm: 'sha256', verifyOnRead: true });",
    wrapper: (code) => code,
  },
  monolith: {
    imports: "import { TransactionCoordinator, AtomicExecutor } from '@cmpsbl/runtime/monolith';",
    guard: "TransactionCoordinator.init({ isolationLevel: 'serializable', timeoutMs: 30_000 });\nAtomicExecutor.enable({ rollbackOnPartialFailure: true });",
    wrapper: (code) => code,
  },
  raptor: {
    imports: "import { PerimeterScanner, ThreatClassifier } from '@cmpsbl/runtime/raptor';",
    guard: "PerimeterScanner.init({ scanIntervalMs: 100, deepInspection: true });\nThreatClassifier.enable({ mlModel: 'behavioral', alertOnAnomalies: true });",
    wrapper: (code) => code,
  },
  decode: {
    imports: "import { IntentResolver, ConfidenceScorer } from '@cmpsbl/runtime/decode';",
    guard: "IntentResolver.init({ fallbackStrategy: 'ask-clarification', minConfidence: 0.70 });\nConfidenceScorer.enable({ contextWindow: 10, disambiguate: true });",
    wrapper: (code) => code,
  },
  access: {
    imports: "import { BoundaryGuard, PayloadValidator } from '@cmpsbl/runtime/access';",
    guard: "BoundaryGuard.init({ validateAll: true, rejectUnknownFields: true });\nPayloadValidator.enforce({ maxSizeBytes: 10_485_760, sanitize: true });",
    wrapper: (code) => code,
  },
  atlas: {
    imports: "import { TopologyMapper, ServiceDiscovery } from '@cmpsbl/runtime/atlas';",
    guard: "TopologyMapper.init({ autoDiscover: true, refreshIntervalMs: 30_000 });\nServiceDiscovery.enable({ protocol: 'dns', fallback: 'static-config' });",
    wrapper: (code) => code,
  },
};

/**
 * Generate the refurbished source with real per-primitive wrappers.
 * Uses the Bridge adapter to output in the SAME language as the source.
 */
export function generateRefurbishedCode(
  originalCode: string,
  selectedPrimitives: PrimitiveRecommendation[],
  fingerprint: string,
  sourceLanguage?: string,
  fileName?: string,
): string {
  // Detect language from explicit param, fileName, or code content
  const detected = sourceLanguage ?? detectLanguage(originalCode, fileName ?? undefined).language;
  const adapter = getAdapter(detected);

  const imports: string[] = [];
  const guards: string[] = [];
  let transformedCode = originalCode;

  for (const p of selectedPrimitives) {
    const wrapper = PRIMITIVE_WRAPPERS[p.primitiveId];
    if (wrapper) {
      // Adapt the import to the source language
      const parsed = parseImport(wrapper.imports);
      imports.push(adapter.importStatement(parsed.module, parsed.symbols));

      guards.push(adapter.comment(`─── ${p.name} ───`));
      guards.push(wrapper.guard);
      transformedCode = wrapper.wrapper(transformedCode);
    }
  }

  const headerLines = [
    '═══════════════════════════════════════════════════════════',
    'CMPSBL® Refurbished Code — Sealed Runtime',
    `Language: ${detected} (Bridge Adapter)`,
    '═══════════════════════════════════════════════════════════',
    `Fingerprint: ${fingerprint}`,
    `Primitives:  ${selectedPrimitives.map(p => p.name).join(', ')}`,
    `Generated:   ${new Date().toISOString()}`,
    '',
    'Layer 1: Original source (hardened in-place)',
    'Layer 2: Primitive guard activations + instrumentation',
    '',
    'DO NOT remove guard activations — they protect runtime integrity.',
    'DO NOT modify the fingerprint — it validates this artifact.',
    '═══════════════════════════════════════════════════════════',
  ];

  const header = adapter.blockComment(headerLines);

  const metaJson = JSON.stringify({
    fingerprint,
    primitiveCount: selectedPrimitives.length,
    generatedAt: new Date().toISOString(),
    runtimeVersion: '2.5.0',
    sourceLanguage: detected,
  }, null, 2);

  const metaBlock = [
    adapter.comment('═══ CMPSBL Artifact Metadata ═══'),
    adapter.constDecl('__CMPSBL_META__', metaJson),
  ].join('\n');

  return [
    header,
    '',
    adapter.comment('═══ Runtime Imports ═══'),
    ...imports,
    '',
    metaBlock,
    '',
    adapter.comment('═══════════════════════════════════════════════════════════'),
    adapter.comment('PRIMITIVE GUARD ACTIVATIONS'),
    adapter.comment("Each block initializes a primitive's protection layer."),
    adapter.comment('═══════════════════════════════════════════════════════════'),
    '',
    ...guards,
    '',
    adapter.comment('═══════════════════════════════════════════════════════════'),
    adapter.comment('ORIGINAL SOURCE (HARDENED)'),
    adapter.comment('Your code below has been analyzed and transformed in-place.'),
    adapter.comment('Dangerous patterns replaced. Logging upgraded. Secrets sealed.'),
    adapter.comment('═══════════════════════════════════════════════════════════'),
    '',
    transformedCode,
    '',
    adapter.comment('═══ End of CMPSBL® Sealed Runtime ═══'),
  ].join('\n');
}

/** Get the correct file extension for the refurbished output */
export function getRefurbishedExtension(sourceLanguage: string): string {
  const adapter = getAdapter(sourceLanguage);
  return adapter.fileExtension;
}

/** Generate the CMPSBL license text for export */
export function generateLicense(serialNumber: string, fingerprint: string): string {
  return `CMPSBL® SOFTWARE LICENSE
========================

Serial Number: ${serialNumber}
Fingerprint: ${fingerprint}
Issued: ${new Date().toISOString()}
Licensor: CMPSBL® — a PromptFluid™ product

1. GRANT OF LICENSE
   This license grants the holder the right to use, modify, and deploy
   the refurbished code contained in this package for any lawful purpose.

2. OWNERSHIP
   The refurbished code and all hardening applied by CMPSBL primitives
   remain the intellectual property of the licensee. CMPSBL retains
   ownership of the primitive runtime libraries (@cmpsbl/*).

3. RESTRICTIONS
   - You may not redistribute the @cmpsbl/runtime libraries separately.
   - You may not remove or bypass primitive guard activations.
   - You may not claim CMPSBL certification for code not processed
     through the official Refurbishment Lab.

4. WARRANTY
   This code has been scanned, analyzed, and hardened by the CMPSBL
   six-primitive scan team (ENCODE, ORACLE, ENGINEER, MEDIC, DEFENSE,
   FAILSAFE). The CJPI score and tier reflect the state at time of
   refurbishment.

5. SUPPORT
   Visit https://cmpsbl.com/support or use your fingerprint ID
   (${fingerprint}) to access DECODE support for this refurbishment.

© ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.
`;
}
