/**
 * CMPSBL® Export Self-Check — Phase 6
 *
 * Runs at the end of every Ascension export to verify that the emitted
 * artifact carries the V1 contract tokens for its language. This is the
 * counterpart to the runtime envelope verifier (Phase 5): the verifier
 * checks decoded envelopes; this self-check inspects the *source* about
 * to be written to the ZIP and refuses to ship if the contract drifts.
 *
 * - Pure string scan — no eval, no parsing — so it's safe to run inside
 *   the export pipeline regardless of language.
 * - Token sets are intentionally minimal: they are the same tokens locked
 *   by canonical-parity-snapshot.test.ts, so this module and that suite
 *   move together.
 * - Returns a structured result; the caller decides whether to throw.
 */
import type { GovernanceMode } from '@/lib/ascension-v2/governance-mode';

export interface ExportSelfCheckIssue {
  readonly token: string;
  readonly message: string;
}

export interface ExportSelfCheckResult {
  readonly ok: boolean;
  readonly lang: string;
  readonly mode: GovernanceMode;
  readonly issues: ReadonlyArray<ExportSelfCheckIssue>;
}

/** Tokens every canonical (TS/JS/Py/PHP) artifact must contain. */
const CANONICAL_REQUIRED = [
  '_cmpsbl',
  'COMPILED_CMPSBL_MODE',
  'CMPSBL_MODE',
  'original_executed',
];

/** Tokens every polyglot bridge artifact must contain (sealed banner + envelope). */
const POLYGLOT_REQUIRED = [
  'Sealed wrapper',
  'Sealed Module (proprietary)',
  'COMPILED_CMPSBL_MODE',
  '_cmpsbl envelope',
  'original_executed',
];

const CANONICAL_LANGS = new Set(['typescript', 'javascript', 'python', 'php']);

/**
 * Verify a freshly-generated artifact against the V1 contract for its
 * language and governance mode. Pure function — never throws.
 */
export function checkExportArtifact(
  lang: string,
  source: string,
  mode: GovernanceMode,
): ExportSelfCheckResult {
  const issues: ExportSelfCheckIssue[] = [];

  if (typeof source !== 'string' || source.length === 0) {
    issues.push({ token: '<source>', message: 'emitted source is empty' });
    return { ok: false, lang, mode, issues };
  }

  const required = CANONICAL_LANGS.has(lang) ? CANONICAL_REQUIRED : POLYGLOT_REQUIRED;
  for (const tok of required) {
    if (!source.includes(tok)) {
      issues.push({ token: tok, message: `required contract token "${tok}" missing from ${lang} artifact` });
    }
  }

  // Mode reflection: the chosen mode literal must appear somewhere in the
  // emitted file. PHP single-quotes; everything else accepts either quote.
  const modeQuoted = lang === 'php' ? `'${mode}'` : `"${mode}"`;
  const modeAlt = lang === 'php' ? `"${mode}"` : `'${mode}'`;
  if (!source.includes(modeQuoted) && !source.includes(modeAlt)) {
    issues.push({
      token: mode,
      message: `governance mode "${mode}" is not reflected in the emitted ${lang} artifact`,
    });
  }

  return { ok: issues.length === 0, lang, mode, issues };
}

/**
 * Throw a structured error when an artifact fails the contract — used as
 * the export-pipeline gate. The error message lists every missing token
 * so drift is diagnosable from the build log alone.
 */
export function assertExportArtifact(
  lang: string,
  source: string,
  mode: GovernanceMode,
): void {
  const result = checkExportArtifact(lang, source, mode);
  if (result.ok) return;
  const summary = result.issues.map(i => `  • ${i.message}`).join('\n');
  throw new Error(
    `[CMPSBL:ExportSelfCheck:${lang}] V1 contract drift detected — refusing to ship artifact.\n${summary}`,
  );
}
