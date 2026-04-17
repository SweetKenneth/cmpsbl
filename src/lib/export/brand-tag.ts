/**
 * CMPSBL® Brand Tag — unified identity stamp for non-HTML export artifacts.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single source of truth for the header/footer markers attached to plain
 * text (.md, .txt, LICENSE) and structured (manifest.json) export files.
 *
 * Tag content level: STANDARD
 *   name + patents + URL + fingerprint + serial + date
 *
 * HTML artifacts already carry their own visual brand shell — they do not
 * use this helper. Source code (.py/.js/.ts/.go/.rs) is intentionally
 * excluded; their headers are owned by the polyglot emitters.
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

export interface BrandTagInput {
  /** Optional artifact identity — fingerprint, serial, generation date. */
  fingerprint?: string;
  serial?: string;
  /** ISO date string (YYYY-MM-DD). Defaults to today. */
  generatedAt?: string;
}

const PATENT_LINE = 'U.S. Patent App. No. 64/029,678 · U.S. Patent App. No. 64/031,637';
const URL_LINE = 'https://cmpsbl.com';
const ISSUER_LINE = 'CMPSBL® · PromptFluid™';

function isoDate(input?: string): string {
  return input ?? new Date().toISOString().slice(0, 10);
}

/**
 * Markdown brand header — placed at the very top of .md files.
 * Uses an HTML comment so it doesn't render visibly in most markdown viewers
 * but is still grep-able and survives copy/paste.
 */
export function brandHeaderMarkdown(input: BrandTagInput = {}): string {
  const lines = [
    '<!--',
    '  ═══════════════════════════════════════════════════════════════',
    '  CMPSBL® · PromptFluid™  —  Ascended Artifact',
    `  ${PATENT_LINE}`,
    `  Issued: ${isoDate(input.generatedAt)}`,
  ];
  if (input.serial) lines.push(`  Serial:      ${input.serial}`);
  if (input.fingerprint) lines.push(`  Fingerprint: ${input.fingerprint}`);
  lines.push(
    `  ${URL_LINE}`,
    '  ═══════════════════════════════════════════════════════════════',
    '-->',
    '',
  );
  return lines.join('\n');
}

/**
 * Plain-text brand header — for LICENSE, *.txt, and other non-markdown files.
 * Uses ASCII box characters so it is visible in any text reader.
 */
export function brandHeaderPlain(input: BrandTagInput = {}): string {
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '  CMPSBL® · PromptFluid™  —  Ascended Artifact',
    `  ${PATENT_LINE}`,
    `  Issued: ${isoDate(input.generatedAt)}`,
  ];
  if (input.serial) lines.push(`  Serial:      ${input.serial}`);
  if (input.fingerprint) lines.push(`  Fingerprint: ${input.fingerprint}`);
  lines.push(
    `  ${URL_LINE}`,
    '═══════════════════════════════════════════════════════════════',
    '',
  );
  return lines.join('\n');
}

/**
 * Footer — works for both .md and .txt (plain text with no markdown markers).
 */
export function brandFooter(input: BrandTagInput = {}): string {
  const lines = [
    '',
    '───────────────────────────────────────────────────────────────',
    `${ISSUER_LINE}  ·  ${URL_LINE}`,
    `${PATENT_LINE}`,
  ];
  if (input.serial || input.fingerprint) {
    const parts: string[] = [];
    if (input.serial) parts.push(`Serial ${input.serial}`);
    if (input.fingerprint) parts.push(`Fingerprint ${input.fingerprint}`);
    lines.push(parts.join(' · '));
  }
  lines.push(`Issued ${isoDate(input.generatedAt)} · © ${new Date().getFullYear()} CMPSBL®. All rights reserved.`);
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('');
  return lines.join('\n');
}

/**
 * Wrap a markdown document with brand header + footer in one call.
 */
export function tagMarkdown(body: string, input: BrandTagInput = {}): string {
  return `${brandHeaderMarkdown(input)}${body.trimEnd()}\n${brandFooter(input)}`;
}

/**
 * Wrap a plain text document with brand header + footer in one call.
 */
export function tagPlainText(body: string, input: BrandTagInput = {}): string {
  return `${brandHeaderPlain(input)}${body.trimEnd()}\n${brandFooter(input)}`;
}

/**
 * Identity block to inject into JSON manifests as the `_cmpsbl` key.
 * Keeps the manifest's existing schema untouched while adding traceable
 * provenance metadata that any tool can read.
 */
export interface CmpsblIdentityBlock {
  issuer: string;
  patents: string[];
  url: string;
  generatedAt: string;
  fingerprint?: string;
  serial?: string;
}

export function buildIdentityBlock(input: BrandTagInput = {}): CmpsblIdentityBlock {
  return {
    issuer: ISSUER_LINE,
    patents: ['64/029,678', '64/031,637'],
    url: URL_LINE,
    generatedAt: isoDate(input.generatedAt),
    ...(input.fingerprint ? { fingerprint: input.fingerprint } : {}),
    ...(input.serial ? { serial: input.serial } : {}),
  };
}
