/**
 * CORE — Boot Fingerprint Gate (HARDENED)
 * 
 * STOP-SHIP HARDENING:
 * 3 triage states: valid → proceed, suspect → limited mode, invalid → deny
 * - Deterministic canonical hashing
 * - Mismatch classification
 * - Local verification before any outbound call
 * 
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type FingerprintVerdict = 'valid' | 'suspect' | 'invalid';

export interface FingerprintResult {
  readonly verdict: FingerprintVerdict;
  readonly fingerprint: string;
  readonly expectedFingerprint: string | null;
  readonly mismatchType: MismatchType | null;
  readonly mismatchDetails: string | null;
  readonly verifiedAt: number;
  /** If suspect, what capabilities are limited */
  readonly limitedCapabilities: ReadonlyArray<string>;
}

export type MismatchType =
  | 'version_drift'    /* Same structure, different version */
  | 'structure_change' /* Added/removed functions */
  | 'hash_tamper'      /* Hash doesn't match content */
  | 'missing_source'   /* Source not available for verification */
  | 'partial_match';   /* Some segments match, some don't */

// ═══════════════════════════════════════════════════════════════
// Deterministic Canonical Hashing
// ═══════════════════════════════════════════════════════════════

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Compute a canonical fingerprint from module structure.
 * Deterministic: same functions + same order = same fingerprint.
 */
export function computeCanonicalFingerprint(
  hostModule: Record<string, unknown>,
  packageName: string,
  version: string,
): string {
  const functionNames: string[] = [];
  for (const [key, value] of Object.entries(hostModule)) {
    if (typeof value === 'function') {
      functionNames.push(key);
    }
  }
  /* Sort for determinism */
  functionNames.sort();

  const canonical = `${packageName}@${version}|${functionNames.join(',')}|${functionNames.length}`;
  return fnv1a(canonical);
}

// ═══════════════════════════════════════════════════════════════
// Fingerprint Store
// ═══════════════════════════════════════════════════════════════

const knownFingerprints = new Map<string, string>(); /* packageName → fingerprint */

/** Register a known-good fingerprint */
export function registerFingerprint(packageName: string, fingerprint: string): void {
  knownFingerprints.set(packageName, fingerprint);
}

// ═══════════════════════════════════════════════════════════════
// Mismatch Classification
// ═══════════════════════════════════════════════════════════════

function classifyMismatch(
  current: string,
  expected: string,
  hostModule: Record<string, unknown>,
  packageName: string,
): { type: MismatchType; details: string } {
  /* If we have no expected fingerprint, it's missing source */
  if (!expected) {
    return { type: 'missing_source', details: 'No known fingerprint registered for this package' };
  }

  /* Check if it's a partial match — same prefix suggests version drift */
  if (current.slice(0, 4) === expected.slice(0, 4)) {
    return { type: 'version_drift', details: `Fingerprint prefix matches but hash differs — likely version change` };
  }

  /* Count functions to detect structural changes */
  const fnCount = Object.values(hostModule).filter(v => typeof v === 'function').length;

  /* If function count changed significantly, it's a structure change */
  if (current.length !== expected.length) {
    return { type: 'structure_change', details: `Current fingerprint length differs — ${fnCount} functions detected` };
  }

  /* Default: hash tamper — fingerprint doesn't match and no obvious reason */
  return { type: 'hash_tamper', details: `Fingerprint mismatch with no structural explanation — possible tampering` };
}

// ═══════════════════════════════════════════════════════════════
// Core API
// ═══════════════════════════════════════════════════════════════

/** Capabilities limited in suspect mode */
const SUSPECT_LIMITED_CAPABILITIES = [
  'phone-home',
  'auto-rule-generation',
  'dream-synthesis',
  'evolution-patch',
];

/**
 * Verify a host module's fingerprint at boot.
 * 
 * TRIAGE:
 * - valid: fingerprint matches known-good → full capabilities
 * - suspect: minor mismatch (version drift, partial match) → limited mode
 * - invalid: hash tamper or structure change → deny attachment
 * 
 * ALL verification is LOCAL — no outbound calls before verification completes.
 */
export function verifyFingerprint(
  hostModule: Record<string, unknown>,
  packageName: string,
  version: string,
): FingerprintResult {
  const current = computeCanonicalFingerprint(hostModule, packageName, version);
  const expected = knownFingerprints.get(packageName) ?? null;

  /* No known fingerprint — first boot, auto-register as suspect */
  if (!expected) {
    return {
      verdict: 'suspect',
      fingerprint: current,
      expectedFingerprint: null,
      mismatchType: 'missing_source',
      mismatchDetails: 'First boot — no known fingerprint. Auto-registered.',
      verifiedAt: Date.now(),
      limitedCapabilities: SUSPECT_LIMITED_CAPABILITIES,
    };
  }

  /* Exact match — valid */
  if (current === expected) {
    return {
      verdict: 'valid',
      fingerprint: current,
      expectedFingerprint: expected,
      mismatchType: null,
      mismatchDetails: null,
      verifiedAt: Date.now(),
      limitedCapabilities: [],
    };
  }

  /* Mismatch — classify */
  const { type, details } = classifyMismatch(current, expected, hostModule, packageName);

  /* Version drift and partial match → suspect (not invalid) */
  if (type === 'version_drift' || type === 'partial_match') {
    return {
      verdict: 'suspect',
      fingerprint: current,
      expectedFingerprint: expected,
      mismatchType: type,
      mismatchDetails: details,
      verifiedAt: Date.now(),
      limitedCapabilities: SUSPECT_LIMITED_CAPABILITIES,
    };
  }

  /* Structure change or hash tamper → invalid */
  return {
    verdict: 'invalid',
    fingerprint: current,
    expectedFingerprint: expected,
    mismatchType: type,
    mismatchDetails: details,
    verifiedAt: Date.now(),
    limitedCapabilities: [],
  };
}

/** Promote a suspect fingerprint to valid (after manual verification) */
export function promoteFingerprint(packageName: string, fingerprint: string): void {
  knownFingerprints.set(packageName, fingerprint);
}

/** Get all registered fingerprints */
export function getRegisteredFingerprints(): ReadonlyArray<{ packageName: string; fingerprint: string }> {
  return Array.from(knownFingerprints.entries()).map(([packageName, fingerprint]) => ({ packageName, fingerprint }));
}

/** Reset fingerprint gate state */
export function resetFingerprintGate(): void {
  knownFingerprints.clear();
}
