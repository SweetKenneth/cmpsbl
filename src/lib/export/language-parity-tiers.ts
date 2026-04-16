/**
 * CMPSBL® Language Parity Tier Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for which languages can ship a real Ascension Layer
 * export today, and which are still working toward parity.
 *
 * "Parity" means the language has, for every selected layer:
 *   1. A native, executable implementation of the layer's behavior
 *   2. A deterministic, phase-ordered chain executor that wires layers
 *      around the customer's Layer 1 code in the locked CMPSBL phase order
 *      (Hardening → Governance → Foresight → Resilience → Intelligence →
 *      Performance → [Layer 1] → Evolution → Post Audit + Compliance)
 *   3. A passing parity test that proves identical behavior to the TS canon
 *
 * Anything below SHIPPING tier is gated out of the export pipeline. The UI
 * surfaces COMING_SOON languages as disabled with a "Coming Soon" badge.
 * Languages not listed here at all are hidden entirely.
 *
 * © CMPSBL® — All rights reserved.
 */

/**
 * Parity status for a target language.
 *
 * - SHIPPING:    Real today. Every layer has a native implementation,
 *                deterministic chain executor verified by parity tests.
 *                The export pipeline emits real artifacts.
 * - COMING_SOON: On the roadmap to parity. The export pipeline refuses to
 *                emit artifacts for these langs (no fake stubs). The UI
 *                shows them as disabled with a "Coming Soon" tooltip.
 * - HIDDEN:      Not on the parity roadmap. Removed from all selection
 *                surfaces. (Default for any unknown language.)
 */
export type LanguageParityStatus = 'SHIPPING' | 'COMING_SOON' | 'HIDDEN';

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

/**
 * The Honest 12.
 *
 * Tier 1 — SHIPPING (3 languages, real today):
 *   TypeScript, JavaScript, Python
 *
 * Tier 2 — COMING_SOON (9 languages, on the roadmap to full parity):
 *   Rust, Go, Java, C#, Kotlin, Swift, Ruby, PHP, Elixir
 *
 * Anything not in this list is HIDDEN by default — including HDLs, GPU
 * shading languages, and the long tail of stub-only targets that don't
 * carry runtime guarantees.
 */
export const LANGUAGE_PARITY_REGISTRY: ReadonlyArray<LanguageParityEntry> = Object.freeze([
  // ─── Tier 1 — SHIPPING ─────────────────────────────────────────────────────
  {
    id: 'typescript',
    label: 'TypeScript',
    status: 'SHIPPING',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    status: 'SHIPPING',
  },
  {
    id: 'python',
    label: 'Python',
    status: 'SHIPPING',
  },

  // ─── Tier 2 — COMING_SOON (Honest 12 roadmap) ─────────────────────────────
  {
    id: 'rust',
    label: 'Rust',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'go',
    label: 'Go',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'java',
    label: 'Java',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'csharp',
    label: 'C#',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'swift',
    label: 'Swift',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'ruby',
    label: 'Ruby',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'php',
    label: 'PHP',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
  {
    id: 'elixir',
    label: 'Elixir',
    status: 'COMING_SOON',
    roadmapNote:
      'Native implementations for all 20 layers + deterministic phase chain executor in progress. Parity tests must pass before export unlocks.',
  },
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

/** Convenience: only the languages that can ship a real export today. */
export function getShippingLanguages(): ReadonlyArray<LanguageParityEntry> {
  return LANGUAGE_PARITY_REGISTRY.filter((e) => e.status === 'SHIPPING');
}

/** Convenience: languages on the roadmap (UI surfaces these as disabled). */
export function getComingSoonLanguages(): ReadonlyArray<LanguageParityEntry> {
  return LANGUAGE_PARITY_REGISTRY.filter((e) => e.status === 'COMING_SOON');
}

/**
 * Lowercase set of every language that should appear in the picker
 * (SHIPPING + COMING_SOON). HIDDEN languages are absent entirely.
 */
export function getVisibleLanguageIds(): ReadonlySet<string> {
  return new Set(
    LANGUAGE_PARITY_REGISTRY
      .filter((e) => e.status !== 'HIDDEN')
      .map((e) => e.id.toLowerCase()),
  );
}

/**
 * True only when the language can ship a real, runtime-verified export today.
 * The export pipeline MUST gate on this — never emit artifacts for non-shipping
 * languages. Returning a stub that looks real but isn't is the failure mode
 * this whole registry exists to prevent.
 */
export function isLanguageShipping(lang: string): boolean {
  return getLanguageParityStatus(lang) === 'SHIPPING';
}

/** True if the language is on the picker but not yet exportable. */
export function isLanguageComingSoon(lang: string): boolean {
  return getLanguageParityStatus(lang) === 'COMING_SOON';
}

/**
 * Error thrown when the export pipeline is asked to emit a non-shipping language.
 * Catch this at UI boundaries to render a clean "Coming Soon" message instead
 * of a stack trace.
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
        ? `${entry?.label ?? lang} is on the parity roadmap but not yet shipping. Real exports unlock when every layer has a native implementation and the deterministic chain executor passes parity tests.`
        : `${lang} is not a supported export target. Only languages with full layer parity ship from the Ascension pipeline.`;
    super(`[CMPSBL:LanguageNotShipping:${lang}] ${reason}`);
    this.name = 'LanguageNotShippingError';
    this.lang = lang;
    this.status = status;
    this.roadmapNote = entry?.roadmapNote;
  }
}

/**
 * Hard gate for the export pipeline. Call this at the top of any function
 * that turns a language id into actual file content. Throws if the language
 * is not SHIPPING — the only way to ship code is to flip the status flag,
 * which by policy requires native implementations + green parity tests.
 */
export function assertLanguageShipping(lang: string): void {
  if (!isLanguageShipping(lang)) {
    throw new LanguageNotShippingError(lang);
  }
}
