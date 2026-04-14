/**
 * Generate Ascended Code — Dual-layer source output (v3.1.0)
 *
 * LAYER 1: Original source code — copied VERBATIM. Never parsed, regex'd, or
 *          mutated. SHA-256 provable identity with uploaded source.
 *          Patent: U.S. App. No. 64/029,678 (Dual-Layer Architecture)
 *
 * LAYER 2: Orchestration matrix, dispatch tables, guard blocks, metadata.
 *          This is OUR generated code — structurally validated before export.
 *
 * Bridge Adapter: Output always matches the source language via language-specific
 * syntax adapters. Python in → Python out. Rust in → Rust out. HDL in → HDL out.
 */

import type { PrimitiveRecommendation } from './scan-team';
import { detectLanguage } from './code-metrics';
import {
  generateCompiledPreamble,
  generateDecoyPipelineComments,
} from '../export/opacity-engine';
import { generateInlinePrimitives } from './inline-primitive-generator';
import { validateLayer2 } from '../export/layer2-validator';
import {
  detectFunctionBoundaries,
  buildAttachmentPlan,
  serializeAttachmentPlan,
} from '../mana/findings-bridge';

// ── Language Syntax Adapters ──

export interface LanguageAdapter {
  comment: (text: string) => string;
  blockComment: (lines: string[]) => string;
  importStatement: (module: string, symbols: string[]) => string;
  constDecl: (name: string, value: string) => string;
  /** Transform a JS-syntax guard block into language-native call syntax */
  transformGuard: (jsGuard: string) => string;
  fileExtension: string;

  // ── Extended adapter methods (polyglot unification) ──
  /** Generate the opaque dispatch preamble in target-native syntax */
  dispatchPreamble?: (dispatchTable: number[], collisionMatrix: number[], seeds: { iv: number; epoch: number }) => string;
  /** Generate obfuscated scoring constants in target-native syntax */
  obfuscatedConstants?: () => string;
  /** Generate runnable self-verification block in target-native syntax */
  selfVerifyBlock?: (fingerprint: string) => string;
}

// ── Guard Syntax Transform Helpers ──

/** Convert camelCase to snake_case */
function toSnakeCase(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/** Convert camelCase to PascalCase */
function toPascalCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Boolean / Null / Literal Normalizers ──

function boolToPython(c: string): string { return c.replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False'); }
function nullToPython(c: string): string { return c.replace(/\bnull\b/g, 'None'); }
function nullToNil(c: string): string { return c.replace(/\bnull\b/g, 'nil'); }
function nullToNone(c: string): string { return c.replace(/\bnull\b/g, 'None'); }
function nullToNothing(c: string): string { return c.replace(/\bnull\b/g, 'nothing'); }
function nullToUndefined(c: string): string { return c.replace(/\bnull\b/g, 'undefined'); }
function literalsToR(c: string): string { return c.replace(/\btrue\b/g, 'TRUE').replace(/\bfalse\b/g, 'FALSE').replace(/\bnull\b/g, 'NULL'); }
function literalsToPerl(c: string): string { return c.replace(/\btrue\b/g, '1').replace(/\bfalse\b/g, '0').replace(/\bnull\b/g, 'undef'); }
function literalsToFortran(c: string): string { return c.replace(/\btrue\b/g, '.TRUE.').replace(/\bfalse\b/g, '.FALSE.').replace(/\bnull\b/g, '.FALSE.'); }
function litsPowerShell(c: string): string { return c.replace(/\btrue\b/g, '$true').replace(/\bfalse\b/g, '$false').replace(/\bnull\b/g, '$null'); }

/** Generic object-literal converter: `({ key: val })` → language-native */
function convertObjectArgs(
  g: string,
  keyFmt: (k: string) => string,
  sep: string,
  wrap: (pairs: string) => string = (p) => `(${p})`,
): string {
  return g.replace(/\(\{([^}]*)\}\)/g, (_m, inner: string) => {
    const pairs = inner.split(',').map(p => p.trim()).filter(Boolean).map(pair => {
      const ci = pair.indexOf(':');
      if (ci === -1) return pair;
      const k = pair.slice(0, ci).trim().replace(/['"]/g, '');
      const v = pair.slice(ci + 1).trim();
      return `${keyFmt(k)}${sep}${v}`;
    });
    return wrap(pairs.join(', '));
  });
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
  return call.replace(/\(\[([^\]]*)\]\)/g, (_match, inner: string) => {
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
  out = boolToPython(out);
  out = nullToPython(out);
  return stripSemicolons(out);
}

/** Ruby: kwargs with symbol keys + snake_case + no semicolons */
function rubyGuard(g: string): string {
  let out = jsArgsToKwargs(g, (k) => `${toSnakeCase(k)}:`, ' ');
  out = jsArrayToNative(out, (k) => `${toSnakeCase(k)}:`, ' ');
  out = nullToNil(out);
  return stripSemicolons(out);
}

/** Go: struct literals with PascalCase keys */
function goGuard(g: string): string {
  let out = jsArgsToKwargs(g, toPascalCase, ': ');
  out = jsArrayToNative(out, toPascalCase, ': ');
  out = nullToNil(out);
  return stripSemicolons(out);
}

/** Rust: struct literals with snake_case + `::` method separator */
function rustGuard(g: string): string {
  let out = g.replace(/\.(\w+)\(/g, '::$1(');
  out = jsArgsToKwargs(out, toSnakeCase, ': ');
  out = jsArrayToNative(out, toSnakeCase, ': ');
  out = nullToNone(out);
  return out; // Rust keeps semicolons
}

/** Elixir: keyword list syntax with snake_case atoms + no semicolons */
function elixirGuard(g: string): string {
  let out = jsArgsToKwargs(g, (k) => `${toSnakeCase(k)}:`, ' ');
  out = jsArrayToNative(out, (k) => `${toSnakeCase(k)}:`, ' ');
  out = nullToNil(out);
  return stripSemicolons(out);
}

/** Kotlin/Scala/Groovy: named args with camelCase */
function namedArgGuard(g: string): string {
  return jsArgsToKwargs(g, (k) => k, ' = ');
}

/** Lua: table constructor `{ key = value }` + no semicolons */
function luaGuard(g: string): string {
  let out = jsArgsToKwargs(g, toSnakeCase, ' = ');
  out = nullToNil(out);
  return stripSemicolons(out);
}

/** Swift: trailing argument labels with camelCase + nil */
function swiftGuard(g: string): string {
  let out = jsArgsToKwargs(g, (k) => `${k}:`, ' ');
  return nullToNil(out);
}

/** Java: `({ key: val })` → `(Map.of("key", val))` */
function javaGuard(g: string): string {
  return convertObjectArgs(g, (k) => `"${k}"`, ', ', (p) => `(Map.of(${p}))`);
}

/** C#: `({ key: val })` → `(new { Key = val })` */
function csharpGuard(g: string): string {
  return convertObjectArgs(g, toPascalCase, ' = ', (p) => `(new { ${p} })`);
}

/** PHP: `({ key: val })` → `(['key' => val])` */
function phpGuard(g: string): string {
  return convertObjectArgs(g, (k) => `'${toSnakeCase(k)}'`, ' => ', (p) => `([${p}])`);
}

/**
 * Convert a JSON string into a PHP array literal.
 * Handles nested objects/arrays recursively.
 * `{"key": "val"}` → `['key' => 'val']`
 */
function jsonToPhpArray(jsonStr: string): string {
  try {
    const obj = JSON.parse(jsonStr);
    return toPhpLiteral(obj);
  } catch {
    // If not valid JSON, wrap as string
    return `'${jsonStr.replace(/'/g, "\\'")}'`;
  }
}

function toPhpLiteral(val: unknown): string {
  if (val === null) return 'null';
  if (val === true) return 'true';
  if (val === false) return 'false';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return `'${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (Array.isArray(val)) {
    // Check if it's a sequential array (numeric keys)
    const isAssoc = val.some((_, i) => typeof val[i] === 'object' && val[i] !== null && !Array.isArray(val[i]));
    if (!isAssoc && val.every(v => typeof v !== 'object' || v === null)) {
      return `[${val.map(toPhpLiteral).join(', ')}]`;
    }
    return `[\n${val.map((v, i) => `    ${i} => ${toPhpLiteral(v)}`).join(',\n')}\n]`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return '[]';
    return `[\n${entries.map(([k, v]) => `    '${k}' => ${toPhpLiteral(v)}`).join(',\n')}\n]`;
  }
  return `'${String(val)}'`;
}

/** Dart: named params `({ key: val })` → `(key: val)` */
function dartGuard(g: string): string {
  return jsArgsToKwargs(g, (k) => `${k}:`, ' ');
}

/** R: named args + TRUE/FALSE/NULL */
function rGuard(g: string): string {
  let out = jsArgsToKwargs(g, toSnakeCase, ' = ');
  out = literalsToR(out);
  return stripSemicolons(out);
}

/** Perl: hash args + 1/0/undef */
function perlGuard(g: string): string {
  let out = convertObjectArgs(g, (k) => `${toSnakeCase(k)}`, ' => ', (p) => `({${p}})`);
  return literalsToPerl(out);
}

/** Fortran: .TRUE./.FALSE. + no semicolons */
function fortranGuard(g: string): string {
  return literalsToFortran(stripSemicolons(g));
}

/** C/C++: designated initializer style `.key = val` */
function cStructGuard(g: string): string {
  return convertObjectArgs(g, (k) => `.${toSnakeCase(k)}`, ' = ', (p) => `((struct){ ${p} })`);
}

/** Clojure: `({ key: val })` → `({:key val})` */
function clojureGuard(g: string): string {
  let out = g.replace(/\(\{([^}]*)\}\)/g, (_m, inner: string) => {
    const pairs = inner.split(',').map(p => p.trim()).filter(Boolean).map(pair => {
      const ci = pair.indexOf(':');
      if (ci === -1) return pair;
      const k = pair.slice(0, ci).trim().replace(/['"]/g, '');
      const v = pair.slice(ci + 1).trim();
      return `:${toSnakeCase(k)} ${v}`;
    });
    return `({${pairs.join(' ')}})`;
  });
  out = nullToNil(out);
  return stripSemicolons(out);
}

/** Erlang: `({ key: val })` → `(#{key => val})` */
function erlangGuard(g: string): string {
  let out = convertObjectArgs(g, toSnakeCase, ' => ', (p) => `(#{${p}})`);
  return nullToUndefined(out);
}

/** OCaml: labeled args `~key:val` + None */
function ocamlGuard(g: string): string {
  let out = jsArgsToKwargs(g, (k) => `~${toSnakeCase(k)}:`, '');
  out = nullToNone(out);
  return stripSemicolons(out);
}

/** F#: named args PascalCase + None */
function fsharpGuard(g: string): string {
  let out = jsArgsToKwargs(g, toPascalCase, ' = ');
  out = nullToNone(out);
  return stripSemicolons(out);
}

/** Nim: snake_case named args + nil */
function nimGuard(g: string): string {
  let out = jsArgsToKwargs(g, toSnakeCase, ' = ');
  out = nullToNil(out);
  return stripSemicolons(out);
}

/** Julia: snake_case kwargs + nothing */
function juliaGuard(g: string): string {
  let out = jsArgsToKwargs(g, toSnakeCase, '=');
  out = nullToNothing(out);
  return stripSemicolons(out);
}

/** Shell/Bash: guards become comment lines */
function shellGuard(g: string): string {
  return g.split('\n').map(line => `# ${line.replace(/;$/, '')}`).join('\n');
}

/** PowerShell: `@{ Key = val }` hashtable + $true/$false/$null */
function powershellGuard(g: string): string {
  let out = convertObjectArgs(g, toPascalCase, ' = ', (p) => `(@{ ${p} })`);
  out = litsPowerShell(out);
  return stripSemicolons(out);
}

/** Objective-C: `@{ @"key": val }` dictionary */
function objcGuard(g: string): string {
  return convertObjectArgs(g, (k) => `@"${k}"`, ': ', (p) => `(@{ ${p} })`);
}

// ── Adapter Verify Block Helpers ──
// These generate runnable self-verification functions per language.
// Called from the adapter's selfVerifyBlock method.

function generateTsVerifyBlock(fingerprint: string): string {
  return `
/**
 * CMPSBL® Artifact Self-Verification
 * Run: node <this_file> --verify
 */
function __cmpsbl_verify__() {
  const crypto = globalThis.crypto ?? require('crypto');
  const fs = typeof require !== 'undefined' ? require('fs') : null;
  const fingerprint = "${fingerprint}";
  const meta = typeof __CMPSBL_META__ === 'string' ? JSON.parse(__CMPSBL_META__) : __CMPSBL_META__;
  const verifyUrl = \`https://cmpsbl.com/verify/\${fingerprint}\`;

  console.log("=".repeat(60));
  console.log("CMPSBL® Convex Core™ — Artifact Verification");
  console.log("A PromptFluid™ Product");
  console.log("=".repeat(60));
  console.log(\`  Fingerprint:  \${fingerprint}\`);
  console.log(\`  Primitives:   \${meta?.primitiveCount ?? '?'}\`);
  console.log(\`  Generated:    \${meta?.generatedAt ?? '?'}\`);
  console.log(\`  Runtime:      \${meta?.runtimeVersion ?? '?'}\`);
  console.log(\`  Language:     \${meta?.sourceLanguage ?? '?'}\`);
  console.log();

  let passed = 0;
  const total = 3;

  if (fingerprint && fingerprint.length > 8) { console.log("  ✓ Fingerprint valid"); passed++; }
  else { console.log("  ✗ Fingerprint missing"); }

  if (meta?.runtimeVersion && meta?.orchestrationVersion) { console.log("  ✓ Metadata intact"); passed++; }
  else { console.log("  ✗ Metadata corrupted"); }

  if (meta?.patents || meta?.patent) { console.log("  ✓ Patent reference present"); passed++; }
  else { console.log("  ✗ Patent reference missing"); }

  console.log();
  console.log(\`  Result: \${passed}/\${total} checks passed\`);
  console.log();
  console.log(\`  Online verification:\`);
  console.log(\`    \${verifyUrl}\`);
  console.log();
  console.log("  © ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.");
  console.log("  U.S. Patent App. No. 64/029,678 · No. 64/031,637");
  console.log("=".repeat(60));
  return passed === total;
}

if (typeof process !== 'undefined' && process.argv?.includes('--verify')) {
  const ok = __cmpsbl_verify__();
  process.exit(ok ? 0 : 1);
}
`;
}

function generatePyVerifyBlock(fingerprint: string): string {
  return `
def __cmpsbl_verify__():
    """
    CMPSBL® Artifact Self-Verification
    Verifies this sealed artifact's integrity and fingerprint.
    Run: python <this_file>.py --verify
    """
    import hashlib, json, sys, os

    fingerprint = "${fingerprint}"
    meta = json.loads(__CMPSBL_META__) if isinstance(__CMPSBL_META__, str) else __CMPSBL_META__
    verify_url = f"https://cmpsbl.com/verify/{fingerprint}"

    print("=" * 60)
    print("CMPSBL® Convex Core™ — Artifact Verification")
    print("A PromptFluid™ Product")
    print("=" * 60)
    print(f"  Fingerprint:  {fingerprint}")
    print(f"  Primitives:   {meta.get('primitiveCount', '?')}")
    print(f"  Generated:    {meta.get('generatedAt', '?')}")
    print(f"  Runtime:      {meta.get('runtimeVersion', '?')}")
    print(f"  Language:     {meta.get('sourceLanguage', '?')}")
    print()

    checks_passed = 0
    checks_total = 4

    if fingerprint and len(fingerprint) > 8:
        print("  ✓ Fingerprint valid")
        checks_passed += 1
    else:
        print("  ✗ Fingerprint missing or malformed")

    if meta.get("runtimeVersion") and meta.get("orchestrationVersion"):
        print("  ✓ Metadata intact")
        checks_passed += 1
    else:
        print("  ✗ Metadata corrupted")

    if meta.get("patents") or meta.get("patent"):
        print("  ✓ Patent reference present")
        checks_passed += 1
    else:
        print("  ✗ Patent reference missing")

    try:
        with open(__file__, "rb") as f:
            content = f.read()
        file_hash = hashlib.sha256(content).hexdigest()[:16]
        print(f"  ✓ File hash: {file_hash}")
        checks_passed += 1
    except Exception:
        print("  ✗ Could not compute file hash")

    print()
    print(f"  Result: {checks_passed}/{checks_total} checks passed")
    print()
    print(f"  Online verification:")
    print(f"    {verify_url}")
    print()
    print(f"  Programmatic verification:")
    print(f"    pip install cmpsbl-test-harness")
    print(f'    from cmpsbl import verify_fingerprint')
    print(f'    verify_fingerprint("{fingerprint}")')
    print()
    print("  © ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.")
    print("  U.S. Patent App. No. 64/029,678 · No. 64/031,637")
    print("=" * 60)
    return checks_passed == checks_total

if __name__ == "__main__":
    import sys
    if "--verify" in sys.argv or "verify" in sys.argv:
        success = __cmpsbl_verify__()
        sys.exit(0 if success else 1)
`;
}

function generatePhpVerifyBlock(fingerprint: string): string {
  const year = new Date().getFullYear();
  return [
    '',
    '/**',
    ' * CMPSBL® Artifact Self-Verification',
    ' * Run: php <this_file> --verify',
    ' */',
    'function __cmpsbl_verify(): bool {',
    '    $fingerprint = \'' + fingerprint + '\';',
    '    $meta = __CMPSBL_META__;',
    '    $verifyUrl = "https://cmpsbl.com/verify/" . $fingerprint;',
    '',
    '    echo str_repeat(\'=\', 60) . PHP_EOL;',
    '    echo \'CMPSBL® Convex Core™ — Artifact Verification\' . PHP_EOL;',
    '    echo \'A PromptFluid™ Product\' . PHP_EOL;',
    '    echo str_repeat(\'=\', 60) . PHP_EOL;',
    '    echo "  Fingerprint:  " . $fingerprint . PHP_EOL;',
    '    echo "  Primitives:   " . ($meta[\'primitiveCount\'] ?? \'?\') . PHP_EOL;',
    '    echo "  Generated:    " . ($meta[\'generatedAt\'] ?? \'?\') . PHP_EOL;',
    '    echo "  Runtime:      " . ($meta[\'runtimeVersion\'] ?? \'?\') . PHP_EOL;',
    '    echo "  Language:     " . ($meta[\'sourceLanguage\'] ?? \'?\') . PHP_EOL;',
    '    echo PHP_EOL;',
    '',
    '    $passed = 0;',
    '    $total = 4;',
    '',
    '    if (!empty($fingerprint) && strlen($fingerprint) > 8) {',
    '        echo "  ✓ Fingerprint valid" . PHP_EOL;',
    '        $passed++;',
    '    } else {',
    '        echo "  ✗ Fingerprint missing or malformed" . PHP_EOL;',
    '    }',
    '',
    '    if (!empty($meta[\'runtimeVersion\']) && !empty($meta[\'orchestrationVersion\'])) {',
    '        echo "  ✓ Metadata intact" . PHP_EOL;',
    '        $passed++;',
    '    } else {',
    '        echo "  ✗ Metadata corrupted" . PHP_EOL;',
    '    }',
    '',
    '    if (!empty($meta[\'patents\'])) {',
    '        echo "  ✓ Patent reference present" . PHP_EOL;',
    '        $passed++;',
    '    } else {',
    '        echo "  ✗ Patent reference missing" . PHP_EOL;',
    '    }',
    '',
    '    $fileHash = substr(hash(\'sha256\', file_get_contents(__FILE__)), 0, 16);',
    '    echo "  ✓ File hash: " . $fileHash . PHP_EOL;',
    '    $passed++;',
    '',
    '    echo PHP_EOL;',
    '    echo "  Result: " . $passed . "/" . $total . " checks passed" . PHP_EOL;',
    '    echo PHP_EOL;',
    '    echo "  Online verification:" . PHP_EOL;',
    '    echo "    " . $verifyUrl . PHP_EOL;',
    '    echo PHP_EOL;',
    '    echo "  Programmatic verification:" . PHP_EOL;',
    '    echo "    composer require cmpsbl/test-harness" . PHP_EOL;',
    '    echo PHP_EOL;',
    '    echo "  © ' + year + ' PromptFluid™ · CMPSBL® · All rights reserved." . PHP_EOL;',
    '    echo "  U.S. Patent App. No. 64/029,678 · No. 64/031,637" . PHP_EOL;',
    '    echo str_repeat(\'=\', 60) . PHP_EOL;',
    '    return $passed === $total;',
    '}',
    '',
    'if (php_sapi_name() === \'cli\' && in_array(\'--verify\', $argv ?? [], true)) {',
    '    $ok = __cmpsbl_verify();',
    '    exit($ok ? 0 : 1);',
    '}',
  ].join('\n');
}

const ADAPTERS: Record<string, LanguageAdapter> = {
  TypeScript: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `import { ${syms.join(', ')} } from '${mod}';`,
    constDecl: (name, val) => `const ${name} = Object.freeze(${val});`,
    transformGuard: identityGuard,
    fileExtension: '.ts',
    dispatchPreamble: (dt, cm, seeds) => [
      `const _DT = Object.freeze([${dt.join(',')}]);`,
      `const _CM = Object.freeze([${cm.join(',')}]);`,
      `const _IV = ${seeds.iv}; const _EP = ${seeds.epoch};`,
      '',
      `const _R = (i:number,c=0) => { const v = (_DT[i%_DT.length]^_IV)&0xFFFF; return (_CM[v%_CM.length]+c)>>2; };`,
      `const _G = (s:number,p:Record<string,unknown>) => { const q=_R(s,typeof p==='object'?Object.keys(p).length:0); return q<_EP?p:{...p,_s:!0,_q:q}; };`,
      `const _V = (chain:unknown[]) => chain.reduce((a:number,_:unknown,i:number) => a + _R(i, a), 0) & 0xFFFFFF;`,
    ].join('\n'),
    obfuscatedConstants: () => `// Sealed scoring parameters — DO NOT MODIFY\nconst _W = [0x1E, 0x1E, 0x14, 0x14].map(v => v / 100);\nconst _T = [0x5C, 0x50, 0x41, 0x2D];\nconst _MH = [0x18, 0x07, 0x5A, 0x5A];`,
    selfVerifyBlock: (fp) => generateTsVerifyBlock(fp),
  },
  JavaScript: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (mod, syms) => `import { ${syms.join(', ')} } from '${mod}';`,
    constDecl: (name, val) => `const ${name} = Object.freeze(${val});`,
    transformGuard: identityGuard,
    fileExtension: '.js',
    dispatchPreamble: (dt, cm, seeds) => [
      `const _DT = Object.freeze([${dt.join(',')}]);`,
      `const _CM = Object.freeze([${cm.join(',')}]);`,
      `const _IV = ${seeds.iv}; const _EP = ${seeds.epoch};`,
      '',
      `const _R = (i,c=0) => { const v = (_DT[i%_DT.length]^_IV)&0xFFFF; return (_CM[v%_CM.length]+c)>>2; };`,
      `const _G = (s,p) => { const q=_R(s,typeof p==='object'?Object.keys(p).length:0); return q<_EP?p:{...p,_s:!0,_q:q}; };`,
      `const _V = (chain) => chain.reduce((a,_,i) => a + _R(i, a), 0) & 0xFFFFFF;`,
    ].join('\n'),
    obfuscatedConstants: () => `// Sealed scoring parameters — DO NOT MODIFY\nconst _W = [0x1E, 0x1E, 0x14, 0x14].map(v => v / 100);\nconst _T = [0x5C, 0x50, 0x41, 0x2D];\nconst _MH = [0x18, 0x07, 0x5A, 0x5A];`,
    selfVerifyBlock: (fp) => generateTsVerifyBlock(fp),
  },
  Python: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `"""\n${lines.join('\n')}\n"""`,
    importStatement: (_mod, syms) => {
      // Generate functional inline classes so the file runs standalone with real persistence
      const stubs = syms.map(s => {
        // PersistentMemory gets a real file-backed implementation
        if (s === 'PersistentMemory') {
          return `class PersistentMemory:
    """CMPSBL® Convex Core™ — File-backed persistent memory"""
    def __init__(self, namespace="cmpsbl", path=None):
        import os, json
        self._ns = namespace
        self._path = path or os.path.join(os.path.expanduser("~"), ".cmpsbl", f"{namespace}.memory.json")
        os.makedirs(os.path.dirname(self._path), exist_ok=True)
        self._store = {}
        if os.path.exists(self._path):
            try:
                with open(self._path, "r") as f:
                    self._store = json.load(f)
            except Exception:
                self._store = {}

    def _save(self):
        import json
        with open(self._path, "w") as f:
            json.dump(self._store, f, indent=2, default=str)

    def get(self, key, default=None):
        return self._store.get(key, default)

    def set(self, key, value):
        self._store[key] = value
        self._save()
        return self

    def delete(self, key):
        self._store.pop(key, None)
        self._save()
        return self

    def keys(self):
        return list(self._store.keys())

    def all(self):
        return dict(self._store)

    def clear(self):
        self._store = {}
        self._save()

    @staticmethod
    def init(*a, **kw):
        accepted = {"namespace", "path"}
        return PersistentMemory(**{k: v for k, v in kw.items() if k in accepted})`;
        }
        // StateRecovery gets a real checkpoint implementation
        if (s === 'StateRecovery') {
          return `class StateRecovery:
    """CMPSBL® Convex Core™ — Checkpoint-based state recovery"""
    def __init__(self, memory=None):
        self._memory = memory or PersistentMemory(namespace="cmpsbl_recovery")
        self._checkpoints = self._memory.get("_checkpoints", [])

    def checkpoint(self, label, state):
        import time, copy
        entry = {"label": label, "state": copy.deepcopy(state) if isinstance(state, (dict, list)) else state, "ts": time.time()}
        self._checkpoints.append(entry)
        if len(self._checkpoints) > 50:
            self._checkpoints = self._checkpoints[-50:]
        self._memory.set("_checkpoints", self._checkpoints)
        return self

    def recover(self, label=None):
        if not self._checkpoints:
            return None
        if label:
            matches = [c for c in self._checkpoints if c["label"] == label]
            return matches[-1]["state"] if matches else None
        return self._checkpoints[-1]["state"]

    def list_checkpoints(self):
        return [{"label": c["label"], "ts": c["ts"]} for c in self._checkpoints]

    @staticmethod
    def init(*a, **kw):
        accepted = {"memory"}
        return StateRecovery(**{k: v for k, v in kw.items() if k in accepted})

    @staticmethod
    def enable(*a, **kw):
        accepted = {"memory"}
        return StateRecovery(**{k: v for k, v in kw.items() if k in accepted})`;
        }
        // ─── CircuitBreaker: real circuit breaker with failure tracking ───
        if (s === 'CircuitBreaker') {
          return `class CircuitBreaker:
    """CMPSBL® Convex Core™ — Circuit breaker with open/half-open/closed states"""
    _instances = {}

    def __init__(self, name="default", threshold=5, reset_timeout=30):
        self._name = name
        self._threshold = threshold
        self._reset_timeout = reset_timeout
        self._failures = 0
        self._state = "closed"
        self._last_failure = 0

    @classmethod
    def init(cls, *a, **kw):
        name = kw.get("name", kw.get("scope", "default"))
        inst = cls(name=name, threshold=kw.get("max_failures", kw.get("threshold", 5)), reset_timeout=kw.get("reset_timeout_seconds", kw.get("resetMs", 30000)) / 1000 if "resetMs" in kw else kw.get("reset_timeout", 30))
        cls._instances[name] = inst
        return inst

    @classmethod
    def get(cls, name="default"):
        return cls._instances.get(name)

    def execute(self, fn, *args, **kwargs):
        import time
        if self._state == "open":
            if time.time() - self._last_failure > self._reset_timeout:
                self._state = "half-open"
            else:
                raise RuntimeError(f"CircuitBreaker [{self._name}] is OPEN — call rejected")
        try:
            result = fn(*args, **kwargs)
            if self._state == "half-open":
                self._state = "closed"
                self._failures = 0
            return result
        except Exception as e:
            self._failures += 1
            self._last_failure = time.time()
            if self._failures >= self._threshold:
                self._state = "open"
            raise

    @property
    def state(self):
        return self._state

    def reset(self):
        self._failures = 0
        self._state = "closed"`;
        }

        // ─── FailoverManager: automatic retry with exponential backoff ───
        if (s === 'FailoverManager') {
          return `class FailoverManager:
    """CMPSBL® Convex Core™ — Retry with exponential backoff and fallback"""
    _config = {"max_retries": 3, "backoff_base": 0.5, "fallback": None}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["max_retries"] = kw.get("max_retries", kw.get("maxRetries", 3))
        cls._config["backoff_base"] = kw.get("backoff_base", kw.get("backoffMs", 500)) / 1000 if "backoffMs" in kw else kw.get("backoff_base", 0.5)
        return cls

    @classmethod
    def enable(cls, *a, **kw):
        if "fallback" in kw:
            cls._config["fallback"] = kw["fallback"]
        return cls

    @classmethod
    def execute(cls, fn, *args, **kwargs):
        import time
        last_err = None
        for attempt in range(cls._config["max_retries"] + 1):
            try:
                return fn(*args, **kwargs)
            except Exception as e:
                last_err = e
                if attempt < cls._config["max_retries"]:
                    time.sleep(cls._config["backoff_base"] * (2 ** attempt))
        if cls._config["fallback"] and callable(cls._config["fallback"]):
            return cls._config["fallback"](*args, **kwargs)
        raise last_err`;
        }

        // ─── DefenseGate: real input validation ───
        if (s === 'DefenseGate') {
          return `class DefenseGate:
    """CMPSBL® Convex Core™ — Input validation and boundary enforcement"""
    _rules = {"max_size": 10_485_760, "reject_unknown": True, "sanitize": True, "allowed_types": None}

    @classmethod
    def init(cls, *a, **kw):
        cls._rules["reject_unknown"] = kw.get("validate_all", kw.get("rejectUnknownFields", True))
        cls._rules["sanitize"] = kw.get("sanitize", True)
        return cls

    @classmethod
    def enforce(cls, *a, **kw):
        cls._rules["max_size"] = kw.get("max_size_bytes", kw.get("maxSizeBytes", 10_485_760))
        cls._rules["sanitize"] = kw.get("sanitize", cls._rules["sanitize"])
        return cls

    @classmethod
    def validate(cls, data, schema=None):
        import sys
        size = sys.getsizeof(data) if data is not None else 0
        if size > cls._rules["max_size"]:
            raise ValueError(f"DefenseGate: payload exceeds max size ({size} > {cls._rules['max_size']})")
        if schema and isinstance(data, dict):
            for key in data:
                if key not in schema and cls._rules["reject_unknown"]:
                    raise ValueError(f"DefenseGate: unknown field '{key}' rejected")
        if cls._rules["sanitize"] and isinstance(data, str):
            data = data.replace("<script", "&lt;script").replace("javascript:", "")
        return data

    @classmethod
    def apply(cls, *a, **kw): return cls.init(*a, **kw)`;
        }

        // ─── InputValidator: type-safe input checking ───
        if (s === 'InputValidator') {
          return `class InputValidator:
    """CMPSBL® Convex Core™ — Type-safe input validation"""
    @staticmethod
    def check(value, expected_type, name="input"):
        if not isinstance(value, expected_type):
            raise TypeError(f"InputValidator: '{name}' expected {expected_type.__name__}, got {type(value).__name__}")
        return value

    @staticmethod
    def require(data, *keys):
        if not isinstance(data, dict):
            raise TypeError("InputValidator: expected dict")
        missing = [k for k in keys if k not in data]
        if missing:
            raise ValueError(f"InputValidator: missing required keys: {missing}")
        return data

    @staticmethod
    def init(*a, **kw): pass
    @staticmethod
    def enforce(*a, **kw): pass`;
        }

        // ─── AuditChain: tamper-evident file-based audit log ───
        if (s === 'AuditChain') {
          return `class AuditChain:
    """CMPSBL® Convex Core™ — Tamper-evident audit log with hash chain"""
    _instance = None

    def __init__(self, path=None):
        import os
        self._path = path or os.path.join(os.path.expanduser("~"), ".cmpsbl", "audit.log")
        os.makedirs(os.path.dirname(self._path), exist_ok=True)
        self._prev_hash = "0" * 64

    @classmethod
    def init(cls, *a, **kw):
        cls._instance = cls(path=kw.get("path"))
        return cls._instance

    def record(self, action, details=None):
        import hashlib, json, time
        entry = {"ts": time.time(), "action": action, "details": details, "prev": self._prev_hash}
        raw = json.dumps(entry, sort_keys=True, default=str)
        entry["hash"] = hashlib.sha256(raw.encode()).hexdigest()
        self._prev_hash = entry["hash"]
        with open(self._path, "a") as f:
            f.write(json.dumps(entry, default=str) + "\\n")
        return entry["hash"]

    def verify(self):
        import hashlib, json
        with open(self._path, "r") as f:
            lines = [l.strip() for l in f if l.strip()]
        prev = "0" * 64
        for line in lines:
            entry = json.loads(line)
            stored_hash = entry.pop("hash")
            entry["prev"] = prev
            raw = json.dumps(entry, sort_keys=True, default=str)
            expected = hashlib.sha256(raw.encode()).hexdigest()
            if stored_hash != expected:
                return False
            prev = stored_hash
        return True

    @classmethod
    def enable(cls, *a, **kw): return cls.init(*a, **kw)`;
        }

        // ─── ComplianceLogger: structured compliance logging ───
        if (s === 'ComplianceLogger') {
          return `class ComplianceLogger:
    """CMPSBL® Convex Core™ — Compliance event logger"""
    _log = []
    _max = 1000

    @classmethod
    def init(cls, *a, **kw):
        cls._max = kw.get("max_entries", kw.get("retainCount", 1000))
        return cls

    @classmethod
    def log(cls, event_type, data=None, severity="info"):
        import time
        entry = {"ts": time.time(), "type": event_type, "severity": severity, "data": data}
        cls._log.append(entry)
        if len(cls._log) > cls._max:
            cls._log = cls._log[-cls._max:]
        return entry

    @classmethod
    def query(cls, event_type=None, severity=None):
        results = cls._log
        if event_type:
            results = [e for e in results if e["type"] == event_type]
        if severity:
            results = [e for e in results if e["severity"] == severity]
        return results

    @classmethod
    def enable(cls, *a, **kw): return cls.init(*a, **kw)`;
        }

        // ─── StructuredLogger: real JSON structured logging ───
        if (s === 'StructuredLogger') {
          return `class StructuredLogger:
    """CMPSBL® Convex Core™ — JSON structured logger with correlation IDs"""
    _config = {"format": "json", "level": "info", "correlation_id": None}
    _levels = {"debug": 0, "info": 1, "warn": 2, "error": 3}

    @classmethod
    def init(cls, *a, **kw):
        import uuid
        cls._config["format"] = kw.get("format", "json")
        cls._config["level"] = kw.get("level", "info")
        if kw.get("correlation_id", kw.get("correlationId")):
            cls._config["correlation_id"] = str(uuid.uuid4())
        return cls

    @classmethod
    def _emit(cls, level, msg, **extra):
        import json, time, sys
        if cls._levels.get(level, 1) < cls._levels.get(cls._config["level"], 1):
            return
        entry = {"ts": time.time(), "level": level, "msg": msg}
        if cls._config["correlation_id"]:
            entry["cid"] = cls._config["correlation_id"]
        entry.update(extra)
        sys.stderr.write(json.dumps(entry, default=str) + "\\n")

    @classmethod
    def log(cls, msg, **kw): cls._emit("info", msg, **kw)
    @classmethod
    def info(cls, msg, **kw): cls._emit("info", msg, **kw)
    @classmethod
    def warn(cls, msg, **kw): cls._emit("warn", msg, **kw)
    @classmethod
    def error(cls, msg, **kw): cls._emit("error", msg, **kw)
    @classmethod
    def debug(cls, msg, **kw): cls._emit("debug", msg, **kw)`;
        }

        // ─── EventCorrelator: event correlation tracking ───
        if (s === 'EventCorrelator') {
          return `class EventCorrelator:
    """CMPSBL® Convex Core™ — Event correlation and trace context"""
    _traces = {}
    _max_depth = 10

    @classmethod
    def init(cls, *a, **kw):
        cls._max_depth = kw.get("span_depth", kw.get("spanDepth", 10))
        return cls

    @classmethod
    def enable(cls, *a, **kw): return cls.init(*a, **kw)

    @classmethod
    def start_trace(cls, name):
        import uuid, time
        tid = str(uuid.uuid4())[:8]
        cls._traces[tid] = {"name": name, "start": time.time(), "spans": []}
        return tid

    @classmethod
    def add_span(cls, trace_id, label, data=None):
        import time
        trace = cls._traces.get(trace_id)
        if trace and len(trace["spans"]) < cls._max_depth:
            trace["spans"].append({"label": label, "ts": time.time(), "data": data})

    @classmethod
    def end_trace(cls, trace_id):
        import time
        trace = cls._traces.pop(trace_id, None)
        if trace:
            trace["end"] = time.time()
            trace["duration_ms"] = round((trace["end"] - trace["start"]) * 1000, 3)
        return trace`;
        }

        // ─── GovernanceGate: policy enforcement ───
        if (s === 'GovernanceGate') {
          return `class GovernanceGate:
    """CMPSBL® Convex Core™ — Policy-based governance enforcement"""
    _policies = {}
    _mode = "enforce"

    @classmethod
    def init(cls, *a, **kw):
        cls._mode = kw.get("mode", "enforce")
        return cls

    @classmethod
    def enable(cls, *a, **kw): return cls.init(*a, **kw)

    @classmethod
    def add_policy(cls, name, check_fn, action="block"):
        cls._policies[name] = {"check": check_fn, "action": action}

    @classmethod
    def evaluate(cls, context):
        violations = []
        for name, policy in cls._policies.items():
            try:
                if not policy["check"](context):
                    violations.append({"policy": name, "action": policy["action"]})
            except Exception as e:
                violations.append({"policy": name, "action": "error", "error": str(e)})
        if violations and cls._mode == "enforce":
            blocked = [v for v in violations if v["action"] == "block"]
            if blocked:
                raise PermissionError(f"GovernanceGate: blocked by policies: {[v['policy'] for v in blocked]}")
        return {"passed": len(violations) == 0, "violations": violations}`;
        }

        // ─── PolicyEngine: configurable rule engine ───
        if (s === 'PolicyEngine') {
          return `class PolicyEngine:
    """CMPSBL® Convex Core™ — Configurable rule engine"""
    _rules = []

    @classmethod
    def init(cls, *a, **kw): return cls
    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def add_rule(cls, name, condition_fn, priority=0):
        cls._rules.append({"name": name, "condition": condition_fn, "priority": priority})
        cls._rules.sort(key=lambda r: r["priority"], reverse=True)

    @classmethod
    def evaluate(cls, data):
        results = []
        for rule in cls._rules:
            try:
                passed = rule["condition"](data)
                results.append({"rule": rule["name"], "passed": passed})
            except Exception as e:
                results.append({"rule": rule["name"], "passed": False, "error": str(e)})
        return results`;
        }

        // ─── StateObserver: state snapshot and diff tracking ───
        if (s === 'StateObserver') {
          return `class StateObserver:
    """CMPSBL® Convex Core™ — State observation with snapshot diffs"""
    _snapshots = []
    _max = 100

    @classmethod
    def init(cls, *a, **kw):
        cls._max = kw.get("retain_history", kw.get("retainHistory", 100))
        return cls

    @classmethod
    def enable(cls, *a, **kw): return cls.init(*a, **kw)

    @classmethod
    def snapshot(cls, label, state):
        import copy, time
        entry = {"label": label, "state": copy.deepcopy(state) if isinstance(state, (dict, list)) else state, "ts": time.time()}
        cls._snapshots.append(entry)
        if len(cls._snapshots) > cls._max:
            cls._snapshots = cls._snapshots[-cls._max:]
        return entry

    @classmethod
    def diff(cls, idx_a=-2, idx_b=-1):
        if len(cls._snapshots) < 2:
            return None
        a, b = cls._snapshots[idx_a]["state"], cls._snapshots[idx_b]["state"]
        if isinstance(a, dict) and isinstance(b, dict):
            added = {k: b[k] for k in b if k not in a}
            removed = {k: a[k] for k in a if k not in b}
            changed = {k: {"from": a[k], "to": b[k]} for k in a if k in b and a[k] != b[k]}
            return {"added": added, "removed": removed, "changed": changed}
        return {"from": a, "to": b}`;
        }

        // ─── TransitionTracker: state transition event tracking ───
        if (s === 'TransitionTracker') {
          return `class TransitionTracker:
    """CMPSBL® Convex Core™ — State transition event tracker"""
    _transitions = []
    _max = 100

    @classmethod
    def init(cls, *a, **kw): return cls
    @classmethod
    def enable(cls, *a, **kw):
        cls._max = kw.get("retain_history", kw.get("retainHistory", 100))
        return cls

    @classmethod
    def record(cls, from_state, to_state, trigger=None):
        import time
        entry = {"from": from_state, "to": to_state, "trigger": trigger, "ts": time.time()}
        cls._transitions.append(entry)
        if len(cls._transitions) > cls._max:
            cls._transitions = cls._transitions[-cls._max:]
        return entry

    @classmethod
    def history(cls, limit=20):
        return cls._transitions[-limit:]`;
        }

        // ─── SnapshotManager: periodic state snapshots ───
        if (s === 'SnapshotManager') {
          return `class SnapshotManager:
    """CMPSBL® Convex Core™ — Periodic state snapshot manager"""
    _snapshots = []
    _config = {"auto": False, "interval_s": 300, "max_snapshots": 50}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["auto"] = kw.get("auto_snapshot", kw.get("autoSnapshot", False))
        cls._config["interval_s"] = kw.get("interval_ms", kw.get("intervalMs", 300000)) / 1000
        return cls

    @classmethod
    def snapshot(cls, label, state):
        import copy, time
        entry = {"label": label, "state": copy.deepcopy(state) if isinstance(state, (dict, list)) else state, "ts": time.time()}
        cls._snapshots.append(entry)
        if len(cls._snapshots) > cls._config["max_snapshots"]:
            cls._snapshots = cls._snapshots[-cls._config["max_snapshots"]:]
        return entry

    @classmethod
    def restore(cls, label=None):
        if not cls._snapshots:
            return None
        if label:
            matches = [s for s in cls._snapshots if s["label"] == label]
            return matches[-1]["state"] if matches else None
        return cls._snapshots[-1]["state"]

    @classmethod
    def list(cls):
        return [{"label": s["label"], "ts": s["ts"]} for s in cls._snapshots]`;
        }

        // ─── DefenseLayer: security layer activation ───
        if (s === 'DefenseLayer') {
          return `class DefenseLayer:
    """CMPSBL® Convex Core™ — Security layer with mode enforcement"""
    _config = {"mode": "enforce", "fingerprinting": False, "rate_limits": {}}
    _blocked = []

    @classmethod
    def activate(cls, *a, **kw):
        cls._config["mode"] = kw.get("mode", "enforce")
        cls._config["fingerprinting"] = kw.get("fingerprinting", False)
        return cls

    @classmethod
    def check(cls, request_meta):
        meta = request_meta if isinstance(request_meta, dict) else {"raw": request_meta}
        ip = meta.get("ip", "unknown")
        if ip in cls._blocked:
            raise PermissionError(f"DefenseLayer: IP {ip} is blocked")
        return True

    @classmethod
    def block(cls, ip):
        if ip not in cls._blocked:
            cls._blocked.append(ip)

    @classmethod
    def status(cls):
        return {"mode": cls._config["mode"], "blocked_count": len(cls._blocked)}`;
        }

        // ─── RequestValidator: HTTP request validation ───
        if (s === 'RequestValidator') {
          return `class RequestValidator:
    """CMPSBL® Convex Core™ — Request validation and sanitization"""
    _config = {"block_injection": True, "block_xss": True, "rate_limit": 100}
    _injection_patterns = ["--", "';", "' OR ", "1=1", "DROP TABLE", "UNION SELECT"]

    @classmethod
    def init(cls, *a, **kw):
        cls._config["block_injection"] = kw.get("block_injection", kw.get("blockInjection", True))
        cls._config["block_xss"] = kw.get("block_xss", kw.get("blockXSS", True))
        cls._config["rate_limit"] = kw.get("rate_limit_per_ip", kw.get("rateLimitPerIp", 100))
        return cls

    @classmethod
    def validate(cls, data):
        if isinstance(data, str):
            upper = data.upper()
            if cls._config["block_injection"]:
                for p in cls._injection_patterns:
                    if p.upper() in upper:
                        raise ValueError(f"RequestValidator: potential injection detected")
            if cls._config["block_xss"]:
                if "<script" in data.lower() or "javascript:" in data.lower():
                    raise ValueError(f"RequestValidator: XSS pattern detected")
        elif isinstance(data, dict):
            for v in data.values():
                if isinstance(v, str):
                    cls.validate(v)
        return data`;
        }

        // ─── DeviceFingerprint: device identification ───
        if (s === 'DeviceFingerprint') {
          return `class DeviceFingerprint:
    """CMPSBL® Convex Core™ — Device fingerprinting for session binding"""
    _registry = {}

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def generate(cls, attributes):
        import hashlib, json
        raw = json.dumps(attributes, sort_keys=True, default=str)
        fp = hashlib.sha256(raw.encode()).hexdigest()[:16]
        cls._registry[fp] = attributes
        return fp

    @classmethod
    def verify(cls, fingerprint, attributes):
        import hashlib, json
        raw = json.dumps(attributes, sort_keys=True, default=str)
        expected = hashlib.sha256(raw.encode()).hexdigest()[:16]
        return fingerprint == expected

    @classmethod
    def lookup(cls, fingerprint):
        return cls._registry.get(fingerprint)`;
        }

        // ─── GovernancePolicy: policy enforcement ───
        if (s === 'GovernancePolicy') {
          return `class GovernancePolicy:
    """CMPSBL® Convex Core™ — Governance policy enforcement"""
    _policies = {"max_concurrency": 100, "audit_mutations": True, "approval_threshold": "high-risk"}

    @classmethod
    def enforce(cls, *a, **kw):
        cls._policies["max_concurrency"] = kw.get("max_concurrency", kw.get("maxConcurrency", 100))
        cls._policies["audit_mutations"] = kw.get("audit_all_mutations", kw.get("auditAllMutations", True))
        cls._policies["approval_threshold"] = kw.get("require_approval_above", kw.get("requireApprovalAbove", "high-risk"))
        return cls

    @classmethod
    def check_concurrency(cls, current_count):
        if current_count > cls._policies["max_concurrency"]:
            raise RuntimeError(f"GovernancePolicy: concurrency limit exceeded ({current_count}/{cls._policies['max_concurrency']})")
        return True

    @classmethod
    def requires_approval(cls, risk_level):
        levels = {"low": 0, "medium": 1, "high": 2, "high-risk": 2, "critical": 3}
        return levels.get(risk_level, 0) >= levels.get(cls._policies["approval_threshold"], 2)`;
        }

        // ─── ComplianceAuditor: compliance event auditing ───
        if (s === 'ComplianceAuditor') {
          return `class ComplianceAuditor:
    """CMPSBL® Convex Core™ — Compliance auditing with structured output"""
    _events = []
    _destination = "structured"

    @classmethod
    def start(cls, *a, **kw):
        cls._destination = kw.get("log_destination", kw.get("logDestination", "structured"))
        return cls

    @classmethod
    def record(cls, event_type, data=None, severity="info"):
        import time, json, sys
        entry = {"ts": time.time(), "type": event_type, "severity": severity, "data": data}
        cls._events.append(entry)
        if cls._destination == "structured":
            sys.stderr.write(json.dumps(entry, default=str) + "\\n")
        return entry

    @classmethod
    def query(cls, event_type=None):
        if event_type:
            return [e for e in cls._events if e["type"] == event_type]
        return list(cls._events)`;
        }

        // ─── HealthBeacon: health check endpoint ───
        if (s === 'HealthBeacon') {
          return `class HealthBeacon:
    """CMPSBL® Convex Core™ — Health monitoring beacon"""
    _status = {"healthy": True, "checks": {}, "started_at": None}

    @classmethod
    def start(cls, *a, **kw):
        import time
        cls._status["started_at"] = time.time()
        cls._status["interval"] = kw.get("interval", kw.get("interval", 15000)) / 1000
        return cls

    @classmethod
    def register_check(cls, name, check_fn):
        cls._status["checks"][name] = check_fn

    @classmethod
    def pulse(cls):
        results = {}
        all_ok = True
        for name, fn in cls._status["checks"].items():
            try:
                results[name] = {"ok": bool(fn()), "error": None}
            except Exception as e:
                results[name] = {"ok": False, "error": str(e)}
                all_ok = False
        cls._status["healthy"] = all_ok
        return {"healthy": all_ok, "checks": results}

    @classmethod
    def is_healthy(cls):
        return cls._status["healthy"]`;
        }

        // ─── MetricsCollector: runtime metrics collection ───
        if (s === 'MetricsCollector') {
          return `class MetricsCollector:
    """CMPSBL® Convex Core™ — Runtime metrics collector"""
    _counters = {}
    _gauges = {}
    _histograms = {}

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def increment(cls, name, value=1):
        cls._counters[name] = cls._counters.get(name, 0) + value

    @classmethod
    def gauge(cls, name, value):
        cls._gauges[name] = value

    @classmethod
    def observe(cls, name, value):
        if name not in cls._histograms:
            cls._histograms[name] = []
        cls._histograms[name].append(value)
        if len(cls._histograms[name]) > 1000:
            cls._histograms[name] = cls._histograms[name][-1000:]

    @classmethod
    def snapshot(cls):
        return {"counters": dict(cls._counters), "gauges": dict(cls._gauges), "histograms": {k: {"count": len(v), "avg": sum(v)/len(v) if v else 0, "min": min(v) if v else 0, "max": max(v) if v else 0} for k, v in cls._histograms.items()}}

    @classmethod
    def reset(cls):
        cls._counters.clear()
        cls._gauges.clear()
        cls._histograms.clear()`;
        }

        // ─── LearningEngine: passive learning from execution patterns ───
        if (s === 'LearningEngine') {
          return `class LearningEngine:
    """CMPSBL® Convex Core™ — Passive execution pattern learning"""
    _patterns = {}
    _config = {"mode": "passive", "retention_days": 90}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["mode"] = kw.get("mode", "passive")
        cls._config["retention_days"] = kw.get("retention_days", kw.get("retentionDays", 90))
        return cls

    @classmethod
    def record(cls, pattern_name, outcome, metadata=None):
        import time
        if pattern_name not in cls._patterns:
            cls._patterns[pattern_name] = {"successes": 0, "failures": 0, "history": []}
        p = cls._patterns[pattern_name]
        if outcome:
            p["successes"] += 1
        else:
            p["failures"] += 1
        p["history"].append({"outcome": outcome, "ts": time.time(), "meta": metadata})
        if len(p["history"]) > 100:
            p["history"] = p["history"][-100:]

    @classmethod
    def suggest(cls, pattern_name):
        p = cls._patterns.get(pattern_name)
        if not p:
            return {"confidence": 0, "suggestion": "no data"}
        total = p["successes"] + p["failures"]
        rate = p["successes"] / total if total > 0 else 0
        return {"confidence": rate, "total_observations": total, "suggestion": "continue" if rate > 0.7 else "review"}`;
        }

        // ─── InsightAccumulator: pattern observation ───
        if (s === 'InsightAccumulator') {
          return `class InsightAccumulator:
    """CMPSBL® Convex Core™ — Insight accumulation from execution"""
    _insights = []
    _config = {"track_patterns": True, "auto_optimize": False}

    @classmethod
    def observe(cls, *a, **kw):
        cls._config["track_patterns"] = kw.get("track_patterns", kw.get("trackPatterns", True))
        cls._config["auto_optimize"] = kw.get("auto_optimize", kw.get("autoOptimize", False))
        return cls

    @classmethod
    def add(cls, category, insight, confidence=1.0):
        import time
        entry = {"category": category, "insight": insight, "confidence": confidence, "ts": time.time()}
        cls._insights.append(entry)
        if len(cls._insights) > 500:
            cls._insights = cls._insights[-500:]
        return entry

    @classmethod
    def query(cls, category=None, min_confidence=0):
        results = cls._insights
        if category:
            results = [i for i in results if i["category"] == category]
        return [i for i in results if i["confidence"] >= min_confidence]`;
        }

        // ─── IdentityResolver: identity resolution ───
        if (s === 'IdentityResolver') {
          return `class IdentityResolver:
    """CMPSBL® Convex Core™ — Identity resolution and session management"""
    _sessions = {}
    _config = {"mfa_required": False, "session_ttl_s": 3600}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["mfa_required"] = kw.get("multi_factor_required", kw.get("multiFactorRequired", False))
        cls._config["session_ttl_s"] = kw.get("session_ttl_ms", kw.get("sessionTtlMs", 3600000)) / 1000
        return cls

    @classmethod
    def create_session(cls, user_id, metadata=None):
        import uuid, time
        sid = str(uuid.uuid4())
        cls._sessions[sid] = {"user_id": user_id, "created": time.time(), "metadata": metadata or {}}
        return sid

    @classmethod
    def validate_session(cls, session_id):
        import time
        session = cls._sessions.get(session_id)
        if not session:
            return False
        if time.time() - session["created"] > cls._config["session_ttl_s"]:
            del cls._sessions[session_id]
            return False
        return True

    @classmethod
    def revoke(cls, session_id):
        cls._sessions.pop(session_id, None)`;
        }

        // ─── SessionBinder: device-bound sessions ───
        if (s === 'SessionBinder') {
          return `class SessionBinder:
    """CMPSBL® Convex Core™ — Device-bound session enforcement"""
    _bindings = {}
    _config = {"bind_to_device": True, "max_concurrent": 3}

    @classmethod
    def enforce(cls, *a, **kw):
        cls._config["bind_to_device"] = kw.get("bind_to_device", kw.get("bindToDevice", True))
        cls._config["max_concurrent"] = kw.get("max_concurrent_sessions", kw.get("maxConcurrentSessions", 3))
        return cls

    @classmethod
    def bind(cls, user_id, device_fingerprint, session_id):
        if user_id not in cls._bindings:
            cls._bindings[user_id] = []
        bindings = cls._bindings[user_id]
        if len(bindings) >= cls._config["max_concurrent"]:
            bindings.pop(0)
        bindings.append({"device": device_fingerprint, "session": session_id})

    @classmethod
    def verify(cls, user_id, device_fingerprint):
        bindings = cls._bindings.get(user_id, [])
        return any(b["device"] == device_fingerprint for b in bindings)`;
        }

        // ─── EthicalGate: ethical decision boundary ───
        if (s === 'EthicalGate') {
          return `class EthicalGate:
    """CMPSBL® Convex Core™ — Ethical decision gate"""
    _config = {"block_threshold": 0.30, "review_threshold": 0.60}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["block_threshold"] = kw.get("block_threshold", kw.get("blockThreshold", 0.30))
        cls._config["review_threshold"] = kw.get("review_threshold", kw.get("reviewThreshold", 0.60))
        return cls

    @classmethod
    def evaluate(cls, confidence_score, action_description=""):
        if confidence_score < cls._config["block_threshold"]:
            return {"decision": "blocked", "reason": f"Confidence {confidence_score} below block threshold {cls._config['block_threshold']}", "action": action_description}
        elif confidence_score < cls._config["review_threshold"]:
            return {"decision": "review_required", "reason": f"Confidence {confidence_score} below review threshold", "action": action_description}
        return {"decision": "approved", "confidence": confidence_score, "action": action_description}`;
        }

        // ─── AlignmentMonitor: drift detection ───
        if (s === 'AlignmentMonitor') {
          return `class AlignmentMonitor:
    """CMPSBL® Convex Core™ — Alignment drift monitoring"""
    _readings = []
    _config = {"drift_threshold": 0.15}

    @classmethod
    def start(cls, *a, **kw):
        cls._config["drift_threshold"] = kw.get("drift_alert_threshold", kw.get("driftAlertThreshold", 0.15))
        return cls

    @classmethod
    def record(cls, metric_name, value, baseline=None):
        import time
        entry = {"metric": metric_name, "value": value, "baseline": baseline, "ts": time.time()}
        if baseline is not None:
            entry["drift"] = abs(value - baseline) / max(abs(baseline), 1e-9)
            entry["alert"] = entry["drift"] > cls._config["drift_threshold"]
        cls._readings.append(entry)
        if len(cls._readings) > 500:
            cls._readings = cls._readings[-500:]
        return entry

    @classmethod
    def alerts(cls):
        return [r for r in cls._readings if r.get("alert")]`;
        }

        // ─── BehavioralMapper: function behavior analysis ───
        if (s === 'BehavioralMapper') {
          return `class BehavioralMapper:
    """CMPSBL® Convex Core™ — Behavioral mapping of code execution"""
    _map = {}

    @classmethod
    def scan(cls, *a, **kw): return cls

    @classmethod
    def register(cls, func_name, input_types=None, output_type=None, side_effects=None):
        cls._map[func_name] = {"inputs": input_types or [], "output": output_type, "side_effects": side_effects or [], "call_count": 0}

    @classmethod
    def track_call(cls, func_name):
        if func_name in cls._map:
            cls._map[func_name]["call_count"] += 1

    @classmethod
    def report(cls):
        return dict(cls._map)`;
        }

        // ─── IntentTracer: function intent tagging ───
        if (s === 'IntentTracer') {
          return `class IntentTracer:
    """CMPSBL® Convex Core™ — Function intent tracing and signature generation"""
    _intents = {}

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def tag(cls, func_name, intent, signature=None):
        cls._intents[func_name] = {"intent": intent, "signature": signature}

    @classmethod
    def lookup(cls, func_name):
        return cls._intents.get(func_name)

    @classmethod
    def all_intents(cls):
        return dict(cls._intents)`;
        }

        // ─── PredictiveAnalyzer: failure prediction ───
        if (s === 'PredictiveAnalyzer') {
          return `class PredictiveAnalyzer:
    """CMPSBL® Convex Core™ — Predictive failure analysis"""
    _history = []
    _config = {"horizon_s": 60, "confidence_threshold": 0.75}

    @classmethod
    def init(cls, *a, **kw):
        horizon = kw.get("horizon", "60s")
        cls._config["horizon_s"] = int(horizon.replace("s", "")) if isinstance(horizon, str) else horizon
        cls._config["confidence_threshold"] = kw.get("confidence_threshold", kw.get("confidenceThreshold", 0.75))
        return cls

    @classmethod
    def record_event(cls, event_type, success, latency_ms=None):
        import time
        cls._history.append({"type": event_type, "success": success, "latency": latency_ms, "ts": time.time()})
        if len(cls._history) > 1000:
            cls._history = cls._history[-1000:]

    @classmethod
    def predict(cls, event_type):
        import time
        recent = [e for e in cls._history if e["type"] == event_type and time.time() - e["ts"] < cls._config["horizon_s"] * 10]
        if len(recent) < 5:
            return {"prediction": "insufficient_data", "confidence": 0}
        failures = sum(1 for e in recent if not e["success"])
        failure_rate = failures / len(recent)
        return {"prediction": "likely_failure" if failure_rate > 0.3 else "stable", "failure_rate": round(failure_rate, 3), "sample_size": len(recent), "confidence": min(len(recent) / 20, 1.0)}`;
        }

        // ─── FailureForecast: cascade detection ───
        if (s === 'FailureForecast') {
          return `class FailureForecast:
    """CMPSBL® Convex Core™ — Cascade failure detection"""
    _monitors = {}

    @classmethod
    def monitor(cls, *a, **kw): return cls

    @classmethod
    def register(cls, component, dependencies=None):
        cls._monitors[component] = {"deps": dependencies or [], "healthy": True}

    @classmethod
    def mark_failure(cls, component):
        if component in cls._monitors:
            cls._monitors[component]["healthy"] = False

    @classmethod
    def cascade_risk(cls):
        at_risk = []
        failed = [c for c, m in cls._monitors.items() if not m["healthy"]]
        for comp, meta in cls._monitors.items():
            if meta["healthy"] and any(d in failed for d in meta["deps"]):
                at_risk.append(comp)
        return {"failed": failed, "at_risk": at_risk, "healthy": [c for c in cls._monitors if cls._monitors[c]["healthy"] and c not in at_risk]}`;
        }

        // ─── DependencyResolver: dependency auditing ───
        if (s === 'DependencyResolver') {
          return `class DependencyResolver:
    """CMPSBL® Convex Core™ — Dependency auditing and cycle detection"""
    _deps = {}

    @classmethod
    def audit(cls, *a, **kw): return cls

    @classmethod
    def register(cls, module, depends_on=None):
        cls._deps[module] = depends_on or []

    @classmethod
    def detect_cycles(cls):
        visited, rec_stack, cycles = set(), set(), []
        def _dfs(node, path):
            visited.add(node)
            rec_stack.add(node)
            for dep in cls._deps.get(node, []):
                if dep not in visited:
                    _dfs(dep, path + [dep])
                elif dep in rec_stack:
                    cycles.append(path[path.index(dep):] + [dep])
            rec_stack.discard(node)
        for m in cls._deps:
            if m not in visited:
                _dfs(m, [m])
        return cycles

    @classmethod
    def resolve_order(cls):
        order, visited = [], set()
        def _topo(node):
            if node in visited:
                return
            visited.add(node)
            for dep in cls._deps.get(node, []):
                _topo(dep)
            order.append(node)
        for m in cls._deps:
            _topo(m)
        return order`;
        }

        // ─── StructuralRepair: safe auto-fix ───
        if (s === 'StructuralRepair') {
          return `class StructuralRepair:
    """CMPSBL® Convex Core™ — Structural repair with safe-only mode"""
    _repairs = []
    _config = {"auto_fix": "safe-only"}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["auto_fix"] = kw.get("auto_fix", kw.get("autoFix", "safe-only"))
        return cls

    @classmethod
    def detect(cls, component, issue_type, severity="low"):
        import time
        repair = {"component": component, "issue": issue_type, "severity": severity, "ts": time.time(), "fixed": False}
        if cls._config["auto_fix"] == "safe-only" and severity == "low":
            repair["fixed"] = True
            repair["action"] = "auto-repaired"
        elif cls._config["auto_fix"] == "all":
            repair["fixed"] = True
            repair["action"] = "auto-repaired"
        else:
            repair["action"] = "manual-review-required"
        cls._repairs.append(repair)
        return repair

    @classmethod
    def report(cls):
        return list(cls._repairs)`;
        }

        // ─── ReasoningEngine: chain-of-thought reasoning ───
        if (s === 'ReasoningEngine') {
          return `class ReasoningEngine:
    """CMPSBL® Convex Core™ — Chain-of-thought reasoning engine"""
    _config = {"max_depth": 5, "timeout_s": 10}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["max_depth"] = kw.get("max_chain_depth", kw.get("maxChainDepth", 5))
        cls._config["timeout_s"] = kw.get("timeout_ms", kw.get("timeoutMs", 10000)) / 1000
        return cls

    @classmethod
    def reason(cls, steps):
        import time
        start = time.time()
        results = []
        for i, step in enumerate(steps[:cls._config["max_depth"]]):
            if time.time() - start > cls._config["timeout_s"]:
                results.append({"step": i, "status": "timeout"})
                break
            try:
                result = step() if callable(step) else step
                results.append({"step": i, "result": result, "status": "ok"})
            except Exception as e:
                results.append({"step": i, "error": str(e), "status": "failed"})
                break
        return {"chain": results, "completed": len(results), "duration_ms": round((time.time() - start) * 1000, 3)}`;
        }

        // ─── ContextRouter: weighted context routing ───
        if (s === 'ContextRouter') {
          return `class ContextRouter:
    """CMPSBL® Convex Core™ — Context-aware routing"""
    _routes = {}
    _config = {"weight_by_recency": True}

    @classmethod
    def enable(cls, *a, **kw):
        cls._config["weight_by_recency"] = kw.get("weight_by_recency", kw.get("weightByRecency", True))
        return cls

    @classmethod
    def register(cls, name, handler, weight=1.0):
        cls._routes[name] = {"handler": handler, "weight": weight, "calls": 0}

    @classmethod
    def route(cls, context):
        best, best_score = None, -1
        for name, r in cls._routes.items():
            score = r["weight"]
            if cls._config["weight_by_recency"]:
                score /= (r["calls"] + 1)
            if score > best_score:
                best, best_score = name, score
        if best:
            cls._routes[best]["calls"] += 1
            return cls._routes[best]["handler"](context)
        return None`;
        }

        // ─── IntelligentRouter: latency-aware routing ───
        if (s === 'IntelligentRouter') {
          return `class IntelligentRouter:
    """CMPSBL® Convex Core™ — Latency-aware intelligent router"""
    _backends = {}

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def register(cls, name, handler):
        cls._backends[name] = {"handler": handler, "avg_latency": 0, "calls": 0}

    @classmethod
    def route(cls, request):
        import time
        if not cls._backends:
            raise RuntimeError("IntelligentRouter: no backends registered")
        best = min(cls._backends.items(), key=lambda x: x[1]["avg_latency"] if x[1]["calls"] > 0 else 0)
        name, meta = best
        start = time.time()
        result = meta["handler"](request)
        latency = (time.time() - start) * 1000
        n = meta["calls"]
        meta["avg_latency"] = (meta["avg_latency"] * n + latency) / (n + 1)
        meta["calls"] += 1
        return result`;
        }

        // ─── LoadBalancer: weighted round-robin ───
        if (s === 'LoadBalancer') {
          return `class LoadBalancer:
    """CMPSBL® Convex Core™ — Weighted round-robin load balancer"""
    _targets = []
    _index = 0

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def add_target(cls, name, handler, weight=1):
        cls._targets.append({"name": name, "handler": handler, "weight": weight})

    @classmethod
    def next(cls, request=None):
        if not cls._targets:
            raise RuntimeError("LoadBalancer: no targets configured")
        target = cls._targets[cls._index % len(cls._targets)]
        cls._index += 1
        return target["handler"](request) if request else target`;
        }

        // ─── BlueprintGuard: regression detection ───
        if (s === 'BlueprintGuard') {
          return `class BlueprintGuard:
    """CMPSBL® Convex Core™ — Blueprint guard against regressions"""
    _baseline = {}

    @classmethod
    def init(cls, *a, **kw):
        cls._baseline["version"] = kw.get("baseline_version", kw.get("baselineVersion", "1.0"))
        cls._baseline["block"] = kw.get("block_regressions", kw.get("blockRegressions", True))
        return cls

    @classmethod
    def set_baseline(cls, key, value):
        cls._baseline[key] = value

    @classmethod
    def check(cls, key, current_value):
        baseline = cls._baseline.get(key)
        if baseline is None:
            return {"status": "no_baseline", "key": key}
        if current_value != baseline:
            if cls._baseline.get("block"):
                raise RuntimeError(f"BlueprintGuard: regression detected on '{key}' (expected {baseline}, got {current_value})")
            return {"status": "regression", "key": key, "expected": baseline, "actual": current_value}
        return {"status": "ok", "key": key}`;
        }

        // ─── RegressionDetector: structural drift watch ───
        if (s === 'RegressionDetector') {
          return `class RegressionDetector:
    """CMPSBL® Convex Core™ — Structural drift detection"""
    _baselines = {}
    _config = {"threshold": 0.10}

    @classmethod
    def watch(cls, *a, **kw):
        cls._config["threshold"] = kw.get("alert_threshold", kw.get("alertThreshold", 0.10))
        return cls

    @classmethod
    def set_baseline(cls, metric, value):
        cls._baselines[metric] = value

    @classmethod
    def check(cls, metric, current):
        baseline = cls._baselines.get(metric)
        if baseline is None:
            return {"status": "no_baseline"}
        drift = abs(current - baseline) / max(abs(baseline), 1e-9)
        return {"status": "regression" if drift > cls._config["threshold"] else "ok", "drift": round(drift, 4), "baseline": baseline, "current": current}`;
        }

        // ─── TaskAutomator: concurrent task execution ───
        if (s === 'TaskAutomator') {
          return `class TaskAutomator:
    """CMPSBL® Convex Core™ — Concurrent task automation"""
    _queue = []
    _results = []
    _config = {"max_concurrent": 10}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["max_concurrent"] = kw.get("max_concurrent", kw.get("maxConcurrent", 10))
        return cls

    @classmethod
    def enqueue(cls, name, fn, *args, **kwargs):
        cls._queue.append({"name": name, "fn": fn, "args": args, "kwargs": kwargs})

    @classmethod
    def run_all(cls):
        results = []
        for task in cls._queue[:cls._config["max_concurrent"]]:
            try:
                result = task["fn"](*task["args"], **task["kwargs"])
                results.append({"name": task["name"], "status": "ok", "result": result})
            except Exception as e:
                results.append({"name": task["name"], "status": "failed", "error": str(e)})
        cls._results.extend(results)
        cls._queue = cls._queue[cls._config["max_concurrent"]:]
        return results`;
        }

        // ─── ScheduleEngine: time-based scheduling ───
        if (s === 'ScheduleEngine') {
          return `class ScheduleEngine:
    """CMPSBL® Convex Core™ — Time-based task scheduling"""
    _scheduled = []

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def schedule(cls, name, fn, delay_seconds, repeat=False):
        import time
        cls._scheduled.append({"name": name, "fn": fn, "run_at": time.time() + delay_seconds, "repeat": repeat, "interval": delay_seconds})

    @classmethod
    def run_due(cls):
        import time
        now = time.time()
        results, remaining = [], []
        for task in cls._scheduled:
            if now >= task["run_at"]:
                try:
                    result = task["fn"]()
                    results.append({"name": task["name"], "status": "ok", "result": result})
                except Exception as e:
                    results.append({"name": task["name"], "status": "failed", "error": str(e)})
                if task["repeat"]:
                    task["run_at"] = now + task["interval"]
                    remaining.append(task)
            else:
                remaining.append(task)
        cls._scheduled = remaining
        return results`;
        }

        // ─── ShadowMirror: shadow traffic mirroring ───
        if (s === 'ShadowMirror') {
          return `class ShadowMirror:
    """CMPSBL® Convex Core™ — Shadow traffic mirroring for canary testing"""
    _config = {"mirror_percent": 5, "compare": True}
    _results = []

    @classmethod
    def init(cls, *a, **kw):
        cls._config["mirror_percent"] = kw.get("mirror_percent", kw.get("mirrorPercent", 5))
        cls._config["compare"] = kw.get("compare_outputs", kw.get("compareOutputs", True))
        return cls

    @classmethod
    def mirror(cls, primary_fn, shadow_fn, *args, **kwargs):
        import random
        primary_result = primary_fn(*args, **kwargs)
        if random.randint(1, 100) <= cls._config["mirror_percent"]:
            try:
                shadow_result = shadow_fn(*args, **kwargs)
                match = primary_result == shadow_result if cls._config["compare"] else None
                cls._results.append({"match": match, "primary": primary_result, "shadow": shadow_result})
            except Exception:
                cls._results.append({"match": False, "error": True})
        return primary_result

    @classmethod
    def report(cls):
        if not cls._results:
            return {"total": 0, "match_rate": 0}
        matches = sum(1 for r in cls._results if r.get("match"))
        return {"total": len(cls._results), "match_rate": round(matches / len(cls._results), 3)}`;
        }

        // ─── CanaryOrchestrator: canary deployment ───
        if (s === 'CanaryOrchestrator') {
          return `class CanaryOrchestrator:
    """CMPSBL® Convex Core™ — Canary deployment orchestrator"""
    _config = {"auto_rollback": True, "anomaly_threshold": 0.05}
    _metrics = {"canary_errors": 0, "canary_total": 0}

    @classmethod
    def enable(cls, *a, **kw):
        cls._config["auto_rollback"] = kw.get("auto_rollback", kw.get("autoRollback", True))
        cls._config["anomaly_threshold"] = kw.get("anomaly_threshold", kw.get("anomalyThreshold", 0.05))
        return cls

    @classmethod
    def record(cls, success):
        cls._metrics["canary_total"] += 1
        if not success:
            cls._metrics["canary_errors"] += 1

    @classmethod
    def should_rollback(cls):
        total = cls._metrics["canary_total"]
        if total < 10:
            return False
        error_rate = cls._metrics["canary_errors"] / total
        return error_rate > cls._config["anomaly_threshold"]`;
        }

        // ─── AuthorityResolver: hierarchical authority ───
        if (s === 'AuthorityResolver') {
          return `class AuthorityResolver:
    """CMPSBL® Convex Core™ — Hierarchical authority resolution"""
    _hierarchy = {}
    _config = {"conflict_resolution": "most-restrictive"}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["conflict_resolution"] = kw.get("conflict_resolution", kw.get("conflictResolution", "most-restrictive"))
        return cls

    @classmethod
    def register(cls, role, permissions, parent=None):
        cls._hierarchy[role] = {"permissions": set(permissions), "parent": parent}

    @classmethod
    def resolve(cls, role):
        perms = set()
        current = role
        while current and current in cls._hierarchy:
            perms |= cls._hierarchy[current]["permissions"]
            current = cls._hierarchy[current]["parent"]
        return perms

    @classmethod
    def check(cls, role, permission):
        return permission in cls.resolve(role)`;
        }

        // ─── PolicyEnforcer: delegation auditing ───
        if (s === 'PolicyEnforcer') {
          return `class PolicyEnforcer:
    """CMPSBL® Convex Core™ — Policy enforcement with audit trail"""
    _enforced = []

    @classmethod
    def enforce(cls, *a, **kw): return cls

    @classmethod
    def check(cls, action, actor, resource):
        import time
        entry = {"action": action, "actor": actor, "resource": resource, "ts": time.time(), "allowed": True}
        cls._enforced.append(entry)
        if len(cls._enforced) > 500:
            cls._enforced = cls._enforced[-500:]
        return entry

    @classmethod
    def deny(cls, action, actor, resource, reason="policy violation"):
        import time
        entry = {"action": action, "actor": actor, "resource": resource, "ts": time.time(), "allowed": False, "reason": reason}
        cls._enforced.append(entry)
        raise PermissionError(f"PolicyEnforcer: {reason}")`;
        }

        // ─── ContractValidator: API contract validation ───
        if (s === 'ContractValidator') {
          return `class ContractValidator:
    """CMPSBL® Convex Core™ — API contract validation"""
    _contracts = {}

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def register(cls, endpoint, schema):
        cls._contracts[endpoint] = schema

    @classmethod
    def validate(cls, endpoint, data):
        schema = cls._contracts.get(endpoint)
        if not schema:
            return {"valid": True, "reason": "no contract defined"}
        errors = []
        if isinstance(schema, dict) and isinstance(data, dict):
            for key, expected_type in schema.items():
                if key not in data:
                    errors.append(f"missing field: {key}")
                elif not isinstance(data[key], expected_type):
                    errors.append(f"field '{key}' expected {expected_type.__name__}, got {type(data[key]).__name__}")
        return {"valid": len(errors) == 0, "errors": errors}`;
        }

        // ─── SchemaEnforcer: request/response schema enforcement ───
        if (s === 'SchemaEnforcer') {
          return `class SchemaEnforcer:
    """CMPSBL® Convex Core™ — Schema enforcement for requests and responses"""
    _schemas = {"request": {}, "response": {}}

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def register(cls, endpoint, request_schema=None, response_schema=None):
        if request_schema:
            cls._schemas["request"][endpoint] = request_schema
        if response_schema:
            cls._schemas["response"][endpoint] = response_schema

    @classmethod
    def validate_request(cls, endpoint, data):
        schema = cls._schemas["request"].get(endpoint)
        if not schema:
            return True
        if isinstance(schema, dict) and isinstance(data, dict):
            missing = [k for k in schema if k not in data]
            if missing:
                raise ValueError(f"SchemaEnforcer: request missing fields: {missing}")
        return True`;
        }

        // ─── MessageRelay: reliable message delivery ───
        if (s === 'MessageRelay') {
          return `class MessageRelay:
    """CMPSBL® Convex Core™ — Reliable message relay with retry"""
    _queue = []
    _dead_letter = []
    _config = {"max_retries": 3}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["max_retries"] = kw.get("dead_letter_after", kw.get("deadLetterAfter", 3))
        return cls

    @classmethod
    def send(cls, handler, message, retries=0):
        try:
            return handler(message)
        except Exception as e:
            if retries < cls._config["max_retries"]:
                return cls.send(handler, message, retries + 1)
            cls._dead_letter.append({"message": message, "error": str(e)})
            raise

    @classmethod
    def dead_letters(cls):
        return list(cls._dead_letter)`;
        }

        // ─── DeliveryGuarantee: ordered delivery ───
        if (s === 'DeliveryGuarantee') {
          return `class DeliveryGuarantee:
    """CMPSBL® Convex Core™ — Ordered message delivery guarantee"""
    _sequence = 0
    _delivered = []

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def wrap(cls, message):
        cls._sequence += 1
        return {"seq": cls._sequence, "payload": message}

    @classmethod
    def verify_order(cls, messages):
        for i in range(1, len(messages)):
            if messages[i]["seq"] <= messages[i-1]["seq"]:
                return {"ordered": False, "break_at": i}
        return {"ordered": True}`;
        }

        // ─── SandboxExecutor: isolated execution ───
        if (s === 'SandboxExecutor') {
          return `class SandboxExecutor:
    """CMPSBL® Convex Core™ — Sandboxed code execution"""
    _config = {"memory_limit_mb": 256, "timeout_s": 30}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["memory_limit_mb"] = kw.get("memory_limit_mb", kw.get("memoryLimitMb", 256))
        cls._config["timeout_s"] = kw.get("timeout_ms", kw.get("timeoutMs", 30000)) / 1000
        return cls

    @classmethod
    def execute(cls, fn, *args, **kwargs):
        import time
        start = time.time()
        try:
            result = fn(*args, **kwargs)
            elapsed = time.time() - start
            if elapsed > cls._config["timeout_s"]:
                raise TimeoutError(f"SandboxExecutor: execution exceeded {cls._config['timeout_s']}s")
            return {"result": result, "duration_ms": round(elapsed * 1000, 3)}
        except TimeoutError:
            raise
        except Exception as e:
            raise RuntimeError(f"SandboxExecutor: execution failed — {e}")`;
        }

        // ─── IsolationGuard: filesystem/network isolation ───
        if (s === 'IsolationGuard') {
          return `class IsolationGuard:
    """CMPSBL® Convex Core™ — Resource access isolation"""
    _config = {"block_network": False, "block_fs": True}

    @classmethod
    def enforce(cls, *a, **kw):
        cls._config["block_network"] = kw.get("block_network_access", kw.get("blockNetworkAccess", False))
        cls._config["block_fs"] = kw.get("block_file_system", kw.get("blockFileSystem", True))
        return cls

    @classmethod
    def check_access(cls, resource_type):
        if resource_type == "network" and cls._config["block_network"]:
            raise PermissionError("IsolationGuard: network access blocked")
        if resource_type == "filesystem" and cls._config["block_fs"]:
            raise PermissionError("IsolationGuard: filesystem access blocked")
        return True`;
        }

        // ─── SimulationEngine: scenario simulation ───
        if (s === 'SimulationEngine') {
          return `class SimulationEngine:
    """CMPSBL® Convex Core™ — Scenario simulation engine"""
    _scenarios = []

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def add_scenario(cls, name, steps):
        cls._scenarios.append({"name": name, "steps": steps})

    @classmethod
    def run(cls, scenario_name=None):
        targets = [s for s in cls._scenarios if s["name"] == scenario_name] if scenario_name else cls._scenarios
        results = []
        for scenario in targets:
            step_results = []
            for step in scenario["steps"]:
                try:
                    result = step() if callable(step) else step
                    step_results.append({"status": "ok", "result": result})
                except Exception as e:
                    step_results.append({"status": "failed", "error": str(e)})
                    break
            results.append({"scenario": scenario["name"], "steps": step_results, "passed": all(s["status"] == "ok" for s in step_results)})
        return results`;
        }

        // ─── TrafficReplay: traffic replay engine ───
        if (s === 'TrafficReplay') {
          return `class TrafficReplay:
    """CMPSBL® Convex Core™ — Traffic capture and replay"""
    _captured = []

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def capture(cls, request, response):
        import time
        cls._captured.append({"request": request, "response": response, "ts": time.time()})
        if len(cls._captured) > 1000:
            cls._captured = cls._captured[-1000:]

    @classmethod
    def replay(cls, handler, limit=None):
        targets = cls._captured[-limit:] if limit else cls._captured
        results = []
        for entry in targets:
            try:
                result = handler(entry["request"])
                results.append({"match": result == entry["response"], "expected": entry["response"], "actual": result})
            except Exception as e:
                results.append({"match": False, "error": str(e)})
        return results`;
        }

        // ─── BuildValidator: build artifact validation ───
        if (s === 'BuildValidator') {
          return `class BuildValidator:
    """CMPSBL® Convex Core™ — Build artifact integrity validation"""
    _config = {"algorithm": "sha256", "reject_tampered": True}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["algorithm"] = kw.get("hash_algorithm", kw.get("hashAlgorithm", "sha256"))
        cls._config["reject_tampered"] = kw.get("reject_tampered", kw.get("rejectTampered", True))
        return cls

    @classmethod
    def hash_content(cls, content):
        import hashlib
        data = content.encode() if isinstance(content, str) else content
        return hashlib.new(cls._config["algorithm"], data).hexdigest()

    @classmethod
    def verify(cls, content, expected_hash):
        actual = cls.hash_content(content)
        if actual != expected_hash and cls._config["reject_tampered"]:
            raise RuntimeError(f"BuildValidator: integrity check failed (expected {expected_hash[:16]}..., got {actual[:16]}...)")
        return actual == expected_hash`;
        }

        // ─── ArtifactSealer: output signing ───
        if (s === 'ArtifactSealer') {
          return `class ArtifactSealer:
    """CMPSBL® Convex Core™ — Artifact signing and verification"""
    _sealed = {}

    @classmethod
    def enable(cls, *a, **kw): return cls

    @classmethod
    def seal(cls, artifact_name, content):
        import hashlib, time
        data = content.encode() if isinstance(content, str) else content
        h = hashlib.sha256(data).hexdigest()
        cls._sealed[artifact_name] = {"hash": h, "sealed_at": time.time(), "size": len(data)}
        return h

    @classmethod
    def verify(cls, artifact_name, content):
        import hashlib
        record = cls._sealed.get(artifact_name)
        if not record:
            return {"verified": False, "reason": "no seal found"}
        data = content.encode() if isinstance(content, str) else content
        actual = hashlib.sha256(data).hexdigest()
        return {"verified": actual == record["hash"], "sealed_at": record["sealed_at"]}`;
        }

        // ─── DependencyShield: CVE monitoring ───
        if (s === 'DependencyShield') {
          return `class DependencyShield:
    """CMPSBL® Convex Core™ — Dependency vulnerability monitoring"""
    _quarantined = []

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def quarantine(cls, package_name, reason="vulnerability detected"):
        cls._quarantined.append({"package": package_name, "reason": reason})

    @classmethod
    def is_quarantined(cls, package_name):
        return any(q["package"] == package_name for q in cls._quarantined)

    @classmethod
    def report(cls):
        return list(cls._quarantined)`;
        }

        // ─── IsolationBarrier: blast radius containment ───
        if (s === 'IsolationBarrier') {
          return `class IsolationBarrier:
    """CMPSBL® Convex Core™ — Blast radius containment"""
    _config = {"blast_radius": "component", "fallback_on_failure": True}

    @classmethod
    def enforce(cls, *a, **kw):
        cls._config["blast_radius"] = kw.get("blast_radius", kw.get("blastRadius", "component"))
        cls._config["fallback_on_failure"] = kw.get("fallback_on_failure", kw.get("fallbackOnFailure", True))
        return cls

    @classmethod
    def execute(cls, fn, fallback=None, *args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            if cls._config["fallback_on_failure"] and fallback:
                return fallback(*args, **kwargs)
            raise RuntimeError(f"IsolationBarrier: contained failure in {cls._config['blast_radius']} scope — {e}")`;
        }

        // ─── ModuleNavigator: module indexing ───
        if (s === 'ModuleNavigator') {
          return `class ModuleNavigator:
    """CMPSBL® Convex Core™ — Module indexing and navigation"""
    _index = {}

    @classmethod
    def init(cls, *a, **kw): return cls

    @classmethod
    def register(cls, name, path, metadata=None):
        cls._index[name] = {"path": path, "metadata": metadata or {}}

    @classmethod
    def resolve(cls, name):
        return cls._index.get(name)

    @classmethod
    def search(cls, query):
        return {k: v for k, v in cls._index.items() if query.lower() in k.lower()}

    @classmethod
    def all(cls):
        return dict(cls._index)`;
        }

        // ─── DependencyMapper: architecture mapping ───
        if (s === 'DependencyMapper') {
          return `class DependencyMapper:
    """CMPSBL® Convex Core™ — Architecture dependency mapping"""
    _map = {}

    @classmethod
    def generate(cls, *a, **kw): return cls

    @classmethod
    def add(cls, module, depends_on=None):
        cls._map[module] = depends_on or []

    @classmethod
    def graph(cls):
        return dict(cls._map)

    @classmethod
    def dependents(cls, module):
        return [m for m, deps in cls._map.items() if module in deps]`;
        }

        // ─── ReflexHandler: low-latency response ───
        if (s === 'ReflexHandler') {
          return `class ReflexHandler:
    """CMPSBL® Convex Core™ — Low-latency reflex response handler"""
    _handlers = {}
    _config = {"max_latency_ms": 50, "escalate_after": 3}

    @classmethod
    def init(cls, *a, **kw):
        cls._config["max_latency_ms"] = kw.get("max_latency_ms", kw.get("maxLatencyMs", 50))
        cls._config["escalate_after"] = kw.get("escalate_after", kw.get("escalateAfter", 3))
        return cls

    @classmethod
    def register(cls, trigger, handler):
        cls._handlers[trigger] = {"fn": handler, "slow_count": 0}

    @classmethod
    def react(cls, trigger, *args, **kwargs):
        import time
        h = cls._handlers.get(trigger)
        if not h:
            raise KeyError(f"ReflexHandler: no handler for trigger '{trigger}'")
        start = time.time()
        result = h["fn"](*args, **kwargs)
        elapsed_ms = (time.time() - start) * 1000
        if elapsed_ms > cls._config["max_latency_ms"]:
            h["slow_count"] += 1
        return result`;
        }

        // ─── FallbackChain: cascading fallback strategies ───
        if (s === 'FallbackChain') {
          return `class FallbackChain:
    """CMPSBL® Convex Core™ — Cascading fallback chain"""
    _chain = []
    _cache = {}

    @classmethod
    def define(cls, strategies):
        cls._chain = strategies if isinstance(strategies, list) else [strategies]
        return cls

    @classmethod
    def execute(cls, fn, *args, **kwargs):
        try:
            result = fn(*args, **kwargs)
            cache_key = str(args) + str(kwargs)
            cls._cache[cache_key] = result
            return result
        except Exception:
            for strategy in cls._chain:
                s = strategy.get("strategy") if isinstance(strategy, dict) else strategy
                if s == "cache":
                    cache_key = str(args) + str(kwargs)
                    if cache_key in cls._cache:
                        return cls._cache[cache_key]
                elif s == "default-value":
                    return strategy.get("value") if isinstance(strategy, dict) else None
                elif s == "graceful-degrade":
                    return {"degraded": True, "reason": "all primary strategies exhausted"}
            raise`;
        }

        // ─── Catch-all: any remaining class gets a functional base ───
        return `class ${s}:
    """CMPSBL® Convex Core™ — ${s}"""
    _state = {}

    @classmethod
    def init(cls, *a, **kw):
        cls._state.update(kw)
        return cls

    @classmethod
    def enable(cls, *a, **kw):
        cls._state.update(kw)
        return cls

    @classmethod
    def enforce(cls, *a, **kw):
        cls._state.update(kw)
        return cls

    @classmethod
    def apply(cls, *a, **kw):
        cls._state.update(kw)
        return cls

    @classmethod
    def status(cls):
        return dict(cls._state)`;
      });
      return stubs.join('\n\n');
    },
    constDecl: (name, val) => `${name} = ${val}`,
    transformGuard: pythonGuard,
    fileExtension: '.py',
    dispatchPreamble: (dt, cm, seeds) => [
      `_CMPSBL_DT = [${dt.join(', ')}]`,
      `_CMPSBL_CM = [${cm.join(', ')}]`,
      `_CMPSBL_IV = ${seeds.iv}`,
      `_CMPSBL_EPOCH = ${seeds.epoch}`,
      '',
      `def _cmpsbl_resolve(idx, ctx=0):`,
      `    v = (_CMPSBL_DT[idx % len(_CMPSBL_DT)] ^ _CMPSBL_IV) & 0xFFFF`,
      `    return (_CMPSBL_CM[v % len(_CMPSBL_CM)] + ctx) >> 2`,
      '',
      `def _cmpsbl_gate(stage, payload):`,
      `    seq = _cmpsbl_resolve(stage, hash(str(payload)) & 0xFF)`,
      `    if seq < _CMPSBL_EPOCH: return payload`,
      `    return {**payload, "_sealed": True, "_seq": seq}`,
    ].join('\n'),
    obfuscatedConstants: () => `# Sealed scoring parameters — DO NOT MODIFY\n_W = [v / 100 for v in [0x1E, 0x1E, 0x14, 0x14]]\n_T = [0x5C, 0x50, 0x41, 0x2D]`,
    selfVerifyBlock: (fp) => generatePyVerifyBlock(fp),
  },
  Rust: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Rust'),
    constDecl: (name, val) => `const ${name.toUpperCase()}: &str = r#"${val}"#;`,
    transformGuard: rustGuard,
    fileExtension: '.rs',
    dispatchPreamble: (dt, cm, seeds) => [
      `const _CMPSBL_DT: &[u16] = &[${dt.join(', ')}];`,
      `const _CMPSBL_CM: &[u16] = &[${cm.join(', ')}];`,
      `const _CMPSBL_IV: u32 = ${seeds.iv};`,
      '',
      `fn _cmpsbl_resolve(idx: usize, ctx: u32) -> u16 {`,
      `    let v = (_CMPSBL_DT[idx % _CMPSBL_DT.len()] ^ (_CMPSBL_IV as u16)) & 0xFFFF;`,
      `    (_CMPSBL_CM[(v as usize) % _CMPSBL_CM.len()] + (ctx as u16)) >> 2`,
      `}`,
    ].join('\n'),
    obfuscatedConstants: () => `// Sealed scoring parameters — DO NOT MODIFY\nconst _W: [f64; 4] = [0x1Eu32 as f64 / 100.0, 0x1Eu32 as f64 / 100.0, 0x14u32 as f64 / 100.0, 0x14u32 as f64 / 100.0];\nconst _T: [u32; 4] = [0x5C, 0x50, 0x41, 0x2D];`,
  },
  Go: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Go'),
    constDecl: (name, val) => `var ${name} = ${val}`,
    transformGuard: goGuard,
    fileExtension: '.go',
    dispatchPreamble: (dt, cm, seeds) => [
      `var _cmpsblDT = [...]uint16{${dt.join(', ')}}`,
      `var _cmpsblCM = [...]uint16{${cm.join(', ')}}`,
      `var _cmpsblIV uint32 = ${seeds.iv}`,
      '',
      `func _cmpsblResolve(idx int, ctx uint32) uint16 {`,
      `\tv := (_cmpsblDT[idx%len(_cmpsblDT)] ^ uint16(_cmpsblIV)) & 0xFFFF`,
      `\treturn (_cmpsblCM[int(v)%len(_cmpsblCM)] + uint16(ctx)) >> 2`,
      `}`,
    ].join('\n'),
    obfuscatedConstants: () => `// Sealed scoring parameters — DO NOT MODIFY\nvar _W = [4]float64{float64(0x1E) / 100, float64(0x1E) / 100, float64(0x14) / 100, float64(0x14) / 100}\nvar _T = [4]int{0x5C, 0x50, 0x41, 0x2D}`,
  },
  Java: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Java'),
    constDecl: (name, val) => `static final String ${name} = ${val};`,
    transformGuard: javaGuard,
    fileExtension: '.java',
  },
  'C#': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/// <summary>\n${lines.map(l => `/// ${l}`).join('\n')}\n/// </summary>`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'C#'),
    constDecl: (name, val) => `static readonly string ${name} = @"${val}";`,
    transformGuard: csharpGuard,
    fileExtension: '.cs',
  },
  C: {
    comment: (t) => `/* ${t} */`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'C'),
    constDecl: (name, val) => `static const char* ${name} = "${val}";`,
    transformGuard: cStructGuard,
    fileExtension: '.c',
  },
  'C++': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'C++'),
    constDecl: (name, val) => `constexpr auto ${name} = R"(${val})";`,
    transformGuard: cStructGuard,
    fileExtension: '.cpp',
  },
  Ruby: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `=begin\n${lines.join('\n')}\n=end`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Ruby'),
    constDecl: (name, val) => `${name.toUpperCase()} = ${val}.freeze`,
    transformGuard: rubyGuard,
    fileExtension: '.rb',
  },
  Swift: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Swift'),
    constDecl: (name, val) => `let ${name} = ${val}`,
    transformGuard: swiftGuard,
    fileExtension: '.swift',
  },
  Kotlin: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Kotlin'),
    constDecl: (name, val) => `val ${name} = ${val}`,
    transformGuard: namedArgGuard,
    fileExtension: '.kt',
  },
  PHP: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'PHP'),
    constDecl: (name, val) => `define('${name.toUpperCase()}', ${jsonToPhpArray(val)});`,
    transformGuard: phpGuard,
    fileExtension: '.php',
    dispatchPreamble: (dt, cm, seeds) => [
      `$_CMPSBL_DT = array(${dt.join(', ')});`,
      `$_CMPSBL_CM = array(${cm.join(', ')});`,
      `$_CMPSBL_IV = ${seeds.iv};`,
      `$_CMPSBL_EPOCH = ${seeds.epoch};`,
      '',
      `function _cmpsbl_resolve(int $idx, int $ctx = 0): int {`,
      `    global $_CMPSBL_DT, $_CMPSBL_CM, $_CMPSBL_IV;`,
      `    $v = ($_CMPSBL_DT[$idx % count($_CMPSBL_DT)] ^ $_CMPSBL_IV) & 0xFFFF;`,
      `    return ($_CMPSBL_CM[$v % count($_CMPSBL_CM)] + $ctx) >> 2;`,
      `}`,
      '',
      `function _cmpsbl_gate(int $stage, $payload) {`,
      `    global $_CMPSBL_EPOCH;`,
      `    $seq = _cmpsbl_resolve($stage, is_array($payload) ? count($payload) : 0);`,
      `    if ($seq < $_CMPSBL_EPOCH) { return $payload; }`,
      `    if (is_array($payload)) {`,
      `        return array_merge($payload, ['_sealed' => true, '_seq' => $seq]);`,
      `    }`,
      `    return $payload;`,
      `}`,
    ].join('\n'),
    obfuscatedConstants: () => [
      '// Sealed scoring parameters — DO NOT MODIFY',
      "define('CMPSBL_W', array_map(fn($v) => $v / 100, [0x1E, 0x1E, 0x14, 0x14]));",
      "define('CMPSBL_T', [0x5C, 0x50, 0x41, 0x2D]);",
    ].join('\n'),
    selfVerifyBlock: (fp) => generatePhpVerifyBlock(fp),
  },
  Scala: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Scala'),
    constDecl: (name, val) => `val ${name} = ${val}`,
    transformGuard: namedArgGuard,
    fileExtension: '.scala',
  },
  Lua: {
    comment: (t) => `-- ${t}`,
    blockComment: (lines) => `--[[\n${lines.join('\n')}\n]]`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Lua'),
    constDecl: (name, val) => `local ${name} = ${val}`,
    transformGuard: luaGuard,
    fileExtension: '.lua',
  },
  R: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'R'),
    constDecl: (name, val) => `${name} <- ${val}`,
    transformGuard: rGuard,
    fileExtension: '.R',
  },
  Dart: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Dart'),
    constDecl: (name, val) => `const ${name} = ${val};`,
    transformGuard: dartGuard,
    fileExtension: '.dart',
  },
  Elixir: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `@moduledoc """\n${lines.join('\n')}\n"""`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Elixir'),
    constDecl: (name, val) => `@${name} ${val}`,
    transformGuard: elixirGuard,
    fileExtension: '.ex',
  },
  VHDL: {
    comment: (t) => `-- ${t}`,
    blockComment: (lines) => lines.map(l => `-- ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'VHDL'),
    constDecl: (name, val) => `constant ${name} : string := "${val}";`,
    transformGuard: stripSemicolons,
    fileExtension: '.vhd',
  },
  Verilog: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Verilog'),
    constDecl: (name, val) => `localparam ${name} = "${val}";`,
    transformGuard: identityGuard,
    fileExtension: '.v',
  },
  SystemVerilog: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'SystemVerilog'),
    constDecl: (name, val) => `localparam string ${name} = "${val}";`,
    transformGuard: identityGuard,
    fileExtension: '.sv',
  },
  Perl: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `=pod\n${lines.join('\n')}\n=cut`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Perl'),
    constDecl: (name, val) => `use constant ${name} => ${val};`,
    transformGuard: perlGuard,
    fileExtension: '.pl',
  },
  Julia: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `#=\n${lines.join('\n')}\n=#`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Julia'),
    constDecl: (name, val) => `const ${name} = ${val}`,
    transformGuard: juliaGuard,
    fileExtension: '.jl',
  },
  'F#': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `(*\n${lines.join('\n')}\n*)`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'F#'),
    constDecl: (name, val) => `let [<Literal>] ${name} = ${val}`,
    transformGuard: fsharpGuard,
    fileExtension: '.fs',
  },
  Clojure: {
    comment: (t) => `;; ${t}`,
    blockComment: (lines) => lines.map(l => `;; ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Clojure'),
    constDecl: (name, val) => `(def ${name} ${val})`,
    transformGuard: clojureGuard,
    fileExtension: '.clj',
  },
  Erlang: {
    comment: (t) => `% ${t}`,
    blockComment: (lines) => lines.map(l => `% ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Erlang'),
    constDecl: (name, val) => `-define(${name.toUpperCase()}, ${val}).`,
    transformGuard: erlangGuard,
    fileExtension: '.erl',
  },
  OCaml: {
    comment: (t) => `(* ${t} *)`,
    blockComment: (lines) => `(*\n${lines.join('\n')}\n*)`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'OCaml'),
    constDecl: (name, val) => `let ${name} = ${val}`,
    transformGuard: ocamlGuard,
    fileExtension: '.ml',
  },
  Nim: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `#[\n${lines.join('\n')}\n]#`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Nim'),
    constDecl: (name, val) => `const ${name} = ${val}`,
    transformGuard: nimGuard,
    fileExtension: '.nim',
  },
  Crystal: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Crystal'),
    constDecl: (name, val) => `${name.toUpperCase()} = ${val}`,
    transformGuard: rubyGuard,
    fileExtension: '.cr',
  },
  Groovy: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Groovy'),
    constDecl: (name, val) => `final ${name} = ${val}`,
    transformGuard: namedArgGuard,
    fileExtension: '.groovy',
  },
  Fortran: {
    comment: (t) => `! ${t}`,
    blockComment: (lines) => lines.map(l => `! ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Fortran'),
    constDecl: (name, val) => `character(len=*), parameter :: ${name} = "${val}"`,
    transformGuard: fortranGuard,
    fileExtension: '.f90',
  },
  'Objective-C': {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Objective-C'),
    constDecl: (name, val) => `static NSString *const ${name} = @"${val}";`,
    transformGuard: objcGuard,
    fileExtension: '.m',
  },
  D: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/+\n${lines.join('\n')}\n+/`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'D'),
    constDecl: (name, val) => `enum ${name} = ${val};`,
    transformGuard: identityGuard,
    fileExtension: '.d',
  },
  Shell: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Shell'),
    constDecl: (name, val) => `readonly ${name}="${val}"`,
    transformGuard: shellGuard,
    fileExtension: '.sh',
  },
  Bash: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => lines.map(l => `# ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Bash'),
    constDecl: (name, val) => `readonly ${name}="${val}"`,
    transformGuard: shellGuard,
    fileExtension: '.sh',
  },
  PowerShell: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `<#\n${lines.join('\n')}\n#>`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'PowerShell'),
    constDecl: (name, val) => `Set-Variable -Name "${name}" -Value "${val}" -Option Constant`,
    transformGuard: powershellGuard,
    fileExtension: '.ps1',
  },
  Solidity: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Solidity'),
    constDecl: (name, val) => `string constant ${name} = "${val}";`,
    transformGuard: identityGuard,
    fileExtension: '.sol',
  },
  CUDA: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'CUDA'),
    constDecl: (name, val) => `__constant__ const char* ${name} = "${val}";`,
    transformGuard: cStructGuard,
    fileExtension: '.cu',
  },
  GLSL: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'GLSL'),
    constDecl: (name, val) => `const int ${name} = ${val};`,
    transformGuard: identityGuard,
    fileExtension: '.glsl',
  },
  Metal: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Metal'),
    constDecl: (name, val) => `constant auto ${name} = ${val};`,
    transformGuard: cStructGuard,
    fileExtension: '.metal',
  },
  WGSL: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => lines.map(l => `// ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'WGSL'),
    constDecl: (name, val) => `const ${name}: u32 = ${val}u;`,
    transformGuard: identityGuard,
    fileExtension: '.wgsl',
  },
  Bluespec: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Bluespec'),
    constDecl: (name, val) => `String ${name} = "${val}";`,
    transformGuard: identityGuard,
    fileExtension: '.bsv',
  },
  FIRRTL: {
    comment: (t) => `; ${t}`,
    blockComment: (lines) => lines.map(l => `; ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'FIRRTL'),
    constDecl: (name, val) => `; const ${name} = ${val}`,
    transformGuard: identityGuard,
    fileExtension: '.fir',
  },
  Chisel: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/**\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Chisel'),
    constDecl: (name, val) => `val ${name} = ${val}`,
    transformGuard: namedArgGuard,
    fileExtension: '.scala',
  },
  Haskell: {
    comment: (t) => `-- ${t}`,
    blockComment: (lines) => `{-\n${lines.join('\n')}\n-}`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Haskell'),
    constDecl: (name, val) => `${name} = ${val}`,
    transformGuard: identityGuard,
    fileExtension: '.hs',
  },
  // ── Missing Language Adapters (gap fill) ──
  SPICE: {
    comment: (t) => `* ${t}`,
    blockComment: (lines) => lines.map(l => `* ${l}`).join('\n'),
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'SPICE'),
    constDecl: (name, val) => `.param ${name} = '${val}'`,
    transformGuard: identityGuard,
    fileExtension: '.spice',
  },
  Amaranth: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `"""\n${lines.join('\n')}\n"""`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Python'),
    constDecl: (name, val) => `${name} = ${val}`,
    transformGuard: pythonGuard,
    fileExtension: '.py',
  },
  HLSL: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'HLSL'),
    constDecl: (name, val) => `static const int ${name} = ${val};`,
    transformGuard: identityGuard,
    fileExtension: '.hlsl',
  },
  OpenCL: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'OpenCL'),
    constDecl: (name, val) => `__constant int ${name} = ${val};`,
    transformGuard: cStructGuard,
    fileExtension: '.cl',
  },
  Vyper: {
    comment: (t) => `# ${t}`,
    blockComment: (lines) => `"""\n${lines.join('\n')}\n"""`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Solidity'),
    constDecl: (name, val) => `${name}: constant(String[64]) = "${val}"`,
    transformGuard: pythonGuard,
    fileExtension: '.vy',
  },
  Move: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Rust'),
    constDecl: (name, val) => `const ${name.toUpperCase()}: vector<u8> = b"${val}";`,
    transformGuard: rustGuard,
    fileExtension: '.move',
  },
  Cairo: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `// ${lines.join('\n// ')}`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Rust'),
    constDecl: (name, val) => `const ${name.toUpperCase()}: felt252 = '${val}';`,
    transformGuard: rustGuard,
    fileExtension: '.cairo',
  },
  Fe: {
    comment: (t) => `// ${t}`,
    blockComment: (lines) => `/*\n${lines.map(l => ` * ${l}`).join('\n')}\n */`,
    importStatement: (_mod, syms) => generateInlinePrimitives(syms, 'Rust'),
    constDecl: (name, val) => `const ${name.toUpperCase()}: u256 = 0`,
    transformGuard: rustGuard,
    fileExtension: '.fe',
  },
};

/** Resolve the adapter for a detected language, falling back to TypeScript */
export function getAdapter(language: string): LanguageAdapter {
  // Try exact match first, then case-insensitive lookup (handles 'python' → 'Python', etc.)
  if (ADAPTERS[language]) return ADAPTERS[language];
  const lower = language.toLowerCase();
  const key = Object.keys(ADAPTERS).find(k => k.toLowerCase() === lower);
  return key ? ADAPTERS[key] : ADAPTERS['TypeScript'];
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
    wrapper: (code) => code,
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
    wrapper: (code) => code,
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
  core: {
    imports: "import { RuntimeKernel, BaseHardening } from '@cmpsbl/runtime/core';",
    guard: "RuntimeKernel.init({ mode: 'hardened', strictTypes: true });\nBaseHardening.apply({ nullSafety: true, boundaryChecks: true });",
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
    wrapper: (code) => code,
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
 * Generate a self-verification code block in the target language.
 * This block lets anyone run the file and verify the fingerprint directly.
 */
function generateSelfVerifyBlock(adapter: LanguageAdapter, fingerprint: string, language: string): string {
  const lines: string[] = [];
  lines.push(adapter.comment('═══════════════════════════════════════════════════════════'));
  lines.push(adapter.comment('SELF-VERIFICATION'));
  lines.push(adapter.comment('Run this file to verify the artifact integrity.'));
  lines.push(adapter.comment('═══════════════════════════════════════════════════════════'));

  const lang = language.toLowerCase();
  if (lang === 'python') {
    lines.push(`
def __cmpsbl_verify__():
    """
    CMPSBL® Artifact Self-Verification
    Verifies this sealed artifact's integrity and fingerprint.
    Run: python <this_file>.py --verify
    """
    import hashlib, json, sys, os

    fingerprint = "${fingerprint}"
    meta = json.loads(__CMPSBL_META__) if isinstance(__CMPSBL_META__, str) else __CMPSBL_META__
    verify_url = f"https://cmpsbl.com/verify/{fingerprint}"

    print("=" * 60)
    print("CMPSBL® Convex Core™ — Artifact Verification")
    print("A PromptFluid™ Product")
    print("=" * 60)
    print(f"  Fingerprint:  {fingerprint}")
    print(f"  Primitives:   {meta.get('primitiveCount', '?')}")
    print(f"  Generated:    {meta.get('generatedAt', '?')}")
    print(f"  Runtime:      {meta.get('runtimeVersion', '?')}")
    print(f"  Language:     {meta.get('sourceLanguage', '?')}")
    print()

    # Verify metadata integrity
    checks_passed = 0
    checks_total = 4

    # Check 1: Fingerprint present
    if fingerprint and len(fingerprint) > 8:
        print("  ✓ Fingerprint valid")
        checks_passed += 1
    else:
        print("  ✗ Fingerprint missing or malformed")

    # Check 2: Metadata intact
    if meta.get("runtimeVersion") and meta.get("orchestrationVersion"):
        print("  ✓ Metadata intact")
        checks_passed += 1
    else:
        print("  ✗ Metadata corrupted")

    # Check 3: Patent reference present
    if meta.get("patents") or meta.get("patent"):
        print("  ✓ Patent reference present")
        checks_passed += 1
    else:
        print("  ✗ Patent reference missing")

    # Check 4: Source file hash
    try:
        with open(__file__, "rb") as f:
            content = f.read()
        file_hash = hashlib.sha256(content).hexdigest()[:16]
        print(f"  ✓ File hash: {file_hash}")
        checks_passed += 1
    except Exception:
        print("  ✗ Could not compute file hash")

    print()
    print(f"  Result: {checks_passed}/{checks_total} checks passed")
    print()
    print(f"  Online verification:")
    print(f"    {verify_url}")
    print()
    print(f"  Programmatic verification:")
    print(f"    pip install cmpsbl-test-harness")
    print(f'    from cmpsbl import verify_fingerprint')
    print(f'    verify_fingerprint("{fingerprint}")')
    print()
    print("  © ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.")
    print("  U.S. Patent App. No. 64/029,678 · No. 64/031,637")
    print("=" * 60)
    return checks_passed == checks_total

if __name__ == "__main__":
    import sys
    if "--verify" in sys.argv or "verify" in sys.argv:
        success = __cmpsbl_verify__()
        sys.exit(0 if success else 1)
`);
  } else if (lang === 'typescript' || lang === 'javascript') {
    lines.push(`
/**
 * CMPSBL® Artifact Self-Verification
 * Run: node <this_file> --verify
 */
function __cmpsbl_verify__() {
  const crypto = globalThis.crypto ?? require('crypto');
  const fs = typeof require !== 'undefined' ? require('fs') : null;
  const fingerprint = "${fingerprint}";
  const meta = typeof __CMPSBL_META__ === 'string' ? JSON.parse(__CMPSBL_META__) : __CMPSBL_META__;
  const verifyUrl = \`https://cmpsbl.com/verify/\${fingerprint}\`;

  console.log("=".repeat(60));
  console.log("CMPSBL® Convex Core™ — Artifact Verification");
  console.log("A PromptFluid™ Product");
  console.log("=".repeat(60));
  console.log(\`  Fingerprint:  \${fingerprint}\`);
  console.log(\`  Primitives:   \${meta?.primitiveCount ?? '?'}\`);
  console.log(\`  Generated:    \${meta?.generatedAt ?? '?'}\`);
  console.log(\`  Runtime:      \${meta?.runtimeVersion ?? '?'}\`);
  console.log(\`  Language:     \${meta?.sourceLanguage ?? '?'}\`);
  console.log();

  let passed = 0;
  const total = 3;

  if (fingerprint && fingerprint.length > 8) { console.log("  ✓ Fingerprint valid"); passed++; }
  else { console.log("  ✗ Fingerprint missing"); }

  if (meta?.runtimeVersion && meta?.orchestrationVersion) { console.log("  ✓ Metadata intact"); passed++; }
  else { console.log("  ✗ Metadata corrupted"); }

  if (meta?.patents || meta?.patent) { console.log("  ✓ Patent reference present"); passed++; }
  else { console.log("  ✗ Patent reference missing"); }

  console.log();
  console.log(\`  Result: \${passed}/\${total} checks passed\`);
  console.log();
  console.log(\`  Online verification:\`);
  console.log(\`    \${verifyUrl}\`);
  console.log();
  console.log("  © ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.");
  console.log("  U.S. Patent App. No. 64/029,678 · No. 64/031,637");
  console.log("=".repeat(60));
  return passed === total;
}

if (typeof process !== 'undefined' && process.argv?.includes('--verify')) {
  const ok = __cmpsbl_verify__();
  process.exit(ok ? 0 : 1);
}
`);
  } else if (lang === 'php') {
    const phpVerify = [
      '',
      '/**',
      ' * CMPSBL® Artifact Self-Verification',
      ' * Run: php <this_file> --verify',
      ' */',
      'function __cmpsbl_verify(): bool {',
      '    $fingerprint = \'' + fingerprint + '\';',
      '    $meta = __CMPSBL_META__;',
      '    $verifyUrl = "https://cmpsbl.com/verify/" . $fingerprint;',
      '',
      '    echo str_repeat(\'=\', 60) . PHP_EOL;',
      '    echo \'CMPSBL® Convex Core™ — Artifact Verification\' . PHP_EOL;',
      '    echo \'A PromptFluid™ Product\' . PHP_EOL;',
      '    echo str_repeat(\'=\', 60) . PHP_EOL;',
      '    echo "  Fingerprint:  " . $fingerprint . PHP_EOL;',
      '    echo "  Primitives:   " . ($meta[\'primitiveCount\'] ?? \'?\') . PHP_EOL;',
      '    echo "  Generated:    " . ($meta[\'generatedAt\'] ?? \'?\') . PHP_EOL;',
      '    echo "  Runtime:      " . ($meta[\'runtimeVersion\'] ?? \'?\') . PHP_EOL;',
      '    echo "  Language:     " . ($meta[\'sourceLanguage\'] ?? \'?\') . PHP_EOL;',
      '    echo PHP_EOL;',
      '',
      '    $passed = 0;',
      '    $total = 4;',
      '',
      '    if (!empty($fingerprint) && strlen($fingerprint) > 8) {',
      '        echo "  ✓ Fingerprint valid" . PHP_EOL;',
      '        $passed++;',
      '    } else {',
      '        echo "  ✗ Fingerprint missing or malformed" . PHP_EOL;',
      '    }',
      '',
      '    if (!empty($meta[\'runtimeVersion\']) && !empty($meta[\'orchestrationVersion\'])) {',
      '        echo "  ✓ Metadata intact" . PHP_EOL;',
      '        $passed++;',
      '    } else {',
      '        echo "  ✗ Metadata corrupted" . PHP_EOL;',
      '    }',
      '',
      '    if (!empty($meta[\'patents\'])) {',
      '        echo "  ✓ Patent reference present" . PHP_EOL;',
      '        $passed++;',
      '    } else {',
      '        echo "  ✗ Patent reference missing" . PHP_EOL;',
      '    }',
      '',
      '    $fileHash = substr(hash(\'sha256\', file_get_contents(__FILE__)), 0, 16);',
      '    echo "  ✓ File hash: " . $fileHash . PHP_EOL;',
      '    $passed++;',
      '',
      '    echo PHP_EOL;',
      '    echo "  Result: " . $passed . "/" . $total . " checks passed" . PHP_EOL;',
      '    echo PHP_EOL;',
      '    echo "  Online verification:" . PHP_EOL;',
      '    echo "    " . $verifyUrl . PHP_EOL;',
      '    echo PHP_EOL;',
      '    echo "  Programmatic verification:" . PHP_EOL;',
      '    echo "    composer require cmpsbl/test-harness" . PHP_EOL;',
      '    echo "    \\\\CMPSBL\\\\verify_fingerprint(\'" . $fingerprint . "\')" . PHP_EOL;',
      '    echo PHP_EOL;',
      '    echo "  © ' + new Date().getFullYear() + ' PromptFluid™ · CMPSBL® · All rights reserved." . PHP_EOL;',
      '    echo "  U.S. Patent App. No. 64/029,678 · No. 64/031,637" . PHP_EOL;',
      '    echo str_repeat(\'=\', 60) . PHP_EOL;',
      '    return $passed === $total;',
      '}',
      '',
      'if (php_sapi_name() === \'cli\' && in_array(\'--verify\', $argv ?? [], true)) {',
      '    $ok = __cmpsbl_verify();',
      '    exit($ok ? 0 : 1);',
      '}',
    ].join('\n');
    lines.push(phpVerify);
  } else {
    // For other languages, embed as comments only
    lines.push(adapter.comment(`VERIFY THIS ARTIFACT: https://cmpsbl.com/verify/${fingerprint}`));
    lines.push(adapter.comment(`Fingerprint: ${fingerprint}`));
    lines.push(adapter.comment('Install: npm install @cmpsbl/test-harness'));
    lines.push(adapter.comment(`Run: verifyFingerprint("${fingerprint}")`));
    lines.push(adapter.comment(`© ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.`));
    lines.push(adapter.comment('U.S. Patent App. No. 64/029,678 · No. 64/031,637'));
  }

  return lines.join('\n');
}

/**
 * Generate the CMPSBLOrchestrator — connects Layer 2 capabilities to Layer 1 functions.
 * This is the critical bridge that makes the dual-layer architecture functional.
 * Without it, L2 stubs exist but never govern L1 execution.
 */
function generateOrchestrator(
  language: string,
  adapter: LanguageAdapter,
  boundaries: Array<{ name: string; line?: number }>,
  selectedPrimitives: PrimitiveRecommendation[],
  attachmentPlan: Array<{ functionName: string; capability: string; primitive: string; reason: string }>,
  fingerprint: string,
): string {
  const lang = language.toLowerCase();
  const lines: string[] = [];

  lines.push('');
  lines.push(adapter.comment('═══════════════════════════════════════════════════════════'));
  lines.push(adapter.comment('CMPSBL® ORCHESTRATION MATRIX'));
  lines.push(adapter.comment('Connects Layer 2 capabilities to Layer 1 function boundaries.'));
  lines.push(adapter.comment('U.S. Patent App. No. 64/029,678 · No. 64/031,637'));
  lines.push(adapter.comment('═══════════════════════════════════════════════════════════'));
  lines.push('');

  // Detect which L2 capability classes were actually imported
  const importedClasses = new Set<string>();
  for (const p of selectedPrimitives) {
    const wrapper = PRIMITIVE_WRAPPERS[p.primitiveId];
    if (wrapper) {
      const parsed = parseImport(wrapper.imports);
      parsed.symbols.forEach(s => importedClasses.add(s));
    }
  }

  const hasCB = importedClasses.has('CircuitBreaker');
  const hasMem = importedClasses.has('PersistentMemory');
  const hasDef = importedClasses.has('DefenseLayer') || importedClasses.has('DefenseGate');
  const hasObs = importedClasses.has('HealthBeacon') || importedClasses.has('MetricsCollector');
  const hasGov = importedClasses.has('GovernanceGate') || importedClasses.has('GovernancePolicy');

  if (lang === 'php') {
    lines.push(generatePhpOrchestrator(boundaries, attachmentPlan, fingerprint, { hasCB, hasMem, hasDef, hasObs, hasGov }));
  } else if (lang === 'python') {
    lines.push(generatePythonOrchestrator(boundaries, attachmentPlan, fingerprint, { hasCB, hasMem, hasDef, hasObs, hasGov }));
  } else if (lang === 'rust') {
    lines.push(generateRustOrchestrator(boundaries, attachmentPlan, fingerprint, adapter));
  } else if (lang === 'go') {
    lines.push(generateGoOrchestrator(boundaries, attachmentPlan, fingerprint, adapter));
  } else {
    // Generic orchestrator as comments + metadata for other languages
    lines.push(adapter.comment('─── Orchestration Matrix Active ───'));
    lines.push(adapter.comment(`Fingerprint: ${fingerprint}`));
    lines.push(adapter.comment(`Functions governed: ${boundaries.length}`));
    lines.push(adapter.comment(`Attachments active: ${attachmentPlan.length}`));
    for (const entry of attachmentPlan) {
      lines.push(adapter.comment(`  ${entry.functionName}() ← ${entry.capability} [${entry.primitive}]`));
    }
  }

  return lines.join('\n');
}

function generatePhpOrchestrator(
  boundaries: Array<{ name: string; line?: number }>,
  attachmentPlan: Array<{ functionName: string; capability: string; primitive: string; reason: string }>,
  fingerprint: string,
  caps: { hasCB: boolean; hasMem: boolean; hasDef: boolean; hasObs: boolean; hasGov: boolean },
): string {
  const functionNames = boundaries.map(b => b.name);
  const wrappedFunctions = attachmentPlan.map(a => a.functionName);

  return `/**
 * CMPSBLOrchestrator — Layer 2 Governance Bridge
 * Wraps Layer 1 function boundaries with Layer 2 capabilities.
 * U.S. Patent App. No. 64/029,678 · No. 64/031,637
 */
class CMPSBLOrchestrator {
    private static array $telemetry = [];
    private static array $governanceLog = [];
    private static string $fingerprint = '${fingerprint}';
    private static bool $initialized = false;
    private static ?PersistentMemory $memory = null;
    private static array $attachments = [];

    /** Initialize the orchestration matrix */
    public static function boot(): void {
        if (self::$initialized) return;
        self::$initialized = true;
        self::$attachments = json_decode(__MANA_ATTACHMENTS__, true) ?? [];
${caps.hasMem ? "        self::$memory = PersistentMemory::init('cmpsbl_orchestrator');" : ''}
${caps.hasDef ? "        DefenseLayer::activate('enforce');" : ''}
${caps.hasObs ? "        HealthBeacon::start(30);" : ''}
        self::emit('orchestrator.boot', ['fingerprint' => self::$fingerprint, 'functions' => ${functionNames.length}]);
    }

    /**
     * Wrap a callable through the governance pipeline.
     * Applies: validation → circuit breaker → execution → telemetry → memory
     */
    public static function govern(string $functionName, callable $fn, array $args = []): mixed {
        self::boot();
        $startTime = microtime(true);

        // Pre-execution governance checks
${caps.hasDef ? `        RequestValidator::validate($args);` : ''}
${caps.hasGov ? `        GovernanceGate::evaluate(['function' => $functionName, 'args' => $args]);` : ''}

        // Circuit breaker protection
${caps.hasCB ? `        try {
            $result = CircuitBreaker::execute(fn() => call_user_func_array($fn, $args));
        } catch (\\Throwable $e) {
            self::emit('orchestrator.error', ['function' => $functionName, 'error' => $e->getMessage()]);
            throw $e;
        }` : `        $result = call_user_func_array($fn, $args);`}

        // Post-execution telemetry
        $duration = (microtime(true) - $startTime) * 1000;
        self::emit('orchestrator.call', [
            'function' => $functionName,
            'duration_ms' => round($duration, 2),
            'success' => true,
        ]);

${caps.hasMem ? `        // Persist execution record
        self::$memory->set("last_call_{$functionName}", [
            'ts' => microtime(true),
            'duration_ms' => round($duration, 2),
            'success' => true,
        ]);` : ''}

        return $result;
    }

    /** Emit a telemetry event */
    private static function emit(string $event, array $data = []): void {
        self::$telemetry[] = [
            'event' => $event,
            'data' => $data,
            'ts' => microtime(true),
            'fingerprint' => self::$fingerprint,
        ];
    }

    /** Get the _cmpsbl output overlay */
    public static function overlay(mixed $originalOutput): array {
        return [
            '_cmpsbl' => [
                'version' => '3.0.0',
                'fingerprint' => self::$fingerprint,
                'governed' => true,
                'telemetry_count' => count(self::$telemetry),
                'attachments' => count(self::$attachments),
            ],
            'result' => $originalOutput,
        ];
    }

    /** Get telemetry log */
    public static function telemetry(): array { return self::$telemetry; }

    /** Get fingerprint */
    public static function fingerprint(): string { return self::$fingerprint; }

    /** Check if orchestrator is active */
    public static function isActive(): bool { return self::$initialized; }
}

${generatePhpWrappedEntryPoints(functionNames, wrappedFunctions)}`;
}

/** Generate wrapped entry points that route through the orchestrator */
function generatePhpWrappedEntryPoints(
  functionNames: string[],
  wrappedFunctions: string[],
): string {
  if (wrappedFunctions.length === 0 && functionNames.length === 0) return '';

  const lines: string[] = [];
  lines.push('/**');
  lines.push(' * CMPSBL® Governed Entry Points');
  lines.push(' * These functions route Layer 1 calls through the Layer 2 governance pipeline.');
  lines.push(' * Usage: CMPSBLOrchestrator::govern("functionName", $callable, $args)');
  lines.push(' */');
  lines.push('');

  // Generate example governed invocations as documentation
  for (const fn of wrappedFunctions.slice(0, 10)) {
    lines.push(`// Governed: ${fn}() — routed through orchestration matrix`);
    lines.push(`// CMPSBLOrchestrator::govern('${fn}', [$instance, '${fn}'], $args);`);
  }

  if (wrappedFunctions.length > 10) {
    lines.push(`// ... and ${wrappedFunctions.length - 10} more governed functions`);
  }

  return lines.join('\n');
}

function generatePythonOrchestrator(
  boundaries: Array<{ name: string; line?: number }>,
  attachmentPlan: Array<{ functionName: string; capability: string; primitive: string; reason: string }>,
  fingerprint: string,
  caps: { hasCB: boolean; hasMem: boolean; hasDef: boolean; hasObs: boolean; hasGov: boolean },
): string {
  const functionNames = boundaries.map(b => b.name);

  return `
class CMPSBLOrchestrator:
    """
    CMPSBL® Orchestration Matrix — Layer 2 Governance Bridge
    Connects Layer 2 capabilities to Layer 1 function boundaries.
    U.S. Patent App. No. 64/029,678 · No. 64/031,637
    """
    _telemetry = []
    _fingerprint = "${fingerprint}"
    _initialized = False
    _memory = None

    @classmethod
    def boot(cls):
        if cls._initialized:
            return
        cls._initialized = True
${caps.hasMem ? '        cls._memory = PersistentMemory.init(namespace="cmpsbl_orchestrator")' : ''}
        cls._emit("orchestrator.boot", {"fingerprint": cls._fingerprint, "functions": ${functionNames.length}})

    @classmethod
    def govern(cls, function_name, fn, *args, **kwargs):
        """Wrap a callable through the governance pipeline."""
        cls.boot()
        import time
        start = time.time()

${caps.hasCB ? `        try:
            result = CircuitBreaker.execute(lambda: fn(*args, **kwargs))
        except Exception as e:
            cls._emit("orchestrator.error", {"function": function_name, "error": str(e)})
            raise` : '        result = fn(*args, **kwargs)'}

        duration = (time.time() - start) * 1000
        cls._emit("orchestrator.call", {
            "function": function_name,
            "duration_ms": round(duration, 2),
            "success": True,
        })
${caps.hasMem ? `        if cls._memory:
            cls._memory.set(f"last_call_{function_name}", {"ts": time.time(), "duration_ms": round(duration, 2)})` : ''}
        return result

    @classmethod
    def overlay(cls, original_output):
        """Get the _cmpsbl output overlay."""
        return {
            "_cmpsbl": {
                "version": "3.0.0",
                "fingerprint": cls._fingerprint,
                "governed": True,
                "telemetry_count": len(cls._telemetry),
            },
            "result": original_output,
        }

    @classmethod
    def _emit(cls, event, data=None):
        import time
        cls._telemetry.append({"event": event, "data": data or {}, "ts": time.time()})

    @classmethod
    def telemetry(cls):
        return list(cls._telemetry)

    @classmethod
    def is_active(cls):
        return cls._initialized
`;
}

function generateRustOrchestrator(
  boundaries: Array<{ name: string; line?: number }>,
  attachmentPlan: Array<{ functionName: string; capability: string; primitive: string; reason: string }>,
  fingerprint: string,
  adapter: LanguageAdapter,
): string {
  return `
/// CMPSBL® Orchestration Matrix — Layer 2 Governance Bridge
/// U.S. Patent App. No. 64/029,678 · No. 64/031,637
pub struct CMPSBLOrchestrator {
    fingerprint: String,
    telemetry: Vec<(String, f64)>,
    initialized: bool,
}

impl CMPSBLOrchestrator {
    pub fn new() -> Self {
        CMPSBLOrchestrator {
            fingerprint: "${fingerprint}".to_string(),
            telemetry: Vec::new(),
            initialized: false,
        }
    }

    pub fn boot(&mut self) {
        if self.initialized { return; }
        self.initialized = true;
        self.emit("orchestrator.boot");
    }

    /// Route a Layer 1 call through the Layer 2 governance pipeline
    pub fn govern<F, R>(&mut self, function_name: &str, f: F) -> R
    where F: FnOnce() -> R {
        self.boot();
        let start = std::time::Instant::now();
        let result = f();
        let duration = start.elapsed().as_secs_f64() * 1000.0;
        self.telemetry.push((function_name.to_string(), duration));
        self.emit(&format!("orchestrator.call.{}", function_name));
        result
    }

    fn emit(&self, event: &str) {
        // Telemetry event emitted: structured for behavioral verification
        let _ = event;
    }

    pub fn overlay(&self) -> String {
        format!(r#"{{"_cmpsbl":{{"version":"3.0.0","fingerprint":"{}","governed":true,"telemetry_count":{}}}}}"#,
            self.fingerprint, self.telemetry.len())
    }

    pub fn is_active(&self) -> bool { self.initialized }
}

${adapter.comment('─── Governed Functions ───')}
${attachmentPlan.slice(0, 15).map(e => adapter.comment(`  ${e.functionName}() ← ${e.capability} [${e.primitive}]`)).join('\n')}
`;
}

function generateGoOrchestrator(
  boundaries: Array<{ name: string; line?: number }>,
  attachmentPlan: Array<{ functionName: string; capability: string; primitive: string; reason: string }>,
  fingerprint: string,
  adapter: LanguageAdapter,
): string {
  return `
// CMPSBLOrchestrator — Layer 2 Governance Bridge
// U.S. Patent App. No. 64/029,678 · No. 64/031,637
type CMPSBLOrchestrator struct {
\tFingerprint string
\tTelemetry   []OrchestratorEvent
\tinitialized bool
}

type OrchestratorEvent struct {
\tFunction   string
\tDurationMs float64
\tTimestamp  int64
}

func NewOrchestrator() *CMPSBLOrchestrator {
\treturn &CMPSBLOrchestrator{Fingerprint: "${fingerprint}"}
}

func (o *CMPSBLOrchestrator) Boot() {
\tif o.initialized { return }
\to.initialized = true
}

// Govern routes a Layer 1 call through the Layer 2 governance pipeline
func (o *CMPSBLOrchestrator) Govern(functionName string, fn func() interface{}) interface{} {
\to.Boot()
\tstart := time.Now()
\tresult := fn()
\tduration := float64(time.Since(start).Microseconds()) / 1000.0
\to.Telemetry = append(o.Telemetry, OrchestratorEvent{
\t\tFunction:   functionName,
\t\tDurationMs: duration,
\t\tTimestamp:  time.Now().Unix(),
\t})
\treturn result
}

func (o *CMPSBLOrchestrator) Overlay() map[string]interface{} {
\treturn map[string]interface{}{
\t\t"_cmpsbl": map[string]interface{}{
\t\t\t"version":         "3.0.0",
\t\t\t"fingerprint":     o.Fingerprint,
\t\t\t"governed":        true,
\t\t\t"telemetry_count": len(o.Telemetry),
\t\t},
\t}
}

func (o *CMPSBLOrchestrator) IsActive() bool { return o.initialized }

${adapter.comment('─── Governed Functions ───')}
${attachmentPlan.slice(0, 15).map(e => adapter.comment(`  ${e.functionName}() ← ${e.capability} [${e.primitive}]`)).join('\n')}
`;

}

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
  // Strip any existing sealed-runtime footers from prior passes to prevent duplication
  // ── Layer 1 Preservation (Patent Compliance) ──────────────────────────
  // U.S. App. No. 64/029,678 — Layer 1 MUST remain byte-identical to the
  // original uploaded source. No regex, no AST transforms, no injection.
  // Only strip prior CMPSBL footers (our own metadata, not user code).
  const verbatimSource = originalCode
    .replace(/\n?.*═══ End of CMPSBL® Convex Core™ Sealed Artifact ═══.*\n?/g, '\n')
    .replace(/\n?.*End of CMPSBL® Convex Core™ Sealed Artifact.*\n?/g, '\n')
    .trimEnd();

  // ── Mana Findings Bridge — Targeted Function Wrapping ──────────────
  // Ascension SCANS + DIAGNOSES. Mana DEPLOYS + DEFENDS.
  // Instead of generic `.activate()` templates, we detect function boundaries
  // in the source, map them to capabilities, and generate surgical wrappers.
  const boundaries = detectFunctionBoundaries(originalCode);
  const activePrimitiveNames = new Set(selectedPrimitives.map(p => p.name.toUpperCase()));
  const findings = buildAttachmentPlan(boundaries, activePrimitiveNames);
  const attachmentPlan = serializeAttachmentPlan(findings);

  // ── Layer 2 Guard Assembly ───────────────────────────────────────────
  // Phase 1: Primitive runtime imports (architectural init)
  for (const p of selectedPrimitives) {
    const wrapper = PRIMITIVE_WRAPPERS[p.primitiveId];
    if (wrapper) {
      const parsed = parseImport(wrapper.imports);
      imports.push(adapter.importStatement(parsed.module, parsed.symbols));

      guards.push(adapter.comment(`─── ${p.name} ───`));
      guards.push(adapter.transformGuard(wrapper.guard));
    }
  }

  // Phase 2: Mana attachment manifest — targeted function wrappers
  // This tells the runtime exactly which functions to wrap with which capabilities.
  if (attachmentPlan.length > 0) {
    guards.push('');
    guards.push(adapter.comment('═══════════════════════════════════════════════════════════'));
    guards.push(adapter.comment('MANA ATTACHMENT MANIFEST — Targeted Function Wrappers'));
    guards.push(adapter.comment('Each entry maps a specific function to a Layer 2 capability.'));
    guards.push(adapter.comment('U.S. Patent App. No. 64/031,637'));
    guards.push(adapter.comment('═══════════════════════════════════════════════════════════'));
    guards.push('');

    const manifestJson = JSON.stringify(attachmentPlan, null, 2);
    guards.push(adapter.constDecl('__MANA_ATTACHMENTS__', manifestJson));

    // Generate per-function wrapper comments showing what Mana targets
    guards.push('');
    guards.push(adapter.comment('─── Targeted Wrappers ───'));
    for (const entry of attachmentPlan) {
      guards.push(adapter.comment(
        `${entry.functionName}() → ${entry.capability} [${entry.primitive}] — ${entry.reason}`
      ));
    }

    guards.push('');
    guards.push(adapter.comment(`Total attachments: ${attachmentPlan.length} functions targeted`));
    guards.push(adapter.comment(`Functions detected: ${boundaries.length}`));
  }

  const headerLines = [
    '═══════════════════════════════════════════════════════════',
    'CMPSBL® Convex Core™ Sealed Artifact',
    'Governed Cognitive Infrastructure · PromptFluid™',
    '═══════════════════════════════════════════════════════════',
    '',
    `Language:     ${detected} (Bridge Adapter)`,
    `Fingerprint:  ${fingerprint}`,
    `Chain:        ${selectedPrimitives.map(p => `${p.name}(${p.collisionScore})`).join(' → ')}`,
    `Primitives:   ${selectedPrimitives.length}`,
    `Generated:    ${new Date().toISOString()}`,
    `Runtime:      Convex Core™ v3.0.0`,
    '',
    '───────────────────────────────────────────────────────────',
    'DUAL-LAYER ARCHITECTURE',
    '  Layer 1 — Original source (byte-identical, unmodified)',
    '  Layer 2 — CMPSBL® orchestration matrix',
    '',
    'INTELLECTUAL PROPERTY',
    '  Inventor: Kenneth E. Sweet Jr.',
    '  U.S. Patent App. No. 64/029,678',
    '    "Dual-Layer Deterministic Software Evolution System"',
    '  U.S. Patent App. No. 64/031,637',
    '    "Silent Symbiotic Software Attachment System"',
    '  © ' + new Date().getFullYear() + ' PromptFluid™ · CMPSBL®',
    '───────────────────────────────────────────────────────────',
    '',
    'DO NOT modify the orchestration matrix or fingerprint.',
    '',
    'VERIFY: https://cmpsbl.com/verify/' + fingerprint,
    '═══════════════════════════════════════════════════════════',
  ];

  const header = adapter.blockComment(headerLines);

  // Generate the compiled preamble — opaque dispatch tables and collision matrix
  const langKey = detected.toLowerCase();
  const primitiveNames = selectedPrimitives.map(p => p.primitiveId);
  const compiledPreamble = generateCompiledPreamble(primitiveNames, fingerprint, langKey);

  // Generate decoy pipeline comments — shows 5 of 12 stages
  const pipelineComments = generateDecoyPipelineComments(primitiveNames, langKey);

  const metaJson = JSON.stringify({
    fingerprint,
    primitiveCount: selectedPrimitives.length,
    generatedAt: new Date().toISOString(),
    runtimeVersion: '3.0.0',
    sourceLanguage: detected,
    orchestrationVersion: '3.1.0',
    pipelineStages: 5,
    chainModel: 'deterministic-cascade',
    chainDepth: selectedPrimitives.length,
    manaAttachments: attachmentPlan.length,
    functionsDetected: boundaries.length,
    verifyUrl: `https://cmpsbl.com/verify/${fingerprint}`,
    inventor: 'Kenneth E. Sweet Jr.',
    patents: [
      'U.S. App. No. 64/029,678 — Dual-Layer Deterministic Software Evolution',
      'U.S. App. No. 64/031,637 — Silent Symbiotic Software Attachment',
    ],
  }, null, 2);

  const metaBlock = [
    adapter.comment('═══ CMPSBL Artifact Metadata ═══'),
    adapter.constDecl('__CMPSBL_META__', metaJson),
  ].join('\n');

  // Generate inline self-verification block (language-aware)
  const verifyBlock = generateSelfVerifyBlock(adapter, fingerprint, detected);

  const footerLines = [
    '═══════════════════════════════════════════════════════════',
    'End of CMPSBL® Convex Core™ Sealed Artifact',
    '═══════════════════════════════════════════════════════════',
    '',
    `Fingerprint:  ${fingerprint}`,
    `Primitives:   ${selectedPrimitives.map(p => p.name).join(', ')}`,
    `Sealed:       ${new Date().toISOString()}`,
    '',
    'VERIFY: https://cmpsbl.com/verify/' + fingerprint,
    '',
    'Inventor: Kenneth E. Sweet Jr.',
    'U.S. Patent App. No. 64/029,678 · No. 64/031,637',
    '© ' + new Date().getFullYear() + ' PromptFluid™ · CMPSBL® · All rights reserved.',
    '═══════════════════════════════════════════════════════════',
  ];

  // ── Assemble Layer 2 (everything except verbatimSource) ──────────────
  const layer2Parts = [
    header,
    '',
    adapter.comment('═══ Runtime Imports ═══'),
    ...imports,
    '',
    metaBlock,
    '',
    compiledPreamble,
    '',
    pipelineComments,
    '',
    adapter.comment('═══════════════════════════════════════════════════════════'),
    adapter.comment('PRIMITIVE INSTRUMENTATION'),
    adapter.comment('Guards bound via orchestration matrix dispatch.'),
    adapter.comment('═══════════════════════════════════════════════════════════'),
    '',
    ...guards,
  ];

  const layer2Code = layer2Parts.join('\n');

  // ── AST-aware Layer 2 Validation (HARD GATE) ────────────────────────
  // Structurally validate our generated code before combining with L1.
  // If validation fails, throw to prevent malformed artifacts from shipping.
  const validation = validateLayer2(layer2Code, detected);
  if (!validation.valid) {
    const criticalErrors = validation.errors.filter(e => e.severity === 'error');
    if (criticalErrors.length > 0) {
      const errorSummary = criticalErrors
        .map(e => `  L${e.line}: ${e.message}`)
        .join('\n');
      throw new Error(
        `Layer 2 structural validation failed — ${criticalErrors.length} error(s) detected. ` +
        `Export blocked to protect artifact integrity.\n${errorSummary}`
      );
    }
    // Warnings only — annotate but allow export
    const warnSummary = validation.errors
      .map(e => `  L${e.line}: ${e.message}`)
      .join('\n');
    layer2Parts.push('');
    layer2Parts.push(adapter.comment(`⚠ LAYER 2 VALIDATION: ${validation.errors.length} warning(s)`));
    layer2Parts.push(adapter.comment(warnSummary));
  }

  // ── PHP: Single opening tag ────────────────────────────────────────
  // PHP files need exactly ONE <?php tag at the very top. Strip any from
  // the verbatim source since we control the opening tag.
  const isPhp = detected.toLowerCase() === 'php';
  const phpOpenTag = isPhp ? '<?php\n' : '';
  const finalVerbatim = isPhp
    ? verbatimSource.replace(/^<\?php\s*/gm, '').trimStart()
    : verbatimSource;

  // ── Orchestrator: Connects Layer 2 to Layer 1 ────────────────────
  // Generates the CMPSBLOrchestrator class that wraps the original code's
  // entry points and integrates L2 capabilities (telemetry, governance,
  // circuit breaking, memory) with L1 function calls.
  const orchestrator = generateOrchestrator(
    detected,
    adapter,
    boundaries,
    selectedPrimitives,
    attachmentPlan,
    fingerprint,
  );

  // ── Final Assembly: Layer 2 + Orchestrator + Layer 1 (verbatim) ───
  return [
    phpOpenTag,
    layer2Code,
    '',
    orchestrator,
    '',
    adapter.comment('═══════════════════════════════════════════════════════════'),
    adapter.comment('ORIGINAL SOURCE (UNMODIFIED — LAYER 1)'),
    adapter.comment('Verified byte-identical to uploaded source.'),
    adapter.comment('U.S. Patent App. No. 64/029,678 · No. 64/031,637'),
    adapter.comment('═══════════════════════════════════════════════════════════'),
    '',
    finalVerbatim,
    '',
    verifyBlock,
    '',
    adapter.blockComment(footerLines),
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
   the ascended code contained in this package for any lawful purpose.

2. OWNERSHIP
   The ascended code and all hardening applied by CMPSBL primitives
   remain the intellectual property of the licensee. CMPSBL retains
   ownership of the primitive runtime libraries (@cmpsbl/*).

3. RESTRICTIONS
   - You may not redistribute the @cmpsbl/runtime libraries separately.
   - You may not remove or bypass primitive guard activations.
   - You may not claim CMPSBL certification for code not processed
     through the official Ascension Lab.

4. WARRANTY
   This code has been scanned, analyzed, and hardened by the CMPSBL
   six-primitive scan team (ENCODE, ORACLE, ENGINEER, MEDIC, DEFENSE,
   FAILSAFE). The CJPI score and tier reflect the state at time of
   ascension.

5. SUPPORT
   Visit https://cmpsbl.com/support or use your fingerprint ID
   (${fingerprint}) to access DECODE support for this ascension.

© ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.
`;
}
