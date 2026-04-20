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
// Structural normalizer — strips whitespace/comments for stable hashing.
// Also collapses spaces around punctuation so that cosmetic reformatting
// (e.g., `function f (a){return a;}` vs `function   f(a)   { return a; }`)
// produces an identical fingerprint. Determinism beats parsing fidelity here:
// the fingerprint is a structural identity check, not an AST.
// ═══════════════════════════════════════════════════════════════

const PUNCT_CLASS = `[\\(\\)\\[\\]{};,:.<>+\\-*/%=!?&|^~]`;
const SPACE_AROUND_PUNCT = new RegExp(`\\s*(${PUNCT_CLASS})\\s*`, 'g');

function normalizeSource(source: string): string {
  return source
    .replace(/\/\/[^\n]*/g, '')        // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
    .replace(/#[^\n]*/g, '')           // python/ruby comments
    .replace(/\s+/g, ' ')              // collapse whitespace
    .replace(SPACE_AROUND_PUNCT, '$1') // strip spaces around punctuation
    .trim();
}

/**
 * Count function-like declarations in source (language-agnostic heuristic).
 */
function countFunctions(source: string): number {
  const patterns = [
    // JS/TS function declarations + arrow consts
    /(?:export\s+)?(?:async\s+)?function\s+\w+/g,
    /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(?[^)]*\)?\s*=>/g,
    // Python
    /def\s+\w+\s*\(/g,
    // Rust
    /(?:pub\s+)?(?:async\s+)?fn\s+\w+/g,
    // Go / Swift / Kotlin (`func` / `fun` keyword)
    /\bfunc\s+\w+/g,
    /\bfun\s+\w+/g,
    // Java / C# / TS / JS class methods + constructors:
    //   `public int Add(...)`, `static foo() {`, `Greet(...) =>`, `m() { … }`
    // Heuristic: visibility/modifier(s) + (return type)? + identifier + `(`
    // followed by either `{` or `=>` (C# expression-bodied, TS arrow method).
    // Anchored to start-of-line (with leading indent) to avoid matching calls.
    /^\s*(?:(?:public|private|protected|internal|static|final|override|virtual|abstract|async|suspend|inline)\s+)+[\w<>\[\],\s.?]*?\b\w+\s*\([^)]*\)\s*(?:->\s*[\w<>\[\],\s.?]+\s*)?(?:\{|=>)/gm,
    // Kotlin / Swift / Scala-style `fun name(...)` already covered above.
    // Constructor lines: `constructor(...)` (JS/TS class)
    /\bconstructor\s*\(/g,
    // C / C++: `[static|inline] [const] type [*] name(args) {` at start of line.
    // Type token is permissive — handles `unsigned int`, `struct Foo *`, `void`.
    /^\s*(?:(?:static|inline|extern|const|virtual|explicit)\s+)*(?:[A-Za-z_][\w:]*\s*[\*&]?\s+)+([A-Za-z_]\w*)\s*\([^;{]*\)\s*(?:const\s*)?\{/gm,
    // Shell: `name() { … }`  or  `function name { … }`  or  `function name() { … }`
    /^\s*(?:function\s+)?[A-Za-z_]\w*\s*\(\s*\)\s*\{/gm,
    /^\s*function\s+[A-Za-z_]\w*\s*\{/gm,
    // SQL: CREATE [OR REPLACE] FUNCTION/PROCEDURE name(...)
    /\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|PROCEDURE)\s+[\w."]+\s*\(/gi,
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

// ═══════════════════════════════════════════════════════════════
// End-of-Flow Artifact Fingerprint
// ─────────────────────────────────────────────────────────────────
// The Pre-Ascension Gate fingerprints the *input source*. This second
// fingerprint, computed at the very end of the pipeline (after all layers
// merge and the harness passes), seals the *entire executed chain* into
// a single hash. `/verify/:fingerprint` resolves against this — proving
// not just "the source is unchanged" but "this exact sealed chain produced
// this artifact." If any layer in the manifest changes, if phase order
// changes, or if the kernel version bumps, the artifact fingerprint shifts.
// ═══════════════════════════════════════════════════════════════

export interface ArtifactFingerprint {
  readonly hash: string;
  readonly sourceFingerprint: string;
  readonly manifestHash: string;
  readonly phaseOrderHash: string;
  readonly kernelVersion: string;
  readonly createdAt: number;
}

export interface ArtifactSealInput {
  /** Original source fingerprint (from Pre-Ascension Gate). */
  readonly sourceFingerprint: SourceFingerprint;
  /** Ordered list of layer ids in their final emitted phase order. */
  readonly orderedLayerIds: ReadonlyArray<string>;
  /** Phase number for each layer id, in the same order. */
  readonly orderedPhases: ReadonlyArray<number>;
  /** Kernel version string emitted into the artifact (e.g. "v2.1.0"). */
  readonly kernelVersion: string;
}

/**
 * Seal the full executed chain into a single end-of-flow fingerprint.
 *
 * Hashes: source ⊕ canonical_layer_manifest ⊕ phase_order ⊕ kernel_version.
 * Same input + same selected layers + same kernel = same artifact hash.
 * Any drift surfaces as a different hash and `/verify` will refuse it.
 */
export function computeArtifactFingerprint(input: ArtifactSealInput): ArtifactFingerprint {
  const manifestPayload = input.orderedLayerIds.join('|');
  const manifestHash = fnv1a(manifestPayload);

  const phasePayload = input.orderedPhases.join(',');
  const phaseOrderHash = fnv1a(phasePayload);

  const sealPayload = [
    input.sourceFingerprint.hash,
    manifestHash,
    phaseOrderHash,
    input.kernelVersion,
  ].join(':');
  const hash = fnv1a(sealPayload);

  return Object.freeze({
    hash,
    sourceFingerprint: input.sourceFingerprint.hash,
    manifestHash,
    phaseOrderHash,
    kernelVersion: input.kernelVersion,
    createdAt: Date.now(),
  });
}

/**
 * Verify an artifact fingerprint against a recomputed seal. Use this in
 * `/verify/:fingerprint` to prove the published artifact corresponds to
 * an unmodified source + manifest + phase-order + kernel combination.
 */
export function verifyArtifactFingerprint(
  input: ArtifactSealInput,
  expected: ArtifactFingerprint,
): { matches: boolean; expected: string; actual: string } {
  const actual = computeArtifactFingerprint(input);
  return {
    matches: actual.hash === expected.hash,
    expected: expected.hash,
    actual: actual.hash,
  };
}
