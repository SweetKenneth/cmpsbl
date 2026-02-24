/**
 * CMPSBL® Distribution Identity
 * 
 * Canonical identity constants for the CMPSBL distribution.
 * Downstream distributions (e.g. LNCHBL) consume patches from here.
 * 
 * @module distribution
 */

// ─── Identity ───────────────────────────────────────────────────────────────

export const DISTRIBUTION_ID = 'CMPSBL' as const;

// ─── Downstream Distributions ───────────────────────────────────────────────

export type DownstreamDistribution = 'LNCHBL';

const DOWNSTREAM_DISTRIBUTIONS: readonly string[] = ['LNCHBL'];

export function isDownstreamDistribution(value: string): value is DownstreamDistribution {
  return DOWNSTREAM_DISTRIBUTIONS.includes(value);
}

// ─── Security Invariants ────────────────────────────────────────────────────

/**
 * Fields that patches are NEVER allowed to contain.
 * These protect distribution identity and governance from being
 * overwritten by outbound patches.
 */
export const PROHIBITED_PATCH_FIELDS: readonly string[] = [
  'distribution_id',
  'identity',
  'canon_authority',
  'federation_enabled',
  'self_evolution',
  'self_improvement',
];
