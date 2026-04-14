/**
 * CORE — Boot Fingerprint Gate (V1 PATCH CORRECTIONS)
 * 
 * Corrections applied:
 * #1: Identity enforcement — blocks placeholder identity (unknown/0.0.0)
 * #2: Trust staging — candidate_baseline vs trusted_baseline
 * #3: Domain-typed restriction map (wrapper/governance/outbound/mutation/promotion)
 * #9: Dual fingerprint tiers — structural (fast) + integrity (strong)
 * 
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type FingerprintVerdict = 'valid' | 'suspect' | 'invalid';

/** #2: Trust baseline state — staged, not auto-promoted */
export type TrustState = 'uninitialized' | 'candidate_baseline' | 'trusted_baseline';

/** #3: Enforcement domain — restriction policy is typed, not a flat string list */
export type RestrictionDomain = 'wrapper' | 'governance' | 'outbound' | 'mutation' | 'promotion';

/** #3: Typed restriction entry */
export interface RestrictionEntry {
  readonly domain: RestrictionDomain;
  readonly capability: string;
  readonly reason: string;
}

/** #9: Fingerprint tier — structural (fast heuristic) vs integrity (strong digest) */
export type FingerprintTier = 'structural' | 'integrity';

export interface FingerprintResult {
  readonly verdict: FingerprintVerdict;
  readonly fingerprint: string;
  readonly integrityFingerprint: string | null;
  readonly expectedFingerprint: string | null;
  readonly trustState: TrustState;
  readonly mismatchType: MismatchType | null;
  readonly mismatchDetails: string | null;
  readonly verifiedAt: number;
  /** #3: Domain-typed restrictions, not flat string list */
  readonly restrictions: ReadonlyArray<RestrictionEntry>;
  /** Backward compat — derived from restrictions */
  readonly limitedCapabilities: ReadonlyArray<string>;
}

/** #1: Identity completeness result */
export interface IdentityCheckResult {
  readonly complete: boolean;
  readonly packageName: string;
  readonly version: string;
  readonly reason: string | null;
}

export type MismatchType =
  | 'version_drift'
  | 'structure_change'
  | 'hash_tamper'
  | 'missing_source'
  | 'partial_match'
  | 'identity_incomplete';

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
 * Structural fingerprint — fast, deterministic, function-name-based.
 * Good for structural change detection. NOT a tamper-proof anchor.
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
  functionNames.sort();
  const canonical = `${packageName}@${version}|${functionNames.join(',')}|${functionNames.length}`;
  return fnv1a(canonical);
}

/**
 * #9: Integrity fingerprint — stronger, source-digest-based.
 * Incorporates normalized function source for tamper detection.
 */
export function computeIntegrityFingerprint(
  hostModule: Record<string, unknown>,
  packageName: string,
  version: string,
): string {
  const entries: string[] = [];
  for (const [key, value] of Object.entries(hostModule)) {
    if (typeof value === 'function') {
      // Normalize: strip whitespace variance from toString
      const src = (value as Function).toString().replace(/\s+/g, ' ').trim();
      entries.push(`${key}:${fnv1a(src)}`);
    }
  }
  entries.sort();
  const canonical = `integrity:${packageName}@${version}|${entries.join(';')}`;
  return fnv1a(canonical);
}

// ═══════════════════════════════════════════════════════════════
// Fingerprint Store — with trust staging (#2)
// ═══════════════════════════════════════════════════════════════

interface FingerprintRecord {
  fingerprint: string;
  integrityFingerprint: string | null;
  trustState: TrustState;
  registeredAt: number;
}

const knownFingerprints = new Map<string, FingerprintRecord>();

/** Register a candidate baseline — NOT trusted until promoted */
export function registerCandidateBaseline(
  packageName: string,
  fingerprint: string,
  integrityFingerprint: string | null = null,
): void {
  // #2: Never overwrite a trusted baseline with a candidate
  const existing = knownFingerprints.get(packageName);
  if (existing?.trustState === 'trusted_baseline') return;

  knownFingerprints.set(packageName, {
    fingerprint,
    integrityFingerprint,
    trustState: 'candidate_baseline',
    registeredAt: Date.now(),
  });
}

/**
 * #2: Promote candidate to trusted — requires explicit action.
 * Raw attach success alone does NOT promote trust.
 */
export function promoteToTrusted(packageName: string): boolean {
  const record = knownFingerprints.get(packageName);
  if (!record || record.trustState !== 'candidate_baseline') return false;
  record.trustState = 'trusted_baseline';
  knownFingerprints.set(packageName, record);
  return true;
}

/** Legacy compat: register a known-good fingerprint directly as trusted */
export function registerFingerprint(packageName: string, fingerprint: string): void {
  knownFingerprints.set(packageName, {
    fingerprint,
    integrityFingerprint: null,
    trustState: 'trusted_baseline',
    registeredAt: Date.now(),
  });
}

/** Get trust state for a package */
export function getTrustState(packageName: string): TrustState {
  return knownFingerprints.get(packageName)?.trustState ?? 'uninitialized';
}

// ═══════════════════════════════════════════════════════════════
// #1: Identity Enforcement
// ═══════════════════════════════════════════════════════════════

const PLACEHOLDER_NAMES = new Set(['unknown', '', 'unnamed', 'package']);
const PLACEHOLDER_VERSIONS = new Set(['0.0.0', '', '0', 'unknown']);

/** #1: Validate package identity is explicit and stable */
export function checkIdentity(packageName: string, version: string): IdentityCheckResult {
  if (!packageName || PLACEHOLDER_NAMES.has(packageName.toLowerCase())) {
    return { complete: false, packageName, version, reason: `Package name '${packageName}' is a placeholder — scan() or configure() must establish identity first` };
  }
  if (!version || PLACEHOLDER_VERSIONS.has(version)) {
    return { complete: false, packageName, version, reason: `Version '${version}' is a placeholder — explicit version required` };
  }
  return { complete: true, packageName, version, reason: null };
}

// ═══════════════════════════════════════════════════════════════
// #3: Domain-Typed Restriction Map
// ═══════════════════════════════════════════════════════════════

/** 
 * Canonical restriction map — typed by enforcement domain.
 * No flat string lists. Each restriction is domain-qualified.
 */
const SUSPECT_RESTRICTIONS: ReadonlyArray<RestrictionEntry> = Object.freeze([
  // Wrapper domain — capabilities blocked at wrapper level
  { domain: 'wrapper', capability: 'dream_synthesis', reason: 'Untrusted package — synthesis blocked' },
  { domain: 'wrapper', capability: 'evolution_patch', reason: 'Untrusted package — patching blocked' },
  { domain: 'wrapper', capability: 'evolution_rollback', reason: 'Untrusted package — rollback blocked' },
  // Governance domain — governance side effects blocked
  { domain: 'governance', capability: 'auto_rule_generation', reason: 'Untrusted package — auto-rule generation blocked' },
  { domain: 'governance', capability: 'conscience_ethics_gate', reason: 'Untrusted package — ethics gate requires trust' },
  // Outbound domain — no external communication
  { domain: 'outbound', capability: 'phone_home', reason: 'Untrusted package — outbound blocked' },
  { domain: 'outbound', capability: 'relay_sync', reason: 'Untrusted package — relay sync blocked' },
  { domain: 'outbound', capability: 'integration_webhook', reason: 'Untrusted package — webhook blocked' },
  // Mutation domain — state mutation restricted
  { domain: 'mutation', capability: 'immunity_self_heal', reason: 'Untrusted package — self-heal blocked' },
  { domain: 'mutation', capability: 'immunity_vaccination', reason: 'Untrusted package — vaccination blocked' },
  // Promotion domain — no trust escalation
  { domain: 'promotion', capability: 'forge_package_seal', reason: 'Untrusted package — sealing blocked' },
]);

/** Derive flat capability list from typed restrictions (backward compat) */
function restrictionsToCapabilities(restrictions: ReadonlyArray<RestrictionEntry>): string[] {
  return restrictions.map(r => r.capability);
}

// ═══════════════════════════════════════════════════════════════
// Mismatch Classification
// ═══════════════════════════════════════════════════════════════

function classifyMismatch(
  current: string,
  expected: string,
  hostModule: Record<string, unknown>,
): { type: MismatchType; details: string } {
  if (!expected) {
    return { type: 'missing_source', details: 'No known fingerprint registered for this package' };
  }
  if (current.slice(0, 4) === expected.slice(0, 4)) {
    return { type: 'version_drift', details: 'Fingerprint prefix matches but hash differs — likely version change' };
  }
  const fnCount = Object.values(hostModule).filter(v => typeof v === 'function').length;
  if (current.length !== expected.length) {
    return { type: 'structure_change', details: `Current fingerprint length differs — ${fnCount} functions detected` };
  }
  return { type: 'hash_tamper', details: 'Fingerprint mismatch with no structural explanation — possible tampering' };
}

// ═══════════════════════════════════════════════════════════════
// Core API
// ═══════════════════════════════════════════════════════════════

/**
 * Verify a host module's fingerprint at boot.
 * 
 * #1: Rejects placeholder identity — returns identity_incomplete, not silent downgrade.
 * #2: First boot creates candidate_baseline only — never auto-promotes.
 * #3: Restrictions are domain-typed.
 * #9: Both structural and integrity fingerprints computed.
 */
export function verifyFingerprint(
  hostModule: Record<string, unknown>,
  packageName: string,
  version: string,
): FingerprintResult {
  // #1: Identity enforcement — reject placeholders
  const identity = checkIdentity(packageName, version);
  if (!identity.complete) {
    return {
      verdict: 'invalid',
      fingerprint: '',
      integrityFingerprint: null,
      expectedFingerprint: null,
      trustState: 'uninitialized',
      mismatchType: 'identity_incomplete',
      mismatchDetails: identity.reason,
      verifiedAt: Date.now(),
      restrictions: [],
      limitedCapabilities: [],
    };
  }

  const structural = computeCanonicalFingerprint(hostModule, packageName, version);
  const integrity = computeIntegrityFingerprint(hostModule, packageName, version);
  const record = knownFingerprints.get(packageName);

  // No known fingerprint — first boot
  if (!record) {
    // #2: Create candidate_baseline, NOT trusted
    registerCandidateBaseline(packageName, structural, integrity);

    return {
      verdict: 'suspect',
      fingerprint: structural,
      integrityFingerprint: integrity,
      expectedFingerprint: null,
      trustState: 'candidate_baseline',
      mismatchType: 'missing_source',
      mismatchDetails: 'First boot — candidate baseline registered. Explicit promotion required for full trust.',
      verifiedAt: Date.now(),
      restrictions: SUSPECT_RESTRICTIONS,
      limitedCapabilities: restrictionsToCapabilities(SUSPECT_RESTRICTIONS),
    };
  }

  // Candidate baseline — still in staging, treat as suspect
  if (record.trustState === 'candidate_baseline') {
    const matches = structural === record.fingerprint;
    return {
      verdict: 'suspect',
      fingerprint: structural,
      integrityFingerprint: integrity,
      expectedFingerprint: record.fingerprint,
      trustState: 'candidate_baseline',
      mismatchType: matches ? null : 'version_drift',
      mismatchDetails: matches
        ? 'Candidate baseline matches — awaiting promotion to trusted.'
        : 'Candidate baseline differs from current — re-registration may be needed.',
      verifiedAt: Date.now(),
      restrictions: SUSPECT_RESTRICTIONS,
      limitedCapabilities: restrictionsToCapabilities(SUSPECT_RESTRICTIONS),
    };
  }

  // Trusted baseline — exact match = valid
  if (structural === record.fingerprint) {
    return {
      verdict: 'valid',
      fingerprint: structural,
      integrityFingerprint: integrity,
      expectedFingerprint: record.fingerprint,
      trustState: 'trusted_baseline',
      mismatchType: null,
      mismatchDetails: null,
      verifiedAt: Date.now(),
      restrictions: [],
      limitedCapabilities: [],
    };
  }

  // Trusted baseline but mismatch — classify
  const { type, details } = classifyMismatch(structural, record.fingerprint, hostModule);

  if (type === 'version_drift' || type === 'partial_match') {
    return {
      verdict: 'suspect',
      fingerprint: structural,
      integrityFingerprint: integrity,
      expectedFingerprint: record.fingerprint,
      trustState: 'trusted_baseline',
      mismatchType: type,
      mismatchDetails: details,
      verifiedAt: Date.now(),
      restrictions: SUSPECT_RESTRICTIONS,
      limitedCapabilities: restrictionsToCapabilities(SUSPECT_RESTRICTIONS),
    };
  }

  // Structure change or hash tamper → invalid
  return {
    verdict: 'invalid',
    fingerprint: structural,
    integrityFingerprint: integrity,
    expectedFingerprint: record.fingerprint,
    trustState: 'trusted_baseline',
    mismatchType: type,
    mismatchDetails: details,
    verifiedAt: Date.now(),
    restrictions: [],
    limitedCapabilities: [],
  };
}

/** Get all registered fingerprints */
export function getRegisteredFingerprints(): ReadonlyArray<{
  packageName: string;
  fingerprint: string;
  trustState: TrustState;
}> {
  return Array.from(knownFingerprints.entries()).map(([packageName, record]) => ({
    packageName,
    fingerprint: record.fingerprint,
    trustState: record.trustState,
  }));
}

/** Reset fingerprint gate state */
export function resetFingerprintGate(): void {
  knownFingerprints.clear();
}
