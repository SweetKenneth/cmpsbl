/**
 * CMPSBL® V2 Supported Languages Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for which languages V2 Ascension can emit, and the
 * honest maturity tier for each.
 *
 * ─── Tiers ──────────────────────────────────────────────────────────────────
 *
 *   CANONICAL  — TS, JS, Python, PHP.
 *                First-class generators in `unified-capability-file.ts` that
 *                produce a working single-file runtime. Golden-file regression
 *                locked.
 *
 *   BETA       — Everything else that emits today. Real fulfillment via
 *                `polyglot-templates.ts` → hand-tuned native kernel +
 *                Layer 1 verbatim (Rust, Go, Java, Kotlin, C#, Swift,
 *                C, C++, Zig, Scala, Ruby, Lua, R, Dart, Elixir, Haskell,
 *                and the HDL/GPU/blockchain families). Every BETA language
 *                emits a real downloadable file via the polyglot template
 *                engine — no doc-only / port-spec emitters.
 *
 *   HIDDEN     — Not in the picker. Default for any unknown language.
 *
 * © CMPSBL® — All rights reserved.
 */

export type V2LanguageStatus = 'CANONICAL' | 'BETA' | 'HIDDEN';

export interface V2LanguageEntry {
  /** Canonical language id (lowercase, matches polyglot generator keys). */
  readonly id: string;
  /** Display label for the UI. */
  readonly label: string;
  /** Current tier. */
  readonly status: V2LanguageStatus;
}

const beta = (id: string, label: string): V2LanguageEntry =>
  ({ id, label, status: 'BETA' });

export const V2_LANGUAGE_REGISTRY: ReadonlyArray<V2LanguageEntry> = Object.freeze([
  // ─── CANONICAL ─────────────────────────────────────────────────────────
  { id: 'typescript', label: 'TypeScript', status: 'CANONICAL' },
  { id: 'javascript', label: 'JavaScript', status: 'CANONICAL' },
  { id: 'python',     label: 'Python',     status: 'CANONICAL' },
  { id: 'php',        label: 'PHP',        status: 'CANONICAL' },

  // ─── BETA — hand-tuned polyglot template ──────────────────────────────
  // Systems & native
  beta('rust',          'Rust'),
  beta('go',            'Go'),
  beta('c',             'C'),
  beta('cpp',           'C++'),
  beta('zig',           'Zig'),
  // JVM family
  beta('java',          'Java'),
  beta('kotlin',        'Kotlin'),
  beta('scala',         'Scala'),
  // .NET family
  beta('csharp',        'C#'),
  // Apple platforms
  beta('swift',         'Swift'),
  // Scripting & dynamic
  beta('ruby',          'Ruby'),
  beta('lua',           'Lua'),
  beta('r',             'R'),
  beta('dart',          'Dart'),
  // BEAM family
  beta('elixir',        'Elixir'),
  // Functional
  beta('haskell',       'Haskell'),
  // Hardware / HDL
  beta('verilog',       'Verilog'),
  beta('systemverilog', 'SystemVerilog'),
  beta('vhdl',          'VHDL'),
  beta('chisel',        'Chisel'),
  beta('amaranth',      'Amaranth'),
  beta('firrtl',        'FIRRTL'),
  beta('systemc',       'SystemC'),
  beta('spice',         'SPICE'),
  beta('bluespec',      'Bluespec'),
  // GPU / shader
  beta('cuda',          'CUDA'),
  beta('glsl',          'GLSL'),
  beta('hlsl',          'HLSL'),
  beta('wgsl',          'WGSL'),
  beta('metal',         'Metal'),
  beta('opencl',        'OpenCL'),
  // Blockchain / smart contract
  beta('solidity',      'Solidity'),
  beta('vyper',         'Vyper'),
  beta('move',          'Move'),
  beta('cairo',         'Cairo'),

]);

const REGISTRY_INDEX: ReadonlyMap<string, V2LanguageEntry> = new Map(
  V2_LANGUAGE_REGISTRY.map((e) => [e.id.toLowerCase(), e]),
);

/** Resolve the tier for a language id. Unknown → HIDDEN. */
export function getV2LanguageStatus(lang: string): V2LanguageStatus {
  return REGISTRY_INDEX.get(lang.toLowerCase())?.status ?? 'HIDDEN';
}

/** Get the full registry entry for a language, if known. */
export function getV2LanguageEntry(lang: string): V2LanguageEntry | null {
  return REGISTRY_INDEX.get(lang.toLowerCase()) ?? null;
}

/** CANONICAL languages — TS, JS, Python, PHP. */
export function getCanonicalLanguages(): ReadonlyArray<V2LanguageEntry> {
  return V2_LANGUAGE_REGISTRY.filter((e) => e.status === 'CANONICAL');
}

/** BETA languages — emit via the V1 polyglot engine or generic port-spec. */
export function getBetaLanguages(): ReadonlyArray<V2LanguageEntry> {
  return V2_LANGUAGE_REGISTRY.filter((e) => e.status === 'BETA');
}

/**
 * Every language that can ship a real export today (CANONICAL ∪ BETA).
 * Ordered: canonical first, then beta.
 */
export function getSupportedLanguages(): ReadonlyArray<V2LanguageEntry> {
  return [...getCanonicalLanguages(), ...getBetaLanguages()];
}

/** Lowercase set of every language that should appear in the picker. */
export function getVisibleLanguageIds(): ReadonlySet<string> {
  return new Set(
    V2_LANGUAGE_REGISTRY
      .filter((e) => e.status !== 'HIDDEN')
      .map((e) => e.id.toLowerCase()),
  );
}

/** True if the language can emit a V2 artifact (CANONICAL or BETA). */
export function isLanguageSupported(lang: string): boolean {
  const s = getV2LanguageStatus(lang);
  return s === 'CANONICAL' || s === 'BETA';
}

/** True if the language is canonical (real generator, byte-stable). */
export function isLanguageCanonical(lang: string): boolean {
  return getV2LanguageStatus(lang) === 'CANONICAL';
}

/** True if the language emits via the V1 polyglot engine (Beta tier). */
export function isLanguageBeta(lang: string): boolean {
  return getV2LanguageStatus(lang) === 'BETA';
}

/**
 * Error thrown when the export pipeline is asked to emit an unsupported
 * language. Catch this at UI boundaries to render a clean message.
 */
export class LanguageNotSupportedError extends Error {
  readonly lang: string;
  readonly status: V2LanguageStatus;

  constructor(lang: string) {
    const entry = getV2LanguageEntry(lang);
    const status = entry?.status ?? 'HIDDEN';
    super(`[CMPSBL:LanguageNotSupported:${lang}] ${lang} is not a supported V2 export target.`);
    this.name = 'LanguageNotSupportedError';
    this.lang = lang;
    this.status = status;
  }
}

/**
 * Hard gate for the export pipeline. Throws LanguageNotSupportedError if the
 * language is HIDDEN. Single chokepoint so future tightening is one edit.
 */
export function assertLanguageSupported(lang: string): void {
  if (!isLanguageSupported(lang)) {
    throw new LanguageNotSupportedError(lang);
  }
}
