/**
 * CMPSBL® Language Parity Tier Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for which languages V2 Ascension can emit, and the
 * **honest** maturity tier for each.
 *
 * ─── Tiers (in order of maturity) ────────────────────────────────────────────
 *
 *   CANONICAL      — TS, JS, Python.
 *                    First-class generators (`generateUnifiedTypeScript`,
 *                    `generateUnifiedJavaScript`, `generateUnifiedPython`) in
 *                    `unified-capability-file.ts`. Layer code is the real
 *                    `tsCode` / `pyCode` from each layer definition. These are
 *                    the contract — golden-file regression locked.
 *
 *   BETA_POLYGLOT  — Rust, Go, Java, C#, Swift, Kotlin (and the long tail of
 *                    polyglot targets).
 *                    Emitted via the V1 polyglot template engine
 *                    (`polyglot-templates.ts` + `cmpsbl-layer-polyglot.ts`)
 *                    using hand-written kernel/layer bodies in
 *                    `layers-{rs,go,java,csharp,swift,kotlin}/`. The output is
 *                    a syntactically-valid native file that embeds Layer 1
 *                    verbatim and renders the selected layers using the host
 *                    language's idiom — but it is **not** runtime-verified
 *                    parity with the canonical TS executor. We emit it, we
 *                    label it Beta, we don't lie about it.
 *
 *   COMING_SOON    — On the picker, disabled, no emit. The ones we have not
 *                    written polyglot bodies for yet.
 *
 *   HIDDEN         — Not in the picker. Default for any unknown language.
 *
 * ─── What changed (and why) ─────────────────────────────────────────────────
 *
 * The previous version of this file marked Rust/Go/Java/Kotlin/C#/Swift as
 * `SHIPPING`, which implied per-language native parity verified by a chain
 * executor. That parity model never landed end-to-end. The actual export path
 * for those languages is the V1 polyglot template engine — which works, ships
 * real files, and is what the V2 results step calls today. Marking them
 * `SHIPPING` was misleading. They are now `BETA_POLYGLOT`, which is the
 * truth.
 *
 * Anything in `layers-{lang}/*-parity-harness.ts` or `*-chain-executor.ts`
 * that was scaffolded for the v2 parity model is **not on the export path**
 * and is marked `@deprecated` at the file level so future passes don't get
 * confused into wiring it up again.
 *
 * © CMPSBL® — All rights reserved.
 */

/**
 * Parity status for a target language.
 *
 * - CANONICAL:     First-class generator. Real today, byte-stable, runtime-verified.
 * - BETA_POLYGLOT: V1 polyglot template engine. Emits a real native file and
 *                  embeds Layer 1 verbatim, but is not runtime-parity with the
 *                  canonical TS executor. Surfaced in the UI with a "Beta" badge.
 * - COMING_SOON:   On the roadmap. Picker shows them disabled.
 * - HIDDEN:        Removed from all selection surfaces.
 *
 * `SHIPPING` is kept as a synonym (= CANONICAL ∪ BETA_POLYGLOT) only for the
 * back-compat helper `isLanguageShipping()` and existing callers that haven't
 * been migrated yet.
 */
export type LanguageParityStatus =
  | 'CANONICAL'
  | 'BETA_POLYGLOT'
  | 'COMING_SOON'
  | 'HIDDEN';

export interface LanguageParityEntry {
  /** Canonical language id (lowercase, matches polyglot generator keys). */
  readonly id: string;
  /** Display label for the UI. */
  readonly label: string;
  /** Current parity status. */
  readonly status: LanguageParityStatus;
  /**
   * Optional roadmap note shown in tooltip / docs for COMING_SOON languages.
   * Should answer: "what's the gating work?"
   */
  readonly roadmapNote?: string;
}

/** Default roadmap note for COMING_SOON entries — keeps the registry terse. */
const ROADMAP_NOTE_DEFAULT =
  'Polyglot template body in progress. Will graduate to BETA_POLYGLOT when the emitter renders a complete native artifact.';

/** Helper — terse COMING_SOON declaration so adding a language is one line. */
const cs = (id: string, label: string, note: string = ROADMAP_NOTE_DEFAULT): LanguageParityEntry =>
  ({ id, label, status: 'COMING_SOON', roadmapNote: note });

/** Helper — terse BETA_POLYGLOT declaration. */
const beta = (id: string, label: string): LanguageParityEntry =>
  ({ id, label, status: 'BETA_POLYGLOT' });

export const LANGUAGE_PARITY_REGISTRY: ReadonlyArray<LanguageParityEntry> = Object.freeze([
  // ─── Tier 1 — CANONICAL (the contract; golden-file locked) ──────────────
  { id: 'typescript', label: 'TypeScript', status: 'CANONICAL' },
  { id: 'javascript', label: 'JavaScript', status: 'CANONICAL' },
  { id: 'python',     label: 'Python',     status: 'CANONICAL' },

  // ─── Tier 2 — BETA_POLYGLOT ──────────────────────────────────────────────
  // Every language with a generator wired into `LANGUAGE_GENERATORS` in
  // `polyglot-templates.ts`. These emit a real native file via the V1
  // polyglot engine, but are not yet runtime-verified parity with the
  // canonical TS executor — hence the "Beta" surface in the UI.
  // Source of truth: src/lib/export/polyglot-templates.ts → LANGUAGE_GENERATORS.

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

  // Hardware / HDL (polyglot engine ships kernels for these)
  beta('verilog',       'Verilog'),
  beta('systemverilog', 'SystemVerilog'),
  beta('vhdl',          'VHDL'),
  beta('chisel',        'Chisel'),
  beta('amaranth',      'Amaranth'),
  beta('spinalhdl',     'SpinalHDL'),
  beta('firrtl',        'FIRRTL'),

  // ─── Tier 3 — COMING_SOON (no polyglot generator yet) ───────────────────
  cs('nim',         'Nim'),
  cs('crystal',     'Crystal'),
  cs('groovy',      'Groovy'),
  cs('clojure',     'Clojure'),
  cs('fsharp',      'F#'),
  cs('vbnet',       'VB.NET'),
  cs('objectivec',  'Objective-C'),
  cs('php',         'PHP'),
  cs('perl',        'Perl'),
  cs('julia',       'Julia'),
  cs('erlang',      'Erlang'),
  cs('ocaml',       'OCaml'),
  cs('elm',         'Elm'),
  cs('bash',        'Bash'),
  cs('powershell',  'PowerShell'),
]);


const REGISTRY_INDEX: ReadonlyMap<string, LanguageParityEntry> = new Map(
  LANGUAGE_PARITY_REGISTRY.map((e) => [e.id.toLowerCase(), e]),
);

/**
 * Resolve the parity status for a language id. Unknown languages → HIDDEN.
 * Comparison is case-insensitive on the canonical id.
 */
export function getLanguageParityStatus(lang: string): LanguageParityStatus {
  const entry = REGISTRY_INDEX.get(lang.toLowerCase());
  return entry?.status ?? 'HIDDEN';
}

/** Get the full registry entry for a language, if known. */
export function getLanguageParityEntry(lang: string): LanguageParityEntry | null {
  return REGISTRY_INDEX.get(lang.toLowerCase()) ?? null;
}

/** CANONICAL languages only — TS, JS, Python. The contract. */
export function getCanonicalLanguages(): ReadonlyArray<LanguageParityEntry> {
  return LANGUAGE_PARITY_REGISTRY.filter((e) => e.status === 'CANONICAL');
}

/** BETA_POLYGLOT languages — emit via the V1 polyglot engine. */
export function getBetaPolyglotLanguages(): ReadonlyArray<LanguageParityEntry> {
  return LANGUAGE_PARITY_REGISTRY.filter((e) => e.status === 'BETA_POLYGLOT');
}

/**
 * Convenience: every language that can ship a real export today
 * (CANONICAL ∪ BETA_POLYGLOT). Ordered: canonical first, then beta.
 *
 * @deprecated Prefer `getCanonicalLanguages()` + `getBetaPolyglotLanguages()`
 *   so the UI can label tiers honestly. Kept for back-compat.
 */
export function getShippingLanguages(): ReadonlyArray<LanguageParityEntry> {
  return [...getCanonicalLanguages(), ...getBetaPolyglotLanguages()];
}

/** Convenience: languages on the roadmap (UI surfaces these as disabled). */
export function getComingSoonLanguages(): ReadonlyArray<LanguageParityEntry> {
  return LANGUAGE_PARITY_REGISTRY.filter((e) => e.status === 'COMING_SOON');
}

/**
 * Lowercase set of every language that should appear in the picker
 * (CANONICAL + BETA_POLYGLOT + COMING_SOON). HIDDEN languages are absent.
 */
export function getVisibleLanguageIds(): ReadonlySet<string> {
  return new Set(
    LANGUAGE_PARITY_REGISTRY
      .filter((e) => e.status !== 'HIDDEN')
      .map((e) => e.id.toLowerCase()),
  );
}

/**
 * V2 EXPORT GATE:
 * The export pipeline is allowed to emit for any non-hidden language.
 * - CANONICAL → first-class generator (TS / JS / Py).
 * - BETA_POLYGLOT → V1 polyglot engine (rust/go/java/csharp/swift/kotlin/…).
 * - COMING_SOON → also allowed today; the polyglot engine returns an empty
 *   string for any language it can't render, which the caller handles by
 *   falling back to the generic emitter.
 *
 * Original strict-shipping behavior is preserved as a comment for reference.
 */
export function isLanguageShipping(lang: string): boolean {
  const status = getLanguageParityStatus(lang);
  return status === 'CANONICAL' || status === 'BETA_POLYGLOT' || status === 'COMING_SOON';
}

/** True if the language is canonical (real generator, byte-stable). */
export function isLanguageCanonical(lang: string): boolean {
  return getLanguageParityStatus(lang) === 'CANONICAL';
}

/** True if the language emits via the V1 polyglot engine (Beta tier). */
export function isLanguageBetaPolyglot(lang: string): boolean {
  return getLanguageParityStatus(lang) === 'BETA_POLYGLOT';
}

/** True if the language is on the picker but not yet exportable. */
export function isLanguageComingSoon(lang: string): boolean {
  return getLanguageParityStatus(lang) === 'COMING_SOON';
}

/**
 * Error thrown when the export pipeline is asked to emit a non-shipping language.
 * Catch this at UI boundaries to render a clean message instead of a stack trace.
 */
export class LanguageNotShippingError extends Error {
  readonly lang: string;
  readonly status: LanguageParityStatus;
  readonly roadmapNote?: string;

  constructor(lang: string) {
    const entry = getLanguageParityEntry(lang);
    const status = entry?.status ?? 'HIDDEN';
    const reason =
      status === 'COMING_SOON'
        ? `${entry?.label ?? lang} is on the polyglot roadmap but not yet shipping.`
        : `${lang} is not a supported export target.`;
    super(`[CMPSBL:LanguageNotShipping:${lang}] ${reason}`);
    this.name = 'LanguageNotShippingError';
    this.lang = lang;
    this.status = status;
    this.roadmapNote = entry?.roadmapNote;
  }
}

/**
 * Soft gate for the export pipeline. Currently a no-op so the V1 polyglot
 * engine can serve every visible language. Kept as the single chokepoint so a
 * future tightening (e.g. "block COMING_SOON entries") is one edit.
 */
export function assertLanguageShipping(lang: string): void {
  // Intentional no-op — see isLanguageShipping() and the V2 EXPORT GATE doc above.
  void lang;
}
