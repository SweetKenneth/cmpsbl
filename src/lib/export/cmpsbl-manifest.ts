/**
 * CMPSBL® Software Manifest Generator
 * 
 * Generates a standardized manifest.json for every ZIP export
 * across the substrate — Foundry, Vault, Forge, Universal Adapter, and Templates.
 *
 * Terminology: Uses "primitives" (never "modules") per CMPSBL® governance.
 */

import { buildIdentityBlock, type CmpsblIdentityBlock } from './brand-tag';

export interface CmpsblManifestLicenseLayer {
  spdx: string;
  label?: string;
  /** Path to the license file inside the ZIP, or null when nothing ships. */
  file: string | null;
}

export interface CmpsblManifestLicense {
  /** Layer 2 (the wrapper) — always CAAL-1.0 for ascended artifacts. */
  layer2: CmpsblManifestLicenseLayer;
  /** Layer 1 (your original source) — SPDX or NOASSERTION when undeclared. */
  layer1: CmpsblManifestLicenseLayer;
}

export interface CmpsblManifestInput {
  name: string;
  cjpi?: number;
  /** @deprecated Use `primitives` instead */
  modules?: string[];
  primitives?: string[];
  targets?: string[];
  version?: string;
  category?: string;
  fingerprint?: string;
  source?: string;
  serial?: string;
  /** Dual-layer SPDX summary — surfaced for SBOM/scanner tooling. */
  license?: CmpsblManifestLicense;
}

export interface CmpsblManifest {
  name: string;
  tier: string;
  cjpi: number;
  primitives: string[];
  exported: string;
  runtime: string;
  targets: string[];
  version: string;
  category?: string;
  fingerprint?: string;
  source?: string;
  serial?: string;
  license?: CmpsblManifestLicense;
  /** Unified CMPSBL® identity block — issuer, patents, URL, traceability. */
  _cmpsbl: CmpsblIdentityBlock;
}

function tierFromScore(score: number): string {
  if (score >= 93) return 'Apex';
  if (score >= 85) return 'Mythic';
  if (score >= 75) return 'Enterprise';
  if (score >= 65) return 'Mint';
  if (score >= 55) return 'Architect';
  if (score >= 35) return 'Creator';
  return 'Raw';
}

/**
 * Generate a standardised CMPSBL manifest object for inclusion in any ZIP export.
 */
export function generateCmpsblManifest(input: CmpsblManifestInput): CmpsblManifest {
  const cjpi = input.cjpi ?? 0;
  const exported = new Date().toISOString().slice(0, 10);
  return {
    name: input.name,
    tier: tierFromScore(cjpi),
    cjpi,
    primitives: input.primitives ?? input.modules ?? ['SYSTEM'],
    exported,
    runtime: 'cmpsbl-convex-core-processing-layer',
    targets: input.targets ?? ['typescript'],
    version: input.version ?? '1.0.0',
    ...(input.category ? { category: input.category } : {}),
    ...(input.fingerprint ? { fingerprint: input.fingerprint } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.serial ? { serial: input.serial } : {}),
    ...(input.license ? { license: input.license } : {}),
    _cmpsbl: buildIdentityBlock({
      generatedAt: exported,
      fingerprint: input.fingerprint,
      serial: input.serial,
    }),
  };
}

/**
 * Serialise a CMPSBL manifest to pretty-printed JSON ready for ZIP insertion.
 */
export function serializeCmpsblManifest(input: CmpsblManifestInput): string {
  return JSON.stringify(generateCmpsblManifest(input), null, 2);
}
