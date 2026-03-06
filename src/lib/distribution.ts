/**
 * CMPSBL® Canon Identity Lock
 * 
 * This file defines the immutable distribution identity for the CMPSBL Substrate.
 * These values are compile-time constants enforced by TypeScript literal types.
 * 
 * SECURITY: No runtime toggles, environment flags, or configuration mutations
 * may alter these values. They are burned into the binary at build time.
 * 
 * @module distribution
 * @version 9.1.0
 */

// ─── Immutable Canon Identity ────────────────────────────────────────────────

/** The canonical distribution identifier. Immutable. */
export const DISTRIBUTION_ID = 'CMPSBL' as const;

/** Whether this distribution holds canon authority. Always true for CMPSBL. */
export const CANON_AUTHORITY = true as const;

/** Whether federation (cross-distribution synergy) is enabled. */
export const FEDERATION_ENABLED = true as const;

/** Whether this is the canonical source of truth. Always true for CMPSBL. */
export const IS_CANONICAL = true as const;

/** Whether this distribution can author and publish patches. */
export const PATCH_AUTHORING_ENABLED = true as const;

// ─── Type-Level Enforcement ──────────────────────────────────────────────────

/** Literal type for the CMPSBL distribution ID */
export type DistributionId = typeof DISTRIBUTION_ID; // 'CMPSBL'

/** Literal type for canon authority */
export type CanonAuthority = typeof CANON_AUTHORITY; // true

/** Literal type for canonical status */
export type IsCanonical = typeof IS_CANONICAL; // true

/** Known non-canonical distributions that may receive patches */
export type DownstreamDistribution = 'LNCHBL';

/** All known distribution identifiers */
export type KnownDistribution = DistributionId | DownstreamDistribution;

/**
 * Suspended distributions — all outbound operations (patches, brain sync, downloads) are blocked.
 * LNCHBL suspended pending licensing agreement. Remove from this set to re-enable.
 */
export const SUSPENDED_DISTRIBUTIONS: ReadonlySet<string> = new Set(['LNCHBL']);

/** Check if a distribution is currently suspended */
export function isDistributionSuspended(id: string): boolean {
  return SUSPENDED_DISTRIBUTIONS.has(id);
}

// ─── Identity Accessor (read-only, no mutation possible) ─────────────────────

export interface CanonIdentity {
  readonly distributionId: DistributionId;
  readonly canonAuthority: CanonAuthority;
  readonly federationEnabled: typeof FEDERATION_ENABLED;
  readonly isCanonical: IsCanonical;
  readonly patchAuthoringEnabled: typeof PATCH_AUTHORING_ENABLED;
}

/**
 * Returns the immutable canon identity for this distribution.
 * TypeScript enforces that the return type contains only literal `true` / `'CMPSBL'` values.
 * No runtime override is possible.
 */
export function getCanonIdentity(): Readonly<CanonIdentity> {
  return Object.freeze({
    distributionId: DISTRIBUTION_ID,
    canonAuthority: CANON_AUTHORITY,
    federationEnabled: FEDERATION_ENABLED,
    isCanonical: IS_CANONICAL,
    patchAuthoringEnabled: PATCH_AUTHORING_ENABLED,
  });
}

// ─── Downstream Validation ───────────────────────────────────────────────────

/**
 * Validates that a distribution ID is a known downstream (non-canonical) target.
 * Only downstream distributions may receive patches.
 */
export function isDownstreamDistribution(id: string): id is DownstreamDistribution {
  return id === 'LNCHBL' && !isDistributionSuspended(id);
}

/**
 * Validates that a distribution ID is the canonical source.
 */
export function isCanonicalDistribution(id: string): id is DistributionId {
  return id === DISTRIBUTION_ID;
}

// ─── Prohibited Fields ───────────────────────────────────────────────────────

/**
 * Fields that MUST NOT appear in any patch payload destined for downstream distributions.
 * If a patch attempts to modify these, it must be rejected.
 */
export const PROHIBITED_PATCH_FIELDS = Object.freeze([
  'distribution_id',
  'canon_authority',
  'is_canonical',
  'federation_enabled',
  'patch_authoring_enabled',
  'governance_mode',
  'identity',
] as const);

export type ProhibitedPatchField = typeof PROHIBITED_PATCH_FIELDS[number];
