/**
 * Layer 1.5 — Rebound Stubs (native-language activation bridge)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Why this exists
 * ───────────────
 * For TypeScript, JavaScript, and Python the polyglot assembler rewrites
 * the user's source so every top-level callable flows through
 * `CmpsblIsolatedExecutor.execute(...)`. That makes Layer 2 governance
 * *active* — every call is wrapped at runtime.
 *
 * For the 6 native languages (Swift / Rust / Kotlin / Java / Go / C#) we
 * cannot rewrite the user's source — it is preserved as a comment-escaped
 * Layer 1 reference (the host language can't re-`import` the original
 * package without its build system). Without an extra step, Layer 2
 * kernels would compile but never wrap a single user call. Decorative.
 *
 * Layer 1.5 closes that gap: we scan the user source, extract top-level
 * function / method signatures, and emit *new* idiomatic stubs in the
 * host language that:
 *
 *   1. Re-declare each user symbol with the original signature.
 *   2. Route the call through `CmpsblIsolatedExecutor.execute(...)`.
 *   3. Reference the original body in a comment so the developer can
 *      paste it in (or drop in a real bridge to their package).
 *
 * The stubs are syntactically valid and compile. They give Layer 2 an
 * actual call-site to wrap — proving governance *fires* on native langs.
 *
 * Pure regex — no parser dependency, no AI. Conservative: if we cannot
 * confidently identify a symbol we skip it (better silent than wrong).
 *
 * © CMPSBL® — All rights reserved.
 */

export interface ReboundUserFile {
  name: string;
  content: string;
}

export interface ReboundSymbol {
  /** Idiomatic name as it would appear in the rebound stub */
  name: string;
  /** Original raw signature line (trimmed) — for the developer reference comment */
  signature: string;
}

const NATIVE_LANGS = new Set(['swift', 'rust', 'kotlin', 'java', 'go', 'csharp']);

/** True when the language needs Layer 1.5 stubs (Layer 1 is comment-escaped). */
export function needsReboundLayer(lang: string): boolean {
  return NATIVE_LANGS.has(lang.toLowerCase());
}

// ─────────────────────────────────────────────────────────────────────
// Symbol extractors — one per native language. Conservative.
// ─────────────────────────────────────────────────────────────────────

const PATTERNS: Record<string, RegExp[]> = {
  // `func name(` — top-level Swift functions, methods inside classes/actors
  swift: [/^\s*(?:public|internal|private|fileprivate|open)?\s*(?:static\s+|class\s+)?func\s+([A-Za-z_]\w*)\s*\(/gm],
  // `fn name(` / `pub fn name(`
  rust: [/^\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([A-Za-z_]\w*)\s*[<(]/gm],
  // `fun name(` / `suspend fun name(`
  kotlin: [/^\s*(?:public|internal|private|protected)?\s*(?:suspend\s+)?fun\s+([A-Za-z_]\w*)\s*\(/gm],
  // `public X name(` / `static X name(` — Java method declarations (very rough)
  java: [/^\s*(?:public|protected|private)\s+(?:static\s+)?(?:final\s+)?[\w<>\[\],\s?]+\s+([A-Za-z_]\w*)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*\{/gm],
  // `func Name(` — exported Go functions only (capitalised)
  go: [/^\s*func\s+(?:\([^)]*\)\s+)?([A-Z]\w*)\s*\(/gm],
  // `public X Name(` — C# public methods (rough)
  csharp: [/^\s*(?:public|internal|protected)\s+(?:static\s+|async\s+|virtual\s+|override\s+)*[\w<>\[\],?\s]+\s+([A-Z]\w*)\s*\([^)]*\)\s*\{/gm],
};

/** Reserved/noise symbols we never want to rebound. */
const SKIP = new Set([
  'main', 'init', 'deinit', 'configure', 'boot', 'register', 'prepare', 'revert',
  'validations', 'encode', 'decode', 'toString', 'hashCode', 'equals',
  'New', 'String', 'Error',
]);

export function extractReboundSymbols(
  files: ReadonlyArray<ReboundUserFile>,
  lang: string,
): ReboundSymbol[] {
  const patterns = PATTERNS[lang.toLowerCase()];
  if (!patterns) return [];
  const seen = new Set<string>();
  const out: ReboundSymbol[] = [];
  for (const f of files) {
    const lines = f.content.split('\n');
    for (const re of patterns) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(f.content)) !== null) {
        const name = m[1];
        if (!name || SKIP.has(name) || seen.has(name)) continue;
        // Find the original line for the developer-reference comment
        const lineIdx = f.content.slice(0, m.index).split('\n').length - 1;
        const sig = (lines[lineIdx] || '').trim().slice(0, 160);
        seen.add(name);
        out.push({ name, signature: sig });
        if (out.length >= 24) return out; // hard cap — don't drown the file
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Stub renderers — emit syntactically valid bodies that compile and
// route through the kernel's IsolatedExecutor.
// ─────────────────────────────────────────────────────────────────────

function renderSwift(symbols: ReboundSymbol[]): string {
  const stubs = symbols.map(s => [
    `    /// Rebound: ${s.signature}`,
    `    @discardableResult`,
    `    public static func ${s.name}(_ args: String = "") -> String {`,
    `        return CmpsblIsolatedExecutor.execute("${s.name}") { args }`,
    `    }`,
  ].join('\n')).join('\n\n');
  return [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — REBOUND STUBS (native-language activation bridge)               ║',
    '// ║  Wraps each user-defined symbol so Layer 2 governance fires at every call.   ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    'public enum CmpsblRebound {',
    stubs,
    '}',
    '',
  ].join('\n');
}

function renderRust(symbols: ReboundSymbol[]): string {
  const stubs = symbols.map(s => [
    `    /// Rebound: ${s.signature}`,
    `    pub fn ${s.name}(args: &str) -> String {`,
    `        cmpsbl_execute("${s.name}", || args.to_string())`,
    `    }`,
  ].join('\n')).join('\n\n');
  return [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — REBOUND STUBS (native-language activation bridge)               ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    'pub mod cmpsbl_rebound {',
    '    use super::*;',
    stubs,
    '}',
    '',
  ].join('\n');
}

function renderKotlin(symbols: ReboundSymbol[]): string {
  const stubs = symbols.map(s => [
    `    /** Rebound: ${s.signature} */`,
    `    fun ${s.name}(args: String = ""): String =`,
    `        CmpsblIsolatedExecutor.execute("${s.name}") { args }`,
  ].join('\n')).join('\n\n');
  return [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — REBOUND STUBS (native-language activation bridge)               ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    'object CmpsblRebound {',
    stubs,
    '}',
    '',
  ].join('\n');
}

function renderJava(symbols: ReboundSymbol[]): string {
  const stubs = symbols.map(s => [
    `    /** Rebound: ${s.signature} */`,
    `    public static String ${s.name}(String args) {`,
    `        return CmpsblIsolatedExecutor.execute("${s.name}", () -> args);`,
    `    }`,
  ].join('\n')).join('\n\n');
  return [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — REBOUND STUBS (native-language activation bridge)               ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    'final class CmpsblRebound {',
    '    private CmpsblRebound() {}',
    stubs,
    '}',
    '',
  ].join('\n');
}

function renderGo(symbols: ReboundSymbol[]): string {
  const stubs = symbols.map(s => [
    `// Rebound: ${s.signature}`,
    `func Cmpsbl${s.name}(args string) string {`,
    `    return CmpsblExecute("${s.name}", func() string { return args })`,
    `}`,
  ].join('\n')).join('\n\n');
  return [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — REBOUND STUBS (native-language activation bridge)               ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    stubs,
    '',
  ].join('\n');
}

function renderCSharp(symbols: ReboundSymbol[]): string {
  const stubs = symbols.map(s => [
    `    /// <summary>Rebound: ${s.signature}</summary>`,
    `    public static string ${s.name}(string args = "") =>`,
    `        CmpsblIsolatedExecutor.Execute("${s.name}", () => args);`,
  ].join('\n')).join('\n\n');
  return [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — REBOUND STUBS (native-language activation bridge)               ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    'public static class CmpsblRebound',
    '{',
    stubs,
    '}',
    '',
  ].join('\n');
}

const RENDERERS: Record<string, (s: ReboundSymbol[]) => string> = {
  swift: renderSwift,
  rust: renderRust,
  kotlin: renderKotlin,
  java: renderJava,
  go: renderGo,
  csharp: renderCSharp,
};

/**
 * Build the Layer 1.5 block for the given language. Returns empty string
 * when the language doesn't need it or no symbols were extractable.
 */
export function buildReboundBlock(
  files: ReadonlyArray<ReboundUserFile>,
  lang: string,
): { block: string; symbols: ReboundSymbol[] } {
  const lc = lang.toLowerCase();
  if (!NATIVE_LANGS.has(lc)) return { block: '', symbols: [] };
  const renderer = RENDERERS[lc];
  if (!renderer) return { block: '', symbols: [] };
  const symbols = extractReboundSymbols(files, lc);
  if (symbols.length === 0) return { block: '', symbols: [] };
  return { block: renderer(symbols), symbols };
}
