/**
 * Pipeline Fingerprint Generator
 * Produces deterministic SHA-256 fingerprints for crystallized pipelines.
 * Uses canonical JSON serialization for reproducibility.
 */

import { canonicalizeJson, sha256 } from '@/lib/control-plane/hash';

export interface PipelineFingerprintInput {
  name: string;
  moduleChain: string[];
  cjpi: number;
  category: string;
}

const FINGERPRINT_EPOCH = 'SPARTA';

/**
 * Generate a deterministic SHA-256 fingerprint for a pipeline.
 * Identical inputs will always produce the same fingerprint.
 */
export async function generatePipelineFingerprint(input: PipelineFingerprintInput): Promise<string> {
  const payload = {
    name: input.name,
    moduleChain: [...input.moduleChain].sort(),
    cjpi: input.cjpi,
    category: input.category,
    epoch: FINGERPRINT_EPOCH,
  };
  const canonical = canonicalizeJson(payload);
  return sha256(canonical);
}

/**
 * Sync version for edge functions (Deno crypto.subtle).
 * Accepts pre-serialized canonical string.
 */
export function buildFingerprintPayload(input: PipelineFingerprintInput): string {
  const payload = {
    name: input.name,
    moduleChain: [...input.moduleChain].sort(),
    cjpi: input.cjpi,
    category: input.category,
    epoch: FINGERPRINT_EPOCH,
  };
  return canonicalizeJson(payload);
}

/** Truncate fingerprint for display: first 12 hex chars + ellipsis */
export function truncateFingerprint(fp: string): string {
  if (!fp || fp.length <= 12) return fp || '';
  return fp.slice(0, 12).toUpperCase() + '…';
}
