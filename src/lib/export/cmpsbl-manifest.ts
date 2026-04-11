/**
 * CMPSBL® Software Manifest Generator
 * 
 * Generates a standardized manifest.json for every ZIP export
 * across the substrate — Foundry, Vault, Forge, Universal Adapter, and Templates.
 *
 * Terminology: Uses "primitives" (never "modules") per CMPSBL® governance.
 */

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
  return {
    name: input.name,
    tier: tierFromScore(cjpi),
    cjpi,
    primitives: input.primitives ?? input.modules ?? ['SYSTEM'],
    exported: new Date().toISOString().slice(0, 10),
    runtime: 'cmpsbl-convex-core-processing-layer',
    targets: input.targets ?? ['typescript'],
    version: input.version ?? '1.0.0',
    ...(input.category ? { category: input.category } : {}),
    ...(input.fingerprint ? { fingerprint: input.fingerprint } : {}),
    ...(input.source ? { source: input.source } : {}),
    ...(input.serial ? { serial: input.serial } : {}),
  };
}

/**
 * Serialise a CMPSBL manifest to pretty-printed JSON ready for ZIP insertion.
 */
export function serializeCmpsblManifest(input: CmpsblManifestInput): string {
  return JSON.stringify(generateCmpsblManifest(input), null, 2);
}
