/**
 * CMPSBL® Patch Authoring Core
 * 
 * Defines the patch data model and validation logic for authoring
 * patches destined for downstream (non-canonical) distributions.
 * 
 * SECURITY INVARIANTS:
 * - targetDistribution must equal 'LNCHBL'
 * - No patch may contain canon authority fields
 * - No patch may modify federation flags
 * - No patch may alter distribution identity
 * 
 * @module patches/author
 * @version 8.0.0
 */

import { 
  DISTRIBUTION_ID, 
  PROHIBITED_PATCH_FIELDS, 
  isDownstreamDistribution,
  type DownstreamDistribution 
} from '@/lib/distribution';

// ─── Patch Types ─────────────────────────────────────────────────────────────

export type PatchTier = 'free' | 'builder' | 'pro';
export type PatchStatus = 'draft' | 'published' | 'revoked';

export interface PatchFile {
  path: string;
  action: 'create' | 'update' | 'delete';
  contentHash?: string;
}

export interface Patch {
  id: string;
  version: string;
  targetDistribution: DownstreamDistribution;
  requiredTier: PatchTier;
  enginesUnlocked: string[];
  capabilitiesUnlocked: string[];
  files: PatchFile[];
  changelog: string;
  signature: string;
  createdAt: string;
  status: PatchStatus;
}

export interface PatchManifest {
  distributionId: typeof DISTRIBUTION_ID;
  generatedAt: string;
  latestVersion: string;
  patches: PatchManifestEntry[];
  critical: boolean;
  signature: string;
}

export interface PatchManifestEntry {
  id: string;
  version: string;
  requiredTier: PatchTier;
  enginesUnlocked: string[];
  capabilitiesUnlocked: string[];
  changelog: string;
  status: PatchStatus;
  publishedAt: string | null;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export interface PatchValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a patch payload before authoring.
 * Enforces all security invariants.
 */
export function validatePatch(patch: Partial<Patch>): PatchValidationResult {
  const errors: string[] = [];

  // Target distribution must be a known downstream
  if (!patch.targetDistribution) {
    errors.push('targetDistribution is required');
  } else if (!isDownstreamDistribution(patch.targetDistribution)) {
    errors.push(`targetDistribution must be a downstream distribution, got: ${patch.targetDistribution}`);
  }

  // Version is required
  if (!patch.version || patch.version.trim().length === 0) {
    errors.push('version is required');
  }

  // Required tier must be valid
  const validTiers: PatchTier[] = ['free', 'builder', 'pro'];
  if (patch.requiredTier && !validTiers.includes(patch.requiredTier)) {
    errors.push(`requiredTier must be one of: ${validTiers.join(', ')}`);
  }

  // Changelog is required
  if (!patch.changelog || patch.changelog.trim().length === 0) {
    errors.push('changelog is required');
  }

  // Scan for prohibited fields in the patch object
  const patchKeys = Object.keys(patch);
  for (const field of PROHIBITED_PATCH_FIELDS) {
    if (patchKeys.includes(field)) {
      errors.push(`Prohibited field detected: "${field}" — patches may not modify distribution identity or governance`);
    }
  }

  // Scan files for prohibited path patterns
  if (patch.files) {
    for (const file of patch.files) {
      if (file.path.includes('distribution.ts') || file.path.includes('canon')) {
        errors.push(`Prohibited file path: "${file.path}" — patches may not modify canon identity files`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ─── Manifest Generation ─────────────────────────────────────────────────────

/**
 * Generates a patch manifest for downstream consumption.
 * Contains metadata only — no file contents.
 */
export function generateManifest(
  patches: PatchManifestEntry[],
  critical: boolean = false
): Omit<PatchManifest, 'signature'> {
  const published = patches
    .filter(p => p.status === 'published')
    .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));

  return {
    distributionId: DISTRIBUTION_ID,
    generatedAt: new Date().toISOString(),
    latestVersion: published[0]?.version ?? '0.0.0',
    patches: published,
    critical,
  };
}

// ─── Signature Utilities ─────────────────────────────────────────────────────

/**
 * Generate a SHA-256 signature for a patch manifest.
 * Used for integrity verification on the downstream side.
 */
export async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a complete signed manifest from patch entries.
 */
export async function createSignedManifest(
  patches: PatchManifestEntry[],
  critical: boolean = false
): Promise<PatchManifest> {
  const manifest = generateManifest(patches, critical);
  const signature = await signPayload(JSON.stringify(manifest));
  return { ...manifest, signature };
}
