/**
 * Fingerprint Gate — Structural identity verification
 * U.S. Patent App. No. 64/029,678
 *
 * Computes a deterministic FNV-1a fingerprint from source code structure.
 * Used to verify that the same code input always produces the same
 * Ascension output — the determinism guarantee.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface SourceFingerprint {
  readonly hash: string;
  readonly functionCount: number;
  readonly totalChars: number;
  readonly language: string;
  readonly createdAt: number;
}

export interface FingerprintVerification {
  readonly matches: boolean;
  readonly expected: string;
  readonly actual: string;
  readonly drift: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FNV-1a (32-bit)
// ═══════════════════════════════════════════════════════════════

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ═══════════════════════════════════════════════════════════════
// Structural normalizer — strips whitespace/comments for stable hashing
// ═══════════════════════════════════════════════════════════════

function normalizeSource(source: string): string {
  return source
    .replace(/\/\/[^\n]*/g, '')        // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
    .replace(/#[^\n]*/g, '')           // python/ruby comments
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim();
}

/**
 * Count function-like declarations in source (language-agnostic heuristic).
 */
function countFunctions(source: string): number {
  const patterns = [
    /(?:export\s+)?(?:async\s+)?function\s+\w+/g,
    /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/g,
    /def\s+\w+\s*\(/g,
    /(?:pub\s+)?(?:async\s+)?fn\s+\w+/g,
    /func\s+\w+/g,
  ];
  let count = 0;
  for (const p of patterns) {
    const matches = source.match(p);
    if (matches) count += matches.length;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════
// Gate API
// ═══════════════════════════════════════════════════════════════

/**
 * Compute a structural fingerprint for source code.
 */
export function computeFingerprint(source: string, language: string): SourceFingerprint {
  const normalized = normalizeSource(source);
  const hash = fnv1a(normalized);
  const functionCount = countFunctions(source);

  return Object.freeze({
    hash,
    functionCount,
    totalChars: source.length,
    language,
    createdAt: Date.now(),
  });
}

/**
 * Compute fingerprint for multiple files (combined).
 */
export function computeMultiFileFingerprint(
  files: ReadonlyArray<{ content: string; name: string }>,
  language: string
): SourceFingerprint {
  // Sort by name for determinism
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
  const combined = sorted.map(f => `// FILE: ${f.name}\n${f.content}`).join('\n');
  return computeFingerprint(combined, language);
}

/**
 * Verify a fingerprint matches a source — returns drift info.
 */
export function verifyFingerprint(
  source: string,
  language: string,
  expected: SourceFingerprint
): FingerprintVerification {
  const actual = computeFingerprint(source, language);
  return Object.freeze({
    matches: actual.hash === expected.hash,
    expected: expected.hash,
    actual: actual.hash,
    drift: actual.functionCount !== expected.functionCount,
  });
}
